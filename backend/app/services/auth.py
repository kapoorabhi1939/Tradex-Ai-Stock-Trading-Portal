from __future__ import annotations

from datetime import timezone
import hashlib

from pydantic import ValidationError

from ..models import AuthResponse, LoginRequest, SignupRequest, UserProfile
from ..seed_data import ANCHOR_TIME
from ..store import InMemoryStore


class AuthenticationError(ValueError):
    """Raised when credentials or tokens are invalid."""


class AuthService:
    def __init__(self, store: InMemoryStore) -> None:
        self.store = store

    @staticmethod
    def hash_password(password: str) -> str:
        return hashlib.sha256(password.encode("utf-8")).hexdigest()

    @staticmethod
    def create_token(user_id: str) -> str:
        return f"demo-{user_id}"

    @staticmethod
    def parse_token(token: str) -> str:
        if not token.startswith("demo-"):
            raise AuthenticationError("Invalid auth token.")
        return token.removeprefix("demo-")

    def signup(self, payload: dict) -> AuthResponse:
        request = SignupRequest.model_validate(payload)
        email = request.email.lower()
        if email in self.store.users_by_email:
            raise AuthenticationError("An account with that email already exists.")

        next_id = f"user-{len(self.store.users_by_id) + 1}"
        user = UserProfile(
            user_id=next_id,
            full_name=request.full_name,
            email=email,
            password_hash=self.hash_password(request.password),
            created_at=ANCHOR_TIME.astimezone(timezone.utc),
        )
        self.store.users_by_id[user.user_id] = user
        self.store.users_by_email[user.email] = user
        self.store.watchlists[user.user_id] = ["AAPL", "MSFT"]
        self.store.alerts[user.user_id] = []
        return AuthResponse(
            token=self.create_token(user.user_id),
            user_id=user.user_id,
            full_name=user.full_name,
            email=user.email,
        )

    def login(self, payload: dict) -> AuthResponse:
        request = LoginRequest.model_validate(payload)
        user = self.store.users_by_email.get(request.email.lower())
        if not user or user.password_hash != self.hash_password(request.password):
            raise AuthenticationError("Invalid email or password.")

        return AuthResponse(
            token=self.create_token(user.user_id),
            user_id=user.user_id,
            full_name=user.full_name,
            email=user.email,
        )

    def resolve_user(self, authorization_header: str | None) -> UserProfile:
        if not authorization_header or not authorization_header.startswith("Bearer "):
            raise AuthenticationError("Missing Bearer token.")

        token = authorization_header.removeprefix("Bearer ").strip()
        user_id = self.parse_token(token)
        user = self.store.users_by_id.get(user_id)
        if not user:
            raise AuthenticationError("User not found for token.")
        return user

