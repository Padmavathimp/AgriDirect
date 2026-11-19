AGRIDIRECT - AI MANDI PRICE PREDICTOR UPGRADE

WHAT IS INCLUDED
- ai-price-predictor.html: new standalone page
- css/ai-predictor.css: page styling
- js/ai-predictor.js: connects the page to the prediction API
- backend/app.py: Python Flask API with a Random Forest regression model
- backend/requirements.txt: Python packages
- backend/data/mandi_prices_template.csv: required CSV column template

IMPORTANT: THIS IS NOT TRAINED WITH REAL MARKET DATA YET.
No historical mandi dataset was supplied with the uploaded HTML pages. The API will not invent prices. It returns an error until you add genuine historical data.

STEP 1 - COPY THE WEBSITE FILES
Copy these into your existing AgriDirect project:
- ai-price-predictor.html into the main project folder
- css/ai-predictor.css into your existing css folder
- js/ai-predictor.js into your existing js folder

STEP 2 - ADD THE DATA
Get genuine historical daily mandi price data from AGMARKNET / the Government of India data portal.
Prepare a CSV with these exact column names:
State,District,Market,Commodity,Arrival_Date,Min_Price,Max_Price,Modal_Price

Use dates like 2026-11-01 and prices in INR per quintal.
For this page's default market, Market must be Anekal and Commodity must be Tomato, Onion or Potato.
Save the filled file as:
backend/data/mandi_prices.csv

If Anekal is not present in the source data, do not rename another market as Anekal. Ask before using Bengaluru APMC or another nearby market, and label it accurately.

STEP 3 - RUN THE BACKEND LOCALLY
Install Python 3.10 or newer.
Open a terminal inside the backend folder and run:

Windows:
  py -m venv .venv
  .venv\Scripts\activate
  pip install -r requirements.txt
  python app.py

Mac/Linux:
  python3 -m venv .venv
  source .venv/bin/activate
  pip install -r requirements.txt
  python -m pip install -r requirements.txt
  python app.py

The API should run at http://127.0.0.1:5000
Open ai-price-predictor.html using VS Code Live Server. The browser page calls the local API.

STEP 4 - LINK FROM YOUR HOME PAGE
Add this link inside the navigation area of index.html:
  <a href="ai-price-predictor.html">AI Price Predictor</a>

DEPLOYMENT
Netlify hosts the static HTML/CSS/JS page, but it does not run this Flask API as-is.
Deploy the backend separately to a Python hosting service (for example Render), then change API_BASE_URL at the top of js/ai-predictor.js to your deployed backend URL. Enable HTTPS and configure CORS for your website domain before public use.

MODEL NOTES
- RandomForestRegressor is trained on the selected crop/market history when the endpoint is requested.
- It uses date features and recent lag/rolling prices.
- Forecasts are estimates, not guaranteed future mandi prices.
- This starter does not yet include weather, arrivals, festival, demand or transport variables.
- Evaluate accuracy on a time-based holdout set before presenting it as a validated forecasting system.
