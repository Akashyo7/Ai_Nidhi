#!/bin/bash

# Render.com Deployment Script for ANIDHI MCP Servers
# This script helps deploy MCP servers to Render.com (FREE TIER)

set -e

echo "🚀 Starting Render.com deployment for ANIDHI MCP Servers..."
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_status "Render.com is the recommended FREE platform for deploying MCP servers"
print_status "Railway and Heroku no longer offer free tiers"
echo ""

# Check if we're in the right directory
if [ ! -f "render.yaml" ]; then
    print_error "render.yaml not found. Please run this script from the mcp-servers directory."
    exit 1
fi

print_success "Found render.yaml configuration file"
echo ""

# Generate secure API keys
print_status "Generating secure API keys..."
MCP_API_KEY=$(openssl rand -hex 32)
JWT_SECRET=$(openssl rand -hex 64)

print_success "Generated secure API keys"
echo ""

# Display deployment instructions
echo "📋 RENDER.COM DEPLOYMENT INSTRUCTIONS"
echo "======================================"
echo ""
print_status "1. Go to Render Dashboard: https://dashboard.render.com"
print_status "2. Click 'New' → 'Web Service'"
print_status "3. Connect your GitHub repository: https://github.com/Akashyo7/Ai_Nidhi"
print_status "4. Configure the service:"
echo "   - Name: anidhi-mcp-web-search"
echo "   - Branch: main"
echo "   - Root Directory: mcp-servers"
echo "   - Environment: Docker"
echo "   - Plan: Free"
echo "   - Region: Oregon (or closest to you)"
echo ""

print_status "5. Set Environment Variables in Render Dashboard:"
echo "   MCP_SERVER_TYPE = web-search"
echo "   PORT = 10000"
echo "   NODE_ENV = production"
echo "   LOG_LEVEL = info"
echo "   MCP_API_KEY = ${MCP_API_KEY}"
echo "   JWT_SECRET = ${JWT_SECRET}"
echo ""

print_warning "IMPORTANT: Copy these keys now - they won't be shown again!"
echo ""
echo "MCP_API_KEY: ${MCP_API_KEY}"
echo "JWT_SECRET: ${JWT_SECRET}"
echo ""

# Save keys to a secure file (gitignored)
echo "# Generated API Keys for Render Deployment" > .env.render
echo "# DO NOT COMMIT THIS FILE TO GIT" >> .env.render
echo "MCP_API_KEY=${MCP_API_KEY}" >> .env.render
echo "JWT_SECRET=${JWT_SECRET}" >> .env.render

print_success "Keys saved to .env.render (this file is gitignored)"
echo ""

print_status "6. Health Check Configuration:"
echo "   - Health Check Path: /health"
echo "   - Enable: Yes"
echo ""

print_status "7. Deploy the service"
echo "   - Render will automatically build and deploy from your GitHub repo"
echo "   - First deployment may take 5-10 minutes"
echo ""

print_status "8. Test your deployment:"
echo "   - Your service URL will be: https://anidhi-mcp-web-search.onrender.com"
echo "   - Health check: https://anidhi-mcp-web-search.onrender.com/health"
echo "   - Server info: https://anidhi-mcp-web-search.onrender.com/info"
echo ""

print_warning "FREE TIER LIMITATIONS:"
echo "   - Service sleeps after 15 minutes of inactivity"
echo "   - Cold start time: 30-60 seconds when waking up"
echo "   - 512 MB RAM, 0.1 CPU"
echo "   - Perfect for development and testing!"
echo ""

print_status "9. Update Huginn Configuration:"
echo "   - Replace Railway URLs with Render URLs in your Huginn agents"
echo "   - Use the new MCP_API_KEY for authentication"
echo ""

echo "🎉 Ready for Render.com deployment!"
echo ""
print_success "Next steps:"
echo "1. Follow the instructions above to deploy on Render.com"
echo "2. Test the deployment with the health check endpoint"
echo "3. Update your Huginn agents with the new URLs"
echo "4. Monitor the deployment in Render dashboard"
echo ""
print_status "Render Dashboard: https://dashboard.render.com"
print_status "Documentation: https://render.com/docs"