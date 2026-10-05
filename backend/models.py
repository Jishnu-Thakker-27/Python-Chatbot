from pydantic import BaseModel, EmailStr
from typing import List, Optional

# --- Request Models ---

class RegisterRequest(BaseModel):
    username: str
    email: str
    password: str

class LoginRequest(BaseModel):
    email: str
    password: str

class GoogleAuthRequest(BaseModel):
    name: str
    email: str
    password: Optional[str] = None

class PhoneAuthRequest(BaseModel):
    phone: str
    name: Optional[str] = "Friend"
    password: Optional[str] = None

class ChatMessageItem(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    message: str
    username: Optional[str] = "Friend"
    email: Optional[str] = None
    history: Optional[List[ChatMessageItem]] = []

# --- Response Models ---

class UserResponse(BaseModel):
    id: int
    username: str
    email: str

class AuthResponse(BaseModel):
    success: bool
    message: str
    user: Optional[UserResponse] = None

class ChatResponse(BaseModel):
    reply: str
    source: str = "gemini"  # "gemini" or "fallback"

class HistoryItem(BaseModel):
    id: int
    role: str
    message: str
    created_at: str

class HistoryResponse(BaseModel):
    history: List[HistoryItem]
