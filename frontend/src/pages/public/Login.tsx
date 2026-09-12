import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  LogIn,
  Eye,
  EyeOff,
  Lock,
  Mail,
  User,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  Loader2,
} from 'lucide-react';
import { SeoHead } from '../../components/common/SeoHead';
import { useAuth } from '../../context/AuthContext';
import { useSettings } from '../../context/SettingsContext';
import { BrandLogo } from '../../components/common/BrandLogo';
import { FirebaseAuthService } from '../../services/firebaseAuth';

export const Login: React.FC = () => {
  const { settings } = useSettings();
  const siteName = settings.site_name || 'BitBlog';
  const [emailOrUsername, setEmailOrUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const { login, isAuthenticated, user, isStaff } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (isAuthenticated) {
      const redirectUrl = new URLSearchParams(location.search).get('redirect');
      if (redirectUrl) {
        navigate(redirectUrl, { replace: true });
      } else if (isStaff || user?.role === 'Admin' || user?.role === 'Editor' || user?.role === 'Author') {
        navigate('/admin', { replace: true });
      } else {
        navigate('/user/dashboard', { replace: true });
      }
    }
  }, [isAuthenticated, isStaff, user, navigate, location.search]);

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    setErrorMsg(null);
    try {
      const data = await FirebaseAuthService.signInWithGoogle();
      if (data && data.token && data.user) {
        setSuccessMsg(`Welcome back, ${data.user.name}!`);
        login(data.token, data.user);
        const isStaffUser = data.user.role === 'Admin' || data.user.role === 'Editor' || data.user.role === 'Author';
        const redirectUrl = new URLSearchParams(location.search).get('redirect');
        setTimeout(() => {
          navigate(redirectUrl || (isStaffUser ? '/admin' : '/user/dashboard'), { replace: true });
        }, 400);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Google sign-in failed. Please try again.');
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const inputLogin = emailOrUsername.trim().toLowerCase();
    if (!inputLogin || !password) {
      setErrorMsg('Please enter your email or username and password.');
      return;
    }

    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {

      if (inputLogin.includes('@')) {
        try {
          const fbSession = await FirebaseAuthService.loginWithEmail(inputLogin, password);
          if (fbSession && fbSession.token && fbSession.user) {
            login(fbSession.token, fbSession.user);
            const isStaffAccount = fbSession.user.role === 'Admin' || fbSession.user.role === 'Editor' || fbSession.user.role === 'Author';
            const redirectUrl = new URLSearchParams(location.search).get('redirect');
            setTimeout(() => {
              navigate(redirectUrl || (isStaffAccount ? '/admin' : '/user/dashboard'), { replace: true });
            }, 400);
            return;
          }
        } catch (fbErr: any) {
          if (fbErr.code === 'EMAIL_NOT_VERIFIED') {
            setErrorMsg(fbErr.message);
            return;
          }

        }
      }

      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: inputLogin,
          password,
          accountType: 'User',
        }),
      });

      const res = await response.json();
      if (response.ok && res && res.success && res.data && res.data.token) {
        const { token, user } = res.data;
        login(token, user);

        const isStaffAccount = user.role === 'Admin' || user.role === 'Editor' || user.role === 'Author';
        const params = new URLSearchParams(location.search);
        const redirectUrl = params.get('redirect');

        setTimeout(() => {
          if (redirectUrl) {
            navigate(redirectUrl);
          } else if (isStaffAccount) {
            navigate('/admin');
          } else {
            navigate('/user/dashboard');
          }
        }, 400);
      } else {
        setErrorMsg(res?.message || 'Invalid email/username or password.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Unable to connect to the authentication server. Please verify your connection.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        width: '100%',
        maxWidth: '460px',
        margin: '0 auto',
        padding: '2rem 1rem 3.5rem 1rem',
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
      }}
    >
      <SeoHead
        title={`Sign In | ${siteName}`}
        description={`Sign in to your ${siteName} reader account to view bookmarks, comment on stories, and customize your reading profile.`}
        robots="noindex, nofollow"
      />

      <section
        style={{
          padding: '2.5rem 2rem',
          backgroundColor: 'var(--color-card)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--color-border)',
          boxShadow: 'var(--shadow-md)',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
          <div style={{ display: 'inline-flex', justifyContent: 'center', marginBottom: '0.85rem' }}>
            <BrandLogo size={48} showText={false} />
          </div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800, margin: '0 0 0.4rem 0', fontFamily: 'var(--font-heading)' }}>
            Welcome Back
          </h1>
          <p style={{ fontSize: '0.88rem', color: 'var(--color-muted)', margin: 0 }}>
            Sign in to access your bookmarks, comments, and profile
          </p>
        </div>

        {errorMsg && (
          <div
            role="alert"
            style={{
              padding: '0.75rem 1rem',
              backgroundColor: 'rgba(239, 68, 68, 0.12)',
              border: '1px solid var(--color-danger)',
              borderRadius: 'var(--radius-md)',
              color: 'var(--color-danger)',
              marginBottom: '1.25rem',
              fontSize: '0.85rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}
          >
            <AlertCircle size={18} style={{ flexShrink: 0 }} />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div
            role="status"
            style={{
              padding: '0.75rem 1rem',
              backgroundColor: 'rgba(16, 185, 129, 0.12)',
              border: '1px solid var(--color-success)',
              borderRadius: 'var(--radius-md)',
              color: 'var(--color-success)',
              marginBottom: '1.25rem',
              fontSize: '0.85rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}
          >
            <CheckCircle2 size={18} style={{ flexShrink: 0 }} />
            <span>{successMsg}</span>
          </div>
        )}

        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={googleLoading || loading}
          style={{
            width: '100%',
            backgroundColor: '#FFFFFF',
            color: '#1F2937',
            border: '1px solid #E5E7EB',
            padding: '0.7rem 1rem',
            borderRadius: 'var(--radius-md)',
            fontWeight: 700,
            fontSize: '0.9rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.6rem',
            cursor: googleLoading ? 'not-allowed' : 'pointer',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            marginBottom: '1.25rem',
            transition: 'all 0.15s ease',
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
          </svg>
          {googleLoading ? 'Connecting to Google...' : 'Continue with Google'}
        </button>

        <div style={{ display: 'flex', alignItems: 'center', margin: '1.25rem 0', gap: '0.75rem' }}>
          <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--color-border)' }} />
          <span style={{ fontSize: '0.78rem', color: 'var(--color-muted)', fontWeight: 600, textTransform: 'uppercase' }}>or sign in with password</span>
          <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--color-border)' }} />
        </div>

        <form onSubmit={handleLogin} noValidate autoComplete="off">
          <div style={{ marginBottom: '1.25rem' }}>
            <label
              htmlFor="login-identifier"
              style={{
                display: 'block',
                fontWeight: 600,
                marginBottom: '0.45rem',
                fontSize: '0.88rem',
                color: 'var(--color-text)',
              }}
            >
              Email or Username
            </label>
            <div style={{ position: 'relative' }}>
              <input
                id="login-identifier"
                name="bitblog_user_login"
                type="text"
                value={emailOrUsername}
                onChange={e => setEmailOrUsername(e.target.value)}
                placeholder="name@example.com or @username"
                required
                autoFocus
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="none"
                spellCheck={false}
                aria-autocomplete="none"
                data-lpignore="true"
                data-form-type="other"
                style={{
                  width: '100%',
                  padding: '0.65rem 0.75rem 0.65rem 2.3rem',
                  fontSize: '0.9rem',
                  borderRadius: 'var(--radius-md)',
                }}
              />
              <User
                size={16}
                color="var(--color-muted)"
                style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)' }}
              />
            </div>
          </div>

          <div style={{ marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.45rem' }}>
              <label
                htmlFor="login-password"
                style={{
                  fontWeight: 600,
                  fontSize: '0.88rem',
                  color: 'var(--color-text)',
                }}
              >
                Password
              </label>
              <Link
                to="/forgot-password"
                style={{
                  fontSize: '0.82rem',
                  color: 'var(--color-secondary)',
                  textDecoration: 'none',
                  fontWeight: 600,
                }}
              >
                Forgot password?
              </Link>
            </div>
            <div style={{ position: 'relative' }}>
              <input
                id="login-password"
                name="bitblog_user_secret"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                autoComplete="new-password"
                data-lpignore="true"
                data-form-type="other"
                style={{
                  width: '100%',
                  padding: '0.65rem 2.4rem 0.65rem 2.3rem',
                  fontSize: '0.9rem',
                  borderRadius: 'var(--radius-md)',
                }}
              />
              <Lock
                size={16}
                color="var(--color-muted)"
                style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)' }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                style={{
                  position: 'absolute',
                  right: '0.75rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: 'var(--color-muted)',
                  cursor: 'pointer',
                  padding: 0,
                  display: 'flex',
                }}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || googleLoading}
            style={{
              width: '100%',
              backgroundColor: 'var(--color-secondary)',
              color: '#FFFFFF',
              padding: '0.75rem',
              fontWeight: 700,
              fontSize: '0.95rem',
              borderRadius: 'var(--radius-md)',
              boxShadow: '0 2px 8px var(--color-secondary-glow)',
              minHeight: '44px',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              cursor: loading ? 'not-allowed' : 'pointer',
            }}
          >
            {loading ? <Loader2 size={18} className="animate-spin" /> : <LogIn size={18} />}
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div
          style={{
            marginTop: '1.75rem',
            textAlign: 'center',
            fontSize: '0.85rem',
            color: 'var(--color-text-secondary)',
            borderTop: '1px solid var(--color-border)',
            paddingTop: '1.25rem',
          }}
        >
          Don't have an account?{' '}
          <Link
            to="/register"
            style={{
              color: 'var(--color-secondary)',
              fontWeight: 700,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.2rem',
              textDecoration: 'none',
            }}
          >
            Create account <ArrowRight size={13} />
          </Link>
        </div>
      </section>
    </div>
  );
};

