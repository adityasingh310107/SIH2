import streamlit as st
import pandas as pd
import plotly.express as px
import plotly.graph_objects as go
from datetime import datetime, timedelta
import os

from models.forecasting import load_and_forecast_freight, get_market_entry_signal
from models.feasibility import check_feasibility
from models.optimization import optimize_chartering

# Must be the first Streamlit command
st.set_page_config(
    page_title="Intelligent Freight Forecasting",
    page_icon="🚢",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Dark navy / charcoal styling
st.markdown("""
<style>
    .reportview-container {
        background: #0d1117;
        color: #c9d1d9;
    }
    .sidebar .sidebar-content {
        background: #161b22;
    }
    .Widget>label {
        color: #c9d1d9;
    }
    .stButton>button {
        background-color: #1f6feb;
        color: white;
        border-radius: 6px;
        border: none;
        padding: 10px 24px;
        font-weight: bold;
    }
    .stButton>button:hover {
        background-color: #388bfd;
    }
    h1, h2, h3, h4, h5, h6 {
        color: #58a6ff !important;
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    }
    .card {
        background-color: #161b22;
        padding: 20px;
        border-radius: 10px;
        border: 1px solid #30363d;
        box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        margin-bottom: 20px;
    }
    .metric-value {
        font-size: 24px;
        font-weight: bold;
        color: #ffffff;
    }
    .metric-label {
        font-size: 14px;
        color: #8b949e;
        text-transform: uppercase;
    }
    .badge-pass {
        background-color: #238636;
        color: white;
        padding: 4px 8px;
        border-radius: 12px;
        font-size: 12px;
        font-weight: bold;
    }
    .badge-fail {
        background-color: #da3633;
        color: white;
        padding: 4px 8px;
        border-radius: 12px;
        font-size: 12px;
        font-weight: bold;
    }
</style>
""", unsafe_allow_html=True)

# ----------------- HEADER -----------------
st.markdown("<h1 style='text-align: center;'>INTELLIGENT FREIGHT FORECASTING & CHARTERING</h1>", unsafe_allow_html=True)
st.markdown("<h4 style='text-align: center; color: #8b949e;'>AI-Driven Decision Support for Bulk Cargo Procurement</h4>", unsafe_allow_html=True)
st.markdown("<p style='text-align: center; color: #8b949e; font-size: 12px;'>SIH 2026 • Prototype Demonstration — Using Simulated/Historical-Style Data</p>", unsafe_allow_html=True)
st.markdown("---")

# ----------------- SIDEBAR / INPUTS -----------------
st.sidebar.header("Scenario Input")

if st.sidebar.button("🚀 LOAD DEMO SCENARIO"):
    st.session_state['cargo_type'] = 'Coal'
    st.session_state['quantity'] = 50000
    st.session_state['origin'] = 'Indonesia'
    st.session_state['destination'] = 'Paradip'
    st.session_state['timeline'] = 30
    st.session_state['vessel_type'] = 'Panamax/Capesize'
    st.session_state['run_pipeline'] = True

cargo_type = st.sidebar.text_input("Cargo Type", value=st.session_state.get('cargo_type', ''))
quantity = st.sidebar.number_input("Quantity (MT)", min_value=1000, value=st.session_state.get('quantity', 10000), step=1000)
origin = st.sidebar.text_input("Origin", value=st.session_state.get('origin', ''))

ports_list = ['Paradip', 'Haldia', 'Visakhapatnam', 'Ennore', 'Chennai']
dest_index = ports_list.index(st.session_state.get('destination', 'Paradip')) if st.session_state.get('destination') in ports_list else 0
destination = st.sidebar.selectbox("Destination Port (East Coast)", ports_list, index=dest_index)

timeline = st.sidebar.slider("Required Delivery Timeline (Days)", 7, 90, value=st.session_state.get('timeline', 30))
vessel_type = st.sidebar.selectbox("Preferred Vessel Type", ["Any", "Handysize", "Supramax", "Panamax", "Capesize", "Panamax/Capesize"], index=5 if st.session_state.get('vessel_type') == 'Panamax/Capesize' else 0)

if st.sidebar.button("Run Analysis"):
    st.session_state['run_pipeline'] = True

if not st.session_state.get('run_pipeline', False):
    st.info("👈 Please configure the scenario in the sidebar and click 'Run Analysis' or 'LOAD DEMO SCENARIO'.")
    st.stop()

# Build cargo details dict
cargo_details = {
    'Cargo Type': cargo_type,
    'Quantity': quantity,
    'Origin': origin,
    'Destination Port': destination,
    'Timeline': timeline,
    'Preferred Vessel Type': vessel_type
}

# ----------------- 1. FREIGHT FORECASTING -----------------
st.header("📈 Freight Market Overview & Forecast")

with st.spinner("Analyzing market data and generating forecasts..."):
    df, future_df, forecasts = load_and_forecast_freight()
    signal, reason = get_market_entry_signal(forecasts)

col1, col2, col3, col4 = st.columns(4)
with col1:
    st.markdown(f"""
    <div class="card">
        <div class="metric-label">CURRENT FREIGHT</div>
        <div class="metric-value">${forecasts['current']:.2f}/MT</div>
    </div>
    """, unsafe_allow_html=True)
with col2:
    st.markdown(f"""
    <div class="card">
        <div class="metric-label">7 DAY FORECAST</div>
        <div class="metric-value">${forecasts['7_day']:.2f}/MT</div>
    </div>
    """, unsafe_allow_html=True)
with col3:
    st.markdown(f"""
    <div class="card">
        <div class="metric-label">14 DAY FORECAST</div>
        <div class="metric-value">${forecasts['14_day']:.2f}/MT</div>
    </div>
    """, unsafe_allow_html=True)
with col4:
    st.markdown(f"""
    <div class="card">
        <div class="metric-label">30 DAY FORECAST</div>
        <div class="metric-value">${forecasts['30_day']:.2f}/MT</div>
        <div style='color: {"#3fb950" if "Decreasing" in forecasts["trend"] else "#da3633" if "Increasing" in forecasts["trend"] else "#d29922"}; font-weight: bold;'>TREND: {forecasts['trend']}</div>
    </div>
    """, unsafe_allow_html=True)

# Plotly Chart
fig = go.Figure()
# Historical
fig.add_trace(go.Scatter(x=df['Date'].tail(90), y=df['Freight Rate'].tail(90), mode='lines', name='Historical Rate', line=dict(color='#58a6ff', width=2)))
# Forecast
fig.add_trace(go.Scatter(x=future_df['Date'], y=future_df['Forecast'], mode='lines', name='Forecast', line=dict(color='#f0883e', width=2, dash='dash')))
# Confidence Interval
fig.add_trace(go.Scatter(
    x=pd.concat([future_df['Date'], future_df['Date'][::-1]]),
    y=pd.concat([future_df['Upper Bound'], future_df['Lower Bound'][::-1]]),
    fill='toself',
    fillcolor='rgba(240, 136, 62, 0.2)',
    line=dict(color='rgba(255,255,255,0)'),
    hoverinfo="skip",
    showlegend=True,
    name='Confidence Interval'
))
fig.update_layout(
    plot_bgcolor='#0d1117',
    paper_bgcolor='#0d1117',
    font=dict(color='#c9d1d9'),
    title='Freight Rate (90 Days Historical + 30 Days Forecast)',
    xaxis_title='Date',
    yaxis_title='Freight Rate ($/MT)',
    margin=dict(l=0, r=0, t=40, b=0),
    legend=dict(orientation="h", yanchor="bottom", y=1.02, xanchor="right", x=1)
)
st.plotly_chart(fig, use_container_width=True)


# ----------------- 2. MARKET ENTRY SIGNAL -----------------
st.header("🚦 Market Entry Signal")
signal_color = "#238636" if "CHARTER NOW" in signal else "#d29922" if "WAITING" in signal else "#da3633"

st.markdown(f"""
<div class="card" style="border-left: 5px solid {signal_color};">
    <h3 style="color: {signal_color} !important; margin-top: 0;">{signal}</h3>
    <p><strong>REASON:</strong> {reason}</p>
</div>
""", unsafe_allow_html=True)

# ----------------- 3. VESSEL FEASIBILITY ENGINE -----------------
st.header("🚢 Vessel-Port Feasibility Analysis")
with st.spinner("Checking vessel constraints against port limits..."):
    feasibility_df = check_feasibility(cargo_details)

def color_status(val):
    if val == 'PASS' or val == 'FEASIBLE':
        return 'color: #3fb950; font-weight: bold'
    elif val == 'FAIL' or val == 'REJECTED':
        return 'color: #da3633; font-weight: bold'
    return ''

st.dataframe(feasibility_df.style.map(color_status, subset=['CARGO FIT', 'PORT FIT', 'DRAFT', 'STATUS']), use_container_width=True)

feasible_vessels = feasibility_df[feasibility_df['STATUS'] == 'FEASIBLE']
rejected_vessels = feasibility_df[feasibility_df['STATUS'] == 'REJECTED']

st.markdown(f"**Feasible Vessels found:** {len(feasible_vessels)} out of {len(feasibility_df)}")

# ----------------- 4. OPTIMIZATION ENGINE -----------------
st.header("⚙️ Chartering Optimization Engine")
if feasible_vessels.empty:
    st.error("No feasible vessels found for the current constraints. Please adjust cargo size or port.")
    st.stop()

with st.spinner("Optimizing total effective costs..."):
    ranked_vessels = optimize_chartering(feasible_vessels, cargo_details, forecasts)

st.dataframe(ranked_vessels[['Rank', 'Vessel Name', 'Vessel Type', 'Estimated Freight Cost ($)', 'Estimated Waiting Cost ($)', 'Risk Cost ($)', 'Total Effective Cost ($)', 'Effective Rate ($/MT)', 'Overall Score']], use_container_width=True)

# ----------------- 5. FINAL DECISION CARD -----------------
st.header("🏆 Optimal Chartering Decision")

best_vessel = ranked_vessels.iloc[0]

st.markdown(f"""
<div class="card" style="border: 2px solid #58a6ff;">
    <h2>Recommended Vessel: {best_vessel['Vessel Name']} ({best_vessel['Vessel Type']})</h2>
    <div style="display: flex; justify-content: space-between; flex-wrap: wrap;">
        <div style="margin-right: 20px;">
            <p class="metric-label">Estimated Effective Rate</p>
            <p class="metric-value">${best_vessel['Effective Rate ($/MT)']}/MT</p>
        </div>
        <div style="margin-right: 20px;">
            <p class="metric-label">Total Effective Cost</p>
            <p class="metric-value">${best_vessel['Total Effective Cost ($)']:,}</p>
        </div>
        <div style="margin-right: 20px;">
            <p class="metric-label">Operational Risk</p>
            <p class="metric-value" style="color: {'#3fb950' if best_vessel['Risk Level'] == 'LOW' else '#d29922' if best_vessel['Risk Level'] == 'MEDIUM' else '#da3633'};">{best_vessel['Risk Level']}</p>
        </div>
        <div>
            <p class="metric-label">Port Feasibility</p>
            <p class="metric-value"><span class="badge-pass">✓ PASS</span></p>
        </div>
    </div>
</div>
""", unsafe_allow_html=True)

# ----------------- 6. EXPLAINABILITY -----------------
st.subheader("Why did the system recommend this?")
st.markdown(f"""
* **Forecast & Timing:** The system recommends a **{signal.split(' ')[1] if len(signal.split(' ')) > 1 else 'CHARTER'}** decision because the market trend is *{forecasts['trend']}*.
* **Feasibility:** **{best_vessel['Vessel Name']}** perfectly meets the cargo requirements ({cargo_details['Quantity']} MT) and safely fits within the draft and dimension limits of **{cargo_details['Destination Port']}**.
* **Optimization:** It offers the highest overall score ({best_vessel['Overall Score']}/100) by minimizing total effective cost, balancing the base freight rate with low waiting and risk costs.
* **Risk Management:** The operational risk is evaluated as **{best_vessel['Risk Level']}**, making it the most reliable choice.
""")

st.subheader("Alternative Options")
if len(ranked_vessels) > 1:
    alt1 = ranked_vessels.iloc[1]
    st.markdown(f"**Alternative 1:** {alt1['Vessel Name']} — Effective Rate: ${alt1['Effective Rate ($/MT)']}/MT (Score: {alt1['Overall Score']})")
if len(ranked_vessels) > 2:
    alt2 = ranked_vessels.iloc[2]
    st.markdown(f"**Alternative 2:** {alt2['Vessel Name']} — Effective Rate: ${alt2['Effective Rate ($/MT)']}/MT (Score: {alt2['Overall Score']})")


# ----------------- 7. ARCHITECTURE & TECH STACK -----------------
st.markdown("---")
st.header("System Architecture & Tech Stack")
colA, colB = st.columns(2)

with colA:
    st.markdown("""
    ### Pipeline Architecture
    1. **USER INPUT:** Cargo, Route, Requirements
    2. **DATA LAYER:** Freight Market Data, Vessel Database, Port Constraints
    3. **FEATURE ENGINEERING:** Preprocessing & Market Trend alignment
    4. **FREIGHT FORECASTING:** Time-series Model (Simulated)
    5. **VESSEL-PORT FEASIBILITY:** Multi-constraint Filtering
    6. **OPTIMIZATION ENGINE:** Effective Cost Minimization
    7. **EXPLAINABLE AI:** Human-readable reasoning
    8. **CHARTERING RECOMMENDATION:** Final Decision Output
    """)
    
with colB:
    st.markdown("""
    ### Technology Stack
    * **Frontend:** Streamlit (Implemented in MVP)
    * **Visualization:** Plotly (Implemented in MVP)
    * **Data Processing:** Pandas, NumPy (Implemented in MVP)
    * **Machine Learning:** Scikit-learn Linear Regression (Implemented in MVP)
    * **Optimization:** Custom Rule-based Scoring Engine (Implemented in MVP)
    * *Planned for Production:* FastAPI, PostgreSQL, PyTorch, Google OR-Tools
    """)
