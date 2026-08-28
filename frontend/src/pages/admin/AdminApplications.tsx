import React, { useState, useEffect } from 'react';
import { Award, PenTool, CheckCircle2, XCircle, Clock, Search, Filter, ExternalLink, MessageSquare, AlertCircle, Shield, User, Check, X } from 'lucide-react';
import { LoadingState } from '../../components/common/LoadingState';
import { EmptyState } from '../../components/common/EmptyState';
import { ApiService } from '../../services/api';

export const AdminApplications: React.FC = () => {
  const [applications, setApplications] = useState<any[]>([]);
  const [stats, setStats] = useState({ total: 0, pending: 0, approved: 0, rejected: 0 });
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');
  const [searchQuery, setSearchQuery] = useState('');

  // Review Modal / Action State
  const [selectedApp, setSelectedApp] = useState<any | null>(null);
  const [actionType, setActionType] = useState<'approved' | 'rejected' | null>(null);
  const [feedback, setFeedback] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [alertMsg, setAlertMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    fetchApplications();
  }, [filter]);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const res = await ApiService.getAdminApplications(filter);
      if (res && res.data) {
        setApplications(res.data.applications || []);
        if (res.data.stats) {
          setStats(res.data.stats);
        }
      }
    } catch (err) {
      console.error('Failed to load applications:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenReview = (app: any, type: 'approved' | 'rejected') => {
    setSelectedApp(app);
    setActionType(type);
    setFeedback(type === 'approved' ? 'Congratulations! Your writing samples and background have been approved. Welcome to the editorial staff!' : '');
  };

  const handleConfirmReview = async () => {
    if (!selectedApp || !actionType) return;

    setSubmitting(true);
    setAlertMsg(null);

    try {
      await ApiService.reviewAdminApplication(selectedApp.application_id, actionType, feedback.trim());
      setAlertMsg({
        type: 'success',
        text: `Application #${selectedApp.application_id} has been ${actionType}! User role automatically updated in database.`,
      });
      setSelectedApp(null);
      setActionType(null);
      fetchApplications();
    } catch (err: any) {
      setAlertMsg({
        type: 'error',
        text: err.message || 'Failed to review application.',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const filteredApplications = applications.filter(app => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      app.name?.toLowerCase().includes(q) ||
      app.email?.toLowerCase().includes(q) ||
      app.username?.toLowerCase().includes(q) ||
      app.role_applied?.toLowerCase().includes(q) ||
      app.bio?.toLowerCase().includes(q)
    );
  });

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.6rem', marginBottom: '0.2rem', fontFamily: 'var(--font-heading)' }}>
            Staff Role Applications
          </h1>
          <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
            Review contributor applications from readers wishing to become verified Authors or Editors.
          </p>
        </div>
      </div>

      {/* Alert Banner */}
      {alertMsg && (
        <div
          style={{
            padding: '1rem 1.25rem',
            borderRadius: 'var(--radius-md)',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            fontSize: '0.9rem',
            backgroundColor: alertMsg.type === 'success' ? 'rgba(16, 185, 129, 0.12)' : 'rgba(239, 68, 68, 0.12)',
            color: alertMsg.type === 'success' ? 'var(--color-success)' : 'var(--color-danger)',
            border: `1px solid ${alertMsg.type === 'success' ? 'rgba(16, 185, 129, 0.25)' : 'rgba(239, 68, 68, 0.25)'}`,
          }}
        >
          {alertMsg.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          <span>{alertMsg.text}</span>
        </div>
      )}

      {/* Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem', marginBottom: '1.75rem' }}>
        <div style={{ backgroundColor: 'var(--color-card)', padding: '1.25rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)' }}>
          <p style={{ fontSize: '0.8rem', color: 'var(--color-muted)', fontWeight: 700, margin: 0, textTransform: 'uppercase' }}>Total Submissions</p>
          <p style={{ fontSize: '1.8rem', fontWeight: 800, margin: '0.35rem 0 0 0', color: 'var(--color-text)' }}>{stats.total}</p>
        </div>

        <div style={{ backgroundColor: 'var(--color-card)', padding: '1.25rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)' }}>
          <p style={{ fontSize: '0.8rem', color: 'var(--color-warning)', fontWeight: 700, margin: 0, textTransform: 'uppercase' }}>Pending Review</p>
          <p style={{ fontSize: '1.8rem', fontWeight: 800, margin: '0.35rem 0 0 0', color: 'var(--color-warning)' }}>{stats.pending}</p>
        </div>

        <div style={{ backgroundColor: 'var(--color-card)', padding: '1.25rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)' }}>
          <p style={{ fontSize: '0.8rem', color: 'var(--color-success)', fontWeight: 700, margin: 0, textTransform: 'uppercase' }}>Approved Roles</p>
          <p style={{ fontSize: '1.8rem', fontWeight: 800, margin: '0.35rem 0 0 0', color: 'var(--color-success)' }}>{stats.approved}</p>
        </div>

        <div style={{ backgroundColor: 'var(--color-card)', padding: '1.25rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)' }}>
          <p style={{ fontSize: '0.8rem', color: 'var(--color-danger)', fontWeight: 700, margin: 0, textTransform: 'uppercase' }}>Rejected</p>
          <p style={{ fontSize: '1.8rem', fontWeight: 800, margin: '0.35rem 0 0 0', color: 'var(--color-danger)' }}>{stats.rejected}</p>
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        {/* Filter Buttons */}
        <div style={{ display: 'flex', gap: '0.5rem', backgroundColor: 'var(--color-surface-alt)', padding: '0.25rem', borderRadius: 'var(--radius-md)' }}>
          {(['pending', 'all', 'approved', 'rejected'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              style={{
                padding: '0.45rem 0.95rem',
                fontSize: '0.85rem',
                fontWeight: 600,
                borderRadius: 'var(--radius-sm)',
                backgroundColor: filter === tab ? 'var(--color-secondary)' : 'transparent',
                color: filter === tab ? '#FFFFFF' : 'var(--color-text-secondary)',
                textTransform: 'capitalize',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              {tab} {tab === 'pending' && stats.pending > 0 ? `(${stats.pending})` : ''}
            </button>
          ))}
        </div>

        {/* Search */}
        <div style={{ position: 'relative', minWidth: '260px' }}>
          <Search size={16} color="var(--color-muted)" style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            placeholder="Search applicants..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            style={{ width: '100%', padding: '0.5rem 0.75rem 0.5rem 2.2rem', fontSize: '0.85rem' }}
          />
        </div>
      </div>

      {/* Applications List */}
      {loading ? (
        <LoadingState message="Loading role applications from Oracle database..." />
      ) : filteredApplications.length === 0 ? (
        <EmptyState
          title={`No ${filter !== 'all' ? filter : ''} Applications Found`}
          description={filter === 'pending' ? 'All contributor applications have been processed and reviewed.' : 'No role applications match the selected criteria.'}
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {filteredApplications.map(app => (
            <div
              key={app.application_id}
              style={{
                backgroundColor: 'var(--color-card)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-lg)',
                padding: '1.5rem',
                boxShadow: 'var(--shadow-sm)',
                transition: 'border-color 0.2s ease',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
                {/* Applicant Profile */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                  <div style={{ width: '42px', height: '42px', borderRadius: 'var(--radius-full)', backgroundColor: 'var(--color-surface-alt)', border: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, color: 'var(--color-secondary)' }}>
                    {app.name ? app.name[0].toUpperCase() : 'A'}
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      {app.name}
                      <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-muted)' }}>@{app.username}</span>
                    </h3>
                    <p style={{ fontSize: '0.82rem', color: 'var(--color-text-secondary)', margin: '0.15rem 0 0 0' }}>{app.email}</p>
                  </div>
                </div>

                {/* Role & Status Badges */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      padding: '0.3rem 0.75rem',
                      borderRadius: 'var(--radius-full)',
                      backgroundColor: app.role_applied === 'Editor' ? 'rgba(139, 92, 246, 0.15)' : 'rgba(99, 102, 241, 0.15)',
                      color: app.role_applied === 'Editor' ? '#A78BFA' : '#818CF8',
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      border: `1px solid ${app.role_applied === 'Editor' ? 'rgba(139, 92, 246, 0.3)' : 'rgba(99, 102, 241, 0.3)'}`,
                    }}
                  >
                    {app.role_applied === 'Editor' ? <Award size={13} /> : <PenTool size={13} />}
                    Applying for: {app.role_applied}
                  </span>

                  {app.status === 'pending' && (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', padding: '0.3rem 0.75rem', borderRadius: 'var(--radius-full)', backgroundColor: 'rgba(245, 158, 11, 0.15)', color: 'var(--color-warning)', fontSize: '0.8rem', fontWeight: 700 }}>
                      <Clock size={13} /> Pending Review
                    </span>
                  )}
                  {app.status === 'approved' && (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', padding: '0.3rem 0.75rem', borderRadius: 'var(--radius-full)', backgroundColor: 'rgba(16, 185, 129, 0.15)', color: 'var(--color-success)', fontSize: '0.8rem', fontWeight: 700 }}>
                      <CheckCircle2 size={13} /> Promoted & Approved
                    </span>
                  )}
                  {app.status === 'rejected' && (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', padding: '0.3rem 0.75rem', borderRadius: 'var(--radius-full)', backgroundColor: 'rgba(239, 68, 68, 0.15)', color: 'var(--color-danger)', fontSize: '0.8rem', fontWeight: 700 }}>
                      <XCircle size={13} /> Rejected
                    </span>
                  )}
                </div>
              </div>

              {/* Bio & Background */}
              <div style={{ marginBottom: '1rem' }}>
                <p style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-muted)', margin: '0 0 0.3rem 0', textTransform: 'uppercase' }}>Bio & Background</p>
                <p style={{ fontSize: '0.88rem', color: 'var(--color-text)', lineHeight: 1.5, margin: 0 }}>{app.bio}</p>
              </div>

              {/* Topics & Samples */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem', marginBottom: '1rem', padding: '0.85rem 1rem', backgroundColor: 'var(--color-surface-alt)', borderRadius: 'var(--radius-md)' }}>
                <div>
                  <p style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-muted)', margin: '0 0 0.25rem 0', textTransform: 'uppercase' }}>Specialization Topics</p>
                  <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
                    {app.topics && app.topics.length > 0 ? (
                      app.topics.map((t: string) => (
                        <span key={t} style={{ fontSize: '0.75rem', backgroundColor: 'var(--color-card)', padding: '0.15rem 0.5rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)' }}>
                          {t}
                        </span>
                      ))
                    ) : (
                      <span style={{ fontSize: '0.78rem', color: 'var(--color-muted)' }}>General</span>
                    )}
                  </div>
                </div>

                {app.sample_urls && (
                  <div>
                    <p style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-muted)', margin: '0 0 0.25rem 0', textTransform: 'uppercase' }}>Sample Work / Portfolio</p>
                    <p style={{ fontSize: '0.82rem', color: 'var(--color-secondary)', margin: 0, wordBreak: 'break-all' }}>
                      <a href={app.sample_urls.startsWith('http') ? app.sample_urls : `https://${app.sample_urls}`} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', color: 'var(--color-secondary)', textDecoration: 'none' }}>
                        {app.sample_urls} <ExternalLink size={12} />
                      </a>
                    </p>
                  </div>
                )}
              </div>

              {/* Motivation */}
              <div style={{ marginBottom: '1.25rem' }}>
                <p style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-muted)', margin: '0 0 0.3rem 0', textTransform: 'uppercase' }}>Why join our editorial staff?</p>
                <p style={{ fontSize: '0.88rem', color: 'var(--color-text-secondary)', fontStyle: 'italic', margin: 0 }}>"{app.motivation}"</p>
              </div>

              {/* Admin Review Feedback (if already processed) */}
              {app.feedback && (
                <div style={{ padding: '0.75rem 1rem', backgroundColor: 'rgba(255, 255, 255, 0.03)', borderLeft: '3px solid var(--color-secondary)', borderRadius: 'var(--radius-sm)', marginBottom: '1.25rem' }}>
                  <p style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--color-text)', margin: '0 0 0.2rem 0' }}>Feedback Provided to Applicant:</p>
                  <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', margin: 0 }}>{app.feedback}</p>
                </div>
              )}

              {/* Action Buttons for Pending Application */}
              {app.status === 'pending' && (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.75rem', borderTop: '1px solid var(--color-border)', paddingTop: '1rem' }}>
                  <button
                    onClick={() => handleOpenReview(app, 'rejected')}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                      backgroundColor: 'transparent',
                      color: 'var(--color-danger)',
                      border: '1px solid rgba(239, 68, 68, 0.3)',
                      padding: '0.5rem 1rem',
                      borderRadius: 'var(--radius-md)',
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    <X size={15} /> Reject
                  </button>

                  <button
                    onClick={() => handleOpenReview(app, 'approved')}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                      backgroundColor: 'var(--color-success)',
                      color: '#FFFFFF',
                      border: 'none',
                      padding: '0.5rem 1.25rem',
                      borderRadius: 'var(--radius-md)',
                      fontSize: '0.85rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      boxShadow: '0 2px 8px rgba(16, 185, 129, 0.35)',
                    }}
                  >
                    <Check size={16} /> Accept & Promote to {app.role_applied}
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Confirmation & Review Modal */}
      {selectedApp && actionType && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.7)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 200,
            padding: '1rem',
          }}
        >
          <div
            style={{
              backgroundColor: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-lg)',
              maxWidth: '500px',
              width: '100%',
              padding: '1.75rem',
              boxShadow: 'var(--shadow-xl)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1rem' }}>
              {actionType === 'approved' ? (
                <div style={{ width: '36px', height: '36px', borderRadius: 'var(--radius-full)', backgroundColor: 'rgba(16, 185, 129, 0.15)', color: 'var(--color-success)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Check size={20} />
                </div>
              ) : (
                <div style={{ width: '36px', height: '36px', borderRadius: 'var(--radius-full)', backgroundColor: 'rgba(239, 68, 68, 0.15)', color: 'var(--color-danger)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <X size={20} />
                </div>
              )}
              <div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0 }}>
                  {actionType === 'approved' ? `Approve ${selectedApp.name}` : `Reject Application`}
                </h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', margin: 0 }}>
                  {actionType === 'approved'
                    ? `Applicant will be immediately promoted to '${selectedApp.role_applied}' in the database.`
                    : 'Applicant will be notified of your editorial decision.'}
                </p>
              </div>
            </div>

            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', fontWeight: 600, fontSize: '0.85rem', marginBottom: '0.4rem' }}>
                Notification Feedback for {selectedApp.name}:
              </label>
              <textarea
                rows={3}
                value={feedback}
                onChange={e => setFeedback(e.target.value)}
                placeholder="Optional feedback or welcome message..."
                style={{ width: '100%', padding: '0.6rem 0.8rem', fontSize: '0.88rem', borderRadius: 'var(--radius-sm)' }}
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <button
                type="button"
                onClick={() => { setSelectedApp(null); setActionType(null); }}
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
                onClick={handleConfirmReview}
                disabled={submitting}
                style={{
                  padding: '0.55rem 1.35rem',
                  backgroundColor: actionType === 'approved' ? 'var(--color-success)' : 'var(--color-danger)',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: 'var(--radius-md)',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  cursor: submitting ? 'not-allowed' : 'pointer',
                  boxShadow: actionType === 'approved' ? '0 2px 8px rgba(16, 185, 129, 0.4)' : '0 2px 8px rgba(239, 68, 68, 0.4)',
                }}
              >
                {submitting ? 'Processing...' : actionType === 'approved' ? `Confirm & Promote to ${selectedApp.role_applied}` : 'Confirm Rejection'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
