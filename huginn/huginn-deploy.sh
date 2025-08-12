#!/bin/bash

# Huginn Deployment Script for Render.com
# Deploy Huginn automation platform for ANIDHI Personal Branding Platform

set -e

echo "🤖 Starting Huginn deployment for ANIDHI Personal Branding Platform..."
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

print_status "Huginn is a powerful automation platform for data ingestion and monitoring"
print_status "We'll deploy it to Render.com's FREE tier with PostgreSQL database"
echo ""

# Check if we're in the right directory
if [ ! -f "render.yaml" ]; then
    print_error "render.yaml not found. Please run this script from the huginn directory."
    exit 1
fi

print_success "Found Huginn deployment configuration"
echo ""

# Generate secure keys
print_status "Generating secure configuration keys..."
SECRET_KEY_BASE=$(openssl rand -hex 64)
INVITATION_CODE=$(openssl rand -hex 16)

print_success "Generated secure keys for Huginn"
echo ""

# Display deployment instructions
echo "🤖 HUGINN DEPLOYMENT INSTRUCTIONS"
echo "=================================="
echo ""
print_status "1. Go to Render Dashboard: https://dashboard.render.com"
print_status "2. Click 'New' → 'Web Service'"
print_status "3. Connect your GitHub repository: https://github.com/Akashyo7/Ai_Nidhi"
print_status "4. Configure the Huginn service:"
echo "   - Name: anidhi-huginn"
echo "   - Branch: main"
echo "   - Root Directory: huginn"
echo "   - Environment: Docker"
echo "   - Plan: Free"
echo "   - Region: Oregon (or closest to you)"
echo ""

print_status "5. Create PostgreSQL Database FIRST:"
echo "   - Go to 'Databases' → 'New PostgreSQL'"
echo "   - Name: anidhi-huginn-db"
echo "   - Database Name: huginn_production"
echo "   - User: huginn"
echo "   - Plan: Free"
echo "   - Wait for database to be ready and copy the DATABASE_URL"
echo ""

print_status "6. Set Environment Variables in Huginn Web Service:"
echo "   RAILS_ENV = production"
echo "   PORT = 10000"
echo "   RAILS_SERVE_STATIC_FILES = true"
echo "   RAILS_LOG_TO_STDOUT = true"
echo "   HUGINN_DATABASE_ADAPTER = postgresql"
echo "   DATABASE_URL = [paste your PostgreSQL DATABASE_URL here]"
echo "   HUGINN_DOMAIN = anidhi-huginn.onrender.com"
echo "   HUGINN_USE_GRAPHICAL_DIAGRAM = true"
echo "   HUGINN_ENABLE_INSECURE_AGENTS = false"
echo "   SECRET_KEY_BASE = ${SECRET_KEY_BASE}"
echo "   HUGINN_INVITATION_CODE = ${INVITATION_CODE}"
echo "   MCP_WEB_SEARCH_URL = https://anidhi-mcp-web-search.onrender.com"
echo "   MCP_API_KEY = [use the same key from MCP server deployment]"
echo ""

print_warning "IMPORTANT: Copy these keys now - they won't be shown again!"
echo ""
echo "SECRET_KEY_BASE: ${SECRET_KEY_BASE}"
echo "HUGINN_INVITATION_CODE: ${INVITATION_CODE}"
echo ""

# Save keys to a secure file (gitignored)
echo "# Generated keys for Huginn Render Deployment" > .env.render
echo "# DO NOT COMMIT THIS FILE TO GIT" >> .env.render
echo "SECRET_KEY_BASE=${SECRET_KEY_BASE}" >> .env.render
echo "HUGINN_INVITATION_CODE=${INVITATION_CODE}" >> .env.render

print_success "Keys saved to .env.render (this file is gitignored)"
echo ""

print_status "7. Health Check Configuration:"
echo "   - Health Check Path: /health"
echo "   - Enable: Yes"
echo ""

print_status "8. Deploy the service"
echo "   - Render will build the Docker container and deploy"
echo "   - First deployment may take 10-15 minutes"
echo "   - Huginn will run database migrations automatically"
echo ""

print_status "9. Test your Huginn deployment:"
echo "   - Your Huginn URL will be: https://anidhi-huginn.onrender.com"
echo "   - Login page: https://anidhi-huginn.onrender.com/users/sign_in"
echo "   - Create account using the invitation code above"
echo ""

print_warning "FREE TIER LIMITATIONS:"
echo "   - Service sleeps after 15 minutes of inactivity"
echo "   - Cold start time: 60-90 seconds when waking up"
echo "   - 512 MB RAM, 0.1 CPU"
echo "   - PostgreSQL: 256 MB, 30-day renewable"
echo "   - Perfect for automation and monitoring!"
echo ""

print_status "10. Initial Huginn Setup:"
echo "   - Create your admin account with invitation code"
echo "   - Configure your first agents (we'll help with this)"
echo "   - Test MCP server integration"
echo "   - Set up web scraping and RSS monitoring"
echo ""

echo "🎉 Ready for Huginn deployment!"
echo ""
print_success "Next steps:"
echo "1. Create PostgreSQL database on Render first"
echo "2. Deploy Huginn web service with database URL"
echo "3. Wait for deployment and database migrations"
echo "4. Create your admin account"
echo "5. Configure agents for personal branding automation"
echo ""
print_status "Render Dashboard: https://dashboard.render.com"
print_status "Huginn Documentation: https://github.com/huginn/huginn/wiki"