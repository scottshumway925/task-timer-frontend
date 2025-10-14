import { Chart, LineController, LinearScale, CategoryScale, Legend, Tooltip, LineElement, PointElement } from 'chart.js';

Chart.register(LineController, LinearScale, CategoryScale, Legend, Tooltip, LineElement, PointElement);

let bellCurve_html = `
  <div>
    <canvas id="bell_curve"></canvas>
  </div>
`;

function makeBellCurvePoints(stdDev, mean, points) {
  // f(x) = (1 / (σ√(2π))) × e^(-(x - μ)² / (2σ²))
  const data = [];
  
  // Get the steps between each point
  const start = mean - stdDev * 4;
  const end = mean + stdDev * 4;
  const step = (end - start) / points;
  
  for (let x = start; x < end; x += step) {
    const exponent = -1*(x - mean) ** 2 / (2 * (stdDev ** 2));
    const y = (1 / (stdDev * Math.sqrt(2 * Math.PI))) * Math.exp(exponent);
    data.push({ x: x, y: y });
  }
  
  return data; // Return the data!
}

export default function displayGraph() {
  const data = makeBellCurvePoints(1, 0, 100);
  const graphData = {
    labels: data.map(point => point.x.toFixed(2)),
    datasets: [{
      data: data.map(point => point.y),
      fill: false,
      tension: 0.1,
      borderColor: 'rgb(75, 192, 192)',
      borderWidth: 2
    }]
  };

  new Chart(
    document.querySelector("#bell_curve"),
    {
      type: 'line',
      data: graphData
    }
  );
}