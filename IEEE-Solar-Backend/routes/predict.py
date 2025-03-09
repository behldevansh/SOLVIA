from fastapi import APIRouter, HTTPException, status
from schemas.predict import RequestBody, ResponseBody, RangeDates, RangeResponse
import pandas as pd
from config import *
from models import ml_models
router = APIRouter()




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
    if ScalerModel is None:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Scaler Model not found")
    
    if MLModel is None:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Model not found")
    
    
    start_date = request.start_date
    end_date = request.end_date
    date_range = pd.date_range(start=start_date, end=end_date, freq='D')
    df = pd.DataFrame(date_range, columns=['metric_date'])
    df['metric_date'] = df['metric_date'].map(pd.Timestamp.timestamp)
    df["temp_3 (Â°C)"] = COSNT_TEMPRATURE
    df["SR (W/mt2)"] = COSNT_SOLAR_RADIATION
    df["PM2.5 (Âµg/mÂ³)"] = COSNT_PM2_5
    df["WS (m/s)"] = COSNT_WIND_SPEED
    df["PM10 (Âµg/mÂ³)"] = COSNT_PM10
    df["NO2 (Âµg/mÂ³)"] = COSNT_NO2
    df["AC CURRENT-1 (A)"] = COSNT_AC_CURRENT
    df["AC VOLTAGE-3 (V)"] = COSNT_AC_VOLTAGE
    
    # Ensure the feature names are in the same order as they were during fit
    X = df[[
        "temp_3 (Â°C)", "SR (W/mt2)", "PM2.5 (Âµg/mÂ³)", "WS (m/s)", 
        "PM10 (Âµg/mÂ³)", "NO2 (Âµg/mÂ³)", "AC CURRENT-1 (A)", "AC VOLTAGE-3 (V)", "metric_date"
    ]]

    scaled_data = ScalerModel.transform(X)

    predictions = MLModel.predict(scaled_data)
    pridiction_list = predictions.tolist()
    date_list = date_range.strftime("%Y-%m-%d").tolist()
    data = [{"ac_power": ac_power, "metric_date": date} for ac_power, date in zip(pridiction_list, date_list)]
    return RangeResponse(data=data)
