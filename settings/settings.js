import 'emoji-picker-element';

document.addEventListener("DOMContentLoaded", () => {
  const picker = document.getElementById("emojiPicker");
  const emojiInput = document.getElementById("chosenEmoji");
  const emojiContainer = document.getElementById("emojiContainer");

  // Show picker when input is clicked
  emojiInput.addEventListener("click", (e) => {
    emojiContainer.classList.add("show");
    e.stopPropagation();
  });

  // Keep picker open if clicking inside it
  emojiContainer.addEventListener("click", (e) => e.stopPropagation());

  // Hide picker when clicking outside
  document.addEventListener("click", () => {
    emojiContainer.classList.remove("show");
  });

  // Set input value when emoji is clicked
  picker.addEventListener("emoji-click", (event) => {
    emojiInput.value = event.detail.unicode;
    emojiContainer.classList.remove("show");
  });

  // === Color Inputs Sync ===
  const syncInput = (input1, input2) => {
    input1.addEventListener("input", () => input2.value = input1.value);
    input2.addEventListener("input", () => input1.value = input2.value);
  };

  syncInput(document.getElementById("primaryColor"), document.getElementById("primaryHex"));
  syncInput(document.getElementById("secondaryColor"), document.getElementById("secondaryHex"));
  syncInput(document.getElementById("accentColor"), document.getElementById("accentHex"));
});