class Visualizer {
  // Draws the entire neural network on the canvas.
  static drawNetwork(ctx, network) {
    const margin = 30; // Margin from the edges of the canvas
    const left = margin;
    const top = margin;
    const width = ctx.canvas.width - margin * 2; // Total drawable width
    const height = ctx.canvas.height - margin * 2; // Total drawable height

    // Calculate the height of each level based on the number of levels in the network.
    const levelHeight = height / network.levels.length;

    // Loop through each level in the network, drawing from the last to the first (bottom-up).
    for (let i = network.levels.length - 1; i >= 0; i--) {
      // Calculate the vertical position of the top of each level using linear interpolation.
      const levelTop =
        top +
        lerp(
          height - levelHeight,
          0,
          network.levels.length == 1 ? 0.5 : i / (network.levels.length - 1)
        );

      // ctx.setLineDash([50, 8]); // Set dashed lines for visual effect
      // Draw the current level, passing input and output labels for the last level.
      Visualizer.drawLevel(
        ctx,
        network.levels[i],
        left,
        levelTop,
        width,
        levelHeight,
        i == network.levels.length - 1 ? ["↑", "←", "→", "↓"] : [] // Arrows as output labels for the final level.
      );
    }
  }

  // Draws a single level in the neural network.
  static drawLevel(ctx, level, left, top, width, height, outputLabels) {
    const right = left + width;
    const bottom = top + height;

    // Destructure inputs, outputs, weights, and biases from the current level.
    const { inputs, outputs, weights, biases } = level;

    // Draw connections (lines) between input nodes and output nodes, colored by weight value.
    for (let i = 0; i < inputs.length; i++) {
      for (let j = 0; j < outputs.length; j++) {
        ctx.beginPath();
        // Draw a line from the input node to the output node.
        ctx.moveTo(Visualizer.#getNodeX(inputs, i, left, right), bottom);
        ctx.lineTo(Visualizer.#getNodeX(outputs, j, left, right), top);
        ctx.lineWidth = 3;
        // Set stroke color based on the weight value.
        ctx.strokeStyle = getRGBA(weights[i][j]);
        ctx.stroke();
      }
    }

    const nodeRadius = 18; // Radius of the nodes (circles).

    // Draw input nodes at the bottom of the level.
    for (let i = 0; i < inputs.length; i++) {
      const x = Visualizer.#getNodeX(inputs, i, left, right);
      ctx.beginPath();
      ctx.arc(x, bottom, nodeRadius, 0, Math.PI * 2); // Outer circle
      ctx.fillStyle = "rgba(125,125,125,0.3)"; // Light gray for outer ring
      ctx.fill();
      ctx.beginPath();
      ctx.arc(x, bottom, nodeRadius * 0.6, 0, Math.PI * 2); // Inner circle
      ctx.fillStyle = getRGBA(inputs[i]); // Color based on the input value.
      ctx.fill();
    }

    // Draw output nodes at the top of the level.
    for (let i = 0; i < outputs.length; i++) {
      const x = Visualizer.#getNodeX(outputs, i, left, right);
      ctx.beginPath();
      ctx.arc(x, top, nodeRadius, 0, Math.PI * 2); // Outer circle
      ctx.fillStyle = "black"; // Light gray for outer ring
      ctx.fill();
      ctx.beginPath();
      ctx.arc(x, top, nodeRadius * 0.6, 0, Math.PI * 2); // Inner circle
      ctx.fillStyle = getRGBA(outputs[i]); // Color based on the output value.
      ctx.fill();

      // Draw the bias as a dashed outer ring around the output node.
      ctx.beginPath();
      ctx.lineWidth = 3;
      ctx.arc(x, top, nodeRadius * 0.8, 0, Math.PI * 2); // Bias ring
      ctx.strokeStyle = getRGBA(biases[i]);
      // ctx.setLineDash([10, 5]); // Dashed line for bias.
      ctx.stroke();
      // ctx.setLineDash([]);

      // Draw the label (if provided) on the output node.
      if (outputLabels[i]) {
        ctx.beginPath();
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillStyle = "black";
        ctx.strokeStyle = "black";
        ctx.font = nodeRadius * 0.9 + "px Arial"; // Font size based on node radius.
        ctx.fillText(outputLabels[i], x, top); // Fill text with label.
        ctx.lineWidth = 2;
        ctx.strokeText(outputLabels[i], x, top); // Outline the text.
      }
    }
  }

  // Helper method to calculate the x-position of a node based on its index and the total width.
  static #getNodeX(nodes, index, left, right) {
    return lerp(
      left,
      right,
      nodes.length == 1 ? 0.5 : index / (nodes.length - 1) // Center a single node or evenly distribute multiple nodes.
    );
  }
}
