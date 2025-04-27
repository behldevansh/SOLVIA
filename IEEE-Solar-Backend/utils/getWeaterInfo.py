import requests
from datetime import datetime
import pandas as pd
from math import sin, pi
from models import ml_models  # Historical data module

def get_combined_data(api_key, lat, lon, start_date=None, end_date=None):
    start_timestamp = int(datetime.strptime(start_date, "%Y-%m-%d").timestamp()) if start_date else None
    end_timestamp = int(datetime.strptime(end_date, "%Y-%m-%d").timestamp()) if end_date else None

    weather_data = get_weather_data(api_key, lat, lon)
    pollution_data = get_air_pollution_data(api_key, lat, lon, start_timestamp, end_timestamp)

    combined_data = []

    for item in weather_data.get('list', []):
        timestamp = item['dt']
        dt_obj = datetime.fromtimestamp(timestamp)

        try:
            matching_pollution = find_matching_data(pollution_data.get('list', []), timestamp)
        except Exception as e:
            print(f"[WARN] Pollution matching failed at {dt_obj}: {e}")
            matching_pollution = None

        clouds = item.get('clouds', {}).get('all', 0)
        simulated_sr = estimate_solar_radiation(clouds, timestamp)

        pm25 = matching_pollution['components'].get('pm2_5', 0) if matching_pollution else 0
        pm10 = matching_pollution['components'].get('pm10', 0) if matching_pollution else 0
        no2 = matching_pollution['components'].get('no2', 0) if matching_pollution else 0

        hist_current, hist_voltage, hist_sr = get_historical_power_data(dt_obj)

        combined_data.append({
            "temp_3 (Â°C)": kelvin_to_celsius(item['main']['temp']),
            "SR (W/mt2)": hist_sr if hist_sr is not None else simulated_sr,
            "PM2.5 (Âµg/mÂ³)": pm25,
            "WS (m/s)": item['wind']['speed'],
            "PM10 (Âµg/mÂ³)": pm10,
            "NO2 (Âµg/mÂ³)": no2,
            "AC CURRENT-1 (A)": hist_current,
            "AC VOLTAGE-3 (V)": hist_voltage,
            "metric_date": dt_obj.strftime("%Y-%m-%d %H:%M:%S")
        })

    df = pd.DataFrame(combined_data) if combined_data else pd.DataFrame()
    print("Combined Data Sample:")
    print(df.head())
    return df

def get_weather_data(api_key, lat, lon):
    url = "https://api.openweathermap.org/data/2.5/forecast"
    params = {'lat': lat, 'lon': lon, 'appid': api_key, 'units': 'standard'}

    try:
        response = requests.get(url, params=params)
        response.raise_for_status()
        return response.json()
    except requests.exceptions.RequestException as e:
        print(f"[ERROR] Weather data fetch failed: {e}")
        return {'list': []}

def get_air_pollution_data(api_key, lat, lon, start_timestamp=None, end_timestamp=None):
    url = "https://api.openweathermap.org/data/2.5/air_pollution/history" if start_timestamp and end_timestamp else "https://api.openweathermap.org/data/2.5/air_pollution/forecast"
    params = {'lat': lat, 'lon': lon, 'appid': api_key}
    if start_timestamp and end_timestamp:
        params.update({'start': start_timestamp, 'end': end_timestamp})

    try:
        response = requests.get(url, params=params)
        response.raise_for_status()
        return response.json()
    except requests.exceptions.RequestException as e:
        print(f"[ERROR] Pollution data fetch failed: {e}")
        return {'list': []}

def find_matching_data(data_list, timestamp):
    return min(data_list, key=lambda x: abs(x.get('dt', 0) - timestamp), default=None) if data_list else None

def kelvin_to_celsius(kelvin):
    return round(kelvin - 273.15, 2)

def estimate_solar_radiation(clouds, timestamp):
    max_radiation = 1000
    hour = datetime.fromtimestamp(timestamp).hour
    solar_angle = pi * (hour - 6) / 12
    if 6 <= hour <= 18:
        sin_angle = sin(solar_angle)
        cloud_factor = 1 - (clouds / 100.0)
        return round(max_radiation * sin_angle * cloud_factor, 2)
    else:
        return 0

def get_historical_power_data(dt_obj):
    try:
        prev_df = ml_models.previous_data.copy()

        # Clean column names
        prev_df.columns = [col.strip() for col in prev_df.columns]

        if "metric_date" not in prev_df.columns:
            raise KeyError(f"'metric_date' column not found. Columns available: {prev_df.columns.tolist()}")

        if not pd.api.types.is_datetime64_any_dtype(prev_df["metric_date"]):
            try:
                prev_df["metric_date"] = pd.to_datetime(prev_df["metric_date"], format="%d-%m-%y %H:%M")
            except Exception as e:
                print(f"[WARN] Failed strict datetime parsing. Using fallback. Error: {e}")
                prev_df["metric_date"] = pd.to_datetime(prev_df["metric_date"], errors='coerce')

        mask = (
            (prev_df['metric_date'].dt.day == dt_obj.day) &
            (prev_df['metric_date'].dt.month == dt_obj.month) &
            (prev_df['metric_date'].dt.hour == dt_obj.hour)
        )
        filtered = prev_df[mask]

        if not filtered.empty:
            avg_current = filtered["AC CURRENT-1 (A)"].mean()
            avg_voltage = filtered["AC VOLTAGE-3 (V)"].mean()
            avg_sr = filtered["SR (W/mt2)"].mean()
            return round(avg_current, 2), round(avg_voltage, 2), round(avg_sr, 2)
        else:
            print(f"[INFO] No historical match for {dt_obj.strftime('%Y-%m-%d %H:%M')}")
            return 0, 0, None

    except Exception as e:
        print(f"[ERROR] get_historical_power_data failed at {dt_obj}. Details: {e}")
        return 0, 0, None

if __name__ == "__main__":
    api_key = 'f074a590d32963feb94eba89ff93756b'
    lat, lon = 28.6139, 77.2090
    start_date, end_date = '2025-03-31', '2025-04-10'

    df = get_combined_data(api_key, lat, lon, start_date, end_date)

    if not df.empty:
        df.to_csv('combined_weather_pollution_data.csv', index=False)
        print("[✅] Data saved to combined_weather_pollution_data.csv")
    else:
        print("[⚠️] No data to save.")
