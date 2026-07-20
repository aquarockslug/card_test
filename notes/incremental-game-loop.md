# How do I make a game loop for my Idle Game?

## Interval-Based Resource Generators

So, you want to build an idle/incremental game in JavaScript and you’ve read on the internet that `setInterval` is the way to go when it comes to handling resources that automatically generate over time.

You get started, you write down your `setInterval` function, you set it to trigger once every 1000 milliseconds, and every time it triggers, you add **1** to the player’s total resource count. Perfect. It works.

## Uh-oh.

…it works - until you add a second resource generator. You notice that your player’s currency is increasing by 2 every 1 second. With 3 generators, it increases by 3, with 20, it increases by 20. This is jarring. The number is not smoothly incrementing at all. Ideally, you want every resource accumulated to be evenly distributed over time, like the cool games have it done, so that when you have 1 resource generator, you get 1 increment every second, but if you have two, you get 1 increment every half-second, if 3 then 1 increment every 1/3rd of a second and so on and so forth and your game can be cool too. In summary, you want smooth animations and you want them *now*. How do we fix it?

## Stop! Delta time.

The overall solution to this problem is to build your game loop around the concept of **delta time**. To a new programmer, this may sound intimidating, but it really is less complicated than it sounds, because **delta time** is just some scientific-sounding term coined up by a programmer from the past who was perhaps too lazy to think of a descriptive name for what is essentially a simple subtraction. Why delta time; and not alpha time, beta time, sigma time or hammer time?

Since I'm no better at naming things than that long-forgotten programmer, to me that subtraction is, at it's most basic, best described as "current recorded time of function call" minus "last recorded time of function call". If you were that programmer many years ago, you might have called it *"elapsed time",* which makes more sense, as it represents the time that has elapsed since a function was previously called.

```js
elapsed_time = current_time - previous_time;
```

That simple formula is your **delta time**.

## Intervals: Totally improved recipe, now with more crunchy delta!

So, let's take your setInterval. You probably have something setup like this:

```js
setInterval(function updateMyGame() {
  // <insert highly sophisticated money += 1 code here>
}, 1000);
```

Every single time a second passes, `updateMyGame` is called. How do we go from this, to a setup that uses **delta time**?

Since we're dealing with time, we probably need to record the current time somewhere. It just so happens that JavaScript has a built-in function called `Date.now()` that will give us the milliseconds that have elapsed since the Unix Epoch (which is precisely at midnight on the 1st of January 1970). Which is "Good enough™" (for now) - Let's try that:

```js
setInterval(function updateMyGame() {
  const current_time = Date.now();
}, 1000);
```

This alone however is not enough. It doesn't accomplish our goal of computing *elapsed time*.

For that, we need to record the last time the function executed. We can do that with a variable in the outer scope, so it's persisted between function calls. We can initiate it to `null` so we can easily detect if it hasn't been set yet (in which case we'll just set it to the current time the interval function executes), and we'll declare it with `let` because we're going to periodically change it:

```js
let last_time = null;
setInterval(function updateMyGame() {
  const current_time = Date.now();
  if (last_time === null) {
    last_time = current_time;
  }
}, 1000);
```

Now that we have two variables to work with, we can calculate **delta time**:

```js
let last_time = null;
setInterval(function updateMyGame() {
  const current_time = Date.now();
  if (last_time === null) {
    last_time = current_time;
  }
  const delta_time = current_time - last_time;
  last_time = current_time; // make sure to update "last_time"!
}, 1000);
```

We can also track another useful variable, **total_time**, which will simply record the total time that has passed since the function was first executed. We will just keep adding **delta time** to it on every execution:

```js
let last_time = null;
let total_time = 0;
setInterval(function updateMyGame() {
  const current_time = Date.now();
  if (last_time === null) {
    last_time = current_time;
  }
  const delta_time = current_time - last_time;
  total_time += delta_time;
  last_time = current_time;
}, 1000);
```

## A Little Refactor

And just for simplicity's sake, let's change the name of the interval function to **gameLoop** and move the **updateMyGame** function to a place where it's nice and decoupled and so is more useful to us:

```js
let last_time = null;
let total_time = 0;
setInterval(function gameLoop() {
  const current_time = Date.now();
  if (last_time === null) {
    last_time = current_time;
  }
  const delta_time = current_time - last_time;
  total_time += delta_time;
  last_time = current_time;
  updateMyGame(delta_time, total_time);
}, 1000);

function updateMyGame(delta_time, total_time) {

}
```

The first time this function executes, both **delta_time** and **total_time** will be close to 0. The second time it executes, **delta_time** and **total_time** will be close to 1000 - because the interval given to **setInterval** is 1000. The third time it executes, **delta_time** will be close to 1000, and **total_time** will be close to 2000. We now have a way to track how much time has elapsed in our game since it was last updated, and how much time has elapsed since it first started updating.

## Deriving value

If we wanted to derive a value from elapsed time, say for a resource that generates 1 currency per second, it's as simple as this (note that we're accumulating *currency per* **millisecond**, instead of **per second**, since our time calculations are all derived from milliseconds):

