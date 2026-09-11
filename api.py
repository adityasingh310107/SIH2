from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import pandas as pd
import json

from models.forecasting import load_and_forecast_freight, get_market_entry_signal
from models.feasibility import check_feasibility
from models.optimization import optimize_chartering

app = FastAPI(title="SIH 2026 Chartering Engine API")

# Allow CORS for Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ScenarioRequest(BaseModel):
    cargo_type: str
    quantity: float
    origin: str
    destination: str
    timeline: int
    vessel_type: str

@app.post("/api/analyze")
async def analyze_scenario(req: ScenarioRequest):
    try:
        cargo_details = {
            'Cargo Type': req.cargo_type,
            'Quantity': req.quantity,
            'Origin': req.origin,
            'Destination Port': req.destination,
            'Timeline': req.timeline,
            'Preferred Vessel Type': req.vessel_type
        }

        # 1. Forecast
        df, future_df, forecasts = load_and_forecast_freight()
        signal, reason = get_market_entry_signal(forecasts)
        
        # Prepare chart data
        historical_chart = df.tail(90)[['Date', 'Freight Rate']].to_dict(orient='records')
        forecast_chart = future_df[['Date', 'Forecast', 'Lower Bound', 'Upper Bound']].to_dict(orient='records')
        
        # Fix date formatting
        for item in historical_chart:
            item['Date'] = item['Date'].strftime('%Y-%m-%d')
        for item in forecast_chart:
            item['Date'] = item['Date'].strftime('%Y-%m-%d')

        # 2. Feasibility
        feasibility_df = check_feasibility(cargo_details)
        feasible_vessels = feasibility_df[feasibility_df['STATUS'] == 'FEASIBLE']
        
        # 3. Optimization
        ranked_vessels = optimize_chartering(feasible_vessels, cargo_details, forecasts)
        
        return {
            "forecasts": forecasts,
            "signal": signal,
            "signal_reason": reason,
            "historical_data": historical_chart,
            "forecast_data": forecast_chart,
            "feasibility": feasibility_df.to_dict(orient='records'),
            "optimization": ranked_vessels.to_dict(orient='records') if not ranked_vessels.empty else []
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
