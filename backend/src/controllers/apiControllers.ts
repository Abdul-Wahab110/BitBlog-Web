import { Request, Response, NextFunction } from 'express';
import { Database } from '../config/database';
import { SeoModel } from '../models/seoModel';
import { SettingModel } from '../models/settingModel';
import { NewsletterModel } from '../models/newsletterModel';
import { ContactModel } from '../models/contactModel';
import { AnalyticsModel } from '../models/analyticsModel';
import { SitemapService } from '../services/sitemapService';
import { RobotsService } from '../services/robotsService';
import { UserModel } from '../models/userModel';
import { TagModel } from '../models/tagModel';
import { LikeModel } from '../models/likeModel';
import { BookmarkModel } from '../models/bookmarkModel';
import { NotificationModel } from '../models/notificationModel';
import { ResponseUtil } from '../utils/apiResponse';
import { AuthenticatedRequest } from '../types';
import { comparePassword, hashPassword } from '../utils/password';

export class UserController {
  public static async getUsers(req: Request, res: Response): Promise<void> {
    const count = await UserModel.countAll();
    ResponseUtil.success(res, { count }, 'System users count retrieved');
  }

  public static async getProfile(req: AuthenticatedRequest, res: Response): Promise<void> {
    if (!req.user) {
      ResponseUtil.error(res, 'Unauthenticated user context', 401);
      return;
    }
    const user = await UserModel.findById(req.user.userId);
    if (!user) {
      ResponseUtil.error(res, 'User profile not found', 404);
      return;
    }
    const { password_hash, ...safeProfile } = user;
    ResponseUtil.success(res, safeProfile, 'Profile details retrieved');
  }

  public static async updateProfile(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        ResponseUtil.error(res, 'Unauthenticated user context', 401);
        return;
      }
      const { name, bio, profile_image, website, author_tags, social_links, short_description } = req.body;
      const updated = await UserModel.updateProfile(req.user.userId, {
        name,
        bio,
        profile_image,
        website,
        author_tags,
        social_links,
        short_description,
      });
      if (!updated) {
        ResponseUtil.error(res, 'Failed to update profile', 404);
        return;
      }
      const { password_hash, ...safeProfile } = updated;
      ResponseUtil.success(res, safeProfile, 'Profile updated successfully');
    } catch (error) {
      next(error);
    }
  }

  public static async updatePassword(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        ResponseUtil.error(res, 'Unauthenticated user context', 401);
        return;
      }
      const { currentPassword, newPassword } = req.body;
      if (!currentPassword || !newPassword) {
        ResponseUtil.error(res, 'Both current password and new password are required', 400);
        return;
      }
      if (newPassword.length < 6) {
        ResponseUtil.error(res, 'New password must be at least 6 characters long', 400);
        return;
      }
      const user = await UserModel.findById(req.user.userId);
      if (!user) {
        ResponseUtil.error(res, 'User not found', 404);
        return;
      }
      const isValid = await comparePassword(currentPassword, user.password_hash);
      if (!isValid) {
        ResponseUtil.error(res, 'Current password verification failed', 400);
        return;
      }
      const newHash = await hashPassword(newPassword);
      await UserModel.updatePassword(user.user_id, newHash);
      ResponseUtil.success(res, null, 'Password updated successfully');
    } catch (error) {
      next(error);
    }
  }

  public static async uploadAvatar(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        ResponseUtil.error(res, 'Unauthenticated', 401);
        return;
      }
      if (!req.file) {
        ResponseUtil.error(res, 'No image file uploaded', 400);
        return;
      }
      const avatarUrl = `/uploads/${req.file.filename}`;
      const updated = await UserModel.updateProfile(req.user.userId, {
        profile_image: avatarUrl,
      });
      const { password_hash, ...safeProfile } = updated || ({} as any);
      ResponseUtil.success(
        res,
        {
          url: avatarUrl,
          profile_image: avatarUrl,
          user: safeProfile,
        },
        'Profile image uploaded successfully'
      );
    } catch (error) {
      next(error);
    }
  }

  public static async getPublicAuthors(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const store = Database.getStore();
      const staffRoles = ['Admin', 'Editor', 'Author'];
      const authors = store.users
        .filter(u => staffRoles.includes(u.role_name) && u.status === 'ACTIVE')
        .map(u => {
          const publishedPosts = store.posts.filter(p => p.author_id === u.user_id && p.status === 'published');
          const totalViews = publishedPosts.reduce((sum, p) => sum + (p.views_count || 0), 0);
          return {
            user_id: u.user_id,
            name: u.name,
            username: u.username,
            profile_image: u.profile_image,
            bio: u.bio,
            website: u.website,
            author_tags: u.author_tags,
            social_links: u.social_links,
            short_description: u.short_description,
            role: u.role_name,
            published_count: publishedPosts.length,
            total_views: totalViews,
          };
        });
      ResponseUtil.success(res, authors, 'Public authors list retrieved');
    } catch (error) {
      next(error);
    }
  }

  public static async getPublicAuthorById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const identifier = req.params.idOrUsername;
      const store = Database.getStore();
      const user = store.users.find(
        u =>
          String(u.user_id) === identifier ||
          u.username.toLowerCase() === identifier.toLowerCase()
      );
      if (!user) {
        ResponseUtil.error(res, 'Author not found', 404);
        return;
      }
      const publishedPosts = store.posts.filter(
        p => p.author_id === user.user_id && p.status === 'published'
      );
      const totalViews = publishedPosts.reduce((sum, p) => sum + (p.views_count || 0), 0);
      const authorData = {
        user_id: user.user_id,
        name: user.name,
        username: user.username,
        profile_image: user.profile_image,
        bio: user.bio,
        website: user.website,
        author_tags: user.author_tags,
        social_links: user.social_links,
        short_description: user.short_description,
        role: user.role_name,
        published_count: publishedPosts.length,
        total_views: totalViews,
        created_at: user.created_at,
      };
      ResponseUtil.success(res, authorData, 'Author details retrieved');
    } catch (error) {
      next(error);
    }
  }
}

