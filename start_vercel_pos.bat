@echo off
color 0b
echo ========================================================
echo        Rowanco POS - Vercel Kiosk Mode Launcher
echo ========================================================
echo.
echo Starting the online Vercel system in true silent printing mode...
echo (Press Alt+F4 to close the system when you are done)
echo.
start "" "C:\Program Files\Google\Chrome\Application\chrome.exe" --user-data-dir="C:\Chrome_POS" --kiosk --kiosk-printing https://rowanco.vercel.app/cashier
exit
