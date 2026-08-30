import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Clock, Eye, ArrowRight, BookOpen } from 'lucide-react';
import { CategoryBadge } from './CategoryBadge';
import { UserAvatar } from './UserAvatar';
import { useSettings } from '../../context/SettingsContext';

export interface ArticleCardProps {
  id?: number;
  post_id?: number;
  title: string;
  slug: string;
  excerpt?: string;
  coverImage?: string;
  featured_image?: string;
  image?: string;
  categoryName?: string;
  category_name?: string;
  categorySlug?: string;
  category_slug?: string;
  categoryColor?: string;
  category_color?: string;
  authorName?: string;
  author_name?: string;
  authorAvatar?: string;
  author_avatar?: string;
  authorRole?: string;
  author_role?: string;
  publishedAt?: string;
  published_at?: string;
  created_at?: string;
  readingTimeMinutes?: number;
  reading_time?: number;
  viewsCount?: number;
  views_count?: number;
  variant?: 'standard' | 'horizontal' | 'compact' | 'featured';
  className?: string;
}

const ArticleCardComponent: React.FC<ArticleCardProps> = (props) => {
  const [isHovered, setIsHovered] = useState(false);
  const [imgError, setImgError] = useState(false);
  const { settings } = useSettings();
  const siteName = settings.site_name || 'BitBlog';

  const title = props.title || 'Untitled Article';
  const slug = props.slug || '';
  const rawExcerpt = props.excerpt || '';
  const excerpt = rawExcerpt.replace(/<[^>]+>/g, '').trim();

  // Normalize cover image with fallback gradients
  const coverImage = props.featured_image || props.coverImage || props.image;
  const categoryName = props.category_name || props.categoryName || 'General';
  const categorySlug = props.category_slug || props.categorySlug || 'general';
  const categoryColor = props.category_color || props.categoryColor;
  const authorName = props.author_name || props.authorName || `${siteName} Team`;

  const rawDate = props.published_at || props.publishedAt || props.created_at;
  const formattedDate = rawDate
    ? new Date(rawDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
    : 'Recent';

  const readingTime = props.reading_time || props.readingTimeMinutes || 3;
  const views = props.views_count !== undefined ? props.views_count : props.viewsCount;

  return (
    <article
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        backgroundColor: 'var(--color-card)',
        borderRadius: 'var(--radius-lg)',
        border: `1px solid ${isHovered ? 'var(--color-secondary)' : 'var(--color-border)'}`,
        overflow: 'hidden',
        boxShadow: isHovered
          ? '0 14px 28px -4px var(--color-shadow), 0 0 0 1px var(--color-secondary-glow)'
          : 'var(--shadow-sm)',
        transform: isHovered ? 'translateY(-6px)' : 'translateY(0)',
        transition: 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.3s ease, border-color 0.3s ease',
      }}
    >
      {/* Cover Image Container */}
      <Link
        to={`/post/${slug}`}
        style={{
          position: 'relative',
          width: '100%',
          aspectRatio: '16 / 10',
          minHeight: '185px',
          maxHeight: '210px',
          overflow: 'hidden',
          backgroundColor: 'var(--color-surface-alt)',
          display: 'block',
        }}
        tabIndex={-1}
      >
        {coverImage && !imgError ? (
          <>
            <img
              src={coverImage}
              alt={title}
              loading="lazy"
              onError={() => setImgError(true)}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                objectPosition: 'center',
                transform: isHovered ? 'scale(1.06)' : 'scale(1)',
                transition: 'transform 0.45s cubic-bezier(0.16, 1, 0.3, 1)',
                display: 'block',
              }}
            />
            {/* Subtle bottom shadow overlay to guarantee badge readability */}
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background: 'linear-gradient(to top, rgba(0, 0, 0, 0.45) 0%, rgba(0, 0, 0, 0.05) 50%, transparent 100%)',
                pointerEvents: 'none',
              }}
            />
          </>
        ) : (
          /* High-aesthetic gradient fallback cover if image is not supplied */
          <div
            style={{
              width: '100%',
              height: '100%',
              background: 'linear-gradient(135deg, #1E1B4B 0%, #312E81 50%, #4338CA 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'rgba(255, 255, 255, 0.7)',
              position: 'relative',
            }}
          >
            <div
              style={{
                position: 'absolute',
                inset: 0,
                backgroundImage: 'radial-gradient(circle at 80% 20%, rgba(255,255,255,0.15) 0%, transparent 60%)',
              }}
            />
            <BookOpen size={36} color="rgba(255, 255, 255, 0.5)" style={{ transform: isHovered ? 'scale(1.1)' : 'scale(1)', transition: 'transform 0.3s ease' }} />
          </div>
        )}

        {/* Category Overlay Tag */}
        <div
          style={{
            position: 'absolute',
            top: '12px',
            left: '12px',
            zIndex: 2,
          }}
          onClick={e => e.stopPropagation()}
        >
          <CategoryBadge name={categoryName} slug={categorySlug} colorHex={categoryColor} />
        </div>

        {/* Reading Time Pill Overlay */}
        <div
          style={{
            position: 'absolute',
            bottom: '10px',
            right: '12px',
            zIndex: 2,
            backgroundColor: 'rgba(0, 0, 0, 0.65)',
            backdropFilter: 'blur(6px)',
            color: '#FFFFFF',
            fontSize: '0.72rem',
            fontWeight: 600,
            padding: '0.2rem 0.55rem',
            borderRadius: 'var(--radius-full)',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.25rem',
          }}
        >
          <Clock size={11} /> {readingTime} min read
        </div>
      </Link>

      {/* Card Content Body */}
      <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
        {/* Article Headline with 2-line clamp */}
        <h3
          style={{
            fontSize: '1.1rem',
            fontWeight: 700,
            lineHeight: 1.35,
            marginBottom: '0.5rem',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            minHeight: '2.7rem',
          }}
        >
          <Link
            to={`/post/${slug}`}
            style={{
              color: isHovered ? 'var(--color-secondary)' : 'var(--color-text)',
              transition: 'color var(--transition-fast)',
              textDecoration: 'none',
            }}
          >
            {title}
          </Link>
        </h3>

        {/* Excerpt with strictly capped 2-line clamp for clean compact height */}
        <p
          style={{
            fontSize: '0.86rem',
            color: 'var(--color-text-secondary)',
            lineHeight: 1.5,
            marginBottom: '1rem',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            minHeight: '2.6rem',
          }}
        >
          {excerpt || 'Read this in-depth editorial story on BitBlog.'}
        </p>

        {/* Read More Action Button */}
        <div style={{ marginBottom: '0.85rem' }}>
          <Link
            to={`/post/${slug}`}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              fontSize: '0.82rem',
              fontWeight: 700,
              color: 'var(--color-secondary)',
              textDecoration: 'none',
              transition: 'gap var(--transition-fast)',
            }}
          >
            <span>Read Story</span>
            <ArrowRight
              size={14}
              style={{
                transform: isHovered ? 'translateX(4px)' : 'translateX(0)',
                transition: 'transform var(--transition-fast)',
              }}
            />
          </Link>
        </div>

        {/* Card Footer (Author & Published Date) */}
        <footer
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '0.76rem',
            color: 'var(--color-muted)',
            borderTop: '1px solid var(--color-border)',
            paddingTop: '0.75rem',
            marginTop: 'auto',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
            <UserAvatar
              src={props.author_avatar || props.authorAvatar}
              name={authorName}
              size={20}
              border={false}
            />
            <span style={{ fontWeight: 600, color: 'var(--color-text-secondary)' }}>{authorName}</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <span>{formattedDate}</span>
            {views !== undefined && views > 0 && (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.2rem' }}>
                <Eye size={12} /> {views}
              </span>
            )}
          </div>
        </footer>
      </div>
    </article>
  );
};

export const ArticleCard = React.memo(ArticleCardComponent);

