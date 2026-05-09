@echo off
echo Starting Rowanco POS System in Silent Kiosk Mode...
start "" "C:\Program Files\Google\Chrome\Application\chrome.exe" --kiosk --kiosk-printing http://localhost:3000/cashier
exit
