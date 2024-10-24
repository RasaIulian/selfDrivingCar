let aiEnabled = JSON.parse(localStorage.getItem("aiEnabled")) ?? true;
const toggleAIButton = document.getElementById("toggleAI");

// Set initial button text based on stored state
toggleAIButton.textContent = aiEnabled ? "🤖 On" : "🤖 Off";

// Add event listener only once, outside the animation loop
toggleAIButton.addEventListener("click", () => {
  aiEnabled = !aiEnabled;
  localStorage.setItem("aiEnabled", JSON.stringify(aiEnabled));
  toggleAIButton.textContent = aiEnabled ? "🤖 On" : "🤖 Off";

  console.log(`Control type updated: ${aiEnabled ? "AI" : "Manual"}`);
});
