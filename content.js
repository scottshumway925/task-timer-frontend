

import displayGraph from "./bell_curve.mjs";
import {timerInit} from "./timer";
import {getInfo} from "./classInfo";

// Get Class/Assignment Info
const { assignmentName, className } = getInfo();
// Create sidebar
const sidebar = document.createElement("div");
sidebar.id = "mySidebar";

sidebar.innerHTML = `
  <div id="mySidebarContent">
    <h2>Mean Time: <span id="meanTime">00:00:00</span></h2>
    <div class="timeData">
        <div>
            <p>Median:</p>
            <p id="medianTime">00:00:00</p>
        </div>
        <div>
            <p>Mode:</p>
            <p id="modeTime">00:00:00</p>
        </div>
    </div>
  </div>
`;


// Append the sidebar to the body
document.body.appendChild(sidebar);

// --- Sidebar toggle button (collapse/expand) ---
const toggle = document.createElement("button");
toggle.id = "sidebarToggle";
toggle.className = "sidebar-toggle";
toggle.type = "button";
toggle.setAttribute("aria-label", "Toggle time predictor sidebar");
toggle.setAttribute("aria-expanded", "true");
toggle.title = "Collapse sidebar";
// Visual arrow — when collapsed will change
toggle.textContent = "›";
// append as a direct child of the sidebar so it remains visible when content is hidden
sidebar.appendChild(toggle);

const STORAGE_KEY = "taskTimerSidebarCollapsed";

function updateToggleVisual(collapsed) {
  // aria-expanded should reflect whether the region is expanded
  toggle.setAttribute("aria-expanded", String(!collapsed));
  toggle.textContent = collapsed ? "‹" : "›";
  toggle.title = collapsed ? "Expand sidebar" : "Collapse sidebar";
}

function setCollapsed(collapsed) {
  if (collapsed) {
    sidebar.classList.add("collapsed");
    document.body.classList.add("sidebar-collapsed");
  } else {
    sidebar.classList.remove("collapsed");
    document.body.classList.remove("sidebar-collapsed");
  }
  updateToggleVisual(collapsed);
}

// click handler
toggle.addEventListener("click", () => {
  const collapsed = !sidebar.classList.contains("collapsed");
  setCollapsed(collapsed);
  try {
    localStorage.setItem(STORAGE_KEY, collapsed ? "1" : "0");
  } catch (e) {
    // localStorage might be unavailable; ignore silently
  }
});

// Trigger chart resize when sidebar expands
toggle.addEventListener("click", () => {
  // Wait a bit for the sidebar animation/layout to finish
  setTimeout(() => {
    if (window._taskTimerChart) {
      window._taskTimerChart.resize();
    } else {
      // fallback for safety
      window.dispatchEvent(new Event("resize"));
    }
  }, 300); // adjust delay to match your CSS transition
});

// Detect when the sidebar finishes expanding transition
sidebar.addEventListener('transitionend', (e) => {
  // only respond to width changes
  if (e.propertyName !== 'width') return;

  // Only trigger when sidebar is expanded (not collapsed)
  if (!sidebar.classList.contains('collapsed')) {
    const chart = window._taskTimerChart;
    if (chart) {
      // Force Chart.js to reflow now that width > 0
      chart.resize();
      chart.update('none'); // redraw instantly
    } else {
      // fallback if chart not yet defined
      window.dispatchEvent(new Event('resize'));
    }
  }
});

// keyboard support (space/enter) — button element already handles Enter/Space by default
toggle.addEventListener("keydown", (e) => {
  if (e.key === "Enter" || e.key === " ") {
    e.preventDefault();
    toggle.click();
  }
});

// restore persisted state
try {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === "1") {
    setCollapsed(true);
  } else {
    setCollapsed(false);
  }
} catch (e) {
  // ignore if unavailable
}

const timer = document.createElement("div");
timer.id = "timer";

timer.innerHTML = `
    <p>Timer</p>
    <h2 id="timerSeconds">0</h2>
    <button id="pause">Start</button>
`;

document.getElementById("mySidebarContent").appendChild(timer);

const bellCurve = document.createElement("div");
bellCurve.id = "myBellCurve"

bellCurve.innerHTML = `
    <div>
        <canvas id="bell_curve"></canvas>
    </div>
    <p id="userTime"></p>
`;

document.getElementById("mySidebarContent").appendChild(bellCurve);


// sidebar.appendChild(`<p>Your Time: <span id="userTime">30</span></p>`);


const form = document.createElement("form");
form.id = "timeForm";

// Time inputs (hours, minutes, seconds)
const timeLabel = document.createElement("label");
timeLabel.textContent = "Time Spent:";

