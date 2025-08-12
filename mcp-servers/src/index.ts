import dotenv from 'dotenv';
import { WebSearchMcpServer } from './servers/WebSearchMcpServer';
import { logger } from './utils/logger';

// Load environment variables
dotenv.config();

// Validate required environment variables
const requiredEnvVars = ['MCP_API_KEY'];
const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

if (missingEnvVars.length > 0) {
  logger.error('Missing required environment variables', { missing: missingEnvVars });
  process.exit(1);
}

// Get server configuration
const SERVER_TYPE = process.env.MCP_SERVER_TYPE || 'web-search';
const PORT = parseInt(process.env.PORT || '3001');

async function startServer() {
  try {
    let server;

    switch (SERVER_TYPE) {
      case 'web-search':
        server = new WebSearchMcpServer(PORT);
        break;
      // Add other server types here as we implement them
      // case 'github':
      //   server = new GitHubMcpServer(PORT);
      //   break;
      // case 'filesystem':
      //   server = new FilesystemMcpServer(PORT);
      //   break;
      default:
        throw new Error(`Unknown server type: ${SERVER_TYPE}`);
    }

    // Start the server
    server.start();

    // Graceful shutdown
    process.on('SIGTERM', () => {
      logger.info('Received SIGTERM, shutting down gracefully');
      process.exit(0);
    });

    process.on('SIGINT', () => {
      logger.info('Received SIGINT, shutting down gracefully');
      process.exit(0);
    });

  } catch (error: any) {
    logger.error('Failed to start server', { error: error.message });
    process.exit(1);
  }
}

// Start the server
startServer();