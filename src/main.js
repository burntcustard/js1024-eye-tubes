let levelNumber = 1;
let tubes; // Make tubes global so renderAllEyes can access it
let floatingEye;
let tubeBorderWidth = 3;
let eyeSize = 32;
let testTubeGap = 16;
let gameStarted;

const eyeTypes = [
  // human
  '#fee',
  'radial-gradient(#111 40%,#37f 0)',
  'scale(.6,.6)translate(0,0)',
  // feline
  '#0e4',
  '#000',
  'scale(0.3,.7)translate(0,0)',
  // reptile
  '#fa0',
  '#000',
  'scale(.1,.4)translate(0,0)',
  // owl
  '#fd0',
  '#000',
  'scale(.4,.4)translate(0,0)',
  // spider
  '#000',
  '#eee',
  `scale(.2,.1)translate(0,-${(eyeSize + tubeBorderWidth * 2) * 2}px)`
];

const createEye = (eyeTypeIndex) => {
  const outerEye = document.createElement('div');
  const innerEye = document.createElement('div');
  outerEye.style.position = 'absolute';
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
      const yPos = eyeSize - eyePosition * eyeSize;
      const xPos = (tubes.length / 2 - tubeIndex - 0.5) * (eyeSize + tubeBorderWidth * 2 + testTubeGap) + eyeSize / 2;
      eyeElement.style.left = `calc(50% - ${xPos}px)`;
      eyeElement.style.top = `calc(50% + ${yPos}px)`;
    });
  });
}

const startGame = () => {
  let eyeTypeIndex = ~~(Math.random() * 5);
  gameStarted = false;
  tubes = [];

  for (let i = 0; i < levelNumber + 1; i++) {
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

  // Set body background to black
  b.style.background = '#237';

  // Add ALL tubes to DOM second (so they render on top of eyes)
  tubes.forEach((tube, tubeIndex) => {
    // Create tube container for visual border
    const tubeElement = document.createElement('button');
    const yPos = 2 * eyeSize + tubeBorderWidth;
    const xPos = (tubes.length / 2 - tubeIndex - 0.5) * (eyeSize + tubeBorderWidth * 2 + testTubeGap) + (eyeSize + tubeBorderWidth * 2) / 2;
    tubeElement.style.left = `calc(50% - ${xPos}px)`;
    tubeElement.style.top = `calc(50% - ${yPos}px)`;
    tubeElement.style.border = `${tubeBorderWidth}px solid #fff`;
    tubeElement.style.borderTop = '0';
    tubeElement.style.borderRadius = `0 0 ${eyeSize}px ${eyeSize}px`;
    tubeElement.style.background = '#fff1';
    tubeElement.style.padding = '0';
    tubeElement.style.width = `${eyeSize + tubeBorderWidth * 2}px`;
    tubeElement.style.height = `${4 * eyeSize + tubeBorderWidth * 2}px`;
    tubeElement.style.position = 'absolute';

    // Add click handler to move top eye
    tubeElement.onclick = () => {
      if (floatingEye) {
        // There's a floating eye - place it in this tube if it has space
        if (tube.eyes.length < 4) {
          const originalTubeIndex = floatingEye.originalTubeIndex;

          // Position horizontally above the new tube first
          const xPos = (tubes.length / 2 - tubeIndex - 0.5) * (eyeSize + tubeBorderWidth * 2 + testTubeGap) + eyeSize / 2;
          floatingEye.style.left = `calc(50% - ${xPos}px)`;
          tube.eyes.push(floatingEye);
          floatingEye = 0; // Clear the floating eye

          // Use setTimeout for the drop animation
          setTimeout(renderAllEyes, originalTubeIndex == tubeIndex ? 0 : 200);
        }
      } else if (tube.eyes.length > 0) {
        floatingEye = tube.eyes.pop();
        floatingEye.style.top = `calc(50% - ${4 * eyeSize}px)`;
        floatingEye.originalTubeIndex = tubeIndex;
      }

      if (gameStarted && tubes.every(tube => tube.eyes.every(eye => tube.eyes[3]?.style?.background === eye.style?.background))) {
        setTimeout(() => {
          levelNumber++;
          tubes.forEach(tube => {
            tube.eyes.forEach(eye => {
              eye.remove(); // Remove all eyes from DOM
            });
            tube.tubeElement.remove(); // Clear eyes array
          });
          startGame();
        }, 1000);
      }
    };

    // Store the tube element in the tube object
    tube.tubeElement = tubeElement;
    renderAllEyes();
    b.append(tubeElement);
  });

  // Shuffle by simulating tube clicks
  for (let shuffle = 0; shuffle < tubes.length * 100 || floatingEye; shuffle++) {
    // Click a random tube button
    const randomTubeIndex = ~~(Math.random() * tubes.length);
    // console.log('clicking tube', tubes[randomTubeIndex]);
    tubes[randomTubeIndex].tubeElement.click();
  }

  gameStarted = true;
}

startGame();
