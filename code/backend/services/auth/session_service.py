"""
Session Service for Fluxion Backend
Session management service
"""

import logging
import uuid
from datetime import datetime, timedelta, timezone
from typing import Any, Dict, Optional
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

logger = logging.getLogger(__name__)


class SessionService:
    """Session management service"""

    def __init__(self) -> None:
        self.logger = logger
        self._sessions: Dict[str, Any] = {}

    async def create_session(
        self,
        db: AsyncSession,
        user_id: Any,
        ip_address: str = "",
        user_agent: str = "",
        remember_me: bool = False,
    ) -> Any:
        """Create a new database session record for a user."""
        from models.user import UserSession

        expire_days = 30 if remember_me else 1
        expires_at = datetime.now(timezone.utc) + timedelta(days=expire_days)

        session = UserSession(
            id=uuid.uuid4(),
            user_id=user_id,
            session_token="",
            ip_address=ip_address,
            user_agent=user_agent,
            is_active=True,
            expires_at=expires_at,
            last_activity_at=datetime.now(timezone.utc),
            created_at=datetime.now(timezone.utc),
            updated_at=datetime.now(timezone.utc),
        )
        db.add(session)
        await db.flush()
        return session

    async def get_session(self, db: AsyncSession, session_id: UUID) -> Optional[Any]:
        """Get session by ID"""
        from models.user import UserSession

        result = await db.execute(
            select(UserSession).where(UserSession.id == session_id)
        )
        return result.scalar_one_or_none()

    async def invalidate_session(self, db: AsyncSession, session_id: Any) -> None:
        """Invalidate a single session"""
        from models.user import UserSession

        result = await db.execute(
            select(UserSession).where(UserSession.id == session_id)
        )
        session = result.scalar_one_or_none()
        if session:
            session.is_active = False
            await db.flush()

    async def invalidate_user_sessions(
        self,
        db: AsyncSession,
        user_id: Any,
        exclude_current: bool = False,
    ) -> None:
        """Invalidate all sessions for a user"""
        from models.user import UserSession

        result = await db.execute(
            select(UserSession).where(
                UserSession.user_id == user_id,
                UserSession.is_active == True,
            )
        )
        sessions = result.scalars().all()
        for session in sessions:
            session.is_active = False
        await db.flush()

    async def validate_session(self, session_id: str) -> bool:
        """Validate if session exists and is valid"""
        return session_id in self._sessions

    async def delete_session(self, session_id: str) -> bool:
        """Delete session"""
        if session_id in self._sessions:
            del self._sessions[session_id]
            return True
        return False

    async def delete_user_sessions(self, user_id: str) -> int:
        """Delete all sessions for user"""
        sessions_to_delete = [
            sid
            for sid, data in self._sessions.items()
            if data.get("user_id") == user_id
        ]
        for sid in sessions_to_delete:
            del self._sessions[sid]
        return len(sessions_to_delete)
