import React, { useState, useEffect, useCallback } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  FileText,
  PlusCircle,
  Bookmark,
  MessageSquare,
  Bell,
  Settings,
  User,
  ArrowLeft,
  Menu,
  X,
  LogOut,
  Edit,
  Sparkles,
  BookOpen,
  Award,
  ShieldCheck,
} from 'lucide-react';
import { ThemeToggle } from '../common/ThemeToggle';
import { UserAvatar } from '../common/UserAvatar';
import { BrandLogo } from '../common/BrandLogo';
import { PortalNotificationToast } from '../common/PortalNotificationToast';
import { useAuth } from '../../context/AuthContext';
import { ApiService } from '../../services/api';

export const UserLayout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState<number>(0);
  const { user, logout } = useAuth();

  // Fetch real unread notifications count from Oracle DB
  useEffect(() => {
    ApiService.getUserNotifications()
      .then(res => {
        if (res && res.data) {
          const unread = res.data.filter((n: any) => !n.is_read).length;
          setUnreadNotifications(unread);
        }
      })
      .catch(() => {});
  }, [location.pathname]);

  // Handle ESC key to close mobile drawer
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape' && mobileDrawerOpen) {
        setMobileDrawerOpen(false);
      }
    },
    [mobileDrawerOpen]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // Lock body scroll when mobile drawer is open
  useEffect(() => {
    if (mobileDrawerOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileDrawerOpen]);

  // Close drawer on route navigation
  useEffect(() => {
    setMobileDrawerOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isStaff = user?.role === 'Author' || user?.role === 'Editor' || user?.role === 'Admin';
  const isAuthor = user?.role === 'Author';

  const navItems = [
    { label: 'Overview', path: '/user/dashboard', icon: LayoutDashboard },
    ...(isStaff
      ? [{ label: 'Go to Staff Studio', path: '/admin', icon: ShieldCheck, isStaffLink: true }]
      : []),
    { label: 'Saved Bookmarks', path: '/user/bookmarks', icon: Bookmark },
    { label: 'My Comments', path: '/user/comments', icon: MessageSquare },
    { label: 'Notifications', path: '/user/notifications', icon: Bell, count: unreadNotifications },
    ...(!user?.role || user?.role === 'User'
      ? [{ label: 'Apply as Author/Editor', path: '/user/apply', icon: Award }]
      : isAuthor
      ? [{ label: 'Apply for Editor Role', path: '/user/apply', icon: Award }]
      : []),
    { label: 'My Profile & Photo', path: '/user/profile', icon: User },
    { label: 'Reader Preferences', path: '/user/settings', icon: Settings },
  ];

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--color-background)', width: '100%', overflowX: 'hidden' }}>
      {/* Mobile Drawer Overlay Backdrop */}
      {mobileDrawerOpen && (
        <div
          onClick={() => setMobileDrawerOpen(false)}
          className="mobile-only"
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'var(--color-overlay)',
            zIndex: 1100,
            backdropFilter: 'blur(4px)',
          }}
        />
      )}

      {/* Reader Portal Unified Sidebar (Matches Admin CMS Design System) */}
      <aside
        style={{
          width: '240px',
          backgroundColor: 'var(--color-surface)',
          borderRight: '1px solid var(--color-border)',
          display: 'flex',
          flexDirection: 'column',
          position: 'fixed',
          top: 0,
          bottom: 0,
          left: 0,
          zIndex: 1200,
          transform: mobileDrawerOpen ? 'translateX(0)' : undefined,
          transition: 'transform var(--transition-normal)',
          boxShadow: mobileDrawerOpen ? 'var(--shadow-xl)' : 'none',
        }}
        className={mobileDrawerOpen ? '' : 'desktop-only'}
      >
        {/* Brand Header */}
        <div style={{ padding: '1.25rem 1rem', borderBottom: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link to="/user/dashboard" style={{ textDecoration: 'none' }}>
            <BrandLogo size={32} textSuffix="Reader" />
          </Link>

          <button onClick={() => setMobileDrawerOpen(false)} className="mobile-only" style={{ background: 'transparent', padding: '0.3rem', color: 'var(--color-text-secondary)', border: 'none', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        {/* Sidebar Nav Items */}
        <nav style={{ flex: 1, overflowY: 'auto', padding: '0.75rem 0.5rem', display: 'flex', flexDirection: 'column', gap: '0.2rem', alignItems: 'stretch' }} onClick={() => setMobileDrawerOpen(false)}>
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.55rem 0.75rem',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '0.85rem',
                  fontWeight: isActive ? 700 : 500,
                  color: isActive ? 'var(--color-secondary)' : 'var(--color-text-secondary)',
                  backgroundColor: isActive ? 'var(--color-surface-alt)' : 'transparent',
                  transition: 'all var(--transition-fast)',
                  textDecoration: 'none',
                }}
              >
                <Icon size={16} />
                <span style={{ flex: 1 }}>{item.label}</span>
                {item.count !== undefined && item.count > 0 && (
                  <span
                    style={{
                      backgroundColor: 'var(--color-secondary)',
                      color: '#FFFFFF',
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      padding: '0.1rem 0.45rem',
                      borderRadius: 'var(--radius-full)',
                    }}
                  >
                    {item.count}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Bottom Footer Actions */}
        <div style={{ padding: '1rem', borderTop: '1px solid var(--color-border)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <Link
            to="/"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontSize: '0.85rem',
              color: 'var(--color-text-secondary)',
              textDecoration: 'none',
            }}
          >
            <ArrowLeft size={16} /> Visit Main Website
          </Link>

          <button
            onClick={handleLogout}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontSize: '0.82rem',
              color: 'var(--color-danger)',
              background: 'transparent',
              padding: '0.3rem 0',
              justifyContent: 'flex-start',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            <LogOut size={15} /> Sign Out ({user?.name ? user.name.split(' ')[0] : 'User'})
          </button>
        </div>
      </aside>

      {/* Main Content Area Wrapper */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }} className="user-main-content">
        {/* Unified Top Header Bar */}
        <header className="cms-portal-header">
          <div className="cms-portal-header-left">
            <button
              onClick={() => setMobileDrawerOpen(true)}
              className="mobile-only cms-hamburger-btn"
              aria-label="Toggle user sidebar menu"
            >
              <Menu size={20} />
            </button>
            <h2 className="cms-portal-title">
              <BookOpen size={16} color="var(--color-secondary)" style={{ flexShrink: 0 }} />
              <span className="cms-title-text">Reader Member Portal</span>
            </h2>
          </div>

          <div className="cms-portal-header-right">
            <ThemeToggle />
            <Link
              to="/user/profile"
              title="Click to edit your profile and picture"
              className="cms-profile-badge"
            >
              <UserAvatar
                src={user?.profile_image || user?.profileImage}
                name={user?.name || 'Reader'}
                size={26}
                showOnline={true}
              />
              <span className="desktop-only cms-user-name">{user?.name ? user.name.split(' ')[0] : 'User'}</span>
              <span className="cms-profile-tag">
                <Edit size={11} /> <span>Profile</span>
              </span>
            </Link>
          </div>
        </header>

        <main style={{ flex: 1, padding: 'clamp(1rem, 2vw, 1.75rem) clamp(0.6rem, 2vw, 1.25rem)', overflowY: 'auto', width: '100%', maxWidth: '100%', boxSizing: 'border-box' }}>
          <Outlet />
        </main>
      </div>

      {/* Real-time Reader Activity & Role Approval Notification Toast */}
      <PortalNotificationToast />

      <style>{`
        @media (min-width: 1024px) {
          .user-main-content {
            margin-left: 240px;
          }
        }
      `}</style>
    </div>
  );
};
