import { Database } from '../config/database';

export type AuditCategory = 'AUTH' | 'POST' | 'APPLICATION' | 'COMMENT' | 'SETTINGS' | 'MEDIA' | 'USER_MANAGEMENT';
export type AuditSeverity = 'info' | 'success' | 'warning' | 'danger';

export interface AuditLogRecord {
  log_id: number;
  user_id?: number;
  user_name: string;
  user_role: string;
  action: string;
  category: AuditCategory;
  details: string;
  ip_address?: string;
  severity: AuditSeverity;
  created_at: string;
}

export class AuditLogModel {
  public static async record(data: {
    userId?: number;
    userName: string;
    userRole: string;
    action: string;
    category: AuditCategory;
    details: string;
    ipAddress?: string;
    severity?: AuditSeverity;
  }): Promise<AuditLogRecord> {
    const store = Database.getStore();
    if (!store.audit_logs) {
      store.audit_logs = [];
    }

    const now = new Date().toISOString();
    const maxId = store.audit_logs.reduce((max, log) => Math.max(max, log.log_id || 0), 0);
    const newId = maxId + 1;

    const record: AuditLogRecord = {
      log_id: newId,
      user_id: data.userId,
      user_name: data.userName || 'Guest / System',
      user_role: data.userRole || 'Public',
      action: data.action,
      category: data.category,
      details: data.details,
      ip_address: data.ipAddress || '127.0.0.1',
      severity: data.severity || 'info',
      created_at: now,
    };

    // Keep latest 2000 records in memory/disk
    store.audit_logs.unshift(record);
    if (store.audit_logs.length > 2000) {
      store.audit_logs = store.audit_logs.slice(0, 2000);
    }

    Database.saveStore();
    return record;
  }

  public static async findAll(filter?: {
    category?: string;
    severity?: string;
    search?: string;
    limit?: number;
  }): Promise<AuditLogRecord[]> {
    const store = Database.getStore();
    let logs = store.audit_logs || [];

    if (filter?.category && filter.category !== 'all') {
      logs = logs.filter(l => l.category === filter.category);
    }

    if (filter?.severity && filter.severity !== 'all') {
      logs = logs.filter(l => l.severity === filter.severity);
    }

    if (filter?.search && filter.search.trim()) {
      const q = filter.search.toLowerCase().trim();
      logs = logs.filter(l =>
        l.user_name.toLowerCase().includes(q) ||
        l.user_role.toLowerCase().includes(q) ||
        l.action.toLowerCase().includes(q) ||
        l.details.toLowerCase().includes(q) ||
        (l.ip_address && l.ip_address.toLowerCase().includes(q))
      );
    }

    logs = [...logs].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    if (filter?.limit) {
      return logs.slice(0, filter.limit);
    }

    return logs;
  }

  public static async getStats(): Promise<{
    totalEvents: number;
    criticalActions: number;
    securityLogins: number;
    publishingActions: number;
  }> {
    const store = Database.getStore();
    const logs = store.audit_logs || [];

    return {
      totalEvents: logs.length,
      criticalActions: logs.filter(l => l.severity === 'danger' || l.severity === 'warning').length,
      securityLogins: logs.filter(l => l.category === 'AUTH').length,
      publishingActions: logs.filter(l => l.category === 'POST').length,
    };
  }

  public static async clearLogs(): Promise<void> {
    const store = Database.getStore();
    store.audit_logs = [];
    Database.saveStore();
  }
}
