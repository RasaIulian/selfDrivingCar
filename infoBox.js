// Get the infoBox element
const infoBox = document.getElementById("infoBox");

// Store the original console.log
const originalConsoleLog = console.log;

// Override console.log to also output to the infoBox with only the latest message
console.log = function (message) {
  // Call the original console.log
  originalConsoleLog.apply(console, arguments);

  // Display the latest message in the infoBox
  infoBox.innerHTML = message;

  // Save message to localStorage with a timestamp
  localStorage.setItem("latestMessage", message);
  localStorage.setItem("lastUpdated", new Date().toISOString());

  // Reset the opacity and clear any existing hidden class
  infoBox.classList.remove("hidden");

  // Set a timeout to hide the infoBox after 5 seconds
  setTimeout(() => {
    infoBox.classList.add("hidden"); // Apply fade-out effect
  }, 5000);
};

// Display the last message from localStorage on page load
window.addEventListener("load", () => {
  const latestMessage = localStorage.getItem("latestMessage");
  if (latestMessage) {
    infoBox.innerHTML = latestMessage;
    // Show infoBox briefly before applying hidden class
    infoBox.classList.remove("hidden");
    setTimeout(() => {
      infoBox.classList.add("hidden");
    }, 5000);
  }
});
