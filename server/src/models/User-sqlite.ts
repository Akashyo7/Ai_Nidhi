import { getSQLiteDB } from '@/utils/database-sqlite';
import { User, UserProfile, RegisterRequest } from '@/types';
import { hashPassword } from '@/utils/auth';

export class UserModelSQLite {
  static async create(userData: RegisterRequest): Promise<User> {
    const db = getSQLiteDB();
    const hashedPassword = await hashPassword(userData.password);
    
    const result = await db.run(
      'INSERT INTO users (email, password, name) VALUES (?, ?, ?)',
      [userData.email, hashedPassword, userData.name]
    );
    
    const user = await db.get(
      'SELECT id, email, name, created_at, updated_at, last_active, is_verified FROM users WHERE rowid = ?',
      [result.lastID]
    );
    
    return {
      ...user,
      password: '', // Don't return password
      createdAt: new Date(user.created_at),
      updatedAt: new Date(user.updated_at),
      lastActive: new Date(user.last_active),
      isVerified: Boolean(user.is_verified),
    };
  }

  static async findByEmail(email: string): Promise<User | null> {
    const db = getSQLiteDB();
    const user = await db.get('SELECT * FROM users WHERE email = ?', [email]);
    
    if (!user) {
      return null;
    }
    
    return {
      id: user.id,
      email: user.email,
      password: user.password,
      name: user.name,
      createdAt: new Date(user.created_at),
      updatedAt: new Date(user.updated_at),
      lastActive: new Date(user.last_active),
      isVerified: Boolean(user.is_verified),
    };
  }

  static async findById(id: string): Promise<Omit<User, 'password'> | null> {
    const db = getSQLiteDB();
    const user = await db.get(
      'SELECT id, email, name, created_at, updated_at, last_active, is_verified FROM users WHERE id = ?',
      [id]
    );
    
    if (!user) {
      return null;
    }
    
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      createdAt: new Date(user.created_at),
      updatedAt: new Date(user.updated_at),
      lastActive: new Date(user.last_active),
      isVerified: Boolean(user.is_verified),
    };
  }

  static async updateLastActive(id: string): Promise<void> {
    const db = getSQLiteDB();
    await db.run('UPDATE users SET last_active = CURRENT_TIMESTAMP WHERE id = ?', [id]);
  }

  static async emailExists(email: string): Promise<boolean> {
    const db = getSQLiteDB();
    const result = await db.get('SELECT 1 FROM users WHERE email = ?', [email]);
    return !!result;
  }
}

export class UserProfileModelSQLite {
  static async create(userId: string): Promise<UserProfile> {
    const db = getSQLiteDB();
    
    const result = await db.run(
      'INSERT INTO user_profiles (user_id, profession, goals, branding_objectives, context_box, social_media_handles) VALUES (?, ?, ?, ?, ?, ?)',
      [userId, '', '[]', '[]', '', '[]']
    );
    
    const profile = await db.get('SELECT * FROM user_profiles WHERE id = ?', [result.lastID]);
    
    return {
      id: profile.id,
      userId: profile.user_id,
      profession: profile.profession,
      goals: JSON.parse(profile.goals || '[]'),
      brandingObjectives: JSON.parse(profile.branding_objectives || '[]'),
      contextBox: profile.context_box,
      socialMediaHandles: JSON.parse(profile.social_media_handles || '[]'),
      createdAt: new Date(profile.created_at),
      updatedAt: new Date(profile.updated_at),
    };
  }

  static async findByUserId(userId: string): Promise<UserProfile | null> {
    const db = getSQLiteDB();
    const profile = await db.get('SELECT * FROM user_profiles WHERE user_id = ?', [userId]);
    
    if (!profile) {
      return null;
    }
    
    return {
      id: profile.id,
      userId: profile.user_id,
      profession: profile.profession,
      goals: JSON.parse(profile.goals || '[]'),
      brandingObjectives: JSON.parse(profile.branding_objectives || '[]'),
      contextBox: profile.context_box,
      socialMediaHandles: JSON.parse(profile.social_media_handles || '[]'),
      createdAt: new Date(profile.created_at),
      updatedAt: new Date(profile.updated_at),
    };
  }

  static async update(userId: string, updates: Partial<UserProfile>): Promise<UserProfile | null> {
    const db = getSQLiteDB();
    const fields = [];
    const values = [];

    if (updates.profession !== undefined) {
      fields.push('profession = ?');
      values.push(updates.profession);
    }
    if (updates.goals !== undefined) {
      fields.push('goals = ?');
      values.push(JSON.stringify(updates.goals));
    }
    if (updates.brandingObjectives !== undefined) {
      fields.push('branding_objectives = ?');
      values.push(JSON.stringify(updates.brandingObjectives));
    }
    if (updates.contextBox !== undefined) {
      fields.push('context_box = ?');
      values.push(updates.contextBox);
    }
    if (updates.socialMediaHandles !== undefined) {
      fields.push('social_media_handles = ?');
      values.push(JSON.stringify(updates.socialMediaHandles));
    }

    if (fields.length === 0) {
      return this.findByUserId(userId);
    }

    fields.push('updated_at = CURRENT_TIMESTAMP');
    values.push(userId);

    await db.run(
      `UPDATE user_profiles SET ${fields.join(', ')} WHERE user_id = ?`,
      values
    );

    return this.findByUserId(userId);
  }
}