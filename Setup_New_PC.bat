@echo off
cd /d "%~dp0"
title Market Abnaa Sohag - First Time Setup
color 0B

echo ==========================================
echo    Market Abnaa Sohag - POS System
echo      First Time PC Setup / Install
echo ==========================================
echo.
echo Please ensure Node.js is installed before continuing!
echo Press any key to start the installation process...
pause >nul

echo.
echo [1/4] Installing Required Packages (This might take a few minutes)...
call npm install

echo.
echo [2/4] Connecting to Cloud Database...
call npx prisma db push --accept-data-loss

echo.
echo [3/4] Generating Database Client...
call npx prisma generate

echo.
echo [4/4] Setup Complete! 
echo The system is ready to be used on this computer.
echo.
echo Starting the application...
timeout /t 3 >nul

:: Launch the regular start script
call start_pos.bat
