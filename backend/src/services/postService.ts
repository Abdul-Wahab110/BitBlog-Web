import { PostModel, PostRecord, PostStatus } from '../models/postModel';
import { SeoModel } from '../models/seoModel';
import { NotificationModel } from '../models/notificationModel';
import { TagModel } from '../models/tagModel';
import { Database } from '../config/database';
import { PostValidator } from '../validators/postValidator';
import { generateSlug, calculateReadingTime } from '../utils/slug';
import { ApiError } from '../utils/apiError';
import { JwtPayload } from '../types';

export class PostService {
  public static async resolveTags(tagsInput: any): Promise<number[]> {
    if (!tagsInput) return [];
    let rawTags: string[] = [];
    if (typeof tagsInput === 'string') {
      rawTags = tagsInput.split(',').map(s => s.trim()).filter(Boolean);
    } else if (Array.isArray(tagsInput)) {
      rawTags = tagsInput.map(s => typeof s === 'string' ? s.trim() : (s.name || s.slug || String(s))).filter(Boolean);
    }
    const tagIds: number[] = [];
    for (const item of rawTags) {
      if (/^\d+$/.test(item)) {
        const id = parseInt(item);
        const tag = await TagModel.findById(id);
        if (tag && !tagIds.includes(tag.tag_id)) {
          tagIds.push(tag.tag_id);
          continue;
        }
      }
      const slug = item.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      if (!slug) continue;
      let existing = await TagModel.findBySlug(slug);
      if (!existing) {
        existing = await TagModel.createTag(item, slug);
      }
      if (existing && !tagIds.includes(existing.tag_id)) {
        tagIds.push(existing.tag_id);
      }
    }
    return tagIds;
  }
  public static async getPublishedPosts(
    page = 1,
    limit = 10,
    categorySlug?: string,
    search?: string,
    tagSlug?: string,
    authorUsername?: string,
    sort = 'newest'
  ) {
    const safePage = Math.max(1, page);
    const safeLimit = Math.min(50, Math.max(1, limit));
    const offset = (safePage - 1) * safeLimit;

    const result = await PostModel.findPublished(
      safeLimit,
      offset,
      categorySlug,
      search,
      tagSlug,
      authorUsername,
      sort
    );

    const totalPages = Math.ceil(result.total / safeLimit) || 1;

    return {
      posts: result.posts,
      pagination: {
        page: safePage,
        limit: safeLimit,
        total: result.total,
        totalPages,
      },
    };
  }

  public static async getPostBySlug(slug: string, ipHash?: string, userAgent?: string, userId?: number) {
    if (!slug) {
      throw new ApiError('Article slug is required', 400);
    }

    const post = await PostModel.findBySlug(slug);
    if (!post) {
      throw new ApiError(`Article with slug '${slug}' not found`, 404);
    }

    if (post.status === 'draft' || post.status === 'pending_review' || post.status === 'changes_requested' || post.status === 'rejected' || post.status === 'archived') {
      throw new ApiError('This article is not publicly accessible', 403);
    }

    if (post.status === 'scheduled' && post.scheduled_at) {
      if (new Date(post.scheduled_at) > new Date()) {
        throw new ApiError('This scheduled article is not yet available for reading', 403);
      }
    }

    await PostModel.incrementViews(post.post_id, ipHash, userAgent, userId);
    return post;
  }

  public static async getAdminPosts(user: JwtPayload) {
    const isStaff = user.role?.toLowerCase() === 'admin' || user.role?.toLowerCase() === 'editor';
    const authorIdFilter = !isStaff ? user.userId : undefined;
    const posts = await PostModel.findAllAdmin(authorIdFilter);
    return { posts, total: posts.length };
  }

  public static async getPendingPosts() {
    const posts = await PostModel.findAllPending();
    return { posts, total: posts.length };
  }

  public static async getUserArticles(user: JwtPayload) {
    const posts = await PostModel.findUserArticles(user.userId);
    return { posts, total: posts.length };
  }

