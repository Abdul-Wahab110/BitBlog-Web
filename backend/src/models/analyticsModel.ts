import crypto from 'crypto';
import { Database } from '../config/database';

export class AnalyticsModel {
  public static hashIp(ip: string): string {
    const salt = process.env.JWT_SECRET || 'bitblog-secret-salt';
    return crypto.createHash('sha256').update(ip + salt).digest('hex');
  }

  public static async recordView(postId: number, ip: string, userAgent?: string, userId?: number): Promise<void> {
    const store = Database.getStore();
    const post = store.posts.find(p => p.post_id === postId);
    if (post) {
      post.views_count = (post.views_count || 0) + 1;
      Database.saveStore();
    }
  }

  public static async getAnalyticsMetrics() {
    const store = Database.getStore();
    const published = store.posts.filter(p => p.status === 'published');
    const totalViews = store.posts.reduce((sum, p) => sum + (p.views_count || 0), 0);

    const popularArticles = [...published]
      .sort((a, b) => (b.views_count || 0) - (a.views_count || 0))
      .slice(0, 5)
      .map(p => ({
        POST_ID: p.post_id,
        TITLE: p.title,
        SLUG: p.slug,
        VIEWS_COUNT: p.views_count || 0,
      }));

    const categoryCountMap = new Map<number, number>();
    for (const p of published) {
      if (p.category_id) {
        categoryCountMap.set(p.category_id, (categoryCountMap.get(p.category_id) || 0) + 1);
      }
    }

    const categoryStatistics = (store.categories || []).map(c => ({
      CATEGORY_NAME: c.name,
      ARTICLE_COUNT: categoryCountMap.get(c.category_id) || 0,
    }));

    return {
      totalViews,
      publishedArticles: published.length,
      popularArticles,
      categoryStatistics,
    };
  }
}

