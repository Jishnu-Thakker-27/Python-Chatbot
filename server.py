import os
import sys

# Ensure UTF-8 output encoding on Windows consoles
if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8", errors="replace")
        sys.stderr.reconfigure(encoding="utf-8", errors="replace")
    except Exception:
        pass

import json
import mimetypes
from urllib.parse import urlparse, parse_qs
from http.server import HTTPServer, ThreadingHTTPServer, BaseHTTPRequestHandler

# Import local database and AI service modules
import database
import ai_service

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

class AetherRequestHandler(BaseHTTPRequestHandler):
    """
    HTTP Request Handler built entirely with Python's standard library.
    Replaces FastAPI/Uvicorn with zero external web framework dependencies.
    Serves HTML, CSS, JS frontend assets and handles all JSON REST API routes.
    """

    def send_cors_headers(self):
        """Adds CORS headers allowing any frontend origin to connect."""
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, DELETE, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type, Authorization")

    def do_OPTIONS(self):
        """Handles CORS preflight requests."""
        self.send_response(200)
        self.send_cors_headers()
        self.end_headers()

    def send_json(self, data, status_code=200):
        """Sends a JSON response with status code and CORS headers."""
        response_bytes = json.dumps(data).encode("utf-8")
        self.send_response(status_code)
        self.send_cors_headers()
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(response_bytes)))
        self.end_headers()
        self.wfile.write(response_bytes)

    def send_error_json(self, message, status_code=400):
        """Helper to send standard JSON error responses."""
        self.send_json({"detail": message, "error": message}, status_code=status_code)

    def read_json_body(self):
        """Reads and parses incoming JSON payload."""
        content_length = int(self.headers.get("Content-Length", 0))
        if content_length == 0:
            return {}
        body = self.rfile.read(content_length)
        try:
            return json.loads(body.decode("utf-8"))
        except Exception:
            return {}

    def serve_static_file(self, file_path, content_type=None):
        """Safely serves a static file from the project directory."""
        if not os.path.isfile(file_path):
            self.send_response(404)
            self.send_header("Content-Type", "text/plain; charset=utf-8")
            self.end_headers()
            self.wfile.write(b"404 Not Found")
            return

        if not content_type:
            content_type, _ = mimetypes.guess_type(file_path)
            content_type = content_type or "application/octet-stream"

        try:
            with open(file_path, "rb") as f:
                content = f.read()
            self.send_response(200)
            self.send_cors_headers()
            self.send_header("Content-Type", content_type)
            self.send_header("Content-Length", str(len(content)))
            self.end_headers()
            self.wfile.write(content)
        except Exception as e:
            self.send_response(500)
            self.end_headers()
            self.wfile.write(f"500 Internal Server Error: {e}".encode("utf-8"))

    # =========================================================================
    # GET Requests
    # =========================================================================
    def do_GET(self):
        parsed = urlparse(self.path)
        path = parsed.path
        query = parse_qs(parsed.query)

        # 1. Root / UI entry point
        if path == "/" or path == "/index.html":
            index_path = os.path.join(BASE_DIR, "index.html")
            self.serve_static_file(index_path, "text/html; charset=utf-8")
            return

        # 2. Static CSS file
        if path == "/style.css":
            css_path = os.path.join(BASE_DIR, "style.css")
            self.serve_static_file(css_path, "text/css; charset=utf-8")
            return

        # 3. Static JS file
        if path == "/app.js":
            js_path = os.path.join(BASE_DIR, "app.js")
            self.serve_static_file(js_path, "application/javascript; charset=utf-8")
            return

        # 4. API Health Check
        if path == "/api/health" or path == "/api":
            self.send_json({
                "status": "online",
                "message": "Aether Space Chatbot Backend (Pure Python) is running smoothly!",
                "database": "MySQL" if database.MYSQL_ACTIVE else "SQLite"
            })
            return

        # 5. Fetch Chat History
        if path == "/api/history":
            email_param = query.get("email", [None])[0]
            limit_param = int(query.get("limit", [30])[0])

            user_id = None
            if email_param:
                user_info = database.get_user_by_email(email_param)
                if user_info:
                    user_id = user_info["id"]

            rows = database.get_chat_history(user_id=user_id, limit=limit_param)
            formatted = [
                {
                    "id": r["id"],
                    "role": r["role"],
                    "message": r["message"],
                    "created_at": str(r["created_at"]),
                }
                for r in rows
            ]
            self.send_json({"history": formatted})
            return

        # 6. Fallback file serving for any other asset
        clean_path = path.lstrip("/")
        potential_file = os.path.join(BASE_DIR, clean_path)
        if os.path.isfile(potential_file) and not clean_path.startswith("."):
            self.serve_static_file(potential_file)
            return

        self.send_response(404)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.end_headers()
        self.wfile.write(b'{"detail":"Endpoint or file not found"}')

    # =========================================================================
    # POST Requests
    # =========================================================================
    def do_POST(self):
        parsed = urlparse(self.path)
        path = parsed.path
        body = self.read_json_body()

        # 1. Register User
        if path == "/api/register":
            username = str(body.get("username", "")).strip()
            email = str(body.get("email", "")).strip().lower()
            password = str(body.get("password", "")).strip()

            if not username or not email or not password:
                self.send_error_json("Username, email, and password are required.", 400)
                return

            if len(password) < 4:
                self.send_error_json("Password must be at least 4 characters long.", 400)
                return

            user_data, error = database.create_user(username, email, password)
            if error:
                self.send_error_json(error, 400)
                return

            self.send_json({
                "success": True,
                "message": "Registration successful! Welcome to Aether Space.",
                "user": user_data
            }, status_code=200)
            return

        # 2. Login User
        if path == "/api/login":
            email = str(body.get("email", "")).strip().lower()
            password = str(body.get("password", "")).strip()

            if not email or not password:
                self.send_error_json("Email and password are required.", 400)
                return

            user_data, error = database.authenticate_user(email, password)
            if error:
                self.send_error_json(error, 401)
                return

            self.send_json({
                "success": True,
                "message": "Login successful!",
                "user": user_data
            }, status_code=200)
            return

        # 3. Google OAuth Sign-In
        if path == "/api/google-auth":
            name = str(body.get("name", "")).strip() or "Google User"
            email = str(body.get("email", "")).strip().lower()
            password = body.get("password")

            if not email:
                self.send_error_json("Google email is required.", 400)
                return

            user_data, error = database.create_or_get_oauth_user(name, email, password)
            if error:
                self.send_error_json(error, 400)
                return

            self.send_json({
                "success": True,
                "message": "Google sign-in successful!",
                "user": user_data
            }, status_code=200)
            return

        # 4. Phone Number Sign-In
        if path == "/api/phone-auth":
            phone = str(body.get("phone", "")).strip()
            name = str(body.get("name", "")).strip() or f"User {phone[-4:] if len(phone)>=4 else 'Phone'}"
            password = body.get("password")

            if not phone or len(phone) < 6:
                self.send_error_json("Valid phone number is required.", 400)
                return

            clean_phone = phone.replace(" ", "").replace("+", "").replace("-", "")
            phone_email = f"phone_{clean_phone}@mobile.user"
            user_data, error = database.create_or_get_oauth_user(name, phone_email, password)
            if error:
                self.send_error_json(error, 400)
                return

            self.send_json({
                "success": True,
                "message": "Phone sign-in successful!",
                "user": user_data
            }, status_code=200)
            return

        # 5. AI Chat Request
        if path == "/api/chat":
            message = str(body.get("message", "")).strip()
            username = str(body.get("username", "")).strip() or "Friend"
            email = body.get("email")
            history = body.get("history", [])

            if not message:
                self.send_error_json("Message cannot be empty.", 400)
                return

            user_id = None
            if email:
                user_info = database.get_user_by_email(email)
                if user_info:
                    user_id = user_info["id"]

            # Save user message into database
            database.save_chat_message(user_id=user_id, role="user", message=message)

            # Convert history to format needed by AI
            history_dicts = []
            if isinstance(history, list):
                for h in history:
                    if isinstance(h, dict) and "role" in h and "content" in h:
                        history_dicts.append({"role": h["role"], "content": h["content"]})

            # Call AI service (Google Gemini API with multi-model cascade and mindful fallback)
            reply_text, source = ai_service.get_ai_response(
                message=message,
                display_name=username,
                history=history_dicts
            )

            # Save assistant reply into database
            database.save_chat_message(user_id=user_id, role="assistant", message=reply_text)

            self.send_json({
                "reply": reply_text,
                "source": source
            }, status_code=200)
            return

        self.send_error_json("Endpoint not found", 404)

    # =========================================================================
    # DELETE Requests
    # =========================================================================
    def do_DELETE(self):
        parsed = urlparse(self.path)
        path = parsed.path
        query = parse_qs(parsed.query)

        if path == "/api/history":
            email_param = query.get("email", [None])[0]
            user_id = None
            if email_param:
                user_info = database.get_user_by_email(email_param)
                if user_info:
                    user_id = user_info["id"]

            success = database.clear_chat_history(user_id=user_id)
            self.send_json({
                "success": success,
                "message": "Chat history cleared successfully"
            })
            return

        self.send_error_json("Endpoint not found", 404)

    def log_message(self, format, *args):
        """Custom clean logging format for server requests."""
        sys.stdout.write(f"[Server] {self.address_string()} - {format % args}\n")
        sys.stdout.flush()

def run_server(port=None):
    """Initializes database and boots standard library ThreadingHTTPServer."""
    if port is None:
        port = int(os.getenv("PORT", 8000))

    print("=================================================================")
    print(" 🌟 AETHER SPACE — AI CONVERSATIONAL ASSISTANT")
    print(" Built using Pure Python, HTML5, CSS3, and JavaScript (ES6+)")
    print(" Zero External Web Frameworks (No FastAPI, No Uvicorn, No Node.js)")
    print("=================================================================")

    # Initialize MySQL/SQLite database tables
    print("[Database] Initializing database tables...")
    database.init_db()

    server_address = ("0.0.0.0", port)
    httpd = ThreadingHTTPServer(server_address, AetherRequestHandler)

    print(f"\n🚀 Aether Space is LIVE and running!")
    print(f"👉 Local Access URL: http://127.0.0.1:{port}")
    print(f"👉 Network URL:      http://localhost:{port}")
    print(f"💡 Press Ctrl+C anytime to stop the server.\n")

    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\n[Shutdown] Stopping server gracefully. Goodbye!")
        httpd.server_close()

if __name__ == "__main__":
    port_arg = int(sys.argv[1]) if len(sys.argv) > 1 else None
    run_server(port_arg)
