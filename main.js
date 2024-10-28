// Get the canvas element for drawing the car
const carCanvas = document.getElementById("carCanvas");
carCanvas.width = 350; // Set the width of the car canvas

// Get the canvas element for drawing the neural network visualization
const networkCanvas = document.getElementById("networkCanvas");
networkCanvas.width = 500; // Set the width of the network canvas

// Declare the 'cars' array globally but don't initialize yet
let cars;

// Get input elements
const carsNumberInput = document.getElementById("carsNumber");
const mutationLevelInput = document.getElementById("networkMutation");

// Initialize variables to store input values
let carsNumber = parseInt(carsNumberInput.value) || 500;
let mutationLevel = parseFloat(mutationLevelInput.value) || 0.3;

// Create 2D drawing contexts for both canvases
const carCtx = carCanvas.getContext("2d");
const networkCtx = networkCanvas.getContext("2d");

// Initialize the road with the center and width (95% of the canvas width)
const road = new Road(carCanvas.width / 2, carCanvas.width * 0.9);

// Generate cars based on AI state
function generateCars(N) {
  const carsArray = [];
  for (let i = 0; i <= N; i++) {
    carsArray.push(
      new Car(road.getLaneCenter(2), 100, 60, 120, aiEnabled ? "AI" : "KEYS")
    );
  }
  return carsArray;
}

// Load saved values from LocalStorage
function loadFromLocalStorage() {
  const savedCarsNumber = localStorage.getItem("carsNumber");
  const savedMutationLevel = localStorage.getItem("mutationLevel");

  // Set default values if nothing is found in localStorage
  carsNumberInput.value = savedCarsNumber ? savedCarsNumber : 200; // Default to 200 cars
  mutationLevelInput.value = savedMutationLevel ? savedMutationLevel : 0.3; // Default to 30% mutation level

  // Update the variables with the values from input
  carsNumber = parseInt(carsNumberInput.value);
  mutationLevel = parseFloat(mutationLevelInput.value);
}

// Load values from LocalStorage when the page loads
loadFromLocalStorage();
// Initialize 'cars' after generating them
let N = carsNumber;
cars = generateCars(N - 1);
let bestCar = cars[0]; // Initialize bestCar

// Event listeners to update values on change
carsNumberInput.addEventListener("input", () => {
  carsNumber = parseInt(carsNumberInput.value) || 200; // Update and default to 200 if empty
  localStorage.setItem("carsNumber", carsNumber); // Store in LocalStorage
  console.log(
    `Updated number of cars: ${carsNumber}. Press retry to update page`
  );
});

mutationLevelInput.addEventListener("input", () => {
  mutationLevel = parseFloat(mutationLevelInput.value) || 0.3; // Update and default to 0.3=30% if empty
  localStorage.setItem("mutationLevel", mutationLevel); // Store in LocalStorage
  console.log(
    `Updated mutation level: ${mutationLevel}. Press retry to update page`
  );
});

// Add a "dummy" traffic car in lane 2 at a certain position with slower speed
const traffic = [
  new Car(road.getLaneCenter(2), -150, 60, 120, "DUMMY", 2, getRandomColor()),
  new Car(road.getLaneCenter(0), -450, 60, 120, "DUMMY", 2, getRandomColor()),
  new Car(road.getLaneCenter(2), -750, 60, 120, "DUMMY", 2, getRandomColor()),
  new Car(road.getLaneCenter(1), -1150, 60, 120, "DUMMY", 2, getRandomColor()),
  new Car(road.getLaneCenter(0), -1650, 60, 120, "DUMMY", 2, getRandomColor()),
];

// save best car brain
function save() {
  localStorage.setItem("bestBrain", JSON.stringify(bestCar.brain));
  console.log("New car brain saved to LocalStorage");
}

// delete saved brain, carsNumber and NetworkMutation level from localStorage

function deleteData() {
  const keysToDelete = ["bestBrain" /*, "carsNumber", "mutationLevel"*/];

  keysToDelete.forEach((key) => {
    localStorage.removeItem(key);
    console.log(`${key} deleted from LocalStorage`);
  });
}

// get brain from local storage and mutate all cars not first
if (localStorage.getItem("bestBrain")) {
  for (let i = 0; i < cars.length; i++) {
    cars[i].brain = JSON.parse(localStorage.getItem("bestBrain"));
    if (i != 0) {
      neuralNetwork.mutate(cars[i].brain, mutationLevel); /*0.1 = 10% mutation*/
    }
  }

  console.log("Car brain loaded from LocalStorage");
}

function updateCarControls() {
  cars.forEach((car) => {
    const oldControlType = car.controlType;
    car.controlType = aiEnabled ? "AI" : "KEYS";
    car.useBrain = aiEnabled;

    // Reset move forward when switching from AI to KEYS
    if (oldControlType !== car.controlType && oldControlType == "AI") {
      car.controls.forward = false;
    }
  });
}

// Function to handle animation and updates
function animate(time) {
  updateCarControls();
  // Update the position of traffic cars
  for (let i = 0; i < traffic.length; i++) {
    traffic[i].update(road.borders, []); // Update based on road borders
  }
  // Update the position of the main car based on traffic and road borders
  for (let i = 0; i < cars.length; i++) {
    cars[i].update(road.borders, traffic);
  }

  // define best car
  bestCar = cars.find((c) => c.y == Math.min(...cars.map((c) => c.y)));

  // Resize canvases to the window height (for dynamic resizing)
  carCanvas.height = window.innerHeight;
  networkCanvas.height = window.innerHeight;

  // Move the car canvas view to follow the car, keeping it centered
  carCtx.translate(0, -bestCar.y + carCanvas.height * 0.7);

  // Draw the road on the car canvas
  road.draw(carCtx);

  // Draw each traffic car on the canvas
  for (let i = 0; i < traffic.length; i++) {
    traffic[i].draw(carCtx, "lightcoral");
  }

  // Draw the cars on the canvas
  carCtx.globalAlpha = 0.2;
  for (let i = 0; i < cars.length; i++) {
    cars[i].draw(carCtx, false);
  }
  carCtx.globalAlpha = 1;
  bestCar.draw(carCtx, true);
  // Animate the network visualization by adjusting the line dash offset
  networkCtx.lineDashOffset = -time / 20;

  // Draw the car's neural network on the network canvas
  Visualizer.drawNetwork(networkCtx, bestCar.brain);

  // Request the next frame of animation
  requestAnimationFrame(animate);
}

// Start the animation loop
animate();
