@echo off
color 0b
echo ========================================================
echo        Rowanco POS - Local System Launcher
echo ========================================================
echo.
echo Starting the local server... Please wait...
echo.

:: Start Next.js server in the background
start "Rowanco Local Server" cmd /c "npm run dev"

echo Waiting for server to initialize...
timeout /t 6 /nobreak >nul

echo.
echo Launching Cashier Interface in Silent Kiosk Mode...

:: Try Program Files
if exist "C:\Program Files\Google\Chrome\Application\chrome.exe" (
    start "" "C:\Program Files\Google\Chrome\Application\chrome.exe" --user-data-dir="C:\Chrome_POS" --kiosk --kiosk-printing http://localhost:3000/cashier
    exit
)

:: Try Program Files (x86)
if exist "C:\Program Files (x86)\Google\Chrome\Application\chrome.exe" (
    start "" "C:\Program Files (x86)\Google\Chrome\Application\chrome.exe" --user-data-dir="C:\Chrome_POS" --kiosk --kiosk-printing http://localhost:3000/cashier
    exit
)

echo ERROR: Google Chrome was not found on this computer.
echo Please install Google Chrome to use the POS system.
pause
