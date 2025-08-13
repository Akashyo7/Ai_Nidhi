# Huginn Deployment Troubleshooting Guide

## Common Deployment Issues on Render.com

### 1. Build Failures

**Issue**: Docker build fails during deployment
**Solutions**:
- Check if the base image `huginn/huginn:latest` is accessible
- Verify Dockerfile syntax
- Check build logs in Render dashboard

### 2. Database Connection Issues

**Issue**: Huginn can't connect to PostgreSQL
**Solutions**:
- Verify `DATABASE_URL` is correctly set
- Ensure PostgreSQL database is created and running
- Check database credentials and hostname
- Format: `postgresql://username:password@hostname:port/database_name`

### 3. Memory Issues (Free Tier)

**Issue**: Service crashes due to memory limits
**Solutions**:
- Render free tier has 512MB RAM limit
- Huginn can be memory-intensive
- Monitor memory usage in Render dashboard
- Consider upgrading to paid tier if needed

### 4. Port Configuration

**Issue**: Service not responding on correct port
**Solutions**:
- Ensure `PORT=10000` is set in environment variables
- Verify Dockerfile exposes port 10000
- Check that Rails server binds to 0.0.0.0

### 5. Health Check Failures

**Issue**: Health checks failing causing restarts
**Solutions**:
- Use root path `/` instead of `/health`
- Increase health check timeout
- Disable health checks temporarily for debugging

### 6. Database Migration Issues

**Issue**: Database migrations fail on startup
**Solutions**:
- Ensure database is empty and accessible
- Check database permissions
- Verify Rails environment is set to production

## Debugging Steps

### 1. Check Build Logs
1. Go to Render dashboard
2. Click on your Huginn service
3. Check "Logs" tab for build errors

### 2. Check Runtime Logs
1. Look for Rails startup messages
2. Check for database connection errors
3. Monitor memory usage

### 3. Test Database Connection
```bash
# Test PostgreSQL connection (if you have psql)
psql "your-database-url-here"
```

### 4. Verify Environment Variables
Ensure these are set correctly:
- `RAILS_ENV=production`
- `PORT=10000`
- `DATABASE_URL=postgresql://...`
- `SECRET_KEY_BASE=...`
- `HUGINN_INVITATION_CODE=...`

## Alternative Deployment Strategies

### Option 1: Use Heroku Instead
- Heroku has better Huginn support
- More documentation available
- Costs $7/month minimum

### Option 2: Use Docker Compose Locally
- Deploy on a VPS with Docker Compose
- More control over resources
- Can use our existing docker-compose.yml

### Option 3: Simplify Huginn Setup
- Start with basic Huginn configuration
- Add features incrementally
- Use SQLite instead of PostgreSQL initially

## Quick Fixes to Try

### Fix 1: Simplified Dockerfile
```dockerfile
FROM huginn/huginn:latest
ENV PORT=10000
EXPOSE 10000
CMD ["bin/rails", "server", "-b", "0.0.0.0", "-p", "10000"]
```

### Fix 2: Disable Health Checks
Remove health check configuration temporarily

### Fix 3: Use SQLite for Testing
Set `HUGINN_DATABASE_ADAPTER=sqlite3` for initial testing

### Fix 4: Increase Memory (Paid Tier)
Upgrade to Render's Starter plan ($7/month) for 512MB → 2GB RAM

## Getting Help

1. **Render Support**: Check Render documentation
2. **Huginn Community**: GitHub issues and discussions
3. **Our Project**: Continue with other tasks while debugging

## Next Steps if Huginn Fails

If Huginn deployment continues to fail, we can:

1. **Skip to Task 7.2**: Create agents configuration files
2. **Move to Task 8**: Work on external awareness system
3. **Use Alternative**: Deploy simple webhook endpoints instead
4. **Local Development**: Run Huginn locally for testing

The project can continue without cloud Huginn deployment initially.