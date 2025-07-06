let levelNumber = 0;
let tubes = []; // Make tubes global so renderAllEyes can access it
let floatingEye;
let tubeBorderWidth = 3; // Also Chrome/Firefox button default border width
let eyeSize = 32;
let testTubeGap = 16;
let gameStarted;

const eyeTypes = [
  // human
  '#fee',
  'radial-gradient(#111 40%,#37f 0)',
  'scale(.6,.6)',
  // feline
  '#1e3',
  '#000',
  'scale(.3,.7)',
  // reptile
  '#fa0',
  '#000',
  'scale(.1,.4)',
  // owl
  '#fe0',
  '#000',
  'scale(.4,.4)',
  // spider
  '#000',
  '#eee',
  `scale(.2,.1)translatey(-${(eyeSize + tubeBorderWidth * 2) * 2}px)`
];

const createEye = (eyeTypeIndex) => {
  const outerEye = document.createElement('div');
  const innerEye = document.createElement('div');
  // position absolute makes more sense but fixed is fewer characters
  outerEye.style.position = 'fixed';
  outerEye.style.width = innerEye.style.width = `${eyeSize}px`;
  outerEye.style.height = innerEye.style.height = `${eyeSize}px`;
  outerEye.style.borderRadius = innerEye.style.borderRadius = `${eyeSize}px`;
  outerEye.style.transition = 'all.2s';
  outerEye.style.background = eyeTypes[eyeTypeIndex * 3];
  innerEye.style.background = eyeTypes[eyeTypeIndex * 3 + 1];
  innerEye.style.transform = eyeTypes[eyeTypeIndex * 3 + 2];
  outerEye.append(innerEye);
  b.append(outerEye); // Immediately append eye to body
  return outerEye;
}

const renderAllEyes = () => {
  tubes.forEach((tube, tubeIndex) => {
    tube.eyes.forEach((eyeElement, eyePosition) => {
      eyeElement.style.left =
        `calc(50% - ${(tubes.length / 2 - tubeIndex - 0.5) * (eyeSize + tubeBorderWidth * 2 + testTubeGap) + eyeSize / 2}px)`;
      eyeElement.style.top =
        `calc(50% + ${eyeSize - eyePosition * eyeSize}px)`;
    });
  });
}

const startGame = () => {
  let eyeTypeIndex = Math.random() * eyeTypes.length | 0;
  tubes.forEach(tube => {
    tube.eyes.forEach(eye => {
      eye.remove(); // Remove all eyes from DOM
    });
    tube.tubeElement.remove(); // Clear eyes array
  });
  levelNumber++;
  gameStarted = false;
  tubes = [];

  for (let i = levelNumber + 1; i--;) {
    tubes.push({
      eyes: [
        createEye((eyeTypeIndex + i) % 5),
        createEye((eyeTypeIndex + i) % 5),
        createEye((eyeTypeIndex + i) % 5),
        createEye((eyeTypeIndex + i) % 5),
      ]
    });
  }

  // Add an empty tube
  tubes.push({
    eyes: []
  });

  // Add ALL tubes to DOM second (so they render on top of eyes)
  tubes.forEach((tube, tubeIndex) => {
    // Create tube container for visual border
    const tubeElement = document.createElement('button');
    tubeElement.style.left = `calc(50% - ${(tubes.length / 2 - tubeIndex - 0.5) * (eyeSize + tubeBorderWidth * 2 + testTubeGap) + (eyeSize + tubeBorderWidth * 2) / 2}px)`;
    tubeElement.style.top = `calc(50% - ${2 * eyeSize + tubeBorderWidth}px)`;
    // Chrome/Firefox use 3px/medium by default for button border
    tubeElement.style.border = `solid#fff`;
    tubeElement.style.borderTop = '0';
    tubeElement.style.borderRadius = `0 0 ${eyeSize}px ${eyeSize}px`;
    tubeElement.style.background = '#fff1';
    tubeElement.style.padding = '0';
    tubeElement.style.width = `${eyeSize + tubeBorderWidth * 2}px`;
    tubeElement.style.height = `${4 * eyeSize + tubeBorderWidth * 2}px`;
    tubeElement.style.position = 'fixed';

    // Add click handler to move top eye
    tubeElement.onclick = () => {
      if (floatingEye) {
        // There's a floating eye - place it in this tube if it has space
        if (tube.eyes.length < 4) {
          // const originalTubeIndex = floatingEye.originalTubeIndex;

          // Position horizontally above the new tube first
          floatingEye.style.left = `calc(50% - ${(tubes.length / 2 - tubeIndex - 0.5) * (eyeSize + tubeBorderWidth * 2 + testTubeGap) + eyeSize / 2}px)`;
          tube.eyes.push(floatingEye);
          floatingEye = 0; // Clear the floating eye

          // Use setTimeout for the drop animation
          // Originally we checked for originalTubeIndex to not have a delay
          // when putting an eye back into the previous tube, but it wasn't
          // worth the ~30 B.
          // setTimeout(renderAllEyes, originalTubeIndex === tubeIndex ? 0 : 200);
          setTimeout(renderAllEyes, 100);
        }
      } else if (tube.eyes.length > 0) {
        floatingEye = tube.eyes.pop();
        floatingEye.style.top = `calc(50% - ${4 * eyeSize}px)`;
        floatingEye.originalTubeIndex = tubeIndex;
      }

      if (
        // bitwise AND `&` works here because we only care about truthiness
        gameStarted &
        // tubeIndex and eye are unused but help with compression
        tubes.every((tube, tubeIndex) =>
          tube.eyes.every((eye, eyeIndex) =>
            // Put a ? after [3] to prevent console errors for 1 byte
            tube.eyes[3].style.background === tube.eyes[eyeIndex].style.background
          )
        )
      ) {
        setTimeout(startGame, 1000);
      }
    };

    // Store the tube element in the tube object
    tube.tubeElement = tubeElement;
    renderAllEyes();
    b.append(tubeElement);
  });

  // Shuffle by clicking random tubes 200 times. Try 1e3 if not random enough?
  for (let shuffle = 0; shuffle < 200 || floatingEye; shuffle++) {
    tubes[Math.random() * tubes.length | 0].tubeElement.click();
  }

  gameStarted = true;
}

// Set body background to dark purply blue
b.style.background = '#237';

startGame();
