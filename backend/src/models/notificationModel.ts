import { Database } from '../config/database';

export type NotificationType =
  | 'COMMENT_REPLY'
  | 'COMMENT_MODERATED'
  | 'ARTICLE_SUBMITTED'
  | 'ARTICLE_APPROVED'
  | 'ARTICLE_REJECTED'
  | 'CHANGES_REQUESTED'
  | 'SYSTEM';

export interface NotificationRecord {
  notification_id: number;
  user_id: number;
  type: NotificationType;
  title: string;
  message: string;
  link_url?: string;
  is_read: number; // 0 or 1
  created_at: string;
}

export class NotificationModel {
  public static async findByUser(userId: number): Promise<NotificationRecord[]> {
    const store = Database.getStore();
    const list = (store.notifications || []).filter(n => n.user_id === userId);
    list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    return list.map((n: any) => ({
      notification_id: n.notification_id,
      user_id: n.user_id,
      type: (n.type as NotificationType) || 'SYSTEM',
      title: n.title,
      message: n.message,
      link_url: n.link_url || '',
      is_read: n.is_read ? 1 : 0,
      created_at: n.created_at,
    }));
  }

  public static async createNotification(data: {
    userId: number;
    type: NotificationType;
    title: string;
    message: string;
    linkUrl?: string;
  }): Promise<NotificationRecord> {
    const store = Database.getStore();
    if (!store.notifications) store.notifications = [];

    const now = new Date().toISOString();
    const maxId = store.notifications.reduce((max: number, n: any) => Math.max(max, n.notification_id || 0), 0);
    const newId = maxId + 1;

    const record = {
      notification_id: newId,
      user_id: data.userId,
      type: data.type,
      title: data.title,
      message: data.message,
      link_url: data.linkUrl || '',
      is_read: false,
      created_at: now,
    };

    store.notifications.push(record);
    Database.saveStore();

    return {
      notification_id: newId,
      user_id: data.userId,
      type: data.type,
      title: data.title,
      message: data.message,
      link_url: data.linkUrl,
      is_read: 0,
      created_at: now,
    };
  }

  public static async markAsRead(id: number, userId: number): Promise<void> {
    const store = Database.getStore();
    const n = (store.notifications || []).find(notif => notif.notification_id === id && notif.user_id === userId);
    if (n) {
      n.is_read = true;
      Database.saveStore();
    }
  }
}
