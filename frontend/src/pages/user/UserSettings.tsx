import React, { useState } from 'react';
import { Settings, Save, CheckCircle2 } from 'lucide-react';

export const UserSettings: React.FC = () => {
  const [emailDigest, setEmailDigest] = useState(true);
  const [commentAlerts, setCommentAlerts] = useState(true);
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div>
      <header style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.6rem', marginBottom: '0.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Settings size={22} color="var(--color-secondary)" /> Account Preferences & Settings
        </h1>
        <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>Manage your notification alerts and reading experience</p>
      </header>

      {saved && (
        <div style={{ padding: '0.85rem 1rem', backgroundColor: 'rgba(16, 185, 129, 0.12)', border: '1px solid var(--color-success)', borderRadius: 'var(--radius-md)', color: 'var(--color-success)', marginBottom: '1.25rem', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <CheckCircle2 size={18} /> Preferences updated successfully!
        </div>
      )}

      <div style={{ backgroundColor: 'var(--color-card)', padding: '1.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', maxWidth: '600px' }}>
        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>Email & Notification Preferences</h3>

          <label style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={emailDigest}
              onChange={e => setEmailDigest(e.target.checked)}
              style={{ marginTop: '0.25rem', accentColor: 'var(--color-secondary)' }}
            />
            <div>
              <span style={{ fontWeight: 600, fontSize: '0.9rem', display: 'block' }}>Weekly Editorial Digest</span>
              <span style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>Receive curated highlights of top weekly stories</span>
            </div>
          </label>

          <label style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={commentAlerts}
              onChange={e => setCommentAlerts(e.target.checked)}
              style={{ marginTop: '0.25rem', accentColor: 'var(--color-secondary)' }}
            />
            <div>
              <span style={{ fontWeight: 600, fontSize: '0.9rem', display: 'block' }}>Comment Reply Notifications</span>
              <span style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>Get notified when someone responds to your comments</span>
            </div>
          </label>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
            <button
              type="submit"
              style={{
                backgroundColor: 'var(--color-secondary)',
                color: '#FFFFFF',
                padding: '0.6rem 1.5rem',
                fontWeight: 700,
                fontSize: '0.9rem',
                borderRadius: 'var(--radius-md)',
              }}
            >
              <Save size={16} /> Save Settings
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
