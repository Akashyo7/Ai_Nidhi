# MCP Servers Cloud Deployment Guide

This guide covers deploying ANIDHI MCP servers to various cloud platforms.

## 🎯 **Deployment Options**

### 1. Railway.app (Recommended)
- ✅ **Free tier**: 500 hours/month
- ✅ **Easy deployment**: Git-based deployment
- ✅ **Auto-scaling**: Built-in scaling
- ✅ **Custom domains**: Free SSL certificates

### 2. Render.com (Alternative)
- ✅ **Free tier**: 750 hours/month
- ✅ **Docker support**: Native Docker deployment
- ✅ **Auto-deploy**: GitHub integration
- ✅ **Health checks**: Built-in monitoring

### 3. Heroku (Fallback)
- ✅ **Established platform**: Mature ecosystem
- ✅ **Container support**: Docker deployment
- ✅ **Add-ons**: Rich ecosystem
- ⚠️ **Limited free tier**: 550 hours/month

## 🚀 **Quick Deployment**

### Railway.app Deployment

1. **Install Railway CLI**
   ```bash
   npm install -g @railway/cli
   ```

2. **Login to Railway**
   ```bash
   railway login
   ```

3. **Deploy MCP Servers**
   ```bash
   cd mcp-servers
   ./railway-deploy.sh
   ```

