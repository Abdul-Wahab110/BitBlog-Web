import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MessageSquare, Edit3, Trash2 } from 'lucide-react';
import { LoadingState } from '../../components/common/LoadingState';
import { EmptyState } from '../../components/common/EmptyState';
import { ApiService } from '../../services/api';
import { useConfirm } from '../../context/ConfirmDialogContext';

export const UserComments: React.FC = () => {
  const confirm = useConfirm();
  const [comments, setComments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchComments = async () => {
    setLoading(true);
    try {
      const res = await ApiService.getUserComments();
      if (res && res.data) {
        setComments(res.data);
      }
    } catch (err) {
      console.error('Failed to fetch user comments:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComments();
  }, []);

  const handleDelete = async (id: number) => {
    const isConfirmed = await confirm({
      title: 'Delete Comment',
      message: 'Are you sure you want to delete your comment? This cannot be undone.',
      confirmText: 'Yes, Delete',
      type: 'danger',
    });

    if (isConfirmed) {
      try {
        await ApiService.deleteComment(id);
        fetchComments();
      } catch (err: any) {
        alert(err.message || 'Failed to delete comment');
      }
    }
  };

  return (
    <div>
      <header style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.6rem', marginBottom: '0.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <MessageSquare size={22} color="var(--color-secondary)" /> My Comments & Discussions
        </h1>
        <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>Manage your posted comments across publication stories</p>
      </header>

      {loading ? (
        <LoadingState message="Fetching your submitted comments..." />
      ) : comments.length === 0 ? (
        <EmptyState
          title="No comments yet."
          description="You have not posted any comments or story replies yet."
        />
      ) : (
        <div className="cms-table-wrapper">
          <table className="cms-responsive-table">
            <thead>
              <tr style={{ backgroundColor: 'var(--color-surface-alt)', borderBottom: '1px solid var(--color-border)', color: 'var(--color-text-secondary)', fontWeight: 700 }}>
                <th style={{ padding: '0.75rem 1rem' }}>Article Story</th>
                <th style={{ padding: '0.75rem 1rem' }}>Comment Text</th>
                <th style={{ padding: '0.75rem 1rem' }}>Status</th>
                <th style={{ padding: '0.75rem 1rem' }}>Date</th>
                <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {comments.map(c => (
                <tr key={c.comment_id} className="cms-table-row">
                  <td className="cms-td-title" style={{ padding: '0.85rem 1rem', fontWeight: 600 }}>
                    <span className="cms-mobile-label">Story</span>
                    <Link to={`/post/${c.post_slug}`} style={{ color: 'var(--color-secondary)', textDecoration: 'none', fontWeight: 700, fontSize: '0.92rem' }}>
                      {c.post_title || `Article #${c.post_id}`}
                    </Link>
                  </td>

                  <td className="cms-td-title" style={{ padding: '0.85rem 1rem' }}>
                    <span className="cms-mobile-label">Comment</span>
                    <div
                      style={{
                        fontSize: '0.84rem',
                        color: 'var(--color-text)',
                        backgroundColor: 'var(--color-surface)',
                        padding: '0.5rem 0.75rem',
                        borderRadius: 'var(--radius-sm)',
                        borderLeft: '3px solid var(--color-secondary)',
                        lineHeight: 1.4,
                      }}
                    >
                      "{c.content}"
                    </div>
                  </td>

                  <td className="cms-td-category" style={{ padding: '0.85rem 1rem' }}>
                    <span className="cms-mobile-label">Status</span>
                    <span
                      style={{
                        padding: '0.2rem 0.55rem',
                        borderRadius: 'var(--radius-sm)',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        backgroundColor: c.status === 'approved' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                        color: c.status === 'approved' ? 'var(--color-success)' : 'var(--color-warning)',
                      }}
                    >
                      {c.status}
                    </span>
                  </td>

                  <td className="cms-td-updated" style={{ padding: '0.85rem 1rem', color: 'var(--color-muted)', fontSize: '0.82rem' }}>
                    <span className="cms-mobile-label">Date</span>
                    <span>
                      {new Date(c.created_at).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </span>
                  </td>

                  <td className="cms-td-actions" style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>
                    <div className="cms-actions-group">
                      <button
                        type="button"
                        onClick={() => handleDelete(c.comment_id)}
                        title="Delete Comment"
                        className="cms-btn-delete"
                      >
                        <Trash2 size={14} /> <span>Delete</span>
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
