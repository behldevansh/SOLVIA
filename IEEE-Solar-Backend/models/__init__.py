import requests
import sys
from io import BytesIO
from tqdm import tqdm
from joblib import load
import pandas as pd
import numpy as np
from datetime import timedelta, date
from config import SCALER_URL, MODEL_URL, DUST_MODEL_URL, LOCAL_MODEL_PATH, LOCAL_SCALER_PATH, LOCAL_DUST_MODEL_PATH, PREVIOUS_DATA_URL
import os

ENV = os.environ.get('ENV', 'development')


class MLModels:
    def __init__(self, scaler_url, model_url, previous_data_url, dust_model_url, local_scaler_path=None, local_model_path=None, local_dust_model_path=None):
        self.scaler_url = scaler_url
        self.model_url = model_url
        self.dust_model_url = dust_model_url
        self.local_scaler_path = local_scaler_path
        self.local_model_path = local_model_path
        self.local_dust_model_path = local_dust_model_path
        self.scaler = None
        self.model = None
        self.dust_model = None
        self.previous_data_url = previous_data_url
        self.previous_data = None
        
        
    def load_scaler(self):
        if ENV == 'development' and self.local_scaler_path and os.path.exists(self.local_scaler_path):
            self.scaler = self.load_model_from_file(self.local_scaler_path)
        else:
            self.scaler = self.load_model_from_url(self.scaler_url)
        
    def load_model(self):
        if ENV == 'development' and self.local_model_path and os.path.exists(self.local_model_path):
            self.model = self.load_model_from_file(self.local_model_path)
        else:
            self.model = self.load_model_from_url(self.model_url)
        
    def load_dust_model(self):
        if ENV == 'development' and self.local_dust_model_path and os.path.exists(self.local_dust_model_path):
            self.dust_model = self.load_model_from_file(self.local_dust_model_path)
        else:
            self.dust_model = self.load_model_from_url(self.dust_model_url)

    def load_previous_data(self):
        try:
            if not self.previous_data_url:
                raise ValueError("Previous data URL is not set.")
            print(f"Loading previous data from {self.previous_data_url}...")

            response = requests.get(self.previous_data_url, stream=True)
            response.raise_for_status()  # Ensure we notice bad responses
            
            total_size = int(response.headers.get('content-length', 0))
            model_data = BytesIO()
            
            with tqdm(total=total_size, unit='B', unit_scale=True, desc=self.previous_data_url.split('/')[-1], ncols=100) as pbar:
                for data in response.iter_content(1024):
                    model_data.write(data)
                    pbar.update(len(data))
            
            model_data.seek(0)
            self.previous_data = pd.read_csv(model_data)
            self.previous_data['day_month'] = pd.to_datetime(self.previous_data['metric_date'], format='mixed', dayfirst=True).dt.strftime('%d-%m %H:%M')
            # self.previous_data.drop(columns=['metric_date'], inplace=True)
            return self.previous_data
        except Exception as e:
            print(f"Error loading previous data from {self.previous_data_url}: {e}", file=sys.stderr)
            sys.exit(1)

    def load_model_from_file(self, file_path):
        try:
            if not os.path.exists(file_path):
                raise FileNotFoundError(f"File not found: {file_path}")
            print(f"Loading model from local file: {file_path}...")
            model = load(file_path)
            return model
        except Exception as e:
            print(f"Error loading model from file {file_path}: {e}", file=sys.stderr)
            sys.exit(1)
    

    def dust_model_predict(self, start_date, end_date, last_cleaning_date):
        try:
            if self.dust_model is None:
                self.load_dust_model()
            
            if self.previous_data is None:
                self.load_previous_data()
            
            CLEANING_COST = 2000  # ₹2000 per cleaning
            COST_PER_KWH = 7.5    # ₹7.5 per kWh
            PANEL_CAPACITY = 15000  # 15kW system
            REGULAR_CLEANING_INTERVAL = 30  # Days
            
            start_date = pd.to_datetime(start_date)
            end_date = pd.to_datetime(end_date)
            last_cleaning_date = pd.to_datetime(last_cleaning_date)
            
            if start_date > end_date:
                raise ValueError("Start date must be before end date")
            
            days_to_forecast = (end_date - start_date).days + 1
            date_range = pd.date_range(start=start_date, end=end_date)

            forecast_df = pd.DataFrame({'Date': date_range})
            forecast_df['ds'] = forecast_df['Date'].dt.strftime('%Y-%m-%d')
            
            prediction_df = self.dust_model.predict(forecast_df[['ds']])
            forecast_df['Dust'] = prediction_df['yhat'].clip(lower=0)
            
            results = []
            for _, row in forecast_df.iterrows():
                dust_loss_watts = PANEL_CAPACITY * (row['Dust'] / 1000)
                dust_loss_rupees = dust_loss_watts * 24 * COST_PER_KWH / 1000
                results.append({
                    'Date': row['Date'].strftime('%Y-%m-%d'),
                    'Dust': float(row['Dust']),
                    'Power_Loss': float(dust_loss_watts),
                    'Financial_Loss': float(dust_loss_rupees)
                })
            
            results_df = pd.DataFrame(results)

            cumulative_loss = 0
            cleaning_date = None
            future_dates = results_df[pd.to_datetime(results_df['Date']) > last_cleaning_date]
            
            if not future_dates.empty:
                for _, row in future_dates.iterrows():
                    cumulative_loss += row['Financial_Loss']
                    if cumulative_loss >= CLEANING_COST:
                        cleaning_date = row['Date']
                        break
                if cleaning_date is None:
                    max_dust_idx = future_dates['Dust'].idxmax()
                    cleaning_date = future_dates.loc[max_dust_idx, 'Date']

            total_days = (results_df['Date'].map(pd.to_datetime).max() - 
                        results_df['Date'].map(pd.to_datetime).min()).days

            num_regular_cleanings = max(1, total_days // REGULAR_CLEANING_INTERVAL) if total_days > 0 else 0
            regular_cleaning_cost = num_regular_cleanings * CLEANING_COST

            regular_cleaning_dates = [
                (pd.to_datetime(results_df['Date']).min() + timedelta(days=i * REGULAR_CLEANING_INTERVAL)).strftime('%Y-%m-%d')
                for i in range(1, num_regular_cleanings + 1)
            ] if total_days > 0 else []

            optimized_cleaning_cost = CLEANING_COST if cleaning_date else 0
            optimized_cleaning_dates = [cleaning_date] if cleaning_date else []

            total_loss = results_df['Financial_Loss'].sum()

            if cleaning_date:
                pre_cleaning_loss = results_df[pd.to_datetime(results_df['Date']) < pd.to_datetime(cleaning_date)]['Financial_Loss'].sum()
                optimized_loss = pre_cleaning_loss
            else:
                optimized_loss = total_loss

            potential_savings = total_loss - (optimized_loss + optimized_cleaning_cost) if cleaning_date else 0

            return {
                'forecast': results,
                'cleaning_recommendation': {
                    'optimal_cleaning_date': cleaning_date,
                    'regular_cleaning_dates': regular_cleaning_dates,
                    'optimized_cleaning_dates': optimized_cleaning_dates,
                    'cost_comparison': {
                        'regular_cleaning_cost': float(regular_cleaning_cost),
                        'optimized_cleaning_cost': float(optimized_cleaning_cost),
                        'total_loss_without_cleaning': float(total_loss),
                        'loss_with_optimized_cleaning': float(optimized_loss + optimized_cleaning_cost),
                        'potential_savings': float(potential_savings)
                    }
                }
            }
        except Exception as e:
            print(f"Error in dust model prediction: {e}", file=sys.stderr)
            raise e

    # def dust_model_predict(self, start_date, end_date, last_cleaning_date, dataFrame):
    #     try:
    #         if self.dust_model is None:
    #             self.load_dust_model()
                
    #         if self.previous_data is None:
    #             self.load_previous_data()
                
    #         CLEANING_COST = 2000  # ₹2000 per cleaning
    #         COST_PER_KWH = 7.5    # ₹7.5 per kWh
    #         PANEL_CAPACITY = 15000  # 15kW system
    #         REGULAR_CLEANING_INTERVAL = 30  # Days
                
    #         start_date = pd.to_datetime(start_date)
    #         end_date = pd.to_datetime(end_date)
    #         last_cleaning_date = pd.to_datetime(last_cleaning_date)
            
    #         days_to_forecast = (end_date - start_date).days + 1
            
    #         date_range = pd.date_range(start=start_date, end=end_date)
    #         forecast_df = pd.DataFrame({'Date': date_range})
            
    #         forecast_df['day_of_year'] = forecast_df['Date'].dt.dayofyear
    #         forecast_df['month'] = forecast_df['Date'].dt.month
    #         forecast_df['ds'] = forecast_df['Date']
            
    #         prediction_df = self.dust_model.predict(forecast_df[['ds']])
    #         forecast_df['Dust'] = prediction_df['yhat']
            
    #         forecast_df['Dust'] = forecast_df['Dust'].clip(lower=0)
            
    #         results = []
            
    #         for _, row in forecast_df.iterrows():
    #             dust_loss_watts = PANEL_CAPACITY * (row['Dust'] / 1000)
    #             dust_loss_rupees = dust_loss_watts * 24 * COST_PER_KWH / 1000
    #             results.append({
    #                 'Date': row['Date'].strftime('%Y-%m-%d'),
    #                 'Dust': float(row['Dust']),
    #                 'Power_Loss': float(dust_loss_watts),
    #                 'Financial_Loss': float(dust_loss_rupees)
    #             })
                
    #         results_df = pd.DataFrame(results)
            
    #         cumulative_loss = 0
    #         cleaning_date = None
    #         future_dates = results_df[pd.to_datetime(results_df['Date']) > last_cleaning_date]
            
    #         if not future_dates.empty:
    #             for idx, row in future_dates.iterrows():
    #                 cumulative_loss += row['Financial_Loss']
    #                 if cumulative_loss >= CLEANING_COST and not cleaning_date:
    #                     cleaning_date = row['Date']
    #                     break
                
    #             if cleaning_date is None:
    #                 max_dust_idx = future_dates['Dust'].idxmax()
    #                 cleaning_date = future_dates.loc[max_dust_idx, 'Date']
    #         else:
    #             cleaning_date = None
                    
    #         total_days = (pd.to_datetime(results_df['Date']).max() - pd.to_datetime(results_df['Date']).min()).days
            
    #         num_regular_cleanings = max(1, total_days // REGULAR_CLEANING_INTERVAL) if total_days > 0 else 0
    #         regular_cleaning_cost = num_regular_cleanings * CLEANING_COST
    #         regular_cleaning_dates = [
    #             (pd.to_datetime(results_df['Date']).min() + timedelta(days=i * REGULAR_CLEANING_INTERVAL)).strftime('%Y-%m-%d')
    #             for i in range(1, num_regular_cleanings + 1)
    #         ] if total_days > 0 else []
            
    #         optimized_cleaning_cost = CLEANING_COST if cleaning_date else 0
    #         optimized_cleaning_dates = [cleaning_date] if cleaning_date else []
            
    #         total_loss = results_df['Financial_Loss'].sum()
            
    #         if cleaning_date:
    #             pre_cleaning_loss = results_df[pd.to_datetime(results_df['Date']) < pd.to_datetime(cleaning_date)]['Financial_Loss'].sum()
    #             optimized_loss = pre_cleaning_loss
    #         else:
    #             optimized_loss = total_loss
            
    #         if cleaning_date:
    #             potential_savings = total_loss - (optimized_loss + optimized_cleaning_cost)
    #         else:
    #             potential_savings = 0
            
    #         return {
    #             'forecast': results,
    #             'cleaning_recommendation': {
    #                 'optimal_cleaning_date': cleaning_date,
    #                 'regular_cleaning_dates': regular_cleaning_dates,
    #                 'optimized_cleaning_dates': optimized_cleaning_dates,
    #                 'cost_comparison': {
    #                     'regular_cleaning_cost': float(regular_cleaning_cost),
    #                     'optimized_cleaning_cost': float(optimized_cleaning_cost),
    #                     'total_loss_without_cleaning': float(total_loss),
    #                     'loss_with_optimized_cleaning': float(optimized_loss + optimized_cleaning_cost),
    #                     'potential_savings': float(potential_savings)
    #                 }
    #             }
    #         }
    #     except Exception as e:
    #         print(f"Error in dust model prediction: {e}", file=sys.stderr)
    #         raise e
          
    # def dust_model_predict(self, start_date, end_date, last_cleaning_date):
        # try:
        #     if self.dust_model is None:
        #         self.load_dust_model()
            
        #     CLEANING_COST = 2000
        #     COST_PER_KWH = 7.5
        #     PANEL_CAPACITY = 15000
        #     REGULAR_CLEANING_INTERVAL = 30
        #     DAILY_PRODUCTION_HOURS = 5.5
        #     DAILY_DUST_RATE = 0.5
            
        #     start_date = pd.to_datetime(start_date)
        #     end_date = pd.to_datetime(end_date)
        #     last_cleaning_date = pd.to_datetime(last_cleaning_date)

        #     if last_cleaning_date >= end_date:
        #         raise ValueError("Last cleaning date should be before the end date.")

        #     total_days = (end_date - start_date).days + 1
        #     future = self.dust_model.make_future_dataframe(periods=total_days)
            
        #     future_filtered = future[(future['ds'] >= start_date) & (future['ds'] <= end_date)]
            
        #     forecast = self.dust_model.predict(future_filtered)
            
        #     results_df = pd.DataFrame({
        #         'ds': forecast['ds'],
        #         'date': forecast['ds'].dt.strftime('%Y-%m-%d'),
        #         'base_dust': forecast['yhat'].clip(lower=0)
        #     })
            
        #     results_df = results_df.sort_values('ds')
            
        #     results_df['dust_level'] = 0.0
            
        #     for i, row in results_df.reset_index(drop=True).iterrows():
        #         current_date = row['ds']
                
        #         if current_date <= last_cleaning_date:
        #             results_df.loc[results_df.index[i], 'dust_level'] = 0
        #         else:
        #             if i > 0 and results_df.iloc[i-1]['ds'] > last_cleaning_date:
        #                 prev_dust = results_df.iloc[i-1]['dust_level']
        #                 scaling_factor = max(0.5, row['base_dust'] / 100)
        #                 daily_increase = DAILY_DUST_RATE * scaling_factor
                        
        #                 results_df.loc[results_df.index[i], 'dust_level'] = prev_dust + daily_increase
        #             else:
        #                 days_since_cleaning = (current_date - last_cleaning_date).days
        #                 results_df.loc[results_df.index[i], 'dust_level'] = days_since_cleaning * DAILY_DUST_RATE
            
        #     results = []
        #     for i, row in results_df.iterrows():
        #         dust_level = row['dust_level']
                
        #         efficiency_loss = 1 - (1 / (1 + 0.002 * dust_level))
                
        #         power_loss = PANEL_CAPACITY * efficiency_loss
                
        #         financial_loss = power_loss * DAILY_PRODUCTION_HOURS * COST_PER_KWH / 1000
                
        #         results.append({
        #             'Date': row['date'],
        #             'Dust': float(dust_level),
        #             'Efficiency_Loss': float(efficiency_loss * 100),
        #             'Power_Loss': float(power_loss),
        #             'Financial_Loss': float(financial_loss)
        #         })
            
        #     output_df = pd.DataFrame(results)
            
        #     output_df['Cumulative_Loss'] = 0.0
        #     current_cum_loss = 0.0
            
        #     for i, row in output_df.iterrows():
        #         if pd.to_datetime(row['Date']) > last_cleaning_date:
        #             current_cum_loss += row['Financial_Loss']
        #             output_df.loc[i, 'Cumulative_Loss'] = current_cum_loss
            
        #     cleaning_rows = output_df[
        #         (pd.to_datetime(output_df['Date']) > last_cleaning_date) & 
        #         (output_df['Cumulative_Loss'] >= CLEANING_COST)
        #     ]
            
        #     cleaning_date = cleaning_rows['Date'].iloc[0] if not cleaning_rows.empty else None
            
        #     total_days = (end_date - start_date).days
        #     num_regular_cleanings = total_days // REGULAR_CLEANING_INTERVAL
        #     regular_cleaning_dates = [
        #         (start_date + timedelta(days=i * REGULAR_CLEANING_INTERVAL)).strftime('%Y-%m-%d')
        #         for i in range(1, num_regular_cleanings + 1)
        #     ]
            
        #     optimized_cleaning_dates = []
        #     if cleaning_date:
        #         optimized_cleaning_dates.append(cleaning_date)
                
        #         current_date = pd.to_datetime(cleaning_date)
                
        #         while current_date < end_date:
        #             temp_df = output_df.copy()
        #             for i, row in temp_df.iterrows():
        #                 row_date = pd.to_datetime(row['Date'])
        #                 if row_date <= current_date:
        #                     continue
                        
        #                 days_since_cleaning = (row_date - current_date).days
                        
        #                 temp_df.loc[i, 'Dust'] = days_since_cleaning * DAILY_DUST_RATE
                        
        #                 efficiency_loss = 1 - (1 / (1 + 0.002 * temp_df.loc[i, 'Dust']))
        #                 power_loss = PANEL_CAPACITY * efficiency_loss
        #                 temp_df.loc[i, 'Financial_Loss'] = power_loss * DAILY_PRODUCTION_HOURS * COST_PER_KWH / 1000
                    
        #             cum_loss = 0
        #             next_clean_date = None
                    
        #             for i, row in temp_df[pd.to_datetime(temp_df['Date']) > current_date].iterrows():
        #                 cum_loss += row['Financial_Loss']
        #                 temp_df.loc[i, 'Cumulative_Loss'] = cum_loss
                        
        #                 if cum_loss >= CLEANING_COST and next_clean_date is None:
        #                     next_clean_date = row['Date']
                    
        #             if next_clean_date:
        #                 current_date = pd.to_datetime(next_clean_date)
        #                 optimized_cleaning_dates.append(next_clean_date)
        #             else:
        #                 break
            
        #     regular_cleaning_cost = num_regular_cleanings * CLEANING_COST
        #     optimized_cleaning_cost = len(optimized_cleaning_dates) * CLEANING_COST
            
        #     total_loss_without_cleaning = output_df['Financial_Loss'].sum()
            
        #     simulated_df = output_df.copy()
            
        #     if optimized_cleaning_dates:
        #         cleaning_dates = [last_cleaning_date] + [pd.to_datetime(date) for date in optimized_cleaning_dates]
                
        #         for i, row in simulated_df.iterrows():
        #             row_date = pd.to_datetime(row['Date'])
                    
        #             last_clean = max([d for d in cleaning_dates if d < row_date], default=last_cleaning_date)
                    
        #             days_since_cleaning = (row_date - last_clean).days
                    
        #             simulated_df.loc[i, 'Dust'] = days_since_cleaning * DAILY_DUST_RATE
                    
        #             efficiency_loss = 1 - (1 / (1 + 0.002 * simulated_df.loc[i, 'Dust']))
        #             power_loss = PANEL_CAPACITY * efficiency_loss
        #             simulated_df.loc[i, 'Financial_Loss'] = power_loss * DAILY_PRODUCTION_HOURS * COST_PER_KWH / 1000
            
        #     loss_with_optimized_cleaning = simulated_df['Financial_Loss'].sum()
        #     total_optimized_cost = loss_with_optimized_cleaning + optimized_cleaning_cost
        #     potential_savings = total_loss_without_cleaning - total_optimized_cost
            
        #     return {
        #         'forecast': results,
        #         'cleaning_recommendation': {
        #             'optimal_next_cleaning_date': optimized_cleaning_dates[0] if optimized_cleaning_dates else None,
        #             'regular_cleaning_dates': regular_cleaning_dates,
        #             'optimized_cleaning_dates': optimized_cleaning_dates,
        #             'cost_comparison': {
        #                 'regular_cleaning_cost': float(regular_cleaning_cost),
        #                 'optimized_cleaning_cost': float(optimized_cleaning_cost),
        #                 'total_loss_without_cleaning': float(total_loss_without_cleaning),
        #                 'loss_with_optimized_cleaning': float(total_optimized_cost),
        #                 'potential_savings': float(potential_savings)
        #             }
        #         }
        #     }
        # except Exception as e:
        #     print(f"Error in dust model prediction: {e}", file=sys.stderr)
        #     raise e


        # def dust_model_predict(self, start_date, end_date, last_cleaning_date, dataFrame=None):
        #     try:
        #         if self.dust_model is None:
        #             self.load_dust_model()
                    
        #         # Use provided dataFrame if available, otherwise load previous data
        #         if dataFrame is not None:
        #             input_data = dataFrame
        #         else:
        #             if self.previous_data is None:
        #                 self.load_previous_data()
        #             input_data = self.previous_data
                    
        #         CLEANING_COST = 2000  # ₹2000 per cleaning
        #         COST_PER_KWH = 7.5    # ₹7.5 per kWh
        #         PANEL_CAPACITY = 15000  # 15kW system
        #         REGULAR_CLEANING_INTERVAL = 30  # Days
                    
        #         start_date = pd.to_datetime(start_date)
        #         end_date = pd.to_datetime(end_date)
        #         last_cleaning_date = pd.to_datetime(last_cleaning_date)
                
        #         days_to_forecast = (end_date - start_date).days + 1
                
        #         date_range = pd.date_range(start=start_date, end=end_date)
        #         forecast_df = pd.DataFrame({'Date': date_range})
                
        #         forecast_df['day_of_year'] = forecast_df['Date'].dt.dayofyear
        #         forecast_df['month'] = forecast_df['Date'].dt.month
        #         forecast_df['ds'] = forecast_df['Date']
                
        #         prediction_df = self.dust_model.predict(forecast_df[['ds']])
        #         forecast_df['Dust'] = prediction_df['yhat']
                
        #         forecast_df['Dust'] = forecast_df['Dust'].clip(lower=0)
                
        #         results = []
                
        #         for _, row in forecast_df.iterrows():
        #             dust_loss_watts = PANEL_CAPACITY * (row['Dust'] / 1000)
        #             dust_loss_rupees = dust_loss_watts * 24 * COST_PER_KWH / 1000
        #             results.append({
        #                 'Date': row['Date'].strftime('%Y-%m-%d'),
        #                 'Dust': float(row['Dust']),
        #                 'Power_Loss': float(dust_loss_watts),
        #                 'Financial_Loss': float(dust_loss_rupees)
        #             })
                    
        #         results_df = pd.DataFrame(results)
                
        #         cumulative_loss = 0
        #         cleaning_date = None
        #         future_dates = results_df[pd.to_datetime(results_df['Date']) > last_cleaning_date]
                
        #         if not future_dates.empty:
        #             for idx, row in future_dates.iterrows():
        #                 cumulative_loss += row['Financial_Loss']
        #                 if cumulative_loss >= CLEANING_COST and not cleaning_date:
        #                     cleaning_date = row['Date']
        #                     break
                    
        #             if cleaning_date is None:
        #                 max_dust_idx = future_dates['Dust'].idxmax()
        #                 cleaning_date = future_dates.loc[max_dust_idx, 'Date']
        #         else:
        #             cleaning_date = None
                        
        #         total_days = (pd.to_datetime(results_df['Date']).max() - pd.to_datetime(results_df['Date']).min()).days
                
        #         num_regular_cleanings = max(1, total_days // REGULAR_CLEANING_INTERVAL) if total_days > 0 else 0
        #         regular_cleaning_cost = num_regular_cleanings * CLEANING_COST
        #         regular_cleaning_dates = [
        #             (pd.to_datetime(results_df['Date']).min() + timedelta(days=i * REGULAR_CLEANING_INTERVAL)).strftime('%Y-%m-%d')
        #             for i in range(1, num_regular_cleanings + 1)
        #         ] if total_days > 0 else []
                
        #         optimized_cleaning_cost = CLEANING_COST if cleaning_date else 0
        #         optimized_cleaning_dates = [cleaning_date] if cleaning_date else []
                
        #         total_loss = results_df['Financial_Loss'].sum()
                
        #         if cleaning_date:
        #             pre_cleaning_loss = results_df[pd.to_datetime(results_df['Date']) < pd.to_datetime(cleaning_date)]['Financial_Loss'].sum()
        #             optimized_loss = pre_cleaning_loss
        #         else:
        #             optimized_loss = total_loss
                
        #         if cleaning_date:
        #             potential_savings = total_loss - (optimized_loss + optimized_cleaning_cost)
        #         else:
        #             potential_savings = 0
                
        #         return {
        #             'forecast': results,
        #             'cleaning_recommendation': {
        #                 'optimal_cleaning_date': cleaning_date,
        #                 'regular_cleaning_dates': regular_cleaning_dates,
        #                 'optimized_cleaning_dates': optimized_cleaning_dates,
        #                 'cost_comparison': {
        #                     'regular_cleaning_cost': float(regular_cleaning_cost),
        #                     'optimized_cleaning_cost': float(optimized_cleaning_cost),
        #                     'total_loss_without_cleaning': float(total_loss),
        #                     'loss_with_optimized_cleaning': float(optimized_loss + optimized_cleaning_cost),
        #                     'potential_savings': float(potential_savings)
        #                 }
        #             }
        #         }
        #     except Exception as e:
        #         print(f"Error in dust model prediction: {e}", file=sys.stderr)
        #         raise e

    @staticmethod    
    def load_model_from_url(url):
        try:
            if not url:
                raise ValueError("Model URL is not set.")
            print(f"Loading model from {url}...")
            
            response = requests.get(url, stream=True)
            response.raise_for_status()  # Ensure we notice bad responses
            
            total_size = int(response.headers.get('content-length', 0))
            model_data = BytesIO()
            
            with tqdm(total=total_size, unit='B', unit_scale=True, desc=url.split('/')[-1], ncols=100) as pbar:
                for data in response.iter_content(1024):
                    model_data.write(data)
                    pbar.update(len(data))
            
            model_data.seek(0)
            model = load(model_data)
            return model
        except Exception as e:
            print(f"Error loading model from {url}: {e}", file=sys.stderr)
            sys.exit(1)

    

ml_models = MLModels(
    scaler_url=SCALER_URL,
    model_url=MODEL_URL,
    previous_data_url=PREVIOUS_DATA_URL,
    dust_model_url=DUST_MODEL_URL,
    local_scaler_path=LOCAL_SCALER_PATH,
    local_model_path=LOCAL_MODEL_PATH,
    local_dust_model_path=LOCAL_DUST_MODEL_PATH
)