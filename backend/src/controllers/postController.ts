import { Request, Response, NextFunction } from 'express';
import { PostService } from '../services/postService';
import { ResponseUtil } from '../utils/apiResponse';
import { AuditService } from '../services/auditService';
import { AuthenticatedRequest } from '../types';

export class PostController {
  public static async getPosts(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const category = req.query.category as string;
      const search = req.query.search as string;
      const tag = req.query.tag as string;
      const author = req.query.author as string;
      const sort = (req.query.sort as string) || 'newest';

      const result = await PostService.getPublishedPosts(page, limit, category, search, tag, author, sort);
      ResponseUtil.success(res, result.posts, 'Published articles retrieved', 200);
    } catch (error) {
      next(error);
    }
  }

  public static async getFeaturedPosts(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await PostService.getPublishedPosts(1, 5, undefined, undefined, undefined, undefined, 'most_viewed');
      ResponseUtil.success(res, result.posts, 'Featured most viewed articles retrieved');
    } catch (error) {
      next(error);
    }
  }

  public static async getPostBySlug(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { slug } = req.params;
      const ip = req.ip || req.socket.remoteAddress;
      const userAgent = req.headers['user-agent'];
      const userId = (req as AuthenticatedRequest).user?.userId;

      const post = await PostService.getPostBySlug(slug, ip, userAgent, userId);
      ResponseUtil.success(res, post, 'Article details retrieved');
    } catch (error) {
      next(error);
    }
  }

  // Admin CMS: All Articles List
  public static async getAdminPosts(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        ResponseUtil.error(res, 'Unauthenticated user context', 401);
        return;
      }
      const result = await PostService.getAdminPosts(req.user);
      ResponseUtil.success(res, result.posts, 'Admin articles list retrieved');
    } catch (error) {
      next(error);
    }
  }

  // Admin CMS: Pending Approvals List
  public static async getPendingPosts(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        ResponseUtil.error(res, 'Unauthenticated user context', 401);
        return;
      }
      const result = await PostService.getPendingPosts();
      ResponseUtil.success(res, result.posts, 'Pending review articles retrieved');
    } catch (error) {
      next(error);
    }
  }

  // User Dashboard: My Articles
  public static async getUserArticles(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        ResponseUtil.error(res, 'Unauthenticated user context', 401);
        return;
      }
      const result = await PostService.getUserArticles(req.user);
      ResponseUtil.success(res, result.posts, 'User submitted articles retrieved');
    } catch (error) {
      next(error);
    }
  }

  public static async getPostById(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        ResponseUtil.error(res, 'Unauthenticated user context', 401);
        return;
      }
      const id = parseInt(req.params.id);
      const post = await PostService.getPostByIdForEdit(id, req.user);
      ResponseUtil.success(res, post, 'Article retrieved');
    } catch (error) {
      next(error);
    }
  }

  public static async createPost(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        ResponseUtil.error(res, 'Unauthenticated user context', 401);
        return;
      }
      const newPost = await PostService.createPost(req.user, req.body);

      await AuditService.log(req, {
        action: newPost.status === 'pending_review' ? 'POST_SUBMITTED_FOR_REVIEW' : 'POST_CREATED',
        category: 'POST',
        details: `${req.user.role} '${req.user.name}' created story '${newPost.title}' (Status: ${newPost.status}).`,
        severity: newPost.status === 'published' ? 'success' : 'info',
      });

      ResponseUtil.success(res, newPost, 'Article created successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  public static async updatePost(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        ResponseUtil.error(res, 'Unauthenticated user context', 401);
        return;
      }
      const id = parseInt(req.params.id);
      const updated = await PostService.updatePost(id, req.user, req.body);

      await AuditService.log(req, {
        action: 'POST_UPDATED',
        category: 'POST',
        details: `${req.user.role} '${req.user.name}' updated story #${id} '${updated?.title || 'Story'}'.`,
        severity: 'info',
      });

      ResponseUtil.success(res, updated, 'Article updated successfully');
    } catch (error) {
      next(error);
    }
  }

  public static async deletePost(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        ResponseUtil.error(res, 'Unauthenticated user context', 401);
        return;
      }
      const id = parseInt(req.params.id);
      const result = await PostService.deletePost(id, req.user);

      await AuditService.log(req, {
        action: 'POST_DELETED',
        category: 'POST',
        details: `${req.user.role} '${req.user.name}' deleted article #${id}.`,
        severity: 'danger',
      });

      ResponseUtil.success(res, result, 'Article removed successfully');
    } catch (error) {
      next(error);
    }
  }

  // Admin Approval: Approve
  public static async approvePost(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        ResponseUtil.error(res, 'Unauthenticated user context', 401);
        return;
      }
      const id = parseInt(req.params.id);
      const approved = await PostService.approvePost(id, req.user);

      await AuditService.log(req, {
        action: 'POST_APPROVED_PUBLISHED',
        category: 'POST',
        details: `${req.user.role} '${req.user.name}' approved & published story #${id} '${approved?.title || 'Story'}'.`,
        severity: 'success',
      });

      ResponseUtil.success(res, approved, 'Article successfully approved and published');
    } catch (error) {
      next(error);
    }
  }

  // Admin Approval: Reject
  public static async rejectPost(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        ResponseUtil.error(res, 'Unauthenticated user context', 401);
        return;
      }
      const id = parseInt(req.params.id);
      const { reason } = req.body;
      const rejected = await PostService.rejectPost(id, req.user, reason);

      await AuditService.log(req, {
        action: 'POST_REJECTED',
        category: 'POST',
        details: `${req.user.role} '${req.user.name}' rejected story #${id}. Reason: ${reason || 'None provided'}`,
        severity: 'warning',
      });

      ResponseUtil.success(res, rejected, 'Article marked as rejected');
    } catch (error) {
      next(error);
    }
  }

  // Admin Approval: Request Changes
  public static async requestChangesPost(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        ResponseUtil.error(res, 'Unauthenticated user context', 401);
        return;
      }
      const id = parseInt(req.params.id);
      const { feedback } = req.body;
      const result = await PostService.requestChangesPost(id, req.user, feedback);

      await AuditService.log(req, {
        action: 'POST_CHANGES_REQUESTED',
        category: 'POST',
        details: `${req.user.role} '${req.user.name}' requested changes on story #${id}. Feedback: ${feedback || 'None provided'}`,
        severity: 'warning',
      });

      ResponseUtil.success(res, result, 'Editorial changes requested');
    } catch (error) {
      next(error);
    }
  }
}
