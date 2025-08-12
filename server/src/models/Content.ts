import { db } from '@/utils/database';
import { Content } from '@/types';

export class ContentModel {
  static async create(contentData: Omit<Content, 'id' | 'createdAt' | 'updatedAt'>): Promise<Content> {
    const query = `
      INSERT INTO content (user_id, platform, content_type, title, body, tags, brand_alignment, performance_score, status)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `;
    
    const values = [
      contentData.userId,
      contentData.platform,
      contentData.contentType,
      contentData.title || null,
      contentData.body,
      contentData.tags,
      contentData.brandAlignment,
      contentData.performanceScore,
      contentData.status
    ];
    
    const result = await db.query(query, values);
    const content = result.rows[0];
    
    return {
      id: content.id,
      userId: content.user_id,
      platform: content.platform,
      contentType: content.content_type,
      title: content.title,
      body: content.body,
      tags: content.tags,
      brandAlignment: parseFloat(content.brand_alignment),
      performanceScore: parseFloat(content.performance_score),
      status: content.status,
      createdAt: content.created_at,
      updatedAt: content.updated_at,
    };
  }

  static async findByUserId(userId: string, limit: number = 50, offset: number = 0): Promise<Content[]> {
    const query = `
      SELECT * FROM content 
      WHERE user_id = $1 
      ORDER BY created_at DESC 
      LIMIT $2 OFFSET $3
    `;
    
    const result = await db.query(query, [userId, limit, offset]);
    
    return result.rows.map(content => ({
      id: content.id,
      userId: content.user_id,
      platform: content.platform,
      contentType: content.content_type,
      title: content.title,
      body: content.body,
      tags: content.tags,
      brandAlignment: parseFloat(content.brand_alignment),
      performanceScore: parseFloat(content.performance_score),
      status: content.status,
      createdAt: content.created_at,
      updatedAt: content.updated_at,
    }));
  }

  static async findById(id: string): Promise<Content | null> {
    const query = 'SELECT * FROM content WHERE id = $1';
    const result = await db.query(query, [id]);
    
    if (result.rows.length === 0) {
      return null;
    }
    
    const content = result.rows[0];
    return {
      id: content.id,
      userId: content.user_id,
      platform: content.platform,
      contentType: content.content_type,
      title: content.title,
      body: content.body,
      tags: content.tags,
      brandAlignment: parseFloat(content.brand_alignment),
      performanceScore: parseFloat(content.performance_score),
      status: content.status,
      createdAt: content.created_at,
      updatedAt: content.updated_at,
    };
  }

  static async update(id: string, updates: Partial<Content>): Promise<Content | null> {
    const fields = [];
    const values = [];
    let paramCount = 1;

    if (updates.platform !== undefined) {
      fields.push(`platform = $${paramCount++}`);
      values.push(updates.platform);
    }
    if (updates.contentType !== undefined) {
      fields.push(`content_type = $${paramCount++}`);
      values.push(updates.contentType);
    }
    if (updates.title !== undefined) {
      fields.push(`title = $${paramCount++}`);
      values.push(updates.title);
    }
    if (updates.body !== undefined) {
      fields.push(`body = $${paramCount++}`);
      values.push(updates.body);
    }
    if (updates.tags !== undefined) {
      fields.push(`tags = $${paramCount++}`);
      values.push(updates.tags);
    }
    if (updates.brandAlignment !== undefined) {
      fields.push(`brand_alignment = $${paramCount++}`);
      values.push(updates.brandAlignment);
    }
    if (updates.performanceScore !== undefined) {
      fields.push(`performance_score = $${paramCount++}`);
      values.push(updates.performanceScore);
    }
    if (updates.status !== undefined) {
      fields.push(`status = $${paramCount++}`);
      values.push(updates.status);
    }

    if (fields.length === 0) {
      return this.findById(id);
    }

    fields.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(id);

    const query = `
      UPDATE content 
      SET ${fields.join(', ')}
      WHERE id = $${paramCount}
      RETURNING *
    `;

    const result = await db.query(query, values);
    
    if (result.rows.length === 0) {
      return null;
    }

    const content = result.rows[0];
    return {
      id: content.id,
      userId: content.user_id,
      platform: content.platform,
      contentType: content.content_type,
      title: content.title,
      body: content.body,
      tags: content.tags,
      brandAlignment: parseFloat(content.brand_alignment),
      performanceScore: parseFloat(content.performance_score),
      status: content.status,
      createdAt: content.created_at,
      updatedAt: content.updated_at,
    };
  }

  static async delete(id: string): Promise<boolean> {
    const query = 'DELETE FROM content WHERE id = $1';
    const result = await db.query(query, [id]);
    return result.rowCount > 0;
  }

  static async findByPlatform(userId: string, platform: string): Promise<Content[]> {
    const query = `
      SELECT * FROM content 
      WHERE user_id = $1 AND platform = $2 
      ORDER BY created_at DESC
    `;
    
    const result = await db.query(query, [userId, platform]);
    
    return result.rows.map(content => ({
      id: content.id,
      userId: content.user_id,
      platform: content.platform,
      contentType: content.content_type,
      title: content.title,
      body: content.body,
      tags: content.tags,
      brandAlignment: parseFloat(content.brand_alignment),
      performanceScore: parseFloat(content.performance_score),
      status: content.status,
      createdAt: content.created_at,
      updatedAt: content.updated_at,
    }));
  }

  static async findByStatus(userId: string, status: string): Promise<Content[]> {
    const query = `
      SELECT * FROM content 
      WHERE user_id = $1 AND status = $2 
      ORDER BY created_at DESC
    `;
    
    const result = await db.query(query, [userId, status]);
    
    return result.rows.map(content => ({
      id: content.id,
      userId: content.user_id,
      platform: content.platform,
      contentType: content.content_type,
      title: content.title,
      body: content.body,
      tags: content.tags,
      brandAlignment: parseFloat(content.brand_alignment),
      performanceScore: parseFloat(content.performance_score),
      status: content.status,
      createdAt: content.created_at,
      updatedAt: content.updated_at,
    }));
  }
}