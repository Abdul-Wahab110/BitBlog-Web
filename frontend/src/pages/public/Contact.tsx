import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Mail,
  Send,
  CheckCircle2,
  AlertCircle,
  Clock,
  ShieldCheck,
  Globe,
  Sparkles,
  MessageSquare,
  Building2,
  FileText,
  User,
  HelpCircle,
  ChevronDown,
  ArrowRight,
  ExternalLink,
  Lock,
} from 'lucide-react';
import { SeoHead } from '../../components/common/SeoHead';
import { useSettings } from '../../context/SettingsContext';

export const Contact: React.FC = () => {
  const [department, setDepartment] = useState<'pitch' | 'general' | 'partnership' | 'correction'>('pitch');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const { settings } = useSettings();
  const siteName = settings.site_name || 'BitBlog';

  const departments = [
    { id: 'pitch', label: 'Story Pitch / Tip', icon: Sparkles, defaultSubject: 'Editorial Story Pitch / Tip' },
    { id: 'general', label: 'General Inquiry', icon: MessageSquare, defaultSubject: 'General Editorial Inquiry' },
    { id: 'partnership', label: 'Partnership & Ads', icon: Building2, defaultSubject: 'Brand Partnership / Sponsorship Inquiry' },
    { id: 'correction', label: 'Correction / Press', icon: ShieldCheck, defaultSubject: 'Editorial Correction / Press Release' },
  ];

  const handleDepartmentChange = (deptId: 'pitch' | 'general' | 'partnership' | 'correction') => {
    setDepartment(deptId);
    const selected = departments.find(d => d.id === deptId);
    if (selected && (!subject || departments.some(d => d.defaultSubject === subject))) {
      setSubject(selected.defaultSubject);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) {
      setErrorMsg('Please fill out all required fields (Name, Email, and Message).');
      return;
    }

    if (message.trim().length < 10) {
      setErrorMsg('Your message must be at least 10 characters long.');
      return;
    }

    setSubmitting(true);
    setErrorMsg(null);

    const fullSubject = subject.trim() || departments.find(d => d.id === department)?.defaultSubject || 'General Inquiry';

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          subject: fullSubject,
          message: message.trim(),
        }),
      }).then(r => r.json());

      if (res && res.success) {
        setSuccessMsg(res.message || 'Thank you! Your message has been safely delivered to our editorial desk.');
        setName('');
        setEmail('');
        setSubject('');
        setMessage('');
      } else {
        throw new Error(res.message || 'Failed to submit message.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to dispatch message to editorial team. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const faqs = [
    {
      q: 'How do I pitch a story or apply as a contributing writer?',
      a: 'We welcome original tech journalism, deep-dives, and tutorials! You can apply directly through our Contributor Program portal or use this form under "Story Pitch".',
    },
    {
      q: 'What is the standard editorial response time?',
      a: 'Our editors review incoming tips and inquiries Monday through Friday. Standard responses are delivered within 24 business hours.',
    },
    {
      q: 'Can I submit an anonymous news tip or confidential whistleblower material?',
      a: 'Yes. All news tips submitted through our editorial desk are handled with strict journalistic confidentiality under our source protection guidelines.',
    },
  ];

  return (
    <div
      style={{
        width: '100%',
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '2rem 1.25rem 4rem 1.25rem',
        boxSizing: 'border-box',
      }}
    >
      <SeoHead
        title={`Contact Editorial Desk | ${siteName}`}
        description={`Get in touch with the ${siteName} editorial desk, pitch stories, or send publication inquiries.`}
      />

      {/* Hero Header Section */}
      <header
        style={{
          textAlign: 'center',
          maxWidth: '760px',
          margin: '0 auto 2.5rem auto',
          padding: '0 0.5rem',
        }}
      >
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.45rem',
            padding: '0.3rem 0.85rem',
            backgroundColor: 'rgba(99, 102, 241, 0.12)',
            color: 'var(--color-secondary)',
            borderRadius: 'var(--radius-full)',
            fontSize: '0.78rem',
            fontWeight: 700,
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
            marginBottom: '1rem',
            border: '1px solid rgba(99, 102, 241, 0.25)',
          }}
        >
          <Mail size={14} /> Editorial & Newsroom Desk
        </div>

        <h1
          style={{
            fontSize: 'clamp(1.8rem, 3.5vw, 2.5rem)',
            fontWeight: 800,
            marginBottom: '0.75rem',
            fontFamily: 'var(--font-heading)',
            lineHeight: 1.25,
          }}
        >
          Get in Touch with {siteName} Editorial
        </h1>

        <p
          style={{
            fontSize: 'clamp(0.9rem, 1.8vw, 1.05rem)',
            color: 'var(--color-text-secondary)',
            lineHeight: 1.6,
            margin: '0 auto 1.5rem auto',
          }}
        >
          Have a breaking news tip, pitch, correction, partnership inquiry, or technical feedback?
          Reach our journalism and editorial team directly.
        </p>

        {/* Quick Editorial Guarantees */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '1.25rem',
            flexWrap: 'wrap',
            fontSize: '0.8rem',
            color: 'var(--color-muted)',
            fontWeight: 600,
          }}
        >
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
            <Clock size={14} color="var(--color-secondary)" /> Response under 24 hours
          </span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
            <Lock size={14} color="var(--color-success)" /> Confidential Source Protection
          </span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
            <Globe size={14} color="var(--color-accent)" /> Global Tech Coverage
          </span>
        </div>
      </header>

      {/* Main 2-Column Responsive Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 340px), 1fr))',
          gap: '2rem',
          alignItems: 'start',
        }}
      >
        {/* Left Column: Interactive Contact Form Card */}
        <div
          style={{
            backgroundColor: 'var(--color-card)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-lg)',
            padding: 'clamp(1.25rem, 3vw, 2rem)',
            boxShadow: 'var(--shadow-md)',
            boxSizing: 'border-box',
          }}
        >
          <div style={{ marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.35rem' }}>
              Send an Editorial Inquiry
            </h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', margin: 0 }}>
              Select your inquiry type so we can route your message to the appropriate editor.
            </p>
          </div>

          {/* Department Selection Pills */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', fontWeight: 600, fontSize: '0.82rem', color: 'var(--color-text)', marginBottom: '0.5rem' }}>
              Inquiry Department
            </label>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
                gap: '0.5rem',
              }}
            >
              {departments.map(dept => {
                const isSelected = department === dept.id;
                const Icon = dept.icon;
                return (
                  <button
                    key={dept.id}
                    type="button"
                    onClick={() => handleDepartmentChange(dept.id as any)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                      padding: '0.55rem 0.75rem',
                      backgroundColor: isSelected ? 'rgba(99, 102, 241, 0.15)' : 'var(--color-surface-alt)',
                      color: isSelected ? 'var(--color-secondary)' : 'var(--color-text)',
                      border: isSelected ? '1px solid var(--color-secondary)' : '1px solid var(--color-border)',
                      borderRadius: 'var(--radius-md)',
                      fontSize: '0.8rem',
                      fontWeight: isSelected ? 700 : 500,
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                      textAlign: 'left',
                      boxSizing: 'border-box',
                    }}
                  >
                    <Icon size={14} style={{ flexShrink: 0 }} />
                    <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{dept.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {successMsg ? (
            <div
              style={{
                backgroundColor: 'rgba(16, 185, 129, 0.12)',
                border: '1px solid var(--color-success)',
                padding: '2rem 1.5rem',
                borderRadius: 'var(--radius-md)',
                textAlign: 'center',
                color: 'var(--color-success)',
              }}
            >
              <CheckCircle2 size={42} style={{ margin: '0 auto 0.75rem auto' }} />
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '0.4rem', color: 'var(--color-text)' }}>
                Message Successfully Delivered!
              </h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)', marginBottom: '1.25rem', lineHeight: 1.5 }}>
                {successMsg} Our team will respond directly to your email address.
              </p>
              <button
                type="button"
                onClick={() => setSuccessMsg(null)}
                style={{
                  padding: '0.55rem 1.25rem',
                  backgroundColor: 'var(--color-surface)',
                  color: 'var(--color-text)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-md)',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                }}
              >
                Send Another Message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.15rem' }}>
              {errorMsg && (
                <div
                  role="alert"
                  style={{
                    padding: '0.75rem 1rem',
                    backgroundColor: 'rgba(239, 68, 68, 0.12)',
                    border: '1px solid var(--color-danger)',
                    borderRadius: 'var(--radius-md)',
                    color: 'var(--color-danger)',
                    fontSize: '0.85rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                  }}
                >
                  <AlertCircle size={16} style={{ flexShrink: 0 }} />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Name & Email Row */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))',
                  gap: '1rem',
                }}
              >
                <div>
                  <label htmlFor="contact-name" style={{ display: 'block', fontWeight: 600, marginBottom: '0.35rem', fontSize: '0.84rem' }}>
                    Your Full Name *
                  </label>
                  <div style={{ position: 'relative' }}>
                    <User size={15} color="var(--color-muted)" style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)' }} />
                    <input
                      id="contact-name"
                      type="text"
                      value={name}
                      onChange={e => setName(e.target.value)}
                      required
                      placeholder="e.g. Alex Morgan"
                      style={{
                        width: '100%',
                        padding: '0.65rem 0.85rem 0.65rem 2.4rem',
                        fontSize: '0.88rem',
                        boxSizing: 'border-box',
                      }}
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="contact-email" style={{ display: 'block', fontWeight: 600, marginBottom: '0.35rem', fontSize: '0.84rem' }}>
                    Email Address *
                  </label>
                  <div style={{ position: 'relative' }}>
                    <Mail size={15} color="var(--color-muted)" style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)' }} />
                    <input
                      id="contact-email"
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      required
                      placeholder="e.g. alex@example.com"
                      style={{
                        width: '100%',
                        padding: '0.65rem 0.85rem 0.65rem 2.4rem',
                        fontSize: '0.88rem',
                        boxSizing: 'border-box',
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Subject */}
              <div>
                <label htmlFor="contact-subject" style={{ display: 'block', fontWeight: 600, marginBottom: '0.35rem', fontSize: '0.84rem' }}>
                  Subject Line
                </label>
                <div style={{ position: 'relative' }}>
                  <FileText size={15} color="var(--color-muted)" style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)' }} />
                  <input
                    id="contact-subject"
                    type="text"
                    value={subject}
                    onChange={e => setSubject(e.target.value)}
                    placeholder="Brief headline or topic of your inquiry..."
                    style={{
                      width: '100%',
                      padding: '0.65rem 0.85rem 0.65rem 2.4rem',
                      fontSize: '0.88rem',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>
              </div>

              {/* Message */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                  <label htmlFor="contact-message" style={{ fontWeight: 600, fontSize: '0.84rem' }}>
                    Inquiry Message *
                  </label>
                  <span style={{ fontSize: '0.72rem', color: 'var(--color-muted)' }}>
                    {message.length} characters
                  </span>
                </div>
                <textarea
                  id="contact-message"
                  rows={6}
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  required
                  placeholder="Provide background context, sources, pitches, or specific questions..."
                  style={{
                    width: '100%',
                    padding: '0.75rem 0.85rem',
                    fontSize: '0.88rem',
                    lineHeight: 1.5,
                    resize: 'vertical',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              {/* Submit Button */}
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
                  fontSize: '0.92rem',
                  cursor: submitting ? 'not-allowed' : 'pointer',
                  boxShadow: '0 2px 10px var(--color-secondary-glow)',
                  transition: 'all 0.15s ease',
                  minHeight: '44px',
                }}
              >
                <Send size={16} /> {submitting ? 'Dispatching to Editorial Desk...' : 'Send Message to Newsroom'}
              </button>
            </form>
          )}
        </div>

        {/* Right Column: Direct Newsroom Channels & FAQ */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Direct Editorial Email Channels Card */}
          <div
            style={{
              backgroundColor: 'var(--color-card)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-lg)',
              padding: '1.5rem',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
              <Mail size={18} color="var(--color-secondary)" /> Direct Newsroom Desks
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <div style={{ padding: '0.75rem', backgroundColor: 'var(--color-surface-alt)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-accent)', textTransform: 'uppercase', marginBottom: '0.15rem' }}>
                  News Tips & Pitches
                </div>
                <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--color-text)' }}>
                  {settings.contact_email || 'editorial@bitblog.com'}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--color-muted)', marginTop: '0.2rem' }}>
                  Monitored 24/7 for breaking technology stories.
                </div>
              </div>

              <div style={{ padding: '0.75rem', backgroundColor: 'var(--color-surface-alt)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-secondary)', textTransform: 'uppercase', marginBottom: '0.15rem' }}>
                  Partnerships & Sponsorships
                </div>
                <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--color-text)' }}>
                  partners@bitblog.com
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--color-muted)', marginTop: '0.2rem' }}>
                  For brand collaborations, media kits, and newsletter ads.
                </div>
              </div>

              <div style={{ padding: '0.75rem', backgroundColor: 'var(--color-surface-alt)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-success)', textTransform: 'uppercase', marginBottom: '0.15rem' }}>
                  Corrections & Legal
                </div>
                <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--color-text)' }}>
                  press@bitblog.com
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--color-muted)', marginTop: '0.2rem' }}>
                  Formal press releases, DMCA, and factual corrections.
                </div>
              </div>
            </div>
          </div>

          {/* Become a Contributor Banner */}
          <div
            style={{
              padding: '1.25rem 1.5rem',
              backgroundColor: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(236, 72, 153, 0.08))',
              border: '1px solid rgba(99, 102, 241, 0.25)',
              borderRadius: 'var(--radius-lg)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '1rem',
              flexWrap: 'wrap',
            }}
          >
            <div>
              <div style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--color-text)', marginBottom: '0.2rem' }}>
                Want to Write for BitBlog?
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>
                Publish your insights to thousands of tech readers worldwide.
              </div>
            </div>
            <Link
              to="/apply"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                padding: '0.5rem 1rem',
                backgroundColor: 'var(--color-secondary)',
                color: '#FFFFFF',
                borderRadius: 'var(--radius-md)',
                fontWeight: 700,
                fontSize: '0.82rem',
                textDecoration: 'none',
                boxShadow: '0 2px 6px var(--color-secondary-glow)',
                whiteSpace: 'nowrap',
              }}
            >
              Apply as Author <ArrowRight size={14} />
            </Link>
          </div>

          {/* Frequently Asked Questions */}
          <div
            style={{
              backgroundColor: 'var(--color-card)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-lg)',
              padding: '1.5rem',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
              <HelpCircle size={18} color="var(--color-secondary)" /> Editorial FAQ
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              {faqs.map((faq, idx) => {
                const isOpen = openFaq === idx;
                return (
                  <div
                    key={idx}
                    style={{
                      border: '1px solid var(--color-border)',
                      borderRadius: 'var(--radius-md)',
                      overflow: 'hidden',
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => setOpenFaq(isOpen ? null : idx)}
                      style={{
                        width: '100%',
                        padding: '0.75rem 1rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '0.5rem',
                        backgroundColor: 'var(--color-surface-alt)',
                        border: 'none',
                        color: 'var(--color-text)',
                        fontSize: '0.85rem',
                        fontWeight: 600,
                        textAlign: 'left',
                        cursor: 'pointer',
                      }}
                    >
                      <span>{faq.q}</span>
                      <ChevronDown size={15} style={{ transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', flexShrink: 0 }} />
                    </button>
                    {isOpen && (
                      <div style={{ padding: '0.85rem 1rem', fontSize: '0.82rem', color: 'var(--color-text-secondary)', lineHeight: 1.5, backgroundColor: 'var(--color-card)' }}>
                        {faq.a}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};


