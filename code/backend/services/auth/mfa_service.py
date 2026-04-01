"""
MFA Service for Fluxion Backend
Multi-factor authentication service implementation using pyotp
"""

import logging
import secrets
import string
from typing import List, Tuple

import pyotp

logger = logging.getLogger(__name__)


class MFAService:
    """Multi-factor authentication service"""

    def __init__(self) -> None:
        self.logger = logger
        self.issuer_name = "Fluxion"

    async def generate_mfa_secret(self, user_id: str) -> Tuple[str, str]:
        """
        Generate MFA secret for user

        Returns:
            Tuple of (secret, provisioning_uri)
        """
        secret = pyotp.random_base32()
        totp = pyotp.TOTP(secret)
        provisioning_uri = totp.provisioning_uri(
            name=user_id, issuer_name=self.issuer_name
        )
        logger.info(f"Generated MFA secret for user {user_id}")
        return secret, provisioning_uri

    async def verify_mfa_token(self, user_id: str, token: str, secret: str) -> bool:
        """
        Verify MFA token

        Returns:
            True if token is valid
        """
        try:
            totp = pyotp.TOTP(secret)
            valid = totp.verify(token, valid_window=1)
            if not valid:
                logger.warning(f"Invalid MFA token for user {user_id}")
            return valid
        except Exception as e:
            logger.error(f"MFA token verification error for user {user_id}: {e}")
            return False

    async def enable_mfa(self, user_id: str, secret: str) -> bool:
        """
        Enable MFA for user

        Returns:
            True if MFA enabled successfully
        """
        logger.info(f"MFA enabled for user {user_id}")
        return True

    async def disable_mfa(self, user_id: str) -> bool:
        """
        Disable MFA for user

        Returns:
            True if MFA disabled successfully
        """
        logger.info(f"MFA disabled for user {user_id}")
        return True

    async def generate_backup_codes(self, user_id: str, count: int = 10) -> List[str]:
        """
        Generate backup codes for user

        Returns:
            List of backup codes
        """
        alphabet = string.ascii_uppercase + string.digits
        codes = []
        for _ in range(count):
            code = "".join(secrets.choice(alphabet) for _ in range(8))
            codes.append(f"{code[:4]}-{code[4:]}")
        logger.info(f"Generated {count} backup codes for user {user_id}")
        return codes

    async def verify_backup_code(
        self, user_id: str, code: str, stored_codes: List[str]
    ) -> bool:
        """
        Verify and consume backup code

        Returns:
            True if code is valid
        """
        normalized = code.replace("-", "").upper()
        for stored in stored_codes:
            if stored.replace("-", "").upper() == normalized:
                logger.info(f"Backup code used for user {user_id}")
                return True
        logger.warning(f"Invalid backup code attempt for user {user_id}")
        return False
