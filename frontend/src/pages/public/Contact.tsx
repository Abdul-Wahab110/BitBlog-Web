import React, { useState } from 'react';
import { Send } from 'lucide-react';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';

export const Contact: React.FC = () => {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="container" style={{ padding: '3rem 1rem', maxWidth: '600px' }}>
      <section style={{ padding: '2rem', backgroundColor: 'var(--color-card)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
        <h1 style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>Contact Editorial Team</h1>
        <p style={{ color: 'var(--color-text-secondary)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
          Have a inquiry, news tip, or feedback? Send us a message below.
        </p>

        {submitted ? (
          <div style={{ padding: '1rem', backgroundColor: 'var(--color-cream)', borderRadius: 'var(--radius-md)', color: 'var(--color-primary)' }}>
            Thank you! Your contact message has been recorded.
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <Input label="Your Name" placeholder="John Doe" required />
            <Input label="Email Address" type="email" placeholder="john@example.com" required />
            <Input label="Subject" placeholder="General Inquiry / Feedback" required />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Message</label>
              <textarea
                rows={5}
                required
                placeholder="Write your message here..."
                style={{
                  width: '100%',
                  padding: '0.6rem 0.85rem',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--color-border)',
                  backgroundColor: 'var(--color-background)',
                  color: 'var(--color-text)',
                  fontSize: '0.9rem',
                }}
              />
            </div>
            <Button type="submit" variant="secondary" style={{ marginTop: '0.5rem' }}>
              <Send size={16} /> Send Message
            </Button>
          </form>
        )}
      </section>
    </div>
  );
};
