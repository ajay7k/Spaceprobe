const protonCtx = document.getElementById('protonFluxChart').getContext('2d');
let protonData = [];
let selectedTimeRange = 24 * 60 * 60 * 1000; // 24 hours
let activeEnergyRanges = { "1MeV": true, "10MeV": true, "100MeV": true, "500MeV": true };

// === Create Gradients ===
function createProtonGradients(ctx, chartArea) {
    if (!chartArea) return {};

    const grad1 = ctx.createLinearGradient(chartArea.left, 0, chartArea.right, 0);
    grad1.addColorStop(0, '#ff9966');
    grad1.addColorStop(1, '#ff3300');

    const grad10 = ctx.createLinearGradient(chartArea.left, 0, chartArea.right, 0);
    grad10.addColorStop(0, '#66ff99');
    grad10.addColorStop(1, '#00ff66');

    const grad100 = ctx.createLinearGradient(chartArea.left, 0, chartArea.right, 0);
    grad100.addColorStop(0, '#33ccff');
    grad100.addColorStop(1, '#0066ff');

    const grad500 = ctx.createLinearGradient(chartArea.left, 0, chartArea.right, 0);
    grad500.addColorStop(0, '#fff17a');
    grad500.addColorStop(1, '#ffd700');

    return { grad1, grad10, grad100, grad500 };
}

// === Chart Initialization ===
let protonChart = new Chart(protonCtx, {
    type: 'line',
    data: {
        labels: [],
        datasets: [
            { label: "≥1 MeV", data: [], borderColor: '#FF5733', borderWidth: 2, tension: 0.35, pointRadius: 0, backgroundColor: 'rgba(255, 87, 51, 0.25)' },
            { label: "≥10 MeV", data: [], borderColor: '#33FF57', borderWidth: 2, tension: 0.35, pointRadius: 0, backgroundColor: 'rgba(51, 255, 87, 0.25)' },
            { label: "≥100 MeV", data: [], borderColor: '#338CFF', borderWidth: 2, tension: 0.35, pointRadius: 0, backgroundColor: 'rgba(51, 140, 255, 0.25)' },
            { label: "≥500 MeV", data: [], borderColor: '#FFD700', borderWidth: 2, tension: 0.35, pointRadius: 0, backgroundColor: 'rgba(255, 215, 0, 0.25)' }
        ]
    },
    options: {
        responsive: true,
        maintainAspectRatio: true,
        aspectRatio: 3,
        scales: {
            x: { 
                type: 'time', 
                time: { 
                    unit: 'hour', 
                    tooltipFormat: 'yyyy-MM-dd HH:mm \'UTC\'', 
                    displayFormats: { hour: 'HH:mm' }
                },
                adapters: { date: { zone: 'utc' } },
                ticks: { 
                    color: 'white',
                    callback: (value) => new Date(value).toISOString().substring(11, 16)
                },
                grid: { color: 'rgba(0, 255, 213, 0.3)' },
                title: { display: true, text: 'Time (UTC)', color: 'white' }
            },
            y: { 
                type: 'logarithmic', 
                title: { display: true, text: "Particles · cm² · s⁻¹ · sr⁻¹", color: 'white' }, 
                ticks: { 
                    color: 'white', 
                    callback: (value) => {
                        const allowedTicks = [1e-1, 1e0, 1e1, 1e2, 1e3, 1e4, 1e5, 1e6];
                        return allowedTicks.includes(value) ? value.toExponential(1) : '';
                    } 
                }, 
                grid: { color: 'rgba(255, 255, 255, 0.2)', drawTicks: false } 
            }
        },
        plugins: {
            legend: {
                labels: { color: 'white', usePointStyle: true, pointStyle: 'line' }
            },
            tooltip: {
                mode: 'index',
                intersect: false,
                callbacks: {
                    title: (tooltipItems) => {
                        const date = new Date(tooltipItems[0].parsed.x);
                        return date.toISOString().replace('T', ' ').substring(0, 16) + ' UTC';
                    }
                }
            }
        },
        interaction: { mode: 'index', intersect: false },
        animation: false
    },
    plugins: [{
        id: 'neonGradientLines',
        beforeDatasetDraw(chart, args, options) {
            const { ctx, chartArea } = chart;
            if (!chartArea) return;

            const gradients = createProtonGradients(ctx, chartArea);

            chart.data.datasets[0].borderColor = gradients.grad1;
            chart.data.datasets[1].borderColor = gradients.grad10;
            chart.data.datasets[2].borderColor = gradients.grad100;
            chart.data.datasets[3].borderColor = gradients.grad500;
        }
    }, {
        id: 'verticalHoverLine',
        beforeDraw: (chart) => {
            if (!chart.tooltip?.active || chart.tooltip.opacity === 0) return;
            const ctx = chart.ctx;
            const x = chart.tooltip.caretX;
            ctx.save();
            ctx.beginPath();
            ctx.moveTo(x, chart.chartArea.top);
            ctx.lineTo(x, chart.chartArea.bottom);
            ctx.lineWidth = 1;
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
            ctx.stroke();
            ctx.restore();
        }
    }]
});

