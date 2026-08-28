import React from 'react';
import { Link } from 'react-router-dom';
import { Clock } from 'lucide-react';
import { CategoryBadge } from './CategoryBadge';
import { EmptyState } from './EmptyState';

export interface FeaturedArticleItem {
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
  publishedAt?: string;
  published_at?: string;
  created_at?: string;
  readingTimeMinutes?: number;
  reading_time?: number;
  viewsCount?: number;
  views_count?: number;
}

interface FeaturedGridProps {
  articles?: FeaturedArticleItem[];
}

export const FeaturedGrid: React.FC<FeaturedGridProps> = ({ articles = [] }) => {
  if (articles.length === 0) {
    return (
      <EmptyState
        title="No Featured Articles Available"
        description="Articles marked as featured in the database will populate this grid automatically."
      />
    );
  }

  const normalize = (art: FeaturedArticleItem) => ({
    id: art.post_id || art.id || 0,
    title: art.title || 'Featured Story',
    slug: art.slug || '',
    coverImage: art.featured_image || art.coverImage || art.image,
    categoryName: art.category_name || art.categoryName || 'Featured',
    categorySlug: art.category_slug || art.categorySlug || 'featured',
    categoryColor: art.category_color || art.categoryColor,
    authorName: art.author_name || art.authorName || 'Editor',
    publishedAt: art.published_at || art.publishedAt || art.created_at
      ? new Date(art.published_at || art.publishedAt || art.created_at || '').toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
      : 'Recently',
    readingTime: art.reading_time || art.readingTimeMinutes || 4,
  });

  const mainArticle = normalize(articles[0]);
  const subArticles = articles.slice(1, 5).map(normalize);

  return (
    <section style={{ padding: '0 0 1.5rem 0' }}>
      <div className="featured-grid-container">
        {/* Main Hero Featured Article Card */}
        {mainArticle && (
          <article
            style={{
              position: 'relative',
              minHeight: '380px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'flex-end',
              padding: '1.5rem',
              backgroundImage: mainArticle.coverImage
                ? `linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.3) 60%, rgba(0,0,0,0.1) 100%), url(${mainArticle.coverImage})`
                : 'linear-gradient(135deg, #1E1B4B 0%, #312E81 50%, #4338CA 100%)',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              color: '#FFFFFF',
              borderRadius: 'var(--radius-lg)',
              overflow: 'hidden',
              boxShadow: 'var(--shadow-md)',
              transition: 'transform 0.3s ease, box-shadow 0.3s ease',
            }}
          >
            <div style={{ marginBottom: '0.5rem', zIndex: 2 }}>
              <CategoryBadge name={mainArticle.categoryName} slug={mainArticle.categorySlug} colorHex={mainArticle.categoryColor} />
            </div>

            <h2 style={{ fontSize: '1.6rem', color: '#FFFFFF', marginBottom: '0.5rem', lineHeight: 1.3, zIndex: 2 }}>
              <Link to={`/post/${mainArticle.slug}`} style={{ color: '#FFFFFF', textDecoration: 'none' }}>
                {mainArticle.title}
              </Link>
            </h2>

            <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.85)', display: 'flex', gap: '0.75rem', flexWrap: 'wrap', zIndex: 2 }}>
              <span>By {mainArticle.authorName}</span>
              <span>•</span>
              <span>{mainArticle.publishedAt}</span>
              {mainArticle.readingTime && (
                <>
                  <span>•</span>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.2rem' }}>
                    <Clock size={12} /> {mainArticle.readingTime} min read
                  </span>
                </>
              )}
            </div>
          </article>
        )}

        {/* 4 Sub-Featured Cards (2x2 Grid) */}
        <div className="featured-grid-sub">
          {subArticles.map(art => (
            <article
              key={art.id || art.slug}
              style={{
                position: 'relative',
                minHeight: '185px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'flex-end',
                padding: '1.25rem',
                backgroundImage: art.coverImage
                  ? `linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.25) 100%), url(${art.coverImage})`
                  : 'linear-gradient(135deg, #1E293B, #0F172A)',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                color: '#FFFFFF',
                borderRadius: 'var(--radius-lg)',
                overflow: 'hidden',
                boxShadow: 'var(--shadow-sm)',
                transition: 'transform 0.3s ease',
              }}
            >
              <h3 style={{ fontSize: '1.05rem', color: '#FFFFFF', margin: 0, lineHeight: 1.35, zIndex: 2 }}>
                <Link to={`/post/${art.slug}`} style={{ color: '#FFFFFF', textDecoration: 'none' }}>
                  {art.title}
                </Link>
              </h3>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

