from fastapi import APIRouter, HTTPException, status
from schemas.predict import RequestBody, ResponseBody, RangeDates, RangeResponse
import pandas as pd
from config import *
from models import nsut_model
from fastapi import APIRouter, HTTPException, status, Body
from schemas.predict import RequestBody, ResponseBody, RangeDates, RangeResponse, DustPredictionRequest
import pandas as pd
from datetime import timedelta
from config import *
from models import nsut_model
import random
import numpy as np
from datetime import datetime, date
router = APIRouter()

from pydantic import BaseModel, Field




@router.post("/")
async def predict(request: RequestBody):
    ScalerModel = nsut_model.scaler
    MLModel = nsut_model.model
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
    ScalerModel = nsut_model.scaler
    MLModel = nsut_model.model
    PrevuosData = nsut_model.previous_data
    if ScalerModel is None:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Scaler Model not found")
    
    if MLModel is None:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Model not found")
    
    if PrevuosData is None:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Previous Data not found")
    

    
    
    start_date = request.start_date
    end_date = request.end_date
    date_range = pd.date_range(start=start_date, end=end_date, freq='15T')
    df = pd.DataFrame(date_range, columns=['metric_date'])
   
    df['day_month'] = pd.to_datetime(df['metric_date'], format='%Y-%m-%d').dt.strftime('%d-%m %H:%M')
    merged_df = pd.merge(df, PrevuosData, how='left', on='day_month')
    merged_df = merged_df.drop(columns=['day_month'])
    merged_df['metric_date'] = merged_df['metric_date'].map(pd.Timestamp.timestamp)

    # Ensure the feature names are in the same order as they were during fit
    X = merged_df[[
        "temp_3 (Â°C)", "SR (W/mt2)", "PM2.5 (Âµg/mÂ³)", "WS (m/s)", 
        "PM10 (Âµg/mÂ³)", "NO2 (Âµg/mÂ³)", "AC CURRENT-1 (A)", "AC VOLTAGE-3 (V)", "metric_date"
    ]]

    scaled_data = ScalerModel.transform(X)

    predictions = MLModel.predict(scaled_data)
    pridiction_list = predictions.tolist()
    date_list = date_range.strftime("%Y-%m-%d %H:%M:%S").tolist()
    data = [{"ac_power": ac_power, "metric_date": date} for ac_power, date in zip(pridiction_list, date_list)]
    return RangeResponse(data=data)




@router.post("/dust")
async def predict_range(request: DustPredictionRequest = Body(...)):
    if nsut_model.dust_model is None:
        nsut_model.load_dust_model()
        
    if nsut_model.previous_data is None:  # Fixed typo: previos -> previous
        nsut_model.load_previous_data()

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
        result = nsut_model.dust_model_predict(
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


    