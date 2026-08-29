import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Shield, Lock, Mail, Eye, EyeOff, AlertCircle, CheckCircle2, Loader2, ShieldCheck, ArrowLeft, KeyRound, Sparkles } from 'lucide-react';
import { SeoHead } from '../../components/common/SeoHead';
import { BrandLogo } from '../../components/common/BrandLogo';
import { useAuth } from '../../context/AuthContext';
import { useSettings } from '../../context/SettingsContext';

export const AdminLogin: React.FC = () => {
  const [emailOrUsername, setEmailOrUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const { login } = useAuth();
  const { settings } = useSettings();
  const navigate = useNavigate();

  const handleSuperAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!emailOrUsername.trim() || !password.trim()) {
      setErrorMsg('Please enter your Super Administrator credentials.');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          emailOrUsername: emailOrUsername.trim(),
          password: password.trim(),
        }),
      });

      const res = await response.json();

      if (res && res.success && res.data) {
        const user = res.data.user;
        const token = res.data.token;

        // Enforce Super Administrator / Admin / Editor access clearance
        const role = user?.role;
        if (role !== 'Admin' && role !== 'Editor') {
          setErrorMsg('Access Denied: This secure gateway is restricted exclusively to Admin and Editorial staff.');
          return;
        }

        login(token, user);

        setSuccessMsg('Security credentials authorized. Launching Admin Console...');
        setTimeout(() => {
          navigate('/admin');
        }, 600);
      } else {
        setErrorMsg(res.message || 'Invalid administrator credentials. Security alert logged.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Unable to communicate with the security server. Please verify your connection.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: 'var(--color-background)',
        color: 'var(--color-text)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '2.5rem 1rem',
        position: 'relative',
        overflow: 'hidden',
        transition: 'background-color var(--transition-normal), color var(--transition-normal)',
      }}
    >
      {/* Search Engine Cloaking: Invisible to crawlers and public sitemaps */}
      <SeoHead
        title={`Secure Super Admin Gateway | ${settings.site_name || 'BitBlog'}`}
        description="Private Super Administrator Gateway"
        robots="noindex, nofollow, noarchive"
      />

      {/* Ambient background light orb animation */}
      <div
        style={{
          position: 'absolute',
          top: '-15%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '600px',
          height: '600px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, var(--color-secondary-glow, rgba(99, 102, 241, 0.25)) 0%, rgba(99, 102, 241, 0.05) 50%, transparent 70%)',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />

      <div
        style={{
          width: '100%',
          maxWidth: '430px',
          backgroundColor: 'var(--color-card)',
          borderRadius: 'var(--radius-xl, 16px)',
          border: '1px solid var(--color-border)',
          boxShadow: '0 20px 45px -10px var(--color-shadow, rgba(0,0,0,0.15)), 0 0 0 1px var(--color-border)',
          overflow: 'hidden',
          position: 'relative',
          zIndex: 1,
          animation: 'fadeInUp 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        {/* Gateway Header Banner */}
        <div
          style={{
            padding: '2.25rem 2rem 1.75rem 2rem',
            textAlign: 'center',
            borderBottom: '1px solid var(--color-border)',
            backgroundColor: 'var(--color-surface-alt)',
            position: 'relative',
          }}
        >
          {/* Glowing Shield Monogram */}
          <div
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '16px',
              background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.2) 0%, rgba(168, 85, 247, 0.2) 100%)',
              border: '1.5px solid var(--color-secondary)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '1rem',
              color: 'var(--color-secondary)',
              boxShadow: '0 0 20px var(--color-secondary-glow)',
              transition: 'transform 0.3s ease',
            }}
          >
            <Shield size={28} />
          </div>

          <h1
            style={{
              fontSize: '1.4rem',
              fontWeight: 800,
              margin: '0 0 0.35rem 0',
              color: 'var(--color-text)',
              letterSpacing: '-0.025em',
              fontFamily: 'var(--font-heading)',
            }}
          >
            Super Admin Gateway
          </h1>
          <p style={{ fontSize: '0.82rem', color: 'var(--color-muted)', margin: 0, fontWeight: 500 }}>
            Private Direct Access URL • <strong style={{ color: 'var(--color-text)' }}>{settings.site_name || 'BitBlog'}</strong>
          </p>
        </div>

        {/* Form Container */}
        <div style={{ padding: '2rem' }}>
          {errorMsg && (
            <div
              style={{
                padding: '0.85rem 1rem',
                backgroundColor: 'rgba(239, 68, 68, 0.12)',
                border: '1px solid var(--color-danger, #EF4444)',
                borderRadius: 'var(--radius-md, 8px)',
                color: 'var(--color-danger, #EF4444)',
                fontSize: '0.84rem',
                marginBottom: '1.25rem',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.5rem',
                lineHeight: 1.45,
              }}
            >
              <AlertCircle size={17} style={{ flexShrink: 0, marginTop: '2px' }} />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div
              style={{
                padding: '0.85rem 1rem',
                backgroundColor: 'rgba(16, 185, 129, 0.12)',
                border: '1px solid var(--color-success, #10B981)',
                borderRadius: 'var(--radius-md, 8px)',
                color: 'var(--color-success, #10B981)',
                fontSize: '0.84rem',
                marginBottom: '1.25rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontWeight: 600,
              }}
            >
              <CheckCircle2 size={17} style={{ flexShrink: 0 }} />
              <span>{successMsg}</span>
            </div>
          )}

          <form onSubmit={handleSuperAdminLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div>
              <label
                htmlFor="admin-identity"
                style={{
                  display: 'block',
                  fontWeight: 700,
                  fontSize: '0.82rem',
                  color: 'var(--color-text)',
                  marginBottom: '0.45rem',
                }}
              >
                Super Admin Email / Username
              </label>
              <div style={{ position: 'relative' }}>
                <Mail
                  size={16}
                  style={{
                    position: 'absolute',
                    left: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--color-muted)',
                    pointerEvents: 'none',
                  }}
                />
                <input
                  id="admin-identity"
                  type="text"
                  value={emailOrUsername}
                  onChange={e => setEmailOrUsername(e.target.value)}
                  placeholder="admin@bitblog.com or admin username"
                  autoComplete="off"
                  required
                  style={{
                    width: '100%',
                    padding: '0.7rem 0.85rem 0.7rem 2.5rem',
                    fontSize: '0.9rem',
                    backgroundColor: 'var(--color-surface-alt)',
                    border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-md, 8px)',
                    color: 'var(--color-text)',
                    outline: 'none',
                    transition: 'border-color var(--transition-fast), box-shadow var(--transition-fast)',
                  }}
                  onFocus={e => {
                    e.currentTarget.style.borderColor = 'var(--color-secondary)';
                    e.currentTarget.style.boxShadow = '0 0 0 3px var(--color-secondary-glow)';
                  }}
                  onBlur={e => {
                    e.currentTarget.style.borderColor = 'var(--color-border)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="admin-pass"
                style={{
                  display: 'block',
                  fontWeight: 700,
                  fontSize: '0.82rem',
                  color: 'var(--color-text)',
                  marginBottom: '0.45rem',
                }}
              >
                Super Admin Password
              </label>
              <div style={{ position: 'relative' }}>
                <Lock
                  size={16}
                  style={{
                    position: 'absolute',
                    left: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--color-muted)',
                    pointerEvents: 'none',
                  }}
                />
                <input
                  id="admin-pass"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  autoComplete="new-password"
                  required
                  style={{
                    width: '100%',
                    padding: '0.7rem 2.5rem 0.7rem 2.5rem',
                    fontSize: '0.9rem',
                    backgroundColor: 'var(--color-surface-alt)',
                    border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-md, 8px)',
                    color: 'var(--color-text)',
                    outline: 'none',
                    transition: 'border-color var(--transition-fast), box-shadow var(--transition-fast)',
                  }}
                  onFocus={e => {
                    e.currentTarget.style.borderColor = 'var(--color-secondary)';
                    e.currentTarget.style.boxShadow = '0 0 0 3px var(--color-secondary-glow)';
                  }}
                  onBlur={e => {
                    e.currentTarget.style.borderColor = 'var(--color-border)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  style={{
                    position: 'absolute',
                    right: '10px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--color-muted)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    padding: '0.2rem',
                  }}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="header-action-btn"
              style={{
                width: '100%',
                padding: '0.8rem',
                backgroundColor: 'var(--color-secondary)',
                color: '#FFFFFF',
                fontSize: '0.92rem',
                fontWeight: 700,
                border: 'none',
                borderRadius: 'var(--radius-md, 8px)',
                cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                marginTop: '0.5rem',
                boxShadow: '0 4px 14px var(--color-secondary-glow)',
                transition: 'all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)',
              }}
            >
              {loading ? (
                <>
                  <Loader2 size={17} style={{ animation: 'spin 1s linear infinite' }} />
                  Verifying Security Clearance...
                </>
              ) : (
                <>
                  <ShieldCheck size={18} /> Authenticate into Admin Console
                </>
              )}
            </button>
          </form>

          {/* Security Notice */}
          <div
            style={{
              marginTop: '1.5rem',
              padding: '0.85rem',
              borderRadius: 'var(--radius-md, 8px)',
              backgroundColor: 'var(--color-surface-alt)',
              border: '1px solid var(--color-border)',
              fontSize: '0.76rem',
              color: 'var(--color-muted)',
              textAlign: 'center',
              lineHeight: 1.45,
            }}
          >
            🔒 This private gateway URL is unlisted and restricted exclusively to the Super Administrator.
          </div>

          {/* Public Return Link */}
          <div style={{ marginTop: '1.25rem', textAlign: 'center' }}>
            <Link
              to="/"
              style={{
                fontSize: '0.82rem',
                color: 'var(--color-muted)',
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                fontWeight: 600,
                transition: 'color var(--transition-fast)',
              }}
              onMouseEnter={e => (e.currentTarget.style.color = 'var(--color-secondary)')}
              onMouseLeave={e => (e.currentTarget.style.color = 'var(--color-muted)')}
            >
              <ArrowLeft size={14} /> Return to Public Website
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
