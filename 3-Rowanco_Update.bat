@echo off
color 0e
echo ========================================================
echo        Rowanco POS - System Updater
echo ========================================================
echo.
echo Pulling latest updates from the cloud (Vercel/GitHub)...
echo.

git pull

echo.
echo Update complete!
echo Press any key to close this window.
pause >nul
