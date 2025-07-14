const tubes = [{},{},{}]; // Make tubes global so renderAllEyes can access it
const tubeBorderWidth = 2;
const eyeGap = 1;
const eyeSize = 28;
const tubeSize = 32;
const tubeGap = 16;
let timeout;
let timeRemaining = 0;
let floatingEye;
let floatingEyeOriginalTubeIndex;
let gameStarted;

// Radial gradients are mostly:
// optional(x-stretch y-stretch), center-color center-size, outer-color outer-size
// ... but some might have 3 layers.
const eyeTypes = [
  // Human
  `#000 25%, #37f 30% 45%, #fee 50%`,
  // Feline (green)
  `25% 65%, #000 50%, #1e3 60%`,
  // Reptile (orange)
  `32% 15%, #000 50%, #fa0 60%`,
  // Owl (yellow)
  `#000 25%, #fe0 30%`,
  // Spider (black)
  `22% 10% at 50% 24%, #eee 40%, #000 50%`,
];

// Which eye is the first eye to be added to the tubes
const eyeTypeIndex = eyeTypes.length * Math.random() | 0;
// We could non-randomise the eye you start with to save 8B:
// const eyeTypeIndex = 0;

const createEye = (eyeTypeIndex) => {
  // Create new eye using <b> because it's only 1 char & starts the same as <button>
  const eyeElement = document.createElement('b');

  // position: absolute makes more sense but fixed is fewer characters
  eyeElement.style.position = 'fixed';

  // Could be height = width = exSize but that compresses worse
  eyeElement.style.height = `${eyeSize}px`;
  eyeElement.style.width = `${eyeSize}px`;

  // 50% makes sense but compresses worse
  eyeElement.style.borderRadius = `${eyeSize}px`;

  // Animation timing for eye moving up/across/down (although .05s skipped via setTimeout)
  eyeElement.style.transition = 'all.2s';

  // No closing bracket is needed at end of radial-gradient, it's removed in build.js saves 2B
  // Having the wrapping of the eyeTypeIndex back to 0 in createEye() saves 2B
  eyeElement.style.background = `radial-gradient(${eyeTypes[eyeTypeIndex % eyeTypes.length]})`;

  // Immediately append eye to document body
  b.append(eyeElement);

  // Return the eye element which then gets added to the tube
  return eyeElement;
}

const renderAllEyes = () => {
  tubes.forEach((tubeObject, tubeIndex) => {
    // Optional chaning ?. shouldn't be needed here because eyes are always
    // defined, however it saves 4B because all .eyes are suffixed with `?`
    // ... or maybe not. Removed to save 1B.
    tubeObject.eyes.forEach((eyeElement, eyeIndex) => {
      eyeElement.style.left =
        `calc(50% - ${(tubes.length / 2 - tubeIndex - 0.5) * (tubeSize + tubeBorderWidth + tubeGap) + eyeSize / 2}px)`;
      // calc(50% **+** made more sense but it was the only instance
      eyeElement.style.top =
        `calc(50% - ${(eyeSize + eyeGap) * eyeIndex - (tubeBorderWidth + eyeSize + tubeSize - eyeSize)}px)`;
    });
  });
}

const timerElement = document.createElement('b');
timerElement.style.position = 'fixed';
timerElement.style.height = `${tubeBorderWidth}px`;

// - - for better compression
timerElement.style.top = `calc(50% - -100px)`;
timerElement.style.background = '#fff';
timerElement.style.transition = 'all.2s';
b.append(timerElement);

const decrement = () => {
  // If the timeRemaining, after decrementing it, is truthy (> 0)
  if (timeRemaining--) {
    // Schedule the next decrement
    timerElement.style.width = `${timeRemaining / 3}px`;
    timerElement.style.left = `calc(50% - ${timeRemaining / 6}px)`;
    timeout = setTimeout(decrement, 100);
  // If the time remaining is falsey (exactly 0), restart the game (the level)
  } else {
    // Clear the timer from the previous level
    // Moving this to happen on startGame() (every level start) saved 2B
    // clearTimeout(timeout);
    startGame();
  }
}

