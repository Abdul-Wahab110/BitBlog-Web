import { Response, NextFunction } from 'express';
import bcrypt from 'bcrypt';
import { Database } from '../config/database';
import { ResponseUtil } from '../utils/apiResponse';
import { PostModel } from '../models/postModel';
import { UserModel } from '../models/userModel';
import { AuditService } from '../services/auditService';
import { EmailService } from '../services/emailService';
import { AuthenticatedRequest } from '../types';

export class AdminController {
  public static async getDashboardStats(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const store = Database.getStore();
      const userRole = req.user?.role || 'Admin';
      const userId = req.user?.userId;

      if (userRole === 'Author' && userId) {

        const authorPosts = store.posts.filter(p => p.author_id === userId);
        const authorPostIds = authorPosts.map(p => p.post_id);
        const comments = (store.comments || []).filter(c => authorPostIds.includes(c.post_id)).length;
        const totalViews = authorPosts.reduce((sum, p) => sum + (p.views_count || 0), 0);

        const stats = {
          publishedPosts: authorPosts.filter(p => p.status === 'published').length,
          draftPosts: authorPosts.filter(p => p.status === 'draft').length,
          scheduledPosts: authorPosts.filter(p => p.status === 'scheduled').length,
          pendingPosts: authorPosts.filter(p => p.status === 'pending_review').length,
          totalUsers: 0,
          totalComments: comments,
          totalCategories: 0,
          totalTags: 0,
          totalViews,
        };
        ResponseUtil.success(res, stats, 'Author metrics retrieved successfully');
        return;
      }

      const published = store.posts.filter(p => p.status === 'published').length;
      const drafts = store.posts.filter(p => p.status === 'draft').length;
      const scheduled = store.posts.filter(p => p.status === 'scheduled').length;
      const pending = store.posts.filter(p => p.status === 'pending_review').length;
      const users = store.users.length;
      const comments = (store.comments || []).length;
      const categories = store.categories.length;
      const tags = store.tags.length;
      const totalViews = store.posts.reduce((sum, p) => sum + (p.views_count || 0), 0);

      const pendingApps = (store.role_applications || []).filter(a => a.status === 'pending').length;

      const stats = {
        publishedPosts: published,
        draftPosts: drafts,
        scheduledPosts: scheduled,
        pendingPosts: pending,
        pendingApplications: pendingApps,
        totalAuditLogs: (store.audit_logs || []).length,
        totalUsers: users,
        totalComments: comments,
        totalCategories: categories,
        totalTags: tags,
        totalViews,
      };

      ResponseUtil.success(res, stats, 'Real database stats retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  public static async getUsers(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const store = Database.getStore();
      const users = store.users.map(u => {
        const postCount = store.posts.filter(p => p.author_id === u.user_id).length;
        return {
          user_id: u.user_id,
          role_id: u.role_id,
          role: u.role_name,
          name: u.name,
          username: u.username,
          email: u.email,
          profile_image: u.profile_image,
          status: u.status,
          created_at: u.created_at,
          last_login: u.last_login,
          post_count: postCount,
        };
      });

      ResponseUtil.success(res, users, 'Users list retrieved');
    } catch (error) {
      next(error);
    }
  }