  public static async getPostByIdForEdit(id: number, user: JwtPayload) {
    const post = await PostModel.findById(id);
    if (!post) {
      throw new ApiError(`Article #${id} not found`, 404);
    }

    const isStaff = user.role === 'Admin' || user.role === 'Editor';
    if (!isStaff && post.author_id !== user.userId) {
      throw new ApiError('Access denied. You can only view and edit your own articles.', 403);
    }

    return post;
  }

  public static async createPost(user: JwtPayload, data: {
    title: string;
    slug?: string;
    excerpt?: string;
    content: string;
    featuredImage?: string;
    categoryId?: number;
    tags?: any;
    tagIds?: number[];
    status?: PostStatus;
    scheduledAt?: string;
    seo?: any;
    aeo?: any;
    geo?: any;
  }) {
    const validationErrors = PostValidator.validatePostPayload(data);
    if (validationErrors.length > 0) {
      throw new ApiError('Article validation failed', 400, validationErrors);
    }

    const isStaff = user.role === 'Admin' || user.role === 'Editor' || user.role === 'Author';
    if (!isStaff) {
      throw new ApiError('Access Denied: Standard readers do not have authoring permissions to write or publish articles. Authoring is restricted to registered Authors, Editors, and Administrators.', 403, ['Readers cannot create articles']);
    }

    let finalStatus: PostStatus = data.status || 'draft';

    if (user.role === 'Author' && (finalStatus === 'published' || !data.status)) {
      finalStatus = 'pending_review';
    }

    const baseSlug = data.slug ? generateSlug(data.slug) : generateSlug(data.title);
    let finalSlug = baseSlug;
    let counter = 1;
    while (await PostModel.findBySlug(finalSlug)) {
      finalSlug = `${baseSlug}-${counter}`;
      counter++;
    }

    const readingTime = calculateReadingTime(data.content);
    const excerpt = data.excerpt && data.excerpt.trim().length > 0
      ? data.excerpt.trim()
      : data.content.replace(/<[^>]*>/g, '').slice(0, 160) + '...';

    const publishedAt = finalStatus === 'published' ? new Date() : undefined;
    const scheduledAt = finalStatus === 'scheduled' && data.scheduledAt ? new Date(data.scheduledAt) : undefined;

    const resolvedTagIds = await this.resolveTags(data.tags || data.tagIds);

    const newPost = await PostModel.createPost({
      authorId: user.userId,
      categoryId: data.categoryId,
      title: data.title.trim(),
      slug: finalSlug,
      excerpt,
      content: data.content,
      featuredImage: data.featuredImage,
      status: finalStatus,
      publishedAt,
      scheduledAt,
      readingTime,
      tagIds: resolvedTagIds,
    });

    if (data.seo || data.aeo || data.geo) {
      await SeoModel.upsertMetadata(newPost.post_id, {
        metaTitle: data.seo?.metaTitle || data.title,
        metaDescription: data.seo?.metaDescription || excerpt,
        canonicalUrl: data.seo?.canonicalUrl,
        ogTitle: data.seo?.ogTitle || data.title,
        ogDescription: data.seo?.ogDescription || excerpt,
        ogImage: data.seo?.ogImage || data.featuredImage,
        robots: data.seo?.robots || 'index, follow',
        directAnswer: data.aeo?.directAnswer,
        keyTakeaways: data.aeo?.keyTakeaways,
        faqData: data.aeo?.faqList ? JSON.stringify(data.aeo.faqList) : undefined,
        howtoData: data.aeo?.howToData ? JSON.stringify(data.aeo.howToData) : undefined,
      });
    }

    if (finalStatus === 'pending_review') {
      await NotificationModel.createNotification({
        userId: user.userId,
        type: 'ARTICLE_SUBMITTED',
        title: 'Article Submitted for Review',
        message: `Your story '${newPost.title}' has been submitted for editorial review.`,
        linkUrl: `/admin/posts`,
      });

      const store = Database.getStore();
      const staffUsers = store.users.filter(u => u.role_id === 1 || u.role_id === 2 || u.role_name === 'Admin' || u.role_name === 'Editor');
      for (const staff of staffUsers) {
        if (staff.user_id !== user.userId) {
          await NotificationModel.createNotification({
            userId: staff.user_id,
            type: 'ARTICLE_SUBMITTED',
            title: `📑 Story Awaiting Review: "${newPost.title}"`,
            message: `${user.name} submitted a new story for editorial review. Review & publish from the post desk.`,
            linkUrl: `/admin/posts`,
          });
        }
      }
    }

    return newPost;
  }

