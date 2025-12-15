let seconds = 0;
let intervalId;
let id; // will hold the dynamic ID

function extractId() {
    const urlPlace = window.location.href;
    const match = urlPlace.match(/\/(quizzes|assignments)\/(\d+)/);
    if (match) {
        return match[2];
    }
    return null;
}

// Load state from storage and initialize the button listener
export function timerInit(updateStatsCallback) { // <-- FIX 1: Now accepts the callback
    id = extractId();
    if (!id) return; // no valid ID, stop

    const button = document.querySelector("#pause");

    // Load stored value for this ID
    chrome.storage.sync.get([id], (data) => {
        seconds = data[id] || 0;
        updateTimer();
        // Set initial button text based on stored state
        if (seconds > 0) {
            button.innerText = "Resume";
        } else {
            button.innerText = "Start";
        }
    });

    button.addEventListener("click", () => {
        if (intervalId) {
            // Timer is running, so PAUSE it
            clearInterval(intervalId);
            intervalId = null;
            button.innerText = "Resume";
        } else {
            // Timer is stopped, so START it
            intervalId = setInterval(incrementSeconds, 1000);
            button.innerText = "Pause";
        }
    });
}

// Increment seconds and save under the ID key
export function incrementSeconds() {
    seconds++;
    updateTimer();
    chrome.storage.sync.set({ [id]: seconds });
}

// Format and display
function updateTimer() {
    const timerDisplay = document.querySelector("#timerSeconds");
    if (!timerDisplay) return;
    
    let tempSeconds = seconds;
    let hours = Math.floor(tempSeconds / 3600);
    tempSeconds -= hours * 3600;
    let minutes = Math.floor(tempSeconds / 60);
    let currentSeconds = Math.floor(tempSeconds % 60);

    // Use the desired format (hh:mm:ss)
    const output = `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(currentSeconds).padStart(2, "0")}`;
    
    timerDisplay.innerText = output;
    timerDisplay.dataset.seconds = seconds;
}