```js
const currency_display = document.getElementById("currency");
let currency = 0;
const currency_per_millisecond = 0.001;

function updateMyGame(delta_time, total_time) {
	currency += currency_per_millisecond * delta_time;
	currency_display.textContent = currency;
}
```

You might notice a problem here, however. We're doing floating point math and the number is a decimal value that is jumping in strange decimal increments. The fix for this is easy. All we need to do is either round the number (if we want to display a whole number), or call **.toFixed(2)** on it to show at least 2 decimal places (I'll go with the second option) before we display it:

```js
const currency_display = document.getElementById("currency");
let currency = 0;
const currency_per_millisecond = 0.001;

function updateMyGame(delta_time, total_time) {
  currency += currency_per_millisecond * delta_time;
  currency_display.textContent = currency.toFixed(2);
}
```

## Making no progress (or are we?)

Now the number updates every second in a more predictable way. So, what happens when we introduce another increment? Lets say the player has 1x **Building A** which generates 1 currency per second, and 3x **Building B** which generates 3 currency per second.

```js
let currency = 0;
let building_a_currency_per_millisecond = 0.001;
let building_b_currency_per_millisecond = 0.003;

function updateMyGame(delta_time, total_time) {
  currency += (building_a_currency_per_millisecond) * delta_time;
  currency += (building_b_currency_per_millisecond) * delta_time;
  currency_display.textContent = currency.toFixed(2);
}
```

It generates the correct amount over time, but it doesn't look very smooth. The number still increments in batched amounts, which was our original problem. The good news is that because we’re deriving from delta time, our values are actually correct *between* updates. So all we need to do is update the display more than once per second so we can show what the *real* values are *between* every second.

## Shortening the interval

Let's try changing the interval passed to **setInterval** to something a little more animated. Say we want this to execute at 60 updates (or "frames") per second, for example. It isn’t really important that the game updates at a set 60 frames per second, this is just an arbitrary number I’ve chosen. It would be useful in an actual game, but Idle Games are not so reliant on a perfectly smooth frame rate and you have some flexibility with the number you get to choose for your game. If you want a different frequency, feel free to change it. **25ms** and **50ms** seem to be popular frequencies in the Idle Game world. Anyways, we can convert the "60 frames per second" into a millisecond timestamp with the formula `1000 / 60` (which is roughly **16.66 milliseconds**), so back in **gameLoop()**:

```js
setInterval(function gameLoop() {
  /* ... */
}, 1000 / 60); // changed from static "1000"
```

And now the number on the screen should be incrementing by the smallest decimal, at a speed that matches our per-second generation rate. This is exactly the behavior you were probably looking for - nice and smooth incrementing numbers. We could just stop here and call it a day, but by basing our game loop on delta time, we’ve secretly unlocked a whole bunch of valuable techniques. It’d be a shame to not talk about them.

## More potential

For example, what if instead of deriving a value from time, we just want to do something if a certain amount of time has passed? Perhaps you'd like to trigger a game save once 5 seconds have passed. Remember the **total_time** variable from earlier? That's what it's for. All we have to do is create a separate time accumulator that we can subtract from **total_time** to get the amount of milliseconds that have passed:

```js
let time_at_which_game_saved = 0;
function update(delta_time, total_time) {
  const time_since_game_saved = total_time - time_at_which_game_saved;
  if (time_since_game_saved >= 5000) {
    // this condition will trigger if and only if 5 seconds (or more) have elapsed
    saveTheGame();
    // remember to update the timestamp
    time_at_which_game_saved = total_time;
  }
}
```

