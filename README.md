# 🤖 Aether Space AI Chatbot

A full-stack AI Chatbot application designed for tactile mindfulness, focus, and daily guidance.

- **Frontend:** React + TypeScript + Tailwind CSS (Vite)
- **Backend:** Python + FastAPI (REST API)
- **AI Model:** Google Gemini API
- **Database:** MySQL
- **Deployment:** Vercel (Frontend) + Render / Railway (Backend)

---

## 📁 Project Structure

```
Mini Project/
├── backend/                    # Python + FastAPI Backend
│   ├── .env                    # Secrets & credentials (Git-ignored)
│   ├── .env.example            # Example configuration template
│   ├── ai_service.py           # Gemini API integration & fallback logic
│   ├── database.py             # MySQL connection, queries & table creation
│   ├── main.py                 # FastAPI app & REST API routes
│   ├── models.py               # Pydantic data models
│   ├── requirements.txt        # Python dependencies
│   ├── run_backend.bat         # 1-click script to run backend on Windows
│   └── setup_database.sql      # Optional raw SQL setup script
├── src/                        # React Frontend Source Code
│   ├── components/             # UI Components (AuthScreen, ChatbotScreen, etc.)
│   └── utils/                  # Audio engine and utilities
├── package.json                # Frontend dependencies & scripts
├── vite.config.ts              # Vite config with API proxy to FastAPI
├── vercel.json                 # Vercel deployment configuration
└── README.md                   # This documentation
```

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- **Python 3.10+** installed
- **Node.js (v18+)** installed
- **MySQL Server** installed and running locally

---

### 2. Configure Backend (`backend/.env`)

In the `backend/` directory, open or edit `.env`:

```env
# 1. Google Gemini API Key (Get a free key from https://aistudio.google.com/)
GEMINI_API_KEY=your_actual_gemini_api_key

# 2. Local MySQL Database Credentials
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=chatbot_db
```

> **Tip:** If you haven't set up MySQL yet or want to test immediately, the backend includes automatic fallbacks so you can test without crashing!

---

### 3. Run the Backend (Python + FastAPI)

Open a terminal in the project directory:

```bash
# 1. Navigate to backend
cd backend

# 2. Activate virtual environment (Windows)
.\venv\Scripts\activate

# 3. Start the FastAPI server
uvicorn main:app --reload --port 8000
```

*(Or simply double-click `backend/run_backend.bat`)*

- **Backend URL:** `http://127.0.0.1:8000`
- **Interactive API Documentation (Swagger UI):** `http://127.0.0.1:8000/docs`

---

### 4. Run the Frontend (React + Vite)

Open a second terminal in the project root:

```bash
# 1. Install frontend dependencies (if not done)
npm install --legacy-peer-deps

# 2. Start Vite dev server
npm run dev
```

- Open your browser at: `http://localhost:5173`
- The frontend automatically routes `/api/*` requests to your FastAPI backend at `http://127.0.0.1:8000`.

---

## 📡 REST API Endpoints

FastAPI provides automatic interactive documentation at `http://127.0.0.1:8000/docs`.

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/` | Backend health check |
| `POST` | `/api/register` | Register a new user (stores hashed password in MySQL) |
| `POST` | `/api/login` | Authenticate user against MySQL |
| `POST` | `/api/chat` | Send message, call Gemini AI, store conversation in MySQL |
| `GET` | `/api/history?email=...` | Retrieve conversation history from MySQL |
| `DELETE` | `/api/history?email=...` | Clear conversation history from MySQL |

---

## 🗄️ MySQL Database Schema

The backend automatically creates the database and tables upon startup. You can also run `backend/setup_database.sql` directly in MySQL Workbench:

```sql
-- Users Table
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Chat History Table
CREATE TABLE chat_history (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NULL,
    role ENUM('user', 'assistant') NOT NULL,
    message TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

---

## 🌐 Deployment Guide

### A. Deploy Frontend on Vercel
1. Push your repository to GitHub.
2. Sign in to [Vercel](https://vercel.com/) and click **Add New Project**.
3. Import your `Python-Chatbot` repository.
4. Framework Preset: **Vite**.
5. Environment Variables:
   - `VITE_BACKEND_URL`: Set to your deployed backend URL (e.g. `https://your-chatbot-backend.onrender.com`).
6. Click **Deploy**.

### B. Deploy Backend on Render (Free tier)
1. Sign in to [Render](https://render.com/).
2. Click **New +** -> **Web Service**.
3. Connect your GitHub repository.
4. Set:
   - **Root Directory:** `backend`
   - **Environment:** `Python 3`
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `uvicorn main:app --host 0.0.0.0 --port $PORT`
5. In **Environment Variables**, add:
   - `GEMINI_API_KEY`: Your Gemini API key
   - `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`: Your cloud MySQL credentials.

### C. Free Cloud MySQL Hosting
You can use any free MySQL cloud provider:
- [Aiven for MySQL](https://aiven.io/) (Free tier)
- [TiDB Serverless](https://tidb.cloud/) (Free tier, MySQL-compatible)
- [Clever Cloud](https://www.clever-cloud.com/)
Copy the host, port, user, and password provided by the host into your Render environment variables.
