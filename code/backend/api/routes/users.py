"""
User management routes for Fluxion Backend
"""

from typing import Any, Dict, Optional

from api.routes.auth import get_current_user, get_user_service
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from services.user.user_service import UserService

router = APIRouter()


class UpdateProfileRequest(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    phone_number: Optional[str] = None
    bio: Optional[str] = None
    timezone: Optional[str] = None
    language: Optional[str] = None


class UpdatePreferencesRequest(BaseModel):
    notification_preferences: Optional[Dict[str, Any]] = None
    privacy_settings: Optional[Dict[str, bool]] = None
    trading_preferences: Optional[Dict[str, Any]] = None
    display_preferences: Optional[Dict[str, Any]] = None


@router.get("/me", summary="Get current user profile")
async def get_profile(
    current_user: Dict[str, Any] = Depends(get_current_user),
    user_service: UserService = Depends(get_user_service),
):
    """Get the authenticated user's full profile."""
    try:
        profile = await user_service.get_user_profile(current_user["user_id"])
        return {"success": True, "data": profile}
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception:
        raise HTTPException(status_code=500, detail="Failed to retrieve profile")


@router.patch("/me", summary="Update current user profile")
async def update_profile(
    request: UpdateProfileRequest,
    current_user: Dict[str, Any] = Depends(get_current_user),
    user_service: UserService = Depends(get_user_service),
):
    """Update the authenticated user's profile."""
    try:
        result = await user_service.update_user_profile(
            user_id=current_user["user_id"],
            profile_data=request.model_dump(exclude_none=True),
        )
        return {
            "success": True,
            "data": result,
            "message": "Profile updated successfully",
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception:
        raise HTTPException(status_code=500, detail="Failed to update profile")


@router.get("/me/preferences", summary="Get user preferences")
async def get_preferences(
    current_user: Dict[str, Any] = Depends(get_current_user),
    user_service: UserService = Depends(get_user_service),
):
    """Get the authenticated user's preferences."""
    try:
        prefs = await user_service.get_user_preferences(current_user["user_id"])
        return {"success": True, "data": prefs}
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception:
        raise HTTPException(status_code=500, detail="Failed to retrieve preferences")


@router.patch("/me/preferences", summary="Update user preferences")
async def update_preferences(
    request: UpdatePreferencesRequest,
    current_user: Dict[str, Any] = Depends(get_current_user),
    user_service: UserService = Depends(get_user_service),
):
    """Update the authenticated user's preferences."""
    try:
        result = await user_service.update_user_preferences(
            user_id=current_user["user_id"],
            preferences=request.model_dump(exclude_none=True),
        )
        return {"success": True, "data": result, "message": "Preferences updated"}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception:
        raise HTTPException(status_code=500, detail="Failed to update preferences")


@router.delete("/me", summary="Deactivate account")
async def deactivate_account(
    current_user: Dict[str, Any] = Depends(get_current_user),
    user_service: UserService = Depends(get_user_service),
):
    """Deactivate the authenticated user's account."""
    try:
        await user_service.deactivate_user(current_user["user_id"])
        return {"success": True, "message": "Account deactivated successfully"}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception:
        raise HTTPException(status_code=500, detail="Failed to deactivate account")


@router.get("/me/sessions", summary="Get active sessions")
async def get_sessions(
    current_user: Dict[str, Any] = Depends(get_current_user),
    user_service: UserService = Depends(get_user_service),
):
    """Get all active sessions for the current user."""
    try:
        sessions = await user_service.get_user_sessions(current_user["user_id"])
        return {"success": True, "data": sessions}
    except Exception:
        raise HTTPException(status_code=500, detail="Failed to retrieve sessions")
