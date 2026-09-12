import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/authService';
import { ResponseUtil } from '../utils/apiResponse';
import { AuthenticatedRequest } from '../types';
import { AuditService } from '../services/auditService';
import { UserModel } from '../models/userModel';

export class AuthController {

  public static async sendRegistrationOtp(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await AuthService.sendRegistrationOtp(req.body);

      await AuditService.log(req, {
        action: 'REGISTRATION_OTP_SENT',
        category: 'AUTH',
        details: `Registration OTP dispatched to '${req.body.email}' for prospective reader '${req.body.name}'.`,
        severity: 'info',
      });

      ResponseUtil.success(res, result, result.message);
    } catch (error) {
      next(error);
    }
  }

  public static async verifyRegistrationOtp(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await AuthService.verifyRegistrationOtp(req.body);

      await AuditService.log(req, {
        action: 'READER_REGISTERED_OTP_VERIFIED',
        category: 'AUTH',
        details: `Reader '${result.user.name}' verified 6-digit OTP from Gmail (${result.user.email}) and created active account.`,
        severity: 'success',
        userId: result.user.userId,
        userName: result.user.name,
        userRole: result.user.role,
      });

      ResponseUtil.success(res, result, result.message, 201);
    } catch (error) {
      next(error);
    }
  }

  public static async resendRegistrationOtp(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email } = req.body;
      const result = await AuthService.resendRegistrationOtp(email);

      await AuditService.log(req, {
        action: 'REGISTRATION_OTP_RESENT',
        category: 'AUTH',
        details: `Registration 6-digit OTP resent to '${email}'.`,
        severity: 'info',
      });

      ResponseUtil.success(res, result, result.message);
    } catch (error) {
      next(error);
    }
  }

  public static async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await AuthService.register(req.body);

      await AuditService.log(req, {
        action: 'READER_REGISTERED',
        category: 'AUTH',
        details: `Reader '${req.body.name}' registered account (@${req.body.username}).`,
        severity: 'success',
      });

      ResponseUtil.success(res, result, 'User account registered successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  public static async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await AuthService.login(req.body);

      await AuditService.log(req, {
        action: 'USER_LOGIN_SUCCESS',
        category: 'AUTH',
        details: `${result.user.role} '${result.user.name}' signed into portal.`,
        severity: 'success',
        userId: result.user.userId,
        userName: result.user.name,
        userRole: result.user.role,
      });

      ResponseUtil.success(res, result, 'User logged in successfully');
    } catch (error) {
      next(error);
    }
  }

  public static async firebaseSync(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await AuthService.syncFirebaseUser(req.body);

      await AuditService.log(req, {
        action: 'FIREBASE_GOOGLE_AUTH_LOGIN',
        category: 'AUTH',
        details: `Reader '${result.user.name}' authenticated via Firebase (${result.user.email}).`,
        severity: 'success',
        userId: result.user.userId,
        userName: result.user.name,
        userRole: result.user.role,
      });

      ResponseUtil.success(res, result, 'Authenticated via Firebase successfully');
    } catch (error) {
      next(error);
    }
  }

  public static async logout(req: Request, res: Response): Promise<void> {

    ResponseUtil.success(res, null, 'User logged out successfully');
  }

  public static async getMe(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        ResponseUtil.error(res, 'Unauthenticated user identity', 401);
        return;
      }
      const user = await UserModel.findById(req.user.userId);
      if (!user) {
        ResponseUtil.error(res, 'User not found', 404);
        return;
      }
      const profile = {
        userId: user.user_id,
        user_id: user.user_id,
        name: user.name,
        username: user.username,
        email: user.email,
        role: user.role_name,
        role_id: user.role_id,
        status: user.status,
        avatar_url: user.profile_image,
        profile_image: user.profile_image,
        profileImage: user.profile_image,
        bio: user.bio,
        website: user.website,
        author_tags: user.author_tags,
        social_links: user.social_links,
        short_description: user.short_description,
      };
      ResponseUtil.success(res, profile, 'Current user profile retrieved');
    } catch (error) {
      next(error);
    }
  }

  public static async forgotPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email } = req.body;
      const result = await AuthService.forgotPassword(email);
      ResponseUtil.success(res, result, result.message);
    } catch (error) {
      next(error);
    }
  }

  public static async resetPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { token, newPassword } = req.body;
      const result = await AuthService.resetPassword(token, newPassword);
      ResponseUtil.success(res, result, result.message);
    } catch (error) {
      next(error);
    }
  }

  public static async changePassword(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        ResponseUtil.error(res, 'Unauthenticated user context', 401);
        return;
      }
      const { currentPassword, newPassword } = req.body;
      const result = await AuthService.changePassword(req.user.userId, currentPassword, newPassword);
      ResponseUtil.success(res, result, result.message);
    } catch (error) {
      next(error);
    }
  }
}

