# 📄 B.TECH MINI PROJECT REPORT
## COURSE: INTEGRATED PYTHON PROGRAMMING (IPP) — SEMESTER III

---

# AETHER SPACE: AN AI-POWERED CONVERSATIONAL ASSISTANT SYSTEM
### Engineered using Pure Python, Semantic HTML5, CSS3, Vanilla JavaScript (ES6+), Google Gemini API, and Relational Database Architecture

**Student / Candidate:** Jishnu Thakker  
**Academic Program:** Bachelor of Technology (B.Tech) in Computer Science & Engineering  
**Academic Term:** Semester 3 — Mini Project Examination  
**GitHub Repository:** [Jishnu-Thakker-27/Python-Chatbot](https://github.com/Jishnu-Thakker-27/Python-Chatbot)  

---
<!-- PAGE BREAK: PAGE 1 -->
\pagebreak

# PAGE 1: PROJECT OVERVIEW & ARCHITECTURAL FOUNDATION

## 1.1 Abstract
Conversational Artificial Intelligence systems often struggle with high latency, excessive boilerplate verbosity, and complex backend deployment overhead. **Aether Space** is a full-stack, responsive, and tactile AI chatbot designed to deliver crisp, focused, and low-latency conversational assistance for mindfulness, daily study planning, and contextual Q&A. 

The core of the system is built on **Python 3.11** utilizing the **Python Standard Library Threaded HTTP Server** (`http.server.ThreadingHTTPServer`), entirely eliminating external web framework overhead such as FastAPI, Node.js, or complex runtime dependencies. The frontend is engineered using clean, semantic **HTML5**, modern **CSS3** featuring a claymorphic neumorphic design system, and vanilla **JavaScript (ES6+)** with integrated browser Web Audio API synthesis. The system incorporates Google's latest **Gemini GenAI SDK** for ultra-fast natural language inference, **PyMySQL** and **SQLite** for fault-tolerant relational data persistence, cryptographic password hashing via Python's standard `hashlib`, and strict **Indian Standard Time (IST, UTC+5:30)** synchronization. This report details the software architecture, design patterns, security protocols, and Python engineering implementations that underpin the project.

---

## 1.2 System Architecture & Component Hierarchy

The application follows a decoupled client-server microservice architecture communicating via standardized JSON REST APIs.

```
┌────────────────────────────────────────────────────────────────────────┐
│                        PRESENTATION TIER (FRONTEND)                    │
│      Semantic HTML5 + Pure CSS3 (Claymorphic) + Vanilla JS (ES6+)      │
│      • Audio Engine (432Hz Soundscapes)  • IST Timezone Displays       │
│      • Quick OAuth Pill Modals           • Markdown Stream Rendering   │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ HTTP / JSON REST API
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                        APPLICATION TIER (PYTHON BACKEND)               │
│               Python Standard Library Threaded HTTP Server             │
│                                                                        │
│  ┌──────────────────────┐  ┌─────────────────────┐  ┌────────────────┐ │
│  │     server.py        │  │ JSON Input Validate │  │  database.py   │ │
│  │ REST Routing & CORS  │  │ Python Dict Parsing │  │ Dual-Engine DB │ │
│  └──────────┬───────────┘  └─────────────────────┘  └────────┬───────┘ │
│             │                                                │         │
│             ▼                                                ▼         │
│  ┌──────────────────────┐                          ┌─────────────────┐ │
│  │    ai_service.py     │                          │ PyMySQL / SQLite│ │
│  │ Google GenAI Client  │                          │ Salted SHA-256  │ │
│  │ Multi-Model Fallback │                          │ IST Timestamps  │ │
│  └──────────┬───────────┘                          └────────┬────────┘ │
└─────────────┼───────────────────────────────────────────────┼──────────┘
              ▼                                               ▼
┌───────────────────────────┐                   ┌────────────────────────┐
│     EXTERNAL AI TIER      │                   │     PERSISTENCE TIER   │
│   Google Gemini API       │                   │ MySQL 8.0 / SQLite DB  │
│  (3.5-flash-lite / 3.6)   │                   │ (Users & Chat History) │
│  + Mindful Offline Engine │                   │ (chatbot_local.db)     │
└───────────────────────────┘                   └────────────────────────┘
```

---

## 1.3 Technology Stack & Python Environment

| Domain | Technology / Library | Version | Technical Purpose in Project |
| :--- | :--- | :--- | :--- |
| **Language** | Python | `3.11.9` | Core programming language for business logic, DB, & AI orchestration |
| **Web Server** | `http.server` | Built-in | Zero-dependency concurrent HTTP request handling (`ThreadingHTTPServer`) |
| **Routing / REST** | Standard Library | Built-in | Custom request dispatching, JSON body parsing, & CORS headers |
| **AI Client** | `google-genai` | `2.28.0` | Official Google GenAI Python SDK for generative language processing |
| **Database**  | PyMySQL | `1.2.3` | Pure-Python client connecting to MySQL relational databases |
| **Fallback DB** | SQLite (`sqlite3`)| Built-in | Embedded relational database for zero-configuration local execution |
| **Security**  | `hashlib` & `secrets` | Built-in | Cryptographic SHA-256 salted password hashing |
| **Frontend**  | HTML5 / CSS3 / Vanilla JS | Modern ES6+ | Lightweight, responsive claymorphic tactile interface |
| **Audio Engine**| Web Audio API | Browser Native | Real-time synthesis of haptic feedback clicks and 432Hz focus audio |

---
<!-- PAGE BREAK: PAGE 2 -->
\pagebreak

# PAGE 2: PYTHON BACKEND & REST API ENGINEERING

## 2.1 Why Pure Python Standard Library?
For an academic B.Tech Integrated Python Programming project, using Python's native standard library offers unmatched pedagogical and operational advantages:
1. **Zero External Framework Overhead:** Eliminates fragile third-party dependencies, complex ASGI servers, and version conflicts.
2. **Deep Concurrency via `ThreadingHTTPServer`:** Handles multiple concurrent requests (e.g. streaming static assets while awaiting external Gemini API responses) without blocking the main event thread.
3. **Pure Python Data Flow:** Exposes the fundamental mechanisms of HTTP protocol handling, socket communication, header manipulation, and byte stream serialization.

---

## 2.2 Endpoint Specification & Routing Architecture (`server.py`)

The application exposes 7 RESTful endpoints designed with clean status codes and structured JSON schemas:

| HTTP Method | Route | Purpose | Success Code | Error Handling |
| :--- | :--- | :--- | :---: | :--- |
| `GET` | `/` | Serves main `index.html` frontend | `200 OK` | MIME fallback |
| `GET` | `/api/health` | Health check & database status check | `200 OK` | N/A |
| `POST` | `/api/register` | Creates a new user with hashed password | `200 OK` | `400 Bad Request` if email exists |
| `POST` | `/api/login` | Authenticates email & password pair | `200 OK` | `401 Unauthorized` for bad credentials |
| `POST` | `/api/google-auth`| Seamless Google OAuth / password registration | `200 OK` | Auto-registers or links user profile |
| `POST` | `/api/phone-auth` | Verified Phone OTP sign-in & password link | `200 OK` | Stores mobile entity with fallback |
| `POST` | `/api/chat` | AI query dispatch, response, and DB logging | `200 OK` | Cascade fallback across Gemini models |
| `GET` | `/api/history` | Fetches user chat history in IST order | `200 OK` | Returns empty array if unauthenticated |
| `DELETE`| `/api/history` | Clears conversation records for the session | `200 OK` | Cascade delete on database foreign keys |

---

## 2.3 Server Lifespan & CORS Configuration
To allow seamless client-server interaction and cross-origin resource sharing, CORS headers are configured at the HTTP handler level:

```python
def send_cors_headers(self):
    """Adds CORS headers allowing any frontend origin to connect."""
    self.send_header("Access-Control-Allow-Origin", "*")
    self.send_header("Access-Control-Allow-Methods", "GET, POST, DELETE, OPTIONS")
    self.send_header("Access-Control-Allow-Headers", "Content-Type, Authorization")
```

---
<!-- PAGE BREAK: PAGE 3 -->
\pagebreak

# PAGE 3: DATABASE DESIGN, SECURITY & TIMEZONE ENGINEERING

## 3.1 Dual-Engine Relational Strategy (`database.py`)
To prevent configuration lockouts during university grading or local evaluation where MySQL services might not be active, the backend implements an **Auto-Detecting Dual-Engine Architecture**:
- **Primary:** MySQL 8.0 accessed via `pymysql.cursors.DictCursor`.
- **Secondary (Zero-Config Fallback):** Local SQLite (`chatbot_local.db`).

The application automatically verifies MySQL connectivity on startup. If access is denied or the daemon is absent, it automatically shifts to SQLite without raising unhandled runtime errors.

```
       ┌───────────────────────────────┐
       │     init_db() Called          │
       └──────────────┬────────────────┘
                      ▼
          [Attempt MySQL Connection]
             /                 \
    (Success)                   (Exception)
       /                             \
┌──────────────┐             ┌─────────────────────────┐
│ Active Engine:│             │ Active Engine: SQLite   │
│ MySQL 8.0    │             │ Local file-based storage│
└──────────────┘             └─────────────────────────┘
```

---

## 3.2 Relational Schema Definitions

```sql
-- Users Table
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Chat History Table
CREATE TABLE IF NOT EXISTS chat_history (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NULL,
    role VARCHAR(20) NOT NULL,
    message TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

---

## 3.3 Cryptographic Security & Password Hashing
User passwords are never stored in plain text. A dedicated cryptographic routine using SHA-256 with a unique server salt prevents rainbow-table lookups and credential exposure:

```python
def hash_password(password: str) -> str:
    salt = "mini_project_secret_salt_2026"
    return hashlib.sha256((password + salt).encode("utf-8")).hexdigest()

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return hash_password(plain_password) == hashed_password
```

---

## 3.4 Indian Standard Time (IST) Synchronization
All timestamp records, session greetings, and database logs strictly adhere to Indian Standard Time (UTC+5:30):

```python
from datetime import datetime, timezone, timedelta

IST = timezone(timedelta(hours=5, minutes=30))

def get_current_ist_str() -> str:
    return datetime.now(IST).strftime("%Y-%m-%d %H:%M:%S")
```

---
<!-- PAGE BREAK: PAGE 4 -->
\pagebreak

# PAGE 4: ARTIFICIAL INTELLIGENCE ORCHESTRATION & RESILIENCE

## 4.1 Gemini API Integration & Multi-Model Cascade (`ai_service.py`)
To prevent conversational failure due to model rate-limits or deprecation, the AI pipeline executes an automated fallback cascade across Google's high-speed Flash models:

```
[User Message] ──► [gemini-3.5-flash-lite] (Primary, Lowest Latency)
                          │ (Failover on 429 / 503)
                          ▼
                   [gemini-3.6-flash]      (Secondary)
                          │ (Failover)
                          ▼
                   [gemini-3.7-flash]      (Tertiary)
                          │ (Failover)
                          ▼
                   [Mindful Local Engine]  (Offline / No API Key Fallback)
```

---

## 4.2 System Prompt & Guardrails
A strict prompt contract guarantees succinct, focused, and helpful responses without robotic boilerplate:

```python
system_instruction = (
    f"You are Aether, a smart, direct, and helpful AI companion. "
    f"The user's name is {display_name}.\n\n"
    f"Strict response guidelines:\n"
    f"1. Be crisp, concise, and straight to the point.\n"
    f"2. NEVER mention phrases like 'as an AI' or 'as of my knowledge cutoff'.\n"
    f"3. For direct questions, provide the answer in 1-2 sentences.\n"
    f"4. For recommendations or lists, provide short, clear bullet points.\n"
    f"5. Always finish your thoughts completely."
)
```

---
<!-- PAGE BREAK: PAGE 5 -->
\pagebreak

# PAGE 5: FRONTEND DESIGN & TACTILE AUDIO ARCHITECTURE

## 5.1 Claymorphic UI Design System (`style.css`)
The user interface is built on tactile claymorphism principles:
1. **Raised Neumorphic Cards:** Multiple layered shadows (`10px 10px 20px #a4b5c4, -10px -10px 20px #e6f1fa`) simulate soft, physical clay surfaces.
2. **Inset Debossed Controls:** Input fields use negative inner shadows (`inset 4px 4px 8px #9fadba`) to convey tactile debossing.
3. **Animated Clay Avatar:** Rendered with CSS gradients and SVGs, complete with headphone arcs, pads, smiling facial features, and live online indicator pips.

---

## 5.2 Browser Web Audio Engine (`app.js`)
Rather than relying on heavy pre-recorded MP3 audio files, the frontend synthesizes audio in real-time via the browser's native **Web Audio API**:
- **Tactile Pops:** Generated using triangle oscillator sweeps (320Hz to 60Hz) paired with lowpass filters.
- **Harmonic Chimes:** Dual detuned sine wave oscillators (432Hz fundamental + 648.8Hz harmonic fifth) producing a resonant Tibetan singing bowl sound.
- **432Hz Focus Soundscape:** Binaural beat frequency synthesizer combining a 432Hz carrier and a 438Hz theta wave oscillator for deep study concentration.

---

## 5.3 Academic Outcomes & Key Python Learnings

Through the development of this project, several core concepts of Computer Science and Python Programming were synthesized:

1. **Native Python Web Architecture:** Mastered low-level HTTP socket handling, request dispatching, header negotiation, and concurrent client connections with `ThreadingHTTPServer`.
2. **Pure Frontend Engineering:** Designed and implemented a responsive, component-driven client using pure HTML5, CSS3, and modern JavaScript without relying on heavyweight NPM node frameworks.
3. **Relational Database Interactivity:** Implemented parameterized SQL queries using PyMySQL and SQLite to eliminate SQL Injection vectors while ensuring dual-database portability.
4. **Generative AI Systems:** Orchestrated real-time API integrations with Google's modern Gemini SDK, implementing cascading fallbacks and prompt engineering.
5. **Security Best Practices:** Engineered salted SHA-256 password hashing and secure environment variable separation.

---

## 5.4 Conclusion
The **Aether Space AI Chatbot** project successfully fulfills all objectives set forth for the Integrated Python Programming (IPP) curriculum. It provides an elegant, fast, and secure AI companion platform capable of handling real-time multi-modal authentication, persistent session logging in Indian Standard Time, tactile soundscapes, and crisp AI conversational delivery—all achieved with pure Python, HTML, CSS, and JavaScript.

---
**Report Approved by:**  
Department of Computer Science & Engineering  
Academic Session 2026–2027
