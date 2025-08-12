#!/bin/bash

# Heroku Deployment Script for ANIDHI MCP Servers
# This script deploys multiple MCP servers to Heroku

set -e

echo "🚀 Starting Heroku deployment for ANIDHI MCP Servers..."

# Check if Heroku CLI is installed
if ! command -v heroku &> /dev/null; then
    echo "❌ Heroku CLI not found. Please install it first:"
    echo "https://devcenter.heroku.com/articles/heroku-cli"
    exit 1
fi

# Check if user is logged in
if ! heroku auth:whoami &> /dev/null; then
    echo "🔐 Please login to Heroku first:"
    echo "heroku login"
    exit 1
fi

# Function to deploy a single MCP server
deploy_heroku_mcp_server() {
    local server_type=$1
    local app_name="anidhi-mcp-${server_type}"
    
    echo "📦 Deploying ${server_type} MCP server to Heroku..."
    
    # Create Heroku app
    heroku create ${app_name} --region us
    
    # Set stack to container (for Docker)
    heroku stack:set container -a ${app_name}
    
    # Set environment variables
    heroku config:set MCP_SERVER_TYPE=${server_type} -a ${app_name}
    heroku config:set NODE_ENV=production -a ${app_name}
    heroku config:set LOG_LEVEL=info -a ${app_name}
    
    # Set secrets (generate secure values)
    local api_key=$(openssl rand -hex 32)
    local jwt_secret=$(openssl rand -hex 64)
    
    heroku config:set MCP_API_KEY=${api_key} -a ${app_name}
    heroku config:set JWT_SECRET=${jwt_secret} -a ${app_name}
    
    echo "🔑 Generated API Key for ${server_type}: ${api_key}"
    echo "⚠️  Save this API key - you'll need it for Huginn configuration!"
    
    if [ "$server_type" = "github" ]; then
        echo "⚠️  Please set GITHUB_TOKEN manually:"
        echo "heroku config:set GITHUB_TOKEN=your_token -a ${app_name}"
    fi
    
    # Deploy to Heroku
    git remote add heroku-${server_type} https://git.heroku.com/${app_name}.git
    git push heroku-${server_type} main
    
    # Get the app URL
    local url=$(heroku info -a ${app_name} | grep "Web URL" | awk '{print $3}')
    echo "✅ ${server_type} MCP server deployed to: ${url}"
    
    # Test health endpoint
    echo "🔍 Testing health endpoint..."
    sleep 30  # Wait for deployment to be ready
    if curl -f "${url}health" > /dev/null 2>&1; then
        echo "✅ Health check passed for ${server_type}"
    else
        echo "⚠️  Health check failed for ${server_type} - please check logs"
        echo "Check logs with: heroku logs --tail -a ${app_name}"
    fi
    
    echo ""
}

# Deploy Web Search MCP Server
deploy_heroku_mcp_server "web-search"

# Deploy GitHub MCP Server (when implemented)
# deploy_heroku_mcp_server "github"

# Deploy Filesystem MCP Server (when implemented)
# deploy_heroku_mcp_server "filesystem"

echo "🎉 All MCP servers deployed successfully to Heroku!"
echo ""
echo "📋 Next steps:"
echo "1. Save the generated API keys"
echo "2. Set additional environment variables if needed"
echo "3. Configure custom domains if needed"
echo "4. Set up monitoring and alerts"
echo "5. Update Huginn configuration with new URLs"
echo ""
echo "🔗 Heroku Dashboard: https://dashboard.heroku.com/apps"