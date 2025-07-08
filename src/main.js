const tubes = [{},{}]; // Make tubes global so renderAllEyes can access it
const tubeBorderWidth = 2; // Also Chrome/Firefox button default border width
const eyeGap = 1;
const eyeSize = 28;
const tubeSize = 32;
const tubeGap = 16;
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

const startGame = () => {
  const eyeTypeIndex = Math.random() * eyeTypes.length | 0;
  gameStarted = false;

  // eyeIndex is unused but having them helps with compression
  tubes.forEach((tubeObject, tubeIndex) => {
    tubeObject.eyes?.forEach((eyeElement, eyeIndex) => {
      eyeElement.remove(); // Remove all eyes from DOM
    });
    tubeObject.tubeElement?.remove();
    // Create new eyes for this tube (including for previously empty tube)
    tubeObject.eyes = [
      createEye((eyeTypeIndex + tubeIndex) % 5),
      createEye((eyeTypeIndex + tubeIndex) % 5),
      createEye((eyeTypeIndex + tubeIndex) % 5),
      createEye((eyeTypeIndex + tubeIndex) % 5),
    ];
  });

  // Add an empty tube
  tubes.push({
    eyes: []
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
    tubeElement.style.padding = '0';
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
        tubes.every((tube, tubeIndex) =>
          tube.eyes.every((eye, eyeIndex) =>
            // Remove ? after [3] to save 1 byte but introduce console error
            tube.eyes[3]?.style.background === tube.eyes[eyeIndex].style.background
          )
        )
      ) {
        setTimeout(startGame, 1000);
      }
    };

    // Store the tube element in the tube object
    tubeObject.tubeElement = tubeElement;
    renderAllEyes();
    b.append(tubeElement);
  });

  // Shuffle by clicking random tubes 1000+ times keeping going if there's a floating eye
  // The ugly loop reverseness with no afterthought helps with compression
  for (let shuffle = 1000 * tubes.length; --shuffle > 0 || floatingEye;) {
    tubes[Math.random() * tubes.length | 0].clickHandler();
  }

  gameStarted = true;
}

// Set body background to dark purply blue
b.style.background = '#237';

startGame();
