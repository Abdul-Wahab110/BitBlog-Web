import { Database } from '../config/database';

export interface NewsletterSubscriber {
  subscriber_id: number;
  email: string;
  name?: string;
  topics?: string[];
  status: 'SUBSCRIBED' | 'UNSUBSCRIBED' | 'PENDING' | 'REJECTED';
  subscribed_at: string;
  unsubscribed_at?: string;
  notes?: string;
}

export class NewsletterModel {
  public static async findByEmail(email: string): Promise<NewsletterSubscriber | null> {
    const store = Database.getStore();
    const normalized = email.trim().toLowerCase();
    const sub = (store.subscribers || []).find(s => s.email.toLowerCase() === normalized);
    if (!sub) return null;
    return {
      subscriber_id: sub.subscriber_id,
      email: sub.email,
      name: sub.name || '',
      topics: sub.topics || [],
      status: (sub.status as any) || 'SUBSCRIBED',
      subscribed_at: sub.subscribed_at || sub.created_at || new Date().toISOString(),
      unsubscribed_at: sub.unsubscribed_at,
      notes: sub.notes || '',
    };
  }

  public static async findById(id: number): Promise<NewsletterSubscriber | null> {
    const store = Database.getStore();
    const sub = (store.subscribers || []).find(s => s.subscriber_id === id);
    if (!sub) return null;
    return {
      subscriber_id: sub.subscriber_id,
      email: sub.email,
      name: sub.name || '',
      topics: sub.topics || [],
      status: (sub.status as any) || 'SUBSCRIBED',
      subscribed_at: sub.subscribed_at || sub.created_at || new Date().toISOString(),
      unsubscribed_at: sub.unsubscribed_at,
      notes: sub.notes || '',
    };
  }

  public static async subscribe(payload: string | { email: string; name?: string; topics?: string[] }): Promise<{ status: 'subscribed' | 'already_subscribed'; subscriber: NewsletterSubscriber }> {
    const store = Database.getStore();
    if (!store.subscribers) store.subscribers = [];

    const data = typeof payload === 'string' ? { email: payload } : payload;
    const normalized = data.email.trim().toLowerCase();
    const existing = (store.subscribers || []).find(s => s.email.toLowerCase() === normalized);

    if (existing) {
      if (existing.status === 'UNSUBSCRIBED' || existing.status === 'REJECTED') {
        existing.status = 'PENDING';
        if (data.name) existing.name = data.name.trim();
        if (data.topics && Array.isArray(data.topics) && data.topics.length > 0) {
          existing.topics = Array.from(new Set([...(existing.topics || []), ...data.topics]));
        }
        existing.created_at = new Date().toISOString();
        existing.subscribed_at = new Date().toISOString();
        Database.saveStore();
        return {
          status: 'subscribed',
          subscriber: {
            subscriber_id: existing.subscriber_id,
            email: existing.email,
            name: existing.name || '',
            topics: existing.topics || [],
            status: 'PENDING',
            subscribed_at: existing.subscribed_at,
            notes: existing.notes || '',
          },
        };
      }

      if (data.name) existing.name = data.name.trim();
      if (data.topics && Array.isArray(data.topics) && data.topics.length > 0) {
        existing.topics = Array.from(new Set([...(existing.topics || []), ...data.topics]));
      }
      Database.saveStore();

      return {
        status: 'already_subscribed',
        subscriber: {
          subscriber_id: existing.subscriber_id,
          email: existing.email,
          name: existing.name || '',
          topics: existing.topics || [],
          status: (existing.status as any) || 'PENDING',
          subscribed_at: existing.subscribed_at || existing.created_at || new Date().toISOString(),
          notes: existing.notes || '',
        },
      };
    }

    const maxId = store.subscribers.reduce((max, s) => Math.max(max, s.subscriber_id || 0), 0);
    const newId = maxId + 1;
    const now = new Date().toISOString();

    const newSub = {
      subscriber_id: newId,
      email: normalized,
      name: data.name?.trim() || '',
      topics: data.topics || ['Technology & AI', 'Weekly Digest'],
      status: 'PENDING' as const,
      created_at: now,
      subscribed_at: now,
      notes: '',
    };

    store.subscribers.push(newSub);
    Database.saveStore();

    return {
      status: 'subscribed',
      subscriber: {
        subscriber_id: newId,
        email: normalized,
        name: newSub.name,
        topics: newSub.topics,
        status: 'PENDING',
        subscribed_at: now,
        notes: '',
      },
    };
  }

  public static async create(data: { email: string; name?: string; status?: 'SUBSCRIBED' | 'UNSUBSCRIBED' | 'PENDING' | 'REJECTED'; topics?: string[]; notes?: string }): Promise<NewsletterSubscriber> {
    const store = Database.getStore();
    if (!store.subscribers) store.subscribers = [];

    const normalized = data.email.trim().toLowerCase();
    const existing = (store.subscribers || []).find(s => s.email.toLowerCase() === normalized);
    if (existing) {
      throw new Error('A subscriber with this email address already exists');
    }

    const maxId = store.subscribers.reduce((max, s) => Math.max(max, s.subscriber_id || 0), 0);
    const newId = maxId + 1;
    const now = new Date().toISOString();

    const newSub = {
      subscriber_id: newId,
      email: normalized,
      name: data.name?.trim() || '',
      topics: data.topics || ['General'],
      status: data.status || 'PENDING',
      created_at: now,
      subscribed_at: now,
      notes: data.notes?.trim() || '',
    };

    store.subscribers.push(newSub);
    Database.saveStore();

    return {
      subscriber_id: newId,
      email: normalized,
      name: newSub.name,
      topics: newSub.topics,
      status: (newSub.status as any) || 'PENDING',
      subscribed_at: now,
      notes: newSub.notes,
    };
  }

