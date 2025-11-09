import 'emoji-picker-element';

document.addEventListener("DOMContentLoaded", () => {
  const picker = document.getElementById("emojiPicker");
  const emojiInput = document.getElementById("chosenEmoji");
  const emojiContainer = document.getElementById("emojiContainer");

  // === Emoji Picker Logic ===
  emojiInput.addEventListener("click", (e) => {
    emojiContainer.classList.add("show");
    e.stopPropagation();
  });

  emojiContainer.addEventListener("click", (e) => e.stopPropagation());
  document.addEventListener("click", () => emojiContainer.classList.remove("show"));

  picker.addEventListener("emoji-click", (event) => {
    emojiInput.value = event.detail.unicode;
    emojiContainer.classList.remove("show");
  });

  // === Color Inputs ===
  const primaryColor = document.getElementById("primaryColor");
  const primaryHex = document.getElementById("primaryHex");
  const secondaryColor = document.getElementById("secondaryColor");
  const secondaryHex = document.getElementById("secondaryHex");
  const accentColor = document.getElementById("accentColor");
  const accentHex = document.getElementById("accentHex");

  const syncInput = (input1, input2) => {
    input1.addEventListener("input", () => (input2.value = input1.value));
    input2.addEventListener("input", () => (input1.value = input2.value));
  };

  syncInput(primaryColor, primaryHex);
  syncInput(secondaryColor, secondaryHex);
  syncInput(accentColor, accentHex);

  // === Load Settings from Chrome Storage ===
  chrome.storage.sync.get(["primaryColor", "secondaryColor", "accentColor", "chosenEmoji"], (settingsData) => {
    if (settingsData.primaryColor) primaryColor.value = primaryHex.value = settingsData.primaryColor;
    if (settingsData.secondaryColor) secondaryColor.value = secondaryHex.value = settingsData.secondaryColor;
    if (settingsData.accentColor) accentColor.value = accentHex.value = settingsData.accentColor;
    if (settingsData.chosenEmoji) emojiInput.value = settingsData.chosenEmoji;
  });

  // === Save Settings to Chrome Storage ===
  const saveSettings = () => {
    chrome.storage.sync.set({
      primaryColor: primaryColor.value,
      secondaryColor: secondaryColor.value,
      accentColor: accentColor.value,
      chosenEmoji: emojiInput.value
    });
  };

  [primaryColor, secondaryColor, accentColor].forEach((el) => {
    el.addEventListener("change", saveSettings);
  });

  // Save emoji when user manually edits or selects it
  emojiInput.addEventListener("blur", saveSettings);
});
