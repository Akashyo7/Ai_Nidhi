#!/bin/bash

# Huginn Startup Script for Render.com
# Generates .env file from environment variables and starts Huginn

set -e

echo "🤖 Starting Huginn for ANIDHI Personal Branding Platform..."

# Generate .env file from environment variables
echo "📝 Generating .env file from environment variables..."

cat > /app/.env << EOF
# Generated .env file for Huginn on Render.com
RAILS_ENV=${RAILS_ENV:-production}
PORT=${PORT:-10000}

# Database Configuration
HUGINN_DATABASE_ADAPTER=${HUGINN_DATABASE_ADAPTER:-postgresql}
DATABASE_URL=${DATABASE_URL}

# Security Configuration
SECRET_KEY_BASE=${SECRET_KEY_BASE}
HUGINN_INVITATION_CODE=${HUGINN_INVITATION_CODE}

# Huginn Configuration
HUGINN_DOMAIN=${HUGINN_DOMAIN:-localhost}
HUGINN_USE_GRAPHICAL_DIAGRAM=${HUGINN_USE_GRAPHICAL_DIAGRAM:-true}
HUGINN_ENABLE_INSECURE_AGENTS=${HUGINN_ENABLE_INSECURE_AGENTS:-false}

# MCP Integration
MCP_WEB_SEARCH_URL=${MCP_WEB_SEARCH_URL}
MCP_API_KEY=${MCP_API_KEY}

# Additional Huginn Settings
RAILS_SERVE_STATIC_FILES=${RAILS_SERVE_STATIC_FILES:-true}
RAILS_LOG_TO_STDOUT=${RAILS_LOG_TO_STDOUT:-true}
EOF

echo "✅ .env file generated successfully"

# Verify critical environment variables are set
if [ -z "$DATABASE_URL" ]; then
    echo "❌ ERROR: DATABASE_URL is not set!"
    exit 1
fi

if [ -z "$SECRET_KEY_BASE" ]; then
    echo "❌ ERROR: SECRET_KEY_BASE is not set!"
    exit 1
fi

echo "🚀 Starting Huginn Rails server..."
echo "📍 Binding to 0.0.0.0:${PORT}"

# Start Huginn
exec bin/rails server -b 0.0.0.0 -p ${PORT}