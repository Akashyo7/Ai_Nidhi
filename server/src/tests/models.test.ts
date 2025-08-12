import { describe, it, expect, beforeAll, afterAll, beforeEach } from '@jest/globals';
import { 
  UserModel, 
  UserProfileModel, 
  ContentModel, 
  ProjectModel, 
  IntelligenceDataModel, 
  UserContextModel, 
  BrandStrategyModel 
} from '@/models';
import { db, initializeDatabase } from '@/utils/database';

// Test data
const testUser = {
  email: 'test@example.com',
  password: 'hashedpassword123',
  name: 'Test User'
};

const testContent = {
  userId: '',
  platform: 'linkedin',
  contentType: 'post',
  title: 'Test Post',
  body: 'This is a test post content',
  tags: ['test', 'content'],
  brandAlignment: 0.8,
  performanceScore: 0.6,
  status: 'draft' as const
};

const testProject = {
  userId: '',
  name: 'Test Project',
  type: 'opportunity' as const,
  description: 'A test project for validation',
  goals: ['goal1', 'goal2'],
  status: 'active' as const,
  context: { key: 'value' }
};

const testIntelligence = {
  userId: '',
  type: 'trend' as const,
  data: { trend: 'AI adoption', score: 0.9 },
  relevanceScore: 0.8,
  isActionable: true,
  source: 'test-source'
};

const testUserContext = {
  userId: '',
  contextType: 'writing_style' as const,
  data: { tone: 'professional', style: 'concise' },
  confidence: 0.9,
  lastUpdated: new Date(),
  version: 1
};

const testBrandStrategy = {
  userId: '',
  coreMessage: 'Test brand message',
  targetAudience: ['developers', 'entrepreneurs'],
  contentPillars: ['innovation', 'technology'],
  voiceAndTone: {
    tone: 'professional',
    personality: ['authentic', 'knowledgeable'],
    vocabulary: 'technical',
    writingStyle: 'clear'
  },
  platformStrategy: {
    linkedin: {
      active: true,
      postingFrequency: 'weekly',
      contentTypes: ['thought-leadership'],
      hashtagStrategy: ['#tech'],
      engagementStrategy: 'networking'
    }
  },
  isActive: true
};

