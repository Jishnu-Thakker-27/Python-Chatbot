import os
import hashlib
import sqlite3
import pymysql
import pymysql.cursors
from datetime import datetime, timezone, timedelta
from dotenv import load_dotenv

# Indian Standard Time (IST, UTC+5:30)
IST = timezone(timedelta(hours=5, minutes=30))

def get_current_ist_str() -> str:
    """Returns current IST timestamp string YYYY-MM-DD HH:MM:SS."""
    return datetime.now(IST).strftime("%Y-%m-%d %H:%M:%S")

def get_current_ist_display() -> str:
    """Returns current IST formatted time (e.g. 11:30 PM)."""
    return datetime.now(IST).strftime("%I:%M %p")

# Load environment variables from .env file
load_dotenv()

DB_HOST = os.getenv("DB_HOST", "localhost")
DB_PORT = int(os.getenv("DB_PORT", 3306))
DB_USER = os.getenv("DB_USER", "root")
DB_PASSWORD = os.getenv("DB_PASSWORD", "")
DB_NAME = os.getenv("DB_NAME", "chatbot_db")

SQLITE_DB_PATH = os.path.join(os.path.dirname(__file__), "chatbot_local.db")

# Helper function to hash passwords securely using SHA-256
def hash_password(password: str) -> str:
    salt = "mini_project_secret_salt_2026"
    return hashlib.sha256((password + salt).encode("utf-8")).hexdigest()

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return hash_password(plain_password) == hashed_password

def get_mysql_connection(include_db: bool = True):
    """Attempts to connect to MySQL."""
    try:
        conn = pymysql.connect(
            host=DB_HOST,
            port=DB_PORT,
            user=DB_USER,
            password=DB_PASSWORD,
            database=DB_NAME if include_db else None,
            cursorclass=pymysql.cursors.DictCursor,
            autocommit=True
        )
        return conn
    except Exception as e:
        return None

def get_sqlite_connection():
    """Fallback local database connection using built-in sqlite3."""
    conn = sqlite3.connect(SQLITE_DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

# Flag to remember if MySQL is working
MYSQL_ACTIVE = False

def init_db():
    """Initializes tables in MySQL if available, or falls back to SQLite."""
    global MYSQL_ACTIVE

    # Try MySQL first
    mysql_conn = get_mysql_connection(include_db=False)
    if mysql_conn:
        try:
            with mysql_conn.cursor() as cursor:
                cursor.execute(f"CREATE DATABASE IF NOT EXISTS `{DB_NAME}` CHARACTER SET utf8mb4;")
                cursor.execute(f"USE `{DB_NAME}`;")
                cursor.execute("""
                    CREATE TABLE IF NOT EXISTS users (
                        id INT AUTO_INCREMENT PRIMARY KEY,
                        username VARCHAR(100) NOT NULL,
                        email VARCHAR(150) NOT NULL UNIQUE,
                        password_hash VARCHAR(255) NOT NULL,
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                    );
                """)
                cursor.execute("""
                    CREATE TABLE IF NOT EXISTS chat_history (
                        id INT AUTO_INCREMENT PRIMARY KEY,
                        user_id INT NULL,
                        role ENUM('user', 'assistant') NOT NULL,
                        message TEXT NOT NULL,
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
                    );
                """)
            mysql_conn.close()
            MYSQL_ACTIVE = True
            print(f"[Database] Connected to MySQL successfully! Database '{DB_NAME}' active.")
            return True
        except Exception as e:
            print(f"[Database Notice] MySQL setup error: {e}")
            mysql_conn.close()

    # Fallback to local SQLite if MySQL isn't connected yet
    print("[Database] MySQL not reachable with current credentials. Using local SQLite database (chatbot_local.db) for zero-downtime development.")
    MYSQL_ACTIVE = False
    sqlite_conn = get_sqlite_connection()
    with sqlite_conn:
        cursor = sqlite_conn.cursor()
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT NOT NULL,
                email TEXT NOT NULL UNIQUE,
                password_hash TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        """)
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS chat_history (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NULL,
                role TEXT NOT NULL,
                message TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            );
        """)
    sqlite_conn.close()
    return True

