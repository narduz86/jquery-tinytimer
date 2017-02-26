( function( $, QUnit ) {

	"use strict";

	var options = {};
	var pluginName = "jquery-tinytimer";

	// create an element to run tests inside
	var $testCanvas = $( "<div id='testCanvas'></div>" );
	var $fixture = null;
	var $fixture2 = null;
	$( "body" ).prepend( $testCanvas );

	QUnit.module( "jQuery tinyTimer", {
		beforeEach: function() {

			// fixture is the element where your jQuery plugin will act
			$fixture = $( "<div/>" );
			$fixture2 = $( "<div/>" );

			$testCanvas.append( $fixture );
			$testCanvas.append( $fixture2 );
		},
		afterEach: function() {

			// we remove the element to reset our plugin job :)
			$fixture.remove();
		}
	} );

	QUnit.test( "is inside jQuery library", function( assert ) {

		assert.equal( typeof $.fn.timer, "function", "has function inside jquery.fn" );
		assert.equal( typeof $fixture.timer, "function", "another way to test it" );
	} );

	QUnit.test( "returns jQuery functions after called (chaining)", function( assert ) {
		assert.equal(
			typeof $fixture.timer().on,
			"function",
			"'on' function must exist after plugin call" );
	} );

	QUnit.test( "caches plugin instance", function( assert ) {
		$fixture.timer();
		assert.ok(
			$fixture.data( pluginName ),
			"has cached it into a jQuery data"
		);
	} );

	QUnit.test( "enable custom config", function( assert ) {
		$fixture.timer( {
			foo: "bar"
		} );

		var pluginData = $fixture.data( pluginName );

		assert.deepEqual(
			pluginData.settings,
			{
				foo: "bar"
			},
			"extend plugin settings"
		);

	} );

	QUnit.test( "Test timer instance", function( assert ) {

		// measurement variables
		var afterStart, beforeStop, beforeStart, afterStop;

		// number of assertions
		assert.expect( 20 );

		// instantiate timer
		var t1 = $fixture.timer( $.extend( {}, options ) );

		// check div content 00:00:00
		assert.equal( $fixture.html(), "00:00:00", "Div content at timer creation" );

		// check start\stop
		var done1 = assert.async();
		beforeStart = Date.now();
		t1.start();
		afterStart = Date.now();

		setTimeout( function() {
			beforeStop = Date.now();
			t1.stop();
			afterStop = Date.now();

			// html was updated
			assert.notEqual( $fixture.html(), "00:00:00", "Start\Stop ok" );

			// check that counter was updated (2 asserts here)
			assertTimerRange( beforeStart, afterStart, beforeStop, afterStop, t1,
								assert, "Start\Stop" );

			// check history size
			assert.equal( t1.history.length, 1, "History length ok" );

			// check history interval start and stop ranges
			assertHistoryRange( beforeStart, afterStart, beforeStop, afterStop, t1.history[ 0 ],
								assert, "Start\Stop" );

			// check reset
			t1.zero();
			assert.equal( t1.counter, 0, "Counter value after reset" );
			assert.equal( $fixture.html(), "00:00:00", "Reset div ok" );
			assert.equal( t1.history.length, 1, "History length after reset ok" );

			// check start\stop after reset
			beforeStart = Date.now();
			t1.start();
			afterStart = Date.now();

			done1();
		}, 2100 );

		// check start\stop after reset
		var done2 = assert.async();
		setTimeout( function() {

			beforeStop = Date.now();
			t1.stop();
			afterStop = Date.now();

			// html was updated
			assert.notEqual( $fixture.html(), "00:00:00", "Start\Stop after reset ok" );

			// check that counter was updated (2 asserts here)
			assertTimerRange( beforeStart, afterStart, beforeStop, afterStop, t1,
								assert, "Reset" );

			// check history
			assert.equal( t1.history.length, 2, "History length after restart ok" );
			assertHistoryRange( beforeStart, afterStart, beforeStop, afterStop, t1.history[ 1 ],
								assert, "Reset" );

			// check overriding counter value
			t1.counter = 1000;
			assert.equal( $fixture.html(), "00:00:01", "Manual counter div 1000 ok" );
			assert.ok( t1.counter == 1000, "Manual counter value 1000 ok" );

			// check overriding counter value with zero
			t1.counter = 0;
			assert.equal( $fixture.html(), "00:00:00", "Manual zero counter ok" );
			assert.ok( t1.counter == 0, "Manual zero counter value ok" );

			done2();
		}, 4000 );

	} );

	QUnit.test( "duplicate timer and test two instances", function( assert ) {

		// wait for all "done"
		assert.expect( 4 );

		// instantiate timers
		var t1 = $fixture.timer( $.extend( {}, options ) );
		var t2 = $fixture2.timer( t1.settings );

		// check start\stop of 2 instances
		var done1 = assert.async();
		t1.start();

		setTimeout( function() {
			t2.start();
		}, 2000 );

		setTimeout( function() {
			assert.ok( t1.counter > t2.counter, "Concurrent timers working properly" );
			t1.counter = 0;
			assert.ok(
				t1.counter < t2.counter,
				"Setting counter on one timer does not alterate second timer"
			);

			t2.destroy();
			assert.notEqual( $fixture.html().trim(), "", "check that t1 was not destroyed" );
			assert.equal( $fixture2.html().trim(), "", "check that t2 is deleted" );
			done1();
		}, 3000 );
	} );

	/**
	 * This function checks if timer counter value is between min and max values.
	 */
	function assertTimerRange( beforeStart, afterStart, beforeStop, afterStop, $timer,
								assert, msgPrefix ) {
		msgPrefix = msgPrefix + ". " || "";
		var minValue = beforeStop - afterStart;
		var maxValue = afterStop - beforeStart;

		assert.ok( $timer.counter >= minValue,
			msgPrefix + "Check counter greater than min value. Expected miminum: " +
			minValue + ", found: " + $timer.counter );

		assert.ok( $timer.counter <= maxValue,
			msgPrefix + "Check counter less than max value. Expected maximum: " +
			maxValue + ", found: " + $timer.counter );
	}

	/**
	 * This function checks if history value is between min and max values.
	 */
	function assertHistoryRange( beforeStart, afterStart, beforeStop, afterStop, historyElement,
								assert, msgPrefix ) {
		msgPrefix = msgPrefix + ". " || "";

		assert.ok( historyElement.start >= beforeStart && historyElement.start <= afterStart,
					msgPrefix + "Check history start value. Expected bewteen " +
					beforeStart + " and " + afterStart + ". Found: " + historyElement.start );

		assert.ok( historyElement.stop >= beforeStop && historyElement.stop <= afterStop,
					msgPrefix + "Check history stop value. Expected bewteen " +
					beforeStop + " and " + afterStop + ". Found: " + historyElement.stop );
	}

}( jQuery, QUnit ) );
