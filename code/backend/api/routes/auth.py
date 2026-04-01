"""
Authentication API Routes for Fluxion Backend
Handles user authentication, registration, and session management.
"""

from typing import Any, Dict, Optional

from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from pydantic import BaseModel, EmailStr
from services.auth.jwt_service import DeviceInfo, JWTService
from services.user.user_service import UserService, UserType

router = APIRouter()
security = HTTPBearer(auto_error=False)

# --- Dependency factories ---


def get_jwt_service() -> JWTService:
    return JWTService()


def get_user_service() -> UserService:
    return UserService()


async def get_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security),
    jwt_service: JWTService = Depends(get_jwt_service),
) -> Dict[str, Any]:
    """Validate JWT and return current user claims."""
    if credentials is None:
        raise HTTPException(status_code=401, detail="Authorization header required")
    token = credentials.credentials
    result = await jwt_service.validate_token(token)
    from services.auth.jwt_service import TokenStatus

    if result.status != TokenStatus.VALID:
        raise HTTPException(
            status_code=401,
            detail=result.error_message or "Invalid or expired token",
        )
    claims = result.claims
    return {
        "user_id": claims.user_id,
        "session_id": claims.session_id,
        "roles": claims.roles,
        "permissions": claims.permissions,
        "mfa_verified": claims.mfa_verified,
    }


# --- Request/Response models ---


class RegisterRequest(BaseModel):
    email: EmailStr
    password: str
    user_type: str = "individual"
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    phone_number: Optional[str] = None
    country_of_residence: str = "US"


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str


class MFAVerificationRequest(BaseModel):
    mfa_token: str
    mfa_code: str


class RefreshTokenRequest(BaseModel):
    refresh_token: str


# --- Routes ---


