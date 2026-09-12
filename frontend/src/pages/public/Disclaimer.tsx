import React from 'react';
import { useSettings } from '../../context/SettingsContext';
import { SeoHead } from '../../components/common/SeoHead';

export const Disclaimer: React.FC = () => {
  const { settings } = useSettings();
  const siteName = settings.site_name || 'BitBlog';

  return (
    <div className="container" style={{ padding: '3rem 1rem', maxWidth: '800px' }}>
      <SeoHead
        title={`Editorial Disclaimer | ${siteName}`}
        description={`Read the editorial transparency and opinion disclaimer for ${siteName}.`}
      />
      <article style={{ padding: '2.5rem', backgroundColor: 'var(--color-card)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)' }}>
        <h1 style={{ fontSize: '2rem', marginBottom: '1rem', fontFamily: 'var(--font-heading)' }}>Editorial Disclaimer</h1>
        <p style={{ color: 'var(--color-text-secondary)', lineHeight: 1.8 }}>
          All opinions, reporting, and analysis expressed on {siteName} belong to their respective authors and contributors. Content is provided for educational and informative editorial purposes.
        </p>
      </article>
    </div>
  );
};

