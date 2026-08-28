import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MessageSquare, Check, X, ShieldAlert, Trash2, Search } from 'lucide-react';
import { LoadingState } from '../../components/common/LoadingState';
import { EmptyState } from '../../components/common/EmptyState';
import { ApiService } from '../../services/api';
import { useConfirm } from '../../context/ConfirmDialogContext';

export const AdminComments: React.FC = () => {
  const confirm = useConfirm();
  const [comments, setComments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');

  const fetchAdminComments = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/comments${statusFilter !== 'all' ? `?status=${statusFilter}` : ''}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('bitblog_token')}`,
        },
      }).then(r => r.json());

      if (res && res.data) {
        setComments(res.data);
      }
    } catch (err) {
      console.error('Failed to fetch admin comments:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminComments();
  }, [statusFilter]);

  const handleStatusChange = async (id: number, newStatus: string) => {
    try {
      await fetch(`/api/admin/comments/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('bitblog_token')}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });
      fetchAdminComments();
    } catch (err: any) {
      alert(err.message || 'Failed to update status');
    }
  };

  const handleDelete = async (id: number) => {
    const isConfirmed = await confirm({
      title: 'Delete Reader Comment',
      message: 'Are you sure you want to permanently delete this comment?',
      confirmText: 'Yes, Delete',
      type: 'danger',
    });

    if (isConfirmed) {
      try {
        await ApiService.deleteComment(id);
        fetchAdminComments();
      } catch (err: any) {
        alert(err.message || 'Failed to delete comment');
      }
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.6rem', marginBottom: '0.2rem' }}>Comments Moderation</h1>
          <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>Review, approve, reject, or mark reader comments as spam</p>
        </div>

        {/* Status Filter */}
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}
        >
          <option value="all">All Comments</option>
          <option value="pending">Pending Moderation</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
          <option value="spam">Spam</option>
        </select>
      </div>

      {loading ? (
        <LoadingState message="Fetching comment records..." />
      ) : comments.length === 0 ? (
        <EmptyState title="No Comments Found" description="No comment records match the selected moderation filter." />
      ) : (
        <div className="table-responsive" style={{ backgroundColor: 'var(--color-card)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
            <thead>
              <tr style={{ backgroundColor: 'var(--color-surface-alt)', borderBottom: '1px solid var(--color-border)', color: 'var(--color-text-secondary)', fontWeight: 700 }}>
                <th style={{ padding: '0.75rem 1rem' }}>Author</th>
                <th style={{ padding: '0.75rem 1rem' }}>Story</th>
                <th style={{ padding: '0.75rem 1rem' }}>Comment Snippet</th>
                <th style={{ padding: '0.75rem 1rem' }}>Status</th>
                <th style={{ padding: '0.75rem 1rem' }}>Date</th>
                <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>Moderation Actions</th>
              </tr>
            </thead>
            <tbody>
              {comments.map(c => (
                <tr key={c.comment_id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                  <td style={{ padding: '0.75rem 1rem', fontWeight: 600 }}>{c.author_name || 'Reader'}</td>
                  <td style={{ padding: '0.75rem 1rem' }}>
                    <Link to={`/post/${c.post_slug}`} style={{ color: 'var(--color-text)' }}>
                      {c.post_title || `#${c.post_id}`}
                    </Link>
                  </td>
                  <td style={{ padding: '0.75rem 1rem', color: 'var(--color-text-secondary)', maxWidth: '280px' }}>{c.content}</td>
                  <td style={{ padding: '0.75rem 1rem' }}>
                    <span
                      style={{
                        padding: '0.15rem 0.5rem',
                        borderRadius: 'var(--radius-sm)',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        backgroundColor: c.status === 'approved' ? 'rgba(16, 185, 129, 0.15)' : c.status === 'spam' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                        color: c.status === 'approved' ? 'var(--color-success)' : c.status === 'spam' ? 'var(--color-danger)' : 'var(--color-warning)',
                      }}
                    >
                      {c.status}
                    </span>
                  </td>
                  <td style={{ padding: '0.75rem 1rem', color: 'var(--color-text-secondary)' }}>{new Date(c.created_at).toLocaleDateString()}</td>
                  <td style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.3rem' }}>
                      <button onClick={() => handleStatusChange(c.comment_id, 'approved')} title="Approve Comment" style={{ padding: '0.3rem', background: 'transparent', color: 'var(--color-success)' }}>
                        <Check size={16} />
                      </button>
                      <button onClick={() => handleStatusChange(c.comment_id, 'rejected')} title="Reject Comment" style={{ padding: '0.3rem', background: 'transparent', color: 'var(--color-warning)' }}>
                        <X size={16} />
                      </button>
                      <button onClick={() => handleStatusChange(c.comment_id, 'spam')} title="Mark as Spam" style={{ padding: '0.3rem', background: 'transparent', color: 'var(--color-danger)' }}>
                        <ShieldAlert size={16} />
                      </button>
                      <button onClick={() => handleDelete(c.comment_id)} title="Delete Comment" style={{ padding: '0.3rem', background: 'transparent', color: 'var(--color-muted)' }}>
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
