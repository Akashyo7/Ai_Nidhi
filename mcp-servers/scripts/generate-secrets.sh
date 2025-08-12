#!/bin/bash

# Generate secure secrets for MCP server deployment

echo "🔐 Generating secure secrets for ANIDHI MCP Servers..."
echo ""

# Generate MCP API Key (32 bytes = 64 hex characters)
MCP_API_KEY=$(openssl rand -hex 32)
echo "MCP_API_KEY=${MCP_API_KEY}"

# Generate JWT Secret (64 bytes = 128 hex characters)
JWT_SECRET=$(openssl rand -hex 64)
echo "JWT_SECRET=${JWT_SECRET}"

echo ""
echo "✅ Secrets generated successfully!"
echo ""
echo "📋 Next steps:"
echo "1. Copy these values to your cloud platform environment variables"
echo "2. Never commit these secrets to version control"
echo "3. Store them securely (password manager, etc.)"
echo ""
echo "🔗 Platform-specific instructions:"
echo "Railway: railway variables set MCP_API_KEY=${MCP_API_KEY}"
echo "Render: Set in dashboard environment variables"
echo "Heroku: heroku config:set MCP_API_KEY=${MCP_API_KEY} -a your-app"