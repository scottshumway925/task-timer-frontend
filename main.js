export function init() {
    createSidebar();
}

function createSidebar() {
    const sidebar = document.createElement("div");
    sidebar.id = "sidebar";

    sidebar.innerHTML = `
      <div id="sidebarContent">
        <h2>Mean Time:</span></h2>
        <h2 id="meanTime">00:00:00</h2>
        <div id="timeData">
            <div>
                <p>Median:</p>
                <p id="medianTime">00:00:00</p>
            </div>
            <div>
                <p>Mode:</p>
                <p id="modeTime">00:00:00</p>
            </div>
        </div>
        <div id="timer">
            <p>Timer</p>
            <h2 id="timerSeconds" data-seconds="0">00:00:00</h2>
            <button id="pause" type="button">Start</button>
        </div>
        <div id="bellCurve">
            <div id="graphWrapper">
                <canvas id="bell_curve"></canvas>
            </div>
            <p id="userTime"></p>
        </div>
        <form id="timerForm">
            <p>Time Spent:</p>
            <input type="number" min="0" placeholder="hours" id="hours"/>
            <input type="number" min="0" placeholder="minutes" id="minutes">
            <input type="number" min="0" placeholder="second" id="seconds"/>
            <button type="submit">Add Time</button>
        </form>
      </div>
      <button id="sidebarToggle" type="button">></button>
    `;
    document.body.appendChild(sidebar);

    // create the event listeners
    document.querySelector("#sidebarToggle").addEventListener("click", toggleSidebar);
}

function toggleSidebar() {
    document.querySelector("#sidebar").classList.toggle("closed");
}

// Create sidebar elements

// const toggle = document.createElement("button");
// toggle.id = "sidebarToggle";
// toggle.className = "sidebar-toggle";
// toggle.type = "button";
// toggle.setAttribute("aria-label", "Toggle time predictor sidebar");
// toggle.setAttribute("aria-expanded", "true");
// toggle.title = "Collapse sidebar";
// // Visual arrow — when collapsed will change
// toggle.textContent = "›";
// // append as a direct child of the sidebar so it remains visible when content is hidden
// sidebar.appendChild(toggle);