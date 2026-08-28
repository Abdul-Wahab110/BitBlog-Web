import { Database } from '../config/database';

export interface UserRecord {
  user_id: number;
  role_id: number;
  role_name: string;
  name: string;
  username: string;
  email: string;
  password_hash: string;
  profile_image?: string;
  bio?: string;
  website?: string;
  author_tags?: string[];
  social_links?: {
    twitter?: string;
    github?: string;
    linkedin?: string;
    facebook?: string;
    instagram?: string;
    youtube?: string;
    website?: string;
  };
  short_description?: string;
  is_verified?: boolean | number;
  verification_token?: string;
  verification_expires?: string;
  status: 'ACTIVE' | 'SUSPENDED' | 'PENDING';
  created_at: string;
  updated_at: string;
  last_login?: string;
}

export class UserModel {
  public static async countAll(): Promise<number> {
    return Database.getStore().users.length;
  }
  public static async findByEmail(email: string): Promise<UserRecord | null> {
    const store = Database.getStore();
    const normalized = email.trim().toLowerCase();
    const user = store.users.find(u => u.email.toLowerCase() === normalized);
    return user || null;
  }

  public static async findByUsername(username: string): Promise<UserRecord | null> {
    const store = Database.getStore();
    const normalized = username.trim().toLowerCase();
    const user = store.users.find(u => u.username.toLowerCase() === normalized);
    return user || null;
  }

  public static async findById(userId: number): Promise<UserRecord | null> {
    const store = Database.getStore();
    const user = store.users.find(u => u.user_id === userId);
    return user || null;
  }

  public static async getRoleIdByName(roleName: string): Promise<number | null> {
    const store = Database.getStore();
    const role = store.roles.find(r => r.role_name.toLowerCase() === roleName.toLowerCase());
    if (role) return role.role_id;
    const roleMap: Record<string, number> = { Admin: 1, Editor: 2, Author: 3, User: 4 };
    return roleMap[roleName] || 4;
  }

  public static async findByVerificationToken(token: string): Promise<UserRecord | null> {
    const store = Database.getStore();
    const cleanToken = token.trim();
    const user = store.users.find(u => u.verification_token === cleanToken);
    return user || null;
  }

  public static async markEmailVerified(userId: number): Promise<UserRecord | null> {
    const store = Database.getStore();
    const user = store.users.find(u => u.user_id === userId);
    if (user) {
      user.is_verified = true;
      user.verification_token = undefined;
      user.verification_expires = undefined;
      user.status = 'ACTIVE';
      user.updated_at = new Date().toISOString();
      Database.saveStore();
      return user;
    }
    return null;
  }

  public static async setVerificationToken(userId: number, token: string, expires: string): Promise<void> {
    const store = Database.getStore();
    const user = store.users.find(u => u.user_id === userId);
    if (user) {
      user.verification_token = token;
      user.verification_expires = expires;
      user.updated_at = new Date().toISOString();
      Database.saveStore();
    }
  }

  public static async createUser(data: {
    roleId: number;
    name: string;
    username: string;
    email: string;
    passwordHash: string;
    isVerified?: boolean;
    verificationToken?: string;
    verificationExpires?: string;
  }): Promise<UserRecord> {
    const store = Database.getStore();
    const roleMap: Record<number, string> = { 1: 'Admin', 2: 'Editor', 3: 'Author', 4: 'User' };
    const role_name = roleMap[data.roleId] || 'User';
    const now = new Date().toISOString();

    const maxId = store.users.reduce((max, u) => Math.max(max, u.user_id), 0);
    const newRecord: UserRecord = {
      user_id: maxId + 1,
      role_id: data.roleId,
      role_name,
      name: data.name.trim(),
      username: data.username.trim().toLowerCase(),
      email: data.email.trim().toLowerCase(),
      password_hash: data.passwordHash,
      is_verified: data.isVerified !== undefined ? data.isVerified : true,
      verification_token: data.verificationToken,
      verification_expires: data.verificationExpires,
      status: 'ACTIVE',
      created_at: now,
      updated_at: now,
    };

    store.users.push(newRecord);
    Database.saveStore();
    return newRecord;
  }

