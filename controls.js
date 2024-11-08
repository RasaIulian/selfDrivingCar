class Controls {
  constructor(type) {
    this.forward = false;
    this.left = false;
    this.right = false;
    this.reverse = false;

    if (type === "KEYS") {
      this.#addKeyboardListeners();
    } else if (type === "DUMMY") {
      this.forward = true;
    }
  }

  #addKeyboardListeners() {
    document.addEventListener("keydown", this.#handleKeyDown);
    document.addEventListener("keyup", this.#handleKeyUp);
  }

  #removeKeyboardListeners() {
    document.removeEventListener("keydown", this.#handleKeyDown);
    document.removeEventListener("keyup", this.#handleKeyUp);
  }

  #handleKeyDown = (event) => {
    switch (event.key) {
      case "ArrowLeft":
        this.left = true;
        break;
      case "ArrowRight":
        this.right = true;
        break;
      case "ArrowUp":
        this.forward = true;
        break;
      case "ArrowDown":
        this.reverse = true;
        break;
    }
  };

  #handleKeyUp = (event) => {
    switch (event.key) {
      case "ArrowLeft":
        this.left = false;
        break;
      case "ArrowRight":
        this.right = false;
        break;
      case "ArrowUp":
        this.forward = false;
        break;
      case "ArrowDown":
        this.reverse = false;
        break;
    }
  };

  updateControlType(type) {
    this.controlType = type;
    type === "KEYS"
      ? this.#addKeyboardListeners()
      : this.#removeKeyboardListeners();
  }
}
