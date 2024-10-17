class Sensor {
  constructor(car) {
    // Attach the sensor to the car
    this.car = car;
    this.rayCount = 5; // Number of rays to be cast from the sensor
    this.rayLength = 140; // Length of each ray
    this.raySpread = Math.PI; // Spread angle of rays (180 degrees)
    this.rays = []; // Array to store the rays
    this.readings = []; // Array to store the intersection data for each ray
  }

  // Update sensor's rays and readings based on road borders and traffic
  update(roadBorders, traffic) {
    this.#castRays(); // Cast rays based on the car's position and angle
    this.readings = []; // Reset readings for each update
    // Get readings for each ray (intersection with road borders or traffic)
    for (let i = 0; i < this.rays.length; i++) {
      this.readings.push(this.#getReading(this.rays[i], roadBorders, traffic));
    }
  }

  // Get intersection (reading) for each ray with road borders and traffic
  #getReading(ray, roadBorders, traffic) {
    let touches = []; // Store all intersection points

    // Check intersection of ray with each road border
    for (let i = 0; i < roadBorders.length; i++) {
      const borderTouch = getIntersection(
        ray[0],
        ray[1],
        roadBorders[i][0],
        roadBorders[i][1]
      );
      if (borderTouch) {
        touches.push(borderTouch);
      }
    }

    // Check intersection of ray with each traffic car
    for (let i = 0; i < traffic.length; i++) {
      const poly = traffic[i].polygon;
      for (let j = 0; j < poly.length; j++) {
        const carTouch = getIntersection(
          ray[0],
          ray[1],
          poly[j],
          poly[(j + 1) % poly.length]
        );
        if (carTouch) {
          touches.push(carTouch);
        }
      }
    }

    // Return the closest intersection point, if any
    if (touches.length == 0) {
      return null; // No intersections
    } else {
      const offsets = touches.map((e) => e.offset); // Get distances of touches
      const minOffset = Math.min(...offsets); // Find the closest intersection
      return touches.find((e) => e.offset == minOffset); // Return closest touch
    }
  }

  // Cast rays from the car to detect objects
  #castRays() {
    this.rays = []; // Reset rays for each update

    // Cast each ray based on its index and spread angle
    for (let i = 0; i < this.rayCount; i++) {
      // Calculate the angle for this specific ray
      const rayAngle =
        lerp(
          this.raySpread / 2, // Start angle (half spread to the right)
          -this.raySpread / 2, // End angle (half spread to the left)
          this.rayCount == 1 ? 0.5 : i / (this.rayCount - 1) // Evenly distribute rays
        ) + this.car.angle; // Adjust with car's current angle

      // Calculate the ray's start position (a bit offset from the car's center)
      const rayOffset = 20;
      const start = {
        x: this.car.x - Math.sin(this.car.angle) * rayOffset,
        y: this.car.y - Math.cos(this.car.angle) * rayOffset,
      };

      // Calculate the end position of the ray (based on angle and length)
      const end = {
        x: start.x - Math.sin(rayAngle) * this.rayLength,
        y: start.y - Math.cos(rayAngle) * this.rayLength,
      };

      // Store the ray (as a pair of start and end points)
      this.rays.push([start, end]);
    }
  }

  // Draw the rays on the canvas
  draw(ctx) {
    for (let i = 0; i < this.rayCount; i++) {
      let end = this.rays[i][1]; // Default end point of the ray
      if (this.readings[i]) {
        end = this.readings[i]; // If there's a reading, use the intersection point
      }

      // Draw the ray from the car to the detected object or its full length
      ctx.beginPath();
      ctx.lineWidth = 2;
      ctx.strokeStyle = "yellow"; // Yellow part of the ray (valid detection)
      ctx.moveTo(this.rays[i][0].x, this.rays[i][0].y);
      ctx.lineTo(end.x, end.y);
      ctx.stroke();

      // Draw the remainder of the ray (if it didn't detect anything)
      ctx.beginPath();
      ctx.lineWidth = 2;
      ctx.strokeStyle = "rgba(255,0,0,0.1)"; // Faded red for missed part
      ctx.moveTo(this.rays[i][1].x, this.rays[i][1].y);
      ctx.lineTo(end.x, end.y);
      ctx.stroke();
    }
  }
}