export class TagController {
  public static async getTags(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const search = req.query.search as string;
      const tags = await TagModel.findAll(search);
      ResponseUtil.success(res, tags, 'Tags list retrieved');
    } catch (error) {
      next(error);
    }
  }

  public static async getTagBySlug(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { slug } = req.params;
      const tag = await TagModel.findBySlug(slug);
      if (!tag) {
        ResponseUtil.error(res, `Tag with slug '${slug}' not found`, 404);
        return;
      }
      ResponseUtil.success(res, tag, 'Tag details retrieved');
    } catch (error) {
      next(error);
    }
  }

  public static async createTag(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { name, slug } = req.body;
      if (!name || !name.trim()) {
        ResponseUtil.error(res, 'Tag name is required', 400);
        return;
      }
      const finalSlug = (slug && slug.trim())
        ? slug.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
        : name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      const existing = await TagModel.findBySlug(finalSlug);
      if (existing) {
        ResponseUtil.success(res, existing, 'Tag already exists', 200);
        return;
      }
      const newTag = await TagModel.createTag(name.trim(), finalSlug);
      ResponseUtil.success(res, newTag, 'Tag created successfully', 201);
    } catch (error: any) {
      ResponseUtil.error(res, error.message || 'Failed to create tag', 400);
    }
  }

  public static async updateTag(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      const { name, slug } = req.body;
      if (!name || !name.trim()) {
        ResponseUtil.error(res, 'Tag name is required', 400);
        return;
      }
      const finalSlug = (slug && slug.trim())
        ? slug.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
        : name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      const updated = await TagModel.updateTag(id, name.trim(), finalSlug);
      if (!updated) {
        ResponseUtil.error(res, 'Tag not found', 404);
        return;
      }
      ResponseUtil.success(res, updated, 'Tag updated successfully');
    } catch (error: any) {
      ResponseUtil.error(res, error.message || 'Failed to update tag', 400);
    }
  }

  public static async deleteTag(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      const deleted = await TagModel.deleteTag(id);
      if (!deleted) {
        ResponseUtil.error(res, 'Tag not found', 404);
        return;
      }
      ResponseUtil.success(res, null, 'Tag removed successfully');
    } catch (error) {
      next(error);
    }
  }
}

