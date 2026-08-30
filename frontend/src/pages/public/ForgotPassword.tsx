import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { KeyRound, Mail, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { SeoHead } from '../../components/common/SeoHead';
import { useSettings } from '../../context/SettingsContext';

export const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const { settings } = useSettings();
  const siteName = settings.site_name || 'BitBlog';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubmitted(true);
    }
  };

  return (
    <main className="container" style={{ padding: '3rem 1rem 5rem 1rem', maxWidth: '440px', minHeight: 'calc(100vh - 200px)', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
      <SeoHead
        title={`Reset Password | ${siteName}`}
        description={`Reset your ${siteName} account password.`}
        robots="noindex, nofollow"
      />

      <section
        style={{
          padding: '2.5rem 2rem',
          backgroundColor: 'var(--color-card)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--color-border)',
          boxShadow: 'var(--shadow-lg)',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
          <div
            style={{
              width: '46px',
              height: '46px',
              backgroundColor: 'var(--color-surface-alt)',
              color: 'var(--color-secondary)',
              borderRadius: 'var(--radius-md)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '0.75rem',
            }}
          >
            <KeyRound size={22} />
          </div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: '0.25rem' }}>Reset Password</h1>
          <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
            Enter your account email to receive reset instructions
          </p>
        </div>

        {submitted ? (
          <div
            style={{
              padding: '1.5rem',
              backgroundColor: 'rgba(16, 185, 129, 0.12)',
              border: '1px solid var(--color-success)',
              borderRadius: 'var(--radius-md)',
              color: 'var(--color-success)',
              textAlign: 'center',
              marginBottom: '1.5rem',
            }}
          >
            <CheckCircle2 size={32} style={{ margin: '0 auto 0.5rem auto' }} />
            <h4 style={{ fontSize: '1rem', marginBottom: '0.25rem', fontWeight: 700 }}>Check Your Inbox</h4>
            <p style={{ fontSize: '0.85rem' }}>
              If an account with <strong>{email}</strong> exists, password reset instructions have been dispatched.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '1.25rem' }}>
              <label
                htmlFor="forgot-email"
                style={{ display: 'block', fontWeight: 600, marginBottom: '0.4rem', fontSize: '0.85rem' }}
              >
                Account Email *
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  id="forgot-email"
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.75rem 0.65rem 2.3rem',
                    fontSize: '0.9rem',
                    borderRadius: 'var(--radius-md)',
                  }}
                />
                <Mail
                  size={16}
                  color="var(--color-muted)"
                  style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)' }}
                />
              </div>
            </div>

            <button
              type="submit"
              style={{
                width: '100%',
                backgroundColor: 'var(--color-secondary)',
                color: '#FFFFFF',
                padding: '0.75rem',
                fontWeight: 700,
                fontSize: '0.95rem',
                borderRadius: 'var(--radius-md)',
                minHeight: '44px',
              }}
            >
              <KeyRound size={16} /> Send Reset Link
            </button>
          </form>
        )}

        <div
          style={{
            marginTop: '1.75rem',
            textAlign: 'center',
            fontSize: '0.85rem',
            borderTop: '1px solid var(--color-border)',
            paddingTop: '1.25rem',
          }}
        >
          <Link
            to="/login"
            style={{
              color: 'var(--color-secondary)',
              fontWeight: 600,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
            }}
          >
            <ArrowLeft size={14} /> Back to Sign In
          </Link>
        </div>
      </section>
    </main>
  );
};

