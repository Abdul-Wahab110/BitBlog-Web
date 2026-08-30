import { Request, Response, NextFunction } from 'express';
import { ApplicationModel } from '../models/applicationModel';
import { UserModel } from '../models/userModel';
import { NotificationModel } from '../models/notificationModel';
import { Database } from '../config/database';
import { AuthenticatedRequest } from '../types';
import { ResponseUtil } from '../utils/apiResponse';
import { ApiError } from '../utils/apiError';
import { AuditService } from '../services/auditService';

export class ApplicationController {
  // 1. Submit Application (Reader Portal)
  public static async apply(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new ApiError('Authentication required to submit an application', 401);
      }

      const { roleApplied, bio, sampleUrls, topics, motivation } = req.body;

      if (!roleApplied || (roleApplied !== 'Author' && roleApplied !== 'Editor')) {
        throw new ApiError('Invalid role requested. Please apply as Author or Editor.', 400);
      }

      if (!bio || bio.trim().length < 10) {
        throw new ApiError('Please provide a brief bio or background (minimum 10 characters).', 400);
      }

      if (!motivation || motivation.trim().length < 10) {
        throw new ApiError('Please describe your motivation and experience (minimum 10 characters).', 400);
      }

      // Check if user already has a pending application
      const existing = await ApplicationModel.findLatestByUserId(req.user.userId);
      if (existing && existing.status === 'pending') {
        throw new ApiError('You already have a pending application currently under editorial review. Please wait for our decision.', 400);
      }

      // If user is already an Admin, prevent redundant application
      if (req.user.role === 'Admin') {
        throw new ApiError('You already hold Super Administrator privileges with full system permissions.', 400);
      }

      // If user is already an Editor, prevent re-applying
      if (req.user.role === 'Editor') {
        throw new ApiError('You already hold Editor privileges with full editorial review access.', 400);
      }

      // If user is already an Author and applying for Author again
      if (req.user.role === 'Author' && roleApplied === 'Author') {
        throw new ApiError('You already hold Author privileges. You can apply for the Editor role below.', 400);
      }

      const newApp = await ApplicationModel.createApplication({
        userId: req.user.userId,
        name: req.user.name,
        username: req.user.username,
        email: req.user.email,
        roleApplied,
        bio,
        sampleUrls: sampleUrls || '',
        topics: Array.isArray(topics) ? topics : typeof topics === 'string' ? topics.split(',').map(t => t.trim()).filter(Boolean) : [],
        motivation,
      });

      // Send User Confirmation Notification
      await NotificationModel.createNotification({
        userId: req.user.userId,
        type: 'SYSTEM',
        title: `${roleApplied} Application Received!`,
        message: `Your application to join the editorial team as an ${roleApplied} has been received. Our administration will review your portfolio.`,
        linkUrl: '/user/apply',
      });

      // Notify all Administrators so an instant alert pops up upon opening Admin Portal
      const store = Database.getStore();
      const adminUsers = store.users.filter((u: any) => u.role_id === 1 || u.role_name === 'Admin');
      for (const admin of adminUsers) {
        await NotificationModel.createNotification({
          userId: admin.user_id,
          type: 'SYSTEM',
          title: `🔔 New ${roleApplied} Application: ${req.user.name}`,
          message: `${req.user.name} (@${req.user.username}) has applied to become an ${roleApplied}. Click to review writing samples & portfolio.`,
          linkUrl: '/admin/applications',
        });
      }

      // Record Audit Trail
      await AuditService.log(req, {
        action: 'APPLICATION_SUBMITTED',
        category: 'APPLICATION',
        details: `Reader '${req.user.name}' submitted an application to become an '${roleApplied}'.`,
        severity: 'info',
      });

