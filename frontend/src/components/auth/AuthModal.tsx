import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  X,
  LogIn,
  UserPlus,
  KeyRound,
  Eye,
  EyeOff,
  Lock,
  Mail,
  User,
  AlertCircle,
  CheckCircle2,
  Loader2,
  ShieldCheck,
  RefreshCw,
  Edit2,
  ExternalLink,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useSettings } from '../../context/SettingsContext';
import { BrandLogo } from '../common/BrandLogo';
import { ApiService } from '../../services/api';
import { FirebaseAuthService } from '../../services/firebaseAuth';
import { validateGmailAddress } from '../../utils/emailValidator';

export const AuthModal: React.FC = () => {
  const { isAuthModalOpen, authModalMode, closeAuthModal, login } = useAuth();
  const { settings } = useSettings();
  const navigate = useNavigate();

  const [mode, setMode] = useState<'login' | 'register' | 'otp' | 'forgot'>(authModalMode);

  const [emailOrUsername, setEmailOrUsername] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [forgotEmail, setForgotEmail] = useState('');

  const [otpDigits, setOtpDigits] = useState<string[]>(['', '', '', '', '', '']);
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [resendingOtp, setResendingOtp] = useState(false);
  const [resendTimer, setResendTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    setMode(authModalMode);
    setEmailOrUsername('');
    setPassword('');
    setName('');
    setUsername('');
    setEmail('');
    setConfirmPassword('');
    setForgotEmail('');
    setOtpDigits(['', '', '', '', '', '']);
    setErrorMsg(null);
    setSuccessMsg(null);
  }, [authModalMode, isAuthModalOpen]);

  useEffect(() => {
    let interval: any;
    if (mode === 'otp' && resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => {
          if (prev <= 1) {
            setCanResend(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [mode, resendTimer]);

  useEffect(() => {
    if (mode === 'otp') {
      setTimeout(() => {
        otpInputRefs.current[0]?.focus();
      }, 200);
    }
  }, [mode]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isAuthModalOpen) {
        closeAuthModal();
      }
    },
    [isAuthModalOpen, closeAuthModal]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  useEffect(() => {
    if (isAuthModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isAuthModalOpen]);

  if (!isAuthModalOpen) return null;

  const handleGoogleAuth = async () => {
    setGoogleLoading(true);
    setErrorMsg(null);
    try {
      const data = await FirebaseAuthService.signInWithGoogle();
      if (data && data.token && data.user) {
        login(data.token, data.user);
        setSuccessMsg(`Welcome, ${data.user.name}!`);
        const isStaffUser = data.user.role === 'Admin' || data.user.role === 'Editor' || data.user.role === 'Author';
        setTimeout(() => {
          closeAuthModal();
          navigate(isStaffUser ? '/admin' : '/user/dashboard');
        }, 400);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Google authentication failed.');
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const inputLogin = emailOrUsername.trim().toLowerCase();
    if (!inputLogin || !password) {
      setErrorMsg('Please enter your email/username and password.');
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
            setSuccessMsg(`Welcome back, ${fbSession.user.name}!`);
            const isStaffUser = fbSession.user.role === 'Admin' || fbSession.user.role === 'Editor' || fbSession.user.role === 'Author';
            setTimeout(() => {
              closeAuthModal();
              navigate(isStaffUser ? '/admin' : '/user/dashboard');
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

      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: inputLogin,
          password,
          accountType: 'User',
        }),
      }).then((r) => r.json());

      if (res && res.success && res.data && res.data.token) {
        login(res.data.token, res.data.user);
        setSuccessMsg(`Welcome back, ${res.data.user.name}!`);
        const isStaffUser = res.data.user.role === 'Admin' || res.data.user.role === 'Editor' || res.data.user.role === 'Author';
        setTimeout(() => {
          closeAuthModal();
          navigate(isStaffUser ? '/admin' : '/user/dashboard');
        }, 400);
      } else {
        throw new Error(res?.message || 'Invalid email/username or password.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Unable to connect to authentication server.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !username.trim() || !email.trim() || !password) {
      setErrorMsg('Please fill out all required fields.');
      return;
    }

    const emailCheck = validateGmailAddress(email.trim());
    if (!emailCheck.valid) {
      setErrorMsg(emailCheck.error || 'Please enter a valid Gmail address.');
      return;
    }

    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }

    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const res = await ApiService.sendRegistrationOtp({
        name: name.trim(),
        username: username.trim(),
        email: email.trim().toLowerCase(),
        password,
      });

      if (res && res.success) {
        setMode('otp');
        setResendTimer(60);
        setCanResend(false);
        setOtpDigits(['', '', '', '', '', '']);
        setSuccessMsg(`6-digit verification code sent to ${email.trim()}!`);
      } else {
        throw new Error(res.message || 'Failed to dispatch verification code.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Registration failed. Please check your details.');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (index: number, val: string) => {
    const clean = val.replace(/[^0-9]/g, '');
    const newDigits = [...otpDigits];

    if (clean.length > 1) {
      const pasted = clean.slice(0, 6).split('');
      pasted.forEach((char, i) => {
        newDigits[i] = char;
      });
      setOtpDigits(newDigits);
      const nextIndex = Math.min(pasted.length, 5);
      otpInputRefs.current[nextIndex]?.focus();
      return;
    }

    newDigits[index] = clean;
    setOtpDigits(newDigits);

    if (clean && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const fullOtp = otpDigits.join('').trim();
    if (fullOtp.length !== 6) {
      setErrorMsg('Please enter all 6 digits of the code.');
      return;
    }

    setVerifyingOtp(true);
    setErrorMsg(null);

    try {
      const res = await ApiService.verifyRegistrationOtp({
        email: email.trim().toLowerCase(),
        otp: fullOtp,
      });

      if (res && res.success && res.data) {
        setSuccessMsg('Gmail verified! Reader account created.');
        if (res.data.token && res.data.user) {
          login(res.data.token, res.data.user);
          setTimeout(() => {
            closeAuthModal();
            navigate('/user/dashboard');
          }, 800);
        }
      } else {
        throw new Error(res.message || 'Invalid verification code.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Invalid code. Please check your Gmail.');
    } finally {
      setVerifyingOtp(false);
    }
  };

  const handleResendOtp = async () => {
    if (!canResend || resendingOtp) return;
    setResendingOtp(true);
    setErrorMsg(null);
    try {
      const res = await ApiService.resendRegistrationOtp(email.trim().toLowerCase());
      if (res && res.success) {
        setSuccessMsg('Fresh 6-digit code sent to your Gmail!');
        setResendTimer(60);
        setCanResend(false);
        setOtpDigits(['', '', '', '', '', '']);
        otpInputRefs.current[0]?.focus();
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to resend code.');
    } finally {
      setResendingOtp(false);
    }
  };

  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail.trim()) {
      setErrorMsg('Please enter your account email.');
      return;
    }

    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotEmail.trim() }),
      }).then((r) => r.json());

      if (res && res.success) {
        setSuccessMsg(res.message || 'Password reset link sent to your email.');
      } else {
        throw new Error(res?.message || 'Failed to send reset link.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Error requesting password reset.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(6px)',
        padding: '1rem',
      }}
      onClick={closeAuthModal}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '440px',
          backgroundColor: 'var(--color-card)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--color-border)',
          boxShadow: 'var(--shadow-xl)',
          overflow: 'hidden',
          position: 'relative',
        }}
        onClick={(e) => e.stopPropagation()}
      >

        <div
          style={{
            padding: '1.25rem 1.5rem 1rem 1.5rem',
            borderBottom: '1px solid var(--color-border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'var(--color-surface)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <BrandLogo size={32} showText={false} />
            <div>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0, color: 'var(--color-text)' }}>
                {mode === 'login' && `Sign In to ${settings.site_name || 'BitBlog'}`}
                {mode === 'register' && 'Create Reader Account'}
                {mode === 'otp' && 'Verify Gmail OTP 🔐'}
                {mode === 'forgot' && 'Reset Password'}
              </h2>
              <span style={{ fontSize: '0.78rem', color: 'var(--color-muted)' }}>
                {mode === 'login' && 'Access bookmarks and comments'}
                {mode === 'register' && 'Join the digital community'}
                {mode === 'otp' && 'Strict 6-digit Gmail verification'}
                {mode === 'forgot' && 'Recover your reader account'}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={closeAuthModal}
            aria-label="Close dialog"
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--color-muted)',
              cursor: 'pointer',
              padding: '0.4rem',
              display: 'flex',
              borderRadius: 'var(--radius-sm)',
            }}
          >
            <X size={18} />
          </button>
        </div>

        <div style={{ padding: '1.5rem' }}>

          {errorMsg && (
            <div
              role="alert"
              style={{
                padding: '0.65rem 0.85rem',
                backgroundColor: 'rgba(239, 68, 68, 0.12)',
                border: '1px solid var(--color-danger)',
                borderRadius: 'var(--radius-md)',
                color: 'var(--color-danger)',
                marginBottom: '1rem',
                fontSize: '0.82rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.45rem',
              }}
            >
              <AlertCircle size={15} style={{ flexShrink: 0 }} />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div
              role="status"
              style={{
                padding: '0.65rem 0.85rem',
                backgroundColor: 'rgba(16, 185, 129, 0.12)',
                border: '1px solid var(--color-success)',
                borderRadius: 'var(--radius-md)',
                color: 'var(--color-success)',
                marginBottom: '1rem',
                fontSize: '0.82rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.45rem',
              }}
            >
              <CheckCircle2 size={15} style={{ flexShrink: 0 }} />
              <span>{successMsg}</span>
            </div>
          )}

          {(mode === 'login' || mode === 'register') && (
            <>
              <button
                type="button"
                onClick={handleGoogleAuth}
                disabled={googleLoading || loading}
                style={{
                  width: '100%',
                  backgroundColor: '#FFFFFF',
                  color: '#1F2937',
                  border: '1px solid #E5E7EB',
                  padding: '0.6rem 1rem',
                  borderRadius: 'var(--radius-md)',
                  fontWeight: 700,
                  fontSize: '0.88rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  cursor: googleLoading ? 'not-allowed' : 'pointer',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.08)',
                  marginBottom: '1rem',
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                {googleLoading ? 'Connecting to Google...' : 'Continue with Google'}
              </button>

              <div style={{ display: 'flex', alignItems: 'center', margin: '0.85rem 0', gap: '0.5rem' }}>
                <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--color-border)' }} />
                <span style={{ fontSize: '0.74rem', color: 'var(--color-muted)', fontWeight: 600 }}>OR</span>
                <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--color-border)' }} />
              </div>
            </>
          )}

          {mode === 'login' && (
            <form onSubmit={handleLoginSubmit} autoComplete="off">
              <div style={{ marginBottom: '0.85rem' }}>
                <label htmlFor="modal-identifier" style={{ display: 'block', fontWeight: 600, marginBottom: '0.35rem', fontSize: '0.82rem' }}>
                  Email or Username *
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    id="modal-identifier"
                    name="bitblog_login_id"
                    type="text"
                    autoComplete="off"
                    autoCorrect="off"
                    autoCapitalize="none"
                    spellCheck={false}
                    aria-autocomplete="none"
                    data-lpignore="true"
                    data-form-type="other"
                    value={emailOrUsername}
                    onChange={(e) => setEmailOrUsername(e.target.value)}
                    placeholder="name@example.com or @username"
                    required
                    style={{ width: '100%', padding: '0.55rem 0.75rem 0.55rem 2.2rem', fontSize: '0.88rem' }}
                  />
                  <Mail size={15} color="var(--color-muted)" style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)' }} />
                </div>
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label htmlFor="modal-password" style={{ display: 'block', fontWeight: 600, marginBottom: '0.35rem', fontSize: '0.82rem' }}>
                  Password *
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    id="modal-password"
                    name="bitblog_login_secret"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    data-lpignore="true"
                    data-form-type="other"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    style={{ width: '100%', padding: '0.55rem 2.2rem 0.55rem 2.2rem', fontSize: '0.88rem' }}
                  />
                  <Lock size={15} color="var(--color-muted)" style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)' }} />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{ position: 'absolute', right: '0.4rem', top: '50%', transform: 'translateY(-50%)', background: 'transparent', padding: '0.25rem', color: 'var(--color-muted)' }}
                  >
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.78rem', marginBottom: '1.25rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', cursor: 'pointer' }}>
                  <input type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} style={{ accentColor: 'var(--color-secondary)' }} />
                  Remember me
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setMode('forgot');
                    setErrorMsg(null);
                  }}
                  style={{ background: 'transparent', color: 'var(--color-secondary)', fontWeight: 600, padding: 0 }}
                >
                  Forgot password?
                </button>
              </div>

              <button
                type="submit"
                disabled={loading}
                style={{
                  width: '100%',
                  backgroundColor: 'var(--color-secondary)',
                  color: '#FFFFFF',
                  padding: '0.65rem',
                  fontWeight: 700,
                  fontSize: '0.9rem',
                  borderRadius: 'var(--radius-md)',
                  boxShadow: '0 2px 8px var(--color-secondary-glow)',
                  minHeight: '42px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                }}
              >
                {loading ? <Loader2 size={16} className="animate-spin" /> : <LogIn size={16} />}
                <span>{loading ? 'Signing In...' : 'Sign In'}</span>
              </button>
            </form>
          )}

          {mode === 'register' && (
            <form onSubmit={handleRegisterSubmit}>
              <div style={{ marginBottom: '0.75rem' }}>
                <label htmlFor="modal-reg-name" style={{ display: 'block', fontWeight: 600, marginBottom: '0.3rem', fontSize: '0.82rem' }}>Full Name *</label>
                <div style={{ position: 'relative' }}>
                  <input id="modal-reg-name" type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. John Doe" required style={{ width: '100%', padding: '0.55rem 0.75rem 0.55rem 2.2rem', fontSize: '0.88rem' }} />
                  <User size={15} color="var(--color-muted)" style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)' }} />
                </div>
              </div>

              <div style={{ marginBottom: '0.75rem' }}>
                <label htmlFor="modal-reg-user" style={{ display: 'block', fontWeight: 600, marginBottom: '0.3rem', fontSize: '0.82rem' }}>Username *</label>
                <input id="modal-reg-user" type="text" value={username} onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))} placeholder="e.g. johndoe" required style={{ width: '100%', padding: '0.55rem 0.75rem', fontSize: '0.88rem' }} />
              </div>

              <div style={{ marginBottom: '0.75rem' }}>
                <label htmlFor="modal-reg-email" style={{ display: 'block', fontWeight: 600, marginBottom: '0.3rem', fontSize: '0.82rem' }}>Valid Gmail Address * (OTP sent here)</label>
                <div style={{ position: 'relative' }}>
                  <input id="modal-reg-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@gmail.com" required style={{ width: '100%', padding: '0.55rem 0.75rem 0.55rem 2.2rem', fontSize: '0.88rem' }} />
                  <Mail size={15} color="var(--color-muted)" style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)' }} />
                </div>
              </div>

              <div style={{ marginBottom: '0.75rem' }}>
                <label htmlFor="modal-reg-pass" style={{ display: 'block', fontWeight: 600, marginBottom: '0.3rem', fontSize: '0.82rem' }}>Password (min 6 chars) *</label>
                <div style={{ position: 'relative' }}>
                  <input id="modal-reg-pass" type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required style={{ width: '100%', padding: '0.55rem 2.2rem 0.55rem 2.2rem', fontSize: '0.88rem' }} />
                  <Lock size={15} color="var(--color-muted)" style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)' }} />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: '0.4rem', top: '50%', transform: 'translateY(-50%)', background: 'transparent', padding: '0.25rem', color: 'var(--color-muted)' }}>
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              <div style={{ marginBottom: '1.15rem' }}>
                <label htmlFor="modal-reg-confirm" style={{ display: 'block', fontWeight: 600, marginBottom: '0.3rem', fontSize: '0.82rem' }}>Confirm Password *</label>
                <input id="modal-reg-confirm" type={showPassword ? 'text' : 'password'} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="••••••••" required style={{ width: '100%', padding: '0.55rem 0.75rem', fontSize: '0.88rem' }} />
              </div>

              <button
                type="submit"
                disabled={loading}
                style={{
                  width: '100%',
                  backgroundColor: 'var(--color-secondary)',
                  color: '#FFFFFF',
                  padding: '0.65rem',
                  fontWeight: 700,
                  fontSize: '0.9rem',
                  borderRadius: 'var(--radius-md)',
                  boxShadow: '0 2px 8px var(--color-secondary-glow)',
                  minHeight: '42px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.45rem',
                }}
              >
                {loading ? <Loader2 size={16} className="animate-spin" /> : <UserPlus size={16} />}
                <span>{loading ? 'Sending 6-Digit OTP...' : 'Send OTP to Gmail →'}</span>
              </button>
            </form>
          )}

          {mode === 'otp' && (
            <div style={{ textAlign: 'center' }}>
              <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', marginBottom: '1.25rem', lineHeight: 1.5 }}>
                Enter the 6-digit code sent to:
                <br />
                <strong style={{ color: 'var(--color-text)' }}>{email}</strong>{' '}
                <button
                  type="button"
                  onClick={() => {
                    setMode('register');
                    setErrorMsg(null);
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--color-secondary)',
                    fontSize: '0.78rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    textDecoration: 'underline',
                  }}
                >
                  <Edit2 size={11} /> Edit
                </button>
              </p>

              <form onSubmit={handleVerifyOtpSubmit}>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '0.4rem', marginBottom: '1.25rem' }}>
                  {otpDigits.map((digit, idx) => (
                    <input
                      key={idx}
                      ref={(el) => (otpInputRefs.current[idx] = el)}
                      type="text"
                      inputMode="numeric"
                      maxLength={6}
                      value={digit}
                      onChange={(e) => handleOtpChange(idx, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                      style={{
                        width: '42px',
                        height: '50px',
                        fontSize: '1.3rem',
                        fontWeight: 800,
                        textAlign: 'center',
                        fontFamily: 'monospace',
                        borderRadius: 'var(--radius-md)',
                        backgroundColor: 'var(--color-surface)',
                        border: digit ? '2px solid var(--color-secondary)' : '1px solid var(--color-border)',
                        color: 'var(--color-text)',
                        outline: 'none',
                      }}
                    />
                  ))}
                </div>

                <button
                  type="submit"
                  disabled={verifyingOtp || otpDigits.join('').length !== 6}
                  style={{
                    width: '100%',
                    backgroundColor: 'var(--color-secondary)',
                    color: '#FFFFFF',
                    padding: '0.65rem',
                    fontWeight: 700,
                    fontSize: '0.9rem',
                    borderRadius: 'var(--radius-md)',
                    boxShadow: '0 2px 8px var(--color-secondary-glow)',
                    minHeight: '42px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    cursor: verifyingOtp || otpDigits.join('').length !== 6 ? 'not-allowed' : 'pointer',
                    opacity: otpDigits.join('').length !== 6 ? 0.7 : 1,
                    marginBottom: '1rem',
                  }}
                >
                  {verifyingOtp ? <Loader2 size={16} className="animate-spin" /> : <ShieldCheck size={16} />}
                  <span>{verifyingOtp ? 'Verifying Code...' : 'Verify Code & Create Account'}</span>
                </button>
              </form>

              <div style={{ fontSize: '0.82rem', color: 'var(--color-text-secondary)' }}>
                {canResend ? (
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={resendingOtp}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--color-secondary)',
                      fontWeight: 700,
                      cursor: 'pointer',
                      fontSize: '0.82rem',
                    }}
                  >
                    {resendingOtp ? 'Resending...' : 'Resend Code Now'}
                  </button>
                ) : (
                  <span>
                    Resend code in <strong>00:{resendTimer < 10 ? `0${resendTimer}` : resendTimer}</strong>
                  </span>
                )}
              </div>
            </div>
          )}

          {mode === 'forgot' && (
            <form onSubmit={handleForgotSubmit}>
              <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', marginBottom: '1rem', lineHeight: 1.5 }}>
                Enter the email associated with your account to receive password reset instructions.
              </p>
              <div style={{ marginBottom: '1.25rem' }}>
                <label htmlFor="modal-forgot-email" style={{ display: 'block', fontWeight: 600, marginBottom: '0.35rem', fontSize: '0.82rem' }}>Account Email *</label>
                <div style={{ position: 'relative' }}>
                  <input id="modal-forgot-email" type="email" value={forgotEmail} onChange={(e) => setForgotEmail(e.target.value)} placeholder="you@example.com" required style={{ width: '100%', padding: '0.55rem 0.75rem 0.55rem 2.2rem', fontSize: '0.88rem' }} />
                  <Mail size={15} color="var(--color-muted)" style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)' }} />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                style={{
                  width: '100%',
                  backgroundColor: 'var(--color-secondary)',
                  color: '#FFFFFF',
                  padding: '0.65rem',
                  fontWeight: 700,
                  fontSize: '0.9rem',
                  borderRadius: 'var(--radius-md)',
                  marginBottom: '1rem',
                  minHeight: '42px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.45rem',
                }}
              >
                {loading ? <Loader2 size={16} className="animate-spin" /> : <KeyRound size={16} />}
                <span>{loading ? 'Sending...' : 'Send Reset Link'}</span>
              </button>
            </form>
          )}

          <div
            style={{
              marginTop: '1.25rem',
              textAlign: 'center',
              fontSize: '0.82rem',
              color: 'var(--color-text-secondary)',
              borderTop: '1px solid var(--color-border)',
              paddingTop: '1rem',
            }}
          >
            {mode === 'login' && (
              <p style={{ margin: 0 }}>
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setMode('register');
                    setErrorMsg(null);
                    setSuccessMsg(null);
                  }}
                  style={{ background: 'transparent', color: 'var(--color-secondary)', fontWeight: 700, padding: 0 }}
                >
                  Create account
                </button>
              </p>
            )}

            {(mode === 'register' || mode === 'otp' || mode === 'forgot') && (
              <p style={{ margin: 0 }}>
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setMode('login');
                    setErrorMsg(null);
                    setSuccessMsg(null);
                  }}
                  style={{ background: 'transparent', color: 'var(--color-secondary)', fontWeight: 700, padding: 0 }}
                >
                  Sign in
                </button>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

