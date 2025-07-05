let levelNumber = 1;
let tubes; // Make tubes global so renderAllEyes can access it
let floatingEye;
let floatingEyeTimeoutId; // Global timeout ID for floating eye animation
let tubeBorderWidth = 3;
let eyeSize = 32;
let testTubeGap = 16;
let testTubeThickness = eyeSize + tubeBorderWidth * 2;

const eyeTypes = {
  human: {
    outer: '#fee',
    inner: 'radial-gradient(#111 0 40%, #37f 0)',
    transform: 'scale(.6,.6) translate(0, 0px)',
  },
  feline: {
    outer: '#0e4',
    inner: '#000',
    transform: 'scale(0.3,.7) translate(0, 0px)',
  },
  reptile: {
    outer: '#fa0',
    inner: '#000',
    transform: 'scale(0.1,.4) translate(0, 0px)',
  },
  owl: {
    outer: '#fd0',
    inner: '#000',
    transform: 'scale(.4,.4) translate(0, 0px)',
  },
  spider: {
    outer: '#000',
    inner: '#eee',
    transform: 'scale(.2,.2) translate(0, -32px)'
  }
};

function createEye(type) {
  const outerEye = document.createElement('div');
  outerEye.style.width = `${eyeSize}px`;
  outerEye.style.height = `${eyeSize}px`;
  outerEye.style.borderRadius = `${eyeSize}px`;
  outerEye.style.transition = 'all 200ms';
  outerEye.style.background = eyeTypes[type].outer;

  const innerEye = document.createElement('div');
  innerEye.style.width = `${eyeSize}px`;
  innerEye.style.height = `${eyeSize}px`;
  innerEye.style.borderRadius = `${eyeSize}px`;
  innerEye.style.background = eyeTypes[type].inner;
  innerEye.style.transform = eyeTypes[type].transform;

  outerEye.append(innerEye);
  return outerEye;
}

function renderAllEyes() {
  tubes.forEach((tube, tubeIndex) => {
    const totalWidth = tubes.length * testTubeThickness + (tubes.length - 1) * testTubeGap;
    const startOffset = totalWidth / 2;
    const tubeOffsetX = tubeIndex * (testTubeThickness + testTubeGap);
    const xPos = startOffset - tubeOffsetX;

    tube.eyes.forEach((eyeElement, eyePosition) => {
      const yPos = (4 * eyeSize)/2 - eyeSize/2 - (eyePosition * eyeSize);
      eyeElement.style.left = `calc(50% - ${xPos + eyeSize/2}px)`;
      eyeElement.style.top = `calc(50% + ${yPos - eyeSize/2}px)`;
    });
  });
}

function startGame() {
  tubes = []; // Reset the global tubes array
  const eyeTypeNames = Object.keys(eyeTypes);
  let lastEyeTypeIndex = -1;

  // Create tube objects with eyes arrays
  for (let i = 0; i < levelNumber + 1; i++) {
    // Using ~~ instead of Math.floor to save bytes
    let eyeTypeIndex = ~~(Math.random() * eyeTypeNames.length);

    // If same as last, just pick the next one (wrapping around if needed)
    if (eyeTypeIndex === lastEyeTypeIndex) {
      eyeTypeIndex = (eyeTypeIndex + 1) % eyeTypeNames.length;
    }

    const eyeType = eyeTypeNames[eyeTypeIndex];
    tubes.push({
      tubeElement: null, // Will be set below
      eyes: [
        createEye(eyeType),
        createEye(eyeType),
        createEye(eyeType),
        createEye(eyeType)
      ]
    });

    lastEyeTypeIndex = eyeTypeIndex;
  }

  // Add an empty tube
  tubes.push({
    tubeElement: null,
    eyes: []
  });

  // Set body background to black
  b.style.background = '#237';

  // Create tube elements and position them
  tubes.forEach((tube, tubeIndex) => {
    // Calculate X position for this tube
    const totalWidth = tubes.length * testTubeThickness + (tubes.length - 1) * testTubeGap;
    const startOffset = totalWidth / 2;
    const tubeOffsetX = tubeIndex * (testTubeThickness + testTubeGap);
    const xPos = startOffset - tubeOffsetX;
    const yPos = 0;

    // Add eyes to the tube first (so they render underneath)
    tube.eyes.forEach((eyeElement, eyePosition) => {
      eyeElement.style.position = 'absolute';
      const eyeYPos = (4 * eyeSize)/2 - eyeSize/2 - (eyePosition * eyeSize);
      eyeElement.style.left = `calc(50% - ${xPos + eyeSize/2}px)`;
      eyeElement.style.top = `calc(50% + ${eyeYPos - eyeSize/2}px)`;

      b.append(eyeElement);
    });

    // Create tube container for visual border (after eyes)
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
      // Clear any pending timeout for this eye
      if (floatingEyeTimeoutId) {
        clearTimeout(floatingEyeTimeoutId);
        floatingEyeTimeoutId = null;
      }

      if (floatingEye) {
        // There's a floating eye - place it in this tube if it has space
        if (tube.eyes.length < 4) {
          const originalTubeIndex = floatingEye.originalTubeIndex;

          // Remove the floating eye from any tube it might be in (safety check)
          tubes.forEach(t => {
            const eyeIndex = t.eyes.indexOf(floatingEye);
            if (eyeIndex !== -1) {
              t.eyes.splice(eyeIndex, 1);
            }
          });

          // Add to new tube and mark as no longer floating
          tube.eyes.push(floatingEye);
          delete floatingEye.originalTubeIndex;

          // Recalculate position for the target tube
          const totalWidth = tubes.length * testTubeThickness + (tubes.length - 1) * testTubeGap;
          const startOffset = totalWidth / 2;
          const tubeOffsetX = tubeIndex * (testTubeThickness + testTubeGap);
          const targetXPos = startOffset - tubeOffsetX;

          // Position horizontally above the new tube first
          floatingEye.style.left = `calc(50% - ${targetXPos + eyeSize/2}px)`;
          floatingEye = null; // Clear the floating eye

          // Use setTimeout for the drop animation - renderAllEyes handles all positioning
          floatingEyeTimeoutId = setTimeout(() => {
            renderAllEyes();
          }, originalTubeIndex == tubeIndex ? 0 : 200);
        }
      } else if (tube.eyes.length > 0) {
        // No floating eye - move top eye up
        const topEyeElement = tube.eyes.pop();

        // Move it above the tubes by changing its top property
        topEyeElement.style.top = `calc(50% - ${4 * eyeSize + tubeBorderWidth * 2 + 50 + eyeSize/2}px)`;
        topEyeElement.originalTubeIndex = tubeIndex; // Store which tube it came from (indicates floating)

        floatingEye = topEyeElement; // Set the floating eye
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
    tubes[randomTubeIndex].tubeElement.click();
  }

  // Make sure no floating eyes are left after shuffling
  if (floatingEye) {
    // Find the first tube with space and place the floating eye there
    for (let i = 0; i < tubes.length; i++) {
      if (tubes[i].eyes.length < 4) {
        tubes[i].eyes.push(floatingEye);
        delete floatingEye.originalTubeIndex;
        floatingEye = null;
        break;
      }
    }
  }

  // Final render to ensure all eyes are positioned correctly
  renderAllEyes();
}

startGame();
