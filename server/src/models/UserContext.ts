import { db } from '@/utils/database';
import { UserContext } from '@/types';

export class UserContextModel {
  static async create(contextData: Omit<UserContext, 'id' | 'createdAt'>): Promise<UserContext> {
    const query = `
      INSERT INTO user_context (user_id, context_type, data, confidence, last_updated, version)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;
    
    const values = [
      contextData.userId,
      contextData.contextType,
      JSON.stringify(contextData.data),
      contextData.confidence,
      contextData.lastUpdated,
      contextData.version
    ];
    
    const result = await db.query(query, values);
    const context = result.rows[0];
    
    return {
      id: context.id,
      userId: context.user_id,
      contextType: context.context_type,
      data: context.data,
      confidence: parseFloat(context.confidence),
      lastUpdated: context.last_updated,
      version: context.version,
      createdAt: context.created_at,
    };
  }

  static async findByUserId(userId: string): Promise<UserContext[]> {
    const query = `
      SELECT * FROM user_context 
      WHERE user_id = $1 
      ORDER BY context_type, version DESC
    `;
    
    const result = await db.query(query, [userId]);
    
    return result.rows.map(context => ({
      id: context.id,
      userId: context.user_id,
      contextType: context.context_type,
      data: context.data,
      confidence: parseFloat(context.confidence),
      lastUpdated: context.last_updated,
      version: context.version,
      createdAt: context.created_at,
    }));
  }

  static async findById(id: string): Promise<UserContext | null> {
    const query = 'SELECT * FROM user_context WHERE id = $1';
    const result = await db.query(query, [id]);
    
    if (result.rows.length === 0) {
      return null;
    }
    
    const context = result.rows[0];
    return {
      id: context.id,
      userId: context.user_id,
      contextType: context.context_type,
      data: context.data,
      confidence: parseFloat(context.confidence),
      lastUpdated: context.last_updated,
      version: context.version,
      createdAt: context.created_at,
    };
  }

  static async findByType(userId: string, contextType: string): Promise<UserContext[]> {
    const query = `
      SELECT * FROM user_context 
      WHERE user_id = $1 AND context_type = $2 
      ORDER BY version DESC
    `;
    
    const result = await db.query(query, [userId, contextType]);
    
    return result.rows.map(context => ({
      id: context.id,
      userId: context.user_id,
      contextType: context.context_type,
      data: context.data,
      confidence: parseFloat(context.confidence),
      lastUpdated: context.last_updated,
      version: context.version,
      createdAt: context.created_at,
    }));
  }

  static async findLatestByType(userId: string, contextType: string): Promise<UserContext | null> {
    const query = `
      SELECT * FROM user_context 
      WHERE user_id = $1 AND context_type = $2 
      ORDER BY version DESC 
      LIMIT 1
    `;
    
    const result = await db.query(query, [userId, contextType]);
    
    if (result.rows.length === 0) {
      return null;
    }
    
    const context = result.rows[0];
    return {
      id: context.id,
      userId: context.user_id,
      contextType: context.context_type,
      data: context.data,
      confidence: parseFloat(context.confidence),
      lastUpdated: context.last_updated,
      version: context.version,
      createdAt: context.created_at,
    };
  }

  static async updateOrCreate(userId: string, contextType: string, data: Record<string, any>, confidence: number): Promise<UserContext> {
    // First, get the latest version for this context type
    const latestContext = await this.findLatestByType(userId, contextType);
    const nextVersion = latestContext ? latestContext.version + 1 : 1;

    const query = `
      INSERT INTO user_context (user_id, context_type, data, confidence, last_updated, version)
      VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP, $5)
      RETURNING *
    `;
    
    const values = [
      userId,
      contextType,
      JSON.stringify(data),
      confidence,
      nextVersion
    ];
    
    const result = await db.query(query, values);
    const context = result.rows[0];
    
    return {
      id: context.id,
      userId: context.user_id,
      contextType: context.context_type,
      data: context.data,
      confidence: parseFloat(context.confidence),
      lastUpdated: context.last_updated,
      version: context.version,
      createdAt: context.created_at,
    };
  }

  static async update(id: string, updates: Partial<UserContext>): Promise<UserContext | null> {
    const fields = [];
    const values = [];
    let paramCount = 1;

    if (updates.data !== undefined) {
      fields.push(`data = $${paramCount++}`);
      values.push(JSON.stringify(updates.data));
    }
    if (updates.confidence !== undefined) {
      fields.push(`confidence = $${paramCount++}`);
      values.push(updates.confidence);
    }
    if (updates.version !== undefined) {
      fields.push(`version = $${paramCount++}`);
      values.push(updates.version);
    }

    if (fields.length === 0) {
      return this.findById(id);
    }

    fields.push(`last_updated = CURRENT_TIMESTAMP`);
    values.push(id);

    const query = `
      UPDATE user_context 
      SET ${fields.join(', ')}
      WHERE id = $${paramCount}
      RETURNING *
    `;

    const result = await db.query(query, values);
    
    if (result.rows.length === 0) {
      return null;
    }

    const context = result.rows[0];
    return {
      id: context.id,
      userId: context.user_id,
      contextType: context.context_type,
      data: context.data,
      confidence: parseFloat(context.confidence),
      lastUpdated: context.last_updated,
      version: context.version,
      createdAt: context.created_at,
    };
  }

  static async delete(id: string): Promise<boolean> {
    const query = 'DELETE FROM user_context WHERE id = $1';
    const result = await db.query(query, [id]);
    return result.rowCount > 0;
  }

  static async findHighConfidenceContext(userId: string, minConfidence: number = 0.8): Promise<UserContext[]> {
    const query = `
      SELECT DISTINCT ON (context_type) *
      FROM user_context 
      WHERE user_id = $1 AND confidence >= $2
      ORDER BY context_type, version DESC
    `;
    
    const result = await db.query(query, [userId, minConfidence]);
    
    return result.rows.map(context => ({
      id: context.id,
      userId: context.user_id,
      contextType: context.context_type,
      data: context.data,
      confidence: parseFloat(context.confidence),
      lastUpdated: context.last_updated,
      version: context.version,
      createdAt: context.created_at,
    }));
  }

  static async getContextSummary(userId: string): Promise<Record<string, UserContext>> {
    const query = `
      SELECT DISTINCT ON (context_type) *
      FROM user_context 
      WHERE user_id = $1
      ORDER BY context_type, version DESC
    `;
    
    const result = await db.query(query, [userId]);
    
    const summary: Record<string, UserContext> = {};
    
    result.rows.forEach(context => {
      summary[context.context_type] = {
        id: context.id,
        userId: context.user_id,
        contextType: context.context_type,
        data: context.data,
        confidence: parseFloat(context.confidence),
        lastUpdated: context.last_updated,
        version: context.version,
        createdAt: context.created_at,
      };
    });
    
    return summary;
  }
}