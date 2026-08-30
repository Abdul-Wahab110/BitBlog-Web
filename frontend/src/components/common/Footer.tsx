import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, CheckCircle2, ArrowRight } from 'lucide-react';
import { ApiService } from '../../services/api';
import { useSettings } from '../../context/SettingsContext';
import { BrandLogo } from './BrandLogo';

export const Footer: React.FC = () => {
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const { settings } = useSettings();

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !email.includes('@')) return;

    setSubmitting(true);
    try {
      const res = await ApiService.subscribeNewsletter(email.trim());
      if (res && res.message) {
        setMsg(res.message);
      } else {
        setMsg('Subscribed to newsletter successfully!');
      }
      setEmail('');
    } catch (err: any) {
      setMsg(err.message || 'Subscription failed.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <footer style={{ backgroundColor: 'var(--color-surface)', borderTop: '1px solid var(--color-border)', padding: '3rem 0 1.5rem', marginTop: 'auto' }}>
      <div className="container" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '2.5rem', marginBottom: '2.5rem' }}>

        <div>
          <BrandLogo size={32} style={{ marginBottom: '0.75rem' }} />
          <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', lineHeight: 1.6, marginBottom: '1rem' }}>
            {settings.site_description || 'An enterprise-grade digital publication platform and content management system powered by Oracle SQL.'}
          </p>
        </div>

        <div>
          <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Publication</h4>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.875rem' }}>
            <li><Link to="/blog" style={{ color: 'var(--color-text-secondary)' }}>All Stories</Link></li>
            <li><Link to="/authors" style={{ color: 'var(--color-text-secondary)' }}>Editorial Team</Link></li>
            <li><Link to="/about" style={{ color: 'var(--color-text-secondary)' }}>About Publication</Link></li>
            <li><Link to="/contact" style={{ color: 'var(--color-text-secondary)' }}>Contact Desk</Link></li>
          </ul>
        </div>

        <div>
          <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Legal & Policies</h4>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.875rem' }}>
            <li><Link to="/privacy-policy" style={{ color: 'var(--color-text-secondary)' }}>Privacy Policy</Link></li>
            <li><Link to="/terms" style={{ color: 'var(--color-text-secondary)' }}>Terms of Service</Link></li>
            <li><Link to="/disclaimer" style={{ color: 'var(--color-text-secondary)' }}>Editorial Disclaimer</Link></li>
          </ul>
        </div>

        <div>
          <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Daily Digest Newsletter</h4>
          <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', marginBottom: '0.85rem' }}>
            Get curated editorial briefings delivered straight to your inbox.
          </p>

          {msg ? (
            <div style={{ fontSize: '0.85rem', color: 'var(--color-success)', display: 'flex', alignItems: 'center', gap: '0.45rem', padding: '0.6rem 0.8rem', backgroundColor: 'rgba(16, 185, 129, 0.1)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
              <CheckCircle2 size={16} /> {msg}
            </div>
          ) : (
            <form onSubmit={handleSubscribe} className="footer-newsletter-form">
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="reader@email.com"
                required
                className="footer-email-input"
              />
              <button
                type="submit"
                disabled={submitting}
                className="footer-subscribe-btn"
              >
                <span>{submitting ? 'Subscribing...' : 'Subscribe'}</span>
                <ArrowRight size={16} className="btn-arrow-icon" />
              </button>
            </form>
          )}
        </div>
      </div>

      <div className="container" style={{ borderTop: '1px solid var(--color-border)', paddingTop: '1.25rem', textAlign: 'center', fontSize: '0.8rem', color: 'var(--color-muted)' }}>
        {settings.footer_text || `© ${new Date().getFullYear()} ${settings.site_name || 'BitBlog'}. All rights reserved.`}
      </div>
    </footer>
  );
};

