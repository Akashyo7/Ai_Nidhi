#!/bin/bash

# Test deployed MCP servers

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to test a single MCP server
test_mcp_server() {
    local server_url=$1
    local server_name=$2
    local api_key=$3
    
    echo -e "${YELLOW}🔍 Testing ${server_name} at ${server_url}${NC}"
    
    # Test health endpoint
    echo "  Testing health endpoint..."
    if curl -s -f "${server_url}/health" > /dev/null; then
        echo -e "  ${GREEN}✅ Health check passed${NC}"
    else
        echo -e "  ${RED}❌ Health check failed${NC}"
        return 1
    fi
    
    # Test server info endpoint
    echo "  Testing server info endpoint..."
    if curl -s -f "${server_url}/info" > /dev/null; then
        echo -e "  ${GREEN}✅ Server info accessible${NC}"
    else
        echo -e "  ${RED}❌ Server info failed${NC}"
        return 1
    fi
    
    # Test MCP endpoint with authentication
    echo "  Testing MCP endpoint with authentication..."
    local response=$(curl -s -w "%{http_code}" -o /dev/null \
        -X POST "${server_url}/mcp" \
        -H "X-API-Key: ${api_key}" \
        -H "Content-Type: application/json" \
        -d '{
            "jsonrpc": "2.0",
            "id": 1,
            "method": "tools/list",
            "params": {}
        }')
    
    if [ "$response" = "200" ]; then
        echo -e "  ${GREEN}✅ MCP endpoint authenticated successfully${NC}"
    else
        echo -e "  ${RED}❌ MCP endpoint authentication failed (HTTP ${response})${NC}"
        return 1
    fi
    
    # Test actual tool call
    echo "  Testing web search tool..."
    local search_response=$(curl -s \
        -X POST "${server_url}/mcp" \
        -H "X-API-Key: ${api_key}" \
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
    
    if echo "$search_response" | grep -q '"result"'; then
        echo -e "  ${GREEN}✅ Web search tool working${NC}"
    else
        echo -e "  ${RED}❌ Web search tool failed${NC}"
        echo "  Response: $search_response"
        return 1
    fi
    
    echo -e "${GREEN}✅ ${server_name} is working correctly!${NC}"
    echo ""
}

# Main testing function
main() {
    echo "🚀 Testing ANIDHI MCP Server Deployments"
    echo "========================================"
    echo ""
    
    # Check if required parameters are provided
    if [ $# -lt 2 ]; then
        echo "Usage: $0 <server_url> <api_key> [server_name]"
        echo ""
        echo "Examples:"
        echo "  $0 https://anidhi-mcp-web-search.railway.app your-api-key 'Railway Web Search'"
        echo "  $0 https://anidhi-mcp-web-search.onrender.com your-api-key 'Render Web Search'"
        echo "  $0 https://anidhi-mcp-web-search.herokuapp.com your-api-key 'Heroku Web Search'"
        exit 1
    fi
    
    local server_url=$1
    local api_key=$2
    local server_name=${3:-"MCP Server"}
    
    # Remove trailing slash from URL
    server_url=${server_url%/}
    
    # Test the server
    if test_mcp_server "$server_url" "$server_name" "$api_key"; then
        echo -e "${GREEN}🎉 All tests passed! Server is ready for production use.${NC}"
        echo ""
        echo "📋 Next steps:"
        echo "1. Update Huginn Post Agent configuration with this URL"
        echo "2. Set up monitoring and alerts"
        echo "3. Configure custom domain if needed"
        echo "4. Test integration with Huginn workflows"
        exit 0
    else
        echo -e "${RED}❌ Tests failed! Please check server logs and configuration.${NC}"
        exit 1
    fi
}

# Run main function with all arguments
main "$@"