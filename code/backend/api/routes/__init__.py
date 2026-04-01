"""
API routes package for Fluxion backend
"""

from api.routes import analytics, auth, health, portfolio, transactions, users

__all__ = [
    "auth",
    "health",
    "users",
    "portfolio",
    "transactions",
    "analytics",
]