export class LikeController {
  public static async toggleLike(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        ResponseUtil.error(res, 'Unauthenticated user context', 401);
        return;
      }
      const { postId } = req.body;
      if (!postId) {
        ResponseUtil.error(res, 'Article postId is required', 400);
        return;
      }
      const result = await LikeModel.toggleLike(parseInt(postId), req.user.userId);
      ResponseUtil.success(res, result, result.liked ? 'Article liked' : 'Article unliked');
    } catch (error) {
      next(error);
    }
  }
}

export class BookmarkController {
  public static async getBookmarks(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        ResponseUtil.error(res, 'Unauthenticated user context', 401);
        return;
      }
      const bookmarks = await BookmarkModel.findByUser(req.user.userId);
      ResponseUtil.success(res, bookmarks, 'Saved bookmarks retrieved');
    } catch (error) {
      next(error);
    }
  }

  public static async toggleBookmark(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        ResponseUtil.error(res, 'Unauthenticated user context', 401);
        return;
      }
      const { postId } = req.body;
      if (!postId) {
        ResponseUtil.error(res, 'Article postId is required', 400);
        return;
      }
      const result = await BookmarkModel.toggleBookmark(req.user.userId, parseInt(postId));
      ResponseUtil.success(res, result, result.bookmarked ? 'Article bookmarked' : 'Bookmark removed');
    } catch (error) {
      next(error);
    }
  }
}

export class NotificationController {
  public static async getNotifications(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        ResponseUtil.error(res, 'Unauthenticated user context', 401);
        return;
      }
      const notifications = await NotificationModel.findByUser(req.user.userId);
      ResponseUtil.success(res, notifications, 'Notifications list retrieved');
    } catch (error) {
      next(error);
    }
  }

  public static async markRead(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        ResponseUtil.error(res, 'Unauthenticated user context', 401);
        return;
      }
      const id = parseInt(req.params.id);
      await NotificationModel.markAsRead(id, req.user.userId);
      ResponseUtil.success(res, null, 'Notification marked as read');
    } catch (error) {
      next(error);
    }
  }
}