And there's one more thing that **total_time** is extremely useful for - offline progress. What happens when we read the **total_time** from the game save before we start calling **updateMyGame()**? Well, the total time is then no longer representative of the time since our game started executing *within a single play session*, but is instead representative of the time *since the player started playing* overall! And we can determine how much currency the player has generated, even while offline, by just accumulating their currency generators according to **total_time**. With everything we’ve learned so far all put together, that might look like this:

```js
function loadTime() {
  const time = window.localStorage.getItem("total_time");
  if (time) return parseFloat(time);
  return 0;
}

function saveTime(time) {
  window.localStorage.setItem("total_time", time);
}

let last_time = null;
let total_time = loadTime();

// save the time when the player exits the browser tab
window.addEventListener("beforeunload", () => saveTime(total_time));

setInterval(function gameLoop() {
  const current_time = Date.now();

  if (last_time === null) {
    last_time = current_time;
  }

  const delta_time = current_time - last_time;
  total_time += delta_time;
  last_time = current_time;

  updateMyGame(delta_time, total_time);
}, 1000 / 60);

let building_a_currency_per_millisecond = 0.001;
let building_b_currency_per_millisecond = 0.003;

// calculate starting currency based on total_time and rates
let currency =
    (building_a_currency_per_millisecond * total_time) +
    (building_b_currency_per_millisecond * total_time);

let last_save = 0;

function updateMyGame(delta_time, total_time) {
  if (total_time - last_save >= 5000) {
    saveTime(total_time);
    last_save = total_time;
  }

  currency += (building_a_currency_per_millisecond) * delta_time;
  currency += (building_b_currency_per_millisecond) * delta_time;
  app.textContent = currency.toFixed(2);
}
```

We don’t even have to save the `currency` variable in local storage because we can just derive it from the total time the game has elapsed, which frees us up a bit of storage space. Though, you’ll probably want to save the amount of resource buildings/generators the player owns and what their rates are as well, as these values are typically generated by events that happened (e.g. “player purchased building”, “player upgraded building A’s rate”) and are not so coupled to elapsed time,  so it wouldn’t make sense to derive the current values of those things from delta time - but I’ll leave that as an exercise for you to figure out and keep this text focused strictly on delta time, because we’re not just going to stop here.

## Improvements: Better Timing

As it turns out, there are a *lot* of improvements we can make to this code to make it more stable and predictable.

The first thing we can do is change that `Date.now` call to a `performance.now` call. Modern browsers give you an API on the global `performance` object which is mostly used for measuring performance. `now()` is a method on that API that gives you a high-precision millisecond timestamp since the browser started processing navigation requests. Unlike `Date.now`, which is accurate to the millisecond, `performance.now` is accurate to the *microsecond*. And since it’s reference timestamp is far more recent than the Unix epoch, the risk of the number growing beyond it’s bounds is almost none. The unix timestamp will exceed being a 32-bit integer some time in 2038, and who knows what kind of trouble that will cause for our games which will definitely have decades-long shelf lives? Yup, better use `performance.now()`. Making that change is simple:

```js
const frequency = 1000 / 60;
let last_time = null;
let total_time = 0;
setInterval(function gameLoop() {
  const current_time = performance.now(); // all we change is this
  if (last_time === null) last_time = current_time;
  const delta_time = current_time - last_time;
  total_time += delta_time;
  last_time = current_time;
  updateMyGame(delta_time, total_time);
}, frequency);
```

## Improvements: Maybe try another scheduler?

Another thing worth exploring is our use of `setInterval`. Do we really need to specifically use `setInterval`? What about `setTimeout` or `requestAnimationFrame`?

Well, the way I see it is, it doesn’t really matter (for an incremental/idle game, that is - it absolutely matters for other types of games). But it *is* worth looking at their individual behavior:

