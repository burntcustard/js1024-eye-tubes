const tubes = [{},{}]; // Make tubes global so renderAllEyes can access it
const tubeBorderWidth = 2; // Also Chrome/Firefox button default border width
const eyeGap = 1;
const eyeSize = 28;
const tubeSize = 32;
const tubeGap = 16;
let floatingEye;
let gameStarted;

const eyeTypes = [
  // human
  '#fee',
  'radial-gradient(#111 40%,#37f 0)',
  'scale(.6)',
  // feline
  '#1e3',
  '#000',
  'scale(.3,.7)',
  // reptile
  '#fa0',
  '#000',
  'scale(.4,.1)',
  // owl
  '#fe0',
  '#000',
  'scale(.4)',
  // spider
  '#000',
  '#eee',
  // Translate is by a really weird number but it compresses well
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
  tubes.forEach((tubeObject, tubeIndex) => {
    tubeObject.eyes.forEach((eyeElement, eyeIndex) => {
      eyeElement.style.left =
        `calc(50% - ${(tubes.length / 2 - tubeIndex - 0.5) * (tubeSize + tubeBorderWidth * 2 + tubeGap) + eyeSize / 2}px)`;
      eyeElement.style.top =
        `calc(50% + ${tubeBorderWidth + eyeSize + tubeSize - eyeSize - eyeIndex * (eyeSize + eyeGap)}px)`;
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
    tubeElement.style.left = `calc(50% - ${(tubes.length / 2 - tubeIndex - 0.5) * (tubeSize + tubeBorderWidth * 2 + tubeGap) + (tubeSize + tubeBorderWidth * 2) / 2}px)`;
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
          floatingEye.style.left = `calc(50% - ${(tubes.length / 2 - tubeIndex - 0.5) * (tubeSize + tubeBorderWidth * 2 + tubeGap) + eyeSize / 2}px)`;
          tubeObject.eyes.push(floatingEye);
          floatingEye = 0; // Clear the floating eye

          // Use setTimeout for the drop animation
          // Originally we checked for originalTubeIndex to not have a delay
          // when putting an eye back into the previous tube, but it wasn't
          // worth the ~30 B.
          // setTimeout(renderAllEyes, floatingEye.originalTubeIndex === tubeIndex ? 0 : 200);
          setTimeout(renderAllEyes, 150);
        }
      } else if (tubeObject.eyes.length > 0) {
        floatingEye = tubeObject.eyes.pop();
        floatingEye.style.top = `calc(50% - ${4 * eyeSize}px)`;
        // floatingEye.originalTubeIndex = tubeIndex;
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

  // Shuffle by clicking random tubes 200 times. Try 1e3 if not random enough?
  for (let shuffle = 0; shuffle < 1000 * tubes.length || floatingEye; shuffle++) {
    tubes[Math.random() * tubes.length | 0].clickHandler();
  }

  gameStarted = true;
}

// Set body background to dark purply blue
b.style.background = '#237';

startGame();