export class SeoController {
  public static async getSeoByPost(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const postId = parseInt(req.params.postId);
      const seo = await SeoModel.findByPostId(postId);
      ResponseUtil.success(res, seo, 'SEO metadata retrieved');
    } catch (error) {
      next(error);
    }
  }

  public static async getSeoByPage(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { pageIdentifier } = req.params;
      const seo = await SeoModel.findByPageIdentifier(pageIdentifier);
      ResponseUtil.success(res, seo, 'Page SEO metadata retrieved');
    } catch (error) {
      next(error);
    }
  }

  public static async upsertSeoByPost(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const postId = parseInt(req.params.postId);
      const seoData = req.body;
      const updated = await SeoModel.upsertPostSeo(postId, seoData);
      ResponseUtil.success(res, updated, 'SEO metadata updated successfully');
    } catch (error) {
      next(error);
    }
  }

  public static async analyzeSeo(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const {
        title = '',
        metaTitle = '',
        metaDescription = '',
        slug = '',
        content = '',
        focusKeyword = '',
        featuredImage = '',
        imageAltText = '',
        directAnswer = '',
        faqList = [],
        howToData = [],
        entityContext = '',
        sourceCitations = '',
      } = req.body;

      const checks: Array<{ id: string; label: string; status: 'pass' | 'warning' | 'fail'; detail: string }> = [];
      let totalScore = 0;
      const keyword = (focusKeyword || '').trim().toLowerCase();

      const t = (metaTitle || title || '').trim();
      if (t.length >= 40 && t.length <= 65) {
        totalScore += 15;
        checks.push({ id: 'title-length', label: 'SEO Title Length', status: 'pass', detail: `Optimal length (${t.length} chars)` });
      } else if (t.length > 0) {
        totalScore += 8;
        checks.push({ id: 'title-length', label: 'SEO Title Length', status: 'warning', detail: t.length < 40 ? `Title is short (${t.length} chars)` : `Title is long (${t.length} chars)` });
      } else {
        checks.push({ id: 'title-length', label: 'SEO Title Length', status: 'fail', detail: 'Missing SEO Title' });
      }

      if (keyword) {
        if (t.toLowerCase().includes(keyword)) {
          totalScore += 5;
          checks.push({ id: 'title-kw', label: 'Keyword in Title', status: 'pass', detail: `Focus keyword "${keyword}" is in the title` });
        } else {
          checks.push({ id: 'title-kw', label: 'Keyword in Title', status: 'fail', detail: `Include focus keyword "${keyword}" in the title` });
        }
      }

      const d = (metaDescription || '').trim();
      if (d.length >= 120 && d.length <= 165) {
        totalScore += 15;
        checks.push({ id: 'desc-length', label: 'Meta Description Length', status: 'pass', detail: `Optimal length (${d.length} chars)` });
      } else if (d.length > 0) {
        totalScore += 7;
        checks.push({ id: 'desc-length', label: 'Meta Description Length', status: 'warning', detail: `Length is ${d.length} chars. Aim for 120-165 chars.` });
      } else {
        checks.push({ id: 'desc-length', label: 'Meta Description Length', status: 'fail', detail: 'Missing Meta Description' });
      }

      const s = (slug || '').trim();
      const isCleanSlug = /^[a-z0-9-]+$/.test(s);
      if (s && isCleanSlug && s.length <= 60) {
        totalScore += 10;
        checks.push({ id: 'slug', label: 'URL Slug Structure', status: 'pass', detail: 'Clean, lowercase, hyphenated URL' });
      } else if (s) {
        totalScore += 5;
        checks.push({ id: 'slug', label: 'URL Slug Structure', status: 'warning', detail: 'Slug should be clean lowercase letters, numbers, and hyphens' });
      } else {
        checks.push({ id: 'slug', label: 'URL Slug Structure', status: 'fail', detail: 'Missing URL slug' });
      }

      const plainContent = (content || '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
      const wordCount = plainContent ? plainContent.split(' ').length : 0;
      if (wordCount >= 300) {
        totalScore += 20;
        checks.push({ id: 'content-length', label: 'Content Word Count', status: 'pass', detail: `Comprehensive content (${wordCount} words)` });
      } else if (wordCount >= 100) {
        totalScore += 10;
        checks.push({ id: 'content-length', label: 'Content Word Count', status: 'warning', detail: `Content is short (${wordCount} words). Recommended >= 300 words.` });
      } else {
        checks.push({ id: 'content-length', label: 'Content Word Count', status: 'fail', detail: 'Thin content. Write at least 100-300 words.' });
      }

      if (featuredImage) {
        if (imageAltText && imageAltText.trim().length >= 3) {
          totalScore += 15;
          checks.push({ id: 'img-alt', label: 'Featured Image & ALT Text', status: 'pass', detail: 'Cover image and descriptive ALT text present' });
        } else {
          totalScore += 8;
          checks.push({ id: 'img-alt', label: 'Featured Image & ALT Text', status: 'warning', detail: 'Featured image is set, but missing ALT text' });
        }
      } else {
        checks.push({ id: 'img-alt', label: 'Featured Image & ALT Text', status: 'fail', detail: 'No featured cover image selected' });
      }

      if (directAnswer && directAnswer.trim().length >= 30) {
        totalScore += 10;
        checks.push({ id: 'aeo-direct', label: 'AEO Direct Answer', status: 'pass', detail: 'Direct answer summary ready for AI answers' });
      } else {
        checks.push({ id: 'aeo-direct', label: 'AEO Direct Answer', status: 'warning', detail: 'Add a 1-2 sentence direct answer for AI engines' });
      }

      if ((Array.isArray(faqList) && faqList.length > 0) || (entityContext && entityContext.trim().length > 5) || (sourceCitations && sourceCitations.trim().length > 5)) {
        totalScore += 10;
        checks.push({ id: 'geo-signals', label: 'Knowledge Graph & FAQ Signals', status: 'pass', detail: 'Structured entities / citations / FAQs defined' });
      } else {
        checks.push({ id: 'geo-signals', label: 'Knowledge Graph & FAQ Signals', status: 'warning', detail: 'Include FAQs or Entity citations for higher E-E-A-T score' });
      }

      const finalScore = Math.min(100, Math.max(0, totalScore));
      ResponseUtil.success(res, { score: finalScore, checks, wordCount }, 'SEO analysis completed');
    } catch (error) {
      next(error);
    }
  }
}

