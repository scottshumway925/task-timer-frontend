// popup.js
document.getElementById("open-settings").addEventListener("click", () => {
  chrome.runtime.openOptionsPage(); // Opens settings.html in a new tab
});