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
2
];
let youScored = 0;
let meanVal = 1;
let stdVal = 1;

function getBellCurveY(x, mean, stdDev) {
    const exponent = -1 * (x - mean) ** 2 / (2 * (stdDev ** 2));
    const y =
        (1 / (stdDev * Math.sqrt(2 * Math.PI))) * Math.exp(exponent);
    return { x, y };
}

function makeBellCurvePoints(stdDev, mean, points) {
    const data = [];
    const start = mean - stdDev * 4;
    const end = mean + stdDev * 4;
    const step = (end - start) / points;

    for (let x = start; x <= end; x += step) {
        data.push(getBellCurveY(x, mean, stdDev));
    }
    return data;
}

export default function displayGraph(primaryColor, secondaryColor, accentColor, chosenEmoji) {

    // If backend sent stats, override everything
    let times = dataPoints;
    let userScoreVal = youScored;

    console.log(`Deviation: ${stdVal}`);


    //
    // 1. Bell curve
    //
    const bellCurve = makeBellCurvePoints(stdVal, meanVal, 100);

    //
    // 2. Histogram (auto-built from times array)
    //
    const frequencies = {};
    times.forEach(num => {
        frequencies[num] = (frequencies[num] || 0) + 1;
    });

    console.log(frequencies);

    const histogram = Object.entries(frequencies).map(([num, freq]) => ({
        x: Number(num),
        y: freq / times.length
    }));

    //
    // 3. User point (if available)
    //
    const personalData = userScoreVal != null
        ? [getBellCurveY(userScoreVal, meanVal, stdVal)]
        : [];

    //
    // 4. Chart bounds
    //
    const allX = [
        ...bellCurve.map(p => p.x),
        ...histogram.map(p => p.x),
        ...(userScoreVal != null ? [userScoreVal] : [])
    ];


    const minX = Math.min(...allX) - 0.5;
    const maxX = Math.max(...allX) + 0.5;

    //
    // 5. Destroy old chart first
    //
    const ctx = document.querySelector("#bell_curve");

    if (window._taskTimerChart) {
        window._taskTimerChart.destroy();
    }

    //
    // 6. Create new chart
    //
    window._taskTimerChart = new Chart(ctx, {
        type: "bar",
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
                    yAxisID: "y"
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
                    yAxisID: "yBell"
                },
                {
                    type: "bar",
                    label: "Histogram",
                    data: histogram,
                    backgroundColor: secondaryColor,
                    borderColor: accentColor,
                    borderWidth: 1,
                    barPercentage: 1.0,
                    categoryPercentage: 1.0
                }
            ]
        },
        options: {
            interaction: { mode: null },
            scales: {
                x: {
                    type: "linear",
                    min: Math.floor(minX),
                    max: Math.ceil(maxX),
                    title: { display: true, text: "Time" }
                },
                y: {
                    beginAtZero: true,
                    title: { display: true, text: "Frequency" }
                },
                yBell: {
                    position: 'right',
                    beginAtZero: true,
                    title: { display: true, text: 'Probability Density' },
                    grid: { drawOnChartArea: false }
                }
            },
            plugins: {
                legend: { display: false },
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


//
// 📊 LISTEN FOR BACKEND DATA → UPDATE GRAPH
//

// When initial stats load
window.addEventListener("assignment-stats-loaded", (e) => {
    console.log("Bell Curve: Initial stats loaded", e.detail);

    const { allTimes, mean, stdDev } = e.detail;

    dataPoints = allTimes;
    meanVal = mean
    stdVal = stdDev;

    chrome.storage.sync.get(
        ["primaryColor", "secondaryColor", "accentColor", "chosenEmoji"],
        (data) => {
            const primaryColor = data.primaryColor || "rgba(0, 0, 0, 1)";
            const secondaryColor = data.secondaryColor || "rgba(122, 246, 255, 1)";
            const accentColor = data.accentColor || "rgba(0, 0, 0, 1)";
            const chosenEmoji = data.chosenEmoji || "🔥";

            displayGraph(
                primaryColor,
                secondaryColor,
                accentColor,
                chosenEmoji,
            );

            // You can now use the colors below, e.g., displayGraph(...)
        }
    );
});

// When user adds a new time & backend updates
window.addEventListener("assignment-stats-updated", (e) => {
    console.log("Bell Curve: Stats updated", e.detail);

    const { allTimes, mean, stdDev } = e.detail;

    dataPoints = allTimes;
    meanVal = mean
    stdVal = stdDev;

    chrome.storage.sync.get(
        ["primaryColor", "secondaryColor", "accentColor", "chosenEmoji"],
        (data) => {
            const primaryColor = data.primaryColor || "rgba(0, 0, 0, 1)";
            const secondaryColor = data.secondaryColor || "rgba(122, 246, 255, 1)";
            const accentColor = data.accentColor || "rgba(0, 0, 0, 1)";
            const chosenEmoji = data.chosenEmoji || "🔥";

            displayGraph(
                primaryColor,
                secondaryColor,
                accentColor,
                chosenEmoji,
            );

            // You can now use the colors below, e.g., displayGraph(...)
        }
    );


    // Re-render graph immediately
});
