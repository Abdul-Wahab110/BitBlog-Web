import React from 'react';
import { Facebook, Twitter, Youtube, Linkedin, TrendingUp } from 'lucide-react';
import { useSettings } from '../../context/SettingsContext';

export const TopBar: React.FC = () => {
  const { settings } = useSettings();

  return (
    <div
      className="desktop-only"
      style={{
        backgroundColor: 'var(--color-surface-alt)',
        borderBottom: '1px solid var(--color-border)',
        fontSize: '0.75rem',
        fontWeight: 500,
        letterSpacing: '0.01em',
        transition: 'background-color var(--transition-normal), border-color var(--transition-normal)',
      }}
    >
      <div
        className="container"
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '0.45rem 1rem',
        }}
      >
        {/* Left: Trending */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              color: 'var(--color-accent)',
              fontWeight: 700,
              fontSize: '0.7rem',
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
            }}
          >
            <TrendingUp size={13} /> {settings.site_name || 'BitBlog'} • Digital Publication
          </span>
        </div>

        {/* Right: Dynamic Social Channels */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {settings.social_facebook && (
            <a
              href={settings.social_facebook}
              target="_blank"
              rel="noreferrer"
              aria-label="Facebook"
              style={{ color: 'var(--color-muted)', transition: 'color var(--transition-fast)' }}
              onMouseEnter={e => (e.currentTarget.style.color = 'var(--color-secondary)')}
              onMouseLeave={e => (e.currentTarget.style.color = 'var(--color-muted)')}
            >
              <Facebook size={13} />
            </a>
          )}

          {settings.social_twitter && (
            <a
              href={settings.social_twitter}
              target="_blank"
              rel="noreferrer"
              aria-label="Twitter / X"
              style={{ color: 'var(--color-muted)', transition: 'color var(--transition-fast)' }}
              onMouseEnter={e => (e.currentTarget.style.color = 'var(--color-secondary)')}
              onMouseLeave={e => (e.currentTarget.style.color = 'var(--color-muted)')}
            >
              <Twitter size={13} />
            </a>
          )}

          {settings.social_linkedin && (
            <a
              href={settings.social_linkedin}
              target="_blank"
              rel="noreferrer"
              aria-label="LinkedIn"
              style={{ color: 'var(--color-muted)', transition: 'color var(--transition-fast)' }}
              onMouseEnter={e => (e.currentTarget.style.color = 'var(--color-secondary)')}
              onMouseLeave={e => (e.currentTarget.style.color = 'var(--color-muted)')}
            >
              <Linkedin size={13} />
            </a>
          )}

          {settings.social_youtube && (
            <a
              href={settings.social_youtube}
              target="_blank"
              rel="noreferrer"
              aria-label="YouTube"
              style={{ color: 'var(--color-muted)', transition: 'color var(--transition-fast)' }}
              onMouseEnter={e => (e.currentTarget.style.color = 'var(--color-secondary)')}
              onMouseLeave={e => (e.currentTarget.style.color = 'var(--color-muted)')}
            >
              <Youtube size={13} />
            </a>
          )}
        </div>
      </div>
    </div>
  );
};
