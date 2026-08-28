import { Response, NextFunction } from 'express';
import { AuthenticatedRequest, UserRole } from '../types';
import { ResponseUtil } from '../utils/apiResponse';

export const requireAuthenticated = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
  if (!req.user) {
    ResponseUtil.error(res, 'Authentication required to access this resource', 401, ['Unauthenticated request']);
    return;
  }
  next();
};

export const authorizeRoles = (...allowedRoles: UserRole[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      ResponseUtil.error(res, 'Unauthenticated user context', 401);
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      ResponseUtil.error(res, `Access denied. Requires one of the following roles: ${allowedRoles.join(', ')}`, 403, [
        `Role '${req.user.role}' lacks sufficient privileges`,
      ]);
      return;
    }

    next();
  };
};

// Shorthand Role Guards
export const requireAdmin = authorizeRoles('Admin');
export const requireEditor = authorizeRoles('Admin', 'Editor');
export const requireAuthor = authorizeRoles('Admin', 'Editor', 'Author');

// Resource Ownership Guard (e.g. Authors can only edit/delete their own posts)
export const requireOwnerOrRoles = (resourceOwnerId: number, req: AuthenticatedRequest, res: Response, next: NextFunction): boolean => {
  if (!req.user) {
    ResponseUtil.error(res, 'Unauthenticated user context', 401);
    return false;
  }

  // Admins and Editors have global management rights over articles and content
  if (req.user.role === 'Admin' || req.user.role === 'Editor') {
    return true;
  }

  // Otherwise, user MUST be the exact owner of the resource
  if (req.user.userId !== resourceOwnerId) {
    ResponseUtil.error(res, 'Access denied. You do not have permission to modify or access this private resource.', 403, [
      'Resource ownership check failed',
    ]);
    return false;
  }

  return true;
};
