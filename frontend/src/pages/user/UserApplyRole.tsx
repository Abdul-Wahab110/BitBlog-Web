import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Award,
  PenTool,
  ShieldCheck,
  CheckCircle2,
  Clock,
  XCircle,
  ArrowRight,
  Sparkles,
  Send,
  FileText,
  AlertCircle,
  ChevronRight,
  HelpCircle,
} from 'lucide-react';
import { SeoHead } from '../../components/common/SeoHead';
import { LoadingState } from '../../components/common/LoadingState';
import { ApiService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useSettings } from '../../context/SettingsContext';

const TOPICS_LIST = [
  'Technology & Innovation',
  'AI & Machine Learning',
  'Web Development & APIs',
  'Design & UI/UX',
  'Business & Startups',
  'Tutorials & Deep Dives',
];

export const UserApplyRole: React.FC = () => {
  const { user } = useAuth();
  const { settings } = useSettings();
  const siteName = settings.site_name || 'BitBlog';
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [currentApp, setCurrentApp] = useState<any>(null);
  const [reapplyMode, setReapplyMode] = useState(false);

  // Form State: If user is already Author, default to 'Editor'
  const isAuthor = user?.role === 'Author';
  const isEditor = user?.role === 'Editor';
  const isAdmin = user?.role === 'Admin';
  const isStaffAlready = isAuthor || isEditor || isAdmin;

  const [roleApplied, setRoleApplied] = useState<'Author' | 'Editor'>(isAuthor ? 'Editor' : 'Author');
  const [bio, setBio] = useState('');
  const [sampleUrls, setSampleUrls] = useState('');
  const [selectedTopics, setSelectedTopics] = useState<string[]>(['Technology & Innovation']);
  const [motivation, setMotivation] = useState('');

  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    fetchApplicationStatus();
  }, []);

  useEffect(() => {
    if (isAuthor && roleApplied === 'Author') {
      setRoleApplied('Editor');
    }
  }, [isAuthor]);

  const fetchApplicationStatus = async () => {
    try {
      setLoading(true);
      const res = await ApiService.getMyApplication();
      if (res && res.data && res.data.latest) {
        setCurrentApp(res.data.latest);
      }
    } catch (err) {
      console.error('Failed to fetch user application:', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleTopic = (t: string) => {
    if (selectedTopics.includes(t)) {
      setSelectedTopics(selectedTopics.filter(item => item !== t));
    } else {
      setSelectedTopics([...selectedTopics, t]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bio.trim() || !motivation.trim()) {
      setFeedback({ type: 'error', message: 'Please complete all required fields (bio and motivation).' });
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
        message: res.message || `Application for ${roleApplied} submitted successfully! Our administration will review your portfolio.`,
      });
      setReapplyMode(false);
      fetchApplicationStatus();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Failed to submit application.' });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <LoadingState message="Loading your contributor status..." />;
  }

  // Determine if application form should be shown:
  // - Show if no app, or rejected/reapply
  // - Show if user is Author (so they can apply for Editor!) unless they already have a pending Editor application
  // - Hide only if currentApp is pending OR user is already Editor/Admin
  const hasPendingApp = currentApp && currentApp.status === 'pending';
  const isTopRole = isEditor || isAdmin;
  const canShowForm = (!hasPendingApp && !isTopRole) || reapplyMode;

  return (
    <div style={{ maxWidth: '850px', margin: '0 auto' }}>
      <SeoHead
        title={`Apply as Author or Editor | ${siteName}`}
        description={`Submit your application to become a verified Author or Editor on ${siteName} digital publication.`}
      />

      {/* Page Header */}
      <div style={{ marginBottom: '2rem' }}>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            padding: '0.25rem 0.75rem',
            borderRadius: 'var(--radius-full)',
            backgroundColor: 'var(--color-surface-alt)',
            border: '1px solid var(--color-border)',
            fontSize: '0.8rem',
            color: 'var(--color-secondary)',
            fontWeight: 700,
            marginBottom: '0.75rem',
          }}
        >
          <Sparkles size={14} /> Contributor Network
        </div>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '0.4rem', fontFamily: 'var(--font-heading)' }}>
          Join Our Editorial Staff
        </h1>
        <p style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
          Publish in-depth technical stories, manage content categories, or review articles by applying for an Author or Editor role.
        </p>
      </div>

      {/* Feedback Alert */}
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
            color: feedback.type === 'success' ? 'var(--color-success)' : 'var(--color-danger)',
            border: `1px solid ${feedback.type === 'success' ? 'rgba(16, 185, 129, 0.25)' : 'rgba(239, 68, 68, 0.25)'}`,
          }}
        >
          {feedback.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* 1. Existing Active Staff Badge */}
      {isStaffAlready && (
        <div
          style={{
            padding: '1.5rem',
            backgroundColor: 'var(--color-card)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-lg)',
            marginBottom: '2rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'rgba(99, 102, 241, 0.12)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--color-secondary)',
              }}
            >
              <ShieldCheck size={28} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0, color: 'var(--color-text)' }}>
                You are a Verified {user?.role}!
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', margin: '0.25rem 0 0 0' }}>
                {isAuthor
                  ? 'You hold Author privileges with access to the Staff Editorial Studio. You can also apply for the Editor role below.'
                  : `You hold full ${user?.role} clearance with access to the complete Editorial Workspace.`}
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
              padding: '0.6rem 1.25rem',
              borderRadius: 'var(--radius-md)',
              fontWeight: 700,
              fontSize: '0.88rem',
              textDecoration: 'none',
              boxShadow: '0 2px 8px var(--color-secondary-glow)',
            }}
          >
            Go to Staff Studio <ArrowRight size={16} />
          </Link>
        </div>
      )}

      {/* 2. Existing Application Status Card (Pending / Approved / Rejected) */}
      {currentApp && !reapplyMode && (
        <div
          style={{
            backgroundColor: 'var(--color-card)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-lg)',
            padding: '1.75rem',
            marginBottom: '2rem',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', fontWeight: 600 }}>Application ID:</span>
              <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-text)' }}>#{currentApp.application_id}</span>
            </div>

            {/* Status Pill */}
            {currentApp.status === 'pending' && (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.35rem 0.85rem', borderRadius: 'var(--radius-full)', backgroundColor: 'rgba(245, 158, 11, 0.15)', color: '#F59E0B', fontSize: '0.82rem', fontWeight: 700, border: '1px solid rgba(245, 158, 11, 0.3)' }}>
                <Clock size={14} /> Pending Administration Review
              </span>
            )}
            {currentApp.status === 'approved' && (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.35rem 0.85rem', borderRadius: 'var(--radius-full)', backgroundColor: 'rgba(16, 185, 129, 0.15)', color: '#10B981', fontSize: '0.82rem', fontWeight: 700, border: '1px solid rgba(16, 185, 129, 0.3)' }}>
                <CheckCircle2 size={14} /> Application Approved
              </span>
            )}
            {currentApp.status === 'rejected' && (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.35rem 0.85rem', borderRadius: 'var(--radius-full)', backgroundColor: 'rgba(239, 68, 68, 0.15)', color: 'var(--color-danger)', fontSize: '0.82rem', fontWeight: 700, border: '1px solid rgba(239, 68, 68, 0.3)' }}>
                <XCircle size={14} /> Application Not Approved
              </span>
            )}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.25rem', padding: '1rem', backgroundColor: 'var(--color-surface-alt)', borderRadius: 'var(--radius-md)' }}>
            <div>
              <p style={{ fontSize: '0.75rem', color: 'var(--color-muted)', margin: 0, textTransform: 'uppercase', fontWeight: 700 }}>Requested Role</p>
              <p style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--color-secondary)', margin: '0.2rem 0 0 0' }}>{currentApp.role_applied}</p>
            </div>
            <div>
              <p style={{ fontSize: '0.75rem', color: 'var(--color-muted)', margin: 0, textTransform: 'uppercase', fontWeight: 700 }}>Submitted On</p>
              <p style={{ fontSize: '0.95rem', fontWeight: 600, margin: '0.2rem 0 0 0', color: 'var(--color-text)' }}>{new Date(currentApp.created_at).toLocaleDateString()}</p>
            </div>
            <div>
              <p style={{ fontSize: '0.75rem', color: 'var(--color-muted)', margin: 0, textTransform: 'uppercase', fontWeight: 700 }}>Topics</p>
              <p style={{ fontSize: '0.85rem', margin: '0.2rem 0 0 0', color: 'var(--color-text)' }}>{currentApp.topics ? currentApp.topics.join(', ') : 'General'}</p>
            </div>
          </div>

          {currentApp.feedback && (
            <div style={{ padding: '1rem', backgroundColor: 'rgba(255,255,255,0.03)', borderLeft: '3px solid var(--color-secondary)', borderRadius: 'var(--radius-sm)', marginBottom: '1.25rem' }}>
              <p style={{ fontSize: '0.8rem', fontWeight: 700, margin: '0 0 0.3rem 0', color: 'var(--color-text)' }}>Admin Feedback:</p>
              <p style={{ fontSize: '0.88rem', color: 'var(--color-text-secondary)', margin: 0 }}>{currentApp.feedback}</p>
            </div>
          )}

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            {currentApp.status === 'rejected' && (
              <button
                onClick={() => setReapplyMode(true)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  backgroundColor: 'var(--color-secondary)',
                  color: '#FFFFFF',
                  padding: '0.55rem 1.1rem',
                  borderRadius: 'var(--radius-md)',
                  fontWeight: 700,
                  fontSize: '0.88rem',
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                Submit Updated Application <ArrowRight size={16} />
              </button>
            )}

            {currentApp.status === 'approved' && isAuthor && (
              <span style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', fontWeight: 500 }}>
                💡 Want to step up to an <strong>Editor</strong> role? Complete the application form below.
              </span>
            )}
          </div>
        </div>
      )}

      {/* 3. Application Submission Form */}
      {canShowForm && (
        <form
          onSubmit={handleSubmit}
          style={{
            backgroundColor: 'var(--color-card)',
            padding: '2rem',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--color-border)',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <div style={{ borderBottom: '1px solid var(--color-border)', paddingBottom: '1.25rem', marginBottom: '1.75rem' }}>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 800, margin: '0 0 0.3rem 0', color: 'var(--color-text)' }}>
              {isAuthor ? 'Apply for Editor Role' : 'Contributor Application Form'}
            </h2>
            <p style={{ fontSize: '0.88rem', color: 'var(--color-text-secondary)', margin: 0 }}>
              {isAuthor
                ? 'As a verified Author, you can apply for promotion to Editor to gain full publication review, draft approval, and category management privileges.'
                : 'Tell us about your background, the topics you specialize in, and share samples of your writing.'}
            </p>
          </div>

          {/* Step 1: Role Selection Cards */}
          <div style={{ marginBottom: '1.75rem' }}>
            <label style={{ display: 'block', fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.75rem' }}>
              Select Desired Role *
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem' }}>
              {/* Author Card */}
              <div
                onClick={() => {
                  if (!isAuthor) setRoleApplied('Author');
                }}
                style={{
                  padding: '1.25rem',
                  borderRadius: 'var(--radius-md)',
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
                  transition: 'all 0.2s ease',
                  opacity: isAuthor ? 0.75 : 1,
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
                    ✓ Already Held
                  </span>
                )}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.5rem' }}>
                  <PenTool size={20} color={isAuthor ? '#10B981' : roleApplied === 'Author' ? 'var(--color-secondary)' : 'var(--color-muted)'} />
                  <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 0, color: 'var(--color-text)' }}>Author (Writer)</h3>
                </div>
                <p style={{ fontSize: '0.82rem', color: 'var(--color-text-secondary)', margin: 0, lineHeight: 1.5 }}>
                  Write and draft technical articles, submit stories for review, schedule releases, and manage your author portfolio.
                </p>
              </div>

              {/* Editor Card */}
              <div
                onClick={() => setRoleApplied('Editor')}
                style={{
                  padding: '1.25rem',
                  borderRadius: 'var(--radius-md)',
                  border: `2px solid ${roleApplied === 'Editor' ? 'var(--color-secondary)' : 'var(--color-border)'}`,
                  backgroundColor: roleApplied === 'Editor' ? 'var(--color-surface-alt)' : 'transparent',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  boxShadow: roleApplied === 'Editor' ? '0 0 0 1px var(--color-secondary)' : 'none',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.5rem' }}>
                  <Award size={20} color={roleApplied === 'Editor' ? 'var(--color-secondary)' : 'var(--color-muted)'} />
                  <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 0, color: 'var(--color-text)' }}>
                    Editor (Editorial Desk)
                  </h3>
                </div>
                <p style={{ fontSize: '0.82rem', color: 'var(--color-text-secondary)', margin: 0, lineHeight: 1.5 }}>
                  Review submissions, request changes, direct publish stories, moderate reader discussions, and organize categories.
                </p>
              </div>
            </div>
          </div>

          {/* Applicant Info (Readonly preview) */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
            <div>
              <label style={{ display: 'block', fontWeight: 600, fontSize: '0.82rem', marginBottom: '0.35rem' }}>Applicant Name</label>
              <input type="text" value={user?.name || ''} disabled style={{ width: '100%', padding: '0.6rem 0.8rem', backgroundColor: 'var(--color-surface-alt)', opacity: 0.8 }} />
            </div>
            <div>
              <label style={{ display: 'block', fontWeight: 600, fontSize: '0.82rem', marginBottom: '0.35rem' }}>Email Address</label>
              <input type="email" value={user?.email || ''} disabled style={{ width: '100%', padding: '0.6rem 0.8rem', backgroundColor: 'var(--color-surface-alt)', opacity: 0.8 }} />
            </div>
          </div>

          {/* Bio & Experience */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', fontWeight: 700, fontSize: '0.88rem', marginBottom: '0.4rem' }}>
              Writing Bio & Technical Experience *
            </label>
            <textarea
              rows={3}
              value={bio}
              onChange={e => setBio(e.target.value)}
              placeholder="Tell us about your writing experience, professional domains, or areas of expertise..."
              required
              style={{ width: '100%', padding: '0.65rem 0.85rem', fontSize: '0.88rem', borderRadius: 'var(--radius-sm)' }}
            />
          </div>

          {/* Topics of Specialization */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', fontWeight: 700, fontSize: '0.88rem', marginBottom: '0.5rem' }}>
              Topics You Plan to Cover
            </label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {TOPICS_LIST.map(topic => {
                const selected = selectedTopics.includes(topic);
                return (
                  <button
                    type="button"
                    key={topic}
                    onClick={() => toggleTopic(topic)}
                    style={{
                      padding: '0.4rem 0.85rem',
                      fontSize: '0.82rem',
                      fontWeight: 600,
                      borderRadius: 'var(--radius-full)',
                      border: `1px solid ${selected ? 'var(--color-secondary)' : 'var(--color-border)'}`,
                      backgroundColor: selected ? 'var(--color-secondary)' : 'var(--color-surface-alt)',
                      color: selected ? '#FFFFFF' : 'var(--color-text)',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    {selected ? '✓ ' : '+ '}{topic}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Portfolio & Sample URLs */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', fontWeight: 700, fontSize: '0.88rem', marginBottom: '0.4rem' }}>
              Sample Work / Portfolio / LinkedIn URLs (Optional)
            </label>
            <input
              type="text"
              value={sampleUrls}
              onChange={e => setSampleUrls(e.target.value)}
              placeholder="https://github.com/username, https://medium.com/@yourprofile..."
              style={{ width: '100%', padding: '0.65rem 0.85rem', fontSize: '0.88rem' }}
            />
          </div>

          {/* Motivation */}
          <div style={{ marginBottom: '2rem' }}>
            <label style={{ display: 'block', fontWeight: 700, fontSize: '0.88rem', marginBottom: '0.4rem' }}>
              Why do you want to {roleApplied === 'Editor' ? 'become an Editor' : 'write'} for {siteName}? *
            </label>
            <textarea
              rows={4}
              value={motivation}
              onChange={e => setMotivation(e.target.value)}
              placeholder={
                roleApplied === 'Editor'
                  ? 'Share your experience reviewing technical articles, maintaining editorial standards, or managing publication workflows...'
                  : 'Share your goals, ideas for upcoming articles, or why you would like to contribute...'
              }
              required
              style={{ width: '100%', padding: '0.65rem 0.85rem', fontSize: '0.88rem', borderRadius: 'var(--radius-sm)' }}
            />
          </div>

          {/* Submit Button */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '1rem' }}>
            {reapplyMode && (
              <button
                type="button"
                onClick={() => setReapplyMode(false)}
                style={{
                  padding: '0.7rem 1.25rem',
                  backgroundColor: 'transparent',
                  border: '1px solid var(--color-border)',
                  color: 'var(--color-text)',
                  borderRadius: 'var(--radius-md)',
                  fontWeight: 600,
                  fontSize: '0.88rem',
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
            )}

            <button
              type="submit"
              disabled={submitting}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                backgroundColor: 'var(--color-secondary)',
                color: '#FFFFFF',
                padding: '0.75rem 1.75rem',
                borderRadius: 'var(--radius-md)',
                fontWeight: 700,
                fontSize: '0.92rem',
                boxShadow: '0 4px 14px var(--color-secondary-glow)',
                cursor: submitting ? 'not-allowed' : 'pointer',
                border: 'none',
              }}
            >
              <Send size={16} />
              <span>{submitting ? 'Submitting Application...' : `Submit ${roleApplied} Application`}</span>
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
