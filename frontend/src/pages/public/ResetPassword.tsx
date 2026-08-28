import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Lock, Eye, EyeOff, CheckCircle2, ArrowLeft } from 'lucide-react';
import { SeoHead } from '../../components/common/SeoHead';
import { useSettings } from '../../context/SettingsContext';

export const ResetPassword: React.FC = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  const { settings } = useSettings();
  const siteName = settings.site_name || 'BitBlog';

  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }
    setErrorMsg(null);
    setSubmitted(true);
    setTimeout(() => {
      navigate('/login');
    }, 2000);
  };

  return (
    <main className="container" style={{ padding: '3rem 1rem 5rem 1rem', maxWidth: '440px', minHeight: 'calc(100vh - 200px)', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
      <SeoHead
        title={`Set New Password | ${siteName}`}
        description={`Choose a new secure password for your ${siteName} account.`}
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
            <Lock size={22} />
          </div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: '0.25rem' }}>Set New Password</h1>
          <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
            Enter your new account password below
          </p>
        </div>

        {errorMsg && (
          <div style={{ padding: '0.75rem 1rem', backgroundColor: 'rgba(239, 68, 68, 0.12)', border: '1px solid var(--color-danger)', borderRadius: 'var(--radius-md)', color: 'var(--color-danger)', marginBottom: '1.25rem', fontSize: '0.85rem' }}>
            {errorMsg}
          </div>
        )}

        {submitted ? (
          <div style={{ padding: '1.5rem', backgroundColor: 'rgba(16, 185, 129, 0.12)', border: '1px solid var(--color-success)', borderRadius: 'var(--radius-md)', color: 'var(--color-success)', textAlign: 'center', marginBottom: '1.5rem' }}>
            <CheckCircle2 size={32} style={{ margin: '0 auto 0.5rem auto' }} />
            <h4 style={{ fontSize: '1rem', fontWeight: 700 }}>Password Updated</h4>
            <p style={{ fontSize: '0.85rem' }}>Redirecting to sign in...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '1.15rem' }}>
              <label htmlFor="reset-pass" style={{ display: 'block', fontWeight: 600, marginBottom: '0.4rem', fontSize: '0.85rem' }}>New Password *</label>
              <div style={{ position: 'relative' }}>
                <input
                  id="reset-pass"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  style={{ width: '100%', padding: '0.65rem 2.4rem 0.65rem 2.3rem', fontSize: '0.9rem', borderRadius: 'var(--radius-md)' }}
                />
                <Lock size={16} color="var(--color-muted)" style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)' }} />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ position: 'absolute', right: '0.5rem', top: '50%', transform: 'translateY(-50%)', background: 'transparent', padding: '0.3rem', color: 'var(--color-muted)' }}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label htmlFor="reset-confirm" style={{ display: 'block', fontWeight: 600, marginBottom: '0.4rem', fontSize: '0.85rem' }}>Confirm Password *</label>
              <div style={{ position: 'relative' }}>
                <input
                  id="reset-confirm"
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  style={{ width: '100%', padding: '0.65rem 0.75rem 0.65rem 2.3rem', fontSize: '0.9rem', borderRadius: 'var(--radius-md)' }}
                />
                <Lock size={16} color="var(--color-muted)" style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)' }} />
              </div>
            </div>

            <button type="submit" style={{ width: '100%', backgroundColor: 'var(--color-secondary)', color: '#FFF', padding: '0.75rem', fontWeight: 700, fontSize: '0.95rem', borderRadius: 'var(--radius-md)', minHeight: '44px' }}>
              Update Password
            </button>
          </form>
        )}

        <div style={{ marginTop: '1.75rem', textAlign: 'center', fontSize: '0.85rem', borderTop: '1px solid var(--color-border)', paddingTop: '1.25rem' }}>
          <Link to="/login" style={{ color: 'var(--color-secondary)', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
            <ArrowLeft size={14} /> Back to Sign In
          </Link>
        </div>
      </section>
    </main>
  );
};
