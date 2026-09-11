import pandas as pd
import numpy as np
from sklearn.linear_model import LinearRegression

def load_and_forecast_freight(filepath='data/freight_data.csv'):
    df = pd.read_csv(filepath)
    df['Date'] = pd.to_datetime(df['Date'])
    df = df.sort_values('Date').reset_index(drop=True)
    
    # Feature engineering for simple model
    df['DayIndex'] = np.arange(len(df))
    
    # Simple linear regression with last 90 days for short term trend
    train_df = df.tail(90)
    X = train_df[['DayIndex']]
    y = train_df['Freight Rate']
    
    model = LinearRegression()
    model.fit(X, y)
    
    last_day_index = df['DayIndex'].iloc[-1]
    current_rate = df['Freight Rate'].iloc[-1]
    
    # Predict for 7, 14, 30 days
    future_X = pd.DataFrame({'DayIndex': [last_day_index + 7, last_day_index + 14, last_day_index + 30]})
    predictions = model.predict(future_X)
    
    forecasts = {
        'current': current_rate,
        '7_day': predictions[0],
        '14_day': predictions[1],
        '30_day': predictions[2]
    }
    
    # Generate trend
    trend = "Stable"
    if predictions[2] > current_rate * 1.05:
        trend = "Increasing"
    elif predictions[2] < current_rate * 0.95:
        trend = "Decreasing"
        
    forecasts['trend'] = trend
    
    # For plotting
    future_dates = [df['Date'].iloc[-1] + pd.Timedelta(days=d) for d in range(1, 31)]
    future_indices = pd.DataFrame({'DayIndex': [last_day_index + d for d in range(1, 31)]})
    future_preds = model.predict(future_indices)
    
    future_df = pd.DataFrame({
        'Date': future_dates,
        'Forecast': future_preds,
        'Lower Bound': future_preds - 1.5,
        'Upper Bound': future_preds + 1.5
    })
    
    return df, future_df, forecasts

def get_market_entry_signal(forecasts):
    if forecasts['trend'] == "Increasing":
        return "CHARTER NOW", "Forecast indicates increasing freight rates. Chartering now locks in a lower price."
    elif forecasts['trend'] == "Decreasing":
        return "WAIT", "Forecast indicates decreasing freight rates. Waiting will likely yield a lower price."
    else:
        return "CONSIDER WAITING", "Freight rates are stable. Consider waiting if operational timeline permits, or charter if vessels are scarce."
