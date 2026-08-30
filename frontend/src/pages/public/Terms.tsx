import React from 'react';
import { useSettings } from '../../context/SettingsContext';
import { SeoHead } from '../../components/common/SeoHead';

export const Terms: React.FC = () => {
  const { settings } = useSettings();
  const siteName = settings.site_name || 'BitBlog';

  return (
    <div className="container" style={{ padding: '3rem 1rem', maxWidth: '800px' }}>
      <SeoHead
        title={`Terms of Service | ${siteName}`}
        description={`Read the terms of service and community publishing guidelines for ${siteName}.`}
      />
      <article style={{ padding: '2.5rem', backgroundColor: 'var(--color-card)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)' }}>
        <h1 style={{ fontSize: '2rem', marginBottom: '1rem', fontFamily: 'var(--font-heading)' }}>Terms & Conditions</h1>
        <p style={{ color: 'var(--color-text-secondary)', lineHeight: 1.8 }}>
          By accessing and using {siteName}, you agree to comply with our editorial terms, reader conduct guidelines, and intellectual property policies.
        </p>
      </article>
    </div>
  );
};

