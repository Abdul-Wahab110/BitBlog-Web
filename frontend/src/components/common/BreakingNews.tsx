import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useSettings } from '../../context/SettingsContext';

interface BreakingNewsItem {
  title: string;
  slug: string;
}

interface BreakingNewsProps {
  items?: BreakingNewsItem[];
}

export const BreakingNews: React.FC<BreakingNewsProps> = ({ items = [] }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const { settings } = useSettings();
  const siteName = settings.site_name || 'BitBlog';
  const defaultItems = [
    { title: `${siteName} platform releases high-performance digital publishing suite`, slug: 'welcome-to-bitblog' },
  ];

  const newsItems = items.length > 0 ? items : defaultItems;

  const handlePrev = () => {
    setCurrentIndex(prev => (prev === 0 ? newsItems.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex(prev => (prev === newsItems.length - 1 ? 0 : prev + 1));
  };

  const currentItem = newsItems[currentIndex] || newsItems[0];

  return (
    <div
      style={{
        backgroundColor: 'var(--color-cream)',
        borderBottom: '1px solid var(--color-cream-border)',
        padding: '0.45rem 0',
        fontSize: '0.875rem',
      }}
    >
      <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1, minWidth: 0 }}>
          {/* Screenshot-inspired Breaking News Badge */}
          <span
            style={{
              backgroundColor: 'var(--color-secondary)',
              color: '#FFFFFF',
              padding: '0.15rem 0.55rem',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.7rem',
              fontWeight: 800,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.2rem',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              flexShrink: 0,
            }}
          >
            <Zap size={12} fill="#FFFFFF" /> BREAKING &gt;
          </span>

          {/* Headline Ticker */}
          <Link
            to={`/post/${currentItem.slug}`}
            style={{
              fontWeight: 600,
              color: 'var(--color-text)',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {currentItem.title}
          </Link>
        </div>

        {/* Prev / Next Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', flexShrink: 0 }}>
          <button
            onClick={handlePrev}
            aria-label="Previous breaking news"
            style={{
              background: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              padding: '0.15rem 0.35rem',
              borderRadius: 'var(--radius-sm)',
              color: 'var(--color-text)',
            }}
          >
            <ChevronLeft size={14} />
          </button>
          <button
            onClick={handleNext}
            aria-label="Next breaking news"
            style={{
              background: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              padding: '0.15rem 0.35rem',
              borderRadius: 'var(--radius-sm)',
              color: 'var(--color-text)',
            }}
          >
            <ChevronRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};
