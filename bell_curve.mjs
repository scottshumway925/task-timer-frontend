import { Chart, LineController, LinearScale, CategoryScale, Legend, Tooltip, LineElement, PointElement } from 'chart.js';

Chart.register(LineController, LinearScale, CategoryScale, Legend, Tooltip, LineElement, PointElement);

let bellCurve_html = `
  <div>
    <canvas id="bell_curve"></canvas>
  </div>
`;

let dataPoints = [28, 29, 29, 29, 30, 30, 30, 30, 30, 31, 31, 31, 32];
let youScored = 28;
let mean = 30;
let stdDev = 1;

function makeBellCurvePoints(stdDev, mean, points) {
  // f(x) = (1 / (σ√(2π))) × e^(-(x - μ)² / (2σ²))
  const data = [];
  
  // Get the steps between each point
  const start = mean - stdDev * 4;
  const end = mean + stdDev * 4;
  const step = (end - start) / points;
  
  for (let x = start; x < end; x += step) {
    data.push(getBellCurveY(x, mean, stdDev));
  }
  
  return data; // Return the data!
}

function getBellCurveY(x, mean, stdDev) {
  const exponent = -1*(x - mean) ** 2 / (2 * (stdDev ** 2));
  const y = (1 / (stdDev * Math.sqrt(2 * Math.PI))) * Math.exp(exponent);
  return {x: x, y: y};
}

export default function displayGraph() {
  const data = makeBellCurvePoints(stdDev, mean, 100);
  const frequencies = {};
  dataPoints.forEach(num => {
      frequencies[num] = (frequencies[num] || 0) + 1;
  });

  console.log(frequencies);

  const dataset = Object.entries(frequencies).map(([num, freq]) => ({
      x: Number(num),
      y: freq/dataPoints.length
  }));

  const personalData = [getBellCurveY(youScored, mean, stdDev)]
  console.log(personalData);

  const graphData = {
    labels: data.map(point => point.x.toFixed(2)),
    datasets: [
      {
        label: "You Scored",
        data: personalData,
        fill: true,
        tension: 0.1,
        borderColor: 'rgba(255, 255, 255, 1)',
        borderWidth: 0,
        pointBorderWidth: 3
      },
      {
      label: "",
      data: data.map(point => point.y),
      fill: true,
      tension: 0.1,
      borderColor: 'rgb(75, 192, 192)',
      borderWidth: 2,
      pointBorderWidth: 0
      },
      {
        data: dataset,
        fill: true,
        tension: 0.1,
        borderColor: 'rgba(199, 86, 52, 1)',
        borderWidth: 0,
        pointBorderWidth: 2
      }
    ]
  };

  new Chart(
    document.querySelector("#bell_curve"),
    {
      type: 'line',
      data: graphData,
      options: {
        scales: {
          x: {
            type: "linear"
          }
        },
        plugins: {
          legend: {
            display: false
          },
        },
      tooltips: {
        callbacks: {
          label: function(tooltipItem) {
            console.log(tooltipItem)
            return context.parsed.y.toFixed(5);
          }
        }
      }
    }
  }
  );
}