import { Database } from '../config/database';
import { SchedulerService } from '../services/schedulerService';

export type PostStatus =
  | 'draft'
  | 'pending_review'
  | 'changes_requested'
  | 'rejected'
  | 'published'
  | 'scheduled'
  | 'archived';

export interface PostRecord {
  post_id: number;
  author_id: number;
  author_name: string;
  author_username: string;
  author_avatar?: string;
  category_id?: number;
  category_name?: string;
  category_slug?: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  featured_image?: string;
  status: PostStatus;
  published_at?: string;
  scheduled_at?: string;
  reviewer_feedback?: string;
  reviewed_by?: number;
  reviewed_at?: string;
  reading_time: number;
  views_count: number;
  comment_count: number;
  like_count: number;
  created_at: string;
  updated_at: string;
  tags?: Array<{ tag_id: number; name: string; slug: string }>;
  tag_ids?: number[];
}

export class PostModel {
  public static async findPublished(
    limit = 10,
    offset = 0,
    categorySlug?: string,
    search?: string,
    tagSlug?: string,
    authorUsername?: string,
    sort = 'newest'
  ): Promise<{ posts: PostRecord[]; total: number }> {
    await SchedulerService.processScheduledPosts();
    const store = Database.getStore();

    let list = store.posts.filter(p => p.status === 'published');

    if (categorySlug) {
      list = list.filter(p => p.category_slug?.toLowerCase() === categorySlug.toLowerCase());
    }

    if (authorUsername) {
      const q = String(authorUsername).trim().toLowerCase();
      // Try to find the user if q is user_id, username, or name
      const matchedUser = (store.users || []).find(
        u => String(u.user_id) === q || u.username?.toLowerCase() === q || u.name?.toLowerCase() === q
      );

      list = list.filter(p => {
        if (matchedUser) {
          return (
            p.author_id === matchedUser.user_id ||
            p.author_username?.toLowerCase() === matchedUser.username?.toLowerCase() ||
            p.author_name?.toLowerCase() === matchedUser.name?.toLowerCase()
          );
        }
        return (
          String(p.author_id) === q ||
          p.author_username?.toLowerCase() === q ||
          p.author_name?.toLowerCase() === q
        );
      });
    }

    if (tagSlug) {
      const normalizedTag = tagSlug.trim().toLowerCase();
      const tag = (store.tags || []).find(t => t.slug.toLowerCase() === normalizedTag || t.name.toLowerCase() === normalizedTag);
      if (tag) {
        list = list.filter(p => p.tag_ids?.includes(tag.tag_id));
      } else {
        list = list.filter(p =>
          p.title.toLowerCase().includes(normalizedTag) ||
          p.excerpt.toLowerCase().includes(normalizedTag) ||
          p.content.toLowerCase().includes(normalizedTag)
        );
      }
    }

    if (search && search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(
        p =>
          p.title.toLowerCase().includes(q) ||
          p.excerpt.toLowerCase().includes(q) ||
          p.content.toLowerCase().includes(q) ||
          p.author_name.toLowerCase().includes(q) ||
          p.category_name?.toLowerCase().includes(q)
      );
    }

    // Sort
    switch (sort.toLowerCase()) {
      case 'oldest':
        list.sort((a, b) => new Date(a.published_at || a.created_at).getTime() - new Date(b.published_at || b.created_at).getTime());
        break;
      case 'most_viewed':
      case 'views':
        list.sort((a, b) => b.views_count - a.views_count);
        break;
      case 'a-z':
        list.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case 'z-a':
        list.sort((a, b) => b.title.localeCompare(a.title));
        break;
      case 'newest':
      default:
        list.sort((a, b) => new Date(b.published_at || b.created_at).getTime() - new Date(a.published_at || a.created_at).getTime());
        break;
    }

    const total = list.length;
    const lookup = this.buildMetaLookup(store);
    const paginated = list.slice(offset, offset + limit).map(p => this.attachMeta(p, store, lookup));

    return { posts: paginated, total };
  }

  public static async findBySlug(slug: string): Promise<PostRecord | null> {
    const store = Database.getStore();
    const post = store.posts.find(p => p.slug.toLowerCase() === slug.trim().toLowerCase());
    if (!post) return null;
    return this.attachMeta(post, store);
  }

