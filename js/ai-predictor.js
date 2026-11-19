// For local testing, run the Python API at http://127.0.0.1:5000.
// When deployed, replace this URL with your deployed backend URL.
const API_BASE_URL = "http://127.0.0.1:5000";
const predictBtn = document.getElementById("predictBtn");
const statusBox = document.getElementById("status");
const results = document.getElementById("results");
let chartInstance = null;

predictBtn.addEventListener("click", getPrediction);

async function getPrediction() {
  const commodity = document.getElementById("commodity").value;
  const market = document.getElementById("market").value;
  predictBtn.disabled = true;
  predictBtn.textContent = "Predicting...";
  results.classList.add("hidden");
  setStatus("Connecting to the AgriDirect prediction service...", false);
  try {
    const response = await fetch(`${API_BASE_URL}/api/predict?market=${encodeURIComponent(market)}&commodity=${encodeURIComponent(commodity)}`);
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Prediction service returned an error.");
    renderResults(data);
    setStatus("Forecast generated successfully. Predicted values are estimates, not guaranteed market prices.", false);
  } catch (error) {
    setStatus(error.message + " Check that the Python backend is running and that backend/data/mandi_prices.csv contains real historical records for this market and crop.", true);
  } finally {
    predictBtn.disabled = false;
    predictBtn.textContent = "Predict next 7 days";
  }
}

function setStatus(message, isError) {
  statusBox.textContent = message;
  statusBox.className = isError ? "status error" : "status";
}

function rupees(value) {
  return "₹" + Number(value).toLocaleString("en-IN", {maximumFractionDigits: 0});
}

function renderResults(data) {
  results.classList.remove("hidden");
  document.getElementById("latestPrice").textContent = rupees(data.latest_actual_price);
  document.getElementById("latestDate").textContent = "Actual record: " + data.latest_actual_date;
  const avg = data.forecast.reduce((sum, item) => sum + item.predicted_price, 0) / data.forecast.length;
  document.getElementById("averagePrice").textContent = rupees(avg);
  const first = data.forecast[0].predicted_price;
  const last = data.forecast[data.forecast.length - 1].predicted_price;
  const trend = last > first * 1.02 ? "Rising ↗" : last < first * 0.98 ? "Falling ↘" : "Stable →";
  document.getElementById("trend").textContent = trend;
  document.getElementById("trendNote").textContent = "First day compared with day seven";
  const highest = data.forecast.reduce((a,b) => a.predicted_price > b.predicted_price ? a : b);
  const lowest = data.forecast.reduce((a,b) => a.predicted_price < b.predicted_price ? a : b);
  document.getElementById("guidanceText").textContent =
    `The model estimates the highest price around ${highest.date} (${rupees(highest.predicted_price)} per quintal) and the lowest around ${lowest.date} (${rupees(lowest.predicted_price)} per quintal). Compare these estimates with your local buyer offers, transport costs and crop quality before deciding when to sell.`;
  document.getElementById("forecastTable").innerHTML = data.forecast.map(item =>
    `<div class="forecast-day"><span>${new Date(item.date + "T00:00:00").toLocaleDateString("en-IN",{weekday:"short"})}</span><strong>${rupees(item.predicted_price)}</strong><small>${item.date}</small></div>`
  ).join("");
  const ctx = document.getElementById("priceChart").getContext("2d");
  if (chartInstance) chartInstance.destroy();
  chartInstance = new Chart(ctx, {
    type: "line",
    data: {
      labels: data.forecast.map(x => x.date),
      datasets: [{label:"Predicted modal price (₹/quintal)",data:data.forecast.map(x=>x.predicted_price),
        borderColor:"#2e8048",backgroundColor:"rgba(46,128,72,.12)",fill:true,tension:.3,
        pointBackgroundColor:"#2e8048",pointRadius:4}]
    },
    options: {responsive:true,maintainAspectRatio:false,plugins:{legend:{display:true}},
      scales:{y:{beginAtZero:false,title:{display:true,text:"₹ per quintal"}}}}
  });
}
