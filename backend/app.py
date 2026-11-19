
from datetime import timedelta
from pathlib import Path
import os
import pandas as pd
from flask import Flask, jsonify, request
from flask_cors import CORS
from sklearn.ensemble import RandomForestRegressor

app = Flask(__name__)
CORS(app)

DATA_FILE = Path(__file__).parent / "data" / "mandi_prices.csv"

FEATURES = [
    "day_number", "day_of_week", "month", "day_of_year",
    "lag_1", "lag_7", "lag_14", "rolling_7"
]

COMMODITIES = ["Tomato", "Onion", "Potato", "Carrot", "Cabbage"]

# Anekal demo requests use Bengaluru as a proxy market.
ANEKAL_PROXY = "Bengaluru"


def load_data():
    if not DATA_FILE.exists():
        raise ValueError("mandi_prices.csv not found in backend/data.")

    df = pd.read_csv(DATA_FILE)
    df.columns = df.columns.str.strip()

    required = ["Market", "Commodity", "Arrival_Date", "Modal_Price"]
    missing = [c for c in required if c not in df.columns]

    if missing:
        raise ValueError("CSV missing columns: " + ", ".join(missing))

    df["Market"] = df["Market"].astype(str).str.strip()
    df["Commodity"] = df["Commodity"].astype(str).str.strip()
    df["Arrival_Date"] = pd.to_datetime(
        df["Arrival_Date"], errors="coerce"
    )
    df["Modal_Price"] = pd.to_numeric(
        df["Modal_Price"], errors="coerce"
    )

    df = df.dropna(
        subset=["Arrival_Date", "Modal_Price", "Market", "Commodity"]
    )
    df = df[df["Modal_Price"] > 0].copy()

    return df.sort_values("Arrival_Date")


def build_features(series):
    rows = []
    values = series["Modal_Price"].tolist()
    dates = series["Arrival_Date"].tolist()

    for i in range(14, len(values)):
        d = dates[i]

        rows.append({
            "day_number": (d - dates[0]).days,
            "day_of_week": d.dayofweek,
            "month": d.month,
            "day_of_year": d.dayofyear,
            "lag_1": values[i - 1],
            "lag_7": values[i - 7],
            "lag_14": values[i - 14],
            "rolling_7": sum(values[i - 7:i]) / 7,
            "target": values[i]
        })

    return pd.DataFrame(rows)


def make_features(date, first_date, history):
    return {
        "day_number": (date - first_date).days,
        "day_of_week": date.dayofweek,
        "month": date.month,
        "day_of_year": date.dayofyear,
        "lag_1": history[-1],
        "lag_7": history[-7],
        "lag_14": history[-14],
        "rolling_7": sum(history[-7:]) / 7
    }


@app.get("/api/health")
def health():
    return jsonify({
        "status": "ok",
        "service": "AgriDirect Mandi Price Predictor"
    })


@app.get("/api/predict")
def predict():
    market = request.args.get("market", "Anekal").strip()
    commodity = request.args.get("commodity", "Tomato").strip().title()

    if commodity not in COMMODITIES:
        return jsonify({
            "error": "Choose Tomato, Onion, Potato, Carrot or Cabbage."
        }), 400

    try:
        df = load_data()

        # First try the exact requested market.
        selected_market = market

        crop = df[
            (df["Market"].str.casefold() == market.casefold()) &
            (df["Commodity"].str.casefold() == commodity.casefold())
        ]

        # If Anekal has no records, use Bengaluru demo records.
        used_proxy = False

        if len(crop) < 25 and market.casefold() == "anekal":
            selected_market = ANEKAL_PROXY
            used_proxy = True

            crop = df[
                (df["Market"].str.casefold() ==
                 ANEKAL_PROXY.casefold()) &
                (df["Commodity"].str.casefold() ==
                 commodity.casefold())
            ]

        crop = (
            crop.groupby("Arrival_Date", as_index=False)["Modal_Price"]
            .mean()
            .sort_values("Arrival_Date")
        )

        if len(crop) < 25:
            return jsonify({
                "error": (
                    f"Not enough {commodity} demo records. "
                    f"Found {len(crop)} rows; at least 25 are needed."
                )
            }), 422

        feature_data = build_features(crop)

        if len(feature_data) < 10:
            return jsonify({
                "error": "Not enough usable records to train the model."
            }), 422

        X = feature_data[FEATURES]
        y = feature_data["target"]

        model = RandomForestRegressor(
            n_estimators=250,
            random_state=42,
            min_samples_leaf=2
        )
        model.fit(X, y)

        history = crop["Modal_Price"].astype(float).tolist()
        first_date = crop["Arrival_Date"].iloc[0]
        last_date = crop["Arrival_Date"].iloc[-1]

        forecast = []

        for step in range(1, 8):
            future_date = last_date + timedelta(days=step)

            feature_row = pd.DataFrame([
                make_features(future_date, first_date, history)
            ])[FEATURES]

            predicted = max(0, float(model.predict(feature_row)[0]))

            forecast.append({
                "date": future_date.strftime("%Y-%m-%d"),
                "predicted_price": round(predicted, 2)
            })

            history.append(predicted)

        return jsonify({
            "market": market,
            "source_market": selected_market,
            "used_proxy_market": used_proxy,
            "commodity": commodity,
            "latest_actual_price": round(
                float(crop["Modal_Price"].iloc[-1]), 2
            ),
            "latest_actual_date": last_date.strftime("%Y-%m-%d"),
            "training_records": int(len(crop)),
            "forecast": forecast,
            "model": "RandomForestRegressor",
            "unit": "INR per quintal",
            "data_type": "SIMULATED DEMO DATA",
            "notice": (
                "These prices are randomly generated for demonstration. "
                "They are not real mandi prices. "
                "Anekal predictions use Bengaluru demo records as a proxy."
            )
        })

    except ValueError as exc:
        return jsonify({"error": str(exc)}), 400

    except Exception as exc:
        return jsonify({
            "error": "Prediction failed: " + str(exc)
        }), 500


if __name__ == "__main__":
    app.run(
        host="0.0.0.0",
        port=int(os.environ.get("PORT", 5000)),
        debug=True
    )
