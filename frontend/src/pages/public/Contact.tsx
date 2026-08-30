import React, { useState } from 'react';
import { Mail, Send, CheckCircle2, AlertCircle } from 'lucide-react';
import { SeoHead } from '../../components/common/SeoHead';
import { useSettings } from '../../context/SettingsContext';

export const Contact: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const { settings } = useSettings();
  const siteName = settings.site_name || 'BitBlog';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) {
      setErrorMsg('Please fill out all required fields.');
      return;
    }

    setSubmitting(true);
    setErrorMsg(null);

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          subject: subject.trim() || 'General Inquiry',
          message: message.trim(),
        }),
      }).then(r => r.json());

      if (res && res.success) {
        setSuccessMsg(res.message || 'Thank you! Your inquiry has been sent to our editorial desk.');
        setName('');
        setEmail('');
        setSubject('');
        setMessage('');
      } else {
        throw new Error(res.message || 'Failed to submit message.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to submit message. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="container" style={{ padding: '3rem 1rem', maxWidth: '680px' }}>
      <SeoHead
        title={`Contact Editorial Desk | ${siteName}`}
        description={`Get in touch with the ${siteName} editorial desk, pitch stories, or send publication inquiries.`}
      />

      <header style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
        <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'rgba(99, 102, 241, 0.15)', color: 'var(--color-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
          <Mail size={24} />
        </div>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.5rem', fontFamily: 'var(--font-heading)' }}>
          Contact Editorial Desk
        </h1>
        <p style={{ fontSize: '0.95rem', color: 'var(--color-text-secondary)' }}>
          Have an inquiry, news tip, or feedback? Send our editorial team a message below.
        </p>
      </header>

      {successMsg ? (
        <div style={{ backgroundColor: 'rgba(16, 185, 129, 0.12)', border: '1px solid var(--color-success)', padding: '1.75rem', borderRadius: 'var(--radius-md)', textAlign: 'center', color: 'var(--color-success)' }}>
          <CheckCircle2 size={36} style={{ marginBottom: '0.5rem' }} />
          <h3 style={{ fontSize: '1.2rem', marginBottom: '0.25rem', fontWeight: 700 }}>Message Received</h3>
          <p style={{ fontSize: '0.9rem', margin: 0 }}>{successMsg}</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} style={{ backgroundColor: 'var(--color-card)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', padding: '2rem', boxShadow: 'var(--shadow-sm)' }}>
          {errorMsg && (
            <div style={{ padding: '0.75rem 1rem', backgroundColor: 'rgba(239, 68, 68, 0.12)', border: '1px solid var(--color-danger)', borderRadius: 'var(--radius-sm)', color: 'var(--color-danger)', marginBottom: '1.25rem', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <AlertCircle size={16} />
              <span>{errorMsg}</span>
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 240px), 1fr))', gap: '1rem', marginBottom: '1.25rem' }}>
            <div>
              <label htmlFor="contact-name" style={{ display: 'block', fontWeight: 600, marginBottom: '0.35rem', fontSize: '0.85rem' }}>Your Full Name *</label>
              <input id="contact-name" type="text" value={name} onChange={e => setName(e.target.value)} required placeholder="Jane Doe" style={{ width: '100%', padding: '0.6rem 0.85rem', fontSize: '0.9rem' }} />
            </div>

            <div>
              <label htmlFor="contact-email" style={{ display: 'block', fontWeight: 600, marginBottom: '0.35rem', fontSize: '0.85rem' }}>Email Address *</label>
              <input id="contact-email" type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="jane@example.com" style={{ width: '100%', padding: '0.6rem 0.85rem', fontSize: '0.9rem' }} />
            </div>
          </div>

          <div style={{ marginBottom: '1.25rem' }}>
            <label htmlFor="contact-subject" style={{ display: 'block', fontWeight: 600, marginBottom: '0.35rem', fontSize: '0.85rem' }}>Subject</label>
            <input id="contact-subject" type="text" value={subject} onChange={e => setSubject(e.target.value)} placeholder="General Inquiry / Story Pitch" style={{ width: '100%', padding: '0.6rem 0.85rem', fontSize: '0.9rem' }} />
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label htmlFor="contact-message" style={{ display: 'block', fontWeight: 600, marginBottom: '0.35rem', fontSize: '0.85rem' }}>Message *</label>
            <textarea id="contact-message" rows={5} value={message} onChange={e => setMessage(e.target.value)} required placeholder="Write your message or inquiry here..." style={{ width: '100%', padding: '0.6rem 0.85rem', fontSize: '0.9rem' }} />
          </div>

          <button
            type="submit"
            disabled={submitting}
            style={{
              width: '100%',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              padding: '0.75rem 1.5rem',
              backgroundColor: 'var(--color-secondary)',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: 'var(--radius-md)',
              fontWeight: 700,
              fontSize: '0.95rem',
              cursor: submitting ? 'not-allowed' : 'pointer',
              boxShadow: '0 2px 8px var(--color-secondary-glow)',
            }}
          >
            <Send size={16} /> {submitting ? 'Sending Message...' : 'Send Message'}
          </button>
        </form>
      )}
    </main>
  );
};

