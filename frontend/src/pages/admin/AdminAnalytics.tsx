import React, { useState, useEffect } from 'react';
import { BarChart3, Eye, TrendingUp, Users, FileText, MessageSquare } from 'lucide-react';
import { LoadingState } from '../../components/common/LoadingState';
import { ApiService } from '../../services/api';

export const AdminAnalytics: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [topPosts, setTopPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      ApiService.getAdminDashboardStats().catch(() => ({ data: null })),
      ApiService.getAdminPosts().catch(() => ({ data: [] })),
    ])
      .then(([statsRes, postsRes]) => {
        if (statsRes && statsRes.data) {
          setStats(statsRes.data);
        }
        if (postsRes && postsRes.data) {
          const sorted = [...postsRes.data].sort((a, b) => (b.views_count || 0) - (a.views_count || 0)).slice(0, 10);
          setTopPosts(sorted);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <LoadingState message="Aggregating publication analytics and view metrics..." />;
  }

  const totalViews = stats?.totalViews || 0;
  const publishedPosts = stats?.publishedPosts || 0;
  const avgViewsPerPost = publishedPosts > 0 ? (totalViews / publishedPosts).toFixed(1) : '0';

  return (
    <div>
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.6rem', marginBottom: '0.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <BarChart3 size={22} color="var(--color-secondary)" /> Publication Analytics & Traffic
        </h1>
        <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
          Privacy-aware reader views, engagement metrics, and top-performing editorial stories
        </p>
      </div>

      {/* Traffic Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
        <div style={{ backgroundColor: 'var(--color-card)', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', display: 'block', marginBottom: '0.35rem', fontWeight: 600 }}>
            Total Publication Views
          </span>
          <span style={{ fontSize: '2rem', fontWeight: 800, fontFamily: 'var(--font-heading)', color: 'var(--color-secondary)' }}>
            {totalViews.toLocaleString()}
          </span>
        </div>

        <div style={{ backgroundColor: 'var(--color-card)', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', display: 'block', marginBottom: '0.35rem', fontWeight: 600 }}>
            Average Views Per Story
          </span>
          <span style={{ fontSize: '2rem', fontWeight: 800, fontFamily: 'var(--font-heading)', color: '#10B981' }}>
            {avgViewsPerPost}
          </span>
        </div>

        <div style={{ backgroundColor: 'var(--color-card)', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', display: 'block', marginBottom: '0.35rem', fontWeight: 600 }}>
            Published Stories
          </span>
          <span style={{ fontSize: '2rem', fontWeight: 800, fontFamily: 'var(--font-heading)' }}>
            {publishedPosts}
          </span>
        </div>

        <div style={{ backgroundColor: 'var(--color-card)', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', display: 'block', marginBottom: '0.35rem', fontWeight: 600 }}>
            Reader Comments
          </span>
          <span style={{ fontSize: '2rem', fontWeight: 800, fontFamily: 'var(--font-heading)' }}>
            {stats?.totalComments || 0}
          </span>
        </div>
      </div>

      {/* Top Performing Articles Table */}
      <div style={{ backgroundColor: 'var(--color-card)', padding: '1.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
        <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <TrendingUp size={18} color="var(--color-secondary)" /> Top Performing Articles
        </h3>

        {topPosts.length === 0 ? (
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.875rem' }}>
            No article traffic records captured yet.
          </p>
        ) : (
          <div className="table-responsive">
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ backgroundColor: 'var(--color-surface-alt)', borderBottom: '1px solid var(--color-border)', color: 'var(--color-text-secondary)', fontWeight: 700 }}>
                  <th style={{ padding: '0.75rem 1rem' }}>Article Title</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Author</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Category</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Status</th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>Total Views</th>
                </tr>
              </thead>
              <tbody>
                {topPosts.map(post => (
                  <tr key={post.post_id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                    <td style={{ padding: '0.75rem 1rem', fontWeight: 600 }}>{post.title}</td>
                    <td style={{ padding: '0.75rem 1rem', color: 'var(--color-text-secondary)' }}>{post.author_name || 'Staff'}</td>
                    <td style={{ padding: '0.75rem 1rem', color: 'var(--color-text-secondary)' }}>{post.category_name || 'General'}</td>
                    <td style={{ padding: '0.75rem 1rem' }}>
                      <span style={{ padding: '0.15rem 0.5rem', borderRadius: 'var(--radius-sm)', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', backgroundColor: post.status === 'published' ? 'rgba(16, 185, 129, 0.12)' : 'rgba(245, 158, 11, 0.12)', color: post.status === 'published' ? 'var(--color-success)' : 'var(--color-warning)' }}>
                        {post.status}
                      </span>
                    </td>
                    <td style={{ padding: '0.75rem 1rem', textAlign: 'right', fontWeight: 700, color: 'var(--color-secondary)' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                        <Eye size={14} /> {post.views_count || 0}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
