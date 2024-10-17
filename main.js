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

// Create a car object (controlled by "AI" or manual "KEYS")
// Car is placed in lane 1, with given x, y, width, and height
const car = new Car(road.getLaneCenter(1), 100, 40, 60, "AI");

// Add a "dummy" traffic car in lane 1 at a certain position with slower speed
const traffic = [new Car(road.getLaneCenter(1), -150, 40, 60, "DUMMY", 2)];

// Start the animation loop
animate();

// Function to handle animation and updates
function animate(time) {
  // Update the position of traffic cars
  for (let i = 0; i < traffic.length; i++) {
    traffic[i].update(road.borders, []); // Update based on road borders
  }
  // Update the position of the main car based on traffic and road borders
  car.update(road.borders, traffic);

  // Resize canvases to the window height (for dynamic resizing)
  carCanvas.height = window.innerHeight;
  networkCanvas.height = window.innerHeight;

  // Move the car canvas view to follow the car, keeping it centered
  carCtx.translate(0, -car.y + carCanvas.height * 0.7);

  // Draw the road on the car canvas
  road.draw(carCtx);

  // Draw each traffic car on the canvas
  for (let i = 0; i < traffic.length; i++) {
    traffic[i].draw(carCtx, "grey");
  }

  // Draw the main car on the canvas
  car.draw(carCtx, "blue");

  // Animate the network visualization by adjusting the line dash offset
  networkCtx.lineDashOffset = -time / 20;

  // Draw the car's neural network on the network canvas
  Visualizer.drawNetwork(networkCtx, car.brain);

  // Request the next frame of animation
  requestAnimationFrame(animate);
}
