import displayGraph from "./bell_curve.mjs";
// Create sidebar
const sidebar = document.createElement("div");
sidebar.id = "mySidebar";

sidebar.innerHTML = `
  <div id="mySidebarContent">
    <h2>Time Predictor</h2>
    <p>Here you will see all the time information that we have gathered to gain a rough estimate of the amount of time this assignment will take you.</p>
    <p>Mean:   1:42:02</p>
    <p>Median:   1:37:56</p>
    <p>Mode:   1:40:40</p>
  </div>
`;

// Append the sidebar to the body
document.body.appendChild(sidebar);

const bellCurve = document.createElement("div");
bellCurve.id = "myBellCurve"
const imgSrc = chrome.runtime.getURL("bell-curve.webp")

bellCurve.innerHTML = `
    <div>
        <canvas id="bell_curve"></canvas>
    </div>
`;

document.getElementById("mySidebarContent").appendChild(bellCurve);


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
secondInput.id = "seconds";

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

form.addEventListener("submit", (event) => {
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
  updateStats();

  // clear fields
  nameInput.value = "";
  hourInput.value = "";
  minuteInput.value = "";
  secondInput.value = "";
});

// --- Calculate and display stats ---
function updateStats() {
  const mean = (times.reduce((a, b) => a + b, 0) / times.length);
  const median = calculateMedian(times);
  const mode = calculateMode(times);

  document.getElementById("meanTime").textContent = formatTime(mean);
  document.getElementById("medianTime").textContent = formatTime(median);
  document.getElementById("modeTime").textContent = formatTime(mode);
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

displayGraph();