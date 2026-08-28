import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types';
import { verifyToken } from '../utils/jwt';
import { ResponseUtil } from '../utils/apiResponse';

export const authenticate = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    ResponseUtil.error(res, 'Authentication token missing or malformed', 401, ['Bearer token required']);
    return;
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = verifyToken(token);
    req.user = decoded;
    next();
  } catch (error: any) {
    if (error.name === 'TokenExpiredError') {
      ResponseUtil.error(res, 'Session token has expired. Please sign in again.', 401, ['Token expired']);
    } else {
      ResponseUtil.error(res, 'Invalid authentication token signature', 401, ['Invalid token']);
    }
  }
};
