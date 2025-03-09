import requests
import sys
from io import BytesIO
from tqdm import tqdm
from joblib import load
from config import SCALER_URL, MODEL_URL


class MLModels:
    def __init__(self, scaler_url, model_url):
        self.scaler_url = scaler_url
        self.model_url = model_url
        self.scaler = None
        self.model = None
        
    def load_scaler(self):
        self.scaler = self.load_model_from_url(self.scaler_url)
        
    def load_model(self):
        self.model = self.load_model_from_url(self.model_url)
        
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

ml_models = MLModels(SCALER_URL, MODEL_URL)