describe('Database Models', () => {
  let testUserId: string;

  beforeAll(async () => {
    // Initialize database
    await initializeDatabase();
  });

  afterAll(async () => {
    // Clean up test data
    if (testUserId) {
      await db.query('DELETE FROM users WHERE id = $1', [testUserId]);
    }
    // Close database connection
    await db.end();
  });

  beforeEach(async () => {
    // Create a test user for each test
    const user = await UserModel.create(testUser);
    testUserId = user.id;
    
    // Update test data with user ID
    testContent.userId = testUserId;
    testProject.userId = testUserId;
    testIntelligence.userId = testUserId;
    testUserContext.userId = testUserId;
    testBrandStrategy.userId = testUserId;
  });

  describe('UserModel', () => {
    it('should create a user', async () => {
      const user = await UserModel.findById(testUserId);
      expect(user).toBeTruthy();
      expect(user?.email).toBe(testUser.email);
      expect(user?.name).toBe(testUser.name);
    });

    it('should find user by email', async () => {
      const user = await UserModel.findByEmail(testUser.email);
      expect(user).toBeTruthy();
      expect(user?.id).toBe(testUserId);
    });

    it('should check if email exists', async () => {
      const exists = await UserModel.emailExists(testUser.email);
      expect(exists).toBe(true);
    });
  });

  describe('ContentModel', () => {
    it('should create content', async () => {
      const content = await ContentModel.create(testContent);
      expect(content).toBeTruthy();
      expect(content.userId).toBe(testUserId);
      expect(content.platform).toBe(testContent.platform);
      expect(content.body).toBe(testContent.body);
    });

    it('should find content by user ID', async () => {
      await ContentModel.create(testContent);
      const contents = await ContentModel.findByUserId(testUserId);
      expect(contents.length).toBeGreaterThan(0);
      expect(contents[0].userId).toBe(testUserId);
    });

    it('should update content', async () => {
      const content = await ContentModel.create(testContent);
      const updated = await ContentModel.update(content.id, { 
        title: 'Updated Title',
        status: 'published' 
      });
      expect(updated?.title).toBe('Updated Title');
      expect(updated?.status).toBe('published');
    });
  });

  describe('ProjectModel', () => {
    it('should create project', async () => {
      const project = await ProjectModel.create(testProject);
      expect(project).toBeTruthy();
      expect(project.userId).toBe(testUserId);
      expect(project.name).toBe(testProject.name);
      expect(project.type).toBe(testProject.type);
    });

    it('should find projects by user ID', async () => {
      await ProjectModel.create(testProject);
      const projects = await ProjectModel.findByUserId(testUserId);
      expect(projects.length).toBeGreaterThan(0);
      expect(projects[0].userId).toBe(testUserId);
    });

    it('should find active projects', async () => {
      await ProjectModel.create(testProject);
      const activeProjects = await ProjectModel.findActiveProjects(testUserId);
      expect(activeProjects.length).toBeGreaterThan(0);
      expect(activeProjects[0].status).toBe('active');
    });
  });

  describe('IntelligenceDataModel', () => {
    it('should create intelligence data', async () => {
      const intelligence = await IntelligenceDataModel.create(testIntelligence);
      expect(intelligence).toBeTruthy();
      expect(intelligence.userId).toBe(testUserId);
      expect(intelligence.type).toBe(testIntelligence.type);
      expect(intelligence.isActionable).toBe(true);
    });

    it('should find actionable items', async () => {
      await IntelligenceDataModel.create(testIntelligence);
      const actionableItems = await IntelligenceDataModel.findActionableItems(testUserId);
      expect(actionableItems.length).toBeGreaterThan(0);
      expect(actionableItems[0].isActionable).toBe(true);
    });

    it('should find high relevance items', async () => {
      await IntelligenceDataModel.create(testIntelligence);
      const highRelevanceItems = await IntelligenceDataModel.findHighRelevanceItems(testUserId, 0.7);
      expect(highRelevanceItems.length).toBeGreaterThan(0);
      expect(highRelevanceItems[0].relevanceScore).toBeGreaterThanOrEqual(0.7);
    });
  });

  describe('UserContextModel', () => {
    it('should create user context', async () => {
      const context = await UserContextModel.create(testUserContext);
      expect(context).toBeTruthy();
      expect(context.userId).toBe(testUserId);
      expect(context.contextType).toBe(testUserContext.contextType);
      expect(context.confidence).toBe(testUserContext.confidence);
    });

    it('should find latest context by type', async () => {
      await UserContextModel.create(testUserContext);
      const latestContext = await UserContextModel.findLatestByType(testUserId, 'writing_style');
      expect(latestContext).toBeTruthy();
      expect(latestContext?.contextType).toBe('writing_style');
    });

    it('should update or create context', async () => {
      const newData = { tone: 'casual', style: 'conversational' };
      const context = await UserContextModel.updateOrCreate(testUserId, 'writing_style', newData, 0.8);
      expect(context.data).toEqual(newData);
      expect(context.confidence).toBe(0.8);
    });
  });

  describe('BrandStrategyModel', () => {
    it('should create brand strategy', async () => {
      const strategy = await BrandStrategyModel.create(testBrandStrategy);
      expect(strategy).toBeTruthy();
      expect(strategy.userId).toBe(testUserId);
      expect(strategy.coreMessage).toBe(testBrandStrategy.coreMessage);
      expect(strategy.isActive).toBe(true);
    });

    it('should find active strategy', async () => {
      await BrandStrategyModel.create(testBrandStrategy);
      const activeStrategy = await BrandStrategyModel.findActiveStrategy(testUserId);
      expect(activeStrategy).toBeTruthy();
      expect(activeStrategy?.isActive).toBe(true);
    });

    it('should set active strategy', async () => {
      const strategy1 = await BrandStrategyModel.create(testBrandStrategy);
      const strategy2 = await BrandStrategyModel.create({
        ...testBrandStrategy,
        coreMessage: 'Second strategy',
        isActive: false
      });

      await BrandStrategyModel.setActiveStrategy(testUserId, strategy2.id);
      
      const activeStrategy = await BrandStrategyModel.findActiveStrategy(testUserId);
      expect(activeStrategy?.id).toBe(strategy2.id);
      expect(activeStrategy?.isActive).toBe(true);
    });
  });
});