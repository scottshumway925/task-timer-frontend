let seconds = 0;
let isRunning = false;
let intervalId;

// Load state from storage
export function timerInit() {
    const button = document.querySelector("#pause");

    // Load stored values
    chrome.storage.sync.get(["seconds", "isRunning"], (data) => {
        seconds = data.seconds || 0;
        isRunning = data.isRunning || false;
        updateTimer();

        // If it was running, restart the interval
        if (isRunning) {
            intervalId = setInterval(incrementSeconds, 1000);
            button.innerText = "Pause";
        } else {
            button.innerText = "Resume";
        }
    });

    button.addEventListener("click", () => {
        if (isRunning) {
            isRunning = false;
            clearInterval(intervalId);
            button.innerText = "Resume";
        } else {
            isRunning = true;
            intervalId = setInterval(incrementSeconds, 1000);
            button.innerText = "Pause";
        }

        // Save the running state
        chrome.storage.sync.set({ isRunning });
    });
}

// Increment seconds and persist
export function incrementSeconds() {
    seconds++;
    updateTimer();
    chrome.storage.sync.set({ seconds });
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
