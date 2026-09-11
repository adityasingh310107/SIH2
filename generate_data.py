import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import os

def generate_freight_data():
    dates = [datetime.today() - timedelta(days=x) for x in range(365, 0, -1)]
    
    # Simulate a slightly volatile time series for freight rate
    np.random.seed(42)
    base_rate = 25.0
    trend = np.linspace(0, 5, 365)
    seasonality = 3 * np.sin(np.linspace(0, 4*np.pi, 365))
    noise = np.random.normal(0, 1.5, 365)
    
    freight_rate = base_rate + trend + seasonality + noise
    freight_rate = np.maximum(freight_rate, 15.0) # Ensure it doesn't go too low
    
    fuel_price = 500 + 20 * np.sin(np.linspace(0, 2*np.pi, 365)) + np.random.normal(0, 10, 365)
    demand_index = 100 + 10 * np.sin(np.linspace(0, 2*np.pi, 365)) + np.random.normal(0, 2, 365)
    port_congestion = np.random.choice(['Low', 'Medium', 'High'], 365, p=[0.5, 0.3, 0.2])
    vessel_availability = np.random.choice(['High', 'Medium', 'Low'], 365, p=[0.6, 0.3, 0.1])
    
    df = pd.DataFrame({
        'Date': dates,
        'Freight Rate': freight_rate,
        'Fuel Price': fuel_price,
        'Demand Index': demand_index,
        'Port Congestion': port_congestion,
        'Vessel Availability': vessel_availability
    })
    df.to_csv('data/freight_data.csv', index=False)

def generate_ports():
    ports = [
        {'Port': 'Paradip', 'Maximum LOA': 300, 'Maximum Beam': 48, 'Maximum Draft': 14.5, 'Handling constraints': 'Coal, Iron Ore'},
        {'Port': 'Haldia', 'Maximum LOA': 230, 'Maximum Beam': 32, 'Maximum Draft': 8.5, 'Handling constraints': 'Liquid, Bulk'},
        {'Port': 'Visakhapatnam', 'Maximum LOA': 300, 'Maximum Beam': 50, 'Maximum Draft': 18.1, 'Handling constraints': 'All'},
        {'Port': 'Ennore', 'Maximum LOA': 320, 'Maximum Beam': 50, 'Maximum Draft': 16.0, 'Handling constraints': 'Coal, LNG'},
        {'Port': 'Chennai', 'Maximum LOA': 300, 'Maximum Beam': 42, 'Maximum Draft': 16.5, 'Handling constraints': 'Containers, Cars, Bulk'}
    ]
    pd.DataFrame(ports).to_csv('data/ports.csv', index=False)

def generate_vessels():
    vessels = [
        {'Vessel Name': 'MV Ocean Star', 'Vessel Type': 'Panamax', 'Capacity': 75000, 'LOA': 225, 'Beam': 32.2, 'Draft': 14.0, 'Base Freight Rate': 25.5, 'Availability': 'Available'},
        {'Vessel Name': 'MV Pacific', 'Vessel Type': 'Capesize', 'Capacity': 170000, 'LOA': 290, 'Beam': 45.0, 'Draft': 18.5, 'Base Freight Rate': 22.0, 'Availability': 'Available'},
        {'Vessel Name': 'MV Atlantic', 'Vessel Type': 'Supramax', 'Capacity': 55000, 'LOA': 190, 'Beam': 32.2, 'Draft': 12.0, 'Base Freight Rate': 28.0, 'Availability': 'Available'},
        {'Vessel Name': 'MV Voyager', 'Vessel Type': 'Panamax', 'Capacity': 82000, 'LOA': 229, 'Beam': 32.2, 'Draft': 14.5, 'Base Freight Rate': 26.0, 'Availability': 'In Transit'},
        {'Vessel Name': 'MV Eastern', 'Vessel Type': 'Handysize', 'Capacity': 35000, 'LOA': 180, 'Beam': 28.0, 'Draft': 10.0, 'Base Freight Rate': 30.0, 'Availability': 'Available'},
        {'Vessel Name': 'MV Bulk Master', 'Vessel Type': 'Capesize', 'Capacity': 180000, 'LOA': 295, 'Beam': 46.0, 'Draft': 18.0, 'Base Freight Rate': 21.5, 'Availability': 'Available'},
        {'Vessel Name': 'MV Coal King', 'Vessel Type': 'Panamax', 'Capacity': 72000, 'LOA': 220, 'Beam': 32.2, 'Draft': 13.5, 'Base Freight Rate': 26.5, 'Availability': 'Available'},
        {'Vessel Name': 'MV Indian Pearl', 'Vessel Type': 'Supramax', 'Capacity': 58000, 'LOA': 195, 'Beam': 32.2, 'Draft': 12.5, 'Base Freight Rate': 27.5, 'Availability': 'Available'}
    ]
    pd.DataFrame(vessels).to_csv('data/vessels.csv', index=False)

if __name__ == '__main__':
    generate_freight_data()
    generate_ports()
    generate_vessels()
    print("Data generated successfully.")