# --- User Management Functions ---

def create_user(username: str, email: str, password: str):
    """Registers a new user."""
    hashed = hash_password(password)

    if MYSQL_ACTIVE:
        conn = get_mysql_connection()
        if conn:
            try:
                with conn.cursor() as cursor:
                    cursor.execute("SELECT id FROM users WHERE email = %s;", (email,))
                    if cursor.fetchone():
                        return None, "Email is already registered"
                    cursor.execute(
                        "INSERT INTO users (username, email, password_hash) VALUES (%s, %s, %s);",
                        (username, email, hashed)
                    )
                    return {"id": cursor.lastrowid, "username": username, "email": email}, None
            finally:
                conn.close()

    # SQLite Fallback
    conn = get_sqlite_connection()
    try:
        with conn:
            cursor = conn.cursor()
            cursor.execute("SELECT id FROM users WHERE email = ?;", (email,))
            if cursor.fetchone():
                return None, "Email is already registered"
            cursor.execute(
                "INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?);",
                (username, email, hashed)
            )
            return {"id": cursor.lastrowid, "username": username, "email": email}, None
    finally:
        conn.close()

def create_or_get_oauth_user(username: str, email: str, password: str = None):
    """Gets existing user by email or registers them with their chosen password."""
    existing = get_user_by_email(email)
    pass_to_use = password.strip() if password and password.strip() else f"oauth_user_{email}"
    
    if existing:
        if password and password.strip():
            hashed = hash_password(pass_to_use)
            if MYSQL_ACTIVE:
                conn = get_mysql_connection()
                if conn:
                    try:
                        with conn.cursor() as cursor:
                            cursor.execute("UPDATE users SET password_hash = %s WHERE id = %s;", (hashed, existing["id"]))
                    finally:
                        conn.close()
            else:
                conn = get_sqlite_connection()
                try:
                    with conn:
                        conn.cursor().execute("UPDATE users SET password_hash = ? WHERE id = ?;", (hashed, existing["id"]))
                finally:
                    conn.close()
        return {"id": existing["id"], "username": existing["username"], "email": existing["email"]}, None
    
    # Create new user with their chosen password
    return create_user(username, email, pass_to_use)

def authenticate_user(email: str, password: str):
    """Verifies user login credentials."""
    if MYSQL_ACTIVE:
        conn = get_mysql_connection()
        if conn:
            try:
                with conn.cursor() as cursor:
                    cursor.execute("SELECT id, username, email, password_hash FROM users WHERE email = %s;", (email,))
                    user = cursor.fetchone()
                    if not user or not verify_password(password, user["password_hash"]):
                        return None, "Invalid email or password"
                    return {"id": user["id"], "username": user["username"], "email": user["email"]}, None
            finally:
                conn.close()

    # SQLite Fallback
    conn = get_sqlite_connection()
    try:
        cursor = conn.cursor()
        cursor.execute("SELECT id, username, email, password_hash FROM users WHERE email = ?;", (email,))
        row = cursor.fetchone()
        if not row or not verify_password(password, row["password_hash"]):
            return None, "Invalid email or password"
        return {"id": row["id"], "username": row["username"], "email": row["email"]}, None
    finally:
        conn.close()

def get_user_by_email(email: str):
    """Retrieves user info by email."""
    if MYSQL_ACTIVE:
        conn = get_mysql_connection()
        if conn:
            try:
                with conn.cursor() as cursor:
                    cursor.execute("SELECT id, username, email FROM users WHERE email = %s;", (email,))
                    return cursor.fetchone()
            finally:
                conn.close()

    # SQLite Fallback
    conn = get_sqlite_connection()
    try:
        cursor = conn.cursor()
        cursor.execute("SELECT id, username, email FROM users WHERE email = ?;", (email,))
        row = cursor.fetchone()
        return dict(row) if row else None
    finally:
        conn.close()

# --- Chat History Functions ---

