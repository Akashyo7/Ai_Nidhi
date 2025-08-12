# Migration Guide: Huginn + MCP Cloud Architecture

## Overview

This guide outlines the migration from the original local MCP setup to the new hybrid Huginn + MCP cloud architecture. This migration maintains all original functionality while solving deployment and web access challenges.

## Migration Strategy

### Phase 1: Preparation (Week 1)
1. **Backup Current System**
   - Export all user data and configurations
   - Document current MCP server configurations
   - Create system state snapshot

2. **Set Up Development Environment**
   - Clone existing codebase to new branch `feature/huginn-mcp-integration`
   - Set up local testing environment for new architecture
   - Prepare cloud platform accounts (Railway, Render, etc.)

### Phase 2: MCP Server Migration (Week 2-3)
1. **Convert MCP Servers to HTTP Transport**
   ```bash
   # Example conversion for web-search MCP server
   # From STDIO:
   uvx web-search-mcp-server
   
   # To HTTP:
   # Create HTTP wrapper with Express.js
   # Add authentication middleware
   # Implement health checks
   ```

2. **Deploy MCP Servers to Cloud**
   - Deploy each MCP server as independent microservice
   - Configure environment variables and secrets
   - Set up monitoring and logging
   - Test HTTP endpoints

3. **Update Backend Integration**
   - Modify existing MCP client code to use HTTP transport
   - Add fallback mechanisms for service unavailability
   - Implement caching for improved performance

### Phase 3: Huginn Deployment (Week 3-4)
1. **Deploy Huginn Instance**
   ```yaml
   # docker-compose.yml for Huginn
   version: '3.8'
   services:
     huginn:
       image: huginn/huginn
       ports:
         - "3000:3000"
       environment:
         - DATABASE_URL=postgresql://user:pass@db:5432/huginn
         - HUGINN_DATABASE_ADAPTER=postgresql
         - DOMAIN=your-huginn-domain.com
       depends_on:
         - db
     
     db:
       image: postgres:13
       volumes:
         - postgres_data:/var/lib/postgresql/data
       environment:
         - POSTGRES_DB=huginn
         - POSTGRES_USER=huginn
         - POSTGRES_PASSWORD=secure_password
   
   volumes:
     postgres_data:
   ```

2. **Configure Basic Agents**
   - Set up Website Agent for web scraping
   - Configure RSS Feed Agent for news monitoring
   - Create Post Agent for MCP server communication
   - Set up Webhook Agent for backend integration

### Phase 4: Integration and Testing (Week 4-5)
1. **Create Webhook Endpoints**
   ```typescript
   // backend/src/routes/huginn-webhooks.ts
   import { Router } from 'express';
   import { authenticateHuginnWebhook } from '@/middleware/huginn-auth';
   
   const router = Router();
   
   router.post('/trend-data', authenticateHuginnWebhook, async (req, res) => {
     const trendData = req.body;
     // Process trend data from Huginn
     await processTrendData(trendData);
     res.status(200).json({ status: 'processed' });
   });
   
   export default router;
   ```

2. **Test Data Flow**
   - Verify Huginn → MCP Server communication
   - Test Huginn → Backend webhook integration
   - Validate data processing and storage
   - Check frontend updates and notifications

### Phase 5: Production Deployment (Week 5-6)
1. **Deploy to Production**
   - Deploy all services to production environments
   - Configure production databases and storage
   - Set up SSL certificates and custom domains
   - Configure monitoring and alerting

2. **Data Migration**
   - Migrate existing user data to new system
   - Update user configurations for new architecture
   - Verify data integrity and completeness

3. **Go-Live**
   - Switch DNS to new system
   - Monitor system performance and stability
   - Provide user support and documentation

## Configuration Examples

### Huginn Agent Configurations

#### Website Agent for Competitor Monitoring
```json
{
  "name": "Competitor Analysis Agent",
  "type": "Agents::WebsiteAgent",
  "schedule": "every_6h",
  "options": {
    "url": "https://competitor-website.com/blog",
    "type": "html",
    "mode": "on_change",
    "extract": {
      "title": {"css": "h1", "value": "normalize-space(.)"},
      "content": {"css": ".content", "value": "normalize-space(.)"},
      "date": {"css": ".date", "value": "normalize-space(.)"}
    }
  }
}
```

#### RSS Feed Agent for Industry News
```json
{
  "name": "Industry News Monitor",
  "type": "Agents::RssAgent",
  "schedule": "every_2h",
  "options": {
    "url": "https://industry-news.com/rss",
    "clean": true,
    "expected_update_period_in_days": 1
  }
}
```

