import React from 'react';
import { X, Clock, User, Calendar, Tag as TagIcon } from 'lucide-react';
import { sanitizeHtml } from '../../utils/sanitize';

interface ArticlePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  excerpt?: string;
  content: string;
  featuredImage?: string;
  categoryName?: string;
  status?: string;
}

export const ArticlePreviewModal: React.FC<ArticlePreviewModalProps> = ({
  isOpen,
  onClose,
  title,
  excerpt,
  content,
  featuredImage,
  categoryName = 'General',
  status = 'draft',
}) => {
  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'var(--color-overlay)',
        zIndex: 300,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.5rem',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '850px',
          maxHeight: '90vh',
          backgroundColor: 'var(--color-surface)',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-lg)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        {/* Modal Header */}
        <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', backgroundColor: 'var(--color-secondary)', color: '#FFF', padding: '0.2rem 0.6rem', borderRadius: '4px' }}>
              PREVIEW MODE ({status.toUpperCase()})
            </span>
            <span style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>How your article will look on the public website</span>
          </div>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--color-text)' }}>
            <X size={20} />
          </button>
        </div>

        {/* Modal Body Preview Content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '2rem' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            {categoryName}
          </span>
          <h1 style={{ fontSize: '2rem', marginTop: '0.5rem', marginBottom: '1rem', lineHeight: 1.3 }}>
            {title || 'Untitled Article'}
          </h1>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '0.85rem', color: 'var(--color-text-secondary)', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><User size={14} /> Editorial Author</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><Calendar size={14} /> {new Date().toLocaleDateString()}</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><Clock size={14} /> Preview</span>
          </div>

          {featuredImage && (
            <img
              src={featuredImage}
              alt="Featured cover"
              style={{ width: '100%', maxHeight: '380px', objectFit: 'cover', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem' }}
            />
          )}

          {excerpt && (
            <div style={{ fontSize: '1.1rem', fontStyle: 'italic', color: 'var(--color-text-secondary)', marginBottom: '1.5rem', paddingLeft: '1rem', borderLeft: '4px solid var(--color-secondary)' }}>
              {excerpt}
            </div>
          )}

          <div
            dangerouslySetInnerHTML={{ __html: sanitizeHtml(content || '<p style="color:var(--color-muted);">No article content entered yet.</p>') }}
            style={{ fontSize: '1.05rem', lineHeight: 1.8 }}
          />
        </div>

        {/* Modal Footer */}
        <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid var(--color-border)', display: 'flex', justifyContent: 'flex-end' }}>
          <button onClick={onClose} style={{ backgroundColor: 'var(--color-secondary)', color: '#FFF', padding: '0.5rem 1.25rem', borderRadius: 'var(--radius-sm)', border: 'none', cursor: 'pointer', fontWeight: 600 }}>
            Close Preview
          </button>
        </div>
      </div>
    </div>
  );
};