const startGame = () => {
  // The game starts off as not started so perfect order when shuffling doesn't win
  gameStarted = false;

  // Clear the timer from the previous level
  clearTimeout(timeout);

  // Every time a level starts, add 30s to the timer (good if you have leftover time)
  // It's 30s because we * 100ms because the decrement is every 100ms
  timeRemaining += 300;

  // Clear old DOM elements and create and add new eyes (so they render under tubes)
  tubes.forEach((tubeObject, tubeIndex) => {
    // Remove the old eyes from the DOM if there were any
    // Usually its good to have both eyeElement and eyeIndex but it save 1B not having i here
    tubeObject.eyes?.forEach((eyeElement) => {
      // Optional chaining is not needed because eyeElement is always defined (we're looping
      // through them!) but it saves ~1B because .remove is always prefixed with '?'
      eyeElement?.remove();
    });

    // Remove the old tube element from DOM
    tubeObject.tubeElement?.remove();

    // Create and add the new eyes to tubes other than the 1st (its initially empty)
    tubeObject.eyes = tubeIndex ? [
      createEye(eyeTypeIndex + tubeIndex),
      createEye(eyeTypeIndex + tubeIndex),
      createEye(eyeTypeIndex + tubeIndex),
      createEye(eyeTypeIndex + tubeIndex),
    ] : [];
  })

  // Add ALL tubes to DOM second (so they render on top of eyes)
  tubes.forEach((tubeObject, tubeIndex) => {
    // Create tube container for visual border
    // and store the tube element in the tube object
    const tubeElement = tubeObject.tubeElement = document.createElement('button');
    tubeElement.style.left = `calc(50% - ${(tubes.length / 2 - tubeIndex - 0.5) * (tubeSize + tubeBorderWidth + tubeGap) + (tubeSize + tubeBorderWidth * 2) / 2}px)`;
    tubeElement.style.top = `calc(50% - ${(eyeSize + eyeGap) * 2}px)`;
    // Chrome/Firefox use 3px/medium by default for button border
    // Specific border value order with spaces chosen for best compression
    tubeElement.style.border = `#fff solid ${tubeBorderWidth}px`;
    tubeElement.style.borderTop = 0;
    tubeElement.style.borderRadius = `0 0 ${tubeSize}px ${tubeSize}px`;
    tubeElement.style.background = '#fff1';
    tubeElement.style.position = 'fixed';
    tubeElement.style.height = `${4 * (eyeSize + eyeGap) + tubeSize - eyeSize + tubeBorderWidth * 2}px`;
    tubeElement.style.width = `${tubeSize + tubeBorderWidth * 2}px`;

    tubeObject.clickHandler = tubeElement.onclick = () => {
      if (floatingEye) {
        // There's a floating eye - place it in this tube if it has space
        if (tubeObject.eyes.length < 4) {
          // const originalTubeIndex = floatingEye.originalTubeIndex;

          // Position horizontally above the new tube first
          floatingEye.style.left = `calc(50% - ${(tubes.length / 2 - tubeIndex - 0.5) * (tubeSize + tubeBorderWidth + tubeGap) + eyeSize / 2}px)`;
          tubeObject.eyes.push(floatingEye);
          floatingEye = 0; // Clear the floating eye

          // Use setTimeout for the drop animation
          // Originally we checked for originalTubeIndex to not have a delay
          // when putting an eye back into the previous tube, but it wasn't
          // worth the ~30 B.
          setTimeout(renderAllEyes, floatingEyeOriginalTubeIndex === tubeIndex ? 0 : 150);
          // setTimeout(renderAllEyes, 150);
        }
      } else if (tubeObject.eyes.length > 0) {
        floatingEye = tubeObject.eyes.pop();
        floatingEye.style.top = `calc(50% - ${4 * eyeSize + tubeBorderWidth * 2}px)`;
        floatingEyeOriginalTubeIndex = tubeIndex;
      }

      if (
        // bitwise AND `&` works here because we only care about truthiness
        gameStarted &
        tubes.every((tubeObject) =>
          tubeObject.eyes.every((eyeElement) =>
            tubeObject.eyes[3]?.style.background === eyeElement.style.background
          )
        )
      ) {
        clearTimeout(timeout);
        setTimeout(() => {
          tubes.push({});
          startGame();
        }, 1000);
      }
    };

    b.append(tubeElement);
  });

  renderAllEyes();

  // Shuffle by clicking random tubes, a lot, keeping going if there's a floating eye
  // The ugly loop reverseness with no afterthought helps with compression
  // Ideally would be 1000 * tubes.length but that costs a few bytes
  for (let shuffle = 3000; floatingEye || shuffle--;) {
    tubes[tubes.length * Math.random() | 0].clickHandler();
  }

  gameStarted = true;

  // Start ticking down the timer
  decrement();
}

// Set body background to dark purply blue
b.style.background = '#237';

startGame();
