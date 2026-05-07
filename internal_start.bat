@echo off
cd /d "%~dp0"
chcp 65001 >nul

:: Start browser in App Mode after delay
start "" cmd /c "timeout /t 8 /nobreak >nul && start msedge --app=http://localhost:3000 --window-size=1300,900"

:: Step 1: Ensure Prisma client is ready
call npx prisma generate >nul 2>&1

:: Step 2: Automatic Data Sync
call npx tsx prisma/seed.ts >nul 2>&1

:: Step 3: Start Next.js server
npm run dev