export class NewsletterController {
  public static async subscribe(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, name, topics } = req.body;
      if (!email || !email.includes('@') || email.length > 255) {
        ResponseUtil.error(res, 'A valid email address is required', 400);
        return;
      }
      const result = await NewsletterModel.subscribe({
        email: email.trim(),
        name: typeof name === 'string' ? name.trim() : undefined,
        topics: Array.isArray(topics) ? topics : undefined,
      });
      ResponseUtil.success(
        res,
        result.subscriber,
        result.status === 'subscribed'
          ? 'Thank you for subscribing to BitBlog newsletter!'
          : 'You are already subscribed to our newsletter.',
        result.status === 'subscribed' ? 201 : 200
      );
    } catch (error) {
      next(error);
    }
  }

  public static async unsubscribe(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email } = req.body;
      if (!email) {
        ResponseUtil.error(res, 'Email address is required', 400);
        return;
      }
      await NewsletterModel.unsubscribe(email);
      ResponseUtil.success(res, null, 'Unsubscribed successfully');
    } catch (error) {
      next(error);
    }
  }

  public static async getAdminSubscribers(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const search = req.query.search as string | undefined;
      const status = req.query.status as string | undefined;
      const result = await NewsletterModel.findAll({ search, status });
      ResponseUtil.success(res, result, 'Newsletter subscribers list retrieved');
    } catch (error) {
      next(error);
    }
  }

  public static async createAdminSubscriber(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, name, status, topics, notes } = req.body;
      if (!email || !email.includes('@') || email.length > 255) {
        ResponseUtil.error(res, 'A valid email address is required', 400);
        return;
      }
      const newSub = await NewsletterModel.create({
        email,
        name,
        status,
        topics,
        notes,
      });
      ResponseUtil.success(res, newSub, 'Newsletter subscriber created successfully', 201);
    } catch (error: any) {
      ResponseUtil.error(res, error.message || 'Failed to create subscriber', 400);
    }
  }

  public static async updateAdminSubscriber(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      const { email, name, status, topics, notes } = req.body;
      const updated = await NewsletterModel.update(id, {
        email,
        name,
        status,
        topics,
        notes,
      });
      if (!updated) {
        ResponseUtil.error(res, 'Subscriber not found', 404);
        return;
      }
      ResponseUtil.success(res, updated, 'Newsletter subscriber updated successfully');
    } catch (error: any) {
      ResponseUtil.error(res, error.message || 'Failed to update subscriber', 400);
    }
  }

  public static async updateAdminSubscriberStatus(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      const { status } = req.body;
      if (!['SUBSCRIBED', 'UNSUBSCRIBED', 'PENDING', 'REJECTED'].includes(status)) {
        ResponseUtil.error(res, 'Invalid status. Must be SUBSCRIBED, UNSUBSCRIBED, PENDING, or REJECTED', 400);
        return;
      }
      const updated = await NewsletterModel.updateStatus(id, status);
      if (!updated) {
        ResponseUtil.error(res, 'Subscriber not found', 404);
        return;
      }
      ResponseUtil.success(res, updated, `Subscriber status updated to ${status}`);
    } catch (error: any) {
      ResponseUtil.error(res, error.message || 'Failed to update subscriber status', 400);
    }
  }

  public static async approveAdminSubscriber(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      const updated = await NewsletterModel.approve(id);
      if (!updated) {
        ResponseUtil.error(res, 'Subscriber not found', 404);
        return;
      }
      ResponseUtil.success(res, updated, 'Subscriber approved successfully');
    } catch (error: any) {
      ResponseUtil.error(res, error.message || 'Failed to approve subscriber', 400);
    }
  }

  public static async rejectAdminSubscriber(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      const updated = await NewsletterModel.reject(id);
      if (!updated) {
        ResponseUtil.error(res, 'Subscriber not found', 404);
        return;
      }
      ResponseUtil.success(res, updated, 'Subscriber request rejected');
    } catch (error: any) {
      ResponseUtil.error(res, error.message || 'Failed to reject subscriber', 400);
    }
  }

  public static async deleteAdminSubscriber(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      const deleted = await NewsletterModel.delete(id);
      if (!deleted) {
        ResponseUtil.error(res, 'Subscriber not found', 404);
        return;
      }
      ResponseUtil.success(res, null, 'Subscriber removed successfully');
    } catch (error) {
      next(error);
    }
  }
}

