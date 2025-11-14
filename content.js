import displayGraph from "./bell_curve.mjs";
import {timerInit, getCurrentSeconds} from "./timer";
import {getInfo, getClassName, getAssignmentName, getCourseId, getAssignmentId} from "./classInfo";
import {writeTimingData, listenToStatistics} from "./firestoreSync.js";
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

// Assignment name input
const nameLabel = document.createElement("label");
nameLabel.textContent = "Assignment Name:";
nameLabel.setAttribute("for", "assignmentName");

const nameInput = document.createElement("input");
nameInput.type = "text";
nameInput.id = "assignmentName";
nameInput.placeholder = "e.g. Essay 1";

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

// Add elements to form
form.appendChild(nameLabel);
form.appendChild(document.createElement("br"));
form.appendChild(nameInput);
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

// --- Handle submission ---
let times = []; // store total seconds for each assignment

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const assignment = nameInput.value.trim();
  const hours = parseInt(hourInput.value) || 0;
  const minutes = parseInt(minuteInput.value) || 0;
  const seconds = parseInt(secondInput.value) || 0;

  if (!assignment || (hours === 0 && minutes === 0 && seconds === 0)) {
    alert("Please enter an assignment name and a valid time.");
    return;
  }

  // convert total time to seconds
  const totalSeconds = hours * 3600 + minutes * 60 + seconds;
  times.push(totalSeconds);
  
  // Write to Firestore
  const courseId = getCourseId();
  const assignmentId = getAssignmentId();
  const className = getClassName();
  const assignmentName = getAssignmentName();
  
  if (courseId && assignmentId) {
    const success = await writeTimingData(courseId, assignmentId, totalSeconds, assignmentName, className);
    if (success) {
      console.log('Timing data submitted to Firestore');
      // Show success message
      submitButton.textContent = 'Submitted!';
      setTimeout(() => {
        submitButton.textContent = 'Add Time';
      }, 2000);
    } else {
      alert('Failed to submit timing data. Please try again.');
    }
  } else {
    console.warn('Could not extract course/assignment ID from URL');
  }
  
  updateStats();

  // clear fields
  nameInput.value = "";
  hourInput.value = "";
  minuteInput.value = "";
  secondInput.value = "";
});


// --- Calculate and display stats from Firestore
function updateStats() {
  // This is now handled by the Firestore listener
  // Kept for local display fallback
  if (times && times.length > 0) {
    const localMean = times.reduce((a, b) => a + b, 0) / times.length;
    const localMedian = calculateMedian(times);
    const localMode = calculateMode(times);
    
    // Only update if Firestore hasn't loaded yet
    const meanElem = document.getElementById("meanTime");
    if (meanElem && meanElem.textContent === "00:00:00") {
      meanElem.textContent = formatTime(localMean);
    }
  }
}

// Display statistics from Firestore
function displayStatistics(stats) {
  const meanElem = document.getElementById("meanTime");
  const medianElem = document.getElementById("medianTime");
  const modeElem = document.getElementById("modeTime");

  if (meanElem) meanElem.textContent = formatTime(stats.mean || 0);
  if (medianElem) medianElem.textContent = formatTime(stats.median || 0);
  if (modeElem) modeElem.textContent = formatTime(stats.mode || 0);
  
  console.log(`Statistics updated: ${stats.count || 0} submissions`);
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

    // Then start the timer
    timerInit();
  }
);

// Get assignment info
getInfo();

// Set up Firestore listener for statistics
// Wait a bit for getInfo() to extract IDs
setTimeout(() => {
  const courseId = getCourseId();
  const assignmentId = getAssignmentId();
  
  if (courseId && assignmentId) {
    console.log(`Setting up statistics listener for course ${courseId}, assignment ${assignmentId}`);
    listenToStatistics(courseId, assignmentId, displayStatistics);
  } else {
    console.warn('Could not extract course/assignment ID - statistics will not be loaded');
  }
}, 1000);







