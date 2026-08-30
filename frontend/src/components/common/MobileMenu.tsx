import React, { useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { Link, useLocation } from 'react-router-dom';
import {
  X,
  Home,
  BookOpen,
  Folder,
  Tag,
  Users,
  Info,
  Mail,
  LogIn,
  Search,
  Shield,
  ChevronRight,
  User,
  LogOut,
} from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';
import { BrandLogo } from './BrandLogo';
import { useAuth } from '../../context/AuthContext';

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MobileMenu: React.FC<MobileMenuProps> = ({ isOpen, onClose }) => {
  const location = useLocation();
  const { isAuthenticated, user, isStaff, logout, openAuthModal } = useAuth();

  // Handle ESC key to close drawer
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    },
    [isOpen, onClose]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // Lock body scrolling when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Close automatically on route change
  useEffect(() => {
    onClose();
  }, [location.pathname]);

  const navLinkStyle = (active: boolean): React.CSSProperties => ({
    display: 'flex',
    alignItems: 'center',
    gap: '0.85rem',
    padding: '0.75rem 1rem',
    fontWeight: active ? 700 : 500,
    fontSize: '0.92rem',
    color: active ? 'var(--color-secondary)' : 'var(--color-text)',
    backgroundColor: active ? 'var(--color-surface-alt)' : 'transparent',
    borderRadius: 'var(--radius-md)',
    transition: 'all var(--transition-fast)',
    minHeight: '44px', // Comfortable touch target
  });

  const drawerContent = (
    <>
      {/* Backdrop overlay */}
      <div
        onClick={onClose}
        aria-hidden="true"
        className="mobile-nav-backdrop"
        style={{
          opacity: isOpen ? 1 : 0,
          pointerEvents: isOpen ? 'auto' : 'none',
        }}
      />

      {/* Slide-in drawer */}
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Mobile navigation drawer"
        className="mobile-nav-drawer"
        style={{
          transform: isOpen ? 'translateX(0)' : 'translateX(-100%)',
        }}
      >
        {/* Drawer Header */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '1.15rem 1.25rem',
            borderBottom: '1px solid var(--color-border)',
            backgroundColor: 'var(--color-surface)',
            flexShrink: 0,
          }}
        >
          <Link
            to="/"
            onClick={onClose}
            style={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}
          >
            <BrandLogo size={34} />
          </Link>
          <button
            onClick={onClose}
            aria-label="Close navigation drawer"
            style={{
              background: 'transparent',
              border: 'none',
              padding: '0.45rem',
              color: 'var(--color-text)',
              borderRadius: 'var(--radius-md)',
              minHeight: '38px',
              minWidth: '38px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
            }}
          >
            <X size={22} />
          </button>
        </div>

        {/* Navigation Links */}
        <nav
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '0.75rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.2rem',
          }}
        >
          <Link to="/" onClick={onClose} style={navLinkStyle(location.pathname === '/')}>
            <Home size={18} /> Home
          </Link>

          <Link to="/blog" onClick={onClose} style={navLinkStyle(location.pathname === '/blog')}>
            <BookOpen size={18} /> Articles
          </Link>

          <Link to="/categories" onClick={onClose} style={navLinkStyle(location.pathname.startsWith('/categor'))}>
            <Folder size={18} /> Categories
          </Link>

          <Link to="/tags" onClick={onClose} style={navLinkStyle(location.pathname.startsWith('/tag'))}>
            <Tag size={18} /> Tags
          </Link>

          <Link to="/authors" onClick={onClose} style={navLinkStyle(location.pathname === '/authors')}>
            <Users size={18} /> Authors
          </Link>

          <Link to="/search" onClick={onClose} style={navLinkStyle(location.pathname === '/search')}>
            <Search size={18} /> Search
          </Link>

          <div style={{ height: '1px', backgroundColor: 'var(--color-border)', margin: '0.5rem 0.25rem' }} />

          <Link to="/about" onClick={onClose} style={navLinkStyle(location.pathname === '/about')}>
            <Info size={18} /> About Us
          </Link>

          <Link to="/contact" onClick={onClose} style={navLinkStyle(location.pathname === '/contact')}>
            <Mail size={18} /> Contact
          </Link>

          {/* If staff, show CMS Admin link */}
          {isStaff && (
            <>
              <div style={{ height: '1px', backgroundColor: 'var(--color-border)', margin: '0.5rem 0.25rem' }} />
              <Link
                to="/admin"
                onClick={onClose}
                style={{
                  ...navLinkStyle(location.pathname.startsWith('/admin')),
                  color: 'var(--color-secondary)',
                  fontWeight: 700,
                }}
              >
                <Shield size={18} /> CMS Admin Panel
              </Link>
            </>
          )}
        </nav>

        {/* Drawer Footer */}
        <div
          style={{
            padding: '1rem 1.25rem',
            borderTop: '1px solid var(--color-border)',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem',
            backgroundColor: 'var(--color-surface-alt)',
            flexShrink: 0,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', fontWeight: 600 }}>
              Appearance
            </span>
            <ThemeToggle />
          </div>

          {isAuthenticated && user ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <Link
                to="/user/dashboard"
                onClick={onClose}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  padding: '0.65rem',
                  backgroundColor: 'var(--color-secondary)',
                  color: '#FFFFFF',
                  fontWeight: 700,
                  fontSize: '0.88rem',
                  borderRadius: 'var(--radius-md)',
                  minHeight: '44px',
                }}
              >
                <User size={16} /> Reader Dashboard ({user.name.split(' ')[0]}) <ChevronRight size={14} />
              </Link>

              <Link
                to="/user/profile"
                onClick={onClose}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  padding: '0.65rem',
                  backgroundColor: 'var(--color-surface)',
                  border: '1px solid var(--color-border)',
                  color: 'var(--color-text)',
                  fontWeight: 600,
                  fontSize: '0.88rem',
                  borderRadius: 'var(--radius-md)',
                  minHeight: '44px',
                }}
              >
                <User size={16} color="var(--color-secondary)" /> Edit My Profile & Photo
              </Link>

              <button
                onClick={() => {
                  logout();
                  onClose();
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.4rem',
                  padding: '0.55rem',
                  backgroundColor: 'transparent',
                  color: 'var(--color-danger)',
                  border: '1px solid var(--color-danger)',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                  borderRadius: 'var(--radius-md)',
                  minHeight: '40px',
                }}
              >
                <LogOut size={15} /> Sign Out
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => {
                onClose();
                openAuthModal('login');
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                padding: '0.65rem',
                backgroundColor: 'var(--color-secondary)',
                color: '#FFFFFF',
                fontWeight: 700,
                fontSize: '0.88rem',
                borderRadius: 'var(--radius-md)',
                minHeight: '44px',
                width: '100%',
              }}
            >
              <LogIn size={16} /> Sign In <ChevronRight size={14} />
            </button>
          )}
        </div>
      </aside>
    </>
  );

  if (typeof document === 'undefined') return null;
  return createPortal(drawerContent, document.body);
};
