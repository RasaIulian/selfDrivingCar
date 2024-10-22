// Get the canvas element for drawing the car
const carCanvas = document.getElementById("carCanvas");
carCanvas.width = 300; // Set the width of the car canvas

// Get the canvas element for drawing the neural network visualization
const networkCanvas = document.getElementById("networkCanvas");
networkCanvas.width = 400; // Set the width of the network canvas

// Get input elements
const carsNumberInput = document.getElementById("carsNumber");
const mutationLevelInput = document.getElementById("networkMutation");

// Initialize variables to store input values
let carsNumber = parseInt(carsNumberInput.value) || 100;
let mutationLevel = parseFloat(mutationLevelInput.value) || 0.2;

// Create 2D drawing contexts for both canvases
const carCtx = carCanvas.getContext("2d");
const networkCtx = networkCanvas.getContext("2d");

// Initialize the road with the center and width (90% of the canvas width)
const road = new Road(carCanvas.width / 2, carCanvas.width * 0.9);

// Create cars array (controlled by "AI" or manual "KEYS")
// Cars are placed in a lane with given x, y, width, and height
function generateCars(N) {
  const cars = [];
  for (let i = 0; i <= N; i++) {
    cars.push(new Car(road.getLaneCenter(2), 100, 60, 100, "AI"));
  }
  return cars;
}

// Load saved values from LocalStorage
function loadFromLocalStorage() {
  const savedCarsNumber = localStorage.getItem("carsNumber");
  const savedMutationLevel = localStorage.getItem("mutationLevel");

  // Set default values if nothing is found in localStorage
  carsNumberInput.value = savedCarsNumber ? savedCarsNumber : 200; // Default to 200 cars
  mutationLevelInput.value = savedMutationLevel ? savedMutationLevel : 0.2; // Default to 20% mutation level

  // Update the mutation display to show in percentage
  mutationLevelInput.textContent = `${Math.round(
    mutationLevelInput.value * 100
  )}%`;

  // Update the variables with the values from input
  carsNumber = parseInt(carsNumberInput.value);
  mutationLevel = parseFloat(mutationLevelInput.value);
}

// Load values from LocalStorage when the page loads
loadFromLocalStorage();

// generate N cars
let N = carsNumber;
let cars = generateCars(N - 1);
let bestCar = cars[0]; // Initialize bestCar

// Event listeners to update values on change
carsNumberInput.addEventListener("input", () => {
  carsNumber = parseInt(carsNumberInput.value) || 200; // Update and default to 200 if empty
  localStorage.setItem("carsNumber", carsNumber); // Store in LocalStorage
  mutationLevelInput.textContent = `${Math.round(mutationLevel * 100)}%`; // Update percentage display
  console.log(
    `Updated number of cars: ${carsNumber}. Press retry to update page`
  );
});

mutationLevelInput.addEventListener("input", () => {
  mutationLevel = parseFloat(mutationLevelInput.value) || 0.2; // Update and default to 0.2 if empty
  localStorage.setItem("mutationLevel", mutationLevel); // Store in LocalStorage
  console.log(
    `Updated mutation level: ${mutationLevel}. Press retry to update page`
  );
});

// Add a "dummy" traffic car in lane 2 at a certain position with slower speed
const traffic = [
  new Car(road.getLaneCenter(2), -150, 60, 100, "DUMMY", 2, getRandomColor()),
  new Car(road.getLaneCenter(0), -450, 60, 100, "DUMMY", 2, getRandomColor()),
  new Car(road.getLaneCenter(2), -750, 60, 100, "DUMMY", 2, getRandomColor()),
  new Car(road.getLaneCenter(1), -1050, 60, 100, "DUMMY", 2, getRandomColor()),
  new Car(road.getLaneCenter(0), -1450, 60, 100, "DUMMY", 2, getRandomColor()),
];

// Start the animation loop
animate();
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

// Function to handle animation and updates
function animate(time) {
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
