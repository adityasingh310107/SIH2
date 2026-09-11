# Intelligent Freight Forecasting & Chartering Optimization System (MVP)
### SIH 2026 - Problem Statement SIH26006

This is a working MVP prototype for the Smart India Hackathon 2026.

## Problem
Bulk imports arrive at East Coast ports where every fixture must be timed against a volatile market. Forward visibility is poor, and vessel selection depends on multiple constraints (cargo type, capacity, LOA, beam, draft). This system brings forecasting, feasibility, and optimization into a single decision engine.

## Solution Architecture
1. **Forecasting**: Predicts freight rate trends over 7, 14, and 30 days.
2. **Feasibility Engine**: Matches cargo needs and checks if ships can berth at the chosen ports.
3. **Optimization Engine**: Calculates the lowest "Total Effective Cost" combining freight, waiting, idle, and risk costs.
4. **Explainability**: Outputs human-readable reasons for recommendations and rejections.

## Datasets (Prototype)
*Note: The datasets included in `data/` are simulated/historical-style data used to demonstrate the functionality of this prototype without relying on live proprietary API access.*

## How to Run Locally

1. Create and activate a virtual environment (optional but recommended):
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows use: venv\Scripts\activate
   ```

2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

3. Run the application:
   ```bash
   streamlit run app.py
   ```

## Demo Mode
Click the **"🚀 LOAD DEMO SCENARIO"** button in the sidebar to automatically populate a realistic scenario and run the entire pipeline in under 30 seconds.

## Limitations & Future Integration
- Currently uses a simple linear regression model for forecasting; production will use deep learning (PyTorch) or Prophet.
- Uses a custom scoring optimization; production will use Google OR-Tools/MILP.
- Data is simulated for demonstration; production will integrate with live AIS and Baltic Exchange APIs.
