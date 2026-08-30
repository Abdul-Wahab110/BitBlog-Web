import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  UserPlus,
  Eye,
  EyeOff,
  Lock,
  Mail,
  User,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
  Edit2,
  KeyRound,
  ExternalLink,
} from 'lucide-react';
import { SeoHead } from '../../components/common/SeoHead';
import { BrandLogo } from '../../components/common/BrandLogo';
import { validateGmailAddress } from '../../utils/emailValidator';
import { useAuth } from '../../context/AuthContext';
import { useSettings } from '../../context/SettingsContext';
import { ApiService } from '../../services/api';
import { FirebaseAuthService } from '../../services/firebaseAuth';

export const Register: React.FC = () => {
  const { settings } = useSettings();
  const siteName = settings.site_name || 'BitBlog';
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const [isOtpStep, setIsOtpStep] = useState(false);
  const [otpDigits, setOtpDigits] = useState<string[]>(['', '', '', '', '', '']);
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [resendingOtp, setResendingOtp] = useState(false);
  const [resendTimer, setResendTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);

  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const navigate = useNavigate();
  const { login } = useAuth();

  useEffect(() => {
    let interval: any;
    if (isOtpStep && resendTimer > 0) {
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
  }, [isOtpStep, resendTimer]);

  useEffect(() => {
    if (isOtpStep) {
      setTimeout(() => {
        otpInputRefs.current[0]?.focus();
      }, 200);
    }
  }, [isOtpStep]);

  const handleGoogleSignUp = async () => {
    setGoogleLoading(true);
    setErrorMsg(null);
    try {
      const data = await FirebaseAuthService.signInWithGoogle();
      if (data && data.token && data.user) {
        setSuccessMsg(`Welcome, ${data.user.name}! Verified with Google.`);
        login(data.token, data.user);
        setTimeout(() => {
          navigate('/user/dashboard');
        }, 600);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Google sign-up failed. Please try again.');
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleSendOtp = async (e: React.FormEvent) => {
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
      setErrorMsg('Passwords do not match. Please re-enter your password.');
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    try {
      const res = await ApiService.sendRegistrationOtp({
        name: name.trim(),
        username: username.trim(),
        email: email.trim().toLowerCase(),
        password,
      });

      if (res && res.success) {
        setIsOtpStep(true);
        setResendTimer(60);
        setCanResend(false);
        setOtpDigits(['', '', '', '', '', '']);
        setSuccessMsg(`6-digit code dispatched to ${email.trim()}!`);
      } else {
        throw new Error(res.message || 'Failed to send verification code.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'An error occurred while dispatching verification code.');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {

    const cleanVal = value.replace(/[^0-9]/g, '');
    const newDigits = [...otpDigits];

    if (cleanVal.length > 1) {

      const pasted = cleanVal.slice(0, 6).split('');
      pasted.forEach((char, i) => {
        newDigits[i] = char;
      });
      setOtpDigits(newDigits);
      const nextIndex = Math.min(pasted.length, 5);
      otpInputRefs.current[nextIndex]?.focus();
      return;
    }

    newDigits[index] = cleanVal;
    setOtpDigits(newDigits);

    if (cleanVal && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const fullOtp = otpDigits.join('').trim();
    if (fullOtp.length !== 6) {
      setErrorMsg('Please enter all 6 digits of the verification code.');
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
        setSuccessMsg('Gmail verified! Reader account created successfully.');
        if (res.data.token && res.data.user) {
          login(res.data.token, res.data.user);
          setTimeout(() => {
            navigate('/user/dashboard');
          }, 800);
        } else {
          setTimeout(() => {
            navigate('/login');
          }, 1000);
        }
      } else {
        throw new Error(res.message || 'Verification code invalid or expired.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Invalid verification code. Please check your Gmail.');
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
        setSuccessMsg('Fresh 6-digit verification code sent to your Gmail!');
        setResendTimer(60);
        setCanResend(false);
        setOtpDigits(['', '', '', '', '', '']);
        otpInputRefs.current[0]?.focus();
      } else {
        throw new Error(res.message || 'Failed to resend code.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to resend verification code.');
    } finally {
      setResendingOtp(false);
    }
  };

  return (
    <div
      style={{
        width: '100%',
        maxWidth: '480px',
        margin: '0 auto',
        padding: '2rem 1rem 3.5rem 1rem',
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
      }}
    >
      <SeoHead
        title={isOtpStep ? `Verify Gmail Code | ${siteName}` : `Create Reader Account | ${siteName}`}
        description="Register a verified reader account with instant Gmail OTP verification."
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
        {isOtpStep ? (

          <div style={{ textAlign: 'center' }}>
            <div
              style={{
                width: '68px',
                height: '68px',
                borderRadius: 'var(--radius-full)',
                backgroundColor: 'rgba(99, 102, 241, 0.15)',
                color: 'var(--color-secondary)',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1.25rem',
                border: '2px solid rgba(99, 102, 241, 0.3)',
                boxShadow: '0 0 20px rgba(99, 102, 241, 0.25)',
              }}
            >
              <KeyRound size={32} />
            </div>

            <h1 style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: '0.35rem', fontFamily: 'var(--font-heading)' }}>
              Verify Your Gmail 🔐
            </h1>

            <p style={{ fontSize: '0.88rem', color: 'var(--color-text-secondary)', lineHeight: 1.5, marginBottom: '1.5rem' }}>
              We sent a 6-digit verification code to:
              <br />
              <strong style={{ color: 'var(--color-text)', fontSize: '0.98rem' }}>{email}</strong>{' '}
              <button
                type="button"
                onClick={() => {
                  setIsOtpStep(false);
                  setErrorMsg(null);
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--color-secondary)',
                  cursor: 'pointer',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  textDecoration: 'underline',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '2px',
                  verticalAlign: 'middle',
                }}
              >
                <Edit2 size={12} /> Edit
              </button>
            </p>

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
                  textAlign: 'left',
                }}
              >
                <AlertCircle size={16} style={{ flexShrink: 0 }} />
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
                <CheckCircle2 size={16} style={{ flexShrink: 0 }} />
                <span>{successMsg}</span>
              </div>
            )}

            <form onSubmit={handleVerifyOtp}>

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  marginBottom: '1.5rem',
                }}
              >
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
                      width: '46px',
                      height: '54px',
                      fontSize: '1.4rem',
                      fontWeight: 800,
                      textAlign: 'center',
                      fontFamily: 'monospace',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: 'var(--color-surface)',
                      border: digit
                        ? '2px solid var(--color-secondary)'
                        : '1px solid var(--color-border)',
                      color: 'var(--color-text)',
                      boxShadow: digit ? '0 0 10px rgba(99,102,241,0.25)' : 'none',
                      transition: 'all 0.15s ease',
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
                  padding: '0.8rem 1.25rem',
                  backgroundColor: 'var(--color-secondary)',
                  color: '#FFFFFF',
                  borderRadius: 'var(--radius-md)',
                  fontWeight: 700,
                  fontSize: '0.95rem',
                  border: 'none',
                  cursor:
                    verifyingOtp || otpDigits.join('').length !== 6
                      ? 'not-allowed'
                      : 'pointer',
                  opacity: otpDigits.join('').length !== 6 ? 0.7 : 1,
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  boxShadow: '0 4px 14px var(--color-secondary-glow)',
                  minHeight: '46px',
                  marginBottom: '1.25rem',
                }}
              >
                {verifyingOtp ? (
                  <>
                    <RefreshCw size={16} className="animate-spin" /> Verifying Code & Creating Account...
                  </>
                ) : (
                  <>
                    <ShieldCheck size={18} /> Verify Code & Complete Registration
                  </>
                )}
              </button>
            </form>

            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '0.75rem',
                paddingTop: '0.5rem',
                borderTop: '1px solid var(--color-border)',
              }}
            >
              <div style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
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
                      fontSize: '0.88rem',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                    }}
                  >
                    <RefreshCw size={14} className={resendingOtp ? 'animate-spin' : ''} />
                    {resendingOtp ? 'Resending...' : 'Resend Code Now'}
                  </button>
                ) : (
                  <span>
                    Resend code in <strong style={{ color: 'var(--color-text)' }}>00:{resendTimer < 10 ? `0${resendTimer}` : resendTimer}</strong>
                  </span>
                )}
              </div>

              <a
                href="https://mail.google.com"
                target="_blank"
                rel="noreferrer"
                style={{
                  fontSize: '0.82rem',
                  color: 'var(--color-muted)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.3rem',
                  textDecoration: 'none',
                }}
              >
                Open Gmail in new tab <ExternalLink size={12} />
              </a>
            </div>
          </div>
        ) : (

          <>
            <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
              <div style={{ display: 'inline-flex', justifyContent: 'center', marginBottom: '0.85rem' }}>
                <BrandLogo size={46} showText={false} />
              </div>
              <h1 style={{ fontSize: '1.65rem', fontWeight: 800, marginBottom: '0.25rem', fontFamily: 'var(--font-heading)' }}>
                Create Reader Account
              </h1>
              <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
                Join our verified digital publication community
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
                <AlertCircle size={16} />
                <span>{errorMsg}</span>
              </div>
            )}

            <button
              type="button"
              onClick={handleGoogleSignUp}
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
              {googleLoading ? 'Connecting to Google...' : 'Continue with Google (Instant Verified)'}
            </button>

            <div style={{ display: 'flex', alignItems: 'center', margin: '1.25rem 0', gap: '0.75rem' }}>
              <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--color-border)' }} />
              <span style={{ fontSize: '0.78rem', color: 'var(--color-muted)', fontWeight: 600, textTransform: 'uppercase' }}>or register with Gmail OTP</span>
              <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--color-border)' }} />
            </div>

            <form onSubmit={handleSendOtp}>
              <div style={{ marginBottom: '1.1rem' }}>
                <label
                  htmlFor="reg-name"
                  style={{ display: 'block', fontWeight: 600, marginBottom: '0.4rem', fontSize: '0.85rem' }}
                >
                  Full Name *
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    id="reg-name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. John Doe"
                    required
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

              <div style={{ marginBottom: '1.1rem' }}>
                <label
                  htmlFor="reg-username"
                  style={{ display: 'block', fontWeight: 600, marginBottom: '0.4rem', fontSize: '0.85rem' }}
                >
                  Username *
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    id="reg-username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                    placeholder="e.g. johndoe"
                    required
                    style={{
                      width: '100%',
                      padding: '0.65rem 0.75rem 0.65rem 2.3rem',
                      fontSize: '0.9rem',
                      borderRadius: 'var(--radius-md)',
                    }}
                  />
                  <span
                    style={{
                      position: 'absolute',
                      left: '0.85rem',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: 'var(--color-muted)',
                      fontWeight: 600,
                      fontSize: '0.9rem',
                    }}
                  >
                    @
                  </span>
                </div>
              </div>

              <div style={{ marginBottom: '1.1rem' }}>
                <label
                  htmlFor="reg-email"
                  style={{ display: 'block', fontWeight: 600, marginBottom: '0.4rem', fontSize: '0.85rem' }}
                >
                  Valid Gmail Address * (OTP code will be sent here)
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    id="reg-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@gmail.com"
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

              <div style={{ marginBottom: '1.1rem' }}>
                <label
                  htmlFor="reg-password"
                  style={{ display: 'block', fontWeight: 600, marginBottom: '0.4rem', fontSize: '0.85rem' }}
                >
                  Password *
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    id="reg-password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    autoComplete="new-password"
                    style={{
                      width: '100%',
                      padding: '0.65rem 2.5rem 0.65rem 2.3rem',
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
                    }}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label
                  htmlFor="reg-confirm"
                  style={{ display: 'block', fontWeight: 600, marginBottom: '0.4rem', fontSize: '0.85rem' }}
                >
                  Confirm Password *
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    id="reg-confirm"
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    autoComplete="new-password"
                    style={{
                      width: '100%',
                      padding: '0.65rem 0.75rem 0.65rem 2.3rem',
                      fontSize: '0.9rem',
                      borderRadius: 'var(--radius-md)',
                    }}
                  />
                  <Lock
                    size={16}
                    color="var(--color-muted)"
                    style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)' }}
                  />
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
                <UserPlus size={16} /> {loading ? 'Sending 6-Digit OTP...' : 'Send Verification OTP to Gmail →'}
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
              Already have an account?{' '}
              <Link to="/login" style={{ color: 'var(--color-secondary)', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '0.2rem' }}>
                Sign in <ArrowRight size={13} />
              </Link>
            </div>
          </>
        )}
      </section>
    </div>
  );
};

