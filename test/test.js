( function( $, QUnit ) {

	var options = {};

	QUnit.test('Test timer instance', function(assert) {

		// number of assertions
		assert.expect( 13 );

		// append div element
		$("<div id='timer1'></div>").appendTo("body");
		var div1 = $("#timer1");

		// instantiate timer
		var t1 = div1.timer($.extend( {}, options ));

		// check div content 00:00:00
		assert.equal(div1.html(), "00:00:00", "Div content at timer creation");

		// check start\stop
		var done1 = assert.async();
		t1.start();
		setTimeout(function() {
			t1.stop();
			assert.equal( div1.html(), "00:00:02", "Start\Stop ok" );
			assert.ok(t1.counter >= 2000 && t1.counter <= 3000, "Counter value restart ok" );
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
			assert.equal( div1.html(), "00:00:00", "Reset div ok" );
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
			assert.equal( div1.html(), "00:00:01", "Start\Stop after reset ok" );
			assert.equal( t1.history.length, 2, "History length after restart ok" );
			assert.ok(t1.counter >= 1000 && t1.counter <= 2000, "Counter value after restart ok" );
			done5();
		}, 5000);

		// check setting counter
		var done6 = assert.async();
		setTimeout(function() {
			t1.counter = 1000;
			assert.equal( div1.html(), "00:00:01", "Manual counter div 1000 ok" );
			assert.ok(t1.counter == 1000, "Manual counter value 1000 ok" );

			t1.counter = 0;
			assert.equal( div1.html(), "00:00:00", "Manual zero counter ok" );
			assert.ok(t1.counter == 0, "Manual zero counter value ok" );

			done6();
		}, 6000);


		// TODO test timer duplicate
		// Setup the various states of the code you want to test and assert conditions.
		//assert.equal(1, 1, '1 === 1');
		//assert.ok(true, 'true is truthy');
		//assert.ok(1, '1 is also truthy');
		//assert.ok([], 'so is an empty array or object');
	});


}( jQuery, QUnit ) );
