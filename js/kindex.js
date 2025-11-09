let chartInstance = null;

async function fetchKIndexData() {
    try {
        const response = await fetch(`https://services.swpc.noaa.gov/products/noaa-planetary-k-index.json?nocache=${new Date().getTime()}`, {
            cache: "no-store"
        });
        const data = await response.json();

        console.log("Fetched Raw Data:", data);

        const timeLabels = [];
        const dateLabels = [];
        const kIndexValues = [];

        for (let i = 1; i < data.length; i++) {
            const timestamp = parseUTCDate(data[i][0]);
            const { timeLabel, dayLabel } = formatTimeLabel(timestamp);

            timeLabels.push(timeLabel);
            dateLabels.push(dayLabel);
            kIndexValues.push(parseFloat(data[i][1]));
        }

        renderChart(timeLabels, dateLabels, kIndexValues);
    } catch (error) {
        console.error("Error fetching K-Index data:", error);
    }
}

function parseUTCDate(timestampStr) {
    return new Date(Date.UTC(
        parseInt(timestampStr.substring(0, 4)),
        parseInt(timestampStr.substring(5, 7)) - 1,
        parseInt(timestampStr.substring(8, 10)),
        parseInt(timestampStr.substring(11, 13)),
        parseInt(timestampStr.substring(14, 16)),
        parseInt(timestampStr.substring(17, 19))
    ));
}

function formatTimeLabel(date) {
    let hours = date.getUTCHours();
    let dayLabel = `${date.getUTCMonth() + 1}/${date.getUTCDate()}`;
    let timeLabel = `${hours.toString().padStart(2, "0")}:00`;
    return { timeLabel, dayLabel };
}

function renderChart(timeLabels, dateLabels, data) {
    const ctx = document.getElementById("kIndexChart").getContext("2d");

    if (chartInstance) {
        chartInstance.destroy();
    }

    chartInstance = new Chart(ctx, {
        type: "bar",
        data: {
            labels: timeLabels,
            datasets: [{
                label: "Kp Index (All Available Data, 3-hour Intervals)",
                data: data,
                backgroundColor: data.map(value => getKIndexColor(value)),
                borderColor: "black",
                borderWidth: 1,
                barPercentage: 1.0,
                categoryPercentage: 1.0
            }]
        },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    font: { size: 18, weight: "bold" },
                    color: "yellow"
                },
                legend: { display: false }, // REMOVE LEGEND
                tooltip: {
                    enabled: true,
                    mode: "index",
                    intersect: false,
                    callbacks: {
                        title: function(tooltipItems) {
                            let index = tooltipItems[0].dataIndex;
                            return `${dateLabels[index]} ${timeLabels[index]}`;
                        },
                        label: function(tooltipItem) {
                            return `Kp: ${tooltipItem.raw}`;
                        }
                    }
                }
            },
            interaction: { mode: "index", intersect: false },
            scales: {
                x: {
                    ticks: {
                        font: { size: 12, weight: "bold" },
                        color: "white",
                        callback: function (val, index) {
                            return index % 8 === 0 ? `${dateLabels[index]}\n${timeLabels[index]}` : "";
                        },
                        autoSkip: false,
                        maxRotation: 0,
                        minRotation: 0,
                    },
                    title: {
                        display: true,
                        text: [
                            `🟩 Quiet (Kp < 5)   🟨 Storm (Kp ≥ 5)   🟧 Moderate Storm (Kp ≥ 6)   🟥 Strong Storm (Kp ≥ 7)   🟪 Severe Storm (Kp ≥ 8)`,
                        ],
                        font: { size: 10, weight: "bold" },
                        color: "white",
                        padding: { top: 10 }
                    },
                    grid: { display: false }
                },
                y: {
                    beginAtZero: true,
                    max: 9,
                    title: { display: true, text: "Kp Index", color: "white" },
                    ticks: { stepSize: 1, color: "white" },
                    grid: { display: true }
                }
            }
        }
    });
}

function getKIndexColor(value) {
    if (value < 5) return "green";
    if (value >= 5) return "yellow";
    if (value >= 6) return "orange";
    if (value >= 7) return "red";
    if (value >= 8) return "purple";
    return "gray";
}

fetchKIndexData();
setInterval(fetchKIndexData, 60000);
