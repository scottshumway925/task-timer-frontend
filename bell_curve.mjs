import { Chart } from "chart.js";

let bellCurve_html = `
    <div>
        <canvas id="bell_curve"></canvas>
    </div>
`;

function makeBellCurvePoints(stdDev, mean, points) {
    //f(x) = (1 / (σ√(2π))) × e^(-(x - μ)² / (2σ²))
    const data = [];
    //here we get the steps between each point
    const start = mean - stdDev * 4
    const end = mean + stdDev * 4
    const step = (end-start) / points 

    for(let x = start; x < end; x+=step) {
        let y = (1/ (stdDev * Math.sqrt(2*Math.PI))) * Math.E^(-(x - mean)^2 / (2*(stdDev^2)));
        data.push({x:x, y:y});
    }
}

export function displayGraph() {
    const data = makeBellCurvePoints(0, 1, 100);

    console.log("we making graph");
    const graphData = {
        labels: data.map(point => point.x),
        datasets:[{
            data: data.map(point => point.y),
            fill: false,
            tension: 0.1,
            borderColor: 'rgb(75, 192, 192)',
        }]
    }
    new Chart (
        document.querySelector("#bell_curve"),
        {
            type: 'line',
            data: graphData
        }
    );
}