  public static async updatePost(id: number, user: JwtPayload, data: {
    title?: string;
    slug?: string;
    excerpt?: string;
    content?: string;
    featuredImage?: string;
    categoryId?: number;
    tags?: any;
    tagIds?: number[];
    status?: PostStatus;
    scheduledAt?: string;
    reviewerFeedback?: string;
    seo?: any;
    aeo?: any;
    geo?: any;
  }) {
    const existing = await PostModel.findById(id);
    if (!existing) {
      throw new ApiError(`Article #${id} not found`, 404);
    }

    const isStaff = user.role === 'Admin' || user.role === 'Editor';
    if (!isStaff && existing.author_id !== user.userId) {
      throw new ApiError('Access denied. You can only modify your own articles.', 403);
    }

    let finalStatus = existing.status;
    if (isStaff) {
      if (data.status) finalStatus = data.status;
    } else {
      if (data.status === 'published') {
        finalStatus = 'pending_review';
      } else if (data.status) {
        finalStatus = data.status === 'draft' ? 'draft' : 'pending_review';
      }
    }

    const publishedAt = finalStatus === 'published' && !existing.published_at ? new Date().toISOString() : existing.published_at;
    const readingTime = data.content ? calculateReadingTime(data.content) : existing.reading_time;

    const resolvedTagIds = (data.tags !== undefined || data.tagIds !== undefined)
      ? await this.resolveTags(data.tags || data.tagIds)
      : existing.tag_ids;

    const updated = await PostModel.updatePost(id, {
      title: data.title !== undefined ? data.title.trim() : existing.title,
      slug: data.slug !== undefined ? generateSlug(data.slug) : existing.slug,
      excerpt: data.excerpt !== undefined ? data.excerpt.trim() : existing.excerpt,
      content: data.content !== undefined ? data.content : existing.content,
      featured_image: data.featuredImage !== undefined ? data.featuredImage : existing.featured_image,
      category_id: data.categoryId !== undefined ? data.categoryId : existing.category_id,
      status: finalStatus,
      published_at: publishedAt,
      scheduled_at: data.scheduledAt ? new Date(data.scheduledAt).toISOString() : (data.scheduledAt === '' || data.scheduledAt === null ? undefined : existing.scheduled_at),
      reviewer_feedback: data.reviewerFeedback !== undefined ? data.reviewerFeedback : existing.reviewer_feedback,
      reading_time: readingTime,
      tag_ids: resolvedTagIds,
    });

    if (data.seo || data.aeo || data.geo) {
      await SeoModel.upsertMetadata(id, {
        metaTitle: data.seo?.metaTitle,
        metaDescription: data.seo?.metaDescription,
        canonicalUrl: data.seo?.canonicalUrl,
        ogTitle: data.seo?.ogTitle,
        ogDescription: data.seo?.ogDescription,
        ogImage: data.seo?.ogImage,
        robots: data.seo?.robots,
        directAnswer: data.aeo?.directAnswer,
        keyTakeaways: data.aeo?.keyTakeaways,
        faqData: data.aeo?.faqList ? JSON.stringify(data.aeo.faqList) : undefined,
        howtoData: data.aeo?.howToData ? JSON.stringify(data.aeo.howToData) : undefined,
      });
    }

    if (!isStaff && finalStatus === 'pending_review' && existing.status !== 'pending_review') {
      await NotificationModel.createNotification({
        userId: user.userId,
        type: 'ARTICLE_SUBMITTED',
        title: 'Article Resubmitted for Review',
        message: `Your story '${updated?.title}' has been resubmitted for editorial approval.`,
        linkUrl: `/user/articles`,
      });
    }

    if (isStaff && existing.author_id !== user.userId) {
      if (finalStatus === 'draft' && existing.status !== 'draft') {
        await NotificationModel.createNotification({
          userId: existing.author_id,
          type: 'ARTICLE_MOVED_TO_DRAFT',
          title: 'Article Moved to Draft',
          message: `Your article '${existing.title}' was moved to Drafts by ${user.role} (${user.name || user.username || 'Editorial Staff'}).`,
          linkUrl: `/user/articles`,
        });
      } else if (finalStatus !== existing.status) {
        await NotificationModel.createNotification({
          userId: existing.author_id,
          type: 'ARTICLE_UPDATED',
          title: 'Article Status Changed',
          message: `Your article '${existing.title}' status was changed to '${finalStatus.replace(/_/g, ' ')}' by ${user.role}.`,
          linkUrl: `/user/articles`,
        });
      } else {
        await NotificationModel.createNotification({
          userId: existing.author_id,
          type: 'ARTICLE_UPDATED',
          title: 'Article Edited by Editorial Staff',
          message: `Your article '${existing.title}' was modified by ${user.role} (${user.name || user.username || 'Editorial Staff'}).`,
          linkUrl: `/user/articles`,
        });
      }
    }

    return updated;
  }

