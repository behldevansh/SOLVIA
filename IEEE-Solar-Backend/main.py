from fastapi import FastAPI
from contextlib import asynccontextmanager
from starlette.middleware import Middleware
from middleware.HandleExceptions import HandleExceptionsMiddleware
from fastapi.middleware.cors import CORSMiddleware
from routes.predict import router as predict_router
from routes.nsut import router as nsut_router
from models import ml_models, nsut_model
import uvicorn


@asynccontextmanager
async def lifespan_context(app_instance: FastAPI):
    print("Application starting up.")
    ml_models.load_scaler()
    ml_models.load_model()
    ml_models.load_previous_data()
    ml_models.load_dust_model()


    # Load the NSUT model
    nsut_model.load_scaler()
    nsut_model.load_model()
    nsut_model.load_previous_data()
    nsut_model.load_dust_model()
    yield
    print("Application shutting down.")


middleware = [
    Middleware(HandleExceptionsMiddleware),
    Middleware(CORSMiddleware, allow_origins=["*"], allow_credentials=True, allow_methods=["*"], allow_headers=["*"])
]

app = FastAPI(lifespan=lifespan_context, middleware=middleware)




@app.get("/")
async def root():
    return {"message": "Welcome to the Solar Power Prediction API!"}

app.include_router(predict_router, prefix="/predict", tags=["predict"])
app.include_router(nsut_router, prefix="/nsut", tags=["nsut"])

# if __name__ == "__main__":
#     uvicorn.run(app, host="0.0.0.0", port=8000)
    