const hourInput = document.createElement("input");
hourInput.type = "number";
hourInput.min = "0";
hourInput.placeholder = "hrs";
hourInput.id = "hours";

const minuteInput = document.createElement("input");
minuteInput.type = "number";
minuteInput.min = "0";
minuteInput.max = "59";
minuteInput.placeholder = "min";
minuteInput.id = "minutes";

const secondInput = document.createElement("input");
secondInput.type = "number";
secondInput.min = "0";
secondInput.max = "59";
secondInput.placeholder = "sec";
secondInput.id = "inputSeconds";

// Submit button
const submitButton = document.createElement("button");
submitButton.type = "submit";
submitButton.textContent = "Add Time";

form.appendChild(document.createElement("br"));
form.appendChild(timeLabel);
form.appendChild(document.createElement("br"));
form.appendChild(hourInput);
form.appendChild(minuteInput);
form.appendChild(secondInput);
form.appendChild(document.createElement("br"));
form.appendChild(submitButton);

// Add form to sidebar
document.getElementById("mySidebarContent").appendChild(form);

// --- Auto-fill form fields from sidebar data ---

// Wait for the page and sidebar to be ready
// --- Auto-fill form fields from sidebar data (Canvas SPA-safe) ---
async function autoFillForm() {
  console.log("Auto-fill triggered");

  const hourField = document.getElementById("hours");
  const minField = document.getElementById("minutes");
  const secField = document.getElementById("inputSeconds");

  // Ensure fields exist
  if (!hourField || !minField || !secField) {
    console.warn("Time fields are not fully ready yet");
    return;
  }

  // ----- Timer Parsing (ONLY auto-fill needed now) -----
  const timerElem = document.getElementById("timerSeconds");

  if (timerElem) {
    // Read raw seconds from dataset (set inside updateTimer())
    const rawSeconds = timerElem.dataset.seconds;
    const total = parseInt(rawSeconds, 10);

    if (!isNaN(total)) {
      hourField.value = Math.floor(total / 3600);
      minField.value = Math.floor((total % 3600) / 60);
      secField.value = total % 60;
    }
  }

  console.log("Auto-fill complete");
}

// Re-run auto-fill whenever Canvas dynamically changes pages
const observer = new MutationObserver(() => {
  if (document.querySelector("#breadcrumbs")) {
    autoFillForm();
  }
});
observer.observe(document.body, { childList: true, subtree: true });


// --- Handle submission ---
// --- CHANGE: Removed local 'times' array ---
//let times = []; // We no longer manage state here.

form.addEventListener("submit", (event) => {
  event.preventDefault();

  //const assignment = nameInput.value.trim();
  const hours = parseInt(hourInput.value) || 0;
  const minutes = parseInt(minuteInput.value) || 0;
  const seconds = parseInt(secondInput.value) || 0;

  if (/*!assignment ||*/ (hours === 0 && minutes === 0 && seconds === 0)) {
    alert("Please enter an assignment name and a valid time.");
    return;
  }

  // convert total time to seconds
  const totalSeconds = hours * 3600 + minutes * 60 + seconds;

    // --- CHANGE: Pass totalSeconds to updateStats ---
 // times.push(totalSeconds);
  updateStats(totalSeconds); // Pass the single time to the function

  // clear fields
 // nameInput.value = "";
  hourInput.value = "";
  minuteInput.value = "";
  secondInput.value = "";
});


// --- Calculate and display stats (new version connected to backend) ---
async function updateStats(timeInSeconds) {
  // Validate the single time
  if (typeof timeInSeconds !== 'number' || timeInSeconds <= 0) {
    console.warn("updateStats called with invalid time:", timeInSeconds);
    return;
  }

  try {
    console.log("Sending to Backend:", { timeInSeconds, assignmentName, className });
    
    const response = await fetch(
      "https://us-central1-assignment-time.cloudfunctions.net/calculateStats",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
            timeInSeconds: timeInSeconds,
            assignmentName: assignmentName,
            className: className
          }),
      }
    );
    
    if (!response.ok) {
        throw new Error(`Backend error: ${response.statusText} ${await response.text()}`);
    }

    const result = await response.json();

    if (result.success) {
      // 1. Update Text Elements
      const meanElem = document.getElementById("meanTime");
      const medianElem = document.getElementById("medianTime");
      const modeElem = document.getElementById("modeTime");

      if (meanElem) meanElem.textContent = formatTime(result.mean);
      if (medianElem) medianElem.textContent = formatTime(result.median);
      if (modeElem) modeElem.textContent = formatTime(result.mode); // Fixed typo here (was medianElem)
       
      // 🔍 TEST LOG: Confirming data after submission
      console.log("📦 UPDATE STATS DATA CHECK:", {
          "User Score": timeInSeconds,
          "New Standard Deviation": result.stdDev,
          "Updated Times Array": result.allTimes
      });
      
      // 2. HANDOFF TO FRONTEND DEVS
      // Package the data for the bell curve
      const graphData = {
          allTimes: result.allTimes || [],
          mean: result.mean || 0,
          stdDev: result.stdDev || 0,
          // IMPORTANT: We include the user's specific score here
          // so the graph can plot the "You Scored" line/emoji
          userScore: timeInSeconds, 
          timestamp: new Date().toISOString()
      };

      // Method A: Attach to window
      window._assignmentStatsData = graphData;

      // Method B: Dispatch Custom Event
      const event = new CustomEvent("assignment-stats-updated", { 
          detail: graphData 
      });
      window.dispatchEvent(event);

      console.log("Stats updated and dispatched to frontend:", graphData);

    } else {
      console.error("Error from backend:", result.error);
    }
  } catch (err) {
    console.error("Error updating stats:", err);
  }
}

