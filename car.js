class Car {
  constructor(x, y, width, height, controlType, maxSpeed = 3) {
    // Initialize car's position, size, speed, and properties
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.speed = 0;
    this.acceleration = 0.2;
    this.maxSpeed = maxSpeed;
    this.friction = 0.03;
    this.angle = 0; // The direction the car is facing
    this.damaged = false; // Damage flag for collisions
    this.damageFlashCounter = 0; // Counter to handle the flashing effect
    this.useBrain = controlType == "AI"; // Determines if AI is controlling the car

    // Add sensor and neural network only if the car is not a dummy
    if (controlType != "DUMMY") {
      this.sensor = new Sensor(this);
      // Create a neural network with layers (sensor rays, 6 neurons, 4 outputs)
      this.brain = new neuralNetwork([this.sensor.rayCount, 6, 4]);
    }
    // Set up controls (manual or AI) based on controlType
    this.controls = new Controls(controlType);
  }

  // Update car position, sensor data, and check for damage
  update(roadBorders, traffic) {
    if (!this.damaged) {
      this.#move(); // Move the car
      this.polygon = this.#createPolygon(); // Create the car shape (for collisions)
      this.damaged = this.#assessDamage(roadBorders, traffic); // Check for collisions
    }

    // Update the sensor if the car has one
    if (this.sensor) {
      this.sensor.update(roadBorders, traffic);

      // Convert sensor readings to inputs for the neural network
      const offsets = this.sensor.readings.map((s) =>
        s == null ? 0 : 1 - s.offset
      );
      // Get outputs from the neural network
      const outputs = neuralNetwork.feedForward(offsets, this.brain);

      // Use neural network outputs to control the car if it's AI-driven
      if (this.useBrain) {
        this.controls.forward = outputs[0];
        this.controls.left = outputs[1];
        this.controls.right = outputs[2];
        this.controls.reverse = outputs[3];
      }
    }
    // Increment the flash counter when damaged
    if (this.damaged) {
      this.damageFlashCounter++;
    }
  }

  // Check for collisions with road borders or traffic
  #assessDamage(roadBorders, traffic) {
    // Check for collisions with road borders
    for (let i = 0; i < roadBorders.length; i++) {
      if (polysIntersect(this.polygon, roadBorders[i])) {
        return true; // Return true if a collision occurs
      }
    }
    // Check for collisions with other cars (traffic)
    for (let i = 0; i < traffic.length; i++) {
      if (polysIntersect(this.polygon, traffic[i].polygon)) {
        return true; // Return true if a collision occurs
      }
    }
    return false; // No collision
  }

  // Create a polygon shape representing the car (used for collision detection)
  #createPolygon() {
    const points = [];
    const rad = Math.hypot(this.width, this.height / 2); // Radius for the corners
    const alpha = Math.atan2(this.width, this.height); // Angle for the car's shape

    // Calculate the four corners of the car based on the angle and position
    points.push({
      x: this.x - Math.sin(this.angle - alpha) * rad,
      y: this.y - Math.cos(this.angle - alpha) * rad,
    });
    points.push({
      x: this.x - Math.sin(this.angle + alpha) * rad,
      y: this.y - Math.cos(this.angle + alpha) * rad,
    });
    points.push({
      x: this.x - Math.sin(Math.PI + this.angle - alpha) * rad,
      y: this.y - Math.cos(Math.PI + this.angle - alpha) * rad,
    });
    points.push({
      x: this.x - Math.sin(Math.PI + this.angle + alpha) * rad,
      y: this.y - Math.cos(Math.PI + this.angle + alpha) * rad,
    });
    return points; // Return the polygon points representing the car
  }

  // Handle car movement based on controls and physics
  #move() {
    // Accelerate or reverse the car based on controls
    if (this.controls.forward) {
      this.speed += this.acceleration;
    }
    if (this.controls.reverse) {
      this.speed -= this.acceleration;
    }

    // Limit reverse speed to half of maxSpeed
    if (this.speed < -this.maxSpeed / 2) {
      this.speed = -this.maxSpeed / 2;
    }

    // Apply friction to slow down the car
    if (this.speed > 0) {
      this.speed -= this.friction;
    }
    if (this.speed < 0) {
      this.speed += this.friction;
    }

    // Limit the speed to the maxSpeed
    if (this.speed > this.maxSpeed) {
      this.speed = this.maxSpeed;
    }

    // Stop the car if the speed is very low (near zero)
    if (Math.abs(this.speed) < this.friction) {
      this.speed = 0;
    }

    // Turn the car based on speed and direction
    if (this.speed != 0) {
      const flip = this.speed > 0 ? 1 : -1; // Flip for reverse direction

      // Turn left or right based on controls and direction of movement
      if (this.controls.left) {
        this.angle += 0.03 * flip;
      }
      if (this.controls.right) {
        this.angle -= 0.03 * flip;
      }
    }

    // Update the car's position based on speed and angle
    this.x -= Math.sin(this.angle) * this.speed;
    this.y -= Math.cos(this.angle) * this.speed;
  }

  // Draw the car and its sensor (if any) on the canvas
  draw(ctx, color, drawSensor = false) {
    // Toggle between red and original color every few frames
    const flash =
      this.damageFlashCounter % 30 < 5 ? "rgba(125,125,125,0.5)" : color;

    // Set the car flash color if damaged
    if (this.damaged) {
      ctx.fillStyle = flash;
    } else {
      ctx.fillStyle = color;
    }

    // Draw the car polygon
    ctx.beginPath();
    ctx.moveTo(this.polygon[0].x, this.polygon[0].y);
    for (let i = 1; i < this.polygon.length; i++) {
      ctx.lineTo(this.polygon[i].x, this.polygon[i].y);
    }
    ctx.fill(); // Fill the car shape with color

    // Draw only the first car's sensor
    if (this.sensor && drawSensor) {
      this.sensor.draw(ctx);
    }
  }
}