4. **Set Environment Variables**
   - Go to [Railway Dashboard](https://railway.app/dashboard)
   - Set `MCP_API_KEY` and `JWT_SECRET` for each service
   - Set `GITHUB_TOKEN` for GitHub MCP server (when implemented)

### Render.com Deployment

1. **Connect GitHub Repository**
   - Go to [Render Dashboard](https://dashboard.render.com)
   - Click "New" → "Web Service"
   - Connect your GitHub repository

2. **Configure Service**
   - Select `mcp-servers` directory
   - Use `render.yaml` configuration
   - Set environment variables in dashboard

3. **Deploy**
   - Render will automatically deploy from your repository
   - Monitor deployment in dashboard

### Heroku Deployment

1. **Install Heroku CLI**
   ```bash
   # macOS
   brew tap heroku/brew && brew install heroku
   
   # Other platforms: https://devcenter.heroku.com/articles/heroku-cli
   ```

2. **Login to Heroku**
   ```bash
   heroku login
   ```

3. **Deploy MCP Servers**
   ```bash
   cd mcp-servers
   ./heroku-deploy.sh
   ```

## 🔧 **Manual Deployment Steps**

### Railway.app Manual Setup

1. **Create New Project**
   ```bash
   railway new anidhi-mcp-servers
   cd anidhi-mcp-servers
   ```

2. **Add Service**
   ```bash
   railway service create web-search-mcp
   ```

3. **Set Environment Variables**
   ```bash
   railway variables set MCP_SERVER_TYPE=web-search
   railway variables set PORT=3001
   railway variables set NODE_ENV=production
   railway variables set MCP_API_KEY=your-secure-api-key
   railway variables set JWT_SECRET=your-jwt-secret
   ```

4. **Deploy**
   ```bash
   railway up
   ```

### Render.com Manual Setup

1. **Create Web Service**
   - Repository: Your GitHub repo
   - Branch: `main`
   - Root Directory: `mcp-servers`
   - Environment: `Docker`
   - Docker Command: (leave empty, uses Dockerfile)

2. **Environment Variables**
   ```
   MCP_SERVER_TYPE=web-search
   PORT=10000
   NODE_ENV=production
   MCP_API_KEY=your-secure-api-key
   JWT_SECRET=your-jwt-secret
   ```

3. **Health Check**
   - Path: `/health`
   - Enabled: Yes

### Heroku Manual Setup

1. **Create App**
   ```bash
   heroku create anidhi-mcp-web-search
   heroku stack:set container -a anidhi-mcp-web-search
   ```

2. **Set Environment Variables**
   ```bash
   heroku config:set MCP_SERVER_TYPE=web-search -a anidhi-mcp-web-search
   heroku config:set NODE_ENV=production -a anidhi-mcp-web-search
   heroku config:set MCP_API_KEY=your-secure-api-key -a anidhi-mcp-web-search
   heroku config:set JWT_SECRET=your-jwt-secret -a anidhi-mcp-web-search
   ```

3. **Deploy**
   ```bash
   git remote add heroku https://git.heroku.com/anidhi-mcp-web-search.git
   git push heroku main
   ```

## 🔐 **Security Configuration**

### Generate Secure API Keys

```bash
# Generate MCP API Key (32 bytes)
openssl rand -hex 32

# Generate JWT Secret (64 bytes)
openssl rand -hex 64
```

### Environment Variables

| Variable | Description | Required | Example |
|----------|-------------|----------|---------|
| `MCP_SERVER_TYPE` | Type of MCP server | Yes | `web-search` |
| `PORT` | Server port | No | `3001` (Railway/Heroku auto-set) |
| `MCP_API_KEY` | API authentication key | Yes | `abc123...` |
| `JWT_SECRET` | JWT signing secret | Yes | `def456...` |
| `NODE_ENV` | Environment | Yes | `production` |
| `LOG_LEVEL` | Logging level | No | `info` |
| `CORS_ORIGIN` | CORS origin | No | `*` |
| `GITHUB_TOKEN` | GitHub API token | GitHub only | `ghp_...` |

### CORS Configuration

For production, set specific CORS origins:
```bash
# Railway
railway variables set CORS_ORIGIN=https://your-huginn-domain.com

# Render
# Set in dashboard: CORS_ORIGIN=https://your-huginn-domain.com

# Heroku
heroku config:set CORS_ORIGIN=https://your-huginn-domain.com -a your-app
```

## 📊 **Monitoring and Health Checks**

### Health Check Endpoints

All deployed servers provide health check endpoints:

```bash
# Check server health
curl https://your-mcp-server.com/health

# Expected response:
{
  "status": "healthy",
  "server": "web-search-mcp-server",
  "version": "1.0.0",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "uptime": 123.45
}
```

### Server Information

```bash
# Get server capabilities
curl https://your-mcp-server.com/info

# Expected response:
{
  "name": "web-search-mcp-server",
  "version": "1.0.0",
  "capabilities": { ... },
  "tools": [ ... ],
  "resources": [ ... ],
  "prompts": [ ... ]
}
```

### Monitoring Setup

#### Railway.app
- Built-in metrics dashboard
- Custom alerts via webhooks
- Log streaming: `railway logs`

#### Render.com
- Built-in monitoring dashboard
- Health check monitoring
- Log streaming in dashboard

#### Heroku
- Heroku Metrics (free tier)
- Log streaming: `heroku logs --tail -a your-app`
- Add-ons for advanced monitoring

## 🔗 **Integration with Huginn**

### Update Huginn Post Agent Configuration

Once deployed, update your Huginn Post Agent with the new URLs:

```json
{
  "name": "MCP Web Search (Cloud)",
  "type": "Agents::PostAgent",
  "options": {
    "post_url": "https://your-mcp-server.railway.app/mcp",
    "method": "post",
    "content_type": "json",
    "headers": {
      "X-API-Key": "{{ credential.mcp_api_key }}",
      "Content-Type": "application/json"
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

### Test Integration

```bash
# Test MCP server from Huginn
curl -X POST https://your-mcp-server.com/mcp \
  -H "X-API-Key: your-api-key" \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "tools/call",
    "params": {
      "name": "web_search",
      "arguments": {
        "query": "artificial intelligence trends",
        "max_results": 5
      }
    }
  }'
```

## 🚨 **Troubleshooting**

### Common Issues

1. **Deployment Fails**
   ```bash
   # Check build logs
   railway logs  # Railway
   # Check Render dashboard for build logs
   heroku logs --tail -a your-app  # Heroku
   ```

2. **Health Check Fails**
   ```bash
   # Test locally first
   docker build -t mcp-test .
   docker run -p 3001:3001 --env-file .env mcp-test
   curl http://localhost:3001/health
   ```

3. **Authentication Errors**
   - Verify `MCP_API_KEY` is set correctly
   - Check API key in request headers
   - Ensure JWT_SECRET is set for token auth

4. **CORS Issues**
   - Set `CORS_ORIGIN` to your Huginn domain
   - Check browser console for CORS errors
   - Verify request headers

### Debug Mode

Enable debug logging:
```bash
# Railway
railway variables set LOG_LEVEL=debug

# Render
# Set LOG_LEVEL=debug in dashboard

# Heroku
heroku config:set LOG_LEVEL=debug -a your-app
```

### Performance Issues

1. **Slow Response Times**
   - Check server logs for errors
   - Monitor resource usage
   - Consider upgrading to paid tier

2. **Rate Limiting**
   - Implement request queuing in Huginn
   - Add delays between requests
   - Consider multiple server instances

## 💰 **Cost Optimization**

### Free Tier Limits

| Platform | Free Hours | Sleep Policy | Custom Domain |
|----------|------------|--------------|---------------|
| Railway | 500h/month | No sleep | Yes (free) |
| Render | 750h/month | Sleeps after 15min | Yes (free) |
| Heroku | 550h/month | Sleeps after 30min | No |

### Optimization Tips

1. **Use Railway for always-on services**
2. **Use Render for development/testing**
3. **Combine multiple MCP servers in one container**
4. **Implement request caching**
5. **Monitor usage to avoid overages**

## 📈 **Scaling Considerations**

### Horizontal Scaling
- Deploy multiple instances
- Use load balancer (nginx, Cloudflare)
- Implement health checks

### Vertical Scaling
- Upgrade to paid tiers for more resources
- Monitor memory and CPU usage
- Optimize Docker image size

### Database Scaling
- Add Redis for caching
- Use managed databases for persistence
- Implement connection pooling

## 🔄 **CI/CD Pipeline**

### GitHub Actions (Recommended)

```yaml
# .github/workflows/deploy-mcp.yml
name: Deploy MCP Servers

on:
  push:
    branches: [main]
    paths: ['mcp-servers/**']

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to Railway
        run: |
          npm install -g @railway/cli
          railway login --token ${{ secrets.RAILWAY_TOKEN }}
          railway up --service web-search-mcp
```

This completes the comprehensive deployment guide for our MCP servers! 🚀