// --- Load stats without adding new time data ---
async function loadInitialStats() {
  // Ensure we have the necessary identifiers
  if (!assignmentName || !className) {
    console.warn("Cannot load stats: Missing Class or Assignment name.");
    return;
  }

  try {
    console.log("Fetching initial stats for:", { assignmentName, className });
    
    const response = await fetch(
      "https://us-central1-assignment-time.cloudfunctions.net/fetchStats",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
            assignmentName: assignmentName,
            className: className
        }),
      }
    );

    if (!response.ok) {
        throw new Error(`Backend error: ${response.statusText}`);
    }

    const result = await response.json();

    if (result.success) {
      // 1. Update Text Elements (Existing functionality)
      const meanElem = document.getElementById("meanTime");
      const medianElem = document.getElementById("medianTime");
      const modeElem = document.getElementById("modeTime");

      if (meanElem) meanElem.textContent = formatTime(result.mean);
      if (medianElem) medianElem.textContent = formatTime(result.median);
      if (modeElem) modeElem.textContent = formatTime(result.mode);
      
      console.log("📦 LOAD STATS DATA CHECK:", {
          "Total Data Points": result.allTimes ? result.allTimes.length : 0,
          "Standard Deviation": result.stdDev,
          "Raw Times Array": result.allTimes
      });
      // 2. HANDOFF TO FRONTEND DEVS 
      // specific data package for the bell curve
      const graphData = {
          allTimes: result.allTimes || [],
          mean: result.mean || 0,
          stdDev: result.stdDev || 0,
          timestamp: new Date().toISOString()
      };

      // Method A: Attach to window (easiest for them to find in console)
      window._assignmentStatsData = graphData;

      // Method B: Dispatch a Custom Event (Best practice)
      // The frontend devs can add an event listener for "assignment-stats-loaded"
      const event = new CustomEvent("assignment-stats-loaded", { 
          detail: graphData 
      });
      window.dispatchEvent(event);

      console.log("Initial stats loaded and dispatched to frontend:", graphData);
    } else {
      console.error("Error fetching initial stats:", result.error);
    }
  } catch (err) {
    console.error("Error loading initial stats:", err);
  }
}

// --- Helper functions ---
function calculateMedian(arr) {
  const sorted = [...arr].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 !== 0
    ? sorted[mid]
    : (sorted[mid - 1] + sorted[mid]) / 2;
}

function calculateMode(arr) {
  const freq = {};
  arr.forEach((num) => (freq[num] = (freq[num] || 0) + 1));
  const maxFreq = Math.max(...Object.values(freq));
  const mode = Object.keys(freq).find((k) => freq[k] === maxFreq);
  return parseFloat(mode);
}

// Converts seconds back into hh:mm:ss
function formatTime(totalSeconds) {
  const hrs = Math.floor(totalSeconds / 3600);
  const mins = Math.floor((totalSeconds % 3600) / 60);
  const secs = Math.floor(totalSeconds % 60);
  return `${hrs}h ${mins}m ${secs}s`;
}

// Load settings first, then display the graph
chrome.storage.sync.get(
  ["primaryColor", "secondaryColor", "accentColor", "chosenEmoji"],
  (data) => {
    const primaryColor = data.primaryColor || "rgba(0, 0, 0, 1)";
    const secondaryColor = data.secondaryColor || "rgba(122, 246, 255, 1)";
    const accentColor = data.accentColor || "rgba(0, 0, 0, 1)";
    const chosenEmoji = data.chosenEmoji || "🔥";

    // Call displayGraph() with user settings
    displayGraph(primaryColor, secondaryColor, accentColor, chosenEmoji);

    // 1. Load the initial stats immediately
    loadInitialStats();

    // Then start the timer
    timerInit(updateStats);
  }
);

//getInfo();