  public static async findById(id: number): Promise<PostRecord | null> {
    const store = Database.getStore();
    const post = store.posts.find(p => p.post_id === id);
    if (!post) return null;
    return this.attachMeta(post, store);
  }

  public static async findAllAdmin(authorId?: number): Promise<PostRecord[]> {
    return this.findAdminArticles(authorId);
  }

  public static async findAdminArticles(authorId?: number): Promise<PostRecord[]> {
    await SchedulerService.processScheduledPosts();
    const store = Database.getStore();
    let list = [...store.posts];
    if (authorId) {
      list = list.filter(p => p.author_id === authorId);
    }
    list.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
    const lookup = this.buildMetaLookup(store);
    return list.map(p => this.attachMeta(p, store, lookup));
  }

  public static async findAllPending(): Promise<PostRecord[]> {
    const store = Database.getStore();
    const list = store.posts.filter(p => p.status === 'pending_review');
    list.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
    const lookup = this.buildMetaLookup(store);
    return list.map(p => this.attachMeta(p, store, lookup));
  }

  public static async findUserArticles(userId: number): Promise<PostRecord[]> {
    const store = Database.getStore();
    const list = store.posts.filter(p => p.author_id === userId);
    list.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
    const lookup = this.buildMetaLookup(store);
    return list.map(p => this.attachMeta(p, store, lookup));
  }

  public static async countPending(): Promise<number> {
    const store = Database.getStore();
    return store.posts.filter(p => p.status === 'pending_review').length;
  }

  public static async createPost(data: {
    authorId: number;
    categoryId?: number;
    title: string;
    slug: string;
    excerpt: string;
    content: string;
    featuredImage?: string;
    status: PostStatus;
    publishedAt?: Date;
    scheduledAt?: Date;
    readingTime: number;
    tagIds?: number[];
  }): Promise<PostRecord> {
    const store = Database.getStore();
    const now = new Date().toISOString();

    const author = (store.users || []).find((u: any) => u.user_id === data.authorId);
    const category = data.categoryId
      ? (store.categories || []).find((c: any) => c.category_id === data.categoryId)
      : undefined;

    const newPostId = store.posts.length > 0
      ? Math.max(...store.posts.map(p => p.post_id || 0)) + 1
      : 1;

    const newPost: any = {
      post_id: newPostId,
      author_id: data.authorId,
      author_name: author?.name || 'Staff Writer',
      author_username: author?.username || 'staff',
      author_avatar: author?.profile_image || '',
      category_id: data.categoryId,
      category_name: category?.name,
      category_slug: category?.slug,
      title: data.title,
      slug: data.slug,
      excerpt: data.excerpt,
      content: data.content,
      featured_image: data.featuredImage,
      status: data.status,
      published_at: data.publishedAt ? data.publishedAt.toISOString() : (data.status === 'published' ? now : undefined),
      scheduled_at: data.scheduledAt ? data.scheduledAt.toISOString() : undefined,
      reading_time: data.readingTime || 3,
      views_count: 0,
      comment_count: 0,
      like_count: 0,
      created_at: now,
      updated_at: now,
      tag_ids: data.tagIds || [],
    };

    store.posts.unshift(newPost);
    Database.saveStore();

    return this.attachMeta(newPost, store);
  }

