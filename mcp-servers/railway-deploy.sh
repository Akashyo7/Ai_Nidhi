#!/bin/bash

# Railway.app Deployment Script for ANIDHI MCP Servers
# This script deploys multiple MCP servers to Railway.app

set -e

echo "🚀 Starting Railway.app deployment for ANIDHI MCP Servers..."

# Check if Railway CLI is installed
if ! command -v railway &> /dev/null; then
    echo "❌ Railway CLI not found. Please install it first:"
    echo "npm install -g @railway/cli"
    exit 1
fi

# Check if user is logged in
if ! railway whoami &> /dev/null; then
    echo "🔐 Please login to Railway first:"
    echo "railway login"
    exit 1
fi

# Function to deploy a single MCP server
deploy_mcp_server() {
    local server_type=$1
    local port=$2
    local service_name="anidhi-mcp-${server_type}"
    
    echo "📦 Deploying ${server_type} MCP server..."
    
    # Create new Railway service
    railway service create ${service_name}
    
    # Set environment variables
    railway variables set MCP_SERVER_TYPE=${server_type}
    railway variables set PORT=${port}
    railway variables set NODE_ENV=production
    railway variables set LOG_LEVEL=info
    
    # Set secrets (these should be set manually or via Railway dashboard)
    echo "⚠️  Please set the following secrets in Railway dashboard:"
    echo "   - MCP_API_KEY"
    echo "   - JWT_SECRET"
    if [ "$server_type" = "github" ]; then
        echo "   - GITHUB_TOKEN"
    fi
    
    # Deploy the service
    railway up --service ${service_name}
    
    # Get the deployment URL
    local url=$(railway domain --service ${service_name})
    echo "✅ ${server_type} MCP server deployed to: ${url}"
    
    # Test health endpoint
    echo "🔍 Testing health endpoint..."
    sleep 30  # Wait for deployment to be ready
    if curl -f "${url}/health" > /dev/null 2>&1; then
        echo "✅ Health check passed for ${server_type}"
    else
        echo "⚠️  Health check failed for ${server_type} - please check logs"
    fi
    
    echo ""
}

# Deploy Web Search MCP Server
deploy_mcp_server "web-search" "3001"

# Deploy GitHub MCP Server (when implemented)
# deploy_mcp_server "github" "3001"

# Deploy Filesystem MCP Server (when implemented)
# deploy_mcp_server "filesystem" "3001"

echo "🎉 All MCP servers deployed successfully!"
echo ""
echo "📋 Next steps:"
echo "1. Set environment variables in Railway dashboard"
echo "2. Configure custom domains if needed"
echo "3. Set up monitoring and alerts"
echo "4. Update Huginn configuration with new URLs"
echo ""
echo "🔗 Railway Dashboard: https://railway.app/dashboard"