import {
    Chart,
    BarController,
    LineController,
    BarElement,
    LinearScale,
    CategoryScale,
    Legend,
    Tooltip,
    LineElement,
    PointElement
} from "chart.js";

Chart.register(
    BarController,
    LineController,
    BarElement,
    LinearScale,
    CategoryScale,
    Legend,
    Tooltip,
    LineElement,
    PointElement
);

let dataPoints = [
    24, 25, 26, 27,
    28, 28, 28,
    29, 29, 29, 29, 29,
    30, 30, 30, 30, 30, 30,
    31, 31, 31, 31,
    32, 32, 33, 34,
    35, 36
];
let youScored = 60;
let meanGraph = 29.8929;
let stdDev = 2.6771424759872;

export function setGraphData(graphData) {
    dataPoints = graphData.allTimes.map(point => point/60);
    meanGraph = graphData.mean/60;
    stdDev = graphData.stdDev/60;
    console.log(`Graph data set to ${dataPoints}, ${meanGraph}, ${stdDev}`);

    chrome.storage.sync.get(
        ["primaryColor", "secondaryColor", "accentColor", "chosenEmoji"],
        async (data) => {
            const primaryColor = data.primaryColor || "rgba(0, 0, 0, 1)";
            const secondaryColor = data.secondaryColor || "rgba(122, 246, 255, 1)";
            const accentColor = data.accentColor || "rgba(0, 0, 0, 1)";
            const chosenEmoji = data.chosenEmoji || "🔥";

            // Call displayGraph() with user settings
            displayGraph(primaryColor, secondaryColor, accentColor, chosenEmoji);
        }
    );

}

function getBellCurveY(x, mean, stdDev) {
    const exponent = -1 * (x - mean) ** 2 / (2 * (stdDev ** 2));
    const y =
        (1 / (stdDev * Math.sqrt(2 * Math.PI))) * Math.exp(exponent);
    return { x, y };
}

function makeBellCurvePoints(stdDev, mean, points) {
    console.log("making bell curve pointr")
    const data = [];
    console.log("data initialized")
    const start = mean - stdDev * 4;
    console.log("start made")
    const end = mean + stdDev * 4;
    console.log("end made")
    const step = end - start > 0 ? (end - start) / points : 1;
    console.log("step made")

    for (let x = start; x <= end; x += step) {
        data.push(getBellCurveY(x, mean, stdDev));
    }
    console.log("data completed")
    return data;
}

export default function displayGraph(primaryColor, secondaryColor, accentColor, chosenEmoji) {
    console.log("Graph display called");
    const bellCurve = makeBellCurvePoints(stdDev, meanGraph, 100);
    console.log("bell curve points made");

    // Build histogram data
    const frequencies = {};
    dataPoints.forEach((num) => {
        frequencies[num] = (frequencies[num] || 0) + 1;
    });

    console.log("histogram Made");

    const histogram = Object.entries(frequencies).map(([num, freq]) => ({
        x: Number(num),
        y: freq / dataPoints.length,
    }));

    console.log("histogram object")

    const personalData = [getBellCurveY(youScored, meanGraph, stdDev)];

    console.log("personal data");

    const ctx = document.querySelector("#bell_curve");

    console.log("selected")

    const allX = [
        ...bellCurve.map(p => p.x),
        ...histogram.map(p => p.x),
        youScored  // include single point if you plot it
    ];

    console.log("all x made")

    const minX = Math.min(...allX) - 0.5;
    const maxX = Math.max(...allX) + 0.5;

    console.log("min and max found");

    // Destroy previous instance if it exists
    if (window._taskTimerChart) {
      window._taskTimerChart.destroy();
      console.log("destroyed");
    }

    console.log("destroy checked");

    // Store the chart instance so other scripts can trigger a resize/update after show/hide
    window._taskTimerChart = new Chart(ctx, {
        type: "bar", // Base chart type
        data: {
            datasets: [
                {
                    type: "line",
                    label: "You Scored",
                    data: personalData,
                    borderColor: "white",
                    backgroundColor: "white",
                    pointRadius: 5,
                    pointHoverRadius: 7,
                    yAxisID: "y2"
                },
                {
                    type: "line",
                    label: "Bell Curve",
                    data: bellCurve,
                    borderColor: primaryColor,
                    borderWidth: 2,
                    fill: false,
                    pointRadius: 0,
                    tension: 0.1,
                    yAxisID: "y2"
                },
                {
                    type: "bar",
                    label: "Histogram",
                    data: histogram,
                    backgroundColor: secondaryColor,
                    borderColor: accentColor,
                    borderWidth: 1,
                    barPercentage: 1.0,
                    categoryPercentage: 1.0,
                    yAxisID: "y1"
                }
            ]
        },
        options: {
            interaction: {
                mode: null // disables hover interactions entirely
            },
            scales: {
                x: {
                    type: "linear",
                    min: Math.floor(minX),
                    max: Math.ceil(maxX),
                    title: {
                        display: true,
                        text: "Time"
                    }
                },
                y1: {
                    type: "linear",
                    position: "left",
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: "Frequency (Histogram)"
                    },
                    grid: {
                        drawOnChartArea: true  // Show gridlines
                    }
                },
                y2: {
                    type: "linear",
                    position: "right",
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: "Probability Density (Bell Curve)"
                    },
                    grid: {
                        drawOnChartArea: false  // Don't overlap gridlines
                    }
                }
            },
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: (tooltipItem) =>
                            `${tooltipItem.dataset.label}: ${tooltipItem.parsed.y.toFixed(4)}`
                    }
                }
            }
        },
        plugins: [emojiMarker(chosenEmoji)]
    });
    console.log("graph made");
}


const emojiMarker = (chosenEmoji) => ({
    id: "emojiMarker",
    afterDatasetsDraw(chart) {
        const ctx = chart.ctx;
        const dsIndex = chart.data.datasets.findIndex(ds => ds.label === "You Scored");
        if (dsIndex === -1) return;

        const meta = chart.getDatasetMeta(dsIndex);
        if (!meta.data[0]) return; // just in case chart not rendered yet

        const { x, y } = meta.data[0].tooltipPosition(); // get pixel position

        ctx.save();
        ctx.font = "20px sans-serif"; // adjust size as needed
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(chosenEmoji, x, y-2); // draw emoji slightly above the point
        ctx.restore();
    }
});
