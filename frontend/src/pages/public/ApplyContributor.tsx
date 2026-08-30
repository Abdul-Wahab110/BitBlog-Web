import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Feather,
  Award,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Send,
  BookOpen,
  Users,
  Globe,
  TrendingUp,
  LogIn,
  UserCheck,
  FileCode,
  Layers,
  HelpCircle,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useSettings } from '../../context/SettingsContext';
import { SeoHead } from '../../components/common/SeoHead';
import { BrandLogo } from '../../components/common/BrandLogo';
import { ApiService } from '../../services/api';

const WRITING_TOPICS = [
  'Artificial Intelligence & Machine Learning',
  'Software Architecture & System Design',
  'Modern Web & Frontend Development',
  'Cloud, DevOps & Infrastructure',
  'UI/UX Design & Product Strategy',
  'Cybersecurity & Network Defense',
  'Data Engineering & Analytics',
  'Tech Culture & Career Insights',
];

const PERKS = [
  {
    icon: Globe,
    title: 'Global Readership',
    desc: 'Reach an audience of thousands of engineers, founders, designers, and tech enthusiasts worldwide.',
    color: '#6366F1',
  },
  {
    icon: Award,
    title: 'Verified Author Profile',
    desc: 'Get a dedicated public profile page, verified contributor badge, author bio, and do-follow portfolio links.',
    color: '#EC4899',
  },
  {
    icon: TrendingUp,
    title: 'AEO & SEO Optimization',
    desc: 'All articles are automated with Google News schemas, structured JSON-LD data, and social preview cards.',
    color: '#10B981',
  },
  {
    icon: ShieldCheck,
    title: 'Editorial Guidance',
    desc: 'Work with experienced editors who provide helpful feedback to elevate your writing and article impact.',
    color: '#F59E0B',
  },
];

const FAQS = [
  {
    q: 'What kind of content does BitBlog publish?',
    a: 'We publish high-quality, in-depth technical guides, thoughtful essays on software architecture, design philosophy, deep dives into AI/ML trends, and honest industry perspectives.',
  },
  {
    q: 'How long does the application review take?',
    a: 'Our editorial board reviews submitted writing samples and applications within 24 to 48 hours. You will receive an immediate notification in your portal upon decision.',
  },
  {
    q: 'Do I retain ownership of my written articles?',
    a: 'Yes, absolutely. Authors retain full copyright of their original material with non-exclusive publishing rights granted to BitBlog.',
  },
  {
    q: 'Can I cross-post articles from my personal blog or Substack?',
    a: 'Yes, provided you are the original author and include a canonical reference link back to your personal domain or original publication.',
  },
];

