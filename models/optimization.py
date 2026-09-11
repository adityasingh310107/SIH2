import pandas as pd
import numpy as np

def optimize_chartering(feasible_vessels, cargo_details, current_forecast):
    """
    feasible_vessels: DataFrame containing only STATUS == 'FEASIBLE' vessels.
    current_forecast: current rate from forecast model to adjust expectations.
    """
    if feasible_vessels.empty:
        return pd.DataFrame()
        
    results = []
    
    for _, vessel in feasible_vessels.iterrows():
        # Base freight cost calculation
        # Adjust base rate with current market forecast ratio
        market_adjustment = current_forecast['current'] / 25.0 # Assuming 25 was average
        estimated_freight_rate = vessel['Base Freight Rate'] * market_adjustment
        
        # Calculate costs
        freight_cost = estimated_freight_rate * cargo_details['Quantity']
        
        # Simulate waiting/idle cost based on availability
        if vessel['Availability'] == 'Available':
            waiting_days = 2
            risk_level = 'LOW'
            risk_multiplier = 1.0
        elif vessel['Availability'] == 'In Transit':
            waiting_days = 8
            risk_level = 'MEDIUM'
            risk_multiplier = 1.05
        else:
            waiting_days = 15
            risk_level = 'HIGH'
            risk_multiplier = 1.15
            
        idle_cost_per_day = 15000  # $15k per day
        waiting_cost = waiting_days * idle_cost_per_day
        
        # Risk cost
        risk_cost = freight_cost * (risk_multiplier - 1.0)
        
        total_effective_cost = freight_cost + waiting_cost + risk_cost
        
        effective_rate_per_mt = total_effective_cost / cargo_details['Quantity']
        
        results.append({
            'Vessel Name': vessel['Vessel Name'],
            'Vessel Type': vessel['Vessel Type'],
            'Estimated Freight Cost ($)': round(freight_cost, 2),
            'Estimated Waiting Cost ($)': round(waiting_cost, 2),
            'Risk Cost ($)': round(risk_cost, 2),
            'Risk Level': risk_level,
            'Total Effective Cost ($)': round(total_effective_cost, 2),
            'Effective Rate ($/MT)': round(effective_rate_per_mt, 2),
            'Score': 0 # To be calculated
        })
        
    results_df = pd.DataFrame(results)
    
    # Normalize score: lower cost = higher score (0-100)
    max_cost = results_df['Total Effective Cost ($)'].max()
    min_cost = results_df['Total Effective Cost ($)'].min()
    
    if max_cost == min_cost:
        results_df['Overall Score'] = 100.0
    else:
        results_df['Overall Score'] = 100 - ((results_df['Total Effective Cost ($)'] - min_cost) / (max_cost - min_cost) * 40)
        # Deduct score for risk
        results_df.loc[results_df['Risk Level'] == 'MEDIUM', 'Overall Score'] -= 10
        results_df.loc[results_df['Risk Level'] == 'HIGH', 'Overall Score'] -= 25
        
    results_df['Overall Score'] = results_df['Overall Score'].round(1)
    
    # Rank them
    results_df = results_df.sort_values('Overall Score', ascending=False).reset_index(drop=True)
    results_df['Rank'] = results_df.index + 1
    
    return results_df
