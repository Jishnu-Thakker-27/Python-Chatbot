# 🌟 Aether Space — AI Chatbot Companion
### Pure Python, HTML5, CSS3 & JavaScript (ES6+) Architecture

A full-stack, tactile AI Chatbot application designed for mindfulness, focus, and daily guidance with a claymorphic design and zero external web framework dependencies.

- **Frontend:** Semantic HTML5 + Pure CSS3 (Claymorphic Neumorphic Design System) + Vanilla JavaScript (ES6+)
- **Backend:** Pure Python Standard Library (`http.server.ThreadingHTTPServer` REST API)
- **AI Engine:** Google Gemini API (via `google-genai` SDK with multi-model cascade and mindful fallback)
- **Database:** Dual-Engine Relational Architecture: MySQL with automated SQLite local fallback (`chatbot_local.db`)
- **Audio Engine:** Browser Web Audio API (432Hz ambient soundscapes, haptic pops, Tibetan singing bowl chime)

---

## 📁 Project Structure

```
Mini Project/
├── index.html              # Frontend user interface (Auth & Chatbot screens)
├── style.css               # Complete claymorphic stylesheet (pure CSS, no frameworks)
├── app.js                  # Frontend logic, Web Audio engine, IST time, & REST client
├── server.py               # Pure Python threaded HTTP server & REST API (replaces FastAPI)
├── database.py             # Dual-engine database persistence (MySQL + SQLite fallback)
├── ai_service.py           # Google Gemini API client with smart fallback
├── setup_database.sql      # Optional MySQL schema creation script
├── requirements.txt        # Minimal Python dependencies (google-genai, pymysql, python-dotenv)
├── run.bat                 # One-click Windows launch script (starts server & opens browser)
├── .env                    # Environment variables (GEMINI_API_KEY, MySQL credentials)
├── .env.example            # Environment variables template
├── chatbot_local.db        # SQLite database for zero-configuration local development
├── PROJECT_REPORT.md       # Full B.Tech Semester III IPP project examination report
└── README.md               # Project documentation & setup instructions
```

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- **Python 3.10+** installed
- Optional: **MySQL Server** (if not installed, the app automatically uses local SQLite with zero setup!)

### 2. Configure Environment (`.env`)
Create or edit `.env` in the root directory:

```env
# 1. Google Gemini API Key (Get a free key from https://aistudio.google.com/)
GEMINI_API_KEY=your_actual_gemini_api_key

# 2. Local MySQL Database Credentials (Optional)
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=chatbot_db
PORT=8000
```

### 3. Install Python Dependencies
```bash
pip install -r requirements.txt
```

### 4. Run the Application
Simply double-click `run.bat` or run:

```bash
python server.py
```

Then open your browser at:
👉 **`http://127.0.0.1:8000`**

---

## 🌟 Key Features

1. **Claymorphic UI Aesthetic:**
   - 3D tactile clay buttons, recessed inset input fields, and smooth debossed text shadows.
   - Animated custom 3D clay avatar with headphones, cheerful expressions, and online indicator pip.
   - Responsive card container that scales effortlessly between desktop laptops and mobile viewports.

2. **Zero-Framework Python Server:**
   - Powered by Python's built-in `http.server.ThreadingHTTPServer`.
   - Complete asynchronous JSON REST API handling `/api/register`, `/api/login`, `/api/google-auth`, `/api/phone-auth`, `/api/chat`, and `/api/history`.
   - Full CORS preflight support (`OPTIONS`) and automatic MIME type static file delivery.

3. **Multi-Method Secure Authentication:**
   - **Email & Password:** Registration and login with salted SHA-256 password hashing.
   - **Google OAuth Simulation:** One-tap sign-in modal creating or retrieving user accounts.
   - **Phone Number with OTP:** 4-digit verification code generation and authentication.
   - **Forgot Password Modal:** Simulated reset link generation with email verification.

4. **Time-Aware AI Companion & IST Sync:**
   - Uses strict Indian Standard Time (IST, UTC+5:30) calculations to dynamically greet users (*"Good morning"*, *"Good afternoon"*, *"Good evening"*).
   - Quick prompt suggestion chips for Daily Focus, Audio Remedies, Box Breathing, and Spark Clarity.

5. **Integrated Web Audio Engine:**
   - **Haptic Clicks:** Client-side oscillator clicks synthesized on keypresses and button taps.
   - **Meditation Chime:** 432Hz sine tone with harmonic 5th overtone and bandpass filter on auth success.
   - **Ambient Soundscape:** Continuous 432Hz/438Hz binaural theta brainwave audio generator for deep focus.
   - **Text-to-Speech (TTS):** Browser SpeechSynthesis utterance integration on every assistant message.
