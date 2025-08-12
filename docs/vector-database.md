# Vector Database Implementation

## Overview

The ANIDHI platform uses a vector database built on PostgreSQL with the pgvector extension to enable semantic search and content similarity matching. This allows the system to understand and match content based on meaning rather than just keywords.

## Architecture

### Components

1. **VectorDatabaseService** - Core service for vector operations
2. **EmbeddingService** - High-level service for content analysis
3. **OpenAI Embeddings** - Text-to-vector conversion using `text-embedding-3-small`
4. **PostgreSQL + pgvector** - Storage and similarity search

### Data Flow

```mermaid
graph TB
    A[User Content] --> B[EmbeddingService]
    B --> C[OpenAI API]
    C --> D[Vector Embeddings]
    D --> E[VectorDatabaseService]
    E --> F[PostgreSQL + pgvector]
    
    G[Search Query] --> B
    B --> C
    C --> H[Query Embedding]
    H --> E
    E --> I[Similarity Search]
    I --> J[Ranked Results]
```

## Features

### Document Types

The system supports several document types for different use cases:

- **content** - User-generated content (posts, articles)
- **context** - User context and preferences
- **trend** - Industry trends and market data
- **competitor** - Competitor analysis data
- **writing_sample** - Writing style samples
- **project** - Project-related documents

### Core Operations

#### 1. Document Storage
```typescript
const document = await VectorDatabaseService.storeDocument({
  userId: 'user-123',
  content: 'Your content here',
  metadata: { platform: 'linkedin', type: 'post' },
  documentType: 'content'
});
```

#### 2. Semantic Search
```typescript
const results = await VectorDatabaseService.similaritySearch(
  'JavaScript frameworks',
  userId,
  'content',
  10,      // limit
  0.7      // similarity threshold
);
```

#### 3. Writing Style Analysis
```typescript
const analysis = await EmbeddingService.analyzeWritingStyle(userId);
// Returns: tone, vocabulary, sentence structure, etc.
```

#### 4. Content Ideas Generation
```typescript
const ideas = await EmbeddingService.generateContentIdeas(
  userId,
  'React development',
  'linkedin'
);
```

## API Endpoints

### Authentication Required
All endpoints require JWT authentication via the `Authorization: Bearer <token>` header.

### Endpoints

#### Store Writing Sample
```http
POST /api/embeddings/writing-sample
Content-Type: application/json

{
  "content": "Your writing sample here",
  "platform": "linkedin",
  "contentType": "post"
}
```

#### Analyze Writing Style
```http
POST /api/embeddings/analyze-writing-style
```

#### Semantic Search
```http
POST /api/embeddings/search
Content-Type: application/json

{
  "query": "JavaScript frameworks",
  "documentTypes": ["content", "writing_sample"],
  "limit": 10,
  "threshold": 0.7
}
```

#### Generate Content Ideas
```http
POST /api/embeddings/content-ideas
Content-Type: application/json

{
  "topic": "React development",
  "platform": "linkedin"
}
```

#### Get Document Statistics
```http
GET /api/embeddings/stats
```

#### Get User Documents
```http
GET /api/embeddings/documents/content
GET /api/embeddings/documents  # All types
```

## Database Schema

### vector_documents Table

```sql
CREATE TABLE vector_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  document_type VARCHAR(50) NOT NULL,
  embedding vector(1536),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Indexes

```sql
-- User-based queries
CREATE INDEX idx_vector_documents_user_id ON vector_documents(user_id);

-- Document type filtering
CREATE INDEX idx_vector_documents_type ON vector_documents(document_type);

-- Vector similarity search (IVFFlat index)
CREATE INDEX idx_vector_documents_embedding 
ON vector_documents USING ivfflat (embedding vector_cosine_ops) 
WITH (lists = 100);
```

## CLI Tool

The platform includes a CLI tool for vector database management:

### Installation
```bash
cd server
npm run vector-cli -- --help
```

### Commands

#### Initialize Database
```bash
npm run vector-cli init
```

#### View Statistics
```bash
npm run vector-cli stats
npm run vector-cli stats --user-id user-123
```

#### Semantic Search
```bash
npm run vector-cli search --query "JavaScript frameworks" --limit 5
```

#### Add Document
```bash
npm run vector-cli add-document \
  --user-id user-123 \
  --content "Your content here" \
  --type content \
  --metadata '{"platform": "linkedin"}'