export class ContactController {
  public static async sendMessage(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { name, email, subject, message } = req.body;
      if (!name || !email || !message || message.trim().length < 5) {
        ResponseUtil.error(res, 'Name, email, and message content are required', 400);
        return;
      }
      const newMsg = await ContactModel.createMessage({
        name: name.trim(),
        email: email.trim(),
        subject: (subject || 'General Inquiry').trim(),
        message: message.trim(),
      });

      try {
        const store = Database.getStore();
        const staffUsers = (store.users || []).filter((u: any) =>
          u.role_id === 1 || u.role_id === 2 ||
          u.role === 'Admin' || u.role === 'Editor' ||
          u.role_name === 'Admin' || u.role_name === 'Editor'
        );
        for (const staff of staffUsers) {
          await NotificationModel.createNotification({
            userId: staff.user_id,
            type: 'SYSTEM',
            title: `📬 New Contact Inquiry: ${name.trim()}`,
            message: `${(subject || 'General Inquiry').trim()} - "${message.trim().slice(0, 80)}..."`,
            linkUrl: '/admin/messages',
          });
        }
      } catch (notifErr) {
        console.warn('Failed to notify staff about contact message:', notifErr);
      }

      ResponseUtil.success(res, newMsg, 'Contact message sent successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  public static async getMessages(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const messages = await ContactModel.findAll();
      ResponseUtil.success(res, messages, 'Contact messages list retrieved');
    } catch (error) {
      next(error);
    }
  }

  public static async getMessageById(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      const msg = await ContactModel.findById(id);
      if (!msg) {
        ResponseUtil.error(res, 'Contact message not found', 404);
        return;
      }
      ResponseUtil.success(res, msg, 'Contact message retrieved');
    } catch (error) {
      next(error);
    }
  }

  public static async updateStatus(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      const { status } = req.body;
      const updated = await ContactModel.updateStatus(id, status);
      ResponseUtil.success(res, updated, `Message status updated to ${status}`);
    } catch (error) {
      next(error);
    }
  }

  public static async deleteMessage(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      await ContactModel.deleteMessage(id);
      ResponseUtil.success(res, null, 'Contact message deleted');
    } catch (error) {
      next(error);
    }
  }
}

export class AnalyticsController {
  public static async getMetrics(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const metrics = await AnalyticsModel.getAnalyticsMetrics();
      ResponseUtil.success(res, metrics, 'Publication analytics metrics retrieved');
    } catch (error) {
      next(error);
    }
  }

  public static async recordView(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { postId } = req.body;
      if (!postId) {
        ResponseUtil.error(res, 'postId is required', 400);
        return;
      }
      const ip = req.ip || req.socket.remoteAddress || '127.0.0.1';
      const userAgent = req.headers['user-agent'];
      await AnalyticsModel.recordView(parseInt(postId), ip, userAgent);
      ResponseUtil.success(res, null, 'View recorded');
    } catch (error) {
      next(error);
    }
  }
}

export class SettingController {
  public static async getSettings(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const settings = await SettingModel.getSettings();
      ResponseUtil.success(res, settings, 'Site settings retrieved');
    } catch (error) {
      next(error);
    }
  }

  public static async updateSettings(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const updated = await SettingModel.updateSettings(req.body);
      ResponseUtil.success(res, updated, 'Site settings updated successfully');
    } catch (error) {
      next(error);
    }
  }
}

export class SitemapController {
  public static async getSitemapXml(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const xml = await SitemapService.generateSitemapXml();
      res.header('Content-Type', 'application/xml');
      res.status(200).send(xml);
    } catch (error) {
      next(error);
    }
  }
}

export class RobotsController {
  public static async getRobotsTxt(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const txt = await RobotsService.generateRobotsTxt();
      res.header('Content-Type', 'text/plain');
      res.status(200).send(txt);
    } catch (error) {
      next(error);
    }
  }
}

export class MediaController {
  public static async getMedia(req: Request, res: Response): Promise<void> {
    ResponseUtil.success(res, [], 'Media library retrieved');
  }
}

