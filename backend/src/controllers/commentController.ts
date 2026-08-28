import { Request, Response, NextFunction } from 'express';
import { CommentModel } from '../models/commentModel';
import { NotificationModel } from '../models/notificationModel';
import { ResponseUtil } from '../utils/apiResponse';
import { AuthenticatedRequest } from '../types';

export class CommentController {
  public static async getPostComments(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const postId = parseInt(req.params.postId);
      const comments = await CommentModel.findApprovedByPost(postId);
      ResponseUtil.success(res, comments, 'Approved post comments retrieved');
    } catch (error) {
      next(error);
    }
  }

  public static async getUserComments(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        ResponseUtil.error(res, 'Unauthenticated user context', 401);
        return;
      }
      const comments = await CommentModel.findByUser(req.user.userId);
      ResponseUtil.success(res, comments, 'User comments retrieved');
    } catch (error) {
      next(error);
    }
  }

  public static async createComment(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { postId, parentCommentId, content } = req.body;
      if (!postId || !content || content.trim().length < 2) {
        ResponseUtil.error(res, 'Comment text content is required', 400);
        return;
      }

      const userId = req.user?.userId;
      const newComment = await CommentModel.createComment({
        postId: parseInt(postId),
        userId,
        parentCommentId: parentCommentId ? parseInt(parentCommentId) : undefined,
        content: content.trim(),
        status: 'approved',
      });

      // Send real notification if this is a reply to another user's comment
      if (parentCommentId) {
        const parentComment = await CommentModel.findById(parseInt(parentCommentId));
        if (parentComment && parentComment.user_id && parentComment.user_id !== userId) {
          await NotificationModel.createNotification({
            userId: parentComment.user_id,
            type: 'COMMENT_REPLY',
            title: 'New Reply to Your Comment',
            message: `A reader replied to your comment: "${content.trim().slice(0, 60)}..."`,
          });
        }
      }

      ResponseUtil.success(res, newComment, 'Comment posted successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  public static async updateComment(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        ResponseUtil.error(res, 'Unauthenticated user context', 401);
        return;
      }
      const id = parseInt(req.params.id);
      const { content } = req.body;

      const existing = await CommentModel.findById(id);
      if (!existing) {
        ResponseUtil.error(res, `Comment #${id} not found`, 404);
        return;
      }

      if (req.user.role !== 'Admin' && req.user.role !== 'Editor' && existing.user_id !== req.user.userId) {
        ResponseUtil.error(res, 'Access denied. You can only edit your own comment.', 403);
        return;
      }

      const updated = await CommentModel.updateComment(id, content);
      ResponseUtil.success(res, updated, 'Comment updated successfully');
    } catch (error) {
      next(error);
    }
  }

  public static async deleteComment(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        ResponseUtil.error(res, 'Unauthenticated user context', 401);
        return;
      }
      const id = parseInt(req.params.id);
      const existing = await CommentModel.findById(id);
      if (!existing) {
        ResponseUtil.error(res, `Comment #${id} not found`, 404);
        return;
      }

      if (req.user.role !== 'Admin' && req.user.role !== 'Editor' && existing.user_id !== req.user.userId) {
        ResponseUtil.error(res, 'Access denied. You can only delete your own comment.', 403);
        return;
      }

      await CommentModel.deleteComment(id);
      ResponseUtil.success(res, null, 'Comment deleted successfully');
    } catch (error) {
      next(error);
    }
  }

  public static async getAdminComments(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const status = req.query.status as string;
      const comments = await CommentModel.findAllAdmin(status);
      ResponseUtil.success(res, comments, 'Admin comments retrieved');
    } catch (error) {
      next(error);
    }
  }

  public static async updateStatus(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      const { status } = req.body;
      const updated = await CommentModel.updateStatus(id, status);

      if (updated && updated.user_id) {
        await NotificationModel.createNotification({
          userId: updated.user_id,
          type: 'COMMENT_MODERATED',
          title: `Comment Status: ${status.toUpperCase()}`,
          message: `Your comment on article #${updated.post_id} status has been updated to ${status}.`,
        });
      }

      ResponseUtil.success(res, updated, `Comment status updated to ${status}`);
    } catch (error) {
      next(error);
    }
  }
}
