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

	QUnit.test("Test timer instance", function(assert) {

		// number of assertions
		assert.expect( 13 );

		// instantiate timer
		var t1 = $fixture.timer($.extend( {}, options ));

		// check div content 00:00:00
		assert.equal($fixture.html(), "00:00:00", "Div content at timer creation");

		// check start\stop
		var done1 = assert.async();
		t1.start();
		setTimeout(function() {
			t1.stop();

			// cannot be sure that it will run at 00:00:02
			assert.notEqual( $fixture.html(), "00:00:00", "Start\Stop ok" );

			// put an high max value to handle browser slowdown
			assert.ok(t1.counter >= 2000 && t1.counter <= 10000, "Counter value restart ok" );
			done1();
		}, 2100);

		// check history
		var done2 = assert.async();
		setTimeout(function() {
			assert.equal( t1.history.length, 1, "History length ok" );
			done2();
		}, 3000);

		// check reset
		var done3 = assert.async();
		setTimeout(function() {
			t1.zero();
			assert.equal( $fixture.html(), "00:00:00", "Reset div ok" );
			assert.equal( t1.history.length, 1, "History length after reset ok" );
			done3();
		}, 3500);

		// check start\stop after reset
		var done4 = assert.async();
		setTimeout(function() {
			t1.start();
			done4();
		}, 3800);
		var done5 = assert.async();
		setTimeout(function() {
			t1.stop();
			// cannot be sure that it will run at 00:00:01
			assert.notEqual( $fixture.html(), "00:00:00", "Start\Stop after reset ok" );
			assert.equal( t1.history.length, 2, "History length after restart ok" );
			// put an high max value to handle browser slowdown
			assert.ok(t1.counter >= 1000 && t1.counter <= 10000, "Counter value after restart ok" );
			done5();
		}, 5000);

		// check overriding counter value
		var done6 = assert.async();
		setTimeout(function() {
			t1.counter = 1000;
			assert.equal( $fixture.html(), "00:00:01", "Manual counter div 1000 ok" );
			assert.ok(t1.counter == 1000, "Manual counter value 1000 ok" );

			t1.counter = 0;
			assert.equal( $fixture.html(), "00:00:00", "Manual zero counter ok" );
			assert.ok(t1.counter == 0, "Manual zero counter value ok" );

			done6();
		}, 6000);
	});

	QUnit.test( "duplicate timer and test two instances", function( assert ) {

		// wait for all "done"
		assert.expect( 4 );

		// instantiate timers
		var t1 = $fixture.timer($.extend( {}, options ));
		var t2 = $fixture2.timer(t1.settings);

		// check start\stop of 2 instances
		var done1 = assert.async();
		t1.start();

		setTimeout(function() {
			t2.start();
		}, 2000);

		setTimeout(function() {
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
		}, 3000);
	} );

}( jQuery, QUnit ) );