```

#### Analyze Writing Style
```bash
npm run vector-cli analyze-writing --user-id user-123
```

#### Export Documents
```bash
npm run vector-cli export --user-id user-123 --output backup.json
```

#### Cleanup
```bash
npm run vector-cli cleanup --dry-run
npm run vector-cli cleanup  # Actually delete
```

## Configuration

### Environment Variables

```env
# Required for embeddings
OPENAI_API_KEY=your-openai-api-key

# Database (must support pgvector)
DATABASE_URL=postgresql://user:pass@localhost:5432/anidhi
```

### OpenAI Settings

- **Model**: `text-embedding-3-small` (1536 dimensions)
- **Cost**: ~$0.00002 per 1K tokens
- **Rate Limits**: 3,000 RPM for Tier 1 accounts

## Performance Considerations

### Embedding Generation
- Batch operations when possible
- Cache embeddings to avoid regeneration
- Monitor OpenAI API usage and costs

### Vector Search
- Use appropriate similarity thresholds (0.7-0.8 typical)
- Limit result sets to reasonable sizes
- Consider user-specific filtering

### Database Optimization
- Regular VACUUM and ANALYZE on vector_documents table
- Monitor index usage and performance
- Consider partitioning for large datasets

### Scaling
- **Small Scale** (< 10K documents): Single PostgreSQL instance
- **Medium Scale** (10K-100K documents): Read replicas, connection pooling
- **Large Scale** (> 100K documents): Consider dedicated vector databases (Pinecone, Weaviate)

## Use Cases

### 1. Content Discovery
Find similar content the user has created before:
```typescript
const similar = await EmbeddingService.findSimilarContent(
  userId,
  "New blog post about React hooks",
  { documentTypes: ['content'], limit: 5 }
);
```

### 2. Writing Style Learning
Analyze and learn from user's writing patterns:
```typescript
// Store samples
await EmbeddingService.storeWritingSample(userId, content, platform, type);

// Analyze style
const style = await EmbeddingService.analyzeWritingStyle(userId);
```

### 3. Trend Matching
Find relevant trends based on user interests:
```typescript
const trends = await EmbeddingService.findRelevantTrends(
  userId,
  "User's professional context and interests"
);
```

### 4. Content Inspiration
Generate content ideas based on semantic similarity:
```typescript
const ideas = await EmbeddingService.generateContentIdeas(
  userId,
  "AI and machine learning",
  "linkedin"
);
```

## Testing

### Unit Tests
```bash
npm test -- vectorDatabase.test.ts
```

### Integration Tests
The test suite includes:
- Document storage and retrieval
- Embedding generation (mocked)
- Similarity search functionality
- Writing style analysis
- Batch operations

### Manual Testing
Use the CLI tool for manual testing:
```bash
# Add test documents
npm run vector-cli add-document --user-id test --content "Test content" --type content

# Search
npm run vector-cli search --query "test" --user-id test
```

## Troubleshooting

### Common Issues

#### 1. pgvector Extension Not Found
```sql
-- Install pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;
```

#### 2. OpenAI API Errors
- Check API key validity
- Monitor rate limits
- Verify account billing status

#### 3. Slow Similarity Search
- Check index usage: `EXPLAIN ANALYZE SELECT ...`
- Adjust IVFFlat lists parameter
- Consider higher similarity thresholds

#### 4. High Embedding Costs
- Implement caching for repeated content
- Use batch operations
- Monitor usage with CLI stats

### Monitoring

#### Database Queries
```sql
-- Check vector document counts
SELECT document_type, COUNT(*) FROM vector_documents GROUP BY document_type;

-- Check index usage
SELECT schemaname, tablename, indexname, idx_scan 
FROM pg_stat_user_indexes 
WHERE tablename = 'vector_documents';
```

#### Application Metrics
- Track embedding API calls
- Monitor search response times
- Log similarity score distributions

## Future Enhancements

### Planned Features
1. **Hybrid Search** - Combine semantic and keyword search
2. **Fine-tuned Embeddings** - Custom embeddings for domain-specific content
3. **Real-time Updates** - Streaming updates for dynamic content
4. **Multi-modal Embeddings** - Support for images and other media
5. **Federated Search** - Search across multiple user accounts (with permissions)

### Scaling Options
1. **Dedicated Vector DB** - Migration to Pinecone, Weaviate, or Qdrant
2. **Distributed Architecture** - Microservices for embedding generation
3. **Edge Deployment** - Local embeddings for privacy-sensitive use cases