export const ApplyContributor: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const { settings } = useSettings();
  const siteName = settings.site_name || 'BitBlog';
  const navigate = useNavigate();

  // Role classification
  const isAuthor = user?.role === 'Author';
  const isEditor = user?.role === 'Editor';
  const isAdmin = user?.role === 'Admin';
  const isStaffAlready = isAuthor || isEditor || isAdmin;
  const isTopRole = isEditor || isAdmin;

  // Application State
  const [roleApplied, setRoleApplied] = useState<'Author' | 'Editor'>(isAuthor ? 'Editor' : 'Author');
  const [bio, setBio] = useState('');
  const [sampleUrls, setSampleUrls] = useState('');
  const [selectedTopics, setSelectedTopics] = useState<string[]>([
    'Artificial Intelligence & Machine Learning',
    'Modern Web & Frontend Development',
  ]);
  const [motivation, setMotivation] = useState('');

  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [currentApp, setCurrentApp] = useState<any>(null);
  const [reapplyMode, setReapplyMode] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    if (isAuthor && roleApplied === 'Author') {
      setRoleApplied('Editor');
    }
  }, [isAuthor]);

  // Check user application status if logged in
  useEffect(() => {
    if (isAuthenticated) {
      setLoading(true);
      ApiService.getMyApplication()
        .then(res => {
          if (res && res.data && res.data.latest) {
            setCurrentApp(res.data.latest);
          }
        })
        .catch(() => {})
        .finally(() => setLoading(false));
    }
  }, [isAuthenticated]);

  const toggleTopic = React.useCallback((topic: string) => {
    setSelectedTopics(prev =>
      prev.includes(topic) ? prev.filter(t => t !== topic) : [...prev, topic]
    );
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isAuthenticated) {
      // Save draft into session storage and redirect to login
      sessionStorage.setItem(
        'contributor_draft',
        JSON.stringify({ roleApplied, bio, sampleUrls, selectedTopics, motivation })
      );
      navigate('/login?redirect=/apply');
      return;
    }

    if (!bio.trim() || bio.trim().length < 10) {
      setFeedback({ type: 'error', message: 'Please provide an author bio (at least 10 characters).' });
      return;
    }

    if (!motivation.trim() || motivation.trim().length < 10) {
      setFeedback({
        type: 'error',
        message: 'Please describe your motivation and article topics (at least 10 characters).',
      });
      return;
    }

    setSubmitting(true);
    setFeedback(null);

    try {
      const res = await ApiService.applyRole({
        roleApplied,
        bio: bio.trim(),
        sampleUrls: sampleUrls.trim(),
        topics: selectedTopics,
        motivation: motivation.trim(),
      });

      setFeedback({
        type: 'success',
        message: res.message || 'Your application was submitted successfully! Our editorial desk will review your portfolio.',
      });
      setReapplyMode(false);
      // Refresh status
      const appRes = await ApiService.getMyApplication();
      if (appRes && appRes.data && appRes.data.latest) {
        setCurrentApp(appRes.data.latest);
      }
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Failed to submit application. Please try again.' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ backgroundColor: 'var(--color-background)', minHeight: '100vh', paddingBottom: '6rem' }}>
      <SeoHead
        title={`Write for ${siteName} | Contributor & Editorial Applications`}
        description={`Join ${siteName}'s community of verified authors, engineers, and digital journalists. Publish high-impact tech stories and build your writing portfolio.`}
      />

      {/* 1. HERO BANNER */}
      <section
        style={{
          position: 'relative',
          padding: '4rem 1rem 3.5rem 1rem',
          background: 'linear-gradient(180deg, var(--color-surface) 0%, var(--color-background) 100%)',
          borderBottom: '1px solid var(--color-border)',
          overflow: 'hidden',
          textAlign: 'center',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: '-20%',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '650px',
            height: '350px',
            background: 'radial-gradient(ellipse at center, var(--color-secondary-glow, rgba(99,102,241,0.18)) 0%, transparent 70%)',
            pointerEvents: 'none',
          }}
        />

        <div className="container" style={{ maxWidth: '900px', position: 'relative', zIndex: 2 }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.45rem',
              backgroundColor: 'var(--color-surface-alt)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-full)',
              padding: '0.4rem 1rem',
              fontSize: '0.82rem',
              fontWeight: 700,
              color: 'var(--color-secondary)',
              marginBottom: '1.25rem',
            }}
          >
            <Sparkles size={14} /> Contributor Network
          </div>

          <h1
            style={{
              fontSize: 'clamp(2rem, 4.5vw, 3.25rem)',
              fontWeight: 900,
              lineHeight: 1.18,
              letterSpacing: '-0.03em',
              color: 'var(--color-text)',
              marginBottom: '1.15rem',
              fontFamily: 'var(--font-heading)',
            }}
          >
            Write for{' '}
            <span
              style={{
                background: 'linear-gradient(135deg, var(--color-secondary), var(--color-accent))',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              {siteName}
            </span>
          </h1>

          <p
            style={{
              fontSize: 'clamp(1rem, 1.8vw, 1.15rem)',
              lineHeight: 1.7,
              color: 'var(--color-text-secondary)',
              maxWidth: '750px',
              margin: '0 auto',
            }}
          >
            Share your engineering breakthroughs, architectural discoveries, and tech insights with our fast-growing global readership.
          </p>
        </div>
      </section>

      {/* 2. WHY WRITE FOR US (PERKS) */}
      <section className="container" style={{ maxWidth: '1080px', marginTop: '-1.5rem', marginBottom: '3.5rem', padding: '0 1rem' }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '1.25rem',
          }}
        >
          {PERKS.map((perk, idx) => {
            const Icon = perk.icon;
            return (
              <div
                key={idx}
                style={{
                  backgroundColor: 'var(--color-card)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '1.6rem',
                  boxShadow: 'var(--shadow-sm)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.75rem',
                }}
              >
                <div
                  style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'var(--color-surface-alt)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: perk.color,
                    border: '1px solid var(--color-border)',
                  }}
                >
                  <Icon size={20} />
                </div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 800, margin: 0, color: 'var(--color-text)' }}>
                  {perk.title}
                </h3>
                <p style={{ fontSize: '0.86rem', color: 'var(--color-text-secondary)', margin: 0, lineHeight: 1.6 }}>
                  {perk.desc}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* 3. MAIN APPLICATION SECTION */}
      <section className="container" style={{ maxWidth: '900px', padding: '0 1rem' }}>
        {/* Active Staff Alert */}
        {isStaffAlready && (
          <div
            style={{
              padding: '1.75rem',
              backgroundColor: 'var(--color-card)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-lg)',
              marginBottom: '2rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '1.5rem',
              flexWrap: 'wrap',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(16, 185, 129, 0.15)',
                  color: '#10B981',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <UserCheck size={26} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: '0 0 0.2rem 0', color: 'var(--color-text)' }}>
                  You are a verified {user?.role}!
                </h3>
                <p style={{ fontSize: '0.88rem', color: 'var(--color-text-secondary)', margin: 0 }}>
                  {isAuthor
                    ? 'You have publishing permissions in your author workspace. You can also apply for promotion to Editor below.'
                    : `You have full access to the ${user?.role} editorial workspace.`}
                </p>
              </div>
            </div>

            <Link
              to="/admin"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                backgroundColor: 'var(--color-secondary)',
                color: '#FFFFFF',
                padding: '0.75rem 1.4rem',
                borderRadius: 'var(--radius-md)',
                fontWeight: 700,
                fontSize: '0.9rem',
                textDecoration: 'none',
              }}
            >
              Open Creator Portal <ArrowRight size={15} />
            </Link>
          </div>
        )}

        {/* Pending / Existing Application Status */}
        {currentApp && !reapplyMode && (
          <div
            style={{
              padding: '2rem',
              backgroundColor: 'var(--color-card)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-xl, 16px)',
              marginBottom: '2.5rem',
              boxShadow: 'var(--shadow-md)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', marginBottom: '1.25rem' }}>
              {currentApp.status === 'pending' && (
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    padding: '0.4rem 0.9rem',
                    borderRadius: 'var(--radius-full)',
                    backgroundColor: 'rgba(245, 158, 11, 0.12)',
                    color: '#F59E0B',
                    fontWeight: 700,
                    fontSize: '0.85rem',
                    border: '1px solid rgba(245, 158, 11, 0.3)',
                  }}
                >
                  <Sparkles size={14} /> Under Editorial Review
                </div>
              )}
              {currentApp.status === 'approved' && (
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    padding: '0.4rem 0.9rem',
                    borderRadius: 'var(--radius-full)',
                    backgroundColor: 'rgba(16, 185, 129, 0.12)',
                    color: '#10B981',
                    fontWeight: 700,
                    fontSize: '0.85rem',
                    border: '1px solid rgba(16, 185, 129, 0.3)',
                  }}
                >
                  <CheckCircle2 size={14} /> Application Approved
                </div>
              )}
              {currentApp.status === 'rejected' && (
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    padding: '0.4rem 0.9rem',
                    borderRadius: 'var(--radius-full)',
                    backgroundColor: 'rgba(239, 68, 68, 0.12)',
                    color: 'var(--color-danger)',
                    fontWeight: 700,
                    fontSize: '0.85rem',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                  }}
                >
                  <AlertCircle size={14} /> Not Approved
                </div>
              )}
            </div>

            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-text)', marginBottom: '0.5rem' }}>
              Your {currentApp.role_applied} Application
            </h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)', lineHeight: 1.6, marginBottom: '1.5rem' }}>
              {currentApp.status === 'pending'
                ? 'Your submission is currently in our review queue. Our editors evaluate writing quality, technical accuracy, and domain expertise.'
                : currentApp.status === 'approved'
                ? isAuthor
                  ? 'Congratulations! Your Author account is active. You can write stories directly or submit an application below to become an Editor.'
                  : 'Congratulations! Your contributor account is active. You can now compose and publish stories directly.'
                : `Feedback: ${currentApp.admin_feedback || 'We encourage updating your writing samples or submitting again with detailed technical drafts.'}`}
            </p>

            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              {currentApp.status === 'approved' && (
                <Link
                  to="/admin"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.45rem',
                    backgroundColor: 'var(--color-secondary)',
                    color: '#FFFFFF',
                    padding: '0.7rem 1.4rem',
                    borderRadius: 'var(--radius-md)',
                    fontWeight: 700,
                    fontSize: '0.9rem',
                    textDecoration: 'none',
                  }}
                >
                  Go to Author Dashboard <ArrowRight size={15} />
                </Link>
              )}

              {currentApp.status === 'rejected' && (
                <button
                  onClick={() => setReapplyMode(true)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.45rem',
                    backgroundColor: 'var(--color-secondary)',
                    color: '#FFFFFF',
                    padding: '0.7rem 1.4rem',
                    borderRadius: 'var(--radius-md)',
                    fontWeight: 700,
                    fontSize: '0.9rem',
                    border: 'none',
                    cursor: 'pointer',
                  }}
                >
                  Submit Updated Application <ArrowRight size={15} />
                </button>
              )}
            </div>
          </div>
        )}

        {/* Main Application Form Container */}
        {((!currentApp || currentApp.status !== 'pending' || reapplyMode) && !isTopRole) && (
          <div
            style={{
              backgroundColor: 'var(--color-card)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-xl, 16px)',
              padding: '2.5rem 2rem',
              boxShadow: 'var(--shadow-md)',
            }}
          >
            <div style={{ marginBottom: '2rem', borderBottom: '1px solid var(--color-border)', paddingBottom: '1.25rem' }}>
              <h2
                style={{
                  fontSize: '1.5rem',
                  fontWeight: 800,
                  color: 'var(--color-text)',
                  marginBottom: '0.4rem',
                  fontFamily: 'var(--font-heading)',
                }}
              >
                {isAuthor ? 'Apply for Editor Role' : 'Contributor Application'}
              </h2>
              <p style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)', margin: 0 }}>
                {isAuthor
                  ? 'Step up to an Editor position to review drafts, manage tags & categories, and direct-publish stories.'
                  : 'Tell us about your background, the topics you specialize in, and share samples of your writing.'}
              </p>
            </div>

            {/* Guest Banner Notice */}
            {!isAuthenticated && (
              <div
                style={{
                  padding: '1.25rem',
                  backgroundColor: 'var(--color-surface-alt)',
                  border: '1px dashed var(--color-secondary)',
                  borderRadius: 'var(--radius-lg)',
                  marginBottom: '2rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '1rem',
                  flexWrap: 'wrap',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <LogIn size={20} color="var(--color-secondary)" />
                  <div>
                    <strong style={{ fontSize: '0.9rem', color: 'var(--color-text)', display: 'block' }}>
                      Ready to apply?
                    </strong>
                    <span style={{ fontSize: '0.82rem', color: 'var(--color-text-secondary)' }}>
                      Log in to your {siteName} account or register to link your contributor submissions.
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <Link
                    to="/login?redirect=/apply"
                    style={{
                      padding: '0.5rem 1rem',
                      backgroundColor: 'var(--color-secondary)',
                      color: '#FFFFFF',
                      borderRadius: 'var(--radius-md)',
                      fontWeight: 700,
                      fontSize: '0.84rem',
                      textDecoration: 'none',
                    }}
                  >
                    Log In
                  </Link>
                  <Link
                    to="/register?redirect=/apply"
                    style={{
                      padding: '0.5rem 1rem',
                      backgroundColor: 'var(--color-surface)',
                      color: 'var(--color-text)',
                      border: '1px solid var(--color-border)',
                      borderRadius: 'var(--radius-md)',
                      fontWeight: 600,
                      fontSize: '0.84rem',
                      textDecoration: 'none',
                    }}
                  >
                    Create Account
                  </Link>
                </div>
              </div>
            )}

            {/* Status Feedback alert */}
            {feedback && (
              <div
                style={{
                  padding: '1rem 1.25rem',
                  borderRadius: 'var(--radius-md)',
                  marginBottom: '1.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  fontSize: '0.9rem',
                  backgroundColor: feedback.type === 'success' ? 'rgba(16, 185, 129, 0.12)' : 'rgba(239, 68, 68, 0.12)',
                  color: feedback.type === 'success' ? '#10B981' : 'var(--color-danger)',
                  border: `1px solid ${feedback.type === 'success' ? 'rgba(16, 185, 129, 0.25)' : 'rgba(239, 68, 68, 0.25)'}`,
                }}
              >
                {feedback.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
                <span>{feedback.message}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
              {/* Role Selection */}
              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '0.88rem',
                    fontWeight: 700,
                    color: 'var(--color-text)',
                    marginBottom: '0.6rem',
                  }}
                >
                  Choose Your Desired Contributor Track
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
                  {/* Author Track */}
                  <div
                    onClick={() => {
                      if (!isAuthor) setRoleApplied('Author');
                    }}
                    style={{
                      padding: '1.25rem',
                      borderRadius: 'var(--radius-lg)',
                      border: `2px solid ${
                        isAuthor
                          ? 'rgba(16, 185, 129, 0.4)'
                          : roleApplied === 'Author'
                          ? 'var(--color-secondary)'
                          : 'var(--color-border)'
                      }`,
                      backgroundColor: isAuthor
                        ? 'rgba(16, 185, 129, 0.06)'
                        : roleApplied === 'Author'
                        ? 'var(--color-surface-alt)'
                        : 'transparent',
                      cursor: isAuthor ? 'default' : 'pointer',
                      transition: 'all var(--transition-fast)',
                      opacity: isAuthor ? 0.8 : 1,
                      position: 'relative',
                    }}
                  >
                    {isAuthor && (
                      <span
                        style={{
                          position: 'absolute',
                          top: '10px',
                          right: '10px',
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          backgroundColor: 'rgba(16, 185, 129, 0.18)',
                          color: '#10B981',
                          padding: '0.15rem 0.5rem',
                          borderRadius: 'var(--radius-full)',
                        }}
                      >
                        ✓ Current Role
                      </span>
                    )}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Feather size={18} color={isAuthor ? '#10B981' : roleApplied === 'Author' ? 'var(--color-secondary)' : 'var(--color-text-secondary)'} />
                        <strong style={{ fontSize: '0.98rem', color: 'var(--color-text)' }}>Author / Writer</strong>
                      </div>
                      {!isAuthor && (
                        <input
                          type="radio"
                          name="role"
                          checked={roleApplied === 'Author'}
                          onChange={() => setRoleApplied('Author')}
                        />
                      )}
                    </div>
                    <p style={{ fontSize: '0.82rem', color: 'var(--color-text-secondary)', margin: 0, lineHeight: 1.5 }}>
                      Draft, submit, and publish stories, guides, deep-dives, and technical analysis.
                    </p>
                  </div>

                  {/* Editor Track */}
                  <div
                    onClick={() => setRoleApplied('Editor')}
                    style={{
                      padding: '1.25rem',
                      borderRadius: 'var(--radius-lg)',
                      border: `2px solid ${roleApplied === 'Editor' ? 'var(--color-secondary)' : 'var(--color-border)'}`,
                      backgroundColor: roleApplied === 'Editor' ? 'var(--color-surface-alt)' : 'transparent',
                      cursor: 'pointer',
                      transition: 'all var(--transition-fast)',
                      boxShadow: roleApplied === 'Editor' ? '0 0 0 1px var(--color-secondary)' : 'none',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <ShieldCheck size={18} color={roleApplied === 'Editor' ? 'var(--color-secondary)' : 'var(--color-text-secondary)'} />
                        <strong style={{ fontSize: '0.98rem', color: 'var(--color-text)' }}>Editor / Reviewer</strong>
                      </div>
                      <input
                        type="radio"
                        name="role"
                        checked={roleApplied === 'Editor'}
                        onChange={() => setRoleApplied('Editor')}
                      />
                    </div>
                    <p style={{ fontSize: '0.82rem', color: 'var(--color-text-secondary)', margin: 0, lineHeight: 1.5 }}>
                      Review submitted articles, manage categories & tags, and maintain editorial quality.
                    </p>
                  </div>
                </div>
              </div>

              {/* Topics Multi-Select */}
              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '0.88rem',
                    fontWeight: 700,
                    color: 'var(--color-text)',
                    marginBottom: '0.5rem',
                  }}
                >
                  Topics & Areas of Expertise
                </label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                  {WRITING_TOPICS.map(topic => {
                    const isSelected = selectedTopics.includes(topic);
                    return (
                      <button
                        type="button"
                        key={topic}
                        onClick={() => toggleTopic(topic)}
                        style={{
                          padding: '0.45rem 0.85rem',
                          borderRadius: 'var(--radius-full)',
                          fontSize: '0.8rem',
                          fontWeight: isSelected ? 700 : 500,
                          backgroundColor: isSelected ? 'var(--color-secondary)' : 'var(--color-surface-alt)',
                          color: isSelected ? '#FFFFFF' : 'var(--color-text)',
                          border: `1px solid ${isSelected ? 'var(--color-secondary)' : 'var(--color-border)'}`,
                          cursor: 'pointer',
                          transition: 'all var(--transition-fast)',
                        }}
                      >
                        {isSelected && '✓ '}
                        {topic}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Bio / Background */}
              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '0.88rem',
                    fontWeight: 700,
                    color: 'var(--color-text)',
                    marginBottom: '0.4rem',
                  }}
                >
                  Author Bio & Background <span style={{ color: 'var(--color-danger)' }}>*</span>
                </label>
                <textarea
                  rows={3}
                  value={bio}
                  onChange={e => setBio(e.target.value)}
                  placeholder="e.g., Senior Systems Engineer with 6+ years in distributed microservices and cloud infrastructure. Passionate about Go, Kubernetes, and developer tooling."
                  required
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    backgroundColor: 'var(--color-surface)',
                    border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-md)',
                    color: 'var(--color-text)',
                    fontSize: '0.9rem',
                    outline: 'none',
                    resize: 'vertical',
                    fontFamily: 'inherit',
                  }}
                />
              </div>

              {/* Sample URLs / Portfolio */}
              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '0.88rem',
                    fontWeight: 700,
                    color: 'var(--color-text)',
                    marginBottom: '0.4rem',
                  }}
                >
                  Writing Samples / Portfolio URLs
                </label>
                <input
                  type="text"
                  value={sampleUrls}
                  onChange={e => setSampleUrls(e.target.value)}
                  placeholder="https://github.com/yourhandle, https://medium.com/@yourhandle, or personal blog"
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    backgroundColor: 'var(--color-surface)',
                    border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-md)',
                    color: 'var(--color-text)',
                    fontSize: '0.9rem',
                    outline: 'none',
                  }}
                />
              </div>

              {/* Motivation & Article Proposals */}
              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '0.88rem',
                    fontWeight: 700,
                    color: 'var(--color-text)',
                    marginBottom: '0.4rem',
                  }}
                >
                  Why do you want to contribute to {siteName}? / Proposed Article Ideas <span style={{ color: 'var(--color-danger)' }}>*</span>
                </label>
                <textarea
                  rows={4}
                  value={motivation}
                  onChange={e => setMotivation(e.target.value)}
                  placeholder="Describe why you would like to write for BitBlog and share 1-2 article topics or tutorial drafts you'd like to publish..."
                  required
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    backgroundColor: 'var(--color-surface)',
                    border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-md)',
                    color: 'var(--color-text)',
                    fontSize: '0.9rem',
                    outline: 'none',
                    resize: 'vertical',
                    fontFamily: 'inherit',
                  }}
                />
              </div>

              {/* Submit CTA */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', paddingTop: '0.5rem' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>
                  By submitting, you agree to uphold our editorial and ethical guidelines.
                </span>

                <button
                  type="submit"
                  disabled={submitting}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    backgroundColor: 'var(--color-secondary)',
                    color: '#FFFFFF',
                    padding: '0.85rem 1.8rem',
                    borderRadius: 'var(--radius-md)',
                    fontWeight: 700,
                    fontSize: '0.95rem',
                    border: 'none',
                    cursor: submitting ? 'not-allowed' : 'pointer',
                    boxShadow: '0 4px 14px var(--color-secondary-glow, rgba(99,102,241,0.35))',
                    transition: 'transform var(--transition-fast)',
                    opacity: submitting ? 0.7 : 1,
                  }}
                >
                  {submitting ? (
                    'Submitting Application...'
                  ) : (
                    <>
                      <Send size={16} /> Submit {roleApplied} Application
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}
      </section>

      {/* 4. FREQUENTLY ASKED QUESTIONS */}
      <section className="container" style={{ maxWidth: '900px', marginTop: '4rem', padding: '0 1rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <span
            style={{
              fontSize: '0.8rem',
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              color: 'var(--color-secondary)',
              display: 'block',
              marginBottom: '0.4rem',
            }}
          >
            Clear Guidelines
          </span>
          <h2
            style={{
              fontSize: 'clamp(1.5rem, 3vw, 2rem)',
              fontWeight: 800,
              color: 'var(--color-text)',
              margin: 0,
              fontFamily: 'var(--font-heading)',
            }}
          >
            Contributor FAQs & Editorial Rules
          </h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))', gap: '1.25rem' }}>
          {FAQS.map((faq, idx) => (
            <div
              key={idx}
              style={{
                padding: '1.5rem',
                backgroundColor: 'var(--color-card)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-lg)',
                boxShadow: 'var(--shadow-sm)',
              }}
            >
              <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--color-text)', margin: '0 0 0.5rem 0' }}>
                {faq.q}
              </h3>
              <p style={{ fontSize: '0.88rem', color: 'var(--color-text-secondary)', lineHeight: 1.6, margin: 0 }}>
                {faq.a}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
