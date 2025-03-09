import requests
import sys
from io import BytesIO
from tqdm import tqdm
from joblib import load
import pandas as pd
import numpy as np
from config import SCALER_URL, MODEL_URL, PREVIOUS_DATA_URL, LOCAL_MODEL_PATH, LOCAL_SCALER_PATH,ENVIRONMENT


class MLModels:
    def __init__(self, scaler_url, model_url, previous_data_url, local_model_path, local_scaler_path):
        self.scaler_url = scaler_url
        self.model_url = model_url
        self.scaler = None
        self.model = None
        self.previos_data = None
        self.local_model_path = local_model_path
        self.local_scaler_path = local_scaler_path
        self.previos_data_url = previous_data_url
        
    def load_scaler(self):
        print("ENVIRONMENT: ",ENVIRONMENT)
        if ENVIRONMENT != None and ENVIRONMENT == 'development':
            print("Loading scaler from local path : ",self.local_scaler_path)
            self.scaler = load(self.local_scaler_path)
            return
        else:
            self.scaler = self.load_model_from_url(self.scaler_url)
        
    def load_model(self):
        print("ENVIRONMENT: ",ENVIRONMENT)
        if ENVIRONMENT != None and ENVIRONMENT == 'development':
            print("Loading model from local path : ",self.local_model_path)
            self.model = load(self.local_model_path)
            return
        else:
            self.model = self.load_model_from_url(self.model_url)

    def load_previous_data(self):
        try:
            if not self.previos_data_url:
                raise ValueError("Previous data URL is not set.")
            print(f"Loading previous data from {self.previos_data_url}...")

            response = requests.get(self.previos_data_url, stream=True)
            response.raise_for_status()  # Ensure we notice bad responses
            
            total_size = int(response.headers.get('content-length', 0))
            model_data = BytesIO()
            
            with tqdm(total=total_size, unit='B', unit_scale=True, desc=self.previos_data_url.split('/')[-1], ncols=100) as pbar:
                for data in response.iter_content(1024):
                    model_data.write(data)
                    pbar.update(len(data))
            
            model_data.seek(0)
            self.previos_data = pd.read_csv(model_data)
            self.previos_data['day_month'] = pd.to_datetime(self.previos_data['metric_date'], format='mixed', dayfirst=True).dt.strftime('%d-%m %H:%M')
            self.previos_data.drop(columns=['metric_date'], inplace=True)
            return self.previos_data
        except Exception as e:
            print(f"Error loading previous data from {self.previos_data_url}: {e}", file=sys.stderr)
            sys.exit(1)
        
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

    

ml_models = MLModels(SCALER_URL, MODEL_URL, PREVIOUS_DATA_URL, LOCAL_MODEL_PATH, LOCAL_SCALER_PATH)