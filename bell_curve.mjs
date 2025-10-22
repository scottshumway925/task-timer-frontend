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
let youScored = 28;
let mean = 29.8929;
let stdDev = 2.6771424759872;

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

export default function displayGraph() {
    const bellCurve = makeBellCurvePoints(stdDev, mean, 100);

    // Build histogram data
    const frequencies = {};
    dataPoints.forEach((num) => {
        frequencies[num] = (frequencies[num] || 0) + 1;
    });

    const histogram = Object.entries(frequencies).map(([num, freq]) => ({
        x: Number(num),
        y: freq / dataPoints.length,
    }));

    const personalData = [getBellCurveY(youScored, mean, stdDev)];

    const ctx = document.querySelector("#bell_curve");

    const allX = [
        ...bellCurve.map(p => p.x),
        ...histogram.map(p => p.x),
        youScored  // include single point if you plot it
    ];

    const minX = Math.min(...allX) - 0.5;
    const maxX = Math.max(...allX) + 0.5;


    new Chart(ctx, {
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
                    yAxisID: "y"
                },
                {
                    type: "line",
                    label: "Bell Curve",
                    data: bellCurve,
                    borderColor: "rgb(75, 192, 192)",
                    borderWidth: 2,
                    fill: false,
                    pointRadius: 0,
                    tension: 0.1,
                    yAxisID: "y"
                },
                {
                    type: "bar",
                    label: "Histogram",
                    data: histogram,
                    backgroundColor: "rgba(255, 99, 132, 0.5)",
                    borderColor: "rgba(255, 99, 132, 1)",
                    borderWidth: 1,
                    barPercentage: 1.0,
                    categoryPercentage: 1.0
                }
            ]
        },
        options: {
            scales: {
                x: {
                    type: "linear",
                    min: Math.floor(minX),
                    max: Math.ceil(maxX),
                    title: {
                        display: true,
                        text: "Score"
                    }
                },
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: "Frequency / Probability"
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
        }
    });
}
