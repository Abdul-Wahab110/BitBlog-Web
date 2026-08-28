import { Database } from '../config/database';
import { PostModel, PostRecord } from './postModel';

export class BookmarkModel {
  public static async isBookmarked(userId: number, postId: number): Promise<boolean> {
    const store = Database.getStore();
    return (store.bookmarks || []).some(b => b.user_id === userId && b.post_id === postId);
  }

  public static async toggleBookmark(userId: number, postId: number): Promise<{ bookmarked: boolean }> {
    const store = Database.getStore();
    if (!store.bookmarks) store.bookmarks = [];

    const existingIdx = store.bookmarks.findIndex(b => b.user_id === userId && b.post_id === postId);
    let bookmarked = false;

    if (existingIdx !== -1) {
      store.bookmarks.splice(existingIdx, 1);
      bookmarked = false;
    } else {
      const maxId = store.bookmarks.reduce((max, b) => Math.max(max, b.bookmark_id || 0), 0);
      store.bookmarks.push({
        bookmark_id: maxId + 1,
        user_id: userId,
        post_id: postId,
        created_at: new Date().toISOString(),
      });
      bookmarked = true;
    }

    Database.saveStore();
    return { bookmarked };
  }

  public static async findByUser(userId: number): Promise<PostRecord[]> {
    const store = Database.getStore();
    const userBookmarks = (store.bookmarks || []).filter(b => b.user_id === userId);
    const postIds = userBookmarks.map(b => b.post_id);

    const posts: PostRecord[] = [];
    for (const pid of postIds) {
      const p = await PostModel.findById(pid);
      if (p) posts.push(p);
    }
    return posts;
  }
}
