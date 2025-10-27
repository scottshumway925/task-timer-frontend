let seconds = 0;

let isRunning = false;
let intervalId;

export function incrementSeconds() {
    seconds++
    updateTimer();
}

function updateTimer() {
    let tempSeconds
    let hours = Math.floor(seconds / 3600);
    tempSeconds = seconds - hours * 3600;
    let minutes = Math.floor(tempSeconds / 60);
    tempSeconds = seconds - minutes * 60;
    let output = `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(tempSeconds).padStart(2, "0")}`;

    document.querySelector("#seconds").innerHTML = output;
}

export function timerInit() {
    let button = document.querySelector("#pause");
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
    })
}
