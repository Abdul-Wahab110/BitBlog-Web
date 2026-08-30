import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Facebook,
  Linkedin,
  Folder,
  Tag,
  TrendingUp,
  Info,
  ArrowRight,
  Sparkles,
  BookOpen,
  Users,
  Compass,
  Calendar,
  CheckCircle2
} from 'lucide-react';
import { NewsletterForm } from './NewsletterForm';
import { BrandLogo } from './BrandLogo';
import { useSettings } from '../../context/SettingsContext';
import { ApiService } from '../../services/api';

export const Sidebar: React.FC = () => {
  const { settings } = useSettings();
  const [categories, setCategories] = useState<any[]>([]);
  const [tags, setTags] = useState<any[]>([]);
  const [trendingPosts, setTrendingPosts] = useState<any[]>([]);
  const [loadingTrending, setLoadingTrending] = useState<boolean>(true);

  const siteName = settings.site_name || 'BitBlog';
  const siteDescription =
    settings.site_description ||
    'BitBlog is a next-generation digital publishing platform bringing you insightful articles, cutting-edge technology trends, design philosophies, and curated editorial analysis.';

  useEffect(() => {

    ApiService.getCategories()
      .then(res => {
        if (res && res.data) {
          setCategories(res.data.slice(0, 8));
        }
      })
      .catch(() => {});

    ApiService.getTags()
      .then(res => {
        if (res && res.data) {
          setTags(res.data.slice(0, 16));
        }
      })
      .catch(() => {});

    ApiService.getPosts({ limit: 4, sort: 'views' })
      .then(res => {
        if (res && res.data && res.data.length > 0) {
          setTrendingPosts(res.data);
        } else {

          return ApiService.getPosts({ limit: 4 });
        }
      })
      .then(res => {
        if (res && res.data) {
          setTrendingPosts(res.data.slice(0, 4));
        }
      })
      .catch(() => {})
      .finally(() => {
        setLoadingTrending(false);
      });
  }, []);

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '';
    try {
      return new Date(dateStr).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return '';
    }
  };

  return (
    <aside style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', padding: 0, border: 'none', backgroundColor: 'transparent' }}>

      <section
        style={{
          padding: '1.25rem',
          backgroundColor: 'var(--color-card)',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--color-border)',
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        <h3
          style={{
            fontSize: '0.92rem',
            margin: '0 0 1rem 0',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            color: 'var(--color-text)',
            fontWeight: 800,
            lineHeight: 1.2,
          }}
        >
          Follow Our Channels
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem' }}>
          <a
            href={settings.social_facebook || "https://facebook.com"}
            target="_blank"
            rel="noreferrer"
            style={{
              backgroundColor: 'var(--color-social-facebook, #1877F2)',
              color: '#FFF',
              padding: '0.6rem 0.85rem',
              borderRadius: 'var(--radius-sm)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              fontSize: '0.82rem',
              fontWeight: 600,
              textDecoration: 'none',
              transition: 'opacity var(--transition-fast)',
            }}
            onMouseEnter={e => (e.currentTarget.style.opacity = '0.85')}
            onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
          >
            <Facebook size={15} /> Facebook
          </a>

          <a
            href={settings.social_linkedin || "https://linkedin.com"}
            target="_blank"
            rel="noreferrer"
            style={{
              backgroundColor: 'var(--color-social-linkedin, #0A66C2)',
              color: '#FFF',
              padding: '0.6rem 0.85rem',
              borderRadius: 'var(--radius-sm)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              fontSize: '0.82rem',
              fontWeight: 600,
              textDecoration: 'none',
              transition: 'opacity var(--transition-fast)',
            }}
            onMouseEnter={e => (e.currentTarget.style.opacity = '0.85')}
            onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
          >
            <Linkedin size={15} /> LinkedIn
          </a>
        </div>
      </section>

      <section
        style={{
          padding: '1.25rem',
          backgroundColor: 'var(--color-card)',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--color-border)',
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <h3
            style={{
              fontSize: '0.92rem',
              margin: 0,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              fontWeight: 800,
              color: 'var(--color-text)',
            }}
          >
            <TrendingUp size={16} color="var(--color-secondary)" /> Trending Stories
          </h3>
          <Link
            to="/blog"
            style={{
              fontSize: '0.75rem',
              color: 'var(--color-secondary)',
              fontWeight: 600,
              textDecoration: 'none',
            }}
          >
            View All
          </Link>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          {trendingPosts.length > 0 ? (
            trendingPosts.map((post, idx) => {
              const postImg = post.featured_image || post.image_url || post.image;
              const postSlug = post.slug || String(post.id || post.post_id || '');
              const categoryName = post.category_name || post.category?.name || 'Article';

              return (
                <Link
                  key={post.id || post.post_id || idx}
                  to={`/article/${postSlug}`}
                  style={{
                    display: 'flex',
                    gap: '0.75rem',
                    alignItems: 'flex-start',
                    textDecoration: 'none',
                    padding: '0.35rem 0.25rem',
                    borderRadius: 'var(--radius-sm)',
                    transition: 'opacity var(--transition-fast)',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.opacity = '0.8')}
                  onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
                >
                  <div
                    style={{
                      width: '64px',
                      height: '64px',
                      borderRadius: 'var(--radius-sm)',
                      backgroundColor: 'var(--color-surface-alt)',
                      overflow: 'hidden',
                      flexShrink: 0,
                      position: 'relative',
                      border: '1px solid var(--color-border)',
                    }}
                  >
                    {postImg ? (
                      <img
                        src={postImg}
                        alt={post.title}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        onError={(e: any) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    ) : (
                      <div
                        style={{
                          width: '100%',
                          height: '100%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'var(--color-muted)',
                        }}
                      >
                        <BookOpen size={20} />
                      </div>
                    )}
                    <span
                      style={{
                        position: 'absolute',
                        top: 2,
                        left: 2,
                        width: '16px',
                        height: '16px',
                        borderRadius: '4px',
                        backgroundColor: 'rgba(0,0,0,0.7)',
                        color: '#FFF',
                        fontSize: '0.62rem',
                        fontWeight: 800,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      {idx + 1}
                    </span>
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <span
                      style={{
                        fontSize: '0.68rem',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        color: 'var(--color-secondary)',
                        letterSpacing: '0.03em',
                        display: 'block',
                        marginBottom: '0.2rem',
                      }}
                    >
                      {categoryName}
                    </span>
                    <h4
                      style={{
                        fontSize: '0.84rem',
                        fontWeight: 700,
                        lineHeight: 1.3,
                        color: 'var(--color-text)',
                        margin: 0,
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                      }}
                    >
                      {post.title}
                    </h4>
                    {post.created_at && (
                      <span
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.25rem',
                          fontSize: '0.72rem',
                          color: 'var(--color-muted)',
                          marginTop: '0.3rem',
                        }}
                      >
                        <Calendar size={11} /> {formatDate(post.created_at)}
                      </span>
                    )}
                  </div>
                </Link>
              );
            })
          ) : loadingTrending ? (
            <div style={{ padding: '1rem 0', textAlign: 'center', color: 'var(--color-muted)', fontSize: '0.8rem' }}>
              Loading top stories...
            </div>
          ) : (
            <div style={{ padding: '0.5rem 0', color: 'var(--color-muted)', fontSize: '0.82rem' }}>
              Stay tuned for trending articles!
            </div>
          )}
        </div>
      </section>

      <section
        style={{
          padding: '1.5rem',
          backgroundColor: 'var(--color-card)',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--color-border)',
          position: 'relative',
          overflow: 'hidden',
          boxShadow: 'var(--shadow-sm)',
        }}
      >

        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '4px',
            background: 'linear-gradient(90deg, var(--color-secondary), var(--color-accent))',
          }}
        />

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Info size={16} color="var(--color-secondary)" />
            <h3
              style={{
                fontSize: '0.88rem',
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                color: 'var(--color-text)',
                fontWeight: 800,
                margin: 0,
              }}
            >
              About {siteName}
            </h3>
          </div>
          <span
            style={{
              fontSize: '0.7rem',
              fontWeight: 700,
              color: 'var(--color-secondary)',
              backgroundColor: 'var(--color-surface-alt)',
              padding: '0.2rem 0.5rem',
              borderRadius: 'var(--radius-full)',
              border: '1px solid var(--color-border)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.25rem',
            }}
          >
            <Sparkles size={11} /> Journal
          </span>
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <BrandLogo size={32} />
        </div>

        <p
          style={{
            fontSize: '0.86rem',
            lineHeight: 1.6,
            color: 'var(--color-text-secondary)',
            margin: '0 0 1.15rem 0',
          }}
        >
          {siteDescription}
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.25rem', fontSize: '0.8rem', color: 'var(--color-text)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
            <CheckCircle2 size={14} color="var(--color-success, #10B981)" />
            <span>Curated engineering & tech journalism</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
            <CheckCircle2 size={14} color="var(--color-success, #10B981)" />
            <span>Community-driven & verified authors</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
            <CheckCircle2 size={14} color="var(--color-success, #10B981)" />
            <span>Zero trackers & high-speed reading</span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <Link
            to="/about"
            style={{
              flex: 1,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.4rem',
              padding: '0.6rem 0.8rem',
              backgroundColor: 'var(--color-surface-alt)',
              color: 'var(--color-text)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.82rem',
              fontWeight: 700,
              textDecoration: 'none',
              transition: 'all var(--transition-fast)',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.backgroundColor = 'var(--color-secondary)';
              e.currentTarget.style.color = '#FFFFFF';
              e.currentTarget.style.borderColor = 'var(--color-secondary)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.backgroundColor = 'var(--color-surface-alt)';
              e.currentTarget.style.color = 'var(--color-text)';
              e.currentTarget.style.borderColor = 'var(--color-border)';
            }}
          >
            Learn More <ArrowRight size={13} />
          </Link>
          <Link
            to="/contact"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '0.6rem 0.8rem',
              backgroundColor: 'transparent',
              color: 'var(--color-text-secondary)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.82rem',
              fontWeight: 600,
              textDecoration: 'none',
              transition: 'all var(--transition-fast)',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.color = 'var(--color-text)';
              e.currentTarget.style.borderColor = 'var(--color-text-secondary)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.color = 'var(--color-text-secondary)';
              e.currentTarget.style.borderColor = 'var(--color-border)';
            }}
          >
            Contact
          </Link>
        </div>
      </section>

      <section style={{ padding: '1.25rem', backgroundColor: 'var(--color-card)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-sm)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <h3 style={{ fontSize: '0.92rem', margin: 0, textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 800 }}>
            <Folder size={16} color="var(--color-secondary)" /> Categories
          </h3>
          <Link to="/categories" style={{ fontSize: '0.75rem', color: 'var(--color-secondary)', fontWeight: 600, textDecoration: 'none' }}>
            All
          </Link>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {categories.length > 0 ? (
            categories.map(cat => {
              const catImg = cat.image || cat.image_url;
              return (
                <Link
                  key={cat.category_id || cat.id}
                  to={`/category/${cat.slug}`}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    fontSize: '0.86rem',
                    color: 'var(--color-text)',
                    padding: '0.4rem 0.5rem',
                    borderRadius: 'var(--radius-sm)',
                    textDecoration: 'none',
                    transition: 'all var(--transition-fast)',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.backgroundColor = 'var(--color-surface-alt)';
                    e.currentTarget.style.transform = 'translateX(3px)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.transform = 'translateX(0)';
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem', overflow: 'hidden' }}>
                    {catImg ? (
                      <img
                        src={catImg}
                        alt={`${cat.name} thumbnail`}
                        style={{ width: '24px', height: '24px', objectFit: 'cover', borderRadius: '4px', flexShrink: 0 }}
                        onError={(e: any) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    ) : (
                      <div style={{ width: '24px', height: '24px', borderRadius: '4px', backgroundColor: 'var(--color-surface-alt)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-muted)', flexShrink: 0 }}>
                        <Folder size={13} />
                      </div>
                    )}
                    <span style={{ fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {cat.name}
                    </span>
                  </div>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-muted)', backgroundColor: 'var(--color-surface-alt)', padding: '0.15rem 0.45rem', borderRadius: 'var(--radius-full)' }}>
                    {cat.post_count || 0}
                  </span>
                </Link>
              );
            })
          ) : (
            ['Technology', 'Design', 'Business', 'Editorial'].map(c => (
              <Link
                key={c}
                to={`/category/${c.toLowerCase()}`}
                style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--color-text-secondary)', textDecoration: 'none', padding: '0.3rem 0' }}
              >
                <span>{c}</span>
                <span style={{ fontSize: '0.75rem', color: 'var(--color-muted)' }}>0</span>
              </Link>
            ))
          )}
        </div>
      </section>

      <section style={{ padding: '1.25rem', backgroundColor: 'var(--color-card)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-sm)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <h3 style={{ fontSize: '0.92rem', margin: 0, textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 800 }}>
            <Tag size={16} color="var(--color-secondary)" /> Topic Tags
          </h3>
          <Link to="/tags" style={{ fontSize: '0.75rem', color: 'var(--color-secondary)', fontWeight: 600, textDecoration: 'none' }}>
            All
          </Link>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.45rem' }}>
          {tags.length > 0 ? (
            tags.map(t => (
              <Link
                key={t.tag_id || t.id}
                to={`/tag/${t.slug}`}
                style={{
                  backgroundColor: 'var(--color-surface-alt)',
                  border: '1px solid var(--color-border)',
                  padding: '0.25rem 0.6rem',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.76rem',
                  fontWeight: 600,
                  color: 'var(--color-text)',
                  textDecoration: 'none',
                  transition: 'all var(--transition-fast)',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.backgroundColor = 'var(--color-secondary)';
                  e.currentTarget.style.color = '#FFFFFF';
                  e.currentTarget.style.borderColor = 'var(--color-secondary)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.backgroundColor = 'var(--color-surface-alt)';
                  e.currentTarget.style.color = 'var(--color-text)';
                  e.currentTarget.style.borderColor = 'var(--color-border)';
                }}
              >
                #{t.name}
              </Link>
            ))
          ) : (
            ['React', 'TypeScript', 'Node.js', 'AI', 'WebDev', 'Design'].map(tag => (
              <Link
                key={tag}
                to={`/tag/${tag.toLowerCase()}`}
                style={{
                  backgroundColor: 'var(--color-surface-alt)',
                  border: '1px solid var(--color-border)',
                  padding: '0.2rem 0.5rem',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.75rem',
                  color: 'var(--color-text)',
                  textDecoration: 'none',
                }}
              >
                #{tag}
              </Link>
            ))
          )}
        </div>
      </section>

      <section
        style={{
          padding: '1.25rem',
          backgroundColor: 'var(--color-card)',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--color-border)',
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        <h3
          style={{
            fontSize: '0.92rem',
            marginBottom: '0.85rem',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            fontWeight: 800,
            color: 'var(--color-text)',
          }}
        >
          <Compass size={16} color="var(--color-secondary)" /> Discover More
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.84rem' }}>
          <Link
            to="/authors"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0.4rem 0.5rem',
              color: 'var(--color-text)',
              textDecoration: 'none',
              borderRadius: 'var(--radius-sm)',
              transition: 'background-color var(--transition-fast)',
            }}
            onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--color-surface-alt)')}
            onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600 }}>
              <Users size={15} color="var(--color-secondary)" /> Authors Directory
            </span>
            <ArrowRight size={13} color="var(--color-muted)" />
          </Link>

          <Link
            to="/apply"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0.4rem 0.5rem',
              color: 'var(--color-text)',
              textDecoration: 'none',
              borderRadius: 'var(--radius-sm)',
              transition: 'background-color var(--transition-fast)',
            }}
            onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--color-surface-alt)')}
            onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600 }}>
              <Sparkles size={15} color="var(--color-accent)" /> Become a Contributor
            </span>
            <ArrowRight size={13} color="var(--color-muted)" />
          </Link>

          <Link
            to="/search"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0.4rem 0.5rem',
              color: 'var(--color-text)',
              textDecoration: 'none',
              borderRadius: 'var(--radius-sm)',
              transition: 'background-color var(--transition-fast)',
            }}
            onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--color-surface-alt)')}
            onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600 }}>
              <BookOpen size={15} color="var(--color-secondary)" /> Explore All Archives
            </span>
            <ArrowRight size={13} color="var(--color-muted)" />
          </Link>
        </div>
      </section>

      <NewsletterForm />

    </aside>
  );
};

