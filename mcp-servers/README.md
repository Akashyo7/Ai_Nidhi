# ANIDHI MCP HTTP Servers

This directory contains HTTP transport implementations of Model Context Protocol (MCP) servers for the ANIDHI Personal Branding Platform.

## Overview

These servers convert the original STDIO-based MCP servers to HTTP transport, enabling cloud deployment and integration with the Huginn data ingestion layer.

## Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Huginn        │    │  HTTP MCP       │    │  Original MCP   │
│   Agents        │◄──►│  Servers        │◄──►│  Logic          │
│                 │    │                 │    │                 │
│  - Post Agent   │    │  - Web Search   │    │  - Tools        │
│  - JS Agent     │    │  - GitHub       │    │  - Resources    │
│  - Webhook      │    │  - Filesystem   │    │  - Prompts      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## Available Servers

### 1. Web Search MCP Server
- **Port**: 3001
- **Tools**: `web_search`, `fetch_url`, `rss_feed`
- **Resources**: Current trends, latest news
- **Prompts**: Search analysis

### 2. GitHub MCP Server (Coming Soon)
- **Port**: 3002
- **Tools**: Repository analysis, contribution tracking
- **Resources**: Repository data, commit history
- **Prompts**: Code analysis

### 3. Filesystem MCP Server (Coming Soon)
- **Port**: 3003
- **Tools**: File operations, content management
- **Resources**: File system access
- **Prompts**: File analysis

## Quick Start

### Local Development

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Set Up Environment**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Start Development Server**
   ```bash
   npm run dev
   ```

4. **Test Health Check**
   ```bash
   curl http://localhost:3001/health
   ```

### Docker Deployment

1. **Build and Run Single Server**
   ```bash
   docker build -t anidhi-mcp-server .
   docker run -p 3001:3001 --env-file .env anidhi-mcp-server
   ```

2. **Run All Servers with Docker Compose**
   ```bash
   docker-compose up -d
   ```

3. **Check Server Status**
   ```bash
   docker-compose ps
   docker-compose logs web-search-mcp
   ```

## API Endpoints

### Health Check
```bash
GET /health
```
Response:
```json
{
  "status": "healthy",
  "server": "web-search-mcp-server",
  "version": "1.0.0",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "uptime": 123.45
}
```

### Server Info
```bash
GET /info
```
Response:
```json
{
  "name": "web-search-mcp-server",
  "version": "1.0.0",
  "capabilities": { ... },
  "tools": [ ... ],
  "resources": [ ... ],
  "prompts": [ ... ]
}
```

### MCP Protocol Endpoint
```bash
POST /mcp
Content-Type: application/json
X-API-Key: your-api-key

{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "tools/list",
  "params": {}
}
```

## Authentication

All MCP endpoints require authentication via API key:

```bash
curl -H "X-API-Key: your-api-key" \
     -H "Content-Type: application/json" \
     -d '{"jsonrpc":"2.0","id":1,"method":"tools/list"}' \
     http://localhost:3001/mcp
```

## Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `MCP_SERVER_TYPE` | Type of server to run | Yes | `web-search` |
| `PORT` | Server port | No | `3001` |
| `MCP_API_KEY` | API key for authentication | Yes | - |
| `JWT_SECRET` | JWT secret for token auth | Yes | - |
| `LOG_LEVEL` | Logging level | No | `info` |
| `NODE_ENV` | Environment | No | `production` |
| `CORS_ORIGIN` | CORS origin | No | `*` |

## MCP Protocol Support

### Supported Methods
- `initialize` - Initialize MCP session
- `tools/list` - List available tools
- `tools/call` - Execute a tool
- `resources/list` - List available resources
- `resources/read` - Read a resource
- `prompts/list` - List available prompts
- `prompts/get` - Get a prompt

### Transport Features
- ✅ HTTP POST for requests
- ✅ Server-Sent Events (SSE) for streaming
- ✅ Authentication and authorization
- ✅ Rate limiting and security
- ✅ Health checks and monitoring
- ✅ Error handling and logging

## Integration with Huginn

### Post Agent Configuration
```json
{
  "name": "MCP Web Search",
  "type": "Agents::PostAgent",
  "options": {
    "post_url": "http://localhost:3001/mcp",
    "method": "post",
    "content_type": "json",
    "headers": {
      "X-API-Key": "{{ credential.mcp_api_key }}"
    },
    "payload": {
      "jsonrpc": "2.0",
      "id": "{{ id }}",
      "method": "tools/call",
      "params": {
        "name": "web_search",
        "arguments": {
          "query": "{{ query }}",
          "max_results": 10
        }
      }
    },
    "emit_events": true
  }
}
```

## Cloud Deployment

### Railway.app
1. Connect GitHub repository
2. Set environment variables
3. Deploy automatically

### Render.com
1. Create new web service
2. Connect repository
3. Configure build and start commands
4. Set environment variables

### Heroku
1. Create Heroku app
2. Set buildpack to Node.js
3. Configure environment variables
4. Deploy via Git

## Monitoring and Logging

### Health Checks
- HTTP endpoint: `/health`
- Docker healthcheck included
- Kubernetes readiness/liveness probes supported

### Logging
- Structured JSON logging with Winston
- Log levels: error, warn, info, debug
- Separate error and combined log files
- Console output in development

### Metrics
- Request/response times
- Error rates
- Tool execution statistics
- Resource access patterns

## Development

### Project Structure
```
mcp-servers/
├── src/
│   ├── base/           # Base HTTP MCP server class
│   ├── servers/        # Specific MCP server implementations
│   ├── middleware/     # Express middleware
│   ├── types/          # TypeScript type definitions
│   └── utils/          # Utility functions
├── dist/               # Compiled JavaScript
├── logs/               # Log files
└── tests/              # Test files
```

### Adding New Servers
1. Create new server class extending `HttpMcpServer`
2. Implement abstract methods
3. Add server type to main index.ts
4. Update Docker Compose configuration
5. Add documentation

### Testing
```bash
npm test                # Run all tests
npm run test:watch      # Watch mode
npm run test:coverage   # Coverage report
```

## Troubleshooting

### Common Issues

1. **Server won't start**
   - Check environment variables
   - Verify port availability
   - Check logs for errors

2. **Authentication failures**
   - Verify API key configuration
   - Check request headers
   - Review authentication middleware

3. **Tool execution errors**
   - Check tool parameters
   - Review server logs
   - Verify external API access

### Debug Mode
```bash
LOG_LEVEL=debug npm run dev
```

### Health Check Failures
```bash
# Check server status
curl http://localhost:3001/health

# Check Docker container
docker logs mcp-servers_web-search-mcp_1
```

## Contributing

1. Fork the repository
2. Create feature branch
3. Add tests for new functionality
4. Ensure all tests pass
5. Submit pull request

## License

MIT License - see LICENSE file for details