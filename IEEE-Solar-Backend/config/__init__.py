# from dotenv import dotenv_values
import os
# config = dotenv_values(".env")

# MONGO_DB_URI = config.get("MONGO_DB_URI")
# MONGO_DB_NAME = config.get("MONGO_DB_NAME")

MONGO_DB_URI = os.getenv("MONGO_DB_URI")
MONGO_DB_NAME = os.getenv("MONGO_DB_NAME")


SCALER_URL = os.getenv("SCALER_URL")
MODEL_URL = os.getenv("MODEL_URL")
PREVIOUS_DATA_URL = os.getenv("PREVIOUS_DATA_URL")
LOCAL_MODEL_PATH = os.getenv("LOCAL_MODEL_PATH")
LOCAL_SCALER_PATH = os.getenv("LOCAL_SCALER_PATH")

ENVIRONMENT = os.getenv("ENV")

print(f"SCALER_URL: {SCALER_URL}")
print(f"MongoDB URI: {MONGO_DB_URI}")
print(f"MongoDB Name: {MONGO_DB_NAME}")


COSNT_TEMPRATURE = 25
COSNT_SOLAR_RADIATION = 500
COSNT_PM2_5 = 35
COSNT_WIND_SPEED = 5
COSNT_PM10 = 50
COSNT_NO2 = 40
COSNT_AC_CURRENT = 10
COSNT_AC_VOLTAGE = 220