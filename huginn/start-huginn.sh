#!/bin/bash

# Huginn Startup Wrapper for Render.com
# Ensures proper port binding to 0.0.0.0:10000

set -e

echo "🤖 Starting Huginn for ANIDHI Personal Branding Platform..."
echo "🔧 Configuring for Render.com deployment..."

# Ensure PORT is set correctly for Render.com
export PORT=${PORT:-10000}
export HUGINN_PORT=${PORT}
export IP=0.0.0.0

echo "📍 Binding to ${IP}:${PORT}"
echo "🗄️ Database adapter: ${HUGINN_DATABASE_ADAPTER}"

# Verify critical environment variables
if [ -z "$DATABASE_URL" ]; then
    echo "⚠️  WARNING: DATABASE_URL is not set!"
    echo "   Make sure to set DATABASE_URL in Render dashboard"
fi

# Run Huginn's standard initialization
echo "🚀 Running Huginn initialization..."
exec /scripts/init