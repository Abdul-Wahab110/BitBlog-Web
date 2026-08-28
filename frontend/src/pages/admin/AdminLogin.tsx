import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Shield,
  Lock,
  Mail,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  Loader2,
  KeyRound,
  ShieldCheck,
} from 'lucide-react';
import { SeoHead } from '../../components/common/SeoHead';
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
  const location = useLocation();

  const handleSuperAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const inputLogin = emailOrUsername.trim().toLowerCase();
    if (!inputLogin || !password) {
      setErrorMsg('Please enter your Super Administrator credentials.');
      return;
    }

    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: inputLogin,
          password,
          accountType: 'Admin', // Enforces staff/admin privileges
        }),
      });

      const res = await response.json();
      if (response.ok && res && res.success && res.data && res.data.token) {
        const { token, user } = res.data;

        // Strict Super Administrator & Staff Clearance Verification
        if (user.role !== 'Admin') {
          setErrorMsg('Access Denied: This secret gateway is strictly reserved for the Super Administrator (Website Owner). Regular users and non-admin accounts cannot access this portal.');
          return;
        }

        login(token, user);
        setSuccessMsg(`✓ Super Administrator verified. Welcome back, ${user.name}! Opening Admin Console...`);

        const params = new URLSearchParams(location.search);
        const redirectUrl = params.get('redirect');

        setTimeout(() => {
          if (redirectUrl && redirectUrl.startsWith('/admin')) {
            navigate(redirectUrl);
          } else {
            navigate('/admin');
          }
        }, 400);
      } else {
        setErrorMsg(res?.message || 'Invalid Super Administrator credentials. Access denied.');
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
        backgroundColor: '#090D16',
        color: '#F8FAFC',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '2rem 1rem',
        backgroundImage: 'radial-gradient(ellipse at top, rgba(99, 102, 241, 0.18), transparent 70%)',
      }}
    >
      {/* Search Engine Cloaking: Invisible to crawlers and public sitemaps */}
      <SeoHead
        title={`Secure Super Admin Gateway | ${settings.site_name || 'BitBlog'}`}
        description="Private Super Administrator Gateway"
        robots="noindex, nofollow, noarchive"
      />

      <div
        style={{
          width: '100%',
          maxWidth: '420px',
          backgroundColor: '#131B2E',
          borderRadius: '16px',
          border: '1px solid #1E293B',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)',
          overflow: 'hidden',
        }}
      >
        {/* Gateway Header Banner */}
        <div
          style={{
            padding: '2rem 2rem 1.5rem 2rem',
            textAlign: 'center',
            borderBottom: '1px solid #1E293B',
            backgroundColor: 'rgba(9, 13, 22, 0.75)',
          }}
        >
          {settings.site_logo ? (
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '0.85rem' }}>
              <img
                src={settings.site_logo}
                alt={settings.site_name || 'Brand Logo'}
                style={{
                  height: '48px',
                  maxHeight: '48px',
                  width: 'auto',
                  maxWidth: '180px',
                  objectFit: 'contain',
                  display: 'block',
                }}
              />
            </div>
          ) : (
            <div
              style={{
                width: '54px',
                height: '54px',
                borderRadius: '14px',
                backgroundColor: 'rgba(99, 102, 241, 0.15)',
                border: '1px solid rgba(99, 102, 241, 0.35)',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1rem',
                color: '#818CF8',
              }}
            >
              <Shield size={28} />
            </div>
          )}

          <h1 style={{ fontSize: '1.35rem', fontWeight: 800, margin: '0 0 0.35rem 0', color: '#F8FAFC', letterSpacing: '-0.02em' }}>
            Super Admin Gateway
          </h1>
          <p style={{ fontSize: '0.8rem', color: '#64748B', margin: 0 }}>
            Private Direct Access URL • {settings.site_name || 'BitBlog'}
          </p>
        </div>

        {/* Form Container */}
        <div style={{ padding: '2rem' }}>
          {errorMsg && (
            <div
              style={{
                padding: '0.85rem 1rem',
                backgroundColor: 'rgba(239, 68, 68, 0.15)',
                border: '1px solid #EF4444',
                borderRadius: '8px',
                color: '#FCA5A5',
                fontSize: '0.84rem',
                marginBottom: '1.25rem',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.5rem',
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
                backgroundColor: 'rgba(16, 185, 129, 0.15)',
                border: '1px solid #10B981',
                borderRadius: '8px',
                color: '#6EE7B7',
                fontSize: '0.84rem',
                marginBottom: '1.25rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
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
                style={{ display: 'block', fontWeight: 600, fontSize: '0.82rem', color: '#CBD5E1', marginBottom: '0.4rem' }}
              >
                Super Admin Email / Username
              </label>
              <div style={{ position: 'relative' }}>
                <Mail size={16} color="#64748B" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  id="admin-identity"
                  type="text"
                  value={emailOrUsername}
                  onChange={e => setEmailOrUsername(e.target.value)}
                  placeholder=""
                  autoComplete="off"
                  required
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.75rem 0.65rem 2.4rem',
                    fontSize: '0.88rem',
                    backgroundColor: '#090D16',
                    border: '1px solid #334155',
                    borderRadius: '8px',
                    color: '#F8FAFC',
                    outline: 'none',
                  }}
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="admin-pass"
                style={{ display: 'block', fontWeight: 600, fontSize: '0.82rem', color: '#CBD5E1', marginBottom: '0.4rem' }}
              >
                Super Admin Password
              </label>
              <div style={{ position: 'relative' }}>
                <Lock size={16} color="#64748B" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  id="admin-pass"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder=""
                  autoComplete="new-password"
                  required
                  style={{
                    width: '100%',
                    padding: '0.65rem 2.4rem 0.65rem 2.4rem',
                    fontSize: '0.88rem',
                    backgroundColor: '#090D16',
                    border: '1px solid #334155',
                    borderRadius: '8px',
                    color: '#F8FAFC',
                    outline: 'none',
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '10px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'transparent',
                    border: 'none',
                    color: '#64748B',
                    cursor: 'pointer',
                  }}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '0.75rem',
                backgroundColor: '#6366F1',
                color: '#FFFFFF',
                fontSize: '0.92rem',
                fontWeight: 700,
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                marginTop: '0.5rem',
                boxShadow: '0 4px 12px rgba(99, 102, 241, 0.35)',
              }}
            >
              {loading ? (
                <>
                  <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
                  Verifying Security Clearance...
                </>
              ) : (
                <>
                  <ShieldCheck size={17} /> Authenticate into Admin Console
                </>
              )}
            </button>
          </form>

          {/* Security Notice */}
          <div
            style={{
              marginTop: '1.5rem',
              padding: '0.75rem',
              borderRadius: '8px',
              backgroundColor: 'rgba(9, 13, 22, 0.6)',
              border: '1px solid #1E293B',
              fontSize: '0.74rem',
              color: '#64748B',
              textAlign: 'center',
              lineHeight: 1.4,
            }}
          >
            🔒 This private gateway URL is unlisted and restricted exclusively to the Super Administrator.
          </div>

          {/* Public Return Link */}
          <div style={{ marginTop: '1.25rem', textAlign: 'center' }}>
            <Link
              to="/"
              style={{
                fontSize: '0.8rem',
                color: '#64748B',
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.3rem',
              }}
            >
              ← Return to Public Website
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
