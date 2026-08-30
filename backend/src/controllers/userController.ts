import { Response } from 'express';
import { AuthenticatedRequest } from '../types';
import { ResponseUtil } from '../utils/apiResponse';

export class UserController {
  public static async getProfile(req: AuthenticatedRequest, res: Response): Promise<void> {
    ResponseUtil.success(res, req.user, 'User profile retrieved');
  }

  public static async getBookmarks(req: AuthenticatedRequest, res: Response): Promise<void> {
    ResponseUtil.success(res, [], 'User bookmarks retrieved');
  }
}

