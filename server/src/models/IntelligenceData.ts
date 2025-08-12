import { db } from '@/utils/database';
import { IntelligenceData } from '@/types';

export class IntelligenceDataModel {
  static async create(intelligenceData: Omit<IntelligenceData, 'id' | 'createdAt' | 'updatedAt'>): Promise<IntelligenceData> {
    const query = `
      INSERT INTO intelligence_data (user_id, type, data, relevance_score, is_actionable, source, expires_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `;
    
    const values = [
      intelligenceData.userId,
      intelligenceData.type,
      JSON.stringify(intelligenceData.data),
      intelligenceData.relevanceScore,
      intelligenceData.isActionable,
      intelligenceData.source || null,
      intelligenceData.expiresAt || null
    ];
    
    const result = await db.query(query, values);
    const intelligence = result.rows[0];
    
    return {
      id: intelligence.id,
      userId: intelligence.user_id,
      type: intelligence.type,
      data: intelligence.data,
      relevanceScore: parseFloat(intelligence.relevance_score),
      isActionable: intelligence.is_actionable,
      source: intelligence.source,
      expiresAt: intelligence.expires_at,
      createdAt: intelligence.created_at,
      updatedAt: intelligence.updated_at,
    };
  }

  static async findByUserId(userId: string, limit: number = 50, offset: number = 0): Promise<IntelligenceData[]> {
    const query = `
      SELECT * FROM intelligence_data 
      WHERE user_id = $1 AND (expires_at IS NULL OR expires_at > CURRENT_TIMESTAMP)
      ORDER BY relevance_score DESC, created_at DESC 
      LIMIT $2 OFFSET $3
    `;
    
    const result = await db.query(query, [userId, limit, offset]);
    
    return result.rows.map(intelligence => ({
      id: intelligence.id,
      userId: intelligence.user_id,
      type: intelligence.type,
      data: intelligence.data,
      relevanceScore: parseFloat(intelligence.relevance_score),
      isActionable: intelligence.is_actionable,
      source: intelligence.source,
      expiresAt: intelligence.expires_at,
      createdAt: intelligence.created_at,
      updatedAt: intelligence.updated_at,
    }));
  }

  static async findById(id: string): Promise<IntelligenceData | null> {
    const query = 'SELECT * FROM intelligence_data WHERE id = $1';
    const result = await db.query(query, [id]);
    
    if (result.rows.length === 0) {
      return null;
    }
    
    const intelligence = result.rows[0];
    return {
      id: intelligence.id,
      userId: intelligence.user_id,
      type: intelligence.type,
      data: intelligence.data,
      relevanceScore: parseFloat(intelligence.relevance_score),
      isActionable: intelligence.is_actionable,
      source: intelligence.source,
      expiresAt: intelligence.expires_at,
      createdAt: intelligence.created_at,
      updatedAt: intelligence.updated_at,
    };
  }

  static async findByType(userId: string, type: string): Promise<IntelligenceData[]> {
    const query = `
      SELECT * FROM intelligence_data 
      WHERE user_id = $1 AND type = $2 AND (expires_at IS NULL OR expires_at > CURRENT_TIMESTAMP)
      ORDER BY relevance_score DESC, created_at DESC
    `;
    
    const result = await db.query(query, [userId, type]);
    
    return result.rows.map(intelligence => ({
      id: intelligence.id,
      userId: intelligence.user_id,
      type: intelligence.type,
      data: intelligence.data,
      relevanceScore: parseFloat(intelligence.relevance_score),
      isActionable: intelligence.is_actionable,
      source: intelligence.source,
      expiresAt: intelligence.expires_at,
      createdAt: intelligence.created_at,
      updatedAt: intelligence.updated_at,
    }));
  }

