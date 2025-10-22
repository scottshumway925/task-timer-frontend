// background.js
chrome.action.onClicked.addListener(() => {
  chrome.runtime.openOptionsPage(); // This opens settings.html automatically
});