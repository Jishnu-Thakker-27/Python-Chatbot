@echo off
title Aether Space — AI Chatbot Server
echo ========================================================
echo   Starting Aether Space Chatbot Server
echo   Pure Python + HTML5 + CSS3 + JavaScript
echo   Zero External Web Frameworks (No FastAPI / Node.js)
echo ========================================================
cd /d "%~dp0"
start http://127.0.0.1:8000
python server.py
pause
