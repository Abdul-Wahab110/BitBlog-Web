import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Clock, Edit3, Trash2, PlusCircle, Calendar } from 'lucide-react';
import { LoadingState } from '../../components/common/LoadingState';
import { EmptyState } from '../../components/common/EmptyState';
import { ApiService } from '../../services/api';
import { useConfirm } from '../../context/ConfirmDialogContext';

export const ScheduledPosts: React.FC = () => {
  const confirm = useConfirm();
  const [scheduled, setScheduled] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchScheduled = async () => {
    setLoading(true);
    try {
      const res = await ApiService.getAdminPosts();
      if (res && res.data) {
        setScheduled(res.data.filter((p: any) => p.status === 'scheduled'));
      }
    } catch (err) {
      console.error('Failed to fetch scheduled posts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchScheduled();
  }, []);

  const handleDelete = async (id: number, title: string) => {
    const isConfirmed = await confirm({
      title: 'Cancel Scheduled Publication',
      message: `Are you sure you want to cancel scheduled publication for article '${title}'?`,
      confirmText: 'Yes, Cancel Schedule',
      type: 'warning',
    });

    if (isConfirmed) {
      try {
        await ApiService.deletePost(id);
        fetchScheduled();
      } catch (err: any) {
        alert(err.message || 'Failed to delete scheduled article');
      }
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.6rem', marginBottom: '0.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Clock size={22} color="var(--color-accent)" /> Scheduled Queue
          </h1>
          <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>Articles configured for automated future release</p>
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
          <PlusCircle size={16} /> Schedule Story
        </Link>
      </div>

      {loading ? (
        <LoadingState message="Fetching scheduled publication queue..." />
      ) : scheduled.length === 0 ? (
        <EmptyState
          title="No Scheduled Articles Found"
          description="There are currently no articles in the scheduled publishing queue. Choose 'Scheduled' status in the article editor to queue stories for future release."
        />
      ) : (
        <div className="table-responsive" style={{ backgroundColor: 'var(--color-card)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
            <thead>
              <tr style={{ backgroundColor: 'var(--color-surface-alt)', borderBottom: '1px solid var(--color-border)', color: 'var(--color-text-secondary)', fontWeight: 700 }}>
                <th style={{ padding: '0.75rem 1rem' }}>Article Title</th>
                <th style={{ padding: '0.75rem 1rem' }}>Category</th>
                <th style={{ padding: '0.75rem 1rem' }}>Target Publishing Date & Time</th>
                <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {scheduled.map(post => (
                <tr key={post.post_id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                  <td style={{ padding: '0.75rem 1rem', fontWeight: 600 }}>{post.title}</td>
                  <td style={{ padding: '0.75rem 1rem', color: 'var(--color-text-secondary)' }}>{post.category_name || 'General'}</td>
                  <td style={{ padding: '0.75rem 1rem', color: 'var(--color-accent)', fontWeight: 600 }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <Calendar size={14} /> {post.scheduled_at ? new Date(post.scheduled_at).toLocaleString() : 'Pending'}
                    </span>
                  </td>
                  <td style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.4rem' }}>
                      <Link to={`/admin/posts/edit/${post.post_id}`} title="Edit Scheduled Post" style={{ padding: '0.3rem', color: 'var(--color-secondary)' }}>
                        <Edit3 size={15} />
                      </Link>
                      <button onClick={() => handleDelete(post.post_id, post.title)} title="Cancel Scheduled Post" style={{ padding: '0.3rem', background: 'transparent', color: 'var(--color-danger)' }}>
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
