from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response
from fastapi import HTTPException, status
from mongoengine import get_db
import time

class HandleExceptionsMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        try:
            response = await call_next(request)
            return response
        except HTTPException as e:
            print(f"HTTPException: {e}")
            raise e
        except Exception as e:
            print(f"Exception: {e}")
            return Response(
                content=str(e),
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR
            )