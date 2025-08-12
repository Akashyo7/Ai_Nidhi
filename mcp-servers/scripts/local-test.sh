#!/bin/bash

# Local MCP Server Testing Script

set -e

echo "🧪 Testing ANIDHI MCP Server Locally..."
echo "======================================"

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js not found. Please install Node.js 18+"
    exit 1
fi

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker not found. Please install Docker"
    exit 1
fi

cd "$(dirname "$0")/.."

echo "📦 Installing dependencies..."
npm install

echo "🔨 Building TypeScript..."
npm run build

echo "🔐 Generating test secrets..."
export MCP_API_KEY=$(openssl rand -hex 32)
export JWT_SECRET=$(openssl rand -hex 64)
export MCP_SERVER_TYPE=web-search
export PORT=3001
export NODE_ENV=development
export LOG_LEVEL=info

echo "Generated API Key: $MCP_API_KEY"
echo ""

echo "🚀 Starting MCP server locally..."
# Start server in background
npm start &
SERVER_PID=$!

# Wait for server to start
echo "⏳ Waiting for server to start..."
sleep 5

# Test health endpoint
echo "🔍 Testing health endpoint..."
if curl -s -f http://localhost:3001/health > /dev/null; then
    echo "✅ Health check passed"
else
    echo "❌ Health check failed"
    kill $SERVER_PID 2>/dev/null || true
    exit 1
fi

# Test server info
echo "🔍 Testing server info endpoint..."
if curl -s -f http://localhost:3001/info > /dev/null; then
    echo "✅ Server info accessible"
else
    echo "❌ Server info failed"
    kill $SERVER_PID 2>/dev/null || true
    exit 1
fi

# Test MCP endpoint
echo "🔍 Testing MCP tools/list endpoint..."
RESPONSE=$(curl -s -w "%{http_code}" -o /tmp/mcp_response.json \
    -X POST http://localhost:3001/mcp \
    -H "X-API-Key: $MCP_API_KEY" \
    -H "Content-Type: application/json" \
    -d '{
        "jsonrpc": "2.0",
        "id": 1,
        "method": "tools/list",
        "params": {}
    }')

if [ "$RESPONSE" = "200" ]; then
    echo "✅ MCP tools/list working"
    echo "Available tools:"
    cat /tmp/mcp_response.json | grep -o '"name":"[^"]*"' | sed 's/"name":"//g' | sed 's/"//g' | sed 's/^/  - /'
else
    echo "❌ MCP tools/list failed (HTTP $RESPONSE)"
    cat /tmp/mcp_response.json
    kill $SERVER_PID 2>/dev/null || true
    exit 1
fi

# Test web search tool
echo "🔍 Testing web search tool..."
SEARCH_RESPONSE=$(curl -s \
    -X POST http://localhost:3001/mcp \
    -H "X-API-Key: $MCP_API_KEY" \
    -H "Content-Type: application/json" \
    -d '{
        "jsonrpc": "2.0",
        "id": 2,
        "method": "tools/call",
        "params": {
            "name": "web_search",
            "arguments": {
                "query": "test search",
                "max_results": 3
            }
        }
    }')

if echo "$SEARCH_RESPONSE" | grep -q '"result"'; then
    echo "✅ Web search tool working"
else
    echo "❌ Web search tool failed"
    echo "Response: $SEARCH_RESPONSE"
    kill $SERVER_PID 2>/dev/null || true
    exit 1
fi

# Test Docker build
echo "🐳 Testing Docker build..."
if docker build -t anidhi-mcp-test . > /dev/null 2>&1; then
    echo "✅ Docker build successful"
    
    # Test Docker container
    echo "🐳 Testing Docker container..."
    docker run -d -p 3002:3001 \
        -e MCP_SERVER_TYPE=web-search \
        -e MCP_API_KEY=$MCP_API_KEY \
        -e JWT_SECRET=$JWT_SECRET \
        --name mcp-docker-test anidhi-mcp-test > /dev/null
    
    sleep 5
    
    if curl -s -f http://localhost:3002/health > /dev/null; then
        echo "✅ Docker container working"
    else
        echo "❌ Docker container failed"
    fi
    
    # Clean up Docker test
    docker stop mcp-docker-test > /dev/null 2>&1 || true
    docker rm mcp-docker-test > /dev/null 2>&1 || true
else
    echo "❌ Docker build failed"
    kill $SERVER_PID 2>/dev/null || true
    exit 1
fi

# Clean up
kill $SERVER_PID 2>/dev/null || true
rm -f /tmp/mcp_response.json

echo ""
echo "🎉 All local tests passed!"
echo ""
echo "📋 Next steps:"
echo "1. Deploy to cloud platform (Railway recommended)"
echo "2. Test cloud deployment"
echo "3. Configure Huginn integration"
echo ""
echo "🚀 Ready for cloud deployment!"