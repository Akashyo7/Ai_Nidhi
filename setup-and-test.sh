#!/bin/bash

echo "🚀 Setting up ANIDHI Authentication System for Testing"
echo "=================================================="

# Install root dependencies
echo "📦 Installing root dependencies..."
npm install

# Install server dependencies
echo "📦 Installing server dependencies..."
cd server
npm install
cd ..

# Install client dependencies
echo "📦 Installing client dependencies..."
cd client
npm install
cd ..

# Create server .env file if it doesn't exist
if [ ! -f server/.env ]; then
    echo "⚙️ Creating server .env file..."
    cp server/.env.example server/.env
    echo "JWT_SECRET=$(openssl rand -base64 32)" >> server/.env
fi

# Create client .env file if it doesn't exist
if [ ! -f client/.env ]; then
    echo "⚙️ Creating client .env file..."
    cp client/.env.example client/.env
fi

echo "✅ Setup complete!"
echo ""
echo "🧪 To test the authentication system:"
echo "1. Start the development servers:"
echo "   npm run dev"
echo ""
echo "2. In another terminal, run the API tests:"
echo "   node test-auth.js"
echo ""
echo "3. Open your browser and visit:"
echo "   http://localhost:5173"
echo ""
echo "4. Try registering a new account and logging in!"