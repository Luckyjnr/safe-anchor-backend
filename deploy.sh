#!/bin/bash

# Safe Anchor Backend Deployment Script
# This script helps deploy the application to a production server

echo "🚀 Safe Anchor Backend Deployment Script"
echo "========================================"

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

echo "✅ Node.js and npm are installed"

# Install dependencies
echo "📦 Installing dependencies..."
npm install --production

if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies"
    exit 1
fi

echo "✅ Dependencies installed successfully"

# Check if PM2 is installed
if ! command -v pm2 &> /dev/null; then
    echo "⚠️  PM2 is not installed. Installing PM2 globally..."
    npm install -g pm2
fi

# Start the application
echo "🚀 Starting application..."

# Check if app is already running
if pm2 list | grep -q "safe-anchor-backend"; then
    echo "🔄 Restarting existing application..."
    pm2 restart safe-anchor-backend
else
    echo "🆕 Starting new application..."
    pm2 start app.js --name safe-anchor-backend
fi

# Save PM2 configuration
pm2 save
pm2 startup

echo "✅ Application started successfully!"
echo ""
echo "📊 Application Status:"
pm2 status safe-anchor-backend
echo ""
echo "📝 Useful commands:"
echo "  - View logs: pm2 logs safe-anchor-backend"
echo "  - Restart: pm2 restart safe-anchor-backend"
echo "  - Stop: pm2 stop safe-anchor-backend"
echo "  - Status: pm2 status"
echo ""
echo "🌐 Health check: curl http://localhost:5000/api/health"
echo "🎉 Deployment completed!"
