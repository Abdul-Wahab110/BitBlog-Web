import React, { useState } from 'react';
import { Mail, CheckCircle, Sparkles, Loader2, User, AlertCircle, ShieldCheck } from 'lucide-react';
import { ApiService } from '../../services/api';
import { useSettings } from '../../context/SettingsContext';

const AVAILABLE_TOPICS = [
  'Technology & AI',
  'Web Development',
  'Design & UX',
  'Startups & Business',
  'Weekly Digest',
];

interface NewsletterFormProps {
  variant?: 'card' | 'banner' | 'compact';
  title?: string;
  description?: string;
  className?: string;
}

export const NewsletterForm: React.FC<NewsletterFormProps> = ({
  variant = 'card',
  title,
  description,
  className = '',
}) => {
  const { settings } = useSettings();
  const siteName = settings.site_name || 'BitBlog';
  const effectiveTitle = title || `Stay Ahead with ${siteName} Digest`;
  const effectiveDescription = description || 'Receive curated tech insights, deep-dive articles, and engineering analysis directly in your inbox. No spam, ever.';
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [selectedTopics, setSelectedTopics] = useState<string[]>(['Technology & AI', 'Weekly Digest']);
  const [showPreferences, setShowPreferences] = useState(false);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const toggleTopic = (topic: string) => {
    setSelectedTopics(prev =>
      prev.includes(topic) ? prev.filter(t => t !== topic) : [...prev, topic]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !email.includes('@')) {
      setFeedback({ type: 'error', message: 'Please provide a valid email address.' });
      return;
    }

    setLoading(true);
    setFeedback(null);

    try {
      const res = await ApiService.subscribeNewsletter({
        email: email.trim(),
        name: name.trim() || undefined,
        topics: selectedTopics,
      });

      setFeedback({
        type: 'success',
        message: res.message || 'Thank you for subscribing! Check your inbox for updates.',
      });
      setEmail('');
      setName('');
    } catch (err: any) {
      setFeedback({
        type: 'error',
        message: err.message || 'Unable to subscribe right now. Please try again later.',
      });
    } finally {
      setLoading(false);
    }
  };

  if (variant === 'banner') {
    return (
      <div
        className={`newsletter-banner ${className}`}
        style={{
          background: 'linear-gradient(135deg, var(--color-surface), var(--color-surface-alt))',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-xl)',
          padding: '2.5rem 2rem',
          boxShadow: 'var(--shadow-md)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div style={{ maxWidth: '640px', margin: '0 auto', textAlign: 'center' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.3rem 0.8rem',
              borderRadius: 'var(--radius-full)',
              backgroundColor: 'rgba(59, 130, 246, 0.1)',
              color: 'var(--color-secondary)',
              fontSize: '0.78rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              marginBottom: '0.75rem',
            }}
          >
            <Sparkles size={14} /> Newsletter Subscription
          </div>

          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.5rem', fontFamily: 'var(--font-heading)' }}>
            {effectiveTitle}
          </h2>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.95rem', lineHeight: 1.6, marginBottom: '1.5rem' }}>
            {effectiveDescription}
          </p>

          {feedback && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                padding: '0.75rem 1rem',
                borderRadius: 'var(--radius-md)',
                marginBottom: '1rem',
                fontSize: '0.875rem',
                fontWeight: 600,
                backgroundColor: feedback.type === 'success' ? 'rgba(16, 185, 129, 0.12)' : 'rgba(239, 68, 68, 0.12)',
                color: feedback.type === 'success' ? 'var(--color-success)' : 'var(--color-danger)',
                border: `1px solid ${feedback.type === 'success' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
              }}
            >
              {feedback.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
              <span>{feedback.message}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.75rem' }}>
              <div style={{ position: 'relative' }}>
                <User size={16} color="var(--color-muted)" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Your Name (Optional)"
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem 0.75rem 2.5rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--color-border)',
                    backgroundColor: 'var(--color-background)',
                    fontSize: '0.9rem',
                  }}
                />
              </div>

              <div style={{ position: 'relative' }}>
                <Mail size={16} color="var(--color-muted)" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="Your email address (Required)"
                  required
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem 0.75rem 2.5rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--color-border)',
                    backgroundColor: 'var(--color-background)',
                    fontSize: '0.9rem',
                  }}
                />
              </div>
            </div>

            {/* Topic preference badges */}
            <div style={{ textAlign: 'left', marginTop: '0.5rem' }}>
              <button
                type="button"
                onClick={() => setShowPreferences(!showPreferences)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--color-secondary)',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  padding: 0,
                  marginBottom: '0.5rem',
                }}
              >
                {showPreferences ? '▾ Hide Topics of Interest' : '▸ Select Topics of Interest (Optional)'}
              </button>

              {showPreferences && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginTop: '0.25rem' }}>
                  {AVAILABLE_TOPICS.map(topic => {
                    const isSelected = selectedTopics.includes(topic);
                    return (
                      <button
                        key={topic}
                        type="button"
                        onClick={() => toggleTopic(topic)}
                        style={{
                          padding: '0.25rem 0.65rem',
                          borderRadius: 'var(--radius-full)',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                          border: `1px solid ${isSelected ? 'var(--color-secondary)' : 'var(--color-border)'}`,
                          backgroundColor: isSelected ? 'var(--color-secondary)' : 'var(--color-surface)',
                          color: isSelected ? '#FFFFFF' : 'var(--color-text-secondary)',
                          transition: 'all var(--transition-fast)',
                        }}
                      >
                        {isSelected ? '✓ ' : '+ '}{topic}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                backgroundColor: 'var(--color-secondary)',
                color: '#FFFFFF',
                padding: '0.75rem 1.5rem',
                borderRadius: 'var(--radius-md)',
                fontWeight: 700,
                fontSize: '0.95rem',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                boxShadow: '0 4px 12px var(--color-secondary-glow)',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.7 : 1,
              }}
            >
              {loading ? <Loader2 size={18} className="spin" /> : <Mail size={18} />}
              {loading ? 'Subscribing...' : 'Subscribe to Newsletter'}
            </button>
          </form>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', marginTop: '0.85rem', color: 'var(--color-muted)', fontSize: '0.75rem' }}>
            <ShieldCheck size={14} /> Respecting your privacy. Unsubscribe anytime in 1-click.
          </div>
        </div>
      </div>
    );
  }

  // Default 'card' style for Sidebars and standard blocks
  return (
    <div
      className={`newsletter-card ${className}`}
      style={{
        backgroundColor: 'var(--color-card)',
        padding: '1.5rem',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--color-border)',
        boxShadow: 'var(--shadow-sm)',
        transition: 'all var(--transition-normal)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
        <div
          style={{
            width: '32px',
            height: '32px',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'rgba(59, 130, 246, 0.12)',
            color: 'var(--color-secondary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Mail size={18} />
        </div>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0, color: 'var(--color-text)' }}>
          {effectiveTitle}
        </h3>
      </div>

      <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', lineHeight: 1.5, marginBottom: '1rem' }}>
        {effectiveDescription}
      </p>

      {feedback && (
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '0.4rem',
            padding: '0.6rem 0.8rem',
            borderRadius: 'var(--radius-sm)',
            marginBottom: '0.85rem',
            fontSize: '0.82rem',
            fontWeight: 600,
            backgroundColor: feedback.type === 'success' ? 'rgba(16, 185, 129, 0.12)' : 'rgba(239, 68, 68, 0.12)',
            color: feedback.type === 'success' ? 'var(--color-success)' : 'var(--color-danger)',
            border: `1px solid ${feedback.type === 'success' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
          }}
        >
          {feedback.type === 'success' ? <CheckCircle size={16} style={{ flexShrink: 0, marginTop: '2px' }} /> : <AlertCircle size={16} style={{ flexShrink: 0, marginTop: '2px' }} />}
          <span>{feedback.message}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
        <div>
          <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--color-text-secondary)', display: 'block', marginBottom: '0.25rem' }}>
            Full Name (Optional)
          </label>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="e.g. Alex Johnson"
            style={{
              width: '100%',
              padding: '0.55rem 0.75rem',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--color-border)',
              backgroundColor: 'var(--color-background)',
              color: 'var(--color-text)',
              fontSize: '0.85rem',
            }}
          />
        </div>

        <div>
          <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--color-text-secondary)', display: 'block', marginBottom: '0.25rem' }}>
            Email Address <span style={{ color: 'var(--color-danger)' }}>*</span>
          </label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="name@company.com"
            required
            style={{
              width: '100%',
              padding: '0.55rem 0.75rem',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--color-border)',
              backgroundColor: 'var(--color-background)',
              color: 'var(--color-text)',
              fontSize: '0.85rem',
            }}
          />
        </div>

        {/* Topic tags toggle */}
        <div style={{ marginTop: '0.2rem' }}>
          <button
            type="button"
            onClick={() => setShowPreferences(!showPreferences)}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--color-secondary)',
              fontSize: '0.76rem',
              fontWeight: 600,
              cursor: 'pointer',
              padding: 0,
              display: 'flex',
              alignItems: 'center',
              gap: '0.25rem',
            }}
          >
            {showPreferences ? '▾ Custom Topics' : '▸ Choose Topics (Optional)'}
          </button>

          {showPreferences && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', marginTop: '0.4rem' }}>
              {AVAILABLE_TOPICS.map(topic => {
                const isSelected = selectedTopics.includes(topic);
                return (
                  <button
                    key={topic}
                    type="button"
                    onClick={() => toggleTopic(topic)}
                    style={{
                      padding: '0.2rem 0.5rem',
                      borderRadius: 'var(--radius-full)',
                      fontSize: '0.7rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      border: `1px solid ${isSelected ? 'var(--color-secondary)' : 'var(--color-border)'}`,
                      backgroundColor: isSelected ? 'var(--color-secondary)' : 'var(--color-surface)',
                      color: isSelected ? '#FFFFFF' : 'var(--color-text-secondary)',
                      transition: 'all var(--transition-fast)',
                    }}
                  >
                    {isSelected ? '✓ ' : ''}{topic}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{
            backgroundColor: 'var(--color-secondary)',
            color: '#FFFFFF',
            padding: '0.65rem 1rem',
            borderRadius: 'var(--radius-md)',
            fontWeight: 700,
            fontSize: '0.875rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            marginTop: '0.4rem',
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.7 : 1,
            transition: 'all var(--transition-fast)',
          }}
        >
          {loading ? <Loader2 size={16} className="spin" /> : <Mail size={16} />}
          {loading ? 'Subscribing...' : 'Join Newsletter'}
        </button>
      </form>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginTop: '0.75rem', color: 'var(--color-muted)', fontSize: '0.72rem' }}>
        <ShieldCheck size={12} /> Instant unsubscribe link in every email.
      </div>
    </div>
  );
};

