import os
import pandas as pd
from sklearn.linear_model import LinearRegression

# File paths
original_file_path = 'data.csv'
processed_file_path = 'new.csv'

# Check if the processed file exists
if not os.path.exists(processed_file_path):
    # Load and preprocess the data
    data = pd.read_csv(original_file_path)
    
    # Split 'Metric' into 'metric_date' and 'metric_time'
    data[['metric_date', 'metric_time']] = data['Metric'].str.split(' ', expand=True)
    
    # Convert 'metric_date' to proper datetime format
    data['metric_date'] = pd.to_datetime(data['metric_date'], format='%m/%d/%Y', dayfirst=False)
    
    # Ensure 'metric_time' is in 24-hour format and append ":00" where needed
    # Only update time fields that need corrections (e.g., missing seconds)
    def correct_time_format(time_str):
        if pd.notna(time_str):
            if len(time_str) == 4:  # Format like "HH:MM" without seconds
                return time_str + ":00"  # Add seconds
            elif len(time_str) == 5 and ':' in time_str:  # Already valid "HH:MM"
                return time_str + ":00"  # Append seconds
        return time_str  # Return unchanged if already correct

    data['metric_time'] = data['metric_time'].apply(correct_time_format)
    
    # Convert 'metric_time' to a proper time format in 24-hour notation
    data['metric_time'] = pd.to_datetime(data['metric_time'], format='%H:%M:%S', errors='coerce').dt.time

    # Fill missing values using interpolation or forward/backward fill
    data.fillna(method='ffill', inplace=True)
    data.fillna(method='bfill', inplace=True)

    # Feature Engineering: Use 'WS (m/s)' as independent variable and 'PM2.5' as dependent variable
    initial_X = data[['WS (m/s)']]
    initial_y = data['PM2.5 (Âµg/mÂ³)']
    
    # Train a simple Linear Regression model
    model = LinearRegression()
    model.fit(initial_X, initial_y)
    
    intercept = model.intercept_
    coef_ws = model.coef_[0]

    # Calculate 'dust_conc' based on the regression formula
    data['dust_conc'] = intercept + coef_ws * data['WS (m/s)']
    
    # Save processed data to CSV
    data.to_csv(processed_file_path, index=False)

else:
    # Load the pre-processed file
    data = pd.read_csv(processed_file_path)