#### Post Agent for MCP Server Communication
```json
{
  "name": "MCP Analysis Trigger",
  "type": "Agents::PostAgent",
  "schedule": "never",
  "options": {
    "post_url": "https://your-mcp-server.com/analyze",
    "method": "post",
    "content_type": "json",
    "payload": {
      "data": "{{ data | json }}",
      "user_id": "{{ user_id }}",
      "analysis_type": "trend_analysis"
    },
    "headers": {
      "Authorization": "Bearer {{ credential.mcp_api_key }}"
    },
    "emit_events": true
  }
}
```

### Backend Webhook Handler
```typescript
// Webhook handler for Huginn data
export const handleHuginnWebhook = async (req: Request, res: Response) => {
  try {
    const { agent_name, data, user_id } = req.body;
    
    switch (agent_name) {
      case 'trend_monitor':
        await processTrendData(user_id, data);
        break;
      case 'competitor_analysis':
        await processCompetitorData(user_id, data);
        break;
      case 'sentiment_analysis':
        await processSentimentData(user_id, data);
        break;
      default:
        logger.warn(`Unknown agent: ${agent_name}`);
    }
    
    res.status(200).json({ status: 'processed' });
  } catch (error) {
    logger.error('Webhook processing error:', error);
    res.status(500).json({ error: 'Processing failed' });
  }
};
```

## Rollback Plan

### Emergency Rollback Procedure
1. **Immediate Actions**
   - Switch DNS back to original system
   - Restore original MCP server configurations
   - Verify system functionality

2. **Data Recovery**
   - Restore user data from backup
   - Sync any new data created during migration
   - Validate data integrity

3. **Communication**
   - Notify users of temporary service interruption
   - Provide timeline for resolution
   - Document lessons learned

### Rollback Triggers
- **Performance Degradation**: >5s response times
- **Data Loss**: Any user data corruption or loss
- **Service Unavailability**: >5 minutes downtime
- **Critical Bugs**: System-breaking functionality issues

## Testing Checklist

### Pre-Migration Testing
- [ ] All MCP servers respond correctly via HTTP
- [ ] Huginn agents process data accurately
- [ ] Webhook integration works reliably
- [ ] Frontend displays data correctly
- [ ] User authentication functions properly

### Post-Migration Validation
- [ ] All existing features work as expected
- [ ] New Huginn-powered features function correctly
- [ ] Performance meets or exceeds previous system
- [ ] Data integrity maintained throughout migration
- [ ] Monitoring and alerting systems operational

### Load Testing
- [ ] System handles expected user load
- [ ] MCP servers scale appropriately
- [ ] Huginn processes data without delays
- [ ] Database performance remains stable
- [ ] Frontend remains responsive under load

## Monitoring and Observability

### Key Metrics to Monitor
1. **System Health**
   - MCP server response times and availability
   - Huginn agent execution success rates
   - Database query performance
   - Frontend load times

2. **Data Quality**
   - Data ingestion rates and accuracy
   - Processing error rates
   - Data freshness and completeness
   - User engagement metrics

3. **Business Metrics**
   - User satisfaction scores
   - Feature adoption rates
   - System cost efficiency
   - Performance improvements

### Alerting Configuration
```yaml
# Example alerting rules
alerts:
  - name: MCP Server Down
    condition: http_response_time > 30s OR http_status != 200
    action: immediate_notification
    
  - name: Huginn Agent Failure
    condition: agent_success_rate < 95%
    action: investigate_and_fix
    
  - name: High Error Rate
    condition: error_rate > 5%
    action: escalate_to_team
```

## Success Criteria

### Technical Success
- [ ] 99.9% uptime for all services
- [ ] <2s average response time
- [ ] Zero data loss during migration
- [ ] All original features preserved
- [ ] New features working as designed

### Business Success
- [ ] User satisfaction maintained or improved
- [ ] System costs within budget ($25/month)
- [ ] Improved data ingestion capabilities
- [ ] Enhanced scalability and maintainability
- [ ] Successful deployment to production

## Support and Documentation

### User Documentation
- Updated user guides for new features
- Migration FAQ for common questions
- Video tutorials for new workflows
- API documentation updates

### Developer Documentation
- Architecture decision records
- Deployment and configuration guides
- Troubleshooting and debugging guides
- Code examples and best practices

This migration guide ensures a smooth transition to the new Huginn + MCP cloud architecture while maintaining system reliability and user satisfaction.