  public static async updatePassword(userId: number, passwordHash: string): Promise<void> {
    const store = Database.getStore();
    const user = store.users.find(u => u.user_id === userId);
    if (user) {
      user.password_hash = passwordHash;
      user.updated_at = new Date().toISOString();
      Database.saveStore();

      try {
        await Database.execute(`UPDATE users SET password_hash = :1, updated_at = CURRENT_TIMESTAMP WHERE user_id = :2`, [passwordHash, userId]);
      } catch (e) {
        console.warn('Oracle user password update notice:', e);
      }
    }
  }

  public static async updateLastLogin(userId: number): Promise<void> {
    const store = Database.getStore();
    const user = store.users.find(u => u.user_id === userId);
    if (user) {
      user.last_login = new Date().toISOString();
      Database.saveStore();
    }
  }

  public static async updateUserRole(userId: number, roleId: number): Promise<void> {
    const store = Database.getStore();
    const roleMap: Record<number, string> = { 1: 'Admin', 2: 'Editor', 3: 'Author', 4: 'User' };
    const user = store.users.find(u => u.user_id === userId);
    if (user) {
      if (user.username === 'admin' || user.email === 'aw419770@gmail.com' || user.user_id === 1) {
        throw new Error('System Administrator role is protected and cannot be changed.');
      }
      user.role_id = roleId;
      user.role_name = roleMap[roleId] || 'User';
      user.updated_at = new Date().toISOString();
      Database.saveStore();
    }
  }

  public static async updateUserStatus(userId: number, status: 'ACTIVE' | 'SUSPENDED' | 'PENDING'): Promise<void> {
    const store = Database.getStore();
    const user = store.users.find(u => u.user_id === userId);
    if (user) {
      if (user.username === 'admin' || user.email === 'aw419770@gmail.com' || user.user_id === 1) {
        throw new Error('System Administrator status is protected and cannot be modified.');
      }
      user.status = status;
      user.updated_at = new Date().toISOString();
      Database.saveStore();
    }
  }

  public static async deleteUser(userId: number): Promise<void> {
    const store = Database.getStore();
    const target = store.users.find(u => u.user_id === userId);
    if (target && (target.username === 'admin' || target.email === 'aw419770@gmail.com' || target.user_id === 1)) {
      throw new Error('Super Administrator (Website Owner) account is protected and cannot be deleted.');
    }
    store.users = store.users.filter(u => u.user_id !== userId);
    Database.saveStore();
  }

  public static async updateProfile(
    userId: number,
    data: {
      name?: string;
      bio?: string;
      profile_image?: string;
      website?: string;
      author_tags?: string[];
      social_links?: any;
      short_description?: string;
    }
  ): Promise<UserRecord | null> {
    const store = Database.getStore();
    const user = store.users.find(u => u.user_id === userId);
    if (!user) return null;

    if (data.name !== undefined && data.name.trim()) user.name = data.name.trim();
    if (data.bio !== undefined) user.bio = data.bio;
    if (data.profile_image !== undefined) user.profile_image = data.profile_image;
    if (data.website !== undefined) user.website = data.website;
    if (data.author_tags !== undefined) user.author_tags = data.author_tags;
    if (data.social_links !== undefined) user.social_links = data.social_links;
    if (data.short_description !== undefined) user.short_description = data.short_description;
    user.updated_at = new Date().toISOString();

    // Also update author_name / author_avatar in posts authored by this user
    if (data.name || data.profile_image !== undefined) {
      store.posts?.forEach(p => {
        if (p.author_id === userId) {
          if (data.name) p.author_name = data.name.trim();
          if (data.profile_image !== undefined) p.author_avatar = data.profile_image;
        }
      });
      // Also update in comments
      store.comments?.forEach((c: any) => {
        if (c.user_id === userId) {
          if (data.name) c.user_name = data.name.trim();
          if (data.profile_image !== undefined) c.user_avatar = data.profile_image;
        }
      });
    }

    Database.saveStore();
    return user;
  }
}