- `setInterval` will run the provided callback once the given time (or more time) has passed, repeatedly. It will also be throttled if left in a background tab in some browsers. It has the unfortunate side-effect of *time drift*, where time will slowly accumulate and the interval will be offset slightly.
- `setTimeout` will run the provided callback *after* the given time (or more time) has passed, exactly once. It will also be throttled if left in a background tab in some browsers. It doesn’t share the same time drift issue as `setInterval`, but it trades that for it’s own disadvantages. It can be called recursively.
- `requestAnimationFrame` will schedule the provided callback to execute on the next render-pass of the browser. It is tied closely to the user’s framerate and doesn’t depend on a given time value. When in a background tab, it will not schedule any new callbacks until focus returns to the tab (this is both a pro and a con - it’s a pro as it saves battery life on mobile devices, it’s a con as we have to be aware of this and be careful of deriving values from time, as there could be gaps in time). Since it is dependent on framerate instead of time, it doesn’t suffer from time drifts, but it does suffer from fps spikes. The callback provided to `requestAnimationFrame` is also passed a high-precision timestamp automatically.

The good news is that all (or at least most) of the downsides listed above are not exactly relevant to us. Since we’re calculating delta time, we’re actually already factoring in any time drift in our calculations - as long as we derive those calculations from delta time, they wont affect our game. So all that malarkey about time drifting in `setInterval`, `setTimeout` etc just doesn’t apply to us. Aren’t we clever? Take that, browsers!

## *Real* Better Timing with Animation Frames

I personally see a little more value over the other schedulers in `requestAnimationFrame`, for three reasons:

1. We can leverage it to save the user some battery life if they’re playing on a phone or a laptop and happen to leave the game idle.
2. The high-precision timestamp that is passed to it can help simplify our code.
3. It’s already tied to the user’s framerate - we don’t need to calculate an interval to get a smooth increment, and smooth animations are “for free :tm:”

Let’s just focus on reason #2 for now. Remember earlier when I said that `performance.now()` is more accurate than `Date.now()`? Well, it turns out I was lying (sheesh, can’t trust anyone these days). The thing is, it’s actually *supposed* to be more accurate, and it *does* have less associated risk in regards to growing beyond it’s bounds - but some horrible highly-technical bad guys with unimpressive neckbeards went and invented precision timing attacks, and two of those attacks - named Spectre and Meltdown, take advantage of a vulnerability in `performance.now()`. So, there is still some risk, and to mitigate this, browsers will perform a rounding operation on the timestamp. They also perform a similar mitigation on `Date.now()` for different attacks. These mitigations reduce precision.

For an idle game that wouldn’t really be an issue because technically speaking, the micro-millisecond-accuracy of updates in idle games is not at all that important. Unfortunately for us, we might want to re-use our game loop for a different game or at least take some of the guesswork out of the debugging process when things go wrong. Ambiguities lead to guesswork, and this mitigation is an ambiguity because different browser vendors mitigate the value differently. Some might have 1ms precision, some might have 2ms precision - and our goal here is to improve the stability of our core game loop. If we have the potential to remove an ambiguity such as “what is the current precision of our game in x browser vs y browser and how does that affect a bug in our game”, we probably should remove that ambiguity, as it will make our lives much easier one day in the future when we’re doing maintenance.

As it turns out, we have a direct way to remove said ambiguity. That high-precision timestamp value passed to `requestAnimationFrame` is actually a `performance.now()` call in disguise - but it’s special. Since it is a value that is provided to us by the browser engine and not a value we directly control (and thus cannot manipulate), it is theoretically safe from timing attacks. So, browser vendors do not apply those mitigations to this timestamp. It really is high-precision, just like we want. So, we could improve our game loop by using `requestAnimationFrame` instead of `setInterval`:

```js
let last_time = null;
let total_time = 0;
function gameLoop(current_time) {
  if (last_time === null) last_time = current_time;
  const delta_time = current_time - last_time;
  total_time += delta_time;
  last_time = current_time;

  updateMyGame(delta_time, total_time);

  requestAnimationFrame(gameLoop);
}
requestAnimationFrame(gameLoop);
```

Notice how we’re not having to calculate the interval anymore. That simplifies our code quite substantially, but nothing gained comes without a cost. We have traded one bad thing for another. Our game loop will save the user battery life, but it is now dependent on framerate, instead of time.

## There’s always a tradeoff, and this one floats and points

In a perfect world where our game runs at a constant frequency (like it *sort of* did in `setInterval`), our calculations derived from delta time will have little to no consequence. Yet, since we’re tying these calculations to the user’s framerate, the delta time value is no longer constant. It instead varies over time. If the player’s computer is running slowly for whatever reason (perhaps they’re mining crypto in the background or are just on another tab), the delta time that elapsed between the current frame and the previous frame would have accumulated and be much larger than it would be if those conditions were different, which leaves us with a lot of accumulated time to simulate.

