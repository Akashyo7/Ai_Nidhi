# Design Document

## Overview

ANIDHI is designed as a self-hosted, intelligent personal branding platform that combines multiple AI agents with external integrations to create a comprehensive digital reputation management system. The architecture follows a layered approach with distinct ingestion, processing, and presentation layers that work together to provide personalized branding insights and automation.

## Architecture

### High-Level Architecture: Huginn + MCP Cloud Integration

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                           ANIDHI Personal Branding Platform                      │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  ┌─────────────────┐    ┌──────────────────┐    ┌─────────────────────────────┐ │
│  │   Frontend      │    │     Backend      │    │     Vector Database         │ │
│  │   (React)       │◄──►│   (Node.js)      │◄──►│     (Chroma/Qdrant)        │ │
│  │                 │    │                  │    │                             │ │
│  │  - Dashboard    │    │  - REST APIs     │    │  - Embeddings               │ │
│  │  - Analytics    │    │  - Auth System   │    │  - Semantic Search          │ │
│  │  - Content UI   │    │  - AI Services   │    │  - User Context             │ │
│  └─────────────────┘    └──────────────────┘    └─────────────────────────────┘ │
│                                   ▲                                             │
│                                   │ Webhooks & API Calls                       │
│                                   ▼                                             │
├─────────────────────────────────────────────────────────────────────────────────┤
│                          HUGINN DATA INGESTION LAYER                           │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  ┌─────────────────────────────────────────────────────────────────────────────┐ │
│  │                        Huginn (Cloud Hosted)                               │ │
│  │                                                                             │ │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────────┐   │ │
│  │  │ Website     │  │ RSS Feed    │  │ Social      │  │ Webhook         │   │ │
│  │  │ Agent       │  │ Agent       │  │ Media       │  │ Agent           │   │ │
│  │  │             │  │             │  │ Agent       │  │                 │   │ │
│  │  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────────┘   │ │
│  │                                                                             │ │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────────┐   │ │
│  │  │ Post        │  │ JavaScript  │  │ Shell       │  │ Event           │   │ │
│  │  │ Agent       │  │ Agent       │  │ Command     │  │ Formatting      │   │ │
│  │  │             │  │             │  │ Agent       │  │ Agent           │   │ │
│  │  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────────┘   │ │
│  └─────────────────────────────────────────────────────────────────────────────┘ │
│                                   ▲                                             │
│                                   │ HTTP Requests                               │
│                                   ▼                                             │
├─────────────────────────────────────────────────────────────────────────────────┤
│                         MCP SERVERS (Cloud Hosted)                             │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐   │
│  │ Web Search  │  │ GitHub      │  │ Filesystem  │  │ Custom Analysis     │   │
│  │ MCP Server  │  │ MCP Server  │  │ MCP Server  │  │ MCP Servers         │   │
│  │ (HTTP)      │  │ (HTTP)      │  │ (HTTP)      │  │ (HTTP)              │   │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────────────┘   │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

### Architecture Benefits

**✅ Hybrid Approach Advantages:**
- **Huginn**: Handles web scraping, RSS monitoring, and data ingestion without robots.txt limitations
- **MCP Servers**: Provide standardized AI processing and analysis capabilities  
- **Cloud Deployment**: Everything runs remotely without local dependencies
- **Scalability**: Independent scaling of ingestion and processing layers
- **Cost Effective**: Free tiers available for all components
- **Maintainability**: Clear separation of concerns between data ingestion and processing

### Technology Stack

**Core Automation Platform:**
- **Huginn** (Primary) - Completely free when self-hosted, 12+ years active development, 400+ integrations, no usage limits
- **AWS Kiro** - $19/month Pro tier (1,000 agentic interactions) or free tier (50 interactions monthly)

