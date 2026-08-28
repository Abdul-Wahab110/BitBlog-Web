import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  Activity,
  Search,
  Filter,
  RefreshCw,
  Download,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Info,
  XCircle,
  Clock,
  User,
  Shield,
  FileText,
  Award,
  MessageSquare,
  Settings,
  HardDrive,
} from 'lucide-react';
import { LoadingState } from '../../components/common/LoadingState';
import { EmptyState } from '../../components/common/EmptyState';
import { ApiService } from '../../services/api';

const CATEGORIES = [
  { id: 'all', label: 'All Activities' },
  { id: 'POST', label: 'Stories & Publishing', icon: FileText },
  { id: 'APPLICATION', label: 'Role Applications', icon: Award },
  { id: 'AUTH', label: 'Authentication & Logins', icon: Shield },
  { id: 'COMMENT', label: 'Comments & Discussions', icon: MessageSquare },
  { id: 'SETTINGS', label: 'System Settings', icon: Settings },
  { id: 'MEDIA', label: 'Media Library', icon: HardDrive },
];

export const AdminAuditLogs: React.FC = () => {
  const [logs, setLogs] = useState<any[]>([]);
  const [stats, setStats] = useState({ totalEvents: 0, criticalActions: 0, securityLogins: 0, publishingActions: 0 });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [category, setCategory] = useState('all');
  const [severity, setSeverity] = useState('all');
  const [search, setSearch] = useState('');
  const [clearConfirmOpen, setClearConfirmOpen] = useState(false);
  const [clearing, setClearing] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    fetchLogs();
  }, [category, severity]);

  const fetchLogs = async (isManual = false) => {
    if (isManual) setRefreshing(true);
    else setLoading(true);

    try {
      const res = await ApiService.getAuditLogs({
        category: category !== 'all' ? category : undefined,
        severity: severity !== 'all' ? severity : undefined,
        search: search.trim() || undefined,
        limit: 300,
      });

      if (res && res.data) {
        setLogs(res.data.logs || []);
        if (res.data.stats) {
          setStats(res.data.stats);
        }
      }
    } catch (err) {
      console.error('Failed to load audit logs:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchLogs(true);
  };

  const handleClearLogs = async () => {
    setClearing(true);
    try {
      await ApiService.clearAuditLogs();
      setFeedback({ type: 'success', text: 'Audit trail purged successfully.' });
      setClearConfirmOpen(false);
      fetchLogs(true);
    } catch (err: any) {
      setFeedback({ type: 'error', text: err.message || 'Failed to clear logs.' });
    } finally {
      setClearing(false);
    }
  };

  const exportAsJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(logs, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `modernblog_audit_logs_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const exportAsCSV = () => {
    if (logs.length === 0) return;
    const headers = ['Log ID', 'Timestamp', 'User Name', 'Role', 'Action', 'Category', 'Severity', 'IP Address', 'Details'];
    const rows = logs.map(l => [
      l.log_id,
      `"${new Date(l.created_at).toLocaleString()}"`,
      `"${l.user_name || ''}"`,
      `"${l.user_role || ''}"`,
      `"${l.action || ''}"`,
      `"${l.category || ''}"`,
      `"${l.severity || ''}"`,
      `"${l.ip_address || ''}"`,
      `"${(l.details || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', encodeURI(csvContent));
    downloadAnchor.setAttribute('download', `modernblog_audit_logs_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const getSeverityBadge = (sev: string) => {
    switch (sev) {
      case 'success':
        return { bg: 'rgba(16, 185, 129, 0.12)', color: '#10B981', border: 'rgba(16, 185, 129, 0.3)', icon: CheckCircle2 };
      case 'warning':
        return { bg: 'rgba(245, 158, 11, 0.12)', color: '#F59E0B', border: 'rgba(245, 158, 11, 0.3)', icon: AlertTriangle };
      case 'danger':
        return { bg: 'rgba(239, 68, 68, 0.12)', color: '#EF4444', border: 'rgba(239, 68, 68, 0.3)', icon: XCircle };
      default:
        return { bg: 'rgba(99, 102, 241, 0.12)', color: '#818CF8', border: 'rgba(99, 102, 241, 0.3)', icon: Info };
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'Admin': return { bg: 'rgba(236, 72, 153, 0.15)', color: '#F472B6' };
      case 'Editor': return { bg: 'rgba(139, 92, 246, 0.15)', color: '#A78BFA' };
      case 'Author': return { bg: 'rgba(99, 102, 241, 0.15)', color: '#818CF8' };
      default: return { bg: 'rgba(255, 255, 255, 0.08)', color: 'var(--color-text-secondary)' };
    }
  };

  const getRelativeTime = (isoString: string) => {
    const diffMs = Date.now() - new Date(isoString).getTime();
    const diffSec = Math.floor(diffMs / 1000);
    if (diffSec < 10) return 'Just now';
    if (diffSec < 60) return `${diffSec}s ago`;
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffHr = Math.floor(diffMin / 60);
    if (diffHr < 24) return `${diffHr}h ago`;
    const diffDay = Math.floor(diffHr / 24);
    return `${diffDay}d ago`;
  };

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.6rem', marginBottom: '0.2rem', fontFamily: 'var(--font-heading)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Activity size={24} color="var(--color-secondary)" /> System Audit Trail & Logs
          </h1>
          <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
            Real-time tamper-evident recording of all user actions, publishing events, role elevations, and security audits across all portals.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
          <button
            onClick={() => fetchLogs(true)}
            disabled={refreshing}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              backgroundColor: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              color: 'var(--color-text)',
              padding: '0.45rem 0.85rem',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} /> Refresh
          </button>

          <button
            onClick={exportAsCSV}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              backgroundColor: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              color: 'var(--color-text)',
              padding: '0.45rem 0.85rem',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            <Download size={14} /> Export CSV
          </button>

          <button
            onClick={() => setClearConfirmOpen(true)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              backgroundColor: 'transparent',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              color: 'var(--color-danger)',
              padding: '0.45rem 0.85rem',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            <Trash2 size={14} /> Clear Trail
          </button>
        </div>
      </div>

      {/* Feedback Banner */}
      {feedback && (
        <div
          style={{
            padding: '0.85rem 1.25rem',
            borderRadius: 'var(--radius-md)',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            fontSize: '0.88rem',
            backgroundColor: feedback.type === 'success' ? 'rgba(16, 185, 129, 0.12)' : 'rgba(239, 68, 68, 0.12)',
            color: feedback.type === 'success' ? 'var(--color-success)' : 'var(--color-danger)',
            border: `1px solid ${feedback.type === 'success' ? 'rgba(16, 185, 129, 0.25)' : 'rgba(239, 68, 68, 0.25)'}`,
          }}
        >
          {feedback.type === 'success' ? <CheckCircle2 size={18} /> : <AlertTriangle size={18} />}
          <span>{feedback.text}</span>
        </div>
      )}

      {/* Top Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem', marginBottom: '1.75rem' }}>
        <div style={{ backgroundColor: 'var(--color-card)', padding: '1.25rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)' }}>
          <p style={{ fontSize: '0.8rem', color: 'var(--color-muted)', fontWeight: 700, margin: 0, textTransform: 'uppercase' }}>Total Logged Events</p>
          <p style={{ fontSize: '1.8rem', fontWeight: 800, margin: '0.35rem 0 0 0', color: 'var(--color-text)' }}>{stats.totalEvents}</p>
        </div>

        <div style={{ backgroundColor: 'var(--color-card)', padding: '1.25rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)' }}>
          <p style={{ fontSize: '0.8rem', color: '#818CF8', fontWeight: 700, margin: 0, textTransform: 'uppercase' }}>Story & Publishing Actions</p>
          <p style={{ fontSize: '1.8rem', fontWeight: 800, margin: '0.35rem 0 0 0', color: '#818CF8' }}>{stats.publishingActions}</p>
        </div>

        <div style={{ backgroundColor: 'var(--color-card)', padding: '1.25rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)' }}>
          <p style={{ fontSize: '0.8rem', color: '#34D399', fontWeight: 700, margin: 0, textTransform: 'uppercase' }}>Auth & Security Events</p>
          <p style={{ fontSize: '1.8rem', fontWeight: 800, margin: '0.35rem 0 0 0', color: '#34D399' }}>{stats.securityLogins}</p>
        </div>

        <div style={{ backgroundColor: 'var(--color-card)', padding: '1.25rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)' }}>
          <p style={{ fontSize: '0.8rem', color: '#F87171', fontWeight: 700, margin: 0, textTransform: 'uppercase' }}>Critical / Sensitive Events</p>
          <p style={{ fontSize: '1.8rem', fontWeight: 800, margin: '0.35rem 0 0 0', color: '#F87171' }}>{stats.criticalActions}</p>
        </div>
      </div>

      {/* Filter Category Toolbar & Search */}
      <div style={{ backgroundColor: 'var(--color-card)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', padding: '1.25rem', marginBottom: '1.5rem' }}>
        {/* Category Tabs */}
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
          {CATEGORIES.map(cat => {
            const isSelected = category === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setCategory(cat.id)}
                style={{
                  padding: '0.4rem 0.85rem',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  borderRadius: 'var(--radius-full)',
                  border: `1px solid ${isSelected ? 'var(--color-secondary)' : 'var(--color-border)'}`,
                  backgroundColor: isSelected ? 'var(--color-secondary)' : 'var(--color-surface-alt)',
                  color: isSelected ? '#FFFFFF' : 'var(--color-text-secondary)',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* Search & Severity Filter Bar */}
        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: '240px' }}>
            <Search size={16} color="var(--color-muted)" style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              placeholder="Search by user name, action, detail, or IP address..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ width: '100%', padding: '0.55rem 0.75rem 0.55rem 2.2rem', fontSize: '0.85rem' }}
            />
          </div>

          <select
            value={severity}
            onChange={e => setSeverity(e.target.value)}
            style={{ padding: '0.55rem 1rem', fontSize: '0.85rem', minWidth: '150px' }}
          >
            <option value="all">All Severities</option>
            <option value="success">Success</option>
            <option value="info">Information</option>
            <option value="warning">Warnings</option>
            <option value="danger">Critical Danger</option>
          </select>

          <button
            type="submit"
            style={{
              padding: '0.55rem 1.25rem',
              backgroundColor: 'var(--color-secondary)',
              color: '#FFFFFF',
              borderRadius: 'var(--radius-md)',
              fontWeight: 700,
              fontSize: '0.85rem',
            }}
          >
            Filter
          </button>
        </form>
      </div>

      {/* Logs Table / Stream */}
      {loading ? (
        <LoadingState message="Querying persistent audit records from Oracle Database..." />
      ) : logs.length === 0 ? (
        <EmptyState
          title="No Audit Records Found"
          description={search ? 'No audit events match your search query.' : 'Activity logs are clear.'}
        />
      ) : (
        <div style={{ backgroundColor: 'var(--color-card)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ backgroundColor: 'var(--color-surface-alt)', borderBottom: '1px solid var(--color-border)', color: 'var(--color-text-secondary)' }}>
                  <th style={{ padding: '0.85rem 1rem', fontWeight: 700, width: '190px' }}>Exact Time & Date</th>
                  <th style={{ padding: '0.85rem 1rem', fontWeight: 700, width: '180px' }}>User & Role</th>
                  <th style={{ padding: '0.85rem 1rem', fontWeight: 700, width: '220px' }}>Action & Category</th>
                  <th style={{ padding: '0.85rem 1rem', fontWeight: 700 }}>Activity Description & Details</th>
                  <th style={{ padding: '0.85rem 1rem', fontWeight: 700, width: '120px', textAlign: 'right' }}>IP Address</th>
                </tr>
              </thead>
              <tbody>
                {logs.map(log => {
                  const sevStyle = getSeverityBadge(log.severity);
                  const roleStyle = getRoleBadgeColor(log.user_role);
                  const SevIcon = sevStyle.icon;

                  return (
                    <tr key={log.log_id} style={{ borderBottom: '1px solid var(--color-border)', transition: 'background-color 0.15s ease' }}>
                      {/* Exact Timestamp & Relative Elapsed Time */}
                      <td style={{ padding: '0.85rem 1rem', whiteSpace: 'nowrap' }}>
                        <div
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.35rem',
                            backgroundColor: 'var(--color-surface-alt)',
                            border: '1px solid var(--color-border)',
                            padding: '0.2rem 0.55rem',
                            borderRadius: 'var(--radius-md)',
                            fontWeight: 800,
                            fontSize: '0.86rem',
                            color: '#38BDF8',
                            letterSpacing: '0.02em',
                            fontFamily: 'monospace',
                          }}
                        >
                          <Clock size={13} color="#38BDF8" />
                          <span>
                            {new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })}
                          </span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.35rem' }}>
                          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-secondary)' }}>
                            {new Date(log.created_at).toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' })}
                          </span>
                          <span
                            style={{
                              fontSize: '0.7rem',
                              fontWeight: 700,
                              padding: '0.05rem 0.4rem',
                              borderRadius: 'var(--radius-full)',
                              backgroundColor: 'rgba(56, 189, 248, 0.12)',
                              color: '#38BDF8',
                            }}
                          >
                            {getRelativeTime(log.created_at)}
                          </span>
                        </div>
                      </td>

                      {/* User & Role */}
                      <td style={{ padding: '0.85rem 1rem' }}>
                        <div style={{ fontWeight: 700, color: 'var(--color-text)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                          <User size={13} color="var(--color-secondary)" />
                          <span>{log.user_name}</span>
                        </div>
                        <span
                          style={{
                            display: 'inline-block',
                            marginTop: '0.25rem',
                            padding: '0.1rem 0.5rem',
                            borderRadius: 'var(--radius-full)',
                            fontSize: '0.72rem',
                            fontWeight: 700,
                            backgroundColor: roleStyle.bg,
                            color: roleStyle.color,
                          }}
                        >
                          {log.user_role}
                        </span>
                      </td>

                      {/* Action & Category */}
                      <td style={{ padding: '0.85rem 1rem' }}>
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.3rem',
                            padding: '0.2rem 0.55rem',
                            borderRadius: 'var(--radius-sm)',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            backgroundColor: sevStyle.bg,
                            color: sevStyle.color,
                            border: `1px solid ${sevStyle.border}`,
                          }}
                        >
                          <SevIcon size={12} />
                          {log.action}
                        </span>
                        <span style={{ display: 'block', fontSize: '0.72rem', color: 'var(--color-muted)', marginTop: '0.2rem', textTransform: 'uppercase', fontWeight: 600 }}>
                          {log.category}
                        </span>
                      </td>

                      {/* Activity Details */}
                      <td style={{ padding: '0.85rem 1rem', color: 'var(--color-text)', lineHeight: 1.5 }}>
                        {log.details}
                      </td>

                      {/* IP Address */}
                      <td style={{ padding: '0.85rem 1rem', textAlign: 'right', whiteSpace: 'nowrap', fontSize: '0.78rem', color: 'var(--color-muted)', fontFamily: 'monospace' }}>
                        {log.ip_address || '127.0.0.1'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Confirmation Modal to Clear Trail */}
      {clearConfirmOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.75)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 250,
            padding: '1rem',
          }}
        >
          <div
            style={{
              backgroundColor: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-lg)',
              maxWidth: '440px',
              width: '100%',
              padding: '1.75rem',
              boxShadow: 'var(--shadow-xl)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: 'var(--radius-full)', backgroundColor: 'rgba(239, 68, 68, 0.15)', color: 'var(--color-danger)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Trash2 size={22} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0 }}>Clear All Audit Logs?</h3>
                <p style={{ fontSize: '0.82rem', color: 'var(--color-text-secondary)', margin: 0 }}>This action permanently resets the historical activity trail.</p>
              </div>
            </div>

            <p style={{ fontSize: '0.88rem', color: 'var(--color-text)', lineHeight: 1.5, marginBottom: '1.5rem' }}>
              Are you sure you want to purge all recorded system activity logs? A single audit event marking this clearance will be preserved.
            </p>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <button
                type="button"
                onClick={() => setClearConfirmOpen(false)}
                style={{
                  padding: '0.55rem 1.1rem',
                  backgroundColor: 'transparent',
                  border: '1px solid var(--color-border)',
                  color: 'var(--color-text)',
                  borderRadius: 'var(--radius-md)',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleClearLogs}
                disabled={clearing}
                style={{
                  padding: '0.55rem 1.35rem',
                  backgroundColor: 'var(--color-danger)',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: 'var(--radius-md)',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  cursor: clearing ? 'not-allowed' : 'pointer',
                }}
              >
                {clearing ? 'Clearing...' : 'Confirm Purge'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