      ResponseUtil.success(res, newApp, `Application to become an ${roleApplied} submitted successfully!`);
    } catch (error) {
      next(error);
    }
  }

  // 2. Get Current User's Application Status (Reader Portal)
  public static async getMyApplication(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new ApiError('Authentication required', 401);
      }

      const applications = await ApplicationModel.findByUserId(req.user.userId);
      const latest = applications.length > 0 ? applications[0] : null;

      ResponseUtil.success(res, {
        latest,
        history: applications,
      }, 'User applications retrieved');
    } catch (error) {
      next(error);
    }
  }

  // 3. Admin: Get All Applications with Stats Summary
  public static async getAdminApplications(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const statusFilter = req.query.status as any;
      const allApps = await ApplicationModel.findAll('all');

      const stats = {
        total: allApps.length,
        pending: allApps.filter(a => a.status === 'pending').length,
        approved: allApps.filter(a => a.status === 'approved').length,
        rejected: allApps.filter(a => a.status === 'rejected').length,
      };

      const filteredList = statusFilter && statusFilter !== 'all'
        ? allApps.filter(a => a.status === statusFilter)
        : allApps;

      ResponseUtil.success(res, {
        applications: filteredList,
        stats,
      }, 'Applications retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  // 4. Admin: Review Application (Accept / Reject & Auto-Promote Role)
  public static async reviewApplication(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new ApiError('Authentication required', 401);
      }

      const id = parseInt(req.params.id);
      const { status, feedback } = req.body;

      if (!status || (status !== 'approved' && status !== 'rejected')) {
        throw new ApiError('Status must be either "approved" or "rejected"', 400);
      }

      const app = await ApplicationModel.findById(id);
      if (!app) {
        throw new ApiError(`Application #${id} not found`, 404);
      }

      const updated = await ApplicationModel.updateStatus(id, status, req.user.userId, feedback);

      if (status === 'approved') {
        // Automatically promote applicant's role in database!
        const targetRoleId = app.role_applied === 'Editor' ? 2 : 3; // 2: Editor, 3: Author
        await UserModel.updateUserRole(app.user_id, targetRoleId);

        // Notify user about approval and role promotion
        await NotificationModel.createNotification({
          userId: app.user_id,
          type: 'SYSTEM',
          title: `🎉 Application Approved — Welcome ${app.role_applied}!`,
          message: `Congratulations! Your application to become a ${app.role_applied} has been approved by our Administration. You have been assigned the ${app.role_applied} portal.`,
          linkUrl: '/admin',
        });
      } else {
        // If application was previously approved, revoke role and demote back to Reader (4)
        if (app.status === 'approved') {
          await UserModel.updateUserRole(app.user_id, 4); // 4: Reader
        }

        // Rejected/Revoked notification with feedback
        const reason = feedback ? ` Reason: ${feedback}` : '';
        await NotificationModel.createNotification({
          userId: app.user_id,
          type: 'SYSTEM',
          title: app.status === 'approved' ? `Role Revoked: ${app.role_applied} Access` : `Application Update: ${app.role_applied} Submission`,
          message: app.status === 'approved'
            ? `Your ${app.role_applied} privileges have been revoked by the administration and account returned to reader status.${reason}`
            : `Thank you for your interest in joining as ${app.role_applied}. Your application was not approved at this time.${reason}`,
          linkUrl: '/user/apply',
        });
      }

      // Record Audit Trail
      await AuditService.log(req, {
        action: status === 'approved' ? 'ROLE_APPLICATION_APPROVED' : 'ROLE_APPLICATION_REJECTED',
        category: 'APPLICATION',
        details: status === 'approved'
          ? `Administrator approved Application #${id} and automatically promoted '${app.name}' to '${app.role_applied}'.`
          : `Administrator rejected Application #${id} for '${app.name}'. Feedback: ${feedback || 'None provided'}`,
        severity: status === 'approved' ? 'success' : 'warning',
      });

      ResponseUtil.success(res, updated, `Application #${id} has been ${status} successfully.`);
    } catch (error) {
      next(error);
    }
  }
}