// === Fetch Proton Flux Data ===
async function fetchProtonFluxData() {
    try {
        const response = await fetch('https://services.swpc.noaa.gov/json/goes/primary/integral-protons-1-day.json');
        const rawData = await response.json();

        let groupedData = {}; 

        rawData.forEach(entry => {
            const timestamp = Date.parse(entry.time_tag);
            const timeUTC = new Date(timestamp).toISOString();

            if (!groupedData[timeUTC]) {
                groupedData[timeUTC] = {
                    time: new Date(timestamp),
                    flux1MeV: null,
                    flux10MeV: null,
                    flux100MeV: null,
                    flux500MeV: null
                };
            }

            const fluxValue = parseFloat(entry.flux);
            if (!isNaN(fluxValue)) {
                switch (entry.energy) {
                    case ">=1 MeV": groupedData[timeUTC].flux1MeV = fluxValue; break;
                    case ">=10 MeV": groupedData[timeUTC].flux10MeV = fluxValue; break;
                    case ">=100 MeV": groupedData[timeUTC].flux100MeV = fluxValue; break;
                    case ">=500 MeV": groupedData[timeUTC].flux500MeV = fluxValue; break;
                }
            }
        });

        protonData = Object.values(groupedData);
        updateProtonChart();
    } catch (error) {
        console.error("Error fetching proton flux data:", error);
    }
}

// === Update Chart ===
function updateProtonChart() {
    const now = new Date();
    const cutoffTime = now.getTime() - selectedTimeRange;

    const filteredData = protonData.filter(point => point.time.getTime() >= cutoffTime);

    protonChart.data.labels = filteredData.map(p => p.time);
    protonChart.data.datasets[0].data = filteredData.map(p => p.flux1MeV ?? null);
    protonChart.data.datasets[1].data = filteredData.map(p => p.flux10MeV ?? null);
    protonChart.data.datasets[2].data = filteredData.map(p => p.flux100MeV ?? null);
    protonChart.data.datasets[3].data = filteredData.map(p => p.flux500MeV ?? null);

    protonChart.update();
}

// === Toggle Buttons ===
function toggleEnergyRange(datasetIndex, buttonId, energyKey) {
    let dataset = protonChart.data.datasets[datasetIndex];
    dataset.hidden = !dataset.hidden;
    activeEnergyRanges[energyKey] = !activeEnergyRanges[energyKey];
    document.getElementById(buttonId).classList.toggle('active-button', !dataset.hidden);
    protonChart.update();
}

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('btn-1MeV').addEventListener('click', () => toggleEnergyRange(0, 'btn-1MeV', '1MeV'));
    document.getElementById('btn-10MeV').addEventListener('click', () => toggleEnergyRange(1, 'btn-10MeV', '10MeV'));
    document.getElementById('btn-100MeV').addEventListener('click', () => toggleEnergyRange(2, 'btn-100MeV', '100MeV'));
    document.getElementById('btn-500MeV').addEventListener('click', () => toggleEnergyRange(3, 'btn-500MeV', '500MeV'));
});

// === Auto Update ===
fetchProtonFluxData();
setInterval(fetchProtonFluxData, 60000);
