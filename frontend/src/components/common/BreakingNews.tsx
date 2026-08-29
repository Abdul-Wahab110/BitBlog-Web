import React, { useState, useEffect, useRef } from 'react';
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
  const [isPaused, setIsPaused] = useState(false);
  const { settings } = useSettings();
  const siteName = settings.site_name || 'BitBlog';

  const defaultItems = [
    { title: `${siteName} platform releases high-performance digital publishing suite`, slug: 'welcome-to-bitblog' },
  ];

  const newsItems = items.length > 0 ? items : defaultItems;

  // Auto-advance ticker every 5.5 seconds unless user hovers
  useEffect(() => {
    if (isPaused || newsItems.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex(prev => (prev === newsItems.length - 1 ? 0 : prev + 1));
    }, 5500);

    return () => clearInterval(interval);
  }, [isPaused, newsItems.length]);

  const handlePrev = () => {
    setCurrentIndex(prev => (prev === 0 ? newsItems.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex(prev => (prev === newsItems.length - 1 ? 0 : prev + 1));
  };

  const currentItem = newsItems[currentIndex] || newsItems[0];

  return (
    <div
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      style={{
        backgroundColor: 'var(--color-cream)',
        borderBottom: '1px solid var(--color-cream-border)',
        padding: '0.45rem 0',
        fontSize: '0.86rem',
        transition: 'background-color var(--transition-normal), border-color var(--transition-normal)',
      }}
    >
      <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1, minWidth: 0 }}>
          {/* Animated Glowing Breaking News Badge */}
          <span
            className="ticker-breaking-badge"
            style={{
              background: 'linear-gradient(135deg, var(--color-secondary) 0%, #4F46E5 100%)',
              color: '#FFFFFF',
              padding: '0.2rem 0.65rem',
              borderRadius: 'var(--radius-sm, 4px)',
              fontSize: '0.7rem',
              fontWeight: 800,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.3rem',
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              flexShrink: 0,
              boxShadow: '0 2px 8px var(--color-secondary-glow)',
            }}
          >
            <Zap size={12} fill="#FFFFFF" /> BREAKING &gt;
          </span>

          {/* Animated Headline Ticker Content */}
          <div key={currentIndex} className="ticker-content-animated" style={{ flex: 1, minWidth: 0, overflow: 'hidden' }}>
            <Link
              to={`/post/${currentItem.slug}`}
              className="ticker-headline-link"
              style={{
                fontSize: '0.86rem',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                display: 'block',
              }}
            >
              {currentItem.title}
            </Link>
          </div>
        </div>

        {/* Prev / Next Controls with Animation */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', flexShrink: 0 }}>
          <span
            className="desktop-only"
            style={{
              fontSize: '0.72rem',
              color: 'var(--color-muted)',
              fontWeight: 600,
              marginRight: '0.25rem',
            }}
          >
            {currentIndex + 1}/{newsItems.length}
          </span>

          <button
            onClick={handlePrev}
            aria-label="Previous breaking news"
            className="ticker-nav-btn"
          >
            <ChevronLeft size={14} />
          </button>
          <button
            onClick={handleNext}
            aria-label="Next breaking news"
            className="ticker-nav-btn"
          >
            <ChevronRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};
