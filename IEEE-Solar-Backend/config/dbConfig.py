from mongoengine import connect
from config import MONGO_DB_URI, MONGO_DB_NAME

def init_db():
    try:
        connect(MONGO_DB_NAME, host=MONGO_DB_URI)
        print("Database connection successful")
    except ConnectionError as e:
        print(f"Database connection failed: {e}")
        raise