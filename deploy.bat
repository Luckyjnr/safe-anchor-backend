@echo off
REM Safe Anchor Backend Deployment Script for Windows
REM This script helps deploy the application to a production server

echo 🚀 Safe Anchor Backend Deployment Script
echo ========================================

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed. Please install Node.js 18+ first.
    pause
    exit /b 1
)

REM Check if npm is installed
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ npm is not installed. Please install npm first.
    pause
    exit /b 1
)

echo ✅ Node.js and npm are installed

REM Install dependencies
echo 📦 Installing dependencies...
npm install --production

if %errorlevel% neq 0 (
    echo ❌ Failed to install dependencies
    pause
    exit /b 1
)

echo ✅ Dependencies installed successfully

REM Check if PM2 is installed
pm2 --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ⚠️  PM2 is not installed. Installing PM2 globally...
    npm install -g pm2
)

REM Start the application
echo 🚀 Starting application...

REM Check if app is already running
pm2 list | findstr "safe-anchor-backend" >nul 2>&1
if %errorlevel% equ 0 (
    echo 🔄 Restarting existing application...
    pm2 restart safe-anchor-backend
) else (
    echo 🆕 Starting new application...
    pm2 start app.js --name safe-anchor-backend
)

REM Save PM2 configuration
pm2 save
pm2 startup

echo ✅ Application started successfully!
echo.
echo 📊 Application Status:
pm2 status safe-anchor-backend
echo.
echo 📝 Useful commands:
echo   - View logs: pm2 logs safe-anchor-backend
echo   - Restart: pm2 restart safe-anchor-backend
echo   - Stop: pm2 stop safe-anchor-backend
echo   - Status: pm2 status
echo.
echo 🌐 Health check: curl http://localhost:5000/api/health
echo 🎉 Deployment completed!
pause
