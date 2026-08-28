import { Response, NextFunction } from 'express';
import { AuditLogModel } from '../models/auditLogModel';
import { AuthenticatedRequest } from '../types';
import { ResponseUtil } from '../utils/apiResponse';
import { ApiError } from '../utils/apiError';
import { AuditService } from '../services/auditService';

export class AuditController {
  public static async getLogs(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const category = req.query.category as string;
      const severity = req.query.severity as string;
      const search = req.query.search as string;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 200;

      const logs = await AuditLogModel.findAll({
        category,
        severity,
        search,
        limit,
      });

      const stats = await AuditLogModel.getStats();

      ResponseUtil.success(res, { logs, stats }, 'System audit logs retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  public static async clearLogs(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      await AuditLogModel.clearLogs();
      await AuditService.log(req, {
        action: 'AUDIT_LOGS_PURGED',
        category: 'SETTINGS',
        details: `Administrator cleared all historical audit logs.`,
        severity: 'warning',
      });
      ResponseUtil.success(res, null, 'Audit logs cleared successfully');
    } catch (error) {
      next(error);
    }
  }
}