@router.post("/register", summary="Register a new user")
async def register_user(
    request: RegisterRequest,
    http_request: Request,
    user_service: UserService = Depends(get_user_service),
):
    """Register a new user account."""
    try:
        device_info = DeviceInfo(
            ip_address=http_request.client.host if http_request.client else "unknown",
            user_agent=http_request.headers.get("user-agent", ""),
            device_id=http_request.headers.get("x-device-id"),
        )
        profile_data = {
            "first_name": request.first_name,
            "last_name": request.last_name,
            "phone_number": request.phone_number,
            "country_of_residence": request.country_of_residence,
        }
        result = await user_service.register_user(
            email=request.email,
            password=request.password,
            user_type=UserType(request.user_type),
            profile_data=profile_data,
            device_info=device_info,
        )
        return {
            "success": True,
            "data": result,
            "message": "User registered successfully",
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception:
        raise HTTPException(status_code=500, detail="Registration failed")


@router.post("/login", summary="Authenticate user")
async def login_user(
    request: LoginRequest,
    http_request: Request,
    user_service: UserService = Depends(get_user_service),
):
    """Authenticate user and create a session."""
    try:
        device_info = DeviceInfo(
            ip_address=http_request.client.host if http_request.client else "unknown",
            user_agent=http_request.headers.get("user-agent", ""),
            device_id=http_request.headers.get("x-device-id"),
        )
        result = await user_service.authenticate_user(
            email=request.email,
            password=request.password,
            device_info=device_info,
        )
        return {"success": True, "data": result, "message": "Authentication successful"}
    except ValueError as e:
        raise HTTPException(status_code=401, detail=str(e))
    except Exception:
        raise HTTPException(status_code=500, detail="Authentication failed")


@router.post("/refresh", summary="Refresh access token")
async def refresh_token(
    request: RefreshTokenRequest,
    http_request: Request,
    jwt_service: JWTService = Depends(get_jwt_service),
):
    """Refresh access token using a valid refresh token."""
    try:
        device_info = DeviceInfo(
            ip_address=http_request.client.host if http_request.client else "unknown",
            user_agent=http_request.headers.get("user-agent", ""),
            device_id=http_request.headers.get("x-device-id"),
        )
        result = await jwt_service.refresh_token(request.refresh_token, device_info)
        return {
            "success": True,
            "data": result,
            "message": "Token refreshed successfully",
        }
    except ValueError as e:
        raise HTTPException(status_code=401, detail=str(e))
    except Exception:
        raise HTTPException(status_code=500, detail="Token refresh failed")


@router.get("/verify-email", summary="Verify email address")
async def verify_email(
    token: str,
    user_service: UserService = Depends(get_user_service),
):
    """Verify user email address using a verification token."""
    try:
        result = await user_service.verify_email(token)
        return {
            "success": True,
            "data": result,
            "message": "Email verified successfully",
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception:
        raise HTTPException(status_code=500, detail="Email verification failed")


@router.post("/change-password", summary="Change user password")
async def change_password(
    request: ChangePasswordRequest,
    current_user: Dict[str, Any] = Depends(get_current_user),
    user_service: UserService = Depends(get_user_service),
):
    """Change the authenticated user's password."""
    try:
        user_id = current_user["user_id"]
        result = await user_service.change_password(
            user_id=user_id,
            current_password=request.current_password,
            new_password=request.new_password,
        )
        return {
            "success": True,
            "data": result,
            "message": "Password changed successfully",
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception:
        raise HTTPException(status_code=500, detail="Password change failed")


@router.post("/enable-mfa", summary="Enable MFA")
async def enable_mfa(
    current_user: Dict[str, Any] = Depends(get_current_user),
    user_service: UserService = Depends(get_user_service),
):
    """Enable multi-factor authentication for the current user."""
    try:
        user_id = current_user["user_id"]
        result = await user_service.enable_mfa(user_id)
        return {"success": True, "data": result, "message": "MFA setup initiated"}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception:
        raise HTTPException(status_code=500, detail="MFA setup failed")


@router.post("/verify-mfa-setup", summary="Verify MFA setup")
async def verify_mfa_setup(
    request: MFAVerificationRequest,
    current_user: Dict[str, Any] = Depends(get_current_user),
    user_service: UserService = Depends(get_user_service),
):
    """Verify MFA setup with an authenticator code."""
    try:
        user_id = current_user["user_id"]
        result = await user_service.verify_mfa_setup(
            user_id=user_id, mfa_code=request.mfa_code
        )
        return {"success": True, "data": result, "message": "MFA enabled successfully"}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception:
        raise HTTPException(status_code=500, detail="MFA verification failed")


@router.post("/disable-mfa", summary="Disable MFA")
async def disable_mfa(
    password: str,
    current_user: Dict[str, Any] = Depends(get_current_user),
    user_service: UserService = Depends(get_user_service),
):
    """Disable multi-factor authentication."""
    try:
        user_id = current_user["user_id"]
        result = await user_service.disable_mfa(user_id=user_id, password=password)
        return {"success": True, "data": result, "message": "MFA disabled successfully"}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception:
        raise HTTPException(status_code=500, detail="MFA disable failed")


@router.post("/logout", summary="Logout user")
async def logout_user(
    current_user: Dict[str, Any] = Depends(get_current_user),
    jwt_service: JWTService = Depends(get_jwt_service),
):
    """Logout user and revoke all tokens."""
    try:
        user_id = current_user["user_id"]
        await jwt_service.revoke_user_sessions(user_id, "User logout")
        return {"success": True, "message": "Logged out successfully"}
    except Exception:
        raise HTTPException(status_code=500, detail="Logout failed")


@router.get("/me", summary="Get current user")
async def get_me(
    current_user: Dict[str, Any] = Depends(get_current_user),
    user_service: UserService = Depends(get_user_service),
):
    """Get current authenticated user's profile."""
    try:
        user_id = current_user["user_id"]
        profile = await user_service.get_user_profile(user_id)
        return {
            "success": True,
            "data": profile,
            "message": "Profile retrieved successfully",
        }
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception:
        raise HTTPException(status_code=500, detail="Failed to retrieve user profile")
