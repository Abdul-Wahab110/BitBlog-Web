import { Request } from 'express';
import { AuditLogModel, AuditCategory, AuditSeverity } from '../models/auditLogModel';
import { AuthenticatedRequest } from '../types';

export class AuditService {
  public static async log(
    req: AuthenticatedRequest | Request,
    data: {
      action: string;
      category: AuditCategory;
      details: string;
      severity?: AuditSeverity;
      userId?: number;
      userName?: string;
      userRole?: string;
    }
  ): Promise<void> {
    try {
      const authReq = req as AuthenticatedRequest;
      const userId = data.userId ?? authReq.user?.userId;
      const userName = data.userName ?? authReq.user?.name ?? 'Guest User';
      const userRole = data.userRole ?? authReq.user?.role ?? 'Public';

      const forwarded = req.headers['x-forwarded-for'];
      const ipAddress = typeof forwarded === 'string'
        ? forwarded.split(',')[0].trim()
        : req.socket?.remoteAddress || '127.0.0.1';

      await AuditLogModel.record({
        userId,
        userName,
        userRole,
        action: data.action,
        category: data.category,
        details: data.details,
        ipAddress,
        severity: data.severity || 'info',
      });
    } catch (err) {
      console.error('[AuditService] Failed to record audit log:', err);
    }
  }
}
