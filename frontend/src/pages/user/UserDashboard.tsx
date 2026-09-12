import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Bookmark,
  MessageSquare,
  Bell,
  ArrowRight,
  BookOpen,
  User,
  Sparkles,
  Heart,
  TrendingUp,
  Compass,
  Award,
  ShieldCheck,
} from 'lucide-react';
import { LoadingState } from '../../components/common/LoadingState';
import { useAuth } from '../../context/AuthContext';
import { ApiService } from '../../services/api';
import { SeoHead } from '../../components/common/SeoHead';
import { useSettings } from '../../context/SettingsContext';

export const UserDashboard: React.FC = () => {
  const { user } = useAuth();
  const { settings } = useSettings();
  const siteName = settings.site_name || 'BitBlog';
  const [bookmarksCount, setBookmarksCount] = useState(0);
  const [commentsCount, setCommentsCount] = useState(0);
  const [notificationsCount, setNotificationsCount] = useState(0);
  const [recentBookmarks, setRecentBookmarks] = useState<any[]>([]);
  const [recommendedPosts, setRecommendedPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [bookmarksRes, commentsRes, notifRes, postsRes] = await Promise.allSettled([
          ApiService.getUserBookmarks(),
          ApiService.getUserComments(),
          ApiService.getUserNotifications(),
          ApiService.getPosts({ limit: 4 }),
        ]);

        if (bookmarksRes.status === 'fulfilled' && bookmarksRes.value?.data) {
          const list = bookmarksRes.value.data;
          setBookmarksCount(list.length);
          setRecentBookmarks(list.slice(0, 3));
        }

        if (commentsRes.status === 'fulfilled' && commentsRes.value?.data) {
          setCommentsCount(commentsRes.value.data.length);
        }

        if (notifRes.status === 'fulfilled' && notifRes.value?.data) {
          const unread = notifRes.value.data.filter((n: any) => !n.is_read).length;
          setNotificationsCount(unread);
        }

        if (postsRes.status === 'fulfilled' && postsRes.value?.data) {
          const sorted = [...postsRes.value.data]
            .sort((a: any, b: any) => (b.views_count || 0) - (a.views_count || 0))
            .slice(0, 3);
          setRecommendedPosts(sorted);
        }
      } catch (err) {
        console.error('Failed to load user dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  if (loading) {
    return <LoadingState message="Loading your reader workspace..." />;
  }

  const statCards = [
    { label: 'Saved Bookmarks', value: bookmarksCount, icon: Bookmark, color: '#3B82F6', link: '/user/bookmarks', desc: 'Articles saved for offline reading' },
    { label: 'My Comments', value: commentsCount, icon: MessageSquare, color: '#10B981', link: '/user/comments', desc: 'Discussions & community replies' },
    { label: 'Notifications', value: notificationsCount, icon: Bell, color: '#F59E0B', link: '/user/notifications', desc: 'Unread alerts and responses' },
  ];

  return (
    <div>
      <SeoHead
        title={`Reader Dashboard | ${siteName}`}
        description="Reader account control center and personal reading activity."
        robots="noindex, nofollow"
      />

      <header style={{ marginBottom: '1.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.65rem', marginBottom: '0.35rem', fontFamily: 'var(--font-heading)' }}>
            Welcome back, {user?.name || 'Reader'}!
          </h1>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem', margin: 0 }}>
            Here is your personal reading overview, saved articles, and community discussions
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Link
            to="/user/profile"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.45rem',
              padding: '0.55rem 1rem',
              backgroundColor: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              color: 'var(--color-text)',
              fontWeight: 600,
              fontSize: '0.85rem',
              borderRadius: 'var(--radius-md)',
              textDecoration: 'none',
            }}
          >
            <User size={15} color="var(--color-secondary)" /> Edit My Profile & Photo
          </Link>

          <Link
            to="/blog"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.45rem',
              padding: '0.55rem 1.15rem',
              backgroundColor: 'var(--color-secondary)',
              color: '#FFFFFF',
              fontWeight: 700,
              fontSize: '0.85rem',
              borderRadius: 'var(--radius-md)',
              boxShadow: '0 2px 8px var(--color-secondary-glow)',
              textDecoration: 'none',
            }}
          >
            <Compass size={15} /> Explore Stories
          </Link>
        </div>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
        {statCards.map(card => {
          const Icon = card.icon;
          return (
            <Link
              key={card.label}
              to={card.link}
              style={{
                backgroundColor: 'var(--color-card)',
                padding: '1.35rem',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--color-border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                transition: 'transform var(--transition-fast), border-color var(--transition-fast)',
                textDecoration: 'none',
                color: 'var(--color-text)',
              }}
            >
              <div>
                <span style={{ fontSize: '0.82rem', color: 'var(--color-text-secondary)', display: 'block', marginBottom: '0.35rem', fontWeight: 600 }}>
                  {card.label}
                </span>
                <span style={{ fontSize: '1.85rem', fontWeight: 800, fontFamily: 'var(--font-heading)' }}>
                  {card.value}
                </span>
                <span style={{ fontSize: '0.72rem', color: 'var(--color-muted)', display: 'block', marginTop: '0.2rem' }}>
                  {card.desc}
                </span>
              </div>
              <div style={{ width: '46px', height: '46px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--color-surface-alt)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: card.color, flexShrink: 0 }}>
                <Icon size={24} />
              </div>
            </Link>
          );
        })}
      </div>

      {user?.role && user.role !== 'User' ? (
        <div
          style={{
            backgroundColor: 'var(--color-card)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-lg, 12px)',
            padding: '1.5rem 1.75rem',
            marginBottom: '2rem',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.25rem' }}>
            <div
              style={{
                width: '44px',
                height: '44px',
                borderRadius: 'var(--radius-md, 8px)',
                backgroundColor: 'rgba(99, 102, 241, 0.12)',
                border: '1px solid rgba(99, 102, 241, 0.25)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--color-secondary)',
                flexShrink: 0,
              }}
            >
              <ShieldCheck size={24} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: '0 0 0.3rem 0', color: 'var(--color-text)', fontFamily: 'var(--font-heading)' }}>
                You are a Verified {user?.role}!
              </h3>
              <p style={{ fontSize: '0.88rem', color: 'var(--color-text-secondary)', margin: 0, lineHeight: 1.5 }}>
                {user?.role === 'Author'
                  ? 'You hold Author privileges with access to the Staff Editorial Studio. You can also apply for the Editor role below.'
                  : `You hold full ${user?.role} clearance with access to the complete Editorial Workspace.`}
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <Link
              to="/admin"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                backgroundColor: 'var(--color-secondary)',
                color: '#FFFFFF',
                padding: '0.65rem 1.35rem',
                borderRadius: 'var(--radius-md, 8px)',
                fontWeight: 700,
                fontSize: '0.9rem',
                textDecoration: 'none',
                boxShadow: '0 4px 12px var(--color-secondary-glow, rgba(99, 102, 241, 0.35))',
                transition: 'transform var(--transition-fast)',
              }}
            >
              Go to Staff Studio <ArrowRight size={16} />
            </Link>

            {user?.role === 'Author' && (
              <Link
                to="/user/apply"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  padding: '0.65rem 1.15rem',
                  backgroundColor: 'transparent',
                  border: '1px solid var(--color-border)',
                  color: 'var(--color-text)',
                  borderRadius: 'var(--radius-md, 8px)',
                  fontWeight: 600,
                  fontSize: '0.86rem',
                  textDecoration: 'none',
                  transition: 'background-color var(--transition-fast)',
                }}
              >
                <Award size={15} color="var(--color-secondary)" /> Apply for Editor Role
              </Link>
            )}
          </div>
        </div>
      ) : (
        <div
          style={{
            background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.12) 0%, rgba(139, 92, 246, 0.12) 100%)',
            border: '1px solid rgba(99, 102, 241, 0.25)',
            borderRadius: 'var(--radius-lg)',
            padding: '1.5rem 1.75rem',
            marginBottom: '2rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1.25rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', maxWidth: '580px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--color-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFFFFF', flexShrink: 0, boxShadow: '0 4px 12px var(--color-secondary-glow)' }}>
              <Award size={26} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, margin: '0 0 0.25rem 0', fontFamily: 'var(--font-heading)' }}>
                Want to write stories or review content?
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', margin: 0, lineHeight: 1.5 }}>
                Apply to become a verified <strong>Author</strong> (to draft & submit articles) or an <strong>Editor</strong> (to review submissions & organize categories).
              </p>
            </div>
          </div>

          <Link
            to="/user/apply"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              backgroundColor: 'var(--color-secondary)',
              color: '#FFFFFF',
              padding: '0.65rem 1.35rem',
              borderRadius: 'var(--radius-md)',
              fontWeight: 700,
              fontSize: '0.88rem',
              textDecoration: 'none',
              boxShadow: '0 2px 8px var(--color-secondary-glow)',
            }}
          >
            Apply for Role <ArrowRight size={16} />
          </Link>
        </div>
      )}

      {recentBookmarks.length > 0 && (
        <div style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0, fontFamily: 'var(--font-heading)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Bookmark size={18} color="var(--color-secondary)" /> Saved Articles For Later
            </h3>
            <Link to="/user/bookmarks" style={{ fontSize: '0.82rem', color: 'var(--color-secondary)', fontWeight: 600, textDecoration: 'none' }}>
              View All ({bookmarksCount}) →
            </Link>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
            {recentBookmarks.map(bm => (
              <Link
                key={bm.bookmark_id || bm.post_id}
                to={`/blog/${bm.slug || bm.post_id}`}
                style={{
                  backgroundColor: 'var(--color-card)',
                  padding: '1.15rem',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--color-border)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '0.75rem',
                  textDecoration: 'none',
                  color: 'var(--color-text)',
                  transition: 'border-color var(--transition-fast)',
                }}
              >
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-secondary)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    {bm.category_name || 'Story'}
                  </span>
                  <h4 style={{ fontSize: '0.98rem', fontWeight: 700, margin: '0.35rem 0 0.25rem 0', lineHeight: 1.3 }}>
                    {bm.title || 'Saved Article'}
                  </h4>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.78rem', color: 'var(--color-muted)' }}>
                  <span>By {bm.author_name || 'Author'}</span>
                  <span style={{ color: 'var(--color-secondary)', fontWeight: 600 }}>Read Story →</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      <div style={{ backgroundColor: 'var(--color-card)', padding: '1.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.25rem' }}>
        <div>
          <h3 style={{ fontSize: '1.15rem', marginBottom: '0.25rem', fontFamily: 'var(--font-heading)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Sparkles size={18} color="var(--color-secondary)" /> Discover New Stories & Curated Editorial Topics
          </h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', margin: 0 }}>
            Explore trending technology, design, and culture articles from our verified staff and editorial team.
          </p>
        </div>
        <Link
          to="/blog"
          style={{
            backgroundColor: 'var(--color-secondary)',
            color: '#FFFFFF',
            padding: '0.65rem 1.35rem',
            borderRadius: 'var(--radius-md)',
            fontWeight: 700,
            fontSize: '0.88rem',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            textDecoration: 'none',
            boxShadow: '0 2px 8px var(--color-secondary-glow)',
          }}
        >
          Explore All Articles <ArrowRight size={15} />
        </Link>
      </div>
    </div>
  );
};

