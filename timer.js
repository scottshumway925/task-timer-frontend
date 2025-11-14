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

// Load state from storage
export function timerInit() {
    id = extractId();
    if (!id) return; // no valid ID, stop

    const button = document.querySelector("#pause");

    // Load stored value for this ID
    chrome.storage.sync.get([id], (data) => {
        seconds = data[id] || 0;
        updateTimer();
    });

    button.addEventListener("click", () => {
        if (intervalId) {
            clearInterval(intervalId);
            intervalId = null;
            button.innerText = "Resume";
        } else {
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
    let tempSeconds = seconds;
    let hours = Math.floor(tempSeconds / 3600);
    tempSeconds -= hours * 3600;
    let minutes = Math.floor(tempSeconds / 60);
    tempSeconds -= minutes * 60;
    let output = `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(tempSeconds).padStart(2, "0")}`;
    document.querySelector("#timerSeconds").innerText = output;
}

// Export getter for current timer value
export function getCurrentSeconds() {
    return seconds;
}

// Export getter for assignment ID
export function getTimerId() {
    return id;
}
