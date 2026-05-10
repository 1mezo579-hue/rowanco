@echo off
color 0a
echo ========================================================
echo        Rowanco POS - Online (Vercel) Launcher
echo ========================================================
echo.
echo Launching Online Cashier Interface in Silent Kiosk Mode...
echo (Press Alt+F4 to close when done)
echo.

:: Try Program Files
if exist "C:\Program Files\Google\Chrome\Application\chrome.exe" (
    start "" "C:\Program Files\Google\Chrome\Application\chrome.exe" --user-data-dir="C:\Chrome_POS" --kiosk --kiosk-printing https://rowanco.vercel.app/cashier
    exit
)

:: Try Program Files (x86)
if exist "C:\Program Files (x86)\Google\Chrome\Application\chrome.exe" (
    start "" "C:\Program Files (x86)\Google\Chrome\Application\chrome.exe" --user-data-dir="C:\Chrome_POS" --kiosk --kiosk-printing https://rowanco.vercel.app/cashier
    exit
)

echo ERROR: Google Chrome was not found on this computer.
echo Please install Google Chrome to use the POS system.
pause
