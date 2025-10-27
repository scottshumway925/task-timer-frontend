import 'emoji-picker-element';

// Get the emoji picker and input elements
const picker = document.getElementById("emojiPicker");
const emojiInput = document.getElementById("chosenEmoji");

// When an emoji is clicked, update the input field
picker.addEventListener("emoji-click", event => {
  emojiInput.value = event.detail.unicode;
});