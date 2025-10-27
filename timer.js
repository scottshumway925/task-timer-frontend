let seconds = 0;

let isRunning = false;
let intervalId;

export function incrementSeconds() {
    seconds++
    updateTimer();
}

function updateTimer() {
    document.querySelector("#seconds").innerHTML = seconds.toString();
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
