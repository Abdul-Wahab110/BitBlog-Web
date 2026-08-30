import React, { useState, useEffect } from 'react';
import { BarChart3, Eye, TrendingUp, Users, FileText, MessageSquare, Sparkles, Activity, ArrowUpRight } from 'lucide-react';
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
  const totalComments = stats?.totalComments || 0;

  const kpis = [
    {
      label: 'Total Views',
      value: totalViews.toLocaleString(),
      icon: Eye,
      color: 'var(--color-secondary)',
      bg: 'rgba(99, 102, 241, 0.12)',
      trend: 'Live Tracked',
    },
    {
      label: 'Avg Views / Story',
      value: avgViewsPerPost,
      icon: TrendingUp,
      color: '#10B981',
      bg: 'rgba(16, 185, 129, 0.12)',
      trend: 'Per Article',
    },
    {
      label: 'Published Stories',
      value: publishedPosts.toLocaleString(),
      icon: FileText,
      color: '#8B5CF6',
      bg: 'rgba(139, 92, 246, 0.12)',
      trend: 'Live in Journal',
    },
    {
      label: 'Reader Comments',
      value: totalComments.toLocaleString(),
      icon: MessageSquare,
      color: '#F59E0B',
      bg: 'rgba(245, 158, 11, 0.12)',
      trend: 'Discussions',
    },
  ];

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto' }}>

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          gap: '1rem',
          flexWrap: 'wrap',
          marginBottom: '1.5rem',
        }}
      >
        <div>
          <h1
            style={{
              fontSize: 'clamp(1.3rem, 3vw, 1.6rem)',
              marginBottom: '0.25rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontWeight: 800,
            }}
          >
            <BarChart3 size={22} color="var(--color-secondary)" /> Publication Analytics & Traffic
          </h1>
          <p style={{ fontSize: '0.84rem', color: 'var(--color-text-secondary)', margin: 0 }}>
            Privacy-aware reader views, engagement metrics, and top-performing editorial stories
          </p>
        </div>

        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            padding: '0.3rem 0.75rem',
            backgroundColor: 'rgba(16, 185, 129, 0.12)',
            border: '1px solid rgba(16, 185, 129, 0.25)',
            borderRadius: 'var(--radius-full)',
            fontSize: '0.75rem',
            fontWeight: 700,
            color: 'var(--color-success)',
          }}
        >
          <span style={{ width: '7px', height: '7px', borderRadius: '50%', backgroundColor: 'var(--color-success)', display: 'inline-block' }} />
          Real-time Telemetry
        </div>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 140px), 1fr))',
          gap: 'clamp(0.75rem, 2vw, 1.25rem)',
          marginBottom: '2rem',
        }}
      >
        {kpis.map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <div
              key={idx}
              style={{
                backgroundColor: 'var(--color-card)',
                padding: 'clamp(0.9rem, 2vw, 1.25rem)',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--color-border)',
                boxShadow: 'var(--shadow-sm)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                position: 'relative',
                overflow: 'hidden',
                boxSizing: 'border-box',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.6rem' }}>
                <span
                  style={{
                    fontSize: 'clamp(0.72rem, 1.8vw, 0.8rem)',
                    color: 'var(--color-text-secondary)',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.03em',
                  }}
                >
                  {kpi.label}
                </span>
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: kpi.bg,
                    color: kpi.color,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <Icon size={16} />
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.35rem' }}>
                <span
                  style={{
                    fontSize: 'clamp(1.4rem, 3.5vw, 1.9rem)',
                    fontWeight: 800,
                    fontFamily: 'var(--font-heading)',
                    color: kpi.color,
                    lineHeight: 1.1,
                  }}
                >
                  {kpi.value}
                </span>
                <span
                  style={{
                    fontSize: '0.7rem',
                    fontWeight: 600,
                    color: 'var(--color-muted)',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {kpi.trend}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <div
        style={{
          backgroundColor: 'var(--color-card)',
          padding: 'clamp(1rem, 2.5vw, 1.5rem)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--color-border)',
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <h3 style={{ fontSize: 'clamp(0.95rem, 2vw, 1.1rem)', margin: 0, fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
            <TrendingUp size={18} color="var(--color-secondary)" /> Top Performing Articles
          </h3>
          <span style={{ fontSize: '0.75rem', color: 'var(--color-muted)', fontWeight: 600 }}>
            Ranked by total reader pageviews
          </span>
        </div>

        {topPosts.length === 0 ? (
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.875rem', textAlign: 'center', padding: '2rem 0' }}>
            No article traffic records captured yet.
          </p>
        ) : (
          <>

            <div className="analytics-desktop-table" style={{ display: 'block' }}>
              <div className="table-responsive">
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
                  <thead>
                    <tr style={{ backgroundColor: 'var(--color-surface-alt)', borderBottom: '1px solid var(--color-border)', color: 'var(--color-text-secondary)', fontWeight: 700 }}>
                      <th style={{ padding: '0.65rem 0.85rem', width: '48px', textAlign: 'center' }}>#</th>
                      <th style={{ padding: '0.65rem 0.85rem' }}>Article Title</th>
                      <th style={{ padding: '0.65rem 0.85rem' }}>Author</th>
                      <th style={{ padding: '0.65rem 0.85rem' }}>Category</th>
                      <th style={{ padding: '0.65rem 0.85rem' }}>Status</th>
                      <th style={{ padding: '0.65rem 0.85rem', textAlign: 'right' }}>Total Views</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topPosts.map((post, index) => (
                      <tr key={post.post_id} style={{ borderBottom: '1px solid var(--color-border)', transition: 'background-color 0.15s ease' }}>
                        <td style={{ padding: '0.65rem 0.85rem', textAlign: 'center', fontWeight: 700, color: index < 3 ? 'var(--color-secondary)' : 'var(--color-muted)' }}>
                          {index + 1}
                        </td>
                        <td style={{ padding: '0.65rem 0.85rem', fontWeight: 600, maxWidth: '320px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {post.title}
                        </td>
                        <td style={{ padding: '0.65rem 0.85rem', color: 'var(--color-text-secondary)' }}>{post.author_name || 'Staff'}</td>
                        <td style={{ padding: '0.65rem 0.85rem', color: 'var(--color-text-secondary)' }}>{post.category_name || 'General'}</td>
                        <td style={{ padding: '0.65rem 0.85rem' }}>
                          <span
                            style={{
                              padding: '0.15rem 0.5rem',
                              borderRadius: 'var(--radius-sm)',
                              fontSize: '0.72rem',
                              fontWeight: 700,
                              textTransform: 'uppercase',
                              backgroundColor: post.status === 'published' ? 'rgba(16, 185, 129, 0.12)' : 'rgba(245, 158, 11, 0.12)',
                              color: post.status === 'published' ? 'var(--color-success)' : 'var(--color-warning)',
                            }}
                          >
                            {post.status}
                          </span>
                        </td>
                        <td style={{ padding: '0.65rem 0.85rem', textAlign: 'right', fontWeight: 700, color: 'var(--color-secondary)' }}>
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                            <Eye size={13} /> {Number(post.views_count || 0).toLocaleString()}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="analytics-mobile-list" style={{ display: 'none', flexDirection: 'column', gap: '0.75rem' }}>
              {topPosts.map((post, index) => (
                <div
                  key={post.post_id}
                  style={{
                    backgroundColor: 'var(--color-surface-alt)',
                    border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-md)',
                    padding: '0.85rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.5rem',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                      <span
                        style={{
                          width: '22px',
                          height: '22px',
                          borderRadius: '50%',
                          backgroundColor: index < 3 ? 'var(--color-secondary)' : 'var(--color-border)',
                          color: index < 3 ? '#FFFFFF' : 'var(--color-text)',
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '0.72rem',
                          fontWeight: 800,
                          flexShrink: 0,
                        }}
                      >
                        {index + 1}
                      </span>
                      <div style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--color-text)', lineHeight: 1.35 }}>
                        {post.title}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--color-text-secondary)', paddingTop: '0.4rem', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                    <span>{post.category_name || 'General'} • {post.author_name || 'Staff'}</span>
                    <span style={{ fontWeight: 700, color: 'var(--color-secondary)', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                      <Eye size={12} /> {Number(post.views_count || 0).toLocaleString()} views
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      <style>{`
        @media (max-width: 640px) {
          .analytics-desktop-table {
            display: none !important;
          }
          .analytics-mobile-list {
            display: flex !important;
          }
        }
        @media (min-width: 641px) {
          .analytics-desktop-table {
            display: block !important;
          }
          .analytics-mobile-list {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
};

