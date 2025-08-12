# ANIDHI - Personal Branding Platform

A self-hosted, AI-powered personal branding platform that creates an intelligent ecosystem for digital reputation management and content strategy.

## 🚀 Features

- **Internal Awareness**: Learn from your content, LinkedIn profile, and personal context
- **External Intelligence**: Monitor trends, competitors, and opportunities
- **AI-Powered Content Strategy**: Generate personalized content ideas and campaigns
- **Project Management**: Track branding goals and achievements
- **Automation**: Huginn-powered workflows for seamless brand management
- **MCP Integration**: Extensible with Model Context Protocol servers

## 🏗️ Architecture

ANIDHI follows a multi-layered architecture:

- **Frontend**: React + TypeScript + Tailwind CSS (Apple/Anthropic-inspired design)
- **Backend**: Node.js + Express with MCP server integration
- **Automation**: Huginn for workflow automation and data ingestion
- **Database**: PostgreSQL with vector embeddings for semantic search
- **Deployment**: Student-friendly with GitHub Pages + free tier services

## 🛠️ Tech Stack

### Core Technologies
- **Frontend**: React 18, TypeScript, Tailwind CSS, Vite
- **Backend**: Node.js, Express, TypeScript
- **Database**: PostgreSQL (Supabase), Redis (caching)
- **Automation**: Huginn (self-hosted)
- **AI/ML**: OpenAI GPT-4, Anthropic Claude, Custom MCP servers

### Student-Friendly Deployment
- **Hosting**: GitHub Pages (frontend), Render/Railway (backend)
- **Database**: Supabase free tier (500MB)
- **Cost**: $0-24/month maximum

## 📋 Prerequisites

- Node.js 18+ and npm 8+
- Git
- Docker (for local Huginn development and MCP server deployment)
- AWS Kiro account (free tier available)
- Cloud platform account (Railway.app, Render.com, or Heroku) for MCP servers

## 🚀 Quick Start

### 1. Clone and Install
```bash
git clone <repository-url>
cd anidhi-personal-branding-platform
npm run install:all
```

### 2. Environment Setup
```bash
# Copy environment templates
cp server/.env.example server/.env
cp client/.env.example client/.env

# Configure your environment variables
```

### 3. Development
```bash
# Start both frontend and backend
npm run dev

# Or start individually
npm run client:dev  # Frontend on http://localhost:5173
npm run server:dev  # Backend on http://localhost:3001
```

### 4. Huginn Setup (Optional for Phase 1)
```bash
# Using Docker
docker-compose up huginn

# Access Huginn at http://localhost:3000
```

## 📁 Project Structure

```
anidhi-personal-branding-platform/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/         # Page components
│   │   ├── services/      # API services
│   │   ├── hooks/         # Custom React hooks
│   │   ├── types/         # TypeScript type definitions
│   │   └── utils/         # Utility functions
│   ├── public/            # Static assets
│   └── package.json
├── server/                # Node.js backend
│   ├── src/
│   │   ├── controllers/   # Route controllers
│   │   ├── models/        # Database models
│   │   ├── services/      # Business logic
│   │   ├── middleware/    # Express middleware
│   │   ├── routes/        # API routes
│   │   ├── utils/         # Utility functions
│   │   └── types/         # TypeScript type definitions
│   └── package.json
├── huginn/                # Huginn configuration
│   ├── docker-compose.yml
│   └── agents/           # Custom Huginn agents
├── docs/                 # Documentation
├── .kiro/                # Kiro IDE configuration
│   └── specs/            # Project specifications
└── README.md
```

## 🔧 Configuration

### Environment Variables

#### Server (.env)
```env
NODE_ENV=development
PORT=3001
DATABASE_URL=postgresql://username:password@localhost:5432/anidhi
REDIS_URL=redis://localhost:6379
JWT_SECRET=your-jwt-secret
OPENAI_API_KEY=your-openai-key
HUGINN_URL=http://localhost:3000
```

#### Client (.env)
```env
VITE_API_URL=http://localhost:3001
VITE_APP_NAME=ANIDHI
```

## 📖 Development Phases

### Phase 1: Foundation (Months 1-2)
- [x] Project setup and infrastructure
- [ ] Authentication system
- [ ] Basic UI components
- [ ] Database models

### Phase 2: Core Features (Months 3-4)
- [ ] Internal awareness system
- [ ] External intelligence gathering
- [ ] Huginn integration
- [ ] Content generation basics

### Phase 3: Advanced Features (Months 5-6)
- [ ] Brand strategy engine
- [ ] Project management
- [ ] MCP server integrations
- [ ] Learning and automation

## 🧪 Testing

```bash
# Run all tests
npm test

# Run frontend tests
npm run client:test

# Run backend tests
npm run server:test
```

## 🚀 Deployment

### Development
```bash
npm run dev
```

### Production Build
```bash
npm run build
npm start
```

### Docker Deployment
```bash
docker-compose up --build
```

### MCP Servers Cloud Deployment

ANIDHI uses HTTP-based MCP servers deployed to cloud platforms for scalable AI processing:

#### Quick Deploy to Railway.app (Recommended)
```bash
cd mcp-servers
./railway-deploy.sh
```

#### Deploy to Render.com
```bash
cd mcp-servers
# Use render.yaml configuration
# Deploy via Render dashboard
```

#### Deploy to Heroku
```bash
cd mcp-servers
./heroku-deploy.sh
```

#### Test Deployment
```bash
cd mcp-servers
./scripts/test-deployment.sh https://your-mcp-server.com your-api-key
```

For detailed deployment instructions, see [MCP Deployment Guide](mcp-servers/DEPLOYMENT.md).

## 📚 Documentation

- [Requirements Document](.kiro/specs/personal-branding-platform/requirements.md)
- [Design Document](.kiro/specs/personal-branding-platform/design.md)
- [Implementation Plan](.kiro/specs/personal-branding-platform/tasks.md)
- [API Documentation](docs/api.md)
- [Deployment Guide](docs/deployment.md)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Huginn](https://github.com/huginn/huginn) - Free automation platform
- [AWS Kiro](https://kiro.ai) - Agentic IDE and MCP integration
- [Model Context Protocol](https://modelcontextprotocol.io) - Extensible AI integration

## 📞 Support

For support and questions:
- Create an issue in this repository
- Check the [documentation](docs/)
- Review the [FAQ](docs/faq.md)

---

**ANIDHI** - Transforming personal branding through intelligent automation 🚀