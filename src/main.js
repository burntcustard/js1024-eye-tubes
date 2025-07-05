let levelNumber = 1;
let tubes; // Make tubes global so renderAllEyes can access it
let floatingEye; // Track the floating eye directly
let floatingEyeTimeoutId; // Global timeout ID for floating eye animation

const eyeTypes = {
  human: 'radial-gradient(circle, black 0% 20%, blue 20% 45%, white 0',
  feline: 'radial-gradient(ellipse 40% 100%, black 0% 15%, yellow 15% 30%, green 30% 50%, black 50% 100%)',
  reptile: 'radial-gradient(ellipse 30% 100%, black 0% 10%, orange 10% 25%, yellow 25% 45%, black 45% 100%)',
  owl: 'radial-gradient(circle, black 0% 25%, orange 25% 45%, yellow 0)',
  spider: 'radial-gradient(circle, black 0% 30%, red 30% 50%, black 50% 100%)'
};

function createEye(type) {
  const eye = document.createElement('b');
  eye.style.width = '32px';
  eye.style.height = '32px';
  eye.style.borderRadius = '32px';
  eye.style.transition = 'all 200ms';
  eye.style.background = eyeTypes[type];
  return eye;
}

function renderAllEyes() {
  const testTubeThickness = 36;
  const testTubeGap = 16;
  const eyeSize = 32;

  tubes.forEach((tube, tubeIndex) => {
    const totalWidth = tubes.length * testTubeThickness + (tubes.length - 1) * testTubeGap;
    const startOffset = totalWidth / 2;
    const tubeOffsetX = tubeIndex * (testTubeThickness + testTubeGap);
    const xPos = startOffset - tubeOffsetX;

    tube.forEach((eyeElement, eyePosition) => {
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

  for (let i = 0; i < levelNumber + 1; i++) {
    // Using ~~ instead of Math.floor to save bytes
    let eyeTypeIndex = ~~(Math.random() * eyeTypeNames.length);

    // If same as last, just pick the next one (wrapping around if needed)
    if (eyeTypeIndex === lastEyeTypeIndex) {
      eyeTypeIndex = (eyeTypeIndex + 1) % eyeTypeNames.length;
    }

    tubes.push([
      eyeTypeNames[eyeTypeIndex],
      eyeTypeNames[eyeTypeIndex],
      eyeTypeNames[eyeTypeIndex],
      eyeTypeNames[eyeTypeIndex]
    ]);

    lastEyeTypeIndex = eyeTypeIndex;
  }

  // Add an empty tube
  tubes.push([]);

  // console.log('Tubes:', tubes);

  // Set body background to black
  b.style.background = '#124';

  // Calculate positioning variables
  const testTubeThickness = 36; // 32px + 4px for borders
  const testTubeGap = 16;
  const eyeSize = 32;

  // Array to store tube elements for shuffling
  const tubeElements = [];

  // Create tube elements and position them
  tubes.forEach((tube, tubeIndex) => {
    // Calculate X position for this tube
    const totalWidth = tubes.length * testTubeThickness + (tubes.length - 1) * testTubeGap;
    const startOffset = totalWidth / 2;
    const tubeOffsetX = tubeIndex * (testTubeThickness + testTubeGap);
    const xPos = startOffset - tubeOffsetX;
    const yPos = 0;

    // Add eyes to the tube first (so they render underneath)
    for (let i = 0; i < tube.length; i++) {
      const eyeElement = createEye(tube[i]);
      eyeElement.style.position = 'absolute';
      const eyeYPos = (4 * eyeSize)/2 - eyeSize/2 - (i * eyeSize);
      eyeElement.style.left = `calc(50% - ${xPos + eyeSize/2}px)`;
      eyeElement.style.top = `calc(50% + ${eyeYPos - eyeSize/2}px)`;

      // Replace the string in the tube array with the actual HTML element
      tube[i] = eyeElement;

      b.append(eyeElement);
    }

    // Create tube container for visual border (after eyes)
    const tubeElement = document.createElement('button');
    tubeElement.style.position = 'absolute';
    tubeElement.style.left = `calc(50% - ${xPos + testTubeThickness/2}px)`;
    tubeElement.style.top = `calc(50% + ${yPos - (4 * eyeSize + 4)/2}px)`;
    tubeElement.style.border = '2px solid white';
    tubeElement.style.borderTop = '0';
    tubeElement.style.borderRadius = '0 0 32px 32px';
    tubeElement.style.background = '0';
    tubeElement.style.padding = '0';
    tubeElement.style.width = `${testTubeThickness}px`;
    tubeElement.style.height = `${4 * eyeSize + 4}px`;

    // Add click handler to move top eye
    tubeElement.onclick = () => {
      if (floatingEye) {
        // There's a floating eye - place it in this tube if it has space
        if (tubes[tubeIndex].length < 4) {
          const originalTubeIndex = floatingEye.originalTubeIndex;

          // Clear any pending timeout for this eye
          if (floatingEyeTimeoutId) {
            clearTimeout(floatingEyeTimeoutId);
            floatingEyeTimeoutId = null;
          }

          // Add to new tube and mark as no longer floating
          tubes[tubeIndex].push(floatingEye);
          floatingEye.originalTubeIndex = null;

          // Position horizontally above the new tube first
          const totalWidth = tubes.length * testTubeThickness + (tubes.length - 1) * testTubeGap;
          const startOffset = totalWidth / 2;
          const tubeOffsetX = tubeIndex * (testTubeThickness + testTubeGap);
          const xPos = startOffset - tubeOffsetX;
          floatingEye.style.left = `calc(50% - ${xPos + eyeSize/2}px)`;

          // Use setTimeout for the drop animation - renderAllEyes handles all positioning
          floatingEyeTimeoutId = setTimeout(() => {
            renderAllEyes();
          }, originalTubeIndex == tubeIndex ? 0 : 200);

          floatingEye = null; // Clear the floating eye
        }
      } else if (tube.length > 0) {
        // No floating eye - move top eye up
        const topEyeElement = tube.pop();

        // Move it above the tubes by changing its top property
        topEyeElement.style.top = `calc(50% - ${4 * eyeSize + 4 + 50 + eyeSize/2}px)`;
        topEyeElement.originalTubeIndex = tubeIndex; // Store which tube it came from (indicates floating)

        floatingEye = topEyeElement; // Set the floating eye
      }
    };

    b.append(tubeElement);
    tubeElements.push(tubeElement);
  });

  // Shuffle by simulating tube clicks
  for (let shuffle = 0; shuffle < tubes.length * tubes.length * 10 || floatingEye; shuffle++) {
    // Click a random tube button from the tubeElements array
    const randomTubeIndex = ~~(Math.random() * tubes.length);
    tubeElements[randomTubeIndex].click();
  }

  // console.log('Shuffled Tubes:', tubes);
}

startGame();
