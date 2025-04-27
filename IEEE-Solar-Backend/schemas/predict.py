from pydantic import BaseModel, Field
from typing import List, Optional

class RequestBody(BaseModel):
    temp: float = Field(..., title="Temperature (°C)", description="Temperature in degrees Celsius", example=25.0)
    SR: float = Field(..., title="Solar Radiation (W/m²)", description="Solar Radiation in watts per square meter", example=500.0)
    PM2_5: float = Field(..., title="PM2.5 (µg/m³)", description="PM2.5 concentration in micrograms per cubic meter", example=35.0)
    WS: float = Field(..., title="Wind Speed (m/s)", description="Wind Speed in meters per second", example=5.0)
    PM10: float = Field(..., title="PM10 (µg/m³)", description="PM10 concentration in micrograms per cubic meter", example=50.0)
    NO2: float = Field(..., title="NO2 (µg/m³)", description="NO2 concentration in micrograms per cubic meter", example=40.0)
    AC_CURRENT: float = Field(..., title="AC Current (A)", description="AC Current-1 in amperes", example=10.0)
    AC_VOLTAGE: float = Field(..., title="AC Voltage (V)", description="AC Voltage-3 in volts", example=220.0)
    metric_date: str = Field(..., title="Metric Date", description="Date of the metric", example="2025-01-01")
    
class ResponseBody(BaseModel):
    ac_power: float = Field(..., title="AC Power (W)", description="AC Power in watts", example=500.0)


class RangeDates(BaseModel):
    start_date: str = Field(..., title="Start Date", description="Start date of the range", example="2025-01-01")
    end_date: str = Field(..., title="End Date", description="End date of the range", example="2025-01-02")
    longitude: float = Field(..., title="Longitude", description="Longitude of the location", example=77.0)
    latitude: float = Field(..., title="Latitude", description="Latitude of the location", example=28.0)
    
class RangeResponse(BaseModel):
    data: List[dict] = Field(..., title="Data", description="List of AC Power and Metric Date", example=[{"ac_power": 500.0, "metric_date": "2025-01-01"}, {"AC_POWER": 600.0, "metric_date": "2025-01-02"}])

class DustPredictionRequest(BaseModel):
    start_date: str = Field(..., title="Start Date", description="Start date of the range", example="2025-01-01")
    end_date: str = Field(..., title="End Date", description="End date of the range", example="2025-01-02")
    last_cleaning_date: str = Field(..., title="Last Cleaning Date", description="Last cleaning date", example="2025-01-01")

class CombinePredictionRequest(BaseModel):
    start_date: str = Field(..., title="Start Date", description="Start date of the range", example="2025-01-01")
    end_date: str = Field(..., title="End Date", description="End date of the range", example="2025-01-02")
    last_cleaning_date: str = Field(..., title="Last Cleaning Date", description="Last cleaning date", example="2025-01-01")
    longitude: float = Field(..., title="Longitude", description="Longitude of the location", example=77.0)
    latitude: float = Field(..., title="Latitude", description="Latitude of the location", example=28.0)
    api_key: Optional[str] = Field(default="f074a590d32963feb94eba89ff93756b", title="API Key", description="API key for external services", example="your_api_key")