@echo off
echo =======================================
echo KHOI DONG HE THONG NEST WEBSITE
echo =======================================

echo 1. Dang bat Backend (Python)...
start cmd /k "python -m uvicorn main:app --reload"

echo 2. Dang bat Frontend (Giao dien)...
start cmd /k "python -m http.server 5500"

echo 3. Dang mo trinh duyet...
timeout /t 2 >nul
start http://localhost:5500/index.html
start http://localhost:5500/admin.html