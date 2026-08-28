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
        <div className="table-responsive" style={{ backgroundColor: 'var(--color-card)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
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
                <tr key={post.post_id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                  <td style={{ padding: '0.75rem 1rem', fontWeight: 600 }}>{post.title}</td>
                  <td style={{ padding: '0.75rem 1rem', color: 'var(--color-text-secondary)' }}>{post.category_name || 'General'}</td>
                  <td style={{ padding: '0.75rem 1rem', color: 'var(--color-text-secondary)' }}>{new Date(post.updated_at || post.created_at).toLocaleDateString()}</td>
                  <td style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.4rem' }}>
                      <Link to={`/admin/posts/edit/${post.post_id}`} title="Edit & Publish Draft" style={{ padding: '0.3rem', color: 'var(--color-secondary)' }}>
                        <Edit3 size={15} />
                      </Link>
                      <button onClick={() => handleDelete(post.post_id, post.title)} title="Delete Draft" style={{ padding: '0.3rem', background: 'transparent', color: 'var(--color-danger)' }}>
                        <Trash2 size={15} />
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
