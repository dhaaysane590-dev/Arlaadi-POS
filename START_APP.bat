@echo off
echo ====================================================================
echo   PALACE BISTRO & INSTITUTE POS SYSTEM - PHPMYADMIN MYSQL LAUNCHER
echo ====================================================================
echo.
echo [INFO] Make sure XAMPP / WAMP / MySQL service is RUNNING!
echo [INFO] Target Database: palace_bistro_pos (http://localhost/phpmyadmin)
echo.
echo Step 1: Checking dependencies (installing node_modules if missing)...
if not exist node_modules (
    echo Installing required packages (Vite, Express, mysql2, React)...
    call npm install
) else (
    echo Node modules found!
)

echo.
echo Step 2: Starting Express Backend & Local Application Server...
echo App URL: http://localhost:3000
echo phpMyAdmin DB: http://localhost/phpmyadmin
echo.
call npm run dev
pause
