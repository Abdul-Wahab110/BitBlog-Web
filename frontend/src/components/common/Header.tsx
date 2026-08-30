import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Search, Menu, User, Shield, X, LogOut, ChevronDown, PlusCircle, FileText } from 'lucide-react';
import { TopBar } from './TopBar';
import { Navigation } from './Navigation';
import { MobileMenu } from './MobileMenu';
import { ThemeToggle } from './ThemeToggle';
import { UserAvatar } from './UserAvatar';
import { BrandLogo } from './BrandLogo';
import { useAuth } from '../../context/AuthContext';
import { useSettings } from '../../context/SettingsContext';

export const Header: React.FC = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [scrolled, setScrolled] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const { isAuthenticated, user, isStaff, logout, openAuthModal } = useAuth();
  const { settings } = useSettings();
  const navigate = useNavigate();
  const location = useLocation();

  // Track scroll position and calculate real-time reading progress percentage
  const handleScroll = useCallback(() => {
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    setScrolled(scrollTop > 8);

    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    if (docHeight > 0) {
      const progress = Math.min(100, Math.max(0, (scrollTop / docHeight) * 100));
      setScrollProgress(progress);
    } else {
      setScrollProgress(0);
    }
  }, []);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSearchQuery('');
    }
  };

  const handleLogout = () => {
    logout();
    setUserDropdownOpen(false);
    navigate('/');
  };

  return (
    <header
      className={`sticky-header-container ${scrolled ? 'is-scrolled' : ''}`}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        width: '100%',
        zIndex: 1000,
        backgroundColor: scrolled ? undefined : 'var(--color-surface)',
        borderBottom: scrolled ? undefined : '1px solid var(--color-border)',
      }}
    >
      {/* Dynamic Animated Scroll Progress Line */}
      {scrolled && scrollProgress > 0 && (
        <div
          className="scroll-progress-bar"
          style={{
            width: `${scrollProgress}%`,
          }}
        />
      )}

      {/* Ambient subtle glow line when sticky scrolled */}
      {scrolled && <div className="header-scrolled-ambient-line" />}

      {/* Top Utility Bar on Desktop */}
      <TopBar />

      {/* Main Navigation Bar */}
      <div className="container">
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
            height: '64px',
            position: 'relative',
          }}
        >
          {/* Left: Mobile Hamburger & Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            {/* Hamburger Button (Mobile / Tablet) */}
            <button
              onClick={() => setMobileOpen(true)}
              aria-label="Open mobile navigation menu"
              className="mobile-only"
              style={{
                background: 'transparent',
                padding: '0.45rem',
                color: 'var(--color-text)',
                borderRadius: 'var(--radius-md)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Menu size={24} />
            </button>

            {/* Brand Logo */}
            <Link
              to="/"
              className="header-brand-link"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.65rem',
                flexShrink: 0,
                textDecoration: 'none',
              }}
            >
              <div className="header-brand-logo-badge">
                <BrandLogo size={38} showText={false} />
              </div>
              <div style={{ lineHeight: 1.15 }}>
                <span
                  style={{
                    fontSize: '1.35rem',
                    fontWeight: 800,
                    letterSpacing: '-0.025em',
                    fontFamily: 'var(--font-heading)',
                    display: 'block',
                    color: 'var(--color-text)',
                  }}
                >
                  {settings.site_name || 'BitBlog'}
                </span>
                <span className="brand-tagline">
                  Tech & Ideas
                </span>
              </div>
            </Link>
          </div>

          {/* Center: Desktop Navigation */}
          <div className="header-nav-center">
            <Navigation />
          </div>

          {/* Right: Actions (Search, Theme, Auth) */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexShrink: 0 }}>
            {/* Search Toggle Button */}
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              aria-label={searchOpen ? 'Close search bar' : 'Open search bar'}
              className="header-action-btn"
              style={{
                background: searchOpen ? 'var(--color-surface-alt)' : 'transparent',
                border: `1px solid ${searchOpen ? 'var(--color-secondary)' : 'var(--color-border)'}`,
                padding: '0.45rem',
                borderRadius: 'var(--radius-full)',
                color: searchOpen ? 'var(--color-secondary)' : 'var(--color-text)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {searchOpen ? <X size={17} /> : <Search size={17} />}
            </button>

            {/* Write Story Quick Action for Authors/Editors/Admins */}
            {isAuthenticated && isStaff && (
              <Link
                to="/admin/posts/new"
                className="desktop-only header-action-btn"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  backgroundColor: 'var(--color-secondary)',
                  color: '#FFFFFF',
                  padding: '0.4rem 0.95rem',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  textDecoration: 'none',
                  boxShadow: '0 2px 8px var(--color-secondary-glow)',
                }}
              >
                <PlusCircle size={14} /> Write Story
              </Link>
            )}

            {/* Theme Toggle (Available on both desktop & mobile) */}
            <ThemeToggle />

            {/* Auth / Account Controls */}
            {isAuthenticated && user ? (
              <div style={{ position: 'relative' }}>
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="header-action-btn"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.45rem',
                    fontSize: '0.82rem',
                    fontWeight: 600,
                    color: 'var(--color-text)',
                    backgroundColor: 'var(--color-surface-alt)',
                    padding: '0.25rem 0.7rem 0.25rem 0.35rem',
                    borderRadius: 'var(--radius-full)',
                    border: '1px solid var(--color-border)',
                    cursor: 'pointer',
                  }}
                  aria-expanded={userDropdownOpen}
                >
                  <UserAvatar
                    src={user.profile_image || user.profileImage}
                    name={user.name}
                    size={26}
                    border={false}
                  />
                  <span className="desktop-only" style={{ fontWeight: 700 }}>{user.name.split(' ')[0]}</span>
                  <ChevronDown size={13} color="var(--color-muted)" />
                </button>

                {/* User Dropdown Menu */}
                {userDropdownOpen && (
                  <div
                    style={{
                      position: 'absolute',
                      right: 0,
                      top: 'calc(100% + 8px)',
                      backgroundColor: 'var(--color-surface)',
                      border: '1px solid var(--color-border)',
                      borderRadius: 'var(--radius-lg)',
                      boxShadow: 'var(--shadow-lg)',
                      minWidth: '220px',
                      padding: '0.5rem',
                      zIndex: 160,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.2rem',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.6rem 0.75rem', borderBottom: '1px solid var(--color-border)', marginBottom: '0.25rem' }}>
                      <UserAvatar
                        src={user.profile_image || user.profileImage}
                        name={user.name}
                        size={36}
                      />
                      <div style={{ minWidth: 0 }}>
                        <p style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--color-text)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.name}</p>
                        <p style={{ fontSize: '0.75rem', color: 'var(--color-muted)', margin: 0 }}>@{user.username} • {user.role}</p>
                      </div>
                    </div>

                    <Link
                      to="/user/dashboard"
                      onClick={() => setUserDropdownOpen(false)}
                      style={{
                        padding: '0.45rem 0.75rem',
                        fontSize: '0.85rem',
                        borderRadius: 'var(--radius-sm)',
                        color: 'var(--color-text)',
                      }}
                    >
                      Reader Dashboard
                    </Link>

                    <Link
                      to={isStaff && location.pathname.startsWith('/admin') ? '/admin/profile' : '/user/profile'}
                      onClick={() => setUserDropdownOpen(false)}
                      style={{
                        padding: '0.45rem 0.75rem',
                        fontSize: '0.85rem',
                        borderRadius: 'var(--radius-sm)',
                        color: 'var(--color-text)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.4rem',
                      }}
                    >
                      <User size={14} color="var(--color-secondary)" /> Edit Profile & Photo
                    </Link>

                    {isStaff && (
                      <>
                        <Link
                          to="/admin/posts/new"
                          onClick={() => setUserDropdownOpen(false)}
                          style={{
                            padding: '0.45rem 0.75rem',
                            fontSize: '0.85rem',
                            borderRadius: 'var(--radius-sm)',
                            color: 'var(--color-secondary)',
                            fontWeight: 700,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.4rem',
                            backgroundColor: 'var(--color-surface-alt)',
                          }}
                        >
                          <PlusCircle size={14} /> Write New Story
                        </Link>

                        <Link
                          to="/admin/posts"
                          onClick={() => setUserDropdownOpen(false)}
                          style={{
                            padding: '0.45rem 0.75rem',
                            fontSize: '0.85rem',
                            borderRadius: 'var(--radius-sm)',
                            color: 'var(--color-text)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.4rem',
                          }}
                        >
                          <FileText size={14} color="var(--color-secondary)" /> Manage Stories & Drafts
                        </Link>

                        <Link
                          to="/admin"
                          onClick={() => setUserDropdownOpen(false)}
                          style={{
                            padding: '0.45rem 0.75rem',
                            fontSize: '0.85rem',
                            borderRadius: 'var(--radius-sm)',
                            color: 'var(--color-text)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.4rem',
                          }}
                        >
                          <Shield size={14} color="var(--color-secondary)" /> Staff CMS Dashboard
                        </Link>
                      </>
                    )}

                    <Link
                      to="/user/bookmarks"
                      onClick={() => setUserDropdownOpen(false)}
                      style={{
                        padding: '0.45rem 0.75rem',
                        fontSize: '0.85rem',
                        borderRadius: 'var(--radius-sm)',
                        color: 'var(--color-text)',
                      }}
                    >
                      My Bookmarks
                    </Link>

                    <button
                      onClick={handleLogout}
                      style={{
                        padding: '0.45rem 0.75rem',
                        fontSize: '0.85rem',
                        borderRadius: 'var(--radius-sm)',
                        color: 'var(--color-danger)',
                        background: 'transparent',
                        justifyContent: 'flex-start',
                        width: '100%',
                        gap: '0.4rem',
                      }}
                    >
                      <LogOut size={14} /> Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                type="button"
                onClick={() => openAuthModal('login')}
                className="header-action-btn"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  fontSize: '0.84rem',
                  fontWeight: 700,
                  color: '#FFFFFF',
                  backgroundColor: 'var(--color-secondary)',
                  padding: '0.45rem 1.05rem',
                  borderRadius: 'var(--radius-full)',
                  border: 'none',
                  cursor: 'pointer',
                  boxShadow: '0 2px 10px var(--color-secondary-glow)',
                }}
              >
                <User size={15} />
                <span className="desktop-only">Sign In</span>
              </button>
            )}

            {/* CMS Admin Link (desktop only for quick staff access) */}
            {isStaff && (
              <Link
                to="/admin"
                className="desktop-only"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.3rem',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  backgroundColor: 'var(--color-primary)',
                  color: 'var(--color-surface)',
                  padding: '0.45rem 0.95rem',
                  borderRadius: 'var(--radius-full)',
                  transition: 'all var(--transition-fast)',
                }}
              >
                <Shield size={14} /> CMS Admin
              </Link>
            )}
          </div>
        </div>

        {/* Expandable Slide-Down Search Drawer */}
        <div
          style={{
            maxHeight: searchOpen ? '70px' : '0',
            overflow: 'hidden',
            transition: 'max-height var(--transition-normal), opacity var(--transition-fast)',
            opacity: searchOpen ? 1 : 0,
          }}
        >
          <form
            onSubmit={handleSearchSubmit}
            style={{
              display: 'flex',
              flexDirection: 'row',
              gap: '0.5rem',
              paddingBottom: '0.85rem',
              alignItems: 'center',
            }}
          >
            <input
              type="search"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search articles, topics, categories, authors..."
              autoFocus={searchOpen}
              style={{
                flex: 1,
                padding: '0.55rem 1rem',
                borderRadius: 'var(--radius-full)',
                border: '1px solid var(--color-border)',
                backgroundColor: 'var(--color-background)',
                color: 'var(--color-text)',
                fontSize: '0.9rem',
              }}
            />
            <button
              type="submit"
              style={{
                backgroundColor: 'var(--color-secondary)',
                color: '#FFFFFF',
                padding: '0.55rem 1.25rem',
                fontSize: '0.85rem',
                borderRadius: 'var(--radius-full)',
              }}
            >
              Search
            </button>
          </form>
        </div>
      </div>

      {/* Slide-In Mobile / Tablet Navigation Drawer */}
      <MobileMenu isOpen={mobileOpen} onClose={() => setMobileOpen(false)} />
    </header>
  );
};
