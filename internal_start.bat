@echo off
cd /d "%~dp0"
chcp 65001 >nul

:: Step 1: Start Next.js server immediately (we removed slow seed/generate to fix crashes)
start "Rowanco Server" cmd /c "npm run dev"

:: Step 2: Wait 6 seconds for server to be ready
timeout /t 6 /nobreak >nul

:: Step 3: Launch Google Chrome in Silent Kiosk Printing Mode!
start "" "C:\Program Files\Google\Chrome\Application\chrome.exe" --kiosk --kiosk-printing http://localhost:3000/cashier

:: If Chrome is not in Program Files, try x86
start "" "C:\Program Files (x86)\Google\Chrome\Application\chrome.exe" --kiosk --kiosk-printing http://localhost:3000/cashier

exit

