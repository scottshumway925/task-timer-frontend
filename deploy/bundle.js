(() => {
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __esm = (fn, res) => function __init() {
    return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
  };
  var __commonJS = (cb, mod) => function __require() {
    return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
  };

  // main.js
  function init() {
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
    document.querySelector("#sidebarToggle").addEventListener("click", toggleSidebar);
  }
  function toggleSidebar() {
    document.querySelector("#sidebar").classList.toggle("closed");
  }
  var init_main = __esm({
    "main.js"() {
    }
  });

  // content.js
  var require_content = __commonJS({
    "content.js"() {
      init_main();
      init();
    }
  });
  require_content();
})();
