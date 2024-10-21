class neuralNetwork {
  constructor(neuronCounts) {
    // Array to store multiple levels of the neural network
    this.levels = [];
    // For each pair of consecutive neuron counts, create a new level
    for (let i = 0; i < neuronCounts.length - 1; i++) {
      this.levels.push(new Level(neuronCounts[i], neuronCounts[i + 1]));
    }
  }

  // Perform feed-forward operation through the entire network
  static feedForward(givenInputs, network) {
    // Get outputs from the first level (using the given inputs)
    let outputs = Level.feedForward(givenInputs, network.levels[0]);
    // Use the outputs from the previous level as inputs for the next
    for (let i = 1; i < network.levels.length; i++) {
      outputs = Level.feedForward(outputs, network.levels[i]);
    }
    return outputs; // Return final outputs
  }
  //mutate network
  static mutate(network, amount = 1) {
    network.levels.forEach((level) => {
      for (let i = 0; i < level.biases.length; i++) {
        level.biases[i] = lerp(level.biases[i], Math.random() * 2 - 1, amount);
      }
      for (let i = 0; i < level.weights.length; i++) {
        for (let j = 0; j < level.weights[i].length; j++) {
          level.weights[i][j] = lerp(
            level.weights[i][j],
            Math.random() * 2 - 1,
            amount
          );
        }
      }
    });
  }
}

class Level {
  constructor(inputCount, outputCount) {
    // Initialize inputs, outputs, and biases arrays
    this.inputs = new Array(inputCount);
    this.outputs = new Array(outputCount);
    this.biases = new Array(outputCount);

    // Initialize a 2D array for weights (from inputs to outputs)
    this.weights = [];
    for (let i = 0; i < inputCount; i++) {
      this.weights[i] = new Array(outputCount);
    }
    // Randomize weights and biases
    Level.#randomize(this);
  }

  // Randomize the weights and biases of the level
  static #randomize(level) {
    // Assign random weights between -1 and 1
    for (let i = 0; i < level.inputs.length; i++) {
      for (let j = 0; j < level.outputs.length; j++) {
        level.weights[i][j] = Math.random() * 2 - 1;
      }
    }
    // Assign random biases between -1 and 1
    for (let i = 0; i < level.biases.length; i++) {
      level.biases[i] = Math.random() * 2 - 1;
    }
  }

  // Perform feed-forward operation for this level
  static feedForward(givenInputs, level) {
    // Assign given inputs to the level's inputs
    for (let i = 0; i < level.inputs.length; i++) {
      level.inputs[i] = givenInputs[i];
    }

    // Calculate the outputs for each neuron
    for (let i = 0; i < level.outputs.length; i++) {
      let sum = 0;
      // Sum the weighted inputs for the current output neuron
      for (let j = 0; j < level.inputs.length; j++) {
        sum += level.inputs[j] * level.weights[j][i];
      }
      // Apply bias to the sum and determine the output (activation function)
      if (sum < level.biases[i]) {
        level.outputs[i] = 1; // Activated (output = 1)
      } else {
        level.outputs[i] = 0; // Not activated (output = 0)
      }
    }
    return level.outputs; // Return the outputs of the level
  }
}
