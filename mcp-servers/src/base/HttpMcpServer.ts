import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { logger } from '../utils/logger';
import { authenticateApiKey } from '../middleware/auth';
import { validateMCPRequest } from '../middleware/validation';
import { 
  MCPRequest, 
  MCPResponse, 
  MCPTool, 
  MCPResource, 
  MCPPrompt,
  MCPServerCapabilities,
  MCPInitializeRequest,
  MCPInitializeResponse
} from '../types/mcp';

export abstract class HttpMcpServer {
  protected app: Express;
  protected port: number;
  protected serverName: string;
  protected serverVersion: string;

  constructor(serverName: string, port: number = 3001, version: string = '1.0.0') {
    this.app = express();
    this.port = port;
    this.serverName = serverName;
    this.serverVersion = version;
    
    this.setupMiddleware();
    this.setupRoutes();
  }

  private setupMiddleware() {
    // Security middleware
    this.app.use(helmet());
    this.app.use(cors({
      origin: process.env.CORS_ORIGIN || '*',
      credentials: true
    }));

    // Rate limiting
    const limiter = rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100, // limit each IP to 100 requests per windowMs
      message: {
        error: 'Too many requests',
        code: -32005
      }
    });
    this.app.use(limiter);

    // Body parsing
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true }));

    // Logging middleware
    this.app.use((req, res, next) => {
      logger.info(`${req.method} ${req.path}`, {
        ip: req.ip,
        userAgent: req.get('User-Agent')
      });
      next();
    });
  }

  private setupRoutes() {
    // Health check endpoint
    this.app.get('/health', (req: Request, res: Response) => {
      res.json({
        status: 'healthy',
        server: this.serverName,
        version: this.serverVersion,
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
      });
    });

    // MCP endpoint - handles both POST and GET
    this.app.post('/mcp', authenticateApiKey, validateMCPRequest, this.handleMcpRequest.bind(this));
    this.app.get('/mcp', authenticateApiKey, this.handleMcpGet.bind(this));

    // Server info endpoint
    this.app.get('/info', (req: Request, res: Response) => {
      res.json({
        name: this.serverName,
        version: this.serverVersion,
        capabilities: this.getCapabilities(),
        tools: this.getTools(),
        resources: this.getResources(),
        prompts: this.getPrompts()
      });
    });

    // Error handling
    this.app.use((err: any, req: Request, res: Response, next: any) => {
      logger.error('Unhandled error', { error: err.message, stack: err.stack });
      res.status(500).json({
        jsonrpc: '2.0',
        id: req.body?.id || null,
        error: {
          code: -32603,
          message: 'Internal error',
          data: process.env.NODE_ENV === 'development' ? err.message : undefined
        }
      });
    });
  }

  private async handleMcpRequest(req: Request, res: Response) {
    const mcpRequest: MCPRequest = req.body;
    
    try {
      logger.info('Processing MCP request', { 
        method: mcpRequest.method, 
        id: mcpRequest.id 
      });

      let response: MCPResponse;

      switch (mcpRequest.method) {
        case 'initialize':
          response = await this.handleInitialize(mcpRequest);
          break;
        case 'tools/list':
          response = await this.handleToolsList(mcpRequest);
          break;
        case 'tools/call':
          response = await this.handleToolsCall(mcpRequest);
          break;
        case 'resources/list':
          response = await this.handleResourcesList(mcpRequest);
          break;
        case 'resources/read':
          response = await this.handleResourcesRead(mcpRequest);
          break;
        case 'prompts/list':
          response = await this.handlePromptsList(mcpRequest);
          break;
        case 'prompts/get':
          response = await this.handlePromptsGet(mcpRequest);
          break;
        default:
          response = {
            jsonrpc: '2.0',
            id: mcpRequest.id,
            error: {
              code: -32601,
              message: 'Method not found',
              data: `Method '${mcpRequest.method}' is not supported`
            }
          };
      }

      res.json(response);
    } catch (error: any) {
      logger.error('Error processing MCP request', { 
        error: error.message, 
        method: mcpRequest.method,
        id: mcpRequest.id 
      });

      const errorResponse: MCPResponse = {
        jsonrpc: '2.0',
        id: mcpRequest.id,
        error: {
          code: -32603,
          message: 'Internal error',
          data: error.message
        }
      };

      res.status(500).json(errorResponse);
    }
  }

  private async handleMcpGet(req: Request, res: Response) {
    // Handle GET requests for SSE streaming (if needed)
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    
    res.write(`data: ${JSON.stringify({
      type: 'connection',
      server: this.serverName,
      timestamp: new Date().toISOString()
    })}\n\n`);

    // Keep connection alive
    const keepAlive = setInterval(() => {
      res.write(`data: ${JSON.stringify({ type: 'ping', timestamp: new Date().toISOString() })}\n\n`);
    }, 30000);

    req.on('close', () => {
      clearInterval(keepAlive);
    });
  }

  // Abstract methods to be implemented by specific MCP servers
  protected abstract getCapabilities(): MCPServerCapabilities;
  protected abstract getTools(): MCPTool[];
  protected abstract getResources(): MCPResource[];
  protected abstract getPrompts(): MCPPrompt[];

  // MCP method handlers
  private async handleInitialize(request: MCPRequest): Promise<MCPResponse> {
    const initRequest = request.params as MCPInitializeRequest;
    
    const response: MCPInitializeResponse = {
      protocolVersion: '2024-11-05',
      capabilities: this.getCapabilities(),
      serverInfo: {
        name: this.serverName,
        version: this.serverVersion
      }
    };

    return {
      jsonrpc: '2.0',
      id: request.id,
      result: response
    };
  }

  private async handleToolsList(request: MCPRequest): Promise<MCPResponse> {
    return {
      jsonrpc: '2.0',
      id: request.id,
      result: {
        tools: this.getTools()
      }
    };
  }

  private async handleResourcesList(request: MCPRequest): Promise<MCPResponse> {
    return {
      jsonrpc: '2.0',
      id: request.id,
      result: {
        resources: this.getResources()
      }
    };
  }

  private async handlePromptsList(request: MCPRequest): Promise<MCPResponse> {
    return {
      jsonrpc: '2.0',
      id: request.id,
      result: {
        prompts: this.getPrompts()
      }
    };
  }

  // Abstract methods for tool/resource/prompt handling
  protected abstract handleToolsCall(request: MCPRequest): Promise<MCPResponse>;
  protected abstract handleResourcesRead(request: MCPRequest): Promise<MCPResponse>;
  protected abstract handlePromptsGet(request: MCPRequest): Promise<MCPResponse>;

  public start(): void {
    this.app.listen(this.port, () => {
      logger.info(`🚀 ${this.serverName} HTTP MCP Server running on port ${this.port}`);
      logger.info(`📊 Health check: http://localhost:${this.port}/health`);
      logger.info(`🔗 MCP endpoint: http://localhost:${this.port}/mcp`);
      logger.info(`ℹ️  Server info: http://localhost:${this.port}/info`);
    });
  }
}