  public static async update(id: number, data: Partial<{ email: string; name: string; status: 'SUBSCRIBED' | 'UNSUBSCRIBED' | 'PENDING' | 'REJECTED'; topics: string[]; notes: string }>): Promise<NewsletterSubscriber | null> {
    const store = Database.getStore();
    const sub = (store.subscribers || []).find(s => s.subscriber_id === id);
    if (!sub) return null;

    if (data.email !== undefined) {
      const normalized = data.email.trim().toLowerCase();
      const duplicate = (store.subscribers || []).find(s => s.subscriber_id !== id && s.email.toLowerCase() === normalized);
      if (duplicate) {
        throw new Error('Email address is already in use by another subscriber');
      }
      sub.email = normalized;
    }

    if (data.name !== undefined) sub.name = data.name.trim();
    if (data.status !== undefined) {
      sub.status = data.status;
      if (data.status === 'UNSUBSCRIBED' || data.status === 'REJECTED') {
        sub.unsubscribed_at = new Date().toISOString();
      }
    }
    if (data.topics !== undefined) sub.topics = data.topics;
    if (data.notes !== undefined) sub.notes = data.notes;

    Database.saveStore();

    return {
      subscriber_id: sub.subscriber_id,
      email: sub.email,
      name: sub.name || '',
      topics: sub.topics || [],
      status: (sub.status as any) || 'SUBSCRIBED',
      subscribed_at: sub.subscribed_at || sub.created_at || new Date().toISOString(),
      unsubscribed_at: sub.unsubscribed_at,
      notes: sub.notes || '',
    };
  }

  public static async approve(id: number): Promise<NewsletterSubscriber | null> {
    return this.update(id, { status: 'SUBSCRIBED' });
  }

  public static async reject(id: number): Promise<NewsletterSubscriber | null> {
    return this.update(id, { status: 'REJECTED' });
  }

  public static async updateStatus(id: number, status: 'SUBSCRIBED' | 'UNSUBSCRIBED' | 'PENDING' | 'REJECTED'): Promise<NewsletterSubscriber | null> {
    return this.update(id, { status });
  }

  public static async delete(id: number): Promise<boolean> {
    const store = Database.getStore();
    const index = (store.subscribers || []).findIndex(s => s.subscriber_id === id);
    if (index === -1) return false;

    store.subscribers.splice(index, 1);
    Database.saveStore();
    return true;
  }

  public static async unsubscribe(email: string): Promise<boolean> {
    const store = Database.getStore();
    const normalized = email.trim().toLowerCase();
    const existing = (store.subscribers || []).find(s => s.email.toLowerCase() === normalized);
    if (!existing) return false;

    existing.status = 'UNSUBSCRIBED';
    existing.unsubscribed_at = new Date().toISOString();
    Database.saveStore();
    return true;
  }

  public static async findAll(filter?: { search?: string; status?: string }): Promise<{ subscribers: NewsletterSubscriber[]; stats: { total: number; active: number; unsubscribed: number; pending: number; rejected: number } }> {
    const store = Database.getStore();
    let list = [...(store.subscribers || [])];

    const stats = {
      total: list.length,
      active: list.filter(s => s.status === 'SUBSCRIBED').length,
      unsubscribed: list.filter(s => s.status === 'UNSUBSCRIBED').length,
      pending: list.filter(s => s.status === 'PENDING' || (!s.status && s.status !== 'SUBSCRIBED')).length,
      rejected: list.filter(s => s.status === 'REJECTED').length,
    };

    if (filter?.status && filter.status !== 'ALL') {
      list = list.filter(s => (s.status || 'PENDING') === filter.status);
    }

    if (filter?.search) {
      const q = filter.search.toLowerCase().trim();
      list = list.filter(s =>
        s.email.toLowerCase().includes(q) ||
        (s.name && s.name.toLowerCase().includes(q)) ||
        (s.topics && s.topics.some((t: string) => t.toLowerCase().includes(q)))
      );
    }

    list.sort((a, b) => new Date(b.subscribed_at || b.created_at || 0).getTime() - new Date(a.subscribed_at || a.created_at || 0).getTime());

    const subscribers: NewsletterSubscriber[] = list.map(s => ({
      subscriber_id: s.subscriber_id,
      email: s.email,
      name: s.name || '',
      topics: s.topics || [],
      status: (s.status as any) || 'PENDING',
      subscribed_at: s.subscribed_at || s.created_at || new Date().toISOString(),
      unsubscribed_at: s.unsubscribed_at,
      notes: s.notes || '',
    }));

    return { subscribers, stats };
  }
}

