# ANIDHI Deployment Guide

## Overview

This guide covers deploying ANIDHI in various environments, from local development to production.

## Prerequisites

- Node.js 18+ and npm 8+
- Git
- Docker (for Huginn)
- PostgreSQL database
- Redis (optional, for caching)

## Local Development

### 1. Clone and Setup

```bash
git clone <repository-url>
cd anidhi-personal-branding-platform
npm run install:all
```

### 2. Environment Configuration

```bash
# Copy environment templates
cp server/.env.example server/.env
cp client/.env.example client/.env

# Edit the .env files with your configuration
```

### 3. Database Setup

```bash
# Start PostgreSQL and Redis with Docker
docker-compose up -d anidhi-db redis

# Or use your local PostgreSQL installation
```

### 4. Start Development Servers

```bash
# Start both frontend and backend
npm run dev

# Or start individually
npm run client:dev  # http://localhost:5173
npm run server:dev  # http://localhost:3001
```

## Huginn Setup

### Local Development

```bash
# Start Huginn with Docker
docker-compose up huginn

# Access Huginn at http://localhost:3000
# Default login: admin@localhost / password
```

### Configuration

1. Create an account in Huginn
2. Set up API access
3. Configure agents for data ingestion

## Production Deployment

### Student-Friendly Options

#### Option 1: GitHub Pages + Free Tiers

**Frontend (GitHub Pages):**
```bash
# Build and deploy to GitHub Pages
npm run client:build
# Push to gh-pages branch
```

**Backend (Render/Railway):**
```bash
# Deploy to Render or Railway
# Connect your GitHub repository
# Set environment variables
```

#### Option 2: Self-Hosted

**Requirements:**
- VPS with 1GB+ RAM
- Ubuntu 20.04+ or similar
- Domain name (optional)

**Setup:**
```bash
# Install Node.js and Docker
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs docker.io docker-compose

# Clone and setup
git clone <repository-url>
cd anidhi-personal-branding-platform
npm run install:all

# Configure environment
cp server/.env.example server/.env
# Edit .env with production values

# Start services
docker-compose up -d
npm run build
npm start
```

### Environment Variables

#### Server (.env)
```env
NODE_ENV=production
PORT=3001
DATABASE_URL=postgresql://user:pass@host:5432/anidhi
REDIS_URL=redis://host:6379
JWT_SECRET=your-secure-jwt-secret
OPENAI_API_KEY=your-openai-key
HUGINN_URL=https://your-huginn-domain.com
CORS_ORIGIN=https://your-frontend-domain.com
```

#### Client (.env)
```env
VITE_API_URL=https://your-api-domain.com
VITE_APP_NAME=ANIDHI
VITE_ENABLE_ANALYTICS=true
```

## Database Migration

```bash
# Run database migrations (when implemented)
cd server
npm run migrate
```

## SSL/HTTPS Setup

### Using Nginx

```nginx
server {
    listen 80;
    server_name your-domain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl;
    server_name your-domain.com;
    
    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;
    
    location / {
        proxy_pass http://localhost:5173;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
    
    location /api {
        proxy_pass http://localhost:3001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

## Monitoring

### Health Checks

```bash
# Check API health
curl https://your-domain.com/health

# Check Huginn status
curl https://your-huginn-domain.com/health
```

### Logs

```bash
# Server logs
tail -f server/logs/combined.log

# Docker logs
docker-compose logs -f
```

## Backup

### Database Backup

```bash
# PostgreSQL backup
pg_dump $DATABASE_URL > backup.sql

# Restore
psql $DATABASE_URL < backup.sql
```

### File Backup

```bash
# Backup user uploads and data
tar -czf anidhi-backup.tar.gz data/ uploads/
```

## Scaling

### Horizontal Scaling

- Use load balancer (nginx, HAProxy)
- Multiple server instances
- Shared database and Redis

### Vertical Scaling

- Increase server resources
- Optimize database queries
- Implement caching strategies

## Troubleshooting

### Common Issues

1. **Port conflicts**: Change ports in .env files
2. **Database connection**: Check DATABASE_URL format
3. **CORS errors**: Verify CORS_ORIGIN setting
4. **Build failures**: Clear node_modules and reinstall

### Debug Mode

```bash
# Enable debug logging
export LOG_LEVEL=debug
npm run server:dev
```

## Cost Optimization

### Free Tier Usage

- **Frontend**: GitHub Pages (free)
- **Backend**: Render/Railway free tier
- **Database**: Supabase free tier (500MB)
- **Monitoring**: Uptime Robot free tier

### Paid Upgrades

- **AWS Kiro Pro**: $19/month for full MCP features
- **Database**: Upgrade when exceeding free limits
- **CDN**: Cloudflare for better performance

Total estimated cost: $0-24/month