def save_chat_message(user_id: int | None, role: str, message: str):
    """Saves a message to chat history with explicit IST timestamp."""
    ist_time = get_current_ist_str()
    if MYSQL_ACTIVE:
        conn = get_mysql_connection()
        if conn:
            try:
                with conn.cursor() as cursor:
                    cursor.execute(
                        "INSERT INTO chat_history (user_id, role, message, created_at) VALUES (%s, %s, %s, %s);",
                        (user_id, role, message, ist_time)
                    )
                return True
            finally:
                conn.close()

    # SQLite Fallback
    conn = get_sqlite_connection()
    try:
        with conn:
            conn.cursor().execute(
                "INSERT INTO chat_history (user_id, role, message, created_at) VALUES (?, ?, ?, ?);",
                (user_id, role, message, ist_time)
            )
        return True
    except Exception as e:
        print(f"[DB Error saving message]: {e}")
        return False
    finally:
        conn.close()

def get_chat_history(user_id: int | None, limit: int = 30):
    """Fetches recent chat history formatted in IST."""
    if MYSQL_ACTIVE:
        conn = get_mysql_connection()
        if conn:
            try:
                with conn.cursor() as cursor:
                    if user_id:
                        cursor.execute(
                            "SELECT id, role, message, DATE_FORMAT(created_at, '%%h:%%i %%p') as created_at FROM chat_history WHERE user_id = %s ORDER BY id ASC LIMIT %s;",
                            (user_id, limit)
                        )
                    else:
                        cursor.execute(
                            "SELECT id, role, message, DATE_FORMAT(created_at, '%%h:%%i %%p') as created_at FROM chat_history WHERE user_id IS NULL ORDER BY id ASC LIMIT %s;",
                            (limit,)
                        )
                    return cursor.fetchall()
            finally:
                conn.close()

    # SQLite Fallback
    conn = get_sqlite_connection()
    try:
        cursor = conn.cursor()
        if user_id:
            cursor.execute(
                "SELECT id, role, message, created_at FROM chat_history WHERE user_id = ? ORDER BY id ASC LIMIT ?;",
                (user_id, limit)
            )
        else:
            cursor.execute(
                "SELECT id, role, message, created_at FROM chat_history WHERE user_id IS NULL ORDER BY id ASC LIMIT ?;",
                (limit,)
            )
        rows = cursor.fetchall()
        result = []
        for r in rows:
            row_dict = dict(r)
            raw_ts = str(row_dict.get("created_at") or "")
            formatted_time = raw_ts
            try:
                if " " in raw_ts:
                    time_part = raw_ts.split(" ")[1]
                    parts = time_part.split(":")
                    h, m = int(parts[0]), int(parts[1])
                    period = "AM" if h < 12 else "PM"
                    h12 = h % 12
                    if h12 == 0:
                        h12 = 12
                    formatted_time = f"{h12:02d}:{m:02d} {period}"
                elif ":" in raw_ts:
                    parts = raw_ts.split(":")
                    h, m = int(parts[0]), int(parts[1])
                    period = "AM" if h < 12 else "PM"
                    h12 = h % 12
                    if h12 == 0:
                        h12 = 12
                    formatted_time = f"{h12:02d}:{m:02d} {period}"
            except Exception:
                formatted_time = raw_ts
            row_dict["created_at"] = formatted_time
            result.append(row_dict)
        return result
    except Exception as e:
        print(f"[DB Error fetching history]: {e}")
        return []
    finally:
        conn.close()

def clear_chat_history(user_id: int | None):
    """Clears chat history."""
    if MYSQL_ACTIVE:
        conn = get_mysql_connection()
        if conn:
            try:
                with conn.cursor() as cursor:
                    if user_id:
                        cursor.execute("DELETE FROM chat_history WHERE user_id = %s;", (user_id,))
                    else:
                        cursor.execute("DELETE FROM chat_history WHERE user_id IS NULL;")
                return True
            finally:
                conn.close()

    # SQLite Fallback
    conn = get_sqlite_connection()
    try:
        with conn:
            if user_id:
                conn.cursor().execute("DELETE FROM chat_history WHERE user_id = ?;", (user_id,))
            else:
                conn.cursor().execute("DELETE FROM chat_history WHERE user_id IS NULL;")
        return True
    finally:
        conn.close()
