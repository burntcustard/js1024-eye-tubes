const tubes = [{},{},{}]; // Make tubes global so renderAllEyes can access it
const tubeBorderWidth = 2; // Also Chrome/Firefox button default border width
const eyeGap = 1;
const eyeSize = 28;
const tubeSize = 32;
const tubeGap = 16;
const numOfEyeTypes = 5;
let timeout;
let timeRemaining = 0;
let floatingEye;
let floatingEyeOriginalTubeIndex;
let gameStarted;

// Radial gradients are mostly:
// optional(x-stretch y-stretch), center-color center-size, outer-color outer-size
// ... but some might have 3 layers.
const eyeTypes = [
  // human
  `radial-gradient(#000 25%, #37f 30% 45%, #fee 50%)`,
  // feline
  `radial-gradient(25% 65%, #000 50%, #1e3 60%`,
  // reptile
  `radial-gradient(32% 15%, #000 50%, #fa0 60%)`,
  // owl
  `radial-gradient(#000 25%, #fe0 30%)`,
  // spider
  `radial-gradient(22% 10% at 50% 24%, #eee 40%, #000 50%)`,
];

const createEye = (eyeTypeIndex) => {
  const eye = document.createElement('div');
  // position absolute makes more sense but fixed is fewer characters
  eye.style.position = 'fixed';
  eye.style.width = `${eyeSize}px`;
  eye.style.height = `${eyeSize}px`;
  eye.style.borderRadius = `${eyeSize}px`;
  eye.style.transition = 'all.2s';
  eye.style.background = eyeTypes[eyeTypeIndex];
  b.append(eye); // Immediately append eye to body
  return eye;
}

const renderAllEyes = () => {
  tubes.forEach((tubeObject, tubeIndex) => {
    tubeObject.eyes.forEach((eyeElement, eyeIndex) => {
      eyeElement.style.left =
        `calc(50% - ${(tubes.length / 2 - tubeIndex - 0.5) * (tubeSize + tubeBorderWidth + tubeGap) + eyeSize / 2}px)`;
      // calc(50% **+** made more sense but it was the only instance
      eyeElement.style.top =
        `calc(50% - ${-(tubeBorderWidth + eyeSize + tubeSize - eyeSize - eyeIndex * (eyeSize + eyeGap))}px)`;
    });
  });
}

const timerElement = document.createElement('div');
timerElement.style.position = 'fixed';
timerElement.style.height = `${tubeBorderWidth}px`;
timerElement.style.top = 'calc(50% - -100px)';
timerElement.style.background = '#fff';
timerElement.style.transition = 'all.2s';
b.append(timerElement);

const decrement = () => {
  // Decrement the time remaining by 200ms
  // If the time remaining is less than or equal to 0, stop the game
  timeRemaining -= 100;


  if (timeRemaining < 0) {
    // Clear the timer from the previous level
    // Moving this to happen on startGame() (every level start) saved 2B
    // clearTimeout(timeout);
    startGame();
  } else {
    // Schedule the next decrement
    timerElement.style.width = `${timeRemaining / 300}px`;
    timerElement.style.left = `calc(50% - ${timeRemaining / 600}px)`;
    timeout = setTimeout(decrement, 100);
  }
}

const startGame = () => {
  // Which eye is the first eye to be added to the tubes
  const eyeTypeIndex = Math.random() * eyeTypes.length | 0;

  // The game starts off as not started so perfect order when shuffling doesn't win
  gameStarted = false;

  // Clear the timer from the previous level
  clearTimeout(timeout);

  // Every time a level starts, add 30s to the timer (good if you have leftover time)
  timeRemaining += 30000;

  // Remove all old tubes and eyes from DOM
  tubes.forEach((tubeObject, tubeIndex) => {
    // Usually its good to have both eyeElement and eyeIndex but it save 1B not having i here
    tubeObject.eyes?.forEach((eyeElement) => {
      // Optional chaining is not needed because eyeElement is always defined (we're looping
      // through them!) but it saves 2B because .remove is always prefixed with '?'
      eyeElement?.remove();
    });
    tubeObject.tubeElement?.remove();
  });

  tubes.forEach((tubeObject, tubeIndex) => {
    tubeObject.eyes = (tubeIndex < tubes.length - 1) ? [
      createEye((eyeTypeIndex + tubeIndex) % numOfEyeTypes),
      createEye((eyeTypeIndex + tubeIndex) % numOfEyeTypes),
      createEye((eyeTypeIndex + tubeIndex) % numOfEyeTypes),
      createEye((eyeTypeIndex + tubeIndex) % numOfEyeTypes),
    ] : [];
  });

  // Add ALL tubes to DOM second (so they render on top of eyes)
  tubes.forEach((tubeObject, tubeIndex) => {
    // Create tube container for visual border
    const tubeElement = document.createElement('button');
    tubeElement.style.left = `calc(50% - ${(tubes.length / 2 - tubeIndex - 0.5) * (tubeSize + tubeBorderWidth + tubeGap) + (tubeSize + tubeBorderWidth * 2) / 2}px)`;
    tubeElement.style.top = `calc(50% - ${(eyeSize + eyeGap) * 2}px)`;
    // Chrome/Firefox use 3px/medium by default for button border
    tubeElement.style.border = `${tubeBorderWidth}px solid#fff`;
    tubeElement.style.borderTop = '0';
    tubeElement.style.borderRadius = `0 0 ${tubeSize}px ${tubeSize}px`;
    tubeElement.style.background = '#fff1';
    tubeElement.style.width = `${tubeSize + tubeBorderWidth * 2}px`;
    tubeElement.style.height = `${4 * (eyeSize + eyeGap) + tubeSize - eyeSize + tubeBorderWidth * 2}px`;
    tubeElement.style.position = 'fixed';

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
        // tubeIndex and eye are unused but help with compression
        tubes.every((tubeObject, tubeIndex) =>
          tubeObject.eyes.every((eyeElement, eyeIndex) =>
            // Remove ? after [3] to save 1 byte but introduce console error
            tubeObject.eyes[3]?.style.background === tubeObject.eyes[eyeIndex].style.background
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

    // Store the tube element in the tube object
    tubeObject.tubeElement = tubeElement;
    renderAllEyes();
    b.append(tubeElement);
  });

  // Shuffle by clicking random tubes 1000+ times keeping going if there's a floating eye
  // The ugly loop reverseness with no afterthought helps with compression
  for (let shuffle = 0; floatingEye || 1000 * tubes.length > shuffle++;) {
    tubes[Math.random() * tubes.length | 0].clickHandler();
  }

  gameStarted = true;

  // Start ticking down the timer
  decrement();
}

// Set body background to dark purply blue
b.style.background = '#237';

startGame();
