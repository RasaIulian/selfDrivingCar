class Controls {
  constructor(type) {
    // Initialize control states (forward, left, right, reverse) as false
    this.forward = false;
    this.left = false;
    this.right = false;
    this.reverse = false;

    // Determine the type of control
    switch (type) {
      case "KEYS":
        // If "KEYS", set up keyboard listeners for manual control
        this.#addKeyboardListeners();
        break;
      case "DUMMY":
        // If "DUMMY", set forward movement to true by default
        this.forward = true;
        break;
    }
  }

  // Private method to add keyboard event listeners
  #addKeyboardListeners() {
    // Handle key press (keydown) events
    document.onkeydown = (event) => {
      switch (event.key) {
        case "ArrowLeft":
          this.left = true; // Turn left
          break;
        case "ArrowRight":
          this.right = true; // Turn right
          break;
        case "ArrowUp":
          this.forward = true; // Move forward
          break;
        case "ArrowDown":
          this.reverse = true; // Move in reverse
          break;
      }
      // Uncomment to log control states for debugging
      // console.table(this);
    };

    // Handle key release (keyup) events
    document.onkeyup = (event) => {
      switch (event.key) {
        case "ArrowLeft":
          this.left = false; // Stop turning left
          break;
        case "ArrowRight":
          this.right = false; // Stop turning right
          break;
        case "ArrowUp":
          this.forward = false; // Stop moving forward
          break;
        case "ArrowDown":
          this.reverse = false; // Stop moving in reverse
          break;
      }
      // Uncomment to log control states for debugging
      // console.table(this);
    };
  }
}
