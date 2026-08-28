import React from 'react';
import { useSettings } from '../../context/SettingsContext';
import { SeoHead } from '../../components/common/SeoHead';

export const PrivacyPolicy: React.FC = () => {
  const { settings } = useSettings();
  const siteName = settings.site_name || 'BitBlog';

  return (
    <div className="container" style={{ padding: '3rem 1rem', maxWidth: '800px' }}>
      <SeoHead
        title={`Privacy Policy | ${siteName}`}
        description={`Learn how ${siteName} collects, protects, and handles your user data and privacy.`}
      />
      <article style={{ padding: '2.5rem', backgroundColor: 'var(--color-card)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)' }}>
        <h1 style={{ fontSize: '2rem', marginBottom: '1rem', fontFamily: 'var(--font-heading)' }}>Privacy Policy</h1>
        <p style={{ color: 'var(--color-text-secondary)', lineHeight: 1.8 }}>
          This Privacy Policy outlines how {siteName} collects, uses, protects, and manages reader accounts, personal information, and site analytics in accordance with global privacy best practices.
        </p>
      </article>
    </div>
  );
};
