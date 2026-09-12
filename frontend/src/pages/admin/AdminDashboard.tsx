import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FileText, Clock, Users, MessageSquare, FolderTree, Tag, Eye, PlusCircle, AlertTriangle, User, Edit, Award, Activity } from 'lucide-react';
import { LoadingState } from '../../components/common/LoadingState';
import { ApiService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const userRole = user?.role || 'Author';

  const [stats, setStats] = useState<{
    publishedPosts: number;
    draftPosts: number;
    scheduledPosts: number;
    pendingPosts: number;
    pendingApplications?: number;
    totalAuditLogs?: number;
    totalUsers: number;
    totalComments: number;
    totalCategories: number;
    totalTags: number;
    totalViews: number;
  }>({
    publishedPosts: 0,
    draftPosts: 0,
    scheduledPosts: 0,
    pendingPosts: 0,
    pendingApplications: 0,
    totalAuditLogs: 0,
    totalUsers: 0,
    totalComments: 0,
    totalCategories: 0,
    totalTags: 0,
    totalViews: 0,
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    ApiService.getAdminDashboardStats()
      .then(res => {
        if (res && res.data) {
          setStats(res.data);
        }
      })
      .catch(err => {
        console.error('Failed to load DB stats:', err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  let statCards: Array<{ label: string; value: number; icon: any; color: string; link: string }> = [];
  let pageTitle = 'CMS Admin Overview';
  let pageSubtitle = 'Real-time publication database metrics, pending article approvals & system status';

  if (userRole === 'Author') {
    pageTitle = 'Author Studio Dashboard';
    pageSubtitle = 'Your personal stories, drafts, scheduled releases, and reader engagement';
    statCards = [
      { label: 'My Published Stories', value: stats.publishedPosts, icon: FileText, color: 'var(--color-secondary)', link: '/admin/posts' },
      { label: 'Under Review', value: stats.pendingPosts || 0, icon: AlertTriangle, color: 'var(--color-warning)', link: '/admin/posts' },
      { label: 'My Draft Stories', value: stats.draftPosts, icon: FileText, color: 'var(--color-muted)', link: '/admin/posts/drafts' },
      { label: 'Scheduled Releases', value: stats.scheduledPosts, icon: Clock, color: 'var(--color-accent)', link: '/admin/posts/scheduled' },
      { label: 'Story Comments', value: stats.totalComments, icon: MessageSquare, color: '#10B981', link: '/admin/comments' },
      { label: 'My Total Story Views', value: stats.totalViews, icon: Eye, color: '#06B6D4', link: '/admin/posts' },
    ];
  } else if (userRole === 'Editor') {
    pageTitle = 'Editorial Desk Overview';
    pageSubtitle = 'Review pending submissions, manage publication categories, and moderate reader discussions';
    statCards = [
      { label: 'Published Articles', value: stats.publishedPosts, icon: FileText, color: 'var(--color-secondary)', link: '/admin/posts' },
      { label: 'Pending Reviews', value: stats.pendingPosts || 0, icon: AlertTriangle, color: 'var(--color-warning)', link: '/admin/posts' },
      { label: 'Draft Articles', value: stats.draftPosts, icon: FileText, color: 'var(--color-muted)', link: '/admin/posts/drafts' },
      { label: 'Scheduled Articles', value: stats.scheduledPosts, icon: Clock, color: 'var(--color-accent)', link: '/admin/posts/scheduled' },
      { label: 'Reader Comments', value: stats.totalComments, icon: MessageSquare, color: '#10B981', link: '/admin/comments' },
      { label: 'Categories', value: stats.totalCategories, icon: FolderTree, color: '#F59E0B', link: '/admin/categories' },
      { label: 'Tags', value: stats.totalTags, icon: Tag, color: '#8B5CF6', link: '/admin/tags' },
      { label: 'Audit Logs', value: stats.totalAuditLogs || 0, icon: Activity, color: '#38BDF8', link: '/admin/audit' },
      { label: 'Total Article Views', value: stats.totalViews, icon: Eye, color: '#06B6D4', link: '/admin/posts' },
    ];
  } else {

    pageTitle = 'CMS Admin Overview';
    pageSubtitle = 'Real-time publication database metrics, pending article approvals & system status';
    statCards = [
      { label: 'Published Articles', value: stats.publishedPosts, icon: FileText, color: 'var(--color-secondary)', link: '/admin/posts' },
      { label: 'Pending Reviews', value: stats.pendingPosts || 0, icon: AlertTriangle, color: 'var(--color-warning)', link: '/admin/posts' },
      { label: 'Draft Articles', value: stats.draftPosts, icon: FileText, color: 'var(--color-muted)', link: '/admin/posts/drafts' },
      { label: 'Scheduled Articles', value: stats.scheduledPosts, icon: Clock, color: 'var(--color-accent)', link: '/admin/posts/scheduled' },
      { label: 'Registered Users', value: stats.totalUsers, icon: Users, color: '#8B5CF6', link: '/admin/users' },
      { label: 'Role Applications', value: stats.pendingApplications || 0, icon: Award, color: '#EC4899', link: '/admin/applications' },
      { label: 'System Audit Logs', value: stats.totalAuditLogs || 0, icon: Activity, color: '#38BDF8', link: '/admin/audit' },
      { label: 'Reader Comments', value: stats.totalComments, icon: MessageSquare, color: '#10B981', link: '/admin/comments' },
      { label: 'Categories', value: stats.totalCategories, icon: FolderTree, color: '#F59E0B', link: '/admin/categories' },
      { label: 'Total Article Views', value: stats.totalViews, icon: Eye, color: '#06B6D4', link: '/admin/analytics' },
    ];
  }

  if (loading) {
    return <LoadingState message="Connecting to Oracle Database & fetching live stats..." />;
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.6rem', marginBottom: '0.2rem', fontFamily: 'var(--font-heading)' }}>
            {pageTitle}
          </h1>
          <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
            {pageSubtitle}
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          <Link
            to="/admin/audit"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.45rem',
              backgroundColor: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              color: 'var(--color-text)',
              padding: '0.55rem 1rem',
              borderRadius: 'var(--radius-md)',
              fontWeight: 600,
              fontSize: '0.875rem',
              textDecoration: 'none',
            }}
          >
            <Activity size={15} color="#38BDF8" /> System Audit Logs
          </Link>

          <Link
            to="/admin/profile"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.45rem',
              backgroundColor: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              color: 'var(--color-text)',
              padding: '0.55rem 1rem',
              borderRadius: 'var(--radius-md)',
              fontWeight: 600,
              fontSize: '0.875rem',
              textDecoration: 'none',
            }}
          >
            <User size={15} color="var(--color-secondary)" /> Edit My Profile
          </Link>

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
              boxShadow: '0 2px 8px var(--color-secondary-glow)',
            }}
          >
            <PlusCircle size={16} /> Write New Story
          </Link>
        </div>
      </div>

      {userRole === 'Admin' && (stats.pendingApplications || 0) > 0 && (
        <div
          style={{
            backgroundColor: 'rgba(236, 72, 153, 0.12)',
            border: '1px solid rgba(236, 72, 153, 0.3)',
            borderRadius: 'var(--radius-lg)',
            padding: '1rem 1.25rem',
            marginBottom: '1.75rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ width: '38px', height: '38px', borderRadius: 'var(--radius-md)', backgroundColor: '#EC4899', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Award size={20} />
            </div>
            <div>
              <p style={{ fontWeight: 700, margin: 0, fontSize: '0.95rem', color: 'var(--color-text)' }}>
                {stats.pendingApplications} Pending Contributor Application{stats.pendingApplications! > 1 ? 's' : ''}
              </p>
              <p style={{ fontSize: '0.82rem', color: 'var(--color-text-secondary)', margin: '0.15rem 0 0 0' }}>
                Readers have applied to join as Authors or Editors. Review their writing portfolios and assign roles.
              </p>
            </div>
          </div>
          <Link
            to="/admin/applications"
            style={{
              backgroundColor: '#EC4899',
              color: '#FFFFFF',
              padding: '0.45rem 1rem',
              borderRadius: 'var(--radius-md)',
              fontWeight: 700,
              fontSize: '0.85rem',
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
            }}
          >
            Review Applications →
          </Link>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
        {statCards.map(card => {
          const Icon = card.icon;
          return (
            <Link
              key={card.label}
              to={card.link}
              style={{
                backgroundColor: 'var(--color-card)',
                padding: '1.25rem',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--color-border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                transition: 'transform var(--transition-fast), border-color var(--transition-fast)',
              }}
            >
              <div>
                <span style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', display: 'block', marginBottom: '0.35rem', fontWeight: 600 }}>
                  {card.label}
                </span>
                <span style={{ fontSize: '1.8rem', fontWeight: 800, fontFamily: 'var(--font-heading)' }}>
                  {card.value}
                </span>
              </div>
              <div style={{ width: '42px', height: '42px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--color-surface-alt)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: card.color }}>
                <Icon size={22} />
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

