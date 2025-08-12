import { db } from '@/utils/database';
import { User, UserProfile, RegisterRequest } from '@/types';
import { hashPassword } from '@/utils/auth';

export class UserModel {
  static async create(userData: RegisterRequest): Promise<User> {
    const hashedPassword = await hashPassword(userData.password);
    
    const query = `
      INSERT INTO users (email, password, name)
      VALUES ($1, $2, $3)
      RETURNING id, email, name, created_at, updated_at, last_active, is_verified
    `;
    
    const values = [userData.email, hashedPassword, userData.name];
    const result = await db.query(query, values);
    
    return {
      ...result.rows[0],
      password: '', // Don't return password
      createdAt: result.rows[0].created_at,
      updatedAt: result.rows[0].updated_at,
      lastActive: result.rows[0].last_active,
      isVerified: result.rows[0].is_verified,
    };
  }

  static async findByEmail(email: string): Promise<User | null> {
    const query = 'SELECT * FROM users WHERE email = $1';
    const result = await db.query(query, [email]);
    
    if (result.rows.length === 0) {
      return null;
    }
    
    const user = result.rows[0];
    return {
      id: user.id,
      email: user.email,
      password: user.password,
      name: user.name,
      createdAt: user.created_at,
      updatedAt: user.updated_at,
      lastActive: user.last_active,
      isVerified: user.is_verified,
    };
  }

  static async findById(id: string): Promise<Omit<User, 'password'> | null> {
    const query = 'SELECT id, email, name, created_at, updated_at, last_active, is_verified FROM users WHERE id = $1';
    const result = await db.query(query, [id]);
    
    if (result.rows.length === 0) {
      return null;
    }
    
    const user = result.rows[0];
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      createdAt: user.created_at,
      updatedAt: user.updated_at,
      lastActive: user.last_active,
      isVerified: user.is_verified,
    };
  }

  static async updateLastActive(id: string): Promise<void> {
    const query = 'UPDATE users SET last_active = CURRENT_TIMESTAMP WHERE id = $1';
    await db.query(query, [id]);
  }

  static async emailExists(email: string): Promise<boolean> {
    const query = 'SELECT 1 FROM users WHERE email = $1';
    const result = await db.query(query, [email]);
    return result.rows.length > 0;
  }
}

export class UserProfileModel {
  static async create(userId: string): Promise<UserProfile> {
    const query = `
      INSERT INTO user_profiles (user_id, profession, goals, branding_objectives, context_box, social_media_handles)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;
    
    const values = [userId, '', [], [], '', []];
    const result = await db.query(query, values);
    
    const profile = result.rows[0];
    return {
      id: profile.id,
      userId: profile.user_id,
      profession: profile.profession,
      goals: profile.goals,
      brandingObjectives: profile.branding_objectives,
      contextBox: profile.context_box,
      socialMediaHandles: profile.social_media_handles,
      createdAt: profile.created_at,
      updatedAt: profile.updated_at,
    };
  }

  static async findByUserId(userId: string): Promise<UserProfile | null> {
    const query = 'SELECT * FROM user_profiles WHERE user_id = $1';
    const result = await db.query(query, [userId]);
    
    if (result.rows.length === 0) {
      return null;
    }
    
    const profile = result.rows[0];
    return {
      id: profile.id,
      userId: profile.user_id,
      profession: profile.profession,
      goals: profile.goals,
      brandingObjectives: profile.branding_objectives,
      contextBox: profile.context_box,
      socialMediaHandles: profile.social_media_handles,
      createdAt: profile.created_at,
      updatedAt: profile.updated_at,
    };
  }

  static async update(userId: string, updates: Partial<UserProfile>): Promise<UserProfile | null> {
    const fields = [];
    const values = [];
    let paramCount = 1;

    if (updates.profession !== undefined) {
      fields.push(`profession = $${paramCount++}`);
      values.push(updates.profession);
    }
    if (updates.goals !== undefined) {
      fields.push(`goals = $${paramCount++}`);
      values.push(updates.goals);
    }
    if (updates.brandingObjectives !== undefined) {
      fields.push(`branding_objectives = $${paramCount++}`);
      values.push(updates.brandingObjectives);
    }
    if (updates.contextBox !== undefined) {
      fields.push(`context_box = $${paramCount++}`);
      values.push(updates.contextBox);
    }
    if (updates.socialMediaHandles !== undefined) {
      fields.push(`social_media_handles = $${paramCount++}`);
      values.push(JSON.stringify(updates.socialMediaHandles));
    }

    if (fields.length === 0) {
      return this.findByUserId(userId);
    }

    fields.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(userId);

    const query = `
      UPDATE user_profiles 
      SET ${fields.join(', ')}
      WHERE user_id = $${paramCount}
      RETURNING *
    `;

    const result = await db.query(query, values);
    
    if (result.rows.length === 0) {
      return null;
    }

    const profile = result.rows[0];
    return {
      id: profile.id,
      userId: profile.user_id,
      profession: profile.profession,
      goals: profile.goals,
      brandingObjectives: profile.branding_objectives,
      contextBox: profile.context_box,
      socialMediaHandles: profile.social_media_handles,
      createdAt: profile.created_at,
      updatedAt: profile.updated_at,
    };
  }
}