import { Database } from '../config/database';

export class LikeModel {
  public static async findByUserAndPost(userId: number, postId: number) {
    return Database.execute(`SELECT * FROM post_likes WHERE user_id = :1 AND post_id = :2`, [userId, postId]);
  }
}

export class BookmarkModel {
  public static async findByUser(userId: number) {
    const sql = `SELECT b.*, p.title, p.slug, p.excerpt, p.featured_image FROM bookmarks b JOIN posts p ON b.post_id = p.post_id WHERE b.user_id = :1 ORDER BY b.created_at DESC`;
    return Database.execute(sql, [userId]);
  }
}

export class MediaModel {
  public static async findAll() {
    return Database.execute(`SELECT * FROM media ORDER BY created_at DESC`);
  }
}

export class NewsletterModel {
  public static async findAllSubscribers() {
    return Database.execute(`SELECT * FROM newsletter_subscribers ORDER BY subscribed_at DESC`);
  }
}

export class ContactModel {
  public static async findAll() {
    return Database.execute(`SELECT * FROM contact_messages ORDER BY created_at DESC`);
  }
}

export class NotificationModel {
  public static async findByUserId(userId: number) {
    return Database.execute(`SELECT * FROM notifications WHERE user_id = :1 ORDER BY created_at DESC`, [userId]);
  }
}

export class AnalyticsModel {
  public static async getPostViews(postId: number) {
    return Database.execute(`SELECT COUNT(*) AS total_views FROM post_views WHERE post_id = :1`, [postId]);
  }
}

export class SeoModel {
  public static async findByPostId(postId: number) {
    return Database.execute(`SELECT * FROM seo_metadata WHERE post_id = :1`, [postId]);
  }
}

export class SettingModel {
  public static async findAll() {
    return Database.execute(`SELECT * FROM site_settings`);
  }
}

