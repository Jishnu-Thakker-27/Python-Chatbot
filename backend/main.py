import os
from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from models import (
    RegisterRequest,
    LoginRequest,
    GoogleAuthRequest,
    PhoneAuthRequest,
    AuthResponse,
    UserResponse,
    ChatRequest,
    ChatResponse,
    HistoryResponse,
    HistoryItem,
)
import database
import ai_service

# Lifespan event to initialize the database tables on startup
@asynccontextmanager
async def lifespan(app: FastAPI):
    print("[Startup] Initializing MySQL database and tables...")
    database.init_db()
    yield
    print("[Shutdown] Backend shutting down.")

# Create the FastAPI app
app = FastAPI(
    title="Aether Space Chatbot API",
    description="Backend API for AI Chatbot using Python, FastAPI, MySQL, and Gemini API",
    version="1.0.0",
    lifespan=lifespan,
)

# Enable CORS (Cross-Origin Resource Sharing) so the React frontend can call this backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins (Vite dev server, Vercel, localhost)
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Routes ---

@app.get("/")
def read_root():
    """Health check endpoint to test if backend is running."""
    return {
        "status": "online",
        "message": "Aether Space Chatbot Backend is running smoothly!",
        "docs": "/docs",
    }

@app.post("/api/register", response_model=AuthResponse)
def register_user(req: RegisterRequest):
    """
    Registers a new user:
    1. Validates inputs
    2. Hashes the password
    3. Saves user into MySQL 'users' table
    """
    username = req.username.strip()
    email = req.email.strip().lower()
    password = req.password.strip()

    if not username or not email or not password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username, email, and password are required.",
        )

    if len(password) < 4:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password must be at least 4 characters.",
        )

    user_data, error = database.create_user(username, email, password)
    if error:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=error,
        )

    return AuthResponse(
        success=True,
        message="Registration successful! Welcome to Aether Space.",
        user=UserResponse(**user_data),
    )

@app.post("/api/login", response_model=AuthResponse)
def login_user(req: LoginRequest):
    """
    Logs in an existing user:
    1. Looks up user by email in MySQL
    2. Verifies hashed password
    3. Returns user profile
    """
    email = req.email.strip().lower()
    password = req.password.strip()

    if not email or not password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email and password are required.",
        )

    user_data, error = database.authenticate_user(email, password)
    if error:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=error,
        )

    return AuthResponse(
        success=True,
        message="Login successful!",
        user=UserResponse(**user_data),
    )

@app.post("/api/google-auth", response_model=AuthResponse)
def google_auth(req: GoogleAuthRequest):
    """Logs in or registers user via Google account."""
    name = req.name.strip() or "Google User"
    email = req.email.strip().lower()
    if not email:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Google email is required.")
    
    user_data, error = database.create_or_get_oauth_user(name, email, req.password)
    if error:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=error)
    
    return AuthResponse(
        success=True,
        message="Google sign-in successful!",
        user=UserResponse(**user_data)
    )

@app.post("/api/phone-auth", response_model=AuthResponse)
def phone_auth(req: PhoneAuthRequest):
    """Logs in or registers user via Phone Number."""
    phone = req.phone.strip()
    name = req.name.strip() or f"User {phone[-4:]}"
    if not phone or len(phone) < 6:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Valid phone number is required.")
    
    phone_email = f"phone_{phone.replace(' ', '').replace('+', '').replace('-', '')}@mobile.user"
    user_data, error = database.create_or_get_oauth_user(name, phone_email, req.password)
    if error:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=error)
    
    return AuthResponse(
        success=True,
        message="Phone sign-in successful!",
        user=UserResponse(**user_data)
    )


@app.post("/api/chat", response_model=ChatResponse)
def chat_with_ai(req: ChatRequest):
    """
    Main Chatbot REST API endpoint:
    1. Receives message and user details
    2. Finds user_id in MySQL (if email provided)
    3. Saves user message into MySQL 'chat_history'
    4. Calls Google Gemini API for an intelligent response (with mindful fallback)
    5. Saves assistant response into MySQL 'chat_history'
    6. Returns assistant response to frontend
    """
    message = req.message.strip()
    if not message:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Message cannot be empty.",
        )

    user_id = None
    if req.email:
        user_info = database.get_user_by_email(req.email)
        if user_info:
            user_id = user_info["id"]

    # 1. Save user message in MySQL
    database.save_chat_message(user_id=user_id, role="user", message=message)

    # 2. Convert history to dictionary format for AI context
    history_dicts = []
    if req.history:
        history_dicts = [{"role": h.role, "content": h.content} for h in req.history]

    # 3. Call Gemini API
    reply_text, source = ai_service.get_ai_response(
        message=message,
        display_name=req.username or "Friend",
        history=history_dicts,
    )

    # 4. Save AI response in MySQL
    database.save_chat_message(user_id=user_id, role="assistant", message=reply_text)

    return ChatResponse(reply=reply_text, source=source)

@app.get("/api/history", response_model=HistoryResponse)
def get_history(email: str = None, limit: int = 30):
    """Fetches chat history for the specified user email from MySQL."""
    user_id = None
    if email:
        user_info = database.get_user_by_email(email)
        if user_info:
            user_id = user_info["id"]

    rows = database.get_chat_history(user_id=user_id, limit=limit)
    formatted = [
        HistoryItem(
            id=r["id"],
            role=r["role"],
            message=r["message"],
            created_at=str(r["created_at"]),
        )
        for r in rows
    ]
    return HistoryResponse(history=formatted)

@app.delete("/api/history")
def clear_history(email: str = None):
    """Clears chat history for the user from MySQL."""
    user_id = None
    if email:
        user_info = database.get_user_by_email(email)
        if user_info:
            user_id = user_info["id"]

    success = database.clear_chat_history(user_id=user_id)
    return {"success": success, "message": "Chat history cleared successfully"}

if __name__ == "__main__":
    import uvicorn
    # Allows running directly with: python main.py
    port = int(os.getenv("PORT", 8000))
    print(f"Starting server on http://127.0.0.1:{port}")
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)
