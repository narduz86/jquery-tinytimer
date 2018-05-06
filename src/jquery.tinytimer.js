// heading semi colon to clear previous scripts
;( function( $ ) {

	// plugin name
	var pluginName = "jquery-tinytimer";

    $.fn.timer = function( options ) {

		// execute on first element only
		if ( this.length > 1 )
			return this.first().timer();

		// plugin already constructed, return this element
		if ( this.data( pluginName ) ) {
			return this.data( pluginName );

		// return this element and continue execution
		} else {
			this.data( pluginName, this );
		}

		/**********************************************
		 *             PRIVATE VARIABLES
		 **********************************************/

		// import user options
		var _op = $.extend( true, {}, $.fn.timer.defaults, options );

		// store counter value at last tick
		_op._lastTickCounter = _op._lastTickCounter || 0;

		// Hold interval id of the timer
		var _timerId = 0;

		// save this
		var _self = this;

		// preserve div content
		var _existingContent = this.html();

		/**********************************************
		 *             GETTERS\SETTERS
		 **********************************************/

		// timer counter
		Object.defineProperty( this, "counter", {
			set: function( time ) {

				// this is required because of the way we calculate "counter" value
				var current = this.counter;
				var delta = time - current;
				_op.timerCounter += delta;

				// update html
				_op.updateHtml.call( _self );
			},
			get: function() {
				var ret = 0;
				if ( _op._enabled ) {
					ret = _op.timerCounter + Date.now() -
						_op.history[ _op.history.length - 1 ].start;
				} else ret = _op.timerCounter;

				return ret;
			}
		} );

		// getter for enabled: true\false. Read-only.
		Object.defineProperty( this, "enabled", {
			get: function() { return _op._enabled; }
		} );

		// getter for history
		Object.defineProperty( this, "history", {
			get: function() { return _op.history; }
		} );

		// getter\setter for target
		Object.defineProperty( this, "target", {
			set: function( t ) {
				_op.timerTarget = t;
			},
			get: function() { return _op.timerTarget; }
		} );

		// getter for settings
		Object.defineProperty( this, "settings", {
			get: function() { return options; }
		} );

		/**********************************************
		 *           	PUBLIC FUNCTIONS
		 **********************************************/

		this.start = function() {
			if ( _op._enabled )
				return;

			_op._enabled = true;
			_startHistoryInterval( Date.now() );

			_setInterval();
		};

		this.stop = function() {

			if ( !_op._enabled )
				return;

			// here timer is still enabled.
			// due to getter method, this value already incorporates last interval
			var totalCounter = this.counter;

			// store history. This has to be done BEFORE setting _enabled to false
			_endHistoryInterval( Date.now() );

			// disable timer
			_op._enabled = false;
			window.clearInterval( _timerId );

			// store total elapsed time
			this.counter = totalCounter;
		};

		/**
		 * Reset counter to zero, but does not erase history
		 * This function does NOT stop\start the timer.
		 * Avoid "reset" reserved word
		 **/
		this.zero = function() {

			if ( this.enabled ) {
				var now = Date.now();

				// close open interval
				_endHistoryInterval( now );

				// start new interval
				_startHistoryInterval( now );
			}

			// reset counter
			this.counter = 0;

		};

		/**
		 * Returns an object which allows to rebuild this timer.
		 */
		this.serialize = function() {
			return $.extend( true, {}, _op );
		};

		/**
		 * return an object describing timer options.
		 * Those options can be used to re-create the timer.
		 * TODO: how to ensure that an instance of the object previously saved
		 * does not continue to handle the timer?? Possibly without modifying
		 * each function.
		 */
		this.destroy = function() {
			this.removeData( pluginName );
			this.stop();
			this.html( _existingContent );
		};

		/**********************************************
		 *           PRIVATE FUNCTIONS
		 **********************************************/

		/**
		 * Creates a new interval in history array.
		 * If an interval was already started without being closed,
		 * it throws an exception
		 * return now almost useless
		 **/
		function _startHistoryInterval( now ) {

			if ( _op.history.length != 0 &&
				_op.history[ _op.history.length - 1 ].stop === undefined )
				throw "Wrong _startHistoryInterval";

			var interval = {
				start: now
			};
			_op.history.push( interval );
			return now;
		}

		/**
		 * Closes currently active history interval.
		 * If last interval is already closed, throw an exception.
		 * return time elapsed from last .start
		 **/
		function _endHistoryInterval( now ) {

			if ( _op.history.length == 0 ||
				_op.history[ _op.history.length - 1 ].stop !== undefined )
				throw "Wrong _endHistoryInterval";

			_op.history[ _op.history.length - 1 ].stop = now;
			_op.history[ _op.history.length - 1 ].counter = _self.counter;

			return ( now - _op.history[ _op.history.length - 1 ].start );
		}

		/**
		 * Starts window.setInterval
		 **/
		function _setInterval() {
			_timerId = window.setInterval( function() {

				// get current timestamp
				var currentCounter = _self.counter;

				_op.updateHtml.call( _self );

				_op.onTick.call( _self );

				// target reached in this tick
				if ( _op.timerTarget > 0 && _self.counter >= _op.timerTarget &&
					_op._lastTickCounter < _op.timerTarget ) {

					// execute target reached handler
					_op.onTargetReached.call( _self );
				}

				// update last tick
				_op._lastTickCounter = currentCounter;

			}, _op.refreshInterval );
		}

		/**********************************************
		 *           ACTIONS TO PERFORM NOW
		 **********************************************/

		// show timer
		_op.updateHtml.call( _self );

		// if timer is enabled, start it
		if ( _op._enabled ) {

			/*
				We have 2 options here:
				1) User forcefully created a new timer, with _enabled = true,
				   specifying wrong history data
				2) User restored a new timer from a saved serialize()

				If (1) history has no open interval
				IF (2) we should receive both values.
			*/

			// (1)
			if ( _op.history.length == 0 ||
				_op.history[ _op.history.length - 1 ].stop !== undefined )
				throw "Wrong options given. _enabled parameter should not be used manually";
			else

			// (2) this is needed not to cause inconsistencies in history and _lastTickCounter
				_setInterval();
		}

		// set _op._lastTickCounter
		return this;
    };

	// default options
	$.fn.timer.defaults = {

		// generic variables
		timerCounter: 0,
		timerTarget: 0,
		refreshInterval: 1000,
		history: [],

		// formatter function
		updateHtml: function() {

			// using getTimezoneOffset makes this work with all timezones
			var d = new Date( 'Thu Jan 01 1970 00:00:00');
			var f = new Date( this.counter + d.getTimezoneOffset() * 60000 );

			this.html(
				( "0" + ( ( f.getDate() - 1 ) * 24 + f.getHours() ) ).substr( -2 ) + ":" +
				( "0" + ( f.getMinutes() ) ).substr( -2 ) + ":" +
				( "0" + ( f.getSeconds() ) ).substr( -2 )
			);

			console.log("counter: " + this.counter + " timezoneOffset: " + f.getTimezoneOffset() + " getAte: " + f.getDate() );
		},

		// event handlers
		onTargetReached: function() {},
		onTick: function() {}
	};

}( jQuery ) );
