// Create sidebar
const sidebar = document.createElement("div");
sidebar.id = "mySidebar";

sidebar.innerHTML = `
  <div id="mySidebarContent">
    <h2>Time Predictor</h2>
    <p>Here you will see all the time information that we have gathered to gain a rough estimate of the amount of time this assignment will take you.</p>
    <p>Mean: </p>
    <p>Median: </p>
    <p>Mode: </p>
  </div>
`;

// Append the sidebar to the body
document.body.appendChild(sidebar);