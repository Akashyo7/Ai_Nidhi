# Manual Railway.app Deployment Guide

Since you might not have Railway CLI installed, here's how to deploy manually:

## Step 1: Create Railway Account
1. Go to [Railway.app](https://railway.app)
2. Sign up with GitHub account
3. Connect your GitHub repository

## Step 2: Deploy Web Search MCP Server

1. **Create New Project**
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose your ANIDHI repository
   - Select the `mcp-servers` directory as root

2. **Configure Environment Variables**
   ```
   MCP_SERVER_TYPE=web-search
   NODE_ENV=production
   LOG_LEVEL=info
   ```

3. **Generate and Set Secrets**
   Run this locally to generate secure keys:
   ```bash
   ./mcp-servers/scripts/generate-secrets.sh
   ```
   
   Then set in Railway dashboard:
   - `MCP_API_KEY=<generated-key>`
   - `JWT_SECRET=<generated-secret>`

4. **Deploy**
   - Railway will automatically build and deploy
   - Wait for deployment to complete
   - Note the generated URL (e.g., `https://web-search-mcp-production.up.railway.app`)

## Step 3: Test Deployment

Once deployed, test using:
```bash
./mcp-servers/scripts/test-deployment.sh https://your-railway-url.railway.app your-api-key
```

## Step 4: Configure Custom Domain (Optional)

1. Go to Railway dashboard
2. Click on your service
3. Go to "Settings" → "Domains"
4. Add custom domain if desired

## Alternative: One-Click Deploy

You can also use this Railway deploy button (add to README):

[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/template/your-template-id)

## Next Steps

After successful deployment:
1. Save the Railway URL and API key
2. Test the deployment thoroughly
3. Configure Huginn to use the deployed MCP server
4. Set up monitoring and alerts