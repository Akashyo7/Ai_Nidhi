import { db } from '@/utils/database';
import { BrandStrategy } from '@/types';

export class BrandStrategyModel {
  static async create(strategyData: Omit<BrandStrategy, 'id' | 'createdAt' | 'updatedAt'>): Promise<BrandStrategy> {
    const query = `
      INSERT INTO brand_strategy (user_id, core_message, target_audience, content_pillars, voice_and_tone, platform_strategy, is_active)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `;
    
    const values = [
      strategyData.userId,
      strategyData.coreMessage || null,
      strategyData.targetAudience,
      strategyData.contentPillars,
      JSON.stringify(strategyData.voiceAndTone),
      JSON.stringify(strategyData.platformStrategy),
      strategyData.isActive
    ];
    
    const result = await db.query(query, values);
    const strategy = result.rows[0];
    
    return {
      id: strategy.id,
      userId: strategy.user_id,
      coreMessage: strategy.core_message,
      targetAudience: strategy.target_audience,
      contentPillars: strategy.content_pillars,
      voiceAndTone: strategy.voice_and_tone,
      platformStrategy: strategy.platform_strategy,
      isActive: strategy.is_active,
      createdAt: strategy.created_at,
      updatedAt: strategy.updated_at,
    };
  }

  static async findByUserId(userId: string): Promise<BrandStrategy[]> {
    const query = `
      SELECT * FROM brand_strategy 
      WHERE user_id = $1 
      ORDER BY is_active DESC, created_at DESC
    `;
    
    const result = await db.query(query, [userId]);
    
    return result.rows.map(strategy => ({
      id: strategy.id,
      userId: strategy.user_id,
      coreMessage: strategy.core_message,
      targetAudience: strategy.target_audience,
      contentPillars: strategy.content_pillars,
      voiceAndTone: strategy.voice_and_tone,
      platformStrategy: strategy.platform_strategy,
      isActive: strategy.is_active,
      createdAt: strategy.created_at,
      updatedAt: strategy.updated_at,
    }));
  }

  static async findById(id: string): Promise<BrandStrategy | null> {
    const query = 'SELECT * FROM brand_strategy WHERE id = $1';
    const result = await db.query(query, [id]);
    
    if (result.rows.length === 0) {
      return null;
    }
    
    const strategy = result.rows[0];
    return {
      id: strategy.id,
      userId: strategy.user_id,
      coreMessage: strategy.core_message,
      targetAudience: strategy.target_audience,
      contentPillars: strategy.content_pillars,
      voiceAndTone: strategy.voice_and_tone,
      platformStrategy: strategy.platform_strategy,
      isActive: strategy.is_active,
      createdAt: strategy.created_at,
      updatedAt: strategy.updated_at,
    };
  }

  static async findActiveStrategy(userId: string): Promise<BrandStrategy | null> {
    const query = `
      SELECT * FROM brand_strategy 
      WHERE user_id = $1 AND is_active = true 
      ORDER BY created_at DESC 
      LIMIT 1
    `;
    
    const result = await db.query(query, [userId]);
    
    if (result.rows.length === 0) {
      return null;
    }
    
    const strategy = result.rows[0];
    return {
      id: strategy.id,
      userId: strategy.user_id,
      coreMessage: strategy.core_message,
      targetAudience: strategy.target_audience,
      contentPillars: strategy.content_pillars,
      voiceAndTone: strategy.voice_and_tone,
      platformStrategy: strategy.platform_strategy,
      isActive: strategy.is_active,
      createdAt: strategy.created_at,
      updatedAt: strategy.updated_at,
    };
  }

  static async update(id: string, updates: Partial<BrandStrategy>): Promise<BrandStrategy | null> {
    const fields = [];
    const values = [];
    let paramCount = 1;

    if (updates.coreMessage !== undefined) {
      fields.push(`core_message = $${paramCount++}`);
      values.push(updates.coreMessage);
    }
    if (updates.targetAudience !== undefined) {
      fields.push(`target_audience = $${paramCount++}`);
      values.push(updates.targetAudience);
    }
    if (updates.contentPillars !== undefined) {
      fields.push(`content_pillars = $${paramCount++}`);
      values.push(updates.contentPillars);
    }
    if (updates.voiceAndTone !== undefined) {
      fields.push(`voice_and_tone = $${paramCount++}`);
      values.push(JSON.stringify(updates.voiceAndTone));
    }
    if (updates.platformStrategy !== undefined) {
      fields.push(`platform_strategy = $${paramCount++}`);
      values.push(JSON.stringify(updates.platformStrategy));
    }
    if (updates.isActive !== undefined) {
      fields.push(`is_active = $${paramCount++}`);
      values.push(updates.isActive);
    }

    if (fields.length === 0) {
      return this.findById(id);
    }

    fields.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(id);

    const query = `
      UPDATE brand_strategy 
      SET ${fields.join(', ')}
      WHERE id = $${paramCount}
      RETURNING *
    `;

    const result = await db.query(query, values);
    
    if (result.rows.length === 0) {
      return null;
    }

    const strategy = result.rows[0];
    return {
      id: strategy.id,
      userId: strategy.user_id,
      coreMessage: strategy.core_message,
      targetAudience: strategy.target_audience,
      contentPillars: strategy.content_pillars,
      voiceAndTone: strategy.voice_and_tone,
      platformStrategy: strategy.platform_strategy,
      isActive: strategy.is_active,
      createdAt: strategy.created_at,
      updatedAt: strategy.updated_at,
    };
  }

  static async setActiveStrategy(userId: string, strategyId: string): Promise<BrandStrategy | null> {
    // First, deactivate all existing strategies for this user
    await db.query(
      'UPDATE brand_strategy SET is_active = false WHERE user_id = $1',
      [userId]
    );

    // Then activate the specified strategy
    const query = `
      UPDATE brand_strategy 
      SET is_active = true, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1 AND user_id = $2
      RETURNING *
    `;

    const result = await db.query(query, [strategyId, userId]);
    
    if (result.rows.length === 0) {
      return null;
    }

    const strategy = result.rows[0];
    return {
      id: strategy.id,
      userId: strategy.user_id,
      coreMessage: strategy.core_message,
      targetAudience: strategy.target_audience,
      contentPillars: strategy.content_pillars,
      voiceAndTone: strategy.voice_and_tone,
      platformStrategy: strategy.platform_strategy,
      isActive: strategy.is_active,
      createdAt: strategy.created_at,
      updatedAt: strategy.updated_at,
    };
  }

  static async delete(id: string): Promise<boolean> {
    const query = 'DELETE FROM brand_strategy WHERE id = $1';
    const result = await db.query(query, [id]);
    return result.rowCount > 0;
  }

  static async deactivateAllStrategies(userId: string): Promise<void> {
    const query = 'UPDATE brand_strategy SET is_active = false WHERE user_id = $1';
    await db.query(query, [userId]);
  }

  static async createDefaultStrategy(userId: string): Promise<BrandStrategy> {
    const defaultStrategy = {
      userId,
      coreMessage: '',
      targetAudience: [],
      contentPillars: [],
      voiceAndTone: {
        tone: 'professional',
        personality: ['authentic', 'knowledgeable'],
        vocabulary: 'industry-appropriate',
        writingStyle: 'clear and engaging'
      },
      platformStrategy: {
        linkedin: {
          active: true,
          postingFrequency: 'weekly',
          contentTypes: ['thought-leadership', 'industry-insights'],
          hashtagStrategy: [],
          engagementStrategy: 'professional networking'
        }
      },
      isActive: true
    };

    return this.create(defaultStrategy);
  }
}