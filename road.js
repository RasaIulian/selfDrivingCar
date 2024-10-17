class Road {
  constructor(x, width, laneCount = 3) {
    // Initialize road position and dimensions
    this.x = x; // Center X position of the road
    this.width = width; // Total width of the road
    this.laneCount = laneCount; // Number of lanes

    // Calculate the left and right boundaries of the road
    this.left = x - width / 2;
    this.right = x + width / 2;

    // Set the road's top and bottom boundaries (with large values to simulate infinity)
    const infinity = 1000000;
    this.top = -infinity; // Top boundary (negative infinity for upward)
    this.bottom = infinity; // Bottom boundary (infinity for downward)

    // Define the four corners of the road's bounding box
    const topLeft = { x: this.left, y: this.top };
    const topRight = { x: this.right, y: this.top };
    const bottomLeft = { x: this.left, y: this.bottom };
    const bottomRight = { x: this.right, y: this.bottom };

    // Create borders for the left and right edges of the road
    this.borders = [
      [topLeft, bottomLeft],
      [topRight, bottomRight],
    ];
  }

  // Get the center position of a specific lane
  getLaneCenter(laneIndex) {
    const laneWidth = this.width / this.laneCount; // Calculate width of a lane
    // Return the X position for the center of the specified lane
    return (
      this.left +
      laneWidth / 2 + // Start from the center of the first lane
      Math.min(laneIndex, this.laneCount - 1) * laneWidth // Multiply by lane index
    );
  }

  // Draw the road and its lanes on the canvas
  draw(ctx) {
    ctx.lineWidth = 5; // Set line width for drawing
    ctx.strokeStyle = "white"; // Set the line color to white

    // Draw lane dividers (dashed lines between lanes)
    for (let i = 1; i <= this.laneCount - 1; i++) {
      const x = lerp(this.left, this.right, i / this.laneCount); // Get position for each lane divider

      ctx.setLineDash([20, 20]); // Set dash pattern for lane lines
      ctx.beginPath();
      ctx.moveTo(x, this.top); // Start lane line at the top
      ctx.lineTo(x, this.bottom); // Draw lane line to the bottom
      ctx.stroke(); // Render the lane line
    }

    // Draw solid road borders
    ctx.setLineDash([]); // No dashes for road borders
    this.borders.forEach((border) => {
      ctx.beginPath();
      ctx.moveTo(border[0].x, border[0].y); // Start border line
      ctx.lineTo(border[1].x, border[1].y); // End border line
      ctx.stroke(); // Render the border
    });
  }
}