  public static async updatePost(
    id: number,
    data: any
  ): Promise<PostRecord | null> {
    const store = Database.getStore();
    const postIndex = store.posts.findIndex(p => p.post_id === id);
    if (postIndex === -1) return null;

    const post = store.posts[postIndex];
    const now = new Date().toISOString();

    if (data.title !== undefined) post.title = data.title;
    if (data.slug !== undefined) post.slug = data.slug;
    if (data.excerpt !== undefined) post.excerpt = data.excerpt;
    if (data.content !== undefined) post.content = data.content;

    const featuredImg = data.featuredImage !== undefined ? data.featuredImage : data.featured_image;
    if (featuredImg !== undefined) post.featured_image = featuredImg;

    if (data.status !== undefined) {
      post.status = data.status;
      if (data.status === 'published' && !post.published_at) {
        post.published_at = now;
      }
    }

    const pubAt = data.publishedAt !== undefined ? data.publishedAt : data.published_at;
    if (pubAt !== undefined) {
      post.published_at = pubAt instanceof Date ? pubAt.toISOString() : pubAt;
    }

    const schAt = data.scheduledAt !== undefined ? data.scheduledAt : data.scheduled_at;
    if (schAt !== undefined) {
      post.scheduled_at = schAt instanceof Date ? schAt.toISOString() : schAt;
    }

    const readTime = data.readingTime !== undefined ? data.readingTime : data.reading_time;
    if (readTime !== undefined) post.reading_time = readTime;

    const revFeedback = data.reviewerFeedback !== undefined ? data.reviewerFeedback : data.reviewer_feedback;
    if (revFeedback !== undefined) post.reviewer_feedback = revFeedback;

    const revBy = data.reviewedBy !== undefined ? data.reviewedBy : data.reviewed_by;
    if (revBy !== undefined) post.reviewed_by = revBy;

    const revAt = data.reviewedAt !== undefined ? data.reviewedAt : data.reviewed_at;
    if (revAt !== undefined) {
      post.reviewed_at = revAt instanceof Date ? revAt.toISOString() : revAt;
    }

    const tIds = data.tagIds !== undefined ? data.tagIds : data.tag_ids;
    if (tIds !== undefined) post.tag_ids = tIds;

    const catId = data.categoryId !== undefined ? data.categoryId : data.category_id;
    if (catId !== undefined) {
      post.category_id = catId;
      const category = (store.categories || []).find((c: any) => c.category_id === catId);
      post.category_name = category?.name;
      post.category_slug = category?.slug;
    }

    post.updated_at = now;
    Database.saveStore();
    return this.attachMeta(post, store);
  }

  public static async deletePost(id: number): Promise<boolean> {
    const store = Database.getStore();
    store.posts = store.posts.filter(p => p.post_id !== id);
    store.comments = store.comments.filter(c => c.post_id !== id);
    store.likes = store.likes.filter(l => l.post_id !== id);
    store.bookmarks = store.bookmarks.filter(b => b.post_id !== id);
    Database.saveStore();
    return true;
  }

  public static async incrementViews(id: number, ipHash?: string, userAgent?: string, userId?: number): Promise<void> {
    const store = Database.getStore();
    const post = store.posts.find(p => p.post_id === id);
    if (post) {
      post.views_count = (post.views_count || 0) + 1;
      Database.saveStore();
    }
  }

  private static buildMetaLookup(store: any) {
    const commentCountMap = new Map<number, number>();
    for (const c of (store.comments || [])) {
      if (c.status === 'APPROVED') {
        commentCountMap.set(c.post_id, (commentCountMap.get(c.post_id) || 0) + 1);
      }
    }

    const likeCountMap = new Map<number, number>();
    for (const l of (store.likes || [])) {
      likeCountMap.set(l.post_id, (likeCountMap.get(l.post_id) || 0) + 1);
    }

    const tagMap = new Map<number, { tag_id: number; name: string; slug: string }>();
    for (const t of (store.tags || [])) {
      tagMap.set(t.tag_id, { tag_id: t.tag_id, name: t.name, slug: t.slug });
    }

    return { commentCountMap, likeCountMap, tagMap };
  }

  private static attachMeta(
    post: PostRecord,
    store: any,
    lookup?: {
      commentCountMap: Map<number, number>;
      likeCountMap: Map<number, number>;
      tagMap: Map<number, { tag_id: number; name: string; slug: string }>;
    }
  ): PostRecord {
    if (lookup) {
      const tags = (post.tag_ids || []).map(tid => lookup.tagMap.get(tid)).filter(Boolean);
      return {
        ...post,
        comment_count: lookup.commentCountMap.get(post.post_id) || 0,
        like_count: lookup.likeCountMap.get(post.post_id) || 0,
        tags: tags as any,
      };
    }

    const comments = store.comments?.filter((c: any) => c.post_id === post.post_id && c.status === 'APPROVED') || [];
    const likes = store.likes?.filter((l: any) => l.post_id === post.post_id) || [];
    const tags = (post.tag_ids || []).map((tid: number) => {
      const tag = store.tags?.find((t: any) => t.tag_id === tid);
      return tag ? { tag_id: tag.tag_id, name: tag.name, slug: tag.slug } : null;
    }).filter(Boolean);

    return {
      ...post,
      comment_count: comments.length,
      like_count: likes.length,
      tags: tags as any,
    };
  }
}
