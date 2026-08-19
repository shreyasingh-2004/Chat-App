@echo off
echo Killing processes on port 5000...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :5000') do (
    echo Killing PID %%a
    taskkill /PID %%a /F 2>nul
)
timeout /t 1 /nobreak >nul
echo Starting backend...
npm run dev