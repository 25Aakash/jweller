@echo off
echo Starting Backend Server...
echo.

cd /d "c:\Users\aakas\OneDrive\Desktop\jweller\backend"

echo Installing dependencies (if needed)...
call npm install

echo.
echo Starting server on port 3000...
call npm run dev

pause
