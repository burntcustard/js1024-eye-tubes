let levelNumber = 1;
let tubes; // Make tubes global so renderAllEyes can access it
let floatingEye;
let tubeBorderWidth = 3;
let eyeSize = 32;
let testTubeGap = 16;
let testTubeThickness = eyeSize + tubeBorderWidth * 2;

const eyeTypes = [
  // human
  [
    '#fee',
    'radial-gradient(#111 0 40%, #37f 0)',
    'scale(.6,.6) translate(0,0)'
  ],
  // feline
  [
    '#0e4',
    '#000',
    'scale(0.3,.7) translate(0,0)'
  ],
  // reptile
  [
    '#fa0',
    '#000',
    'scale(0.1,.4) translate(0,0)'
  ],
  // owl
  [
    '#fd0',
    '#000',
    'scale(.4,.4) translate(0,0)'
  ],
  // spider
  [
    '#000',
    '#eee',
    `scale(.2,.1) translate(0,-${testTubeThickness * 2}px)`
  ],
];

const createEye = (eyeTypeIndex) => {
  const outerEye = document.createElement('div');
  const innerEye = document.createElement('div');
  outerEye.style.position = 'absolute';
  outerEye.style.width = innerEye.style.width = `${eyeSize}px`;
  outerEye.style.height = innerEye.style.height = `${eyeSize}px`;
  outerEye.style.borderRadius = innerEye.style.borderRadius = `${eyeSize}px`;
  outerEye.style.transition = 'all.2s';
  outerEye.style.background = eyeTypes[eyeTypeIndex][0];
  innerEye.style.background = eyeTypes[eyeTypeIndex][1];
  innerEye.style.transform = eyeTypes[eyeTypeIndex][2];
  outerEye.append(innerEye);
  b.append(outerEye); // Immediately append eye to body
  return outerEye;
}

const renderAllEyes = () => {
  tubes.forEach((tube, tubeIndex) => {
    const totalWidth = tubes.length * testTubeThickness + (tubes.length - 1) * testTubeGap;
    const startOffset = totalWidth / 2;
    const tubeOffsetX = tubeIndex * (testTubeThickness + testTubeGap);
    const xPos = startOffset - tubeOffsetX + eyeSize / 2;

    tube.eyes.forEach((eyeElement, eyePosition) => {
      const yPos = eyeSize - eyePosition * eyeSize;
      eyeElement.style.left = `calc(50% - ${xPos}px)`;
      eyeElement.style.top = `calc(50% + ${yPos}px)`;
    });
  });
}

const startGame = () => {
  // let floatingEye = 0;
  tubes = []; // Reset the global tubes array
  // floatingEye = null; // Reset floating eye
  let lastEyeTypeIndex = -1;

  // Create tube objects with eyes arrays
  for (let i = 0; i < levelNumber + 1; i++) {
    // Using ~~ instead of Math.floor to save bytes
    let eyeTypeIndex = ~~(Math.random() * eyeTypes.length);

    // If same as last, just pick the next one (wrapping around if needed)
    if (eyeTypeIndex === lastEyeTypeIndex) {
      eyeTypeIndex = (eyeTypeIndex + 1) % eyeTypes.length;
    }

    tubes.push({
      eyes: [
        createEye(eyeTypeIndex),
        createEye(eyeTypeIndex),
        createEye(eyeTypeIndex),
        createEye(eyeTypeIndex)
      ]
    });

    lastEyeTypeIndex = eyeTypeIndex;
  }

  // Add an empty tube
  tubes.push({
    eyes: []
  });

  // Set body background to black
  b.style.background = '#237';

  renderAllEyes();

  // Add ALL tubes to DOM second (so they render on top of eyes)
  tubes.forEach((tube, tubeIndex) => {
    // Calculate X position for this tube
    const totalWidth = tubes.length * testTubeThickness + (tubes.length - 1) * testTubeGap;
    const startOffset = totalWidth / 2;
    const tubeOffsetX = tubeIndex * (testTubeThickness + testTubeGap);
    const xPos = startOffset - tubeOffsetX;
    const yPos = 0;

    // Create tube container for visual border
    const tubeElement = document.createElement('button');
    tubeElement.style.position = 'absolute';
    tubeElement.style.left = `calc(50% - ${xPos + testTubeThickness/2}px)`;
    tubeElement.style.top = `calc(50% + ${yPos - (4 * eyeSize + tubeBorderWidth * 2)/2}px)`;
    tubeElement.style.border = `${tubeBorderWidth}px solid #fff`;
    tubeElement.style.borderTop = '0';
    tubeElement.style.borderRadius = `0 0 ${eyeSize}px ${eyeSize}px`;
    tubeElement.style.background = '#fff1';
    tubeElement.style.padding = '0';
    tubeElement.style.width = `${testTubeThickness}px`;
    tubeElement.style.height = `${4 * eyeSize + tubeBorderWidth * 2}px`;

    // Add click handler to move top eye
    tubeElement.onclick = () => {
      if (floatingEye) {
        // There's a floating eye - place it in this tube if it has space
        if (tube.eyes.length < 4) {
          const originalTubeIndex = floatingEye.originalTubeIndex;

          // Position horizontally above the new tube first
          const totalWidth = tubes.length * testTubeThickness + (tubes.length - 1) * testTubeGap;
          const startOffset = totalWidth / 2;
          const tubeOffsetX = tubeIndex * (testTubeThickness + testTubeGap);
          const targetXPos = startOffset - tubeOffsetX;
          floatingEye.style.left = `calc(50% - ${targetXPos + eyeSize/2}px)`;
          tube.eyes.push(floatingEye);
          floatingEye = 0; // Clear the floating eye

          // Use setTimeout for the drop animation
          setTimeout(renderAllEyes, originalTubeIndex == tubeIndex ? 0 : 200);
        }
      } else if (tube.eyes.length > 0) {
        const topEyeElement = tube.eyes.pop();

        topEyeElement.style.top = `calc(50% - ${4 * eyeSize}px)`;
        topEyeElement.originalTubeIndex = tubeIndex;

        floatingEye = topEyeElement;
      }
    };

    // Store the tube element in the tube object
    tube.tubeElement = tubeElement;
    b.append(tubeElement);
  });

  // Shuffle by simulating tube clicks
  for (let shuffle = 0; shuffle < tubes.length * tubes.length * 10 || floatingEye; shuffle++) {
    // Click a random tube button
    const randomTubeIndex = ~~(Math.random() * tubes.length);
    // console.log('clicking tube', tubes[randomTubeIndex]);
    tubes[randomTubeIndex].tubeElement.click();
  }

  // Final render to ensure all eyes are positioned correctly
  renderAllEyes();

  // console.log('floatingEye:', floatingEye);
}

startGame();
