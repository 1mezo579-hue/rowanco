@echo off
chcp 65001 >nul
echo ============================================
echo    روانكو للمنظفات - نظام الكاشير
echo    سكربت الإعداد والتشغيل الأول
echo ============================================
echo.

REM Check if Node.js is installed
node -v >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Node.js غير مثبت! يرجى تحميله أولاً.
    pause
    exit /b 1
)

echo [1/4] تثبيت الحزم (قد يستغرق دقائق)...
call npm install --legacy-peer-deps

echo [2/4] إعداد قاعدة البيانات...
call npx prisma generate
call npx prisma db push --accept-data-loss

echo [3/4] تحميل بيانات المنظفات...
call npx tsx prisma/seed.ts

echo [4/4] تشغيل النظام...
echo.
echo ✅ تم الإعداد بنجاح!
echo سيفتح المتصفح تلقائياً بعد قليل...

start "" cmd /c "timeout /t 6 /nobreak >nul && start msedge --app=http://localhost:3000 --window-size=1200,800"
npm run dev
