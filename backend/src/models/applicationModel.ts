import { Database } from '../config/database';

export interface RoleApplicationRecord {
  application_id: number;
  user_id: number;
  name: string;
  username: string;
  email: string;
  role_applied: 'Author' | 'Editor';
  bio: string;
  sample_urls: string;
  topics: string[];
  motivation: string;
  status: 'pending' | 'approved' | 'rejected';
  feedback?: string;
  created_at: string;
  updated_at: string;
  reviewed_by?: number;
  reviewed_at?: string;
}

export class ApplicationModel {
  public static async createApplication(data: {
    userId: number;
    name: string;
    username: string;
    email: string;
    roleApplied: 'Author' | 'Editor';
    bio: string;
    sampleUrls: string;
    topics: string[];
    motivation: string;
  }): Promise<RoleApplicationRecord> {
    const store = Database.getStore();
    if (!store.role_applications) {
      store.role_applications = [];
    }

    const now = new Date().toISOString();
    const maxId = store.role_applications.reduce((max, a) => Math.max(max, a.application_id || 0), 0);
    const newId = maxId + 1;

    const newApp: RoleApplicationRecord = {
      application_id: newId,
      user_id: data.userId,
      name: data.name.trim(),
      username: data.username.trim(),
      email: data.email.trim(),
      role_applied: data.roleApplied,
      bio: data.bio.trim(),
      sample_urls: data.sampleUrls.trim(),
      topics: data.topics || [],
      motivation: data.motivation.trim(),
      status: 'pending',
      created_at: now,
      updated_at: now,
    };

    store.role_applications.unshift(newApp);
    Database.saveStore();
    return newApp;
  }

  public static async findByUserId(userId: number): Promise<RoleApplicationRecord[]> {
    const store = Database.getStore();
    const list = store.role_applications || [];
    return list.filter(a => a.user_id === userId);
  }

  public static async findLatestByUserId(userId: number): Promise<RoleApplicationRecord | null> {
    const store = Database.getStore();
    const list = store.role_applications || [];
    const userApps = list.filter(a => a.user_id === userId);
    return userApps.length > 0 ? userApps[0] : null;
  }

  public static async findById(id: number): Promise<RoleApplicationRecord | null> {
    const store = Database.getStore();
    const list = store.role_applications || [];
    const app = list.find(a => a.application_id === id);
    return app || null;
  }

  public static async findAll(statusFilter?: 'pending' | 'approved' | 'rejected' | 'all'): Promise<RoleApplicationRecord[]> {
    const store = Database.getStore();
    let list = store.role_applications || [];
    if (statusFilter && statusFilter !== 'all') {
      list = list.filter(a => a.status === statusFilter);
    }
    return [...list].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  public static async updateStatus(
    id: number,
    status: 'approved' | 'rejected',
    reviewerId: number,
    feedback?: string
  ): Promise<RoleApplicationRecord | null> {
    const store = Database.getStore();
    const list = store.role_applications || [];
    const app = list.find(a => a.application_id === id);
    if (!app) return null;

    app.status = status;
    app.reviewed_by = reviewerId;
    app.reviewed_at = new Date().toISOString();
    app.updated_at = new Date().toISOString();
    if (feedback) {
      app.feedback = feedback.trim();
    }

    Database.saveStore();
    return app;
  }

  public static async countPending(): Promise<number> {
    const store = Database.getStore();
    const list = store.role_applications || [];
    return list.filter(a => a.status === 'pending').length;
  }
}

