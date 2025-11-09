const ctx = document.getElementById('solarWindChart').getContext('2d');

let latestBz = "--";
let latestBt = "--";
let fullData = [];
let HOURS_TO_DISPLAY = 24; // Default time range
const ACCENT_COLOR = '#00ffd5';

// === Create Gradients ===
function createGradients(ctx, chartArea) {
    if (!chartArea) return {};
    const bzGradient = ctx.createLinearGradient(chartArea.left, 0, chartArea.right, 0);
    bzGradient.addColorStop(0, '#ff6600');
    bzGradient.addColorStop(1, '#ff0000');

    const btGradient = ctx.createLinearGradient(chartArea.left, 0, chartArea.right, 0);
    btGradient.addColorStop(0, '#00eaff');
    btGradient.addColorStop(1, '#0080ff');

    return { bzGradient, btGradient };
}

// === Chart Initialization ===
let solarWindChart = new Chart(ctx, {
    type: 'line',
    data: {
        labels: [],
        datasets: [
            { 
                label: "Bz GSM (nT)",
                data: [],
                borderColor: function(context) {
                    const chart = context.chart;
                    const { bzGradient } = createGradients(chart.ctx, chart.chartArea);
                    return bzGradient;
                },
                backgroundColor: 'rgba(255, 0, 0, 0.2)',
                borderWidth: 2,  
                tension: 0.4,
                pointRadius: 0,
                pointHoverRadius: 0 
            },
            { 
                label: "Bt (nT)",
                data: [],
                borderColor: function(context) {
                    const chart = context.chart;
                    const { btGradient } = createGradients(chart.ctx, chart.chartArea);
                    return btGradient;
                },
                backgroundColor: 'rgba(0, 255, 255, 0.2)',
                borderWidth: 2,  
                tension: 0.4,
                pointRadius: 0,
                pointHoverRadius: 0 
            }
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
                adapters: {
                    date: {
                        zone: 'utc' // ✅ Force UTC display
                    }
                },
                ticks: { 
                    color: 'white',
                    callback: function(value) {
                        const d = new Date(value);
                        return d.toISOString().substring(11, 16); // "HH:mm" in UTC
                    }
                },
                title: { display: true, text: "Time (UTC)", color: 'white' },
                grid: { color: 'rgba(0, 255, 213, 0.3)' }
            },
            y: { 
                title: { display: true, text: "nT", color: 'white' },
                beginAtZero: false,
                ticks: { color: 'white' },
                grid: { color: 'rgba(255, 255, 255, 0.2)' }
            }
        },
        plugins: {
            legend: { display: false },
            tooltip: {
                mode: 'nearest',
                intersect: false,
                callbacks: {
                    title: function(context) {
                        // ✅ Tooltip title in UTC
                        const date = new Date(context[0].parsed.x);
                        return date.toISOString().replace('T', ' ').substring(0, 16) + ' UTC';
                    },
                    label: function(context) {
                        return `${context.dataset.label}: ${context.raw.toFixed(2)} nT`;
                    }
                }
            }
        },
        interaction: {
            mode: 'nearest',
            axis: 'x',
            intersect: false
        }
    }
});

// === Fetch Data ===
async function fetchData() {
    try {
        const response = await fetch('https://services.swpc.noaa.gov/products/solar-wind/mag-1-day.json');
        const data = await response.json();

        // Skip header row
        fullData = data.slice(1).map(row => ({
            time: new Date(row[0] + 'Z'), // ✅ Interpret as UTC
            bz: parseFloat(row[3]),
            bt: parseFloat(row[6])
        }));

        updateChart();
    } catch (error) {
        console.error("Error fetching data:", error);
    }
}

// === Update Chart ===
function updateChart() {
    const nowUTC = new Date();
    const cutoffTime = nowUTC.getTime() - HOURS_TO_DISPLAY * 60 * 60 * 1000;

    const filteredData = fullData.filter(point => point.time.getTime() >= cutoffTime);

    solarWindChart.data.labels = filteredData.map(point => point.time);
    solarWindChart.data.datasets[0].data = filteredData.map(point => point.bz);
    solarWindChart.data.datasets[1].data = filteredData.map(point => point.bt);

    if (filteredData.length > 0) {
        latestBz = filteredData[filteredData.length - 1].bz.toFixed(2);
        latestBt = filteredData[filteredData.length - 1].bt.toFixed(2);
    }

    document.getElementById('bz-value').textContent = `Bz GSM: ${latestBz} nT`;
    document.getElementById('bt-value').textContent = `Bt: ${latestBt} nT`;

    solarWindChart.update();
}

// === Buttons ===
document.getElementById('btn-1day').addEventListener('click', () => { HOURS_TO_DISPLAY = 24; updateChart(); });
document.getElementById('btn-12hr').addEventListener('click', () => { HOURS_TO_DISPLAY = 12; updateChart(); });
document.getElementById('btn-6hr').addEventListener('click', () => { HOURS_TO_DISPLAY = 6; updateChart(); });

// === Initial Fetch ===
fetchData();
setInterval(fetchData, 60000); // Update every minute
