import { Database } from '../config/database';

export interface CommentRecord {
  comment_id: number;
  post_id: number;
  post_title?: string;
  post_slug?: string;
  user_id?: number;
  author_name: string;
  author_email: string;
  author_avatar?: string;
  parent_comment_id?: number;
  content: string;
  status: 'pending' | 'approved' | 'rejected' | 'spam';
  created_at: string;
  updated_at: string;
  replies?: CommentRecord[];
}

export class CommentModel {
  public static async findApprovedByPost(postId: number): Promise<CommentRecord[]> {
    const store = Database.getStore();
    const list = (store.comments || []).filter(c => c.post_id === postId && c.status === 'APPROVED');

    const mapped = list.map(c => {
      const u = c.user_id ? store.users.find(usr => usr.user_id === c.user_id) : undefined;
      return {
        comment_id: c.comment_id,
        post_id: c.post_id,
        user_id: c.user_id,
        author_name: u?.name || c.author_name || 'Reader',
        author_email: u?.email || 'reader@bitblog.com',
        author_avatar: u?.profile_image,
        parent_comment_id: c.parent_comment_id,
        content: c.content,
        status: (c.status.toLowerCase() as any) || 'approved',
        created_at: c.created_at,
        updated_at: c.updated_at,
      };
    });

    mapped.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
    return mapped;
  }

  public static async findByUser(userId: number): Promise<CommentRecord[]> {
    const store = Database.getStore();
    const list = (store.comments || []).filter(c => c.user_id === userId);

    return list.map(c => {
      const p = store.posts.find(post => post.post_id === c.post_id);
      return {
        comment_id: c.comment_id,
        post_id: c.post_id,
        post_title: p?.title,
        post_slug: p?.slug,
        user_id: c.user_id,
        author_name: c.author_name || 'You',
        author_email: '',
        parent_comment_id: c.parent_comment_id,
        content: c.content,
        status: (c.status.toLowerCase() as any) || 'approved',
        created_at: c.created_at,
        updated_at: c.updated_at,
      };
    });
  }

  public static async findAllAdmin(statusFilter?: string): Promise<CommentRecord[]> {
    const store = Database.getStore();
    let list = [...(store.comments || [])];

    if (statusFilter && statusFilter !== 'all') {
      list = list.filter(c => c.status.toLowerCase() === statusFilter.toLowerCase());
    }

    list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    return list.map(c => {
      const p = store.posts.find(post => post.post_id === c.post_id);
      const u = c.user_id ? store.users.find(usr => usr.user_id === c.user_id) : undefined;
      return {
        comment_id: c.comment_id,
        post_id: c.post_id,
        post_title: p?.title,
        post_slug: p?.slug,
        user_id: c.user_id,
        author_name: u?.name || c.author_name || 'Guest',
        author_email: u?.email || 'guest@anon.com',
        author_avatar: u?.profile_image,
        parent_comment_id: c.parent_comment_id,
        content: c.content,
        status: (c.status.toLowerCase() as any) || 'approved',
        created_at: c.created_at,
        updated_at: c.updated_at,
      };
    });
  }

  public static async findById(id: number): Promise<CommentRecord | null> {
    const store = Database.getStore();
    const c = (store.comments || []).find(cmt => cmt.comment_id === id);
    if (!c) return null;
    return { ...c } as any;
  }

  public static async createComment(data: {
    postId: number;
    userId?: number;
    parentCommentId?: number;
    content: string;
    status?: 'pending' | 'approved' | 'rejected' | 'spam';
  }): Promise<CommentRecord> {
    const store = Database.getStore();
    if (!store.comments) store.comments = [];

    const now = new Date().toISOString();
    const maxId = store.comments.reduce((max, c) => Math.max(max, c.comment_id), 0);
    const newId = maxId + 1;
    const user = data.userId ? store.users.find(u => u.user_id === data.userId) : undefined;
    const defaultStatus = data.status ? (data.status.toUpperCase() as any) : 'APPROVED';

    const record: any = {
      comment_id: newId,
      post_id: data.postId,
      user_id: data.userId || 0,
      parent_comment_id: data.parentCommentId,
      author_name: user?.name || 'Reader',
      author_username: user?.username || 'reader',
      author_avatar: user?.profile_image,
      content: data.content.trim(),
      status: defaultStatus,
      created_at: now,
      updated_at: now,
    };

    store.comments.push(record);
    Database.saveStore();

    return {
      comment_id: newId,
      post_id: data.postId,
      user_id: data.userId,
      author_name: user?.name || 'Reader',
      author_email: user?.email || 'reader@bitblog.com',
      author_avatar: user?.profile_image,
      parent_comment_id: data.parentCommentId,
      content: data.content.trim(),
      status: 'approved',
      created_at: now,
      updated_at: now,
    };
  }

  public static async updateComment(id: number, content: string): Promise<CommentRecord | null> {
    const store = Database.getStore();
    const c = (store.comments || []).find(cmt => cmt.comment_id === id);
    if (!c) return null;

    c.content = content.trim();
    c.updated_at = new Date().toISOString();
    Database.saveStore();
    return c as any;
  }

  public static async updateStatus(id: number, status: 'pending' | 'approved' | 'rejected' | 'spam'): Promise<CommentRecord | null> {
    const store = Database.getStore();
    const c = (store.comments || []).find(cmt => cmt.comment_id === id);
    if (!c) return null;

    c.status = (status.toUpperCase() as any);
    c.updated_at = new Date().toISOString();
    Database.saveStore();
    return c as any;
  }

  public static async deleteComment(id: number): Promise<boolean> {
    const store = Database.getStore();
    store.comments = (store.comments || []).filter(c => c.comment_id !== id && c.parent_comment_id !== id);
    Database.saveStore();
    return true;
  }
}

