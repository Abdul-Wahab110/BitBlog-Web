import React, { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  FileText,
  PlusCircle,
  Clock,
  FolderTree,
  Tag,
  MessageSquare,
  Users,
  Image as ImageIcon,
  Mail,
  Inbox,
  BarChart3,
  Search,
  Settings,
  ArrowLeft,
  UserCheck,
  Menu,
  X,
  Shield,
  LogOut,
  User,
  Edit,
  Award,
  Activity,
} from 'lucide-react';
import { ThemeToggle } from '../common/ThemeToggle';
import { UserAvatar } from '../common/UserAvatar';
import { BrandLogo } from '../common/BrandLogo';
import { PortalNotificationToast } from '../common/PortalNotificationToast';
import { useAuth } from '../../context/AuthContext';

export const AdminLayout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const allNavItems = [
    { label: 'Dashboard', path: '/admin', icon: LayoutDashboard, minRole: 'Author' },
    { label: 'All Posts', path: '/admin/posts', icon: FileText, minRole: 'Author' },
    { label: 'Add New Post', path: '/admin/posts/new', icon: PlusCircle, minRole: 'Author' },
    { label: 'Drafts', path: '/admin/posts/drafts', icon: FileText, minRole: 'Author' },
    { label: 'Scheduled Posts', path: '/admin/posts/scheduled', icon: Clock, minRole: 'Author' },
    { label: 'Categories', path: '/admin/categories', icon: FolderTree, minRole: 'Editor' },
    { label: 'Tags', path: '/admin/tags', icon: Tag, minRole: 'Editor' },
    { label: 'Comments', path: '/admin/comments', icon: MessageSquare, minRole: 'Editor' },
    { label: 'Users', path: '/admin/users', icon: Users, minRole: 'Admin' },
    { label: 'Authors', path: '/admin/authors', icon: UserCheck, minRole: 'Editor' },
    { label: 'Role Applications', path: '/admin/applications', icon: Award, minRole: 'Editor' },
    { label: 'Audit Logs', path: '/admin/audit', icon: Activity, minRole: 'Editor' },
    { label: 'Media Library', path: '/admin/media', icon: ImageIcon, minRole: 'Author' },
    { label: 'Newsletter', path: '/admin/newsletter', icon: Mail, minRole: 'Admin' },
    { label: 'Contact Messages', path: '/admin/messages', icon: Inbox, minRole: 'Editor' },
    { label: 'Analytics', path: '/admin/analytics', icon: BarChart3, minRole: 'Admin' },
    { label: 'SEO Settings', path: '/admin/seo', icon: Search, minRole: 'Admin' },
    { label: 'System Settings', path: '/admin/settings', icon: Settings, minRole: 'Admin' },
    { label: 'My Profile & Photo', path: '/admin/profile', icon: User, minRole: 'Author' },
  ];

  const userRole = user?.role || 'Author';
  const navItems = allNavItems.filter(item => {
    if (userRole === 'Admin') return true;
    if (userRole === 'Editor') return item.minRole === 'Author' || item.minRole === 'Editor';
    if (userRole === 'Author') return item.minRole === 'Author';
    return false;
  });

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
            zIndex: 150,
            backdropFilter: 'blur(4px)',
          }}
        />
      )}

      {/* WordPress-Inspired Admin Side Menu */}
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
          zIndex: 160,
          transform: mobileDrawerOpen ? 'translateX(0)' : undefined,
          transition: 'transform var(--transition-normal)',
          boxShadow: mobileDrawerOpen ? 'var(--shadow-xl)' : 'none',
        }}
        className={mobileDrawerOpen ? '' : 'desktop-only'}
      >
        <div style={{ padding: '1.25rem 1rem', borderBottom: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link to="/admin" style={{ textDecoration: 'none' }}>
            <BrandLogo size={32} textSuffix="CMS" />
          </Link>

          <button onClick={() => setMobileDrawerOpen(false)} className="mobile-only" style={{ background: 'transparent', padding: '0.3rem', color: 'var(--color-text-secondary)' }}>
            <X size={20} />
          </button>
        </div>

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
                }}
              >
                <Icon size={16} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div style={{ padding: '1rem', borderTop: '1px solid var(--color-border)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <Link
            to="/"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontSize: '0.85rem',
              color: 'var(--color-text-secondary)',
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
            }}
          >
            <LogOut size={15} /> Sign Out ({user?.name ? user.name.split(' ')[0] : 'User'})
          </button>
        </div>
      </aside>

      {/* Main Content Area Wrapper */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }} className="admin-main-content">
        {/* Admin Header Bar */}
        <header style={{ padding: '0.75rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--color-border)', backgroundColor: 'var(--color-surface)', position: 'sticky', top: 0, zIndex: 100 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <button
              onClick={() => setMobileDrawerOpen(true)}
              className="mobile-only"
              style={{ background: 'transparent', padding: '0.35rem', color: 'var(--color-text)' }}
              aria-label="Toggle admin sidebar menu"
            >
              <Menu size={22} />
            </button>
            <h2 style={{ fontSize: '1.05rem', margin: 0, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Shield size={18} color="var(--color-secondary)" />
              {user?.role === 'Editor' ? 'Editorial Workspace' : user?.role === 'Author' ? 'Author Studio' : 'Admin Control Panel'}
            </h2>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <ThemeToggle />
            <Link
              to="/admin/profile"
              title="Click to edit your admin profile and picture"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.65rem',
                fontSize: '0.85rem',
                fontWeight: 600,
                color: 'var(--color-text)',
                textDecoration: 'none',
                padding: '0.3rem 0.6rem',
                borderRadius: 'var(--radius-full)',
                backgroundColor: 'var(--color-surface-alt)',
                border: '1px solid var(--color-border)',
              }}
            >
              <UserAvatar
                src={user?.profile_image || user?.profileImage}
                name={user?.name || 'Administrator'}
                size={30}
                showOnline={true}
              />
              <span className="desktop-only">{user?.name ? user.name.split(' ')[0] : 'Admin'}</span>
              <span
                style={{
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  backgroundColor: 'var(--color-secondary)',
                  color: '#FFFFFF',
                  padding: '0.1rem 0.45rem',
                  borderRadius: 'var(--radius-full)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.2rem',
                }}
              >
                <Edit size={11} /> Profile
              </span>
            </Link>
          </div>
        </header>

        <main style={{ flex: 1, padding: '1.5rem 1rem', overflowY: 'auto' }}>
          <Outlet />
        </main>
      </div>

      {/* Real-time Portal Request & Activity Notification Toast */}
      <PortalNotificationToast />

      <style>{`
        @media (min-width: 1024px) {
          .admin-main-content {
            margin-left: 240px;
          }
        }
      `}</style>
    </div>
  );
};
