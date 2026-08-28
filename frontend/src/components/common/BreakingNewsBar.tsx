import React from 'react';
import { Flame } from 'lucide-react';
import { useSettings } from '../../context/SettingsContext';

interface BreakingNewsBarProps {
  title?: string;
}

export const BreakingNewsBar: React.FC<BreakingNewsBarProps> = ({ title }) => {
  const { settings } = useSettings();
  const siteName = settings.site_name || 'BitBlog';

  return (
    <div
      style={{
        backgroundColor: 'var(--color-cream)',
        color: 'var(--color-primary)',
        padding: '0.5rem 1rem',
        borderBottom: '1px solid var(--color-border)',
        fontSize: '0.875rem',
        fontWeight: 500,
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
      }}
    >
      <span
        style={{
          backgroundColor: 'var(--color-accent-pink)',
          color: '#FFFFFF',
          padding: '0.15rem 0.5rem',
          borderRadius: 'var(--radius-sm)',
          fontSize: '0.75rem',
          fontWeight: 700,
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.25rem',
          textTransform: 'uppercase',
        }}
      >
        <Flame size={14} /> Trending
      </span>
      <span>{title || `Welcome to ${siteName} — High performance digital publication platform.`}</span>
    </div>
  );
};
