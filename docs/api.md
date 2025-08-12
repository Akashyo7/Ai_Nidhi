# ANIDHI API Documentation

## Overview

The ANIDHI API provides endpoints for managing personal branding data, content generation, and automation workflows.

## Base URL

```
Development: http://localhost:3001/api
Production: https://your-domain.com/api
```

## Authentication

All API endpoints (except public ones) require authentication using JWT tokens.

```http
Authorization: Bearer <your-jwt-token>
```

## Endpoints

### Health Check

```http
GET /health
```

Returns the server health status.

**Response:**
```json
{
  "status": "OK",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "uptime": 12345,
  "environment": "development"
}
```

### API Info

```http
GET /api
```

Returns basic API information.

**Response:**
```json
{
  "message": "ANIDHI Personal Branding Platform API",
  "version": "1.0.0",
  "status": "active"
}
```

## Error Responses

All errors follow this format:

```json
{
  "success": false,
  "error": {
    "message": "Error description"
  },
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `429` - Too Many Requests
- `500` - Internal Server Error

## Rate Limiting

API requests are limited to 100 requests per 15-minute window per IP address.

## Coming Soon

Additional endpoints will be added as features are implemented:

- `/api/auth` - Authentication endpoints
- `/api/users` - User management
- `/api/content` - Content generation
- `/api/projects` - Project management
- `/api/analytics` - Brand analytics