import { db } from '@/utils/database';
import { Project } from '@/types';

export class ProjectModel {
  static async create(projectData: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>): Promise<Project> {
    const query = `
      INSERT INTO projects (user_id, name, type, description, goals, status, start_date, end_date, context)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `;
    
    const values = [
      projectData.userId,
      projectData.name,
      projectData.type,
      projectData.description || null,
      projectData.goals,
      projectData.status,
      projectData.startDate || null,
      projectData.endDate || null,
      JSON.stringify(projectData.context)
    ];
    
    const result = await db.query(query, values);
    const project = result.rows[0];
    
    return {
      id: project.id,
      userId: project.user_id,
      name: project.name,
      type: project.type,
      description: project.description,
      goals: project.goals,
      status: project.status,
      startDate: project.start_date,
      endDate: project.end_date,
      context: project.context,
      createdAt: project.created_at,
      updatedAt: project.updated_at,
    };
  }

  static async findByUserId(userId: string): Promise<Project[]> {
    const query = `
      SELECT * FROM projects 
      WHERE user_id = $1 
      ORDER BY created_at DESC
    `;
    
    const result = await db.query(query, [userId]);
    
    return result.rows.map(project => ({
      id: project.id,
      userId: project.user_id,
      name: project.name,
      type: project.type,
      description: project.description,
      goals: project.goals,
      status: project.status,
      startDate: project.start_date,
      endDate: project.end_date,
      context: project.context,
      createdAt: project.created_at,
      updatedAt: project.updated_at,
    }));
  }

  static async findById(id: string): Promise<Project | null> {
    const query = 'SELECT * FROM projects WHERE id = $1';
    const result = await db.query(query, [id]);
    
    if (result.rows.length === 0) {
      return null;
    }
    
    const project = result.rows[0];
    return {
      id: project.id,
      userId: project.user_id,
      name: project.name,
      type: project.type,
      description: project.description,
      goals: project.goals,
      status: project.status,
      startDate: project.start_date,
      endDate: project.end_date,
      context: project.context,
      createdAt: project.created_at,
      updatedAt: project.updated_at,
    };
  }

  static async update(id: string, updates: Partial<Project>): Promise<Project | null> {
    const fields = [];
    const values = [];
    let paramCount = 1;

    if (updates.name !== undefined) {
      fields.push(`name = $${paramCount++}`);
      values.push(updates.name);
    }
    if (updates.type !== undefined) {
      fields.push(`type = $${paramCount++}`);
      values.push(updates.type);
    }
    if (updates.description !== undefined) {
      fields.push(`description = $${paramCount++}`);
      values.push(updates.description);
    }
    if (updates.goals !== undefined) {
      fields.push(`goals = $${paramCount++}`);
      values.push(updates.goals);
    }
    if (updates.status !== undefined) {
      fields.push(`status = $${paramCount++}`);
      values.push(updates.status);
    }
    if (updates.startDate !== undefined) {
      fields.push(`start_date = $${paramCount++}`);
      values.push(updates.startDate);
    }
    if (updates.endDate !== undefined) {
      fields.push(`end_date = $${paramCount++}`);
      values.push(updates.endDate);
    }
    if (updates.context !== undefined) {
      fields.push(`context = $${paramCount++}`);
      values.push(JSON.stringify(updates.context));
    }

    if (fields.length === 0) {
      return this.findById(id);
    }

    fields.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(id);

    const query = `
      UPDATE projects 
      SET ${fields.join(', ')}
      WHERE id = $${paramCount}
      RETURNING *
    `;

    const result = await db.query(query, values);
    
    if (result.rows.length === 0) {
      return null;
    }

    const project = result.rows[0];
    return {
      id: project.id,
      userId: project.user_id,
      name: project.name,
      type: project.type,
      description: project.description,
      goals: project.goals,
      status: project.status,
      startDate: project.start_date,
      endDate: project.end_date,
      context: project.context,
      createdAt: project.created_at,
      updatedAt: project.updated_at,
    };
  }

  static async delete(id: string): Promise<boolean> {
    const query = 'DELETE FROM projects WHERE id = $1';
    const result = await db.query(query, [id]);
    return result.rowCount > 0;
  }

  static async findByStatus(userId: string, status: string): Promise<Project[]> {
    const query = `
      SELECT * FROM projects 
      WHERE user_id = $1 AND status = $2 
      ORDER BY created_at DESC
    `;
    
    const result = await db.query(query, [userId, status]);
    
    return result.rows.map(project => ({
      id: project.id,
      userId: project.user_id,
      name: project.name,
      type: project.type,
      description: project.description,
      goals: project.goals,
      status: project.status,
      startDate: project.start_date,
      endDate: project.end_date,
      context: project.context,
      createdAt: project.created_at,
      updatedAt: project.updated_at,
    }));
  }

  static async findByType(userId: string, type: string): Promise<Project[]> {
    const query = `
      SELECT * FROM projects 
      WHERE user_id = $1 AND type = $2 
      ORDER BY created_at DESC
    `;
    
    const result = await db.query(query, [userId, type]);
    
    return result.rows.map(project => ({
      id: project.id,
      userId: project.user_id,
      name: project.name,
      type: project.type,
      description: project.description,
      goals: project.goals,
      status: project.status,
      startDate: project.start_date,
      endDate: project.end_date,
      context: project.context,
      createdAt: project.created_at,
      updatedAt: project.updated_at,
    }));
  }

  static async findActiveProjects(userId: string): Promise<Project[]> {
    return this.findByStatus(userId, 'active');
  }

  static async findCompletedProjects(userId: string): Promise<Project[]> {
    return this.findByStatus(userId, 'completed');
  }
}