Since we’re multiplying values by the delta time, we run the risk of accumulating rounding errors that cause a *value* drift over time (as opposed to a time drift). This could cause our game to appear as if it is slowing down intermittently, which is *not* something we want in a genre all about making a number go up *more quickly*. Imagine if your player bought an upgrade and then their gains slowed. Not ideal. In some scenarios the game could even freak out and fast-forward itself, which would be very confusing.

We can test this with a simple demonstration. Go ahead and try this out; run the following code in a browser console:

```js
console.log(0.1 + 0.2);
```

That should output `0.30000000000000004`, which we know is incorrect because `0.1 + 0.2` is `0.3`. Where did that microscopic 4 decimal come from? That’s a floating-point rounding error, and over time it will slowly accumulate into your calculations. If your player has a resource building that accumulates `0.001 * 16.66` in one frame and `0.001 * 22.2` in the next frame and so on, eventually, their resource rates will shift outside of the realm of predictability.

This issue has a really severe problem: it makes testing our code impossible. The ability to reliably test your code depends a *lot* on your code’s predictability - we call this *determinism*. Given the same inputs, a *deterministic* program will always produce the same outputs. Deterministic programs are easy to test. When this doesn’t hold true, we cannot guarantee that the assumptions we make about our code are correct, and so we cannot put those assumptions into an automated unit test. Simply put, it makes fixing bugs much harder to do and increases our risk of headaches (and not the fun kind that come after a stiff drink, either).

## Fixing it

The solution here is to fix the delta time to a constant value, but still somehow use it to record the amount of time that has passed. What if, instead of calling `update` once per frame, we divide up the delta time by some fixed amount, and call `update` for as many times as we can fit that fixed amount into delta time?

We could, but one problem with division is that sometimes, there’s a remainder. In this case, if there’s any time left over, we might miss an `update` call. That’s fine, as long as we hold onto the remaining time, we can just let an `update` accommodate that time in the next frame. This technique is known as a “fixed time step” in the game development industry. As it happens, we’ve already seen a useful formula for getting a 60fps timestep. So, let’s change the loop to used a fixed time step:

```js
let time_step = 1000 / 60;
let last_time = null;
let total_time = 0;
let accumulated_lag = 0;

function loop(current_time) {
  if (last_time === null) last_time = current_time;
  const delta_time = current_time - last_time;
  total_time += delta_time;
  accumulated_lag += delta_time;
  last_time = current_time;

  while (accumulated_lag >= time_step) {
    accumulated_lag -= time_step;
    update(time_step, total_time);
  }

  requestAnimationFrame(loop);
}
requestAnimationFrame(loop);

const currency_display = document.getElementById("currency");

let currency = 0;
const currency_per_millisecond = 0.003;

function update(delta_time, total_time) {
  currency += currency_per_millisecond * delta_time;
  currency_display.textContent = currency.toFixed(2);
}
```

As you’ve probably noticed, we didn’t have to change the implementation of `update`. It still behaves as if it receives a delta time parameter, the only difference is that the value for this delta time is always the same. What changed is how frequently update is called, and this frequency is varied. In some frames, there might be a lot of time that `update` has to simulate. In other frames, there might not be any time to simulate, and `update` just won’t be called until enough time has accumulated.

There are however two very big problems here.

## Separate Rendering

The first problem is that we’ve gone and shoved our code that draws the currency back into a locked 60 frames per second. Wasn’t one of the reasons we chose `requestAnimationFrame` in the first place to take advantage of the player’s frame rate? What if they’re on a 144hz monitor? Or even worse, what if they’re on a 40hz monitor that can’t display 60 frames per second?

The solution to this is an easy one. Instead of one `update` step, what we really need is two: one step for `update`, which is locked to a predictable delta time, and one step for `render`, which isn’t locked and can just draw the state of the game as quickly as it changes.

```js
let time_step = 1000 / 60;
let last_time = null;
let total_time = 0;
let accumulated_lag = 0;

function loop(current_time) {
  if (last_time === null) last_time = current_time;
  const delta_time = current_time - last_time;
  total_time += delta_time;
  accumulated_lag += delta_time;
  last_time = current_time;

  while (accumulated_lag >= time_step) {
    accumulated_lag -= time_step;
    update(time_step, total_time);
  }

  render();

  requestAnimationFrame(loop);
}
requestAnimationFrame(loop);

const currency_display = document.getElementById("currency");

let currency = 0;
const currency_per_millisecond = 0.003;

function update(delta_time, total_time) {
  currency += currency_per_millisecond * delta_time;
}

function render() {
  currency_display.textContent = currency.toFixed(2);
}
```

With that, we’re back to a nice, smooth framerate - it certainly has room for improvement, but it is *much better* than what we started with at the beginning of this article.

## “Uh, I tabbed out and then your game crashed.”

That’s our second problem. It’s pretty severe. There is a risk of this core loop crashing when put into a specific scenario. The reason for this is we’re just happily calling `update` inside a `while` loop that could be of any size and we don’t do any safety checks on it.

Consider the situation where a player is playing your game - but they then get invited into a 4 hour long Valorant session with their favorite squad buddies. They tab out of your game and hop into Valorant, leaving your game to accumulate time in the background.

When their Valorant gaming session ends, they return to your game. The tab, now focused, calls `requestAnimationFrame`, which calls `loop`, which sees that the `last_time` was 4 hours ago and so it divides up 4 hours worth of `update` calls into 16.66 millisecond intervals. There are 14400000 milliseconds in 4 hours, which is gross. That right there is potentially 864345 calls to `update` - just to get the game world up-to-date enough before it can paint a single frame…

Your browser will look at this and literally just drop it’s pants and defecate. Right there. In front of everyone. Like I said, it’s gross, and embarrassing.

There are *many* different strategies to deal with this, and each strategy available to you depends on the nature of your game. For example, a multiplayer game might just flag this as a player who is lagging really badly and kick them from the lobby. Some games just discard the un-simulated time and resume as per normal. Some games try to attempt to see if the game will slowly catch up before handling the situation. Some games have an authoritative state that they can fallback on and gradually animate the player’s view to that state. That last one is interesting to developers of idle games, because technically, you have an authoritative state - your save data.

Whichever strategy you choose, you’ll want an extra step somewhere in that `while` loop called `panic` to put it in, which is driven by some detection of the number of updates exceeding some fixed amount.

```js
let time_step = 1000 / 60;
let last_time = null;
let total_time = 0;
let accumulated_lag = 0;
let number_of_updates = 0;

function loop(current_time) {
  if (last_time === null) last_time = current_time;
  const delta_time = current_time - last_time;
  total_time += delta_time;
  accumulated_lag += delta_time;
  last_time = current_time;

  while (accumulated_lag >= time_step) {
    accumulated_lag -= time_step;
    update(time_step, total_time);

    if (number_of_updates++ >= 300) {
      number_of_updates = 0;
      panic();
      break;
    }
  }

  render();

  requestAnimationFrame(loop);
}
requestAnimationFrame(loop);

const currency_display = document.getElementById("currency");

let currency = 0;
const currency_per_millisecond = 0.003;

function update(delta_time, total_time) {
  currency += currency_per_millisecond * delta_time;
}

function render() {
  currency_display.textContent = currency.toFixed(2);
}

function panic() {
  // restore the game state
  currency = readCurrencyValueFromLocalStorage();
}
```

This is by no means perfect, but it’s a good start and it will get you somewhere. A more sophisticated implementation will probably realize that a `panic` is usually preceded by a drop in framerate, so it might be worth monitoring the framerate before a `panic` occurs and pre-empt it with a temporary switch to a different calculation strategy.

## Bonus tip: calculating FPS

Outside of the fixed time step (i.e. within the callback to `requestAnimationFrame`), you can calculate the framerate for a single frame with the simple formula `fps = 1000 / delta_time`. Getting an accurate projection of actual framerate is then as simple as collecting this number into a buffer (like an array) and calculating an average from the sum of all their values (there is a more performant way, but this is the most simple). Calculating fps for a single frame might look like this (I’ll leave the averaging / accommodating this into your own game loop as an exercise for you to figure out):

