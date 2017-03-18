# jquery-tinytimer
Simple timer plugin for jQuery. It provides basic and simple functionalities
to create, start, stop, reset and read timer values.
Some features:
- **save\restore**: timer instance can be saved and re-created
- **standby-proof**: timer keeps tracking even if pc is turned off
- **history**: the timer keeps track of start\stop events
- **counter update**: counter value can be dynamically set to any value >=0
- **handlers**: basic `onTick()` and `onTargetReached()` handlers available
- **customizable time format**


# Usage
## Instantiate a new timer
To create a new timer, simply call:

```js
$("#my-div").timer();
```

This will override the content of the div with "00:00:00".
## Available actions
Timer instance has the following available actions:

```js
var $t = $("#my-div").timer();
$t.start(); // starts timer
$t.stop(); // stops timer
$t.zero(); // reset timer counter. If running, it keeps running
```

## Available options
Default option values are available calling `$.timer.defaults`.
Here follows the list of the available options:

```js
{
  // generic variables
  timerCounter: 0,  // initial value of the timer (default: 0)
  timerTarget: 0,   // target value for timer. (default:0, means no target)
  refreshInterval: 1000, // tick interval in milliseconds (default: 1000)

  // formatter function
  updateHtml: function() {}, // formatter function (see next parwagraphs)

  // event handlers
  onTargetReached: function() {}, // executed when counter reaches target value
  onTick: function() {}           // executed on each tick
}
```

For instance, to instantiate a new timer which starts from 1 minute:

```js
var options = {
  timerCounter: 1000*60
};
$("#my-div").timer( options );
```

This will instantiate a timer showing counter "00:01:00".

### Handlers
You can customize timer behavior by providing `onTargetReached`
and `onTick` handlers in options object. These handlers can use `this`
to reference timer object and its attributes.
Here follows a simple example of `onTick` handler which logs timer attributes:

```js
var options = {
  onTick: function() {
    console.log(
      "Counter value: " +   this.counter + "\n" +
      "Target: " +          this.target + "\n" +
      "Is Running: " +      this.enabled + "\n" +
      "Current history: " + JSON.stringify(this.history)
    );
  }
};
$("#my-div").timer( options );
$("#my-div").timer().start();
```

Another example: how to make timer stop when target value is reached:

```js
var options = {
  timerTarget: 10000, // target set to 10 seconds
  onTargetReached: function() {
    this.stop(); // stop timer after 10 seconds
  }
};
$("#my-div").timer( options );
$("#my-div").timer().start();
```

### Formatting output
This timer comes with a default formatter, which shows counter value
with format "00:00:00". The plugin gives the possibility to override the
default behavior just customizing the `updateHtml` function
with a custom function returning a string. Also in this case,
reference to `this` can be used.
Here follows an example:

```js
// returns timer value in milliseconds
var options = {
  updateHtml: function() {
    this.text(this.counter);
  }
};
$("#my-div").timer( options );
```

This will instantiate a timer showing counter value in milliseconds.

Using formatter function a more sophisticated formatting can be obtained.
For example, showing timer value in three separate divs:

```js
// timer div
var myDiv = $("<div style='display: none;'/>");
// display divs
var h = $("<div style='heigth: 30px; width: 100px; border: 1px solid black'/>");
var m = h.clone(), s = h.clone();
// append to page
$("body").append(myDiv).append(h).append(m).append(s);

var options = {
  timerCounter: 1000*61*61,
  updateHtml: function() {
    var f = new Date( this.counter );
    h.text(( "0" + ( ( f.getDate() - 1 ) * 24 + f.getHours() - 1 ) ).substr( -2 ) + " hours");
    m.text(( "0" + ( f.getMinutes() ) ).substr( -2 )  + " minutes");
    s.text(( "0" + ( f.getSeconds() ) ).substr( -2 ) + " seconds");
  }
};
$("#my-div").timer( options );
```

## Save and restore an instance
Timers can be saved to a variable, to be restored in a second time.
This is useful in case of data saved in sessions, or database.

```js
// instantiate timer
var myDiv = $("<div/>");
myDiv.appendTo("body");
var timer = myDiv.timer();

// start it and change counter value
timer.start();
timer.counter = 60*1000;

// save current instance
var savedTimer = timer.serialize();

// destroy current instance
timer.destroy();
timer.remove();

// instantiate a new timer
var dupDiv = $("<div/>");
dupDiv.appendTo("body");

// this timer will start right after its creation
var dupTimer = dupDiv.timer(savedTimer);
```

## Timer usage
After instantiating a timer, you can do the following:
- start timer
- stop timer
- reset counter value to zero

Here follows a code example:

```js
// instantiate two timers
var $timer = $("#my-div").timer(); // this will be accesses through a variable\
$("#my-div2").timer(); // this will be accessed directly

// starts ticking
$timer.start();
$("#my-div2").timer().start();

// stops ticking
$timer.stop();
$("#my-div2").timer().stop();

// reset counter value
$timer.zero();
$("#my-div2").timer().reset();
```
