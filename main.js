// Get the canvas element for drawing the car
const carCanvas = document.getElementById("carCanvas");
carCanvas.width = 300; // Set the width of the car canvas

// Get the canvas element for drawing the neural network visualization
const networkCanvas = document.getElementById("networkCanvas");
networkCanvas.width = 400; // Set the width of the network canvas

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
    cars.push(new Car(road.getLaneCenter(1), 100, 40, 60, "AI"));
  }
  return cars;
}

// generate N cars
const N = 150;
const cars = generateCars(N);
let bestCar = cars[0];
// Add a "dummy" traffic car in lane 2 at a certain position with slower speed
const traffic = [
  new Car(road.getLaneCenter(1), -150, 40, 60, "DUMMY", 2),
  new Car(road.getLaneCenter(0), -450, 40, 60, "DUMMY", 2),
  new Car(road.getLaneCenter(2), -650, 40, 60, "DUMMY", 2),
];

// Start the animation loop
animate();
// save best car brain
function save() {
  localStorage.setItem("bestBrain", JSON.stringify(bestCar.brain));
  console.log("New car brain saved to LocalStorage");
}

// delete saved brain from localStorage

function deleteBrain() {
  localStorage.removeItem("bestBrain");
  console.log("Car brain deleted from LocalStorage");
}

// get brain from local storage and mutate all cars not first
if (localStorage.getItem("bestBrain")) {
  for (let i = 0; i < cars.length; i++) {
    cars[i].brain = JSON.parse(localStorage.getItem("bestBrain"));
    if (i != 0) {
      neuralNetwork.mutate(cars[i].brain, 0.2); /*0.1 = 10% mutation*/
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
    traffic[i].draw(carCtx, "grey");
  }

  // Draw the cars on the canvas
  carCtx.globalAlpha = 0.2;
  for (let i = 0; i < cars.length; i++) {
    cars[i].draw(carCtx, "lightgreen");
  }
  carCtx.globalAlpha = 1;
  bestCar.draw(carCtx, "lightgreen", true);
  // Animate the network visualization by adjusting the line dash offset
  networkCtx.lineDashOffset = -time / 20;

  // Draw the car's neural network on the network canvas
  Visualizer.drawNetwork(networkCtx, bestCar.brain);

  // Request the next frame of animation
  requestAnimationFrame(animate);
}
