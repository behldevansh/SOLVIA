from fastapi import APIRouter, HTTPException, status
from schemas.predict import RequestBody, ResponseBody, RangeDates, RangeResponse
import pandas as pd
from config import *
from models import ml_models
from fastapi import APIRouter, HTTPException, status, Body
from schemas.predict import RequestBody, ResponseBody, RangeDates, RangeResponse, DustPredictionRequest
import pandas as pd
from datetime import timedelta
from config import *
from models import ml_models, nsut_model
import random
import numpy as np
from datetime import datetime, date
from utils.getWeaterInfo import get_combined_data
from schemas.predict import CombinePredictionRequest
router = APIRouter()

from pydantic import BaseModel, Field




@router.post("/")
async def predict(request: RequestBody):
    ScalerModel = ml_models.scaler
    MLModel = ml_models.model
    if ScalerModel is None:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Scaler Model not found")
    
    if MLModel is None:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Model not found")
    
    
    data = request.model_dump()
    df = pd.DataFrame(index=[0])
    df["temp_3 (Â°C)"] = data["temp"]
    df["SR (W/mt2)"] = data["SR"]
    df["PM2.5 (Âµg/mÂ³)"] = data["PM2_5"]
    df["WS (m/s)"] = data["WS"]
    df["PM10 (Âµg/mÂ³)"] = data["PM10"]
    df["NO2 (Âµg/mÂ³)"] = data["NO2"]
    df["AC CURRENT-1 (A)"] = data["AC_CURRENT"]
    df["AC VOLTAGE-3 (V)"] = data["AC_VOLTAGE"]
    df['metric_date'] = pd.to_datetime([data["metric_date"]]).map(pd.Timestamp.timestamp)
    
    scaled_data = ScalerModel.transform(df)
    prediction = MLModel.predict(scaled_data)
    return {"ac_power": prediction[0]}
    # return {"prediction": 0.0}



    
@router.post("/range")
async def predict_range(request: RangeDates):
    ScalerModel = ml_models.scaler
    MLModel = ml_models.model
    PrevuosData = ml_models.previous_data
    if ScalerModel is None:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Scaler Model not found")
    
    if MLModel is None:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Model not found")
    
    if PrevuosData is None:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Previous Data not found")
    

    
    
    start_date = request.start_date
    end_date = request.end_date
    longitude = request.longitude
    latitude = request.latitude
    # date_range = pd.date_range(start=start_date, end=end_date, freq='15T')
    # df = pd.DataFrame(date_range, columns=['metric_date'])
    df = get_combined_data(
        api_key="f074a590d32963feb94eba89ff93756b",
        lat=latitude,
        lon=longitude,
        start_date=start_date,
        end_date=end_date
    )
    if df.empty:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No data found for the given date range.")
    
    # Safely convert 'metric_date' to datetime
   
    merged_df = df
    merged_df['metric_date'] = pd.to_datetime(merged_df['metric_date'])
    merged_df['metric_date'] = merged_df['metric_date'].map(pd.Timestamp.timestamp)
    # Ensure the feature names are in the same order as they were during fit
    X = merged_df[[
        "temp_3 (Â°C)", "SR (W/mt2)", "PM2.5 (Âµg/mÂ³)", "WS (m/s)", 
        "PM10 (Âµg/mÂ³)", "NO2 (Âµg/mÂ³)", "AC CURRENT-1 (A)", "AC VOLTAGE-3 (V)", "metric_date"
    ]]

    scaled_data = ScalerModel.transform(X)

    predictions = MLModel.predict(scaled_data)
    pridiction_list = predictions.tolist()
    date_list = merged_df['metric_date'].tolist()
    data = [{"ac_power": ac_power, "metric_date": date} for ac_power, date in zip(pridiction_list, date_list)]
    return RangeResponse(data=data)