  public static async createUser(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { name, username, email, password, role = 'User', status = 'ACTIVE' } = req.body;

      if (!name || typeof name !== 'string' || name.trim().length < 2) {
        ResponseUtil.error(res, 'Full name must be at least 2 characters', 400);
        return;
      }

      if (!username || typeof username !== 'string' || username.trim().length < 3) {
        ResponseUtil.error(res, 'Username must be at least 3 characters', 400);
        return;
      }

      if (!email || typeof email !== 'string' || !email.includes('@')) {
        ResponseUtil.error(res, 'A valid email address is required', 400);
        return;
      }

      if (!password || typeof password !== 'string' || password.length < 6) {
        ResponseUtil.error(res, 'Password must be at least 6 characters', 400);
        return;
      }

      const validRoles = ['Admin', 'Editor', 'Author', 'User'];
      if (!validRoles.includes(role)) {
        ResponseUtil.error(res, `Invalid role. Must be one of: ${validRoles.join(', ')}`, 400);
        return;
      }

      const existingEmail = await UserModel.findByEmail(email.trim());
      if (existingEmail) {
        ResponseUtil.error(res, 'An account with this email address already exists', 409);
        return;
      }

      const existingUser = await UserModel.findByUsername(username.trim());
      if (existingUser) {
        ResponseUtil.error(res, 'An account with this username already exists', 409);
        return;
      }

      const roleId = await UserModel.getRoleIdByName(role);
      if (!roleId) {
        ResponseUtil.error(res, `Failed to resolve role '${role}'`, 400);
        return;
      }

      const passwordHash = await bcrypt.hash(password, 10);

      const createdUser = await UserModel.createUser({
        roleId,
        name: name.trim(),
        username: username.trim().toLowerCase(),
        email: email.trim().toLowerCase(),
        passwordHash,
      });

      if (status && status !== 'ACTIVE') {
        await UserModel.updateUserStatus(createdUser.user_id, status);
      }

      const safeUser = {
        user_id: createdUser.user_id,
        name: createdUser.name,
        username: createdUser.username,
        email: createdUser.email,
        role: createdUser.role_name,
        role_id: createdUser.role_id,
        status: status || 'ACTIVE',
        created_at: createdUser.created_at,
      };

      ResponseUtil.success(res, safeUser, `Account for '${name}' created successfully with role '${role}'`, 201);
    } catch (error) {
      next(error);
    }
  }

  public static async updateUserRole(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (req.user?.role !== 'Admin') {
        ResponseUtil.error(res, 'Access denied. Only System Administrator can modify user roles.', 403);
        return;
      }
      const userId = parseInt(req.params.id);
      const { role } = req.body;

      const targetUser = await UserModel.findById(userId);
      if (!targetUser) {
        ResponseUtil.error(res, 'User not found', 404);
        return;
      }

      if (targetUser.username === 'admin' || targetUser.email === 'admin@bitblog.com' || targetUser.user_id === 1) {
        ResponseUtil.error(res, 'Super Administrator (Website Owner) role is protected and cannot be changed.', 403);
        return;
      }

      const roleId = await UserModel.getRoleIdByName(role);
      if (!roleId) {
        ResponseUtil.error(res, `Role '${role}' is invalid`, 400);
        return;
      }

      await UserModel.updateUserRole(userId, roleId);
      ResponseUtil.success(res, null, `User #${userId} role updated to '${role}'`);
    } catch (error) {
      next(error);
    }
  }

  public static async updateUserStatus(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (req.user?.role !== 'Admin') {
        ResponseUtil.error(res, 'Access denied. Only Administrators can modify user status.', 403);
        return;
      }
      const userId = parseInt(req.params.id);
      const { status } = req.body;

      const targetUser = await UserModel.findById(userId);
      if (!targetUser) {
        ResponseUtil.error(res, 'User not found', 404);
        return;
      }

      if (targetUser.username === 'admin' || targetUser.email === 'admin@bitblog.com' || targetUser.user_id === 1) {
        ResponseUtil.error(res, 'Super Administrator (Website Owner) status is protected and cannot be modified.', 403);
        return;
      }

      await UserModel.updateUserStatus(userId, status);
      ResponseUtil.success(res, null, `User #${userId} status updated to '${status}'`);
    } catch (error) {
      next(error);
    }
  }

  public static async updateUserProfile(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (req.user?.role !== 'Admin' && req.user?.role !== 'Editor') {
        ResponseUtil.error(res, 'Access denied. Administrator or Editor privileges required.', 403);
        return;
      }
      const userId = parseInt(req.params.id);
      const { name, bio, profile_image, website, author_tags, social_links, short_description, password, newPassword } = req.body;
      const updated = await UserModel.updateProfile(userId, {
        name,
        bio,
        profile_image,
        website,
        author_tags,
        social_links,
        short_description,
      });
      if (!updated) {
        ResponseUtil.error(res, 'User not found', 404);
        return;
      }

      const passToSet = password || newPassword;
      if (passToSet && passToSet.trim().length >= 6) {
        const hash = await bcrypt.hash(passToSet.trim(), 10);
        await UserModel.updatePassword(userId, hash);
      }

      const { password_hash, ...safeProfile } = updated;
      ResponseUtil.success(res, safeProfile, `User #${userId} profile updated successfully`);
    } catch (error) {
      next(error);
    }
  }

  public static async deleteUser(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (req.user?.role !== 'Admin') {
        ResponseUtil.error(res, 'Access denied. Only Administrators can delete user accounts.', 403);
        return;
      }
      const userId = parseInt(req.params.id);
      if (req.user?.userId === userId) {
        ResponseUtil.error(res, 'Cannot delete your own active administrator account', 400);
        return;
      }

      const targetUser = await UserModel.findById(userId);
      if (!targetUser) {
        ResponseUtil.error(res, 'User not found', 404);
        return;
      }

      if (targetUser.username === 'admin' || targetUser.email === 'admin@bitblog.com' || targetUser.user_id === 1) {
        ResponseUtil.error(res, 'The Super Administrator (Website Owner) account is protected and cannot be deleted.', 403);
        return;
      }

      await UserModel.deleteUser(userId);

      await AuditService.log(req, {
        action: 'USER_DELETED_PERMANENTLY',
        category: 'USER_MANAGEMENT',
        details: `User account '${targetUser.name}' (@${targetUser.username}, ${targetUser.email}, Role: ${targetUser.role_name}) was permanently deleted from database by Admin.`,
        severity: 'danger',
        userId: req.user?.userId,
        userName: req.user?.name,
        userRole: req.user?.role,
      });

      ResponseUtil.success(res, null, `User '${targetUser.name}' was permanently deleted from the database.`);
    } catch (error) {
      next(error);
    }
  }

  public static async getAuthors(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const store = Database.getStore();
      const staffRoles = ['Admin', 'Editor', 'Author'];
      const authors = store.users
        .filter(u => staffRoles.includes(u.role_name))
        .map(u => {
          const publishedPosts = store.posts.filter(p => p.author_id === u.user_id && p.status === 'published');
          const totalViews = publishedPosts.reduce((sum, p) => sum + (p.views_count || 0), 0);
          return {
            user_id: u.user_id,
            name: u.name,
            username: u.username,
            email: u.email,
            profile_image: u.profile_image,
            bio: u.bio,
            role: u.role_name,
            published_count: publishedPosts.length,
            total_views: totalViews,
          };
        });

      ResponseUtil.success(res, authors, 'Authors list retrieved');
    } catch (error) {
      next(error);
    }
  }

  public static async getNewsletterSubscribers(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const store = Database.getStore();
      ResponseUtil.success(res, store.subscribers || [], 'Newsletter subscribers list retrieved');
    } catch (error) {
      next(error);
    }
  }

  public static async getContactMessages(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const store = Database.getStore();
      ResponseUtil.success(res, store.messages || [], 'Contact messages retrieved');
    } catch (error) {
      next(error);
    }
  }

  public static async deleteContactMessage(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      const store = Database.getStore();
      store.messages = (store.messages || []).filter(m => m.message_id !== id);
      Database.saveStore();
      ResponseUtil.success(res, null, 'Contact message deleted permanently');
    } catch (error) {
      next(error);
    }
  }

  public static async replyContactMessage(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      const { toEmail, recipientName, subject, replyMessage, originalMessage } = req.body;

      if (!toEmail || !replyMessage) {
        ResponseUtil.error(res, 'Recipient email and reply message are required', 400);
        return;
      }

      await EmailService.sendContactReplyEmail(
        toEmail,
        recipientName || 'Reader',
        subject || 'Re: Editorial Inquiry',
        replyMessage,
        originalMessage
      );

      const store = Database.getStore();
      const msg = (store.messages || []).find(m => m.message_id === id);
      if (msg) {
        msg.status = 'READ';
        Database.saveStore();
      }

      ResponseUtil.success(res, null, `Reply successfully delivered directly to ${toEmail}`);
    } catch (error: any) {
      console.error('Failed to dispatch reply email:', error);
      ResponseUtil.error(res, error.message || 'Failed to dispatch email to Gmail inbox', 500);
    }
  }

  public static async getSystemOverview(req: AuthenticatedRequest, res: Response): Promise<void> {
    ResponseUtil.success(res, { status: 'OPTIMAL', nodeVersion: process.version }, 'System overview retrieved');
  }
}