```js
let last = null;
let t = 0;
function loop(now) {
  if (last === null) last = now;
  const dt = now - last;
  t += dt;
  last = now;
  const fps_this_frame = 1000 / dt;
  document.body.textContent = fps_this_frame;
  requestAnimationFrame(loop);
}
requestAnimationFrame(loop);
```

## Did I stutter?

This will probably never happen in an idle/incremental game (because there just aren’t enough moving parts - *usually*) but in the rare scenario that your game has a lot of drawing to do, you might encounter a frame stutter, where the game looks like it quickly jumps from one state to another state, skipping a bunch of in-between state. You may think this is a dropped frame, but it actually isn’t.

It’s best to explain this with a little heartbeat chart of updates and renders. The first row of vertical lines are updates over time, and the second row are renders over time:

```
Updates: |  ||   |  |  |  || | |||  || ||  ||| ||  |  ||
Renders: | | | | | | | | | | | | | | | | | | | | | | | |
```

Do you notice how sometimes, there are updates that occur *in-between* renders? At the time of those renders, `update` hasn’t been called yet to update the state. The result is that sometimes you see a number count incrementally like this: 1, 2, 3, 4, 6, 7, 9, 10, 11, 12, 14, instead of like this: 1, 2, 3, 4, 5, 6, 7, 8,… etc.

What’s happening here is that  our renders are skipping out on a few updates. There’s a technique we can use to fix this, called **Interpolation**. The basic idea is, we take some *old* state, and some *new* state, as well as a percentage of time that passed between the old and new states, and use that to calculate the current *progression* from the old state to the new  state on the current render.

The formula for a linear interpolation is this (where `v1` is the *old* state, `v2` is the *new* state and `p` is the percentage of time between the two states at the current moment):

```js
v1 * (1 - p) + v2 * p
```

Assuming we give this formula a `v1` of 1, a `v2` of 5, and a `p` of 0.5 (for 50%), we should get 50% of the progression between 1 and 5, which is 2.5 - half of 5.

In the case of the currency in our game, we can easily get the *old* currency and the *new* currency. We’ve been essentially doing that with our `last_time`, `current_time` shenanigans, so it’d look something like this:

```js
let currency_per_millisecond = 0.003;
let currency = 0;
let old_currency = currency;

function update(delta_time) {
  old_currency = currency;
  currency += currency_per_millisecond * delta_time;
}
```

…but where does the percentage value in that formula come from? Well, we already have all the information we need to calculate it. It’s just `accumulated_lag / time_step`. We can pass that in as a parameter to our `render` step, and then just use a linear interpolation function called `lerp` to handle the calculation for us:

```js
let time_step = 1000 / 60;
let last_time = null;
let total_time = 0;
let accumulated_lag = 0;

function loop(current_time) {
  if (last_time === null) last_time = current_time;
  const delta_time = current_time - last_time;
  total_time += delta_time;
  accumulated_lag += delta_time;
  last_time = current_time;

  while (accumulated_lag >= time_step) {
    accumulated_lag -= time_step;
    update(time_step, total_time);
    /* ...panic code removed to keep this short ...*/
  }

  const interpolation = accumulated_lag / time_step;

  render(interpolation);

  requestAnimationFrame(loop);
}
requestAnimationFrame(loop);

const currency_display = document.getElementById("currency");

let currency = 0;
let old_currency = 0;
const currency_per_millisecond = 0.003;

function update(delta_time, total_time) {
  old_currency = currency;
  currency += currency_per_millisecond * delta_time;
}

function render(interpolation) {
  const interpolated_currency = lerp(
    old_currency,
    currency,
    interpolation
  );

  currency_display.textContent = interpolated_currency.toFixed(2);
}

function lerp(v1, v2, p) {
  return v1 * (1 - p) + v2 * p;
}
```

The downside to this is that now the rendering is *always* at least one frame behind the actual state of the game, but that’s an acceptable tradeoff, as one frame’s worth of lag is completely imperceptible to the player.

You might think that interpolation is really complicated - how do you deal with a situation where you have multiple things to display? How do you keep track of old state and new state when there are hundreds of resources in your game?

Well… That’s another tradeoff. There definitely are ways to structure your state in ways where managing this complexity is not as painful as I’ve demonstrated here, but honestly speaking, in an idle game, you rarely need interpolation and it’s safe to assume that you can just ignore this whole section. I just wanted to include information on how it’s done in case you ever outgrow simple idle games and move onto something bigger.

