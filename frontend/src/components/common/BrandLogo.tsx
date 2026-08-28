import React from 'react';
import { useSettings } from '../../context/SettingsContext';

interface BrandLogoProps {
  size?: number;
  showText?: boolean;
  textSuffix?: string;
  className?: string;
  style?: React.CSSProperties;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  size = 36,
  showText = true,
  textSuffix,
  style,
}) => {
  const { settings } = useSettings();
  const siteName = settings.site_name || 'BitBlog';
  const siteLogo = settings.site_logo;

  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.65rem',
        textDecoration: 'none',
        ...style,
      }}
    >
      {siteLogo ? (
        <img
          src={siteLogo}
          alt={siteName}
          style={{
            height: `${size}px`,
            maxHeight: `${size}px`,
            width: 'auto',
            maxWidth: `${size * 2.5}px`,
            objectFit: 'contain',
            borderRadius: 'var(--radius-sm, 6px)',
            display: 'block',
            flexShrink: 0,
          }}
        />
      ) : (
        <span
          style={{
            width: `${size}px`,
            height: `${size}px`,
            background: 'linear-gradient(135deg, var(--color-secondary), var(--color-accent))',
            color: '#FFFFFF',
            borderRadius: 'var(--radius-md, 8px)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 800,
            fontSize: `${Math.round(size * 0.45)}px`,
            fontFamily: 'var(--font-heading, sans-serif)',
            flexShrink: 0,
            boxShadow: '0 2px 8px var(--color-secondary-glow, rgba(99,102,241,0.3))',
          }}
        >
          {siteName ? siteName.charAt(0).toUpperCase() : 'M'}
        </span>
      )}

      {showText && (
        <div style={{ lineHeight: 1.15 }}>
          <span
            style={{
              fontSize: size > 32 ? '1.15rem' : '1rem',
              fontWeight: 800,
              letterSpacing: '-0.02em',
              fontFamily: 'var(--font-heading, sans-serif)',
              display: 'block',
              color: 'var(--color-text)',
            }}
          >
            {siteName}
            {textSuffix ? ` ${textSuffix}` : ''}
          </span>
        </div>
      )}
    </div>
  );
};
