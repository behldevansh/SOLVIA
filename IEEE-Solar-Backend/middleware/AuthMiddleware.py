# middleware/AuthMiddleware.py
from fastapi import Request, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from typing import Optional

class AuthMiddleware(HTTPBearer):
    def __init__(self, auto_error: bool = True):
        super(AuthMiddleware, self).__init__(auto_error=auto_error)

    async def __call__(self, request: Request) -> Optional[HTTPAuthorizationCredentials]:
        credentials: HTTPAuthorizationCredentials = await super(AuthMiddleware, self).__call__(request)
        if credentials:
            print(f"Credentials: {credentials}")
            if not credentials.scheme == "Bearer":
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Invalid authentication scheme"
                )

            if not self.verify_token(credentials.credentials):
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Invalid or expired token"
                )
            return credentials
        else:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Invalid authorization"
            )
    @staticmethod
    def verify_token(token: str) -> bool:
        print(f"Token: {token}")
        return token == "valid_token"  # Replace with actual verification logic