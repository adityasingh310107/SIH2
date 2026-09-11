import pandas as pd

def check_feasibility(cargo_details, vessels_filepath='data/vessels.csv', ports_filepath='data/ports.csv'):
    vessels_df = pd.read_csv(vessels_filepath)
    ports_df = pd.read_csv(ports_filepath)
    
    port_constraints = ports_df[ports_df['Port'] == cargo_details['Destination Port']]
    
    if port_constraints.empty:
        raise ValueError(f"Port {cargo_details['Destination Port']} not found in database.")
    
    port_constraints = port_constraints.iloc[0]
    
    results = []
    
    for _, vessel in vessels_df.iterrows():
        reasons = []
        cargo_fit = 'PASS'
        port_fit = 'PASS'
        draft_fit = 'PASS'
        
        # Check cargo capacity
        if vessel['Capacity'] < cargo_details['Quantity']:
            cargo_fit = 'FAIL'
            reasons.append("Insufficient capacity")
            
        # Check preferred vessel type
        if cargo_details['Preferred Vessel Type'] != 'Any' and vessel['Vessel Type'] not in cargo_details['Preferred Vessel Type']:
             # Just a soft warning or constraint based on user choice. If it's strict, we fail it.
             # Let's say it's a soft constraint, or maybe strict if specified.
             pass 
             
        # Check port constraints
        if vessel['LOA'] > port_constraints['Maximum LOA']:
            port_fit = 'FAIL'
            reasons.append("LOA exceeds port limit")
            
        if vessel['Beam'] > port_constraints['Maximum Beam']:
            port_fit = 'FAIL'
            reasons.append("Beam exceeds port limit")
            
        if vessel['Draft'] > port_constraints['Maximum Draft']:
            draft_fit = 'FAIL'
            port_fit = 'FAIL'
            reasons.append("Draft exceeds port limit")
            
        status = 'FEASIBLE' if not reasons else 'REJECTED'
        reason_str = ' | '.join(reasons) if reasons else '—'
        
        results.append({
            'Vessel Name': vessel['Vessel Name'],
            'Vessel Type': vessel['Vessel Type'],
            'Base Freight Rate': vessel['Base Freight Rate'],
            'Availability': vessel['Availability'],
            'Capacity': vessel['Capacity'],
            'CARGO FIT': cargo_fit,
            'PORT FIT': port_fit,
            'DRAFT': draft_fit,
            'STATUS': status,
            'REASON': reason_str
        })
        
    return pd.DataFrame(results)
