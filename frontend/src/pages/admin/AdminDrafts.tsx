import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FileText, Edit3, Trash2, Eye, PlusCircle } from 'lucide-react';
import { LoadingState } from '../../components/common/LoadingState';
import { EmptyState } from '../../components/common/EmptyState';
import { ApiService } from '../../services/api';
import { useConfirm } from '../../context/ConfirmDialogContext';

export const AdminDrafts: React.FC = () => {
  const confirm = useConfirm();
  const [drafts, setDrafts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDrafts = async () => {
    setLoading(true);
    try {
      const res = await ApiService.getAdminPosts();
      if (res && res.data) {
        setDrafts(res.data.filter((p: any) => p.status === 'draft'));
      }
    } catch (err) {
      console.error('Failed to fetch drafts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDrafts();
  }, []);

  const handleDelete = async (id: number, title: string) => {
    const isConfirmed = await confirm({
      title: 'Delete Draft Article',
      message: `Are you sure you want to delete draft '${title}'?`,
      confirmText: 'Yes, Delete Draft',
      type: 'danger',
    });

    if (isConfirmed) {
      try {
        await ApiService.deletePost(id);
        fetchDrafts();
      } catch (err: any) {
        alert(err.message || 'Failed to delete draft');
      }
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.6rem', marginBottom: '0.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <FileText size={22} color="var(--color-warning)" /> Unpublished Drafts
          </h1>
          <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>Stories saved in progress awaiting publication</p>
        </div>

        <Link
          to="/admin/posts/new"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            backgroundColor: 'var(--color-secondary)',
            color: '#FFFFFF',
            padding: '0.55rem 1.1rem',
            borderRadius: 'var(--radius-md)',
            fontWeight: 600,
            fontSize: '0.875rem',
          }}
        >
          <PlusCircle size={16} /> New Article
        </Link>
      </div>

      {loading ? (
        <LoadingState message="Fetching article drafts..." />
      ) : drafts.length === 0 ? (
        <EmptyState
          title="No Draft Articles Found"
          description="You do not have any unpublished drafts in the system. When you save stories as drafts, they will appear here."
        />
      ) : (
        <div className="cms-table-wrapper">
          <table className="cms-responsive-table">
            <thead>
              <tr style={{ backgroundColor: 'var(--color-surface-alt)', borderBottom: '1px solid var(--color-border)', color: 'var(--color-text-secondary)', fontWeight: 700 }}>
                <th style={{ padding: '0.75rem 1rem' }}>Draft Title</th>
                <th style={{ padding: '0.75rem 1rem' }}>Category</th>
                <th style={{ padding: '0.75rem 1rem' }}>Last Modified</th>
                <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {drafts.map(post => (
                <tr key={post.post_id} className="cms-table-row">
                  <td className="cms-td-title" style={{ padding: '0.85rem 1rem' }}>
                    <div style={{ fontWeight: 700, color: 'var(--color-text)', fontSize: '0.94rem', marginBottom: '0.35rem', lineHeight: 1.35 }}>
                      {post.title}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '0.72rem', padding: '0.15rem 0.5rem', backgroundColor: 'rgba(148, 163, 184, 0.15)', color: '#94A3B8', borderRadius: 'var(--radius-sm)', fontWeight: 700 }}>
                        Draft
                      </span>
                      {post.views_count ? (
                        <span style={{ fontSize: '0.75rem', color: 'var(--color-muted)' }}>
                          {post.views_count} views
                        </span>
                      ) : null}
                    </div>
                  </td>

                  <td className="cms-td-category" style={{ padding: '0.85rem 1rem', color: 'var(--color-text-secondary)' }}>
                    <span className="cms-mobile-label">Category</span>
                    <span style={{ fontWeight: 600, fontSize: '0.85rem' }}>{post.category_name || 'General'}</span>
                  </td>

                  <td className="cms-td-updated" style={{ padding: '0.85rem 1rem', color: 'var(--color-muted)', fontSize: '0.82rem' }}>
                    <span className="cms-mobile-label">Modified</span>
                    <span>
                      {new Date(post.updated_at || post.created_at).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </span>
                  </td>

                  <td className="cms-td-actions" style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>
                    <div className="cms-actions-group">
                      <Link
                        to={`/admin/posts/edit/${post.post_id}`}
                        title="Edit & Publish Draft"
                        className="cms-btn-edit"
                      >
                        <Edit3 size={14} /> <span>Edit & Publish</span>
                      </Link>

                      <button
                        type="button"
                        onClick={() => handleDelete(post.post_id, post.title)}
                        title="Delete Draft"
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