## Cleaning Up

As a final touch, I’ll present you with some code that takes all of the above concepts and packs it neatly into a `GameLoop` object that you can start, stop, pause and resume.

```js
const STOPPED = Symbol.for("@@gameloop/stopped");
const PAUSED = Symbol.for("@@gameloop/paused");
const RUNNING = Symbol.for("@@gameloop/running");

class GameLoop {
  constructor(options = {}) {
    this.state = STOPPED;
		this.options = {
      step: 1000 / 60,
      maxUpdates: 300,
      ...options
    };

    this.tick = this.tick.bind(this);
  }
  get isStopped() {
    return this.state === STOPPED;
  }
  get isPaused() {
    return this.state === PAUSED;
  }
  get isRunning() {
    return this.state === RUNNING;
  }
  start() {
    if (this.isStopped) {
      this.state = RUNNING;

      const lag = 0;
      const delta = 0;
      const total = 0;
      const last = null;

      this.timing = { last, total, delta, lag };
      this.frame = requestAnimationFrame(this.tick);
    }
  }
  stop() {
    if (this.isRunning || this.isPaused) {
      this.state = STOPPED;
      cancelAnimationFrame(this.frame);
    }
  }
  pause() {
    if (this.isRunning) {
      this.state = PAUSED;
      cancelAnimationFrame(this.frame);
    }
  }
  resume() {
    if (this.isPaused) {
      this.state = RUNNING;
      this.frame = requestAnimationFrame(this.tick);
    }
  }
  tick(time) {
    if (this.timing.last === null) this.timing.last = time;
    this.timing.delta = time - this.timing.last;
    this.timing.total += this.timing.delta;
    this.timing.lag += this.timing.delta;
    this.timing.last = time;

    let numberOfUpdates = 0;

    while (this.timing.lag >= this.options.step) {
      this.timing.lag -= this.options.step;
      this.onUpdate(this.options.step, this.timing.total);
      this.numberOfUpdates++;
      if (this.numberOfUpdates >= this.options.maxUpdates) {
        this.onPanic();
        break;
      }
    }

    this.onRender(this.timing.lag / this.options.step);

    this.frame = requestAnimationFrame(this.tick);
  }
}
```

And we can use it like this:

```js
const loop = new GameLoop();

let currency = 0;
let currency_per_millisecond = 0.003;

loop.onUpdate = function(dt, t) {
  currency += currency_per_millisecond * dt;
};

loop.onRender = function(i) {
  currencyEl.textContent = currency.toFixed(2);
};

loop.onPanic = function() {
  // discard any accumulated lag time and hope for the best
  this.timing.lag = 0;
};

loop.start();
```

## An Example

Using the above techniques, I was able to make [this relatively small incremental game](https://jsfiddle.net/nxoe21k3/153/show). It doesn’t support saving/loading (so don’t go playing it for hours), but it interpolates counts on a timer and has a really smoothly animated incrementing display as a result of that interpolation. There's a lot of duplicated code, but the majority of the duplicated code is all stuff to do with rendering to the screen and keeping track of statistics and events - this is mostly just for you to look at as a reference example for a typical game loop. Try tabbing out and letting it run in the background for a few minutes, then come back and see how the number is still an accurate representation, given the elapsed time.

![image-20211102202718127](https://i.imgur.com/w1Unqcp.png)

## Where to go from here?

As a next step, you may want to explore the idea of splitting out your `update` method into separate, specific behaviors, then running some of them in a Web Worker.

If you're drawing your game with the HTML5 Canvas API, then you may want to look into doing your *rendering* in a Web Worker via the OffscreenCanvas API.

## I don't agree with this. It's too complex.

I agree. It is. The complexity gives you a benefit though - this game loop structure can be used for games in almost *any* genre, and it's really easy to build layers on top of it that help you to re-use code and make things more maintainable. Once you understand the fundamentals of how it works, you can carry that knowledge with you to other places, and even other game engines, possibly even in other languages (`requestAnimationFrame` is just a side-effect of JavaScript being single-threaded - other languages can use a regular ol' `while (!running)` loop for games - other than that, every concept is pretty much the same).

That being said, there's no harm in keeping things simple and just using a generic `requestAnimationFrame` for rendering and 1 or more `setInterval` functions for updating game logic.