  static async findActionableItems(userId: string): Promise<IntelligenceData[]> {
    const query = `
      SELECT * FROM intelligence_data 
      WHERE user_id = $1 AND is_actionable = true AND (expires_at IS NULL OR expires_at > CURRENT_TIMESTAMP)
      ORDER BY relevance_score DESC, created_at DESC
    `;
    
    const result = await db.query(query, [userId]);
    
    return result.rows.map(intelligence => ({
      id: intelligence.id,
      userId: intelligence.user_id,
      type: intelligence.type,
      data: intelligence.data,
      relevanceScore: parseFloat(intelligence.relevance_score),
      isActionable: intelligence.is_actionable,
      source: intelligence.source,
      expiresAt: intelligence.expires_at,
      createdAt: intelligence.created_at,
      updatedAt: intelligence.updated_at,
    }));
  }

  static async update(id: string, updates: Partial<IntelligenceData>): Promise<IntelligenceData | null> {
    const fields = [];
    const values = [];
    let paramCount = 1;

    if (updates.type !== undefined) {
      fields.push(`type = $${paramCount++}`);
      values.push(updates.type);
    }
    if (updates.data !== undefined) {
      fields.push(`data = $${paramCount++}`);
      values.push(JSON.stringify(updates.data));
    }
    if (updates.relevanceScore !== undefined) {
      fields.push(`relevance_score = $${paramCount++}`);
      values.push(updates.relevanceScore);
    }
    if (updates.isActionable !== undefined) {
      fields.push(`is_actionable = $${paramCount++}`);
      values.push(updates.isActionable);
    }
    if (updates.source !== undefined) {
      fields.push(`source = $${paramCount++}`);
      values.push(updates.source);
    }
    if (updates.expiresAt !== undefined) {
      fields.push(`expires_at = $${paramCount++}`);
      values.push(updates.expiresAt);
    }

    if (fields.length === 0) {
      return this.findById(id);
    }

    fields.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(id);

    const query = `
      UPDATE intelligence_data 
      SET ${fields.join(', ')}
      WHERE id = $${paramCount}
      RETURNING *
    `;

    const result = await db.query(query, values);
    
    if (result.rows.length === 0) {
      return null;
    }

    const intelligence = result.rows[0];
    return {
      id: intelligence.id,
      userId: intelligence.user_id,
      type: intelligence.type,
      data: intelligence.data,
      relevanceScore: parseFloat(intelligence.relevance_score),
      isActionable: intelligence.is_actionable,
      source: intelligence.source,
      expiresAt: intelligence.expires_at,
      createdAt: intelligence.created_at,
      updatedAt: intelligence.updated_at,
    };
  }

  static async delete(id: string): Promise<boolean> {
    const query = 'DELETE FROM intelligence_data WHERE id = $1';
    const result = await db.query(query, [id]);
    return result.rowCount > 0;
  }

  static async cleanupExpired(): Promise<number> {
    const query = 'DELETE FROM intelligence_data WHERE expires_at IS NOT NULL AND expires_at <= CURRENT_TIMESTAMP';
    const result = await db.query(query);
    return result.rowCount;
  }

  static async findHighRelevanceItems(userId: string, minScore: number = 0.7): Promise<IntelligenceData[]> {
    const query = `
      SELECT * FROM intelligence_data 
      WHERE user_id = $1 AND relevance_score >= $2 AND (expires_at IS NULL OR expires_at > CURRENT_TIMESTAMP)
      ORDER BY relevance_score DESC, created_at DESC
    `;
    
    const result = await db.query(query, [userId, minScore]);
    
    return result.rows.map(intelligence => ({
      id: intelligence.id,
      userId: intelligence.user_id,
      type: intelligence.type,
      data: intelligence.data,
      relevanceScore: parseFloat(intelligence.relevance_score),
      isActionable: intelligence.is_actionable,
      source: intelligence.source,
      expiresAt: intelligence.expires_at,
      createdAt: intelligence.created_at,
      updatedAt: intelligence.updated_at,
    }));
  }
}