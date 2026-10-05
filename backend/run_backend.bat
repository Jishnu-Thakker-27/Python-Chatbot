@echo off
echo ========================================================
echo  Starting FastAPI Chatbot Backend on http://127.0.0.1:8000
echo  Interactive API Docs: http://127.0.0.1:8000/docs
echo ========================================================
cd /d "%~dp0"
call .\venv\Scripts\activate
python -m uvicorn main:app --reload --host 127.0.0.1 --port 8000
pause
