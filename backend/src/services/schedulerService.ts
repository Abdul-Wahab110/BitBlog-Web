import { Database } from '../config/database';
import { Logger } from '../utils/logger';

export class SchedulerService {
  private static timer: NodeJS.Timeout | null = null;

  public static async processScheduledPosts(): Promise<number> {
    try {
      const store = Database.getStore();
      if (!store || !store.posts) return 0;

      const now = new Date();
      let count = 0;

      for (const post of store.posts) {
        if (
          (post.status === 'scheduled' || (post.status as string) === 'SCHEDULED') &&
          post.scheduled_at
        ) {
          const schedTime = new Date(post.scheduled_at);
          if (schedTime.getTime() <= now.getTime()) {
            post.status = 'published';
            post.published_at = post.scheduled_at || now.toISOString();
            post.updated_at = now.toISOString();
            count++;

            Logger.info(
              `[SchedulerService] Auto-published scheduled article #${post.post_id}: "${post.title}" (target: ${post.scheduled_at})`
            );

            if (store.notifications && post.author_id) {
              store.notifications.unshift({
                notification_id: Date.now() + Math.floor(Math.random() * 1000),
                user_id: post.author_id,
                title: 'Scheduled Article Published',
                message: `Your scheduled article "${post.title}" has been automatically published.`,
                is_read: false,
                created_at: now.toISOString(),
              });
            }
          }
        }
      }

      if (count > 0) {
        Database.saveStore();
      }

      return count;
    } catch (err) {
      Logger.error('[SchedulerService] Error processing scheduled posts:', err);
      return 0;
    }
  }

  public static start(intervalMs = 5000): void {
    if (this.timer) return;

    this.processScheduledPosts();

    this.timer = setInterval(() => {
      this.processScheduledPosts();
    }, intervalMs);

    Logger.info(`[SchedulerService] Background article publishing daemon active (interval: ${intervalMs / 1000}s).`);
  }

  public static stop(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
      Logger.info('[SchedulerService] Background article publishing daemon stopped.');
    }
  }
}