**Backend Framework:**
- **Node.js with Express** for API endpoints and MCP server integration
- **Huginn Agents** for workflow automation and data ingestion
- **Ruby on Rails** (Huginn's native environment) for custom agent development

**Database & Storage (Student-Friendly Options):**
- **PostgreSQL via Supabase** (free tier) for structured data
- **Firebase** (free tier) as alternative for real-time data
- **GitHub Pages** for static asset hosting
- **Local SQLite** for development and small-scale deployment

**AI & Processing:**
- **OpenAI GPT-4** or **Anthropic Claude** for content generation
- **Huginn's built-in NLP agents** for basic text processing
- **Custom MCP servers** for specialized AI operations

**Frontend (Student Budget Optimized):**
- **React with TypeScript** deployed to **GitHub Pages** (free)
- **Tailwind CSS** for Apple/Anthropic-inspired clean design
- **Vercel** (free tier) for dynamic frontend features
- **Progressive Web App** capabilities for mobile experience

## Components and Interfaces

### 1. Authentication & User Management

**Component:** `AuthService`
```typescript
interface User {
  id: string;
  email: string;
  profile: UserProfile;
  contextBox: string;
  createdAt: Date;
  lastActive: Date;
}

interface UserProfile {
  name: string;
  profession: string;
  goals: string[];
  brandingObjectives: string[];
  socialMediaHandles: SocialMediaProfile[];
}
```

### 2. Ingestion Layer 1 (Internal Awareness)

**Component:** `InternalAwarenessService`
```typescript
interface InternalDataSource {
  type: 'context_box' | 'linkedin' | 'social_media' | 'content_samples' | 'web_search';
  data: any;
  lastUpdated: Date;
  confidence: number;
}

class InternalAwarenessService {
  async ingestContextBox(userId: string, context: string): Promise<void>;
  async ingestLinkedInProfile(userId: string): Promise<void>;
  async ingestContentSamples(userId: string, samples: ContentSample[]): Promise<void>;
  async analyzeWritingStyle(userId: string, content: string[]): Promise<WritingStyle>;
}
```

### 3. Ingestion Layer 2 (External Awareness)

**Component:** `ExternalAwarenessService`
```typescript
interface ExternalIntelligence {
  trends: TrendData[];
  competitors: CompetitorProfile[];
  opportunities: Opportunity[];
  threats: Threat[];
  sentiment: SentimentAnalysis;
  lastUpdated: Date;
}

class ExternalAwarenessService {
  async scanIndustryTrends(industry: string): Promise<TrendData[]>;
  async analyzeCompetitors(userId: string): Promise<CompetitorProfile[]>;
  async detectOpportunities(userContext: UserContext): Promise<Opportunity[]>;
  async monitorSentiment(keywords: string[]): Promise<SentimentAnalysis>;
}
```

### 4. Brand Head Agent

**Component:** `BrandHeadAgent`
```typescript
interface BrandStrategy {
  coreMessage: string;
  targetAudience: string[];
  contentPillars: string[];
  voiceAndTone: VoiceProfile;
  platformStrategy: PlatformStrategy[];
}

class BrandHeadAgent {
  async generateBrandStrategy(userProfile: UserProfile, externalContext: ExternalIntelligence): Promise<BrandStrategy>;
  async makeContentDecision(contentIdea: ContentIdea, brandStrategy: BrandStrategy): Promise<ContentDecision>;
  async evaluateAlignment(content: Content, brandStrategy: BrandStrategy): Promise<AlignmentScore>;
}
```

### 5. Content Generation System

**Component:** `ContentGenerationService`
```typescript
interface ContentIdea {
  topic: string;
  platform: string;
  contentType: 'post' | 'article' | 'video' | 'carousel';
  urgency: 'low' | 'medium' | 'high';
  trendRelevance: number;
}

class ContentBrainstormLayer1 {
  async learnFromInteraction(userId: string, interaction: ContentInteraction): Promise<void>;
  async generatePersonalizedIdeas(userId: string, context: string): Promise<ContentIdea[]>;
}

class ContentBrainstormLayer2 {
  async generateTrendBasedIdeas(userContext: UserContext, externalTrends: TrendData[]): Promise<ContentIdea[]>;
  async suggestContentSeries(userId: string, goals: string[]): Promise<ContentSeries[]>;
}
```

### 6. Project Management System

**Component:** `ProjectManagerAgent`
```typescript
interface Project {
  id: string;
  name: string;
  type: 'opportunity' | 'linkedin_voice' | 'achievement_series' | 'custom';
  goals: string[];
  timeline: ProjectTimeline;
  status: ProjectStatus;
  context: ProjectContext;
}

class ProjectManagerAgent {
  async createProject(userId: string, projectData: CreateProjectRequest): Promise<Project>;
  async updateProjectProgress(projectId: string, progress: ProjectProgress): Promise<void>;
  async generateMonthlyReport(userId: string, month: string): Promise<MonthlyReport>;
  async suggestOpportunityProjects(userId: string, opportunities: Opportunity[]): Promise<Project[]>;
}
```

## Data Models

### User Context Model
```typescript
interface UserContext {
  personalInfo: PersonalInfo;
  professionalInfo: ProfessionalInfo;
  goals: Goal[];
  preferences: UserPreferences;
  writingStyle: WritingStyle;
  brandPersona: BrandPersona;
}

interface WritingStyle {
  tone: string;
  vocabulary: string[];
  sentenceStructure: string;
  preferredFormats: string[];
  topics: string[];
}
```

### Content Model
```typescript
interface Content {
  id: string;
  userId: string;
  platform: string;
  contentType: string;
  title: string;
  body: string;
  tags: string[];
  performance: ContentPerformance;
  brandAlignment: number;
  createdAt: Date;
}
```

### Intelligence Model
```typescript
interface IntelligenceData {
  userId: string;
  type: 'trend' | 'competitor' | 'opportunity' | 'threat';
  data: any;
  relevanceScore: number;
  actionable: boolean;
  expiresAt: Date;
}
```

## Error Handling

### Error Categories
1. **Authentication Errors**: Invalid credentials, expired tokens
2. **Integration Errors**: API failures, rate limiting, service unavailability
3. **Processing Errors**: AI model failures, data parsing errors
4. **Validation Errors**: Invalid input data, missing required fields

### Error Handling Strategy
```typescript
class ErrorHandler {
  static handleIntegrationError(error: IntegrationError): ErrorResponse {
    // Graceful degradation for external service failures
    // Fallback to cached data when possible
    // User-friendly error messages
  }
  
  static handleProcessingError(error: ProcessingError): ErrorResponse {
    // Retry logic for transient failures
    // Alternative processing methods
    // Partial results when possible
  }
}
```

## Testing Strategy

### Unit Testing
- **Component Testing**: Individual service and agent testing
- **Integration Testing**: MCP server integration testing
- **API Testing**: REST endpoint testing with various scenarios

### End-to-End Testing
- **User Journey Testing**: Complete workflows from onboarding to content generation
- **Performance Testing**: Load testing for concurrent users
- **Security Testing**: Authentication and authorization testing

### AI Model Testing
- **Content Quality Testing**: Evaluate generated content against brand guidelines
- **Learning Validation**: Test improvement in recommendations over time
- **Bias Detection**: Monitor for biased or inappropriate content generation

## Recommended MCP Servers

Based on your requirements, here are the essential MCP servers to integrate:

### Essential MCP Servers (Verified for Student Use)

**Core Infrastructure MCP Servers:**
1. **GitHub MCP Server**: `uvx github-mcp-server` - Repository management, deployment automation, contribution tracking
2. **Database MCP**: `uvx sqlite-mcp-server` or `uvx postgres-mcp-server` - Data storage and retrieval operations
3. **File System MCP**: `uvx filesystem-mcp-server` - Document and asset management
4. **Web Search MCP**: `uvx web-search-mcp-server` - Trend monitoring, competitor research, opportunity detection

**Design & Content MCP Servers:**
1. **Figma MCP Server**: UI/UX design integration and automated code generation from designs
2. **Image Generation MCP**: `uvx dalle-mcp-server` - Visual content creation for social media
3. **PDF MCP**: `uvx pdf-mcp-server` - Document processing for reports and presentations

**Social & Communication MCP Servers:**
1. **Notion MCP**: `uvx notion-mcp-server` - Project documentation, BRD/PRD management, knowledge base
2. **LinkedIn MCP**: Custom integration for professional profile analysis and network monitoring
3. **Email MCP**: `uvx email-mcp-server` - Communication tracking and automated outreach

**Custom MCP Development:**
- **Personal Brand MCP**: Custom server for brand consistency analysis
- **Content Performance MCP**: Social media analytics and performance tracking
- **Opportunity Detection MCP**: Automated scanning for relevant professional opportunities

### MCP Integration Strategy
- **Phase 1**: Core infrastructure MCP servers (GitHub, Database, File System)
- **Phase 2**: Content and design MCP servers (Figma, Image Generation, Web Search)
- **Phase 3**: Advanced social and custom MCP servers (LinkedIn, Brand Analysis, Performance Tracking)

## Deployment Architecture

### Student-Optimized Deployment Strategy

**Phase 1: Foundation (Months 1-2) - $0-20/month**
```yaml
# Huginn Self-Hosted Setup
services:
  huginn:
    image: huginn/huginn
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=postgresql://user:pass@db:5432/huginn
      - HUGINN_DATABASE_ADAPTER=postgresql
  
  db:
    image: postgres:13
    volumes:
      - postgres_data:/var/lib/postgresql/data
    environment:
      - POSTGRES_DB=huginn
      - POSTGRES_USER=huginn
      - POSTGRES_PASSWORD=password
```

**Free Hosting Options:**
- **Huginn Backend**: Self-hosted on personal server or DigitalOcean ($200 GitHub Student Pack credit)
- **Frontend**: GitHub Pages (completely free with custom domain)
- **Database**: Supabase free tier (500MB, 50MB file uploads)
- **File Storage**: GitHub repository or Cloudinary free tier

**Phase 2: Core Features (Months 3-4)**
- **API Layer**: Render free tier or Railway free tier
- **MCP Servers**: AWS Kiro free tier (50 interactions/month)
- **Monitoring**: Uptime Robot free tier

**Phase 3: Advanced Features (Months 5-6)**
- **Upgrade Path**: AWS Kiro Pro ($19/month) for full agentic capabilities
- **Scaling Options**: Vercel Pro or Netlify Pro as needed
- **Analytics**: Google Analytics (free) + custom dashboard

### Cost Breakdown
- **Development**: $0 (using free tools and GitHub Student Pack)
- **Hosting**: $0-5/month (self-hosted or free tiers)
- **AI Services**: $0-19/month (AWS Kiro free tier → Pro)
- **Total Monthly**: $0-24/month maximum

### Student Resource Maximization
- **GitHub Student Pack**: $200 DigitalOcean credits + additional services
- **AWS Free Tier**: $300 credit for new accounts
- **Vercel**: Free deployment for frontend
- **Render**: Free tier for backend services
- **Supabase**: Free PostgreSQL database with 500MB storage

This deployment strategy ensures you can build and run ANIDHI with minimal financial investment while maintaining professional-grade functionality and scalability for future growth.

## Implementation Timeline & Phases

### Phase 1: Foundation (Months 1-2)
**Objective**: Establish core infrastructure and basic automation

**Technical Deliverables:**
- Huginn deployment on GitHub Pages or free cloud hosting
- AWS Kiro environment configuration
- Basic MCP server connections (GitHub, Database, File System)
- Simple automation workflows for data ingestion
- User authentication and profile system

**Cost**: $0-$20/month (AWS Kiro Pro optional)

### Phase 2: Core Features (Months 3-4)
**Objective**: Build user-facing features and core integrations

**Technical Deliverables:**
- Clean, minimal frontend (Apple/Anthropic-inspired design)
- Authentication system with user profiles
- GitHub MCP integration for repository management
- Figma MCP for design system integration
- Basic content generation and learning capabilities
- Mobile-responsive progressive web app

**Expected Outcomes:**
- 50% reduction in content creation time through automation
- Basic brand consistency tracking across platforms

### Phase 3: Advanced Features (Months 5-6)
**Objective**: Implement AI enhancement and full automation

**Technical Deliverables:**
- Digital twin persona creation using collected data
- Predictive content suggestions based on trends analysis
- Automated social media scheduling via Huginn agents
- Performance analytics dashboard
- Advanced MCP integrations (LinkedIn, Notion, Custom servers)
- Multi-project coordination system

**Expected Outcomes:**
- 3x increase in relevant opportunity identification
- 75% improvement in brand consistency across platforms
- 100% ownership of personal data and brand assets

## Risk Mitigation & Student Considerations

### Technical Challenges
- **Huginn Learning Curve**: Mitigated through extensive documentation and active community support
- **MCP Integration Complexity**: Focus on official, well-documented servers first
- **AWS Cost Management**: Controlled through free tier monitoring and usage alerts

### Scalability Planning
- **Modular Architecture**: Allows component upgrading without system redesign
- **Cloud Migration Path**: Easy transition to paid services when budget permits
- **Multi-user Expansion**: Architecture supports future monetization opportunities

### Educational Value
- **Full-stack Development Experience**: Hands-on learning with modern technologies
- **API Integration Expertise**: Real-world experience with multiple service integrations
- **Product Management Skills**: Complete documentation and project lifecycle management
- **Portfolio Development**: Comprehensive case study for future opportunities