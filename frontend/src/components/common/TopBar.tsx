import React from 'react';
import { Facebook, Linkedin, TrendingUp, Sparkles, Radio } from 'lucide-react';
import { useSettings } from '../../context/SettingsContext';

export const TopBar: React.FC = () => {
  const { settings } = useSettings();

  const socialLinks = [
    { icon: Facebook, href: settings.social_facebook || 'https://facebook.com', label: 'Facebook' },
    { icon: Linkedin, href: settings.social_linkedin || 'https://linkedin.com', label: 'LinkedIn' },
  ];

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
          padding: '0.4rem 1rem',
        }}
      >

        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              color: 'var(--color-accent)',
              fontWeight: 700,
              fontSize: '0.72rem',
              textTransform: 'uppercase',
              letterSpacing: '0.07em',
            }}
          >
            <TrendingUp size={13} /> {settings.site_name || 'BITBLOG'} • DIGITAL PUBLICATION
          </span>

          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              color: 'var(--color-muted)',
              fontSize: '0.7rem',
              fontWeight: 600,
            }}
          >
            <span
              style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                backgroundColor: 'var(--color-success, #10B981)',
                boxShadow: '0 0 6px rgba(16, 185, 129, 0.6)',
                display: 'inline-block',
              }}
            />
            LIVE TECH FEED
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          {socialLinks.map((item, index) => {
            const Icon = item.icon;
            return (
              <a
                key={index}
                href={item.href}
                target="_blank"
                rel="noreferrer"
                aria-label={item.label}
                style={{
                  color: 'var(--color-muted)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '0.2rem',
                  borderRadius: 'var(--radius-sm, 4px)',
                  transition: 'all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)',
                  textDecoration: 'none',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.color = 'var(--color-secondary)';
                  e.currentTarget.style.transform = 'translateY(-1.5px) scale(1.15)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.color = 'var(--color-muted)';
                  e.currentTarget.style.transform = 'none';
                }}
              >
                <Icon size={13} />
              </a>
            );
          })}
        </div>
      </div>
    </div>
  );
};