@router.post("/dust")
async def predict_range(request: DustPredictionRequest = Body(...)):
    if ml_models.dust_model is None:
        ml_models.load_dust_model()
        
    if ml_models.previous_data is None:  # Fixed typo: previos -> previous
        ml_models.load_previous_data()

    # Validate date format
    try:
        request.start_date = pd.to_datetime(request.start_date, format="%Y-%m-%d").strftime("%Y-%m-%d")
        request.end_date = pd.to_datetime(request.end_date, format="%Y-%m-%d").strftime("%Y-%m-%d")
        request.last_cleaning_date = pd.to_datetime(request.last_cleaning_date, format="%Y-%m-%d").strftime("%Y-%m-%d")
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail="Invalid date format. Please use YYYY-MM-DD format."
        )
    
    try:
        result = ml_models.dust_model_predict(
            request.start_date,
            request.end_date,
            request.last_cleaning_date
        )
        return result
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error generating dust prediction: {str(e)}"
        )


@router.post("/all-status")
async def predict_all(request: CombinePredictionRequest = Body(...)):
    # Load models if needed
    if ml_models.scaler is None:
        ml_models.load_scaler()
    if ml_models.model is None:
        ml_models.load_model()
    if ml_models.previous_data is None:
        ml_models.load_previous_data()
    if ml_models.dust_model is None:
        ml_models.load_dust_model()
    
    start_date = request.start_date
    end_date = request.end_date

    # Validate date range
    if pd.to_datetime(start_date) > pd.to_datetime(end_date):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, 
                            detail="Start date must be before end date")
    
    longitude = request.longitude
    latitude = request.latitude

    api_key = "f074a590d32963feb94eba89ff93756b"
    dataFrame = get_combined_data(api_key, latitude, longitude, start_date, end_date)

    if dataFrame.empty:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No data found for the given date range.")
    
    # Safely convert 'metric_date' to datetime
    dataFrame['metric_date'] = pd.to_datetime(dataFrame['metric_date'], errors='coerce')
    dataFrame.dropna(subset=['metric_date'], inplace=True)

    # Convert datetime to timestamp (UNIX seconds) for model usage
    dataFrame['metric_date'] = dataFrame['metric_date'].astype('int64') // 10**9

    # Ensure the feature order matches training
    X = dataFrame[[
        "temp_3 (Â°C)", "SR (W/mt2)", "PM2.5 (Âµg/mÂ³)", "WS (m/s)", 
        "PM10 (Âµg/mÂ³)", "NO2 (Âµg/mÂ³)", "AC CURRENT-1 (A)", "AC VOLTAGE-3 (V)", "metric_date"
    ]]

    scaled_data = ml_models.scaler.transform(X)
    predictions = ml_models.model.predict(scaled_data)

    prediction_list = predictions.tolist()

    # Convert metric_date (UNIX timestamp) back to readable string
    readable_dates = pd.to_datetime(dataFrame['metric_date'], unit='s').dt.strftime("%Y-%m-%d %H:%M:%S").tolist()
    data = [{"ac_power": ac_power, "metric_date": date} for ac_power, date in zip(prediction_list, readable_dates)]
    
    # Validate last_cleaning_date
    if request.last_cleaning_date and pd.to_datetime(request.last_cleaning_date) > pd.to_datetime(end_date):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, 
                            detail="Last cleaning date must be before end date")

    # Dust prediction
    dust_prediction = ml_models.dust_model_predict(
        start_date,
        end_date,
        request.last_cleaning_date,
        dataFrame
    )

    return {
        "ac_power": data,
        "dust_prediction": dust_prediction
    }


# Test code (separate from the API endpoint)
def test_get_combined_data():
    api_key = 'f074a590d32963feb94eba89ff93756b'  # NEW API KEY
    # api_key = '1d4e18b954ce7847b3be9b21336f8a6c'  # OLD API KEY
    lat, lon = 28.6139, 77.2090
    start_date, end_date = '2025-03-31', '2025-04-10'

    df = get_combined_data(api_key, lat, lon, start_date, end_date)
    print(df.head())

# You can call this function to test
# test_get_combined_data()




