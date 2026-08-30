import { Database } from '../config/database';

export class LikeModel {
  public static async isLiked(postId: number, userId: number): Promise<boolean> {
    const store = Database.getStore();
    return (store.likes || []).some(l => l.post_id === postId && l.user_id === userId);
  }

  public static async toggleLike(postId: number, userId: number): Promise<{ liked: boolean; totalLikes: number }> {
    const store = Database.getStore();
    if (!store.likes) store.likes = [];

    const existingIdx = store.likes.findIndex(l => l.post_id === postId && l.user_id === userId);
    let liked = false;

    if (existingIdx !== -1) {
      store.likes.splice(existingIdx, 1);
      liked = false;
    } else {
      const maxId = store.likes.reduce((max, l) => Math.max(max, l.like_id || 0), 0);
      store.likes.push({
        like_id: maxId + 1,
        post_id: postId,
        user_id: userId,
        created_at: new Date().toISOString(),
      });
      liked = true;
    }

    const totalLikes = store.likes.filter(l => l.post_id === postId).length;

    const post = store.posts.find(p => p.post_id === postId);
    if (post) {
      post.like_count = totalLikes;
    }

    Database.saveStore();
    return { liked, totalLikes };
  }
}

