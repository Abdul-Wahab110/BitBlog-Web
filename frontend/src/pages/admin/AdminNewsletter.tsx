import React, { useState, useEffect, useCallback } from 'react';
import {
  Mail,
  Search,
  Plus,
  Edit2,
  Trash2,
  Download,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Clock,
  User,
  Tag,
  FileText,
  X,
  AlertCircle,
  Copy,
  Check,
  Filter,
  ThumbsUp,
  ThumbsDown,
  ShieldAlert,
} from 'lucide-react';
import { LoadingState } from '../../components/common/LoadingState';
import { EmptyState } from '../../components/common/EmptyState';
import { ApiService } from '../../services/api';

const ALL_TOPICS = [
  'Technology & AI',
  'Web Development',
  'Design & UX',
  'Startups & Business',
  'Weekly Digest',
  'General',
];

interface Subscriber {
  subscriber_id: number;
  email: string;
  name?: string;
  topics?: string[];
  status: 'SUBSCRIBED' | 'UNSUBSCRIBED' | 'PENDING' | 'REJECTED';
  subscribed_at: string;
  unsubscribed_at?: string;
  notes?: string;
}

interface Stats {
  total: number;
  active: number;
  unsubscribed: number;
  pending: number;
  rejected: number;
}

export const AdminNewsletter: React.FC = () => {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [stats, setStats] = useState<Stats>({ total: 0, active: 0, unsubscribed: 0, pending: 0, rejected: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Modals state
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingSub, setEditingSub] = useState<Subscriber | null>(null);
  const [deletingSub, setDeletingSub] = useState<Subscriber | null>(null);

  // Form inputs state (for Add and Edit)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    status: 'PENDING' as 'SUBSCRIBED' | 'UNSUBSCRIBED' | 'PENDING' | 'REJECTED',
    topics: [] as string[],
    notes: '',
  });

  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [copiedId, setCopiedId] = useState<number | null>(null);

  const fetchSubscribers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await ApiService.getNewsletterSubscribers({
        search: search.trim() || undefined,
        status: statusFilter,
      });
      if (res && res.data) {
        if (Array.isArray(res.data)) {
          setSubscribers(res.data);
          const total = res.data.length;
          const active = res.data.filter((s: any) => s.status === 'SUBSCRIBED').length;
          const pending = res.data.filter((s: any) => s.status === 'PENDING' || (!s.status && s.status !== 'SUBSCRIBED')).length;
          const rejected = res.data.filter((s: any) => s.status === 'REJECTED').length;
          const unsubscribed = res.data.filter((s: any) => s.status === 'UNSUBSCRIBED').length;
          setStats({ total, active, unsubscribed, pending, rejected });
        } else if (res.data.subscribers) {
          setSubscribers(res.data.subscribers);
          if (res.data.stats) setStats(res.data.stats);
        }
      }
    } catch {
      setSubscribers([]);
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter]);

  useEffect(() => {
    fetchSubscribers();
  }, [fetchSubscribers]);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setNotification({ type, message });
    setTimeout(() => {
      setNotification(null);
    }, 4000);
  };

  const handleOpenAdd = () => {
    setFormData({
      name: '',
      email: '',
      status: 'SUBSCRIBED',
      topics: ['Technology & AI', 'Weekly Digest'],
      notes: '',
    });
    setFormError(null);
    setShowAddModal(true);
  };

  const handleOpenEdit = (sub: Subscriber) => {
    setEditingSub(sub);
    setFormData({
      name: sub.name || '',
      email: sub.email,
      status: sub.status || 'PENDING',
      topics: sub.topics && sub.topics.length > 0 ? sub.topics : ['General'],
      notes: sub.notes || '',
    });
    setFormError(null);
  };

  const handleToggleTopic = (topic: string) => {
    setFormData(prev => ({
      ...prev,
      topics: prev.topics.includes(topic)
        ? prev.topics.filter(t => t !== topic)
        : [...prev.topics, topic],
    }));
  };

  const handleSaveAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email.trim() || !formData.email.includes('@')) {
      setFormError('Please enter a valid email address.');
      return;
    }

    setFormLoading(true);
    setFormError(null);

    try {
      await ApiService.createNewsletterSubscriber({
        email: formData.email.trim(),
        name: formData.name.trim() || undefined,
        status: formData.status,
        topics: formData.topics,
        notes: formData.notes.trim() || undefined,
      });

      setShowAddModal(false);
      showToast(`Subscriber ${formData.email} created successfully!`);
      fetchSubscribers();
    } catch (err: any) {
      setFormError(err.message || 'Failed to add subscriber');
    } finally {
      setFormLoading(false);
    }
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSub) return;

    if (!formData.email.trim() || !formData.email.includes('@')) {
      setFormError('Please enter a valid email address.');
      return;
    }

    setFormLoading(true);
    setFormError(null);

    try {
      await ApiService.updateNewsletterSubscriber(editingSub.subscriber_id, {
        email: formData.email.trim(),
        name: formData.name.trim() || '',
        status: formData.status,
        topics: formData.topics,
        notes: formData.notes.trim() || '',
      });

      setEditingSub(null);
      showToast(`Subscriber ${formData.email} updated successfully!`);
      fetchSubscribers();
    } catch (err: any) {
      setFormError(err.message || 'Failed to update subscriber');
    } finally {
      setFormLoading(false);
    }
  };

  const handleApprove = async (id: number, email: string) => {
    try {
      await ApiService.approveNewsletterSubscriber(id);
      showToast(`Approved subscriber: ${email}`);
      fetchSubscribers();
    } catch (err: any) {
      showToast(err.message || 'Failed to approve subscriber', 'error');
    }
  };

  const handleReject = async (id: number, email: string) => {
    try {
      await ApiService.rejectNewsletterSubscriber(id);
      showToast(`Rejected subscription for: ${email}`);
      fetchSubscribers();
    } catch (err: any) {
      showToast(err.message || 'Failed to reject subscriber', 'error');
    }
  };

  const handleQuickStatusChange = async (id: number, status: 'SUBSCRIBED' | 'UNSUBSCRIBED' | 'PENDING' | 'REJECTED') => {
    try {
      await ApiService.updateNewsletterSubscriberStatus(id, status);
      showToast(`Status updated to ${status}`);
      fetchSubscribers();
    } catch (err: any) {
      showToast(err.message || 'Failed to update status', 'error');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingSub) return;
    try {
      await ApiService.deleteNewsletterSubscriber(deletingSub.subscriber_id);
      showToast(`Subscriber ${deletingSub.email} removed.`);
      setDeletingSub(null);
      fetchSubscribers();
    } catch (err: any) {
      showToast(err.message || 'Failed to delete subscriber', 'error');
    }
  };

  const handleCopyEmail = (email: string, id: number) => {
    navigator.clipboard.writeText(email);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleExportCSV = () => {
    if (subscribers.length === 0) {
      showToast('No subscriber data to export.', 'error');
      return;
    }

    const headers = ['ID', 'Email', 'Name', 'Status', 'Topics', 'Subscribed Date', 'Notes'];
    const rows = subscribers.map(s => [
      s.subscriber_id,
      `"${s.email}"`,
      `"${s.name || ''}"`,
      s.status || 'PENDING',
      `"${(s.topics || []).join(', ')}"`,
      `"${new Date(s.subscribed_at).toISOString()}"`,
      `"${(s.notes || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `bitblog_subscribers_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Subscribers CSV exported successfully!');
  };

  return (
    <div style={{ paddingBottom: '3rem' }}>
      {/* Toast Notification Alert */}
      {notification && (
        <div
          style={{
            position: 'fixed',
            top: '20px',
            right: '20px',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            gap: '0.6rem',
            padding: '0.85rem 1.25rem',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'var(--color-surface)',
            borderLeft: `4px solid ${notification.type === 'success' ? 'var(--color-success)' : 'var(--color-danger)'}`,
            boxShadow: 'var(--shadow-xl)',
            fontSize: '0.875rem',
            fontWeight: 600,
            color: 'var(--color-text)',
          }}
        >
          {notification.type === 'success' ? (
            <CheckCircle2 size={18} color="var(--color-success)" />
          ) : (
            <AlertCircle size={18} color="var(--color-danger)" />
          )}
          <span>{notification.message}</span>
        </div>
      )}

      {/* Header Section */}
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ fontSize: '1.6rem', marginBottom: '0.2rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Mail size={24} color="var(--color-secondary)" /> Newsletter Moderation & Subscribers
          </h1>
          <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', margin: 0 }}>
            Review pending subscriber requests, approve or reject applications, and manage active mailing lists.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <button
            onClick={handleExportCSV}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              backgroundColor: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              color: 'var(--color-text)',
              padding: '0.55rem 0.95rem',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all var(--transition-fast)',
            }}
          >
            <Download size={15} /> Export CSV
          </button>

          <button
            onClick={handleOpenAdd}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              backgroundColor: 'var(--color-secondary)',
              color: '#FFFFFF',
              padding: '0.55rem 1rem',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.85rem',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 2px 8px var(--color-secondary-glow)',
              transition: 'all var(--transition-fast)',
            }}
          >
            <Plus size={16} /> Add Subscriber
          </button>
        </div>
      </div>

      {/* Stats Cards Row */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '1rem',
          marginBottom: '1.5rem',
        }}
      >
        {/* Pending Approval Priority Card */}
        <div
          onClick={() => setStatusFilter('PENDING')}
          style={{
            backgroundColor: stats.pending > 0 ? 'rgba(245, 158, 11, 0.08)' : 'var(--color-card)',
            padding: '1.15rem 1.25rem',
            borderRadius: 'var(--radius-lg)',
            border: stats.pending > 0 ? '2px solid rgba(245, 158, 11, 0.5)' : '1px solid var(--color-border)',
            boxShadow: 'var(--shadow-sm)',
            cursor: 'pointer',
            transition: 'all var(--transition-fast)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 800, textTransform: 'uppercase', color: '#F59E0B', letterSpacing: '0.05em' }}>
              Pending Approval
            </span>
            <Clock size={18} color="#F59E0B" />
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#F59E0B' }}>{stats.pending}</div>
          <span style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>
            {stats.pending > 0 ? 'Requires admin action' : 'All requests reviewed'}
          </span>
        </div>

        {/* Active Subscribed */}
        <div
          onClick={() => setStatusFilter('SUBSCRIBED')}
          style={{
            backgroundColor: 'var(--color-card)',
            padding: '1.15rem 1.25rem',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--color-border)',
            boxShadow: 'var(--shadow-sm)',
            cursor: 'pointer',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-success)', letterSpacing: '0.05em' }}>
              Active Subscribed
            </span>
            <CheckCircle2 size={16} color="var(--color-success)" />
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--color-success)' }}>{stats.active}</div>
          <span style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>Approved active audience</span>
        </div>

        {/* Rejected */}
        <div
          onClick={() => setStatusFilter('REJECTED')}
          style={{
            backgroundColor: 'var(--color-card)',
            padding: '1.15rem 1.25rem',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--color-border)',
            boxShadow: 'var(--shadow-sm)',
            cursor: 'pointer',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-danger)', letterSpacing: '0.05em' }}>
              Rejected Requests
            </span>
            <XCircle size={16} color="var(--color-danger)" />
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--color-danger)' }}>{stats.rejected}</div>
          <span style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>Declined by moderator</span>
        </div>

        {/* Unsubscribed */}
        <div
          onClick={() => setStatusFilter('UNSUBSCRIBED')}
          style={{
            backgroundColor: 'var(--color-card)',
            padding: '1.15rem 1.25rem',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--color-border)',
            boxShadow: 'var(--shadow-sm)',
            cursor: 'pointer',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-muted)', letterSpacing: '0.05em' }}>
              Unsubscribed
            </span>
            <ShieldAlert size={16} color="var(--color-muted)" />
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--color-text-secondary)' }}>{stats.unsubscribed}</div>
          <span style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>Self opted out readers</span>
        </div>

        {/* Total Audience */}
        <div
          onClick={() => setStatusFilter('ALL')}
          style={{
            backgroundColor: 'var(--color-card)',
            padding: '1.15rem 1.25rem',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--color-border)',
            boxShadow: 'var(--shadow-sm)',
            cursor: 'pointer',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-secondary)', letterSpacing: '0.05em' }}>
              Total Audience
            </span>
            <Mail size={16} color="var(--color-secondary)" />
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--color-text)' }}>{stats.total}</div>
          <span style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>Total registered entries</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div
        style={{
          backgroundColor: 'var(--color-card)',
          padding: '1rem',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--color-border)',
          marginBottom: '1rem',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '0.75rem',
        }}
      >
        <div style={{ display: 'flex', flex: 1, minWidth: '240px', alignItems: 'center', gap: '0.5rem', position: 'relative' }}>
          <Search size={16} color="var(--color-muted)" style={{ position: 'absolute', left: '0.85rem' }} />
          <input
            type="search"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search subscriber name, email address, or topic..."
            style={{
              width: '100%',
              padding: '0.55rem 1rem 0.55rem 2.4rem',
              fontSize: '0.875rem',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--color-border)',
              backgroundColor: 'var(--color-background)',
            }}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Filter size={15} color="var(--color-muted)" />
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              style={{
                padding: '0.55rem 0.85rem',
                fontSize: '0.85rem',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--color-border)',
                backgroundColor: 'var(--color-background)',
                color: 'var(--color-text)',
                cursor: 'pointer',
                fontWeight: 600,
              }}
            >
              <option value="ALL">All Statuses ({stats.total})</option>
              <option value="PENDING">⏳ Pending Approval ({stats.pending})</option>
              <option value="SUBSCRIBED">✓ Subscribed / Active ({stats.active})</option>
              <option value="REJECTED">✕ Rejected ({stats.rejected})</option>
              <option value="UNSUBSCRIBED">⊘ Unsubscribed ({stats.unsubscribed})</option>
            </select>
          </div>

          <button
            onClick={fetchSubscribers}
            title="Refresh list"
            style={{
              background: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              color: 'var(--color-text-secondary)',
              padding: '0.55rem',
              borderRadius: 'var(--radius-md)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <RefreshCw size={15} />
          </button>
        </div>
      </div>

      {/* Main Subscribers Table */}
      {loading ? (
        <LoadingState message="Fetching subscriber records and pending requests..." />
      ) : subscribers.length === 0 ? (
        <EmptyState
          title="No Subscribers Found"
          description={
            statusFilter === 'PENDING'
              ? 'Great! There are no pending subscriber requests waiting for approval.'
              : search || statusFilter !== 'ALL'
              ? 'No subscribers match your search filter criteria.'
              : 'No newsletter subscribers registered yet. Reader subscriptions submitted on the website will arrive in PENDING status for your review.'
          }
        />
      ) : (
        <div
          className="table-responsive"
          style={{
            backgroundColor: 'var(--color-card)',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--color-border)',
            overflow: 'hidden',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
            <thead>
              <tr
                style={{
                  backgroundColor: 'var(--color-surface-alt)',
                  borderBottom: '1px solid var(--color-border)',
                  color: 'var(--color-text-secondary)',
                  fontWeight: 700,
                  fontSize: '0.8rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                }}
              >
                <th style={{ padding: '0.85rem 1.15rem' }}>Subscriber</th>
                <th style={{ padding: '0.85rem 1.15rem' }}>Topics / Interests</th>
                <th style={{ padding: '0.85rem 1.15rem' }}>Status</th>
                <th style={{ padding: '0.85rem 1.15rem' }}>Submitted Date</th>
                <th style={{ padding: '0.85rem 1.15rem', textAlign: 'right' }}>Admin Actions</th>
              </tr>
            </thead>
            <tbody>
              {subscribers.map(sub => {
                const isCopied = copiedId === sub.subscriber_id;
                const isPending = sub.status === 'PENDING' || !sub.status;
                const statusColor =
                  sub.status === 'SUBSCRIBED'
                    ? { bg: 'rgba(16, 185, 129, 0.12)', text: 'var(--color-success)', border: 'rgba(16, 185, 129, 0.25)' }
                    : sub.status === 'REJECTED'
                    ? { bg: 'rgba(239, 68, 68, 0.15)', text: 'var(--color-danger)', border: 'rgba(239, 68, 68, 0.3)' }
                    : sub.status === 'UNSUBSCRIBED'
                    ? { bg: 'rgba(107, 114, 128, 0.15)', text: 'var(--color-muted)', border: 'rgba(107, 114, 128, 0.3)' }
                    : { bg: 'rgba(245, 158, 11, 0.15)', text: '#D97706', border: 'rgba(245, 158, 11, 0.4)' };

                return (
                  <tr
                    key={sub.subscriber_id}
                    style={{
                      borderBottom: '1px solid var(--color-border)',
                      backgroundColor: isPending ? 'rgba(245, 158, 11, 0.03)' : 'transparent',
                      transition: 'background-color var(--transition-fast)',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.backgroundColor = isPending ? 'rgba(245, 158, 11, 0.08)' : 'var(--color-surface-alt)')}
                    onMouseLeave={e => (e.currentTarget.style.backgroundColor = isPending ? 'rgba(245, 158, 11, 0.03)' : 'transparent')}
                  >
                    {/* Subscriber Info */}
                    <td style={{ padding: '0.9rem 1.15rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div
                          style={{
                            width: '36px',
                            height: '36px',
                            borderRadius: '50%',
                            backgroundColor: isPending ? 'rgba(245, 158, 11, 0.2)' : 'var(--color-surface-alt)',
                            border: `1px solid ${isPending ? 'rgba(245, 158, 11, 0.4)' : 'var(--color-border)'}`,
                            color: isPending ? '#D97706' : 'var(--color-secondary)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 700,
                            fontSize: '0.85rem',
                            flexShrink: 0,
                          }}
                        >
                          {sub.name ? sub.name.charAt(0).toUpperCase() : <Mail size={16} />}
                        </div>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                            <span style={{ fontWeight: 700, color: 'var(--color-text)' }}>
                              {sub.name || 'Unnamed Subscriber'}
                            </span>
                            {isPending && (
                              <span
                                style={{
                                  fontSize: '0.68rem',
                                  padding: '0.1rem 0.4rem',
                                  borderRadius: 'var(--radius-sm)',
                                  backgroundColor: 'rgba(245, 158, 11, 0.2)',
                                  color: '#D97706',
                                  fontWeight: 700,
                                }}
                              >
                                NEW REQUEST
                              </span>
                            )}
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--color-text-secondary)', fontSize: '0.8rem' }}>
                            <span>{sub.email}</span>
                            <button
                              type="button"
                              onClick={() => handleCopyEmail(sub.email, sub.subscriber_id)}
                              title="Copy email"
                              style={{ background: 'none', border: 'none', padding: '2px', cursor: 'pointer', color: 'var(--color-muted)' }}
                            >
                              {isCopied ? <Check size={12} color="var(--color-success)" /> : <Copy size={12} />}
                            </button>
                          </div>
                          {sub.notes && (
                            <div style={{ fontSize: '0.75rem', color: 'var(--color-muted)', fontStyle: 'italic', marginTop: '0.2rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                              <FileText size={11} /> {sub.notes}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Topics badges */}
                    <td style={{ padding: '0.9rem 1.15rem' }}>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem', maxWidth: '280px' }}>
                        {sub.topics && sub.topics.length > 0 ? (
                          sub.topics.map(topic => (
                            <span
                              key={topic}
                              style={{
                                padding: '0.15rem 0.5rem',
                                borderRadius: 'var(--radius-full)',
                                fontSize: '0.72rem',
                                fontWeight: 600,
                                backgroundColor: 'var(--color-surface)',
                                border: '1px solid var(--color-border)',
                                color: 'var(--color-text-secondary)',
                              }}
                            >
                              {topic}
                            </span>
                          ))
                        ) : (
                          <span style={{ fontSize: '0.75rem', color: 'var(--color-muted)' }}>All Highlights</span>
                        )}
                      </div>
                    </td>

                    {/* Status with Quick Toggle */}
                    <td style={{ padding: '0.9rem 1.15rem' }}>
                      <select
                        value={sub.status || 'PENDING'}
                        onChange={e => handleQuickStatusChange(sub.subscriber_id, e.target.value as any)}
                        style={{
                          padding: '0.3rem 0.65rem',
                          borderRadius: 'var(--radius-full)',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          backgroundColor: statusColor.bg,
                          color: statusColor.text,
                          border: `1px solid ${statusColor.border}`,
                          cursor: 'pointer',
                        }}
                      >
                        <option value="PENDING">⏳ PENDING</option>
                        <option value="SUBSCRIBED">✓ SUBSCRIBED</option>
                        <option value="REJECTED">✕ REJECTED</option>
                        <option value="UNSUBSCRIBED">⊘ UNSUBSCRIBED</option>
                      </select>
                    </td>

                    {/* Date */}
                    <td style={{ padding: '0.9rem 1.15rem', color: 'var(--color-text-secondary)', fontSize: '0.82rem' }}>
                      {new Date(sub.subscribed_at).toLocaleDateString(undefined, {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </td>

                    {/* Actions: Approve / Reject 1-click or Edit / Delete */}
                    <td style={{ padding: '0.9rem 1.15rem', textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                        {isPending && (
                          <>
                            {/* Approve Button */}
                            <button
                              onClick={() => handleApprove(sub.subscriber_id, sub.email)}
                              title="Approve Subscriber"
                              style={{
                                padding: '0.35rem 0.65rem',
                                borderRadius: 'var(--radius-md)',
                                border: 'none',
                                backgroundColor: 'var(--color-success)',
                                color: '#FFFFFF',
                                fontSize: '0.78rem',
                                fontWeight: 700,
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.3rem',
                                cursor: 'pointer',
                                boxShadow: '0 2px 6px rgba(16, 185, 129, 0.3)',
                              }}
                            >
                              <ThumbsUp size={13} /> Approve
                            </button>

                            {/* Reject Button */}
                            <button
                              onClick={() => handleReject(sub.subscriber_id, sub.email)}
                              title="Reject Subscription Request"
                              style={{
                                padding: '0.35rem 0.65rem',
                                borderRadius: 'var(--radius-md)',
                                border: '1px solid rgba(239, 68, 68, 0.4)',
                                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                                color: 'var(--color-danger)',
                                fontSize: '0.78rem',
                                fontWeight: 700,
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.3rem',
                                cursor: 'pointer',
                              }}
                            >
                              <ThumbsDown size={13} /> Reject
                            </button>
                          </>
                        )}

                        <button
                          onClick={() => handleOpenEdit(sub)}
                          title="Edit Details"
                          style={{
                            padding: '0.35rem 0.55rem',
                            borderRadius: 'var(--radius-md)',
                            border: '1px solid var(--color-border)',
                            backgroundColor: 'var(--color-surface)',
                            color: 'var(--color-secondary)',
                            fontSize: '0.78rem',
                            fontWeight: 600,
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.25rem',
                            cursor: 'pointer',
                          }}
                        >
                          <Edit2 size={13} /> Edit
                        </button>

                        <button
                          onClick={() => setDeletingSub(sub)}
                          title="Delete Subscriber"
                          style={{
                            padding: '0.35rem 0.5rem',
                            borderRadius: 'var(--radius-md)',
                            border: '1px solid var(--color-border)',
                            backgroundColor: 'var(--color-surface)',
                            color: 'var(--color-danger)',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                          }}
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Add / Edit Subscriber Modal Dialog */}
      {(showAddModal || editingSub) && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'var(--color-overlay)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '1rem',
          }}
        >
          <div
            style={{
              backgroundColor: 'var(--color-card)',
              borderRadius: 'var(--radius-xl)',
              border: '1px solid var(--color-border)',
              boxShadow: 'var(--shadow-xl)',
              width: '100%',
              maxWidth: '520px',
              padding: '1.75rem',
              maxHeight: '90vh',
              overflowY: 'auto',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '1px solid var(--color-border)', paddingBottom: '0.75rem' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Mail size={18} color="var(--color-secondary)" />
                {editingSub ? 'Edit Subscriber Details' : 'Add New Subscriber'}
              </h3>
              <button
                type="button"
                onClick={() => {
                  setShowAddModal(false);
                  setEditingSub(null);
                }}
                style={{ background: 'none', border: 'none', color: 'var(--color-muted)', cursor: 'pointer', padding: '0.2rem' }}
              >
                <X size={20} />
              </button>
            </div>

            {formError && (
              <div
                style={{
                  padding: '0.75rem 1rem',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'rgba(239, 68, 68, 0.12)',
                  color: 'var(--color-danger)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  marginBottom: '1rem',
                  fontSize: '0.85rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                }}
              >
                <AlertCircle size={16} /> {formError}
              </div>
            )}

            <form onSubmit={editingSub ? handleSaveEdit : handleSaveAdd} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: '0.35rem' }}>
                  Email Address <span style={{ color: 'var(--color-danger)' }}>*</span>
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                  placeholder="subscriber@example.com"
                  required
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.85rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--color-border)',
                    backgroundColor: 'var(--color-background)',
                    color: 'var(--color-text)',
                    fontSize: '0.9rem',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: '0.35rem' }}>
                  Subscriber Name (Optional)
                </label>
                <div style={{ position: 'relative' }}>
                  <User size={16} color="var(--color-muted)" style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)' }} />
                  <input
                    type="text"
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Full name or alias"
                    style={{
                      width: '100%',
                      padding: '0.65rem 0.85rem 0.65rem 2.4rem',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--color-border)',
                      backgroundColor: 'var(--color-background)',
                      color: 'var(--color-text)',
                      fontSize: '0.9rem',
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: '0.35rem' }}>
                  Subscription Status
                </label>
                <select
                  value={formData.status}
                  onChange={e => setFormData({ ...formData, status: e.target.value as any })}
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.85rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--color-border)',
                    backgroundColor: 'var(--color-background)',
                    color: 'var(--color-text)',
                    fontSize: '0.9rem',
                    fontWeight: 600,
                  }}
                >
                  <option value="PENDING">⏳ PENDING (Awaiting admin approval)</option>
                  <option value="SUBSCRIBED">✓ SUBSCRIBED (Approved & Active)</option>
                  <option value="REJECTED">✕ REJECTED (Declined)</option>
                  <option value="UNSUBSCRIBED">⊘ UNSUBSCRIBED (Opted out)</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: '0.45rem' }}>
                  Subscribed Topics of Interest
                </label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                  {ALL_TOPICS.map(topic => {
                    const isSelected = formData.topics.includes(topic);
                    return (
                      <button
                        key={topic}
                        type="button"
                        onClick={() => handleToggleTopic(topic)}
                        style={{
                          padding: '0.3rem 0.75rem',
                          borderRadius: 'var(--radius-full)',
                          fontSize: '0.78rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                          border: `1px solid ${isSelected ? 'var(--color-secondary)' : 'var(--color-border)'}`,
                          backgroundColor: isSelected ? 'var(--color-secondary)' : 'var(--color-surface)',
                          color: isSelected ? '#FFFFFF' : 'var(--color-text-secondary)',
                          transition: 'all var(--transition-fast)',
                        }}
                      >
                        {isSelected ? '✓ ' : '+ '}{topic}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: '0.35rem' }}>
                  Internal Admin Notes (Optional)
                </label>
                <textarea
                  rows={3}
                  value={formData.notes}
                  onChange={e => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Notes about verification, source, or approval..."
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.85rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--color-border)',
                    backgroundColor: 'var(--color-background)',
                    color: 'var(--color-text)',
                    fontSize: '0.85rem',
                    resize: 'vertical',
                  }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.6rem', marginTop: '0.5rem', borderTop: '1px solid var(--color-border)', paddingTop: '1rem' }}>
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setEditingSub(null);
                  }}
                  style={{
                    padding: '0.6rem 1.15rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--color-border)',
                    backgroundColor: 'transparent',
                    color: 'var(--color-text)',
                    fontSize: '0.875rem',
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  style={{
                    padding: '0.6rem 1.35rem',
                    borderRadius: 'var(--radius-md)',
                    border: 'none',
                    backgroundColor: 'var(--color-secondary)',
                    color: '#FFFFFF',
                    fontSize: '0.875rem',
                    fontWeight: 700,
                    cursor: formLoading ? 'not-allowed' : 'pointer',
                    boxShadow: '0 2px 8px var(--color-secondary-glow)',
                  }}
                >
                  {formLoading ? 'Saving...' : editingSub ? 'Save Changes' : 'Create Subscriber'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingSub && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'var(--color-overlay)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '1rem',
          }}
        >
          <div
            style={{
              backgroundColor: 'var(--color-card)',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--color-border)',
              padding: '1.5rem',
              maxWidth: '420px',
              width: '100%',
              boxShadow: 'var(--shadow-xl)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: 'var(--color-danger)', marginBottom: '0.75rem' }}>
              <Trash2 size={20} />
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0 }}>Remove Subscriber?</h3>
            </div>
            <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', lineHeight: 1.5, marginBottom: '1.25rem' }}>
              Are you sure you want to remove <strong>{deletingSub.email}</strong>?
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.6rem' }}>
              <button
                onClick={() => setDeletingSub(null)}
                style={{
                  padding: '0.55rem 1rem',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--color-border)',
                  backgroundColor: 'transparent',
                  color: 'var(--color-text)',
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                style={{
                  padding: '0.55rem 1.1rem',
                  borderRadius: 'var(--radius-md)',
                  border: 'none',
                  backgroundColor: 'var(--color-danger)',
                  color: '#FFFFFF',
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                Yes, Remove
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};