  public static async approvePost(id: number, adminUser: JwtPayload) {
    const post = await PostModel.findById(id);
    if (!post) throw new ApiError(`Article #${id} not found`, 404);

    const updated = await PostModel.updatePost(id, {
      status: 'published',
      published_at: new Date().toISOString(),
      reviewed_by: adminUser.userId,
      reviewed_at: new Date().toISOString(),
      reviewer_feedback: undefined,
    });

    await NotificationModel.createNotification({
      userId: post.author_id,
      type: 'ARTICLE_APPROVED',
      title: 'Article Approved & Published!',
      message: `Congratulations! Your article '${post.title}' has been approved and published to the public journal.`,
      linkUrl: `/post/${post.slug}`,
    });

    return updated;
  }

  public static async rejectPost(id: number, adminUser: JwtPayload, reason?: string) {
    const post = await PostModel.findById(id);
    if (!post) throw new ApiError(`Article #${id} not found`, 404);

    const feedback = reason?.trim() || 'Submission does not meet current publication guidelines.';

    const updated = await PostModel.updatePost(id, {
      status: 'rejected',
      reviewed_by: adminUser.userId,
      reviewed_at: new Date().toISOString(),
      reviewer_feedback: feedback,
    });

    await NotificationModel.createNotification({
      userId: post.author_id,
      type: 'ARTICLE_REJECTED',
      title: 'Article Submission Status',
      message: `Your submission for '${post.title}' was rejected. Reason: ${feedback}`,
      linkUrl: `/user/articles`,
    });

    return updated;
  }

  public static async requestChangesPost(id: number, adminUser: JwtPayload, feedback: string) {
    const post = await PostModel.findById(id);
    if (!post) throw new ApiError(`Article #${id} not found`, 404);

    const message = feedback?.trim() || 'Editorial revisions requested before publication.';

    const updated = await PostModel.updatePost(id, {
      status: 'changes_requested',
      reviewed_by: adminUser.userId,
      reviewed_at: new Date().toISOString(),
      reviewer_feedback: message,
    });

    await NotificationModel.createNotification({
      userId: post.author_id,
      type: 'CHANGES_REQUESTED',
      title: 'Revisions Requested for Article',
      message: `Editorial changes requested for '${post.title}': ${message}`,
      linkUrl: `/user/articles/edit/${id}`,
    });

    return updated;
  }

  public static async deletePost(id: number, user: JwtPayload) {
    const post = await PostModel.findById(id);
    if (!post) throw new ApiError(`Article #${id} not found`, 404);

    const isStaff = user.role === 'Admin' || user.role === 'Editor';
    if (!isStaff && post.author_id !== user.userId) {
      throw new ApiError('Access denied. You can only delete your own draft or rejected articles.', 403);
    }

    await PostModel.deletePost(id);
    return { message: `Article #${id} deleted successfully` };
  }
}

