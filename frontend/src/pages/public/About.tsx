import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  BookOpen,
  Users,
  ShieldCheck,
  Zap,
  Sparkles,
  Feather,
  CheckCircle2,
  ArrowRight,
  Cpu,
  Mail,
} from 'lucide-react';
import { useSettings } from '../../context/SettingsContext';
import { SeoHead } from '../../components/common/SeoHead';
import { BrandLogo } from '../../components/common/BrandLogo';
import { UserAvatar } from '../../components/common/UserAvatar';
import { ApiService } from '../../services/api';

export const About: React.FC = () => {
  const { settings } = useSettings();
  const siteName = settings.site_name || 'BitBlog';
  const siteDescription =
    settings.site_description ||
    'BitBlog is a next-generation digital publishing platform engineered for insightful stories, cutting-edge technology trends, design philosophies, and curated editorial analysis.';

  const [authors, setAuthors] = useState<any[]>([]);
  const [stats, setStats] = useState({
    articlesCount: 120,
    authorsCount: 12,
    categoriesCount: 8,
  });

  useEffect(() => {

    ApiService.getAuthors()
      .then((res: any) => {
        if (res && res.data && Array.isArray(res.data) && res.data.length > 0) {
          setAuthors(res.data.slice(0, 6));
          setStats(prev => ({
            ...prev,
            authorsCount: Math.max(res.data.length, prev.authorsCount),
          }));
        }
      })
      .catch(() => {});

    Promise.all([
      ApiService.getPosts({ limit: 1 }).catch(() => null),
      ApiService.getCategories().catch(() => null),
    ]).then(([postsRes, catsRes]) => {
      if (postsRes && postsRes.data) {
        setStats(prev => ({
          ...prev,
          articlesCount: postsRes.pagination?.total || 14,
        }));
      }
      if (catsRes && catsRes.data) {
        setStats(prev => ({
          ...prev,
          categoriesCount: catsRes.data.length || 8,
        }));
      }
    });
  }, []);

  const corePillars = [
    {
      icon: Feather,
      title: 'Editorial Integrity & Depth',
      description:
        'We prioritize substantial, well-researched journalism over fast clickbait. Every article undergoes editorial review for accuracy, clarity, and genuine reader value.',
      color: 'var(--color-secondary, #6366F1)',
    },
    {
      icon: Cpu,
      title: 'Technology & Digital Culture',
      description:
        'From machine intelligence and distributed systems to modern web architectures, we break down complex computational trends into actionable, engaging narratives.',
      color: 'var(--color-accent, #EC4899)',
    },
    {
      icon: Zap,
      title: 'Zero-Distraction Experience',
      description:
        'Engineered with lightning-fast load times, clutter-free reading typography, full responsive layouts, and zero invasive third-party tracking cookies.',
      color: '#10B981',
    },
    {
      icon: Users,
      title: 'Community-Driven Authorship',
      description:
        'We empower developers, engineers, thought leaders, and independent journalists with a modern publishing workflow and transparent editorial standards.',
      color: '#F59E0B',
    },
  ];

  const milestones = [
    {
      year: '2024',
      title: 'The Foundation',
      description:
        'Conceived as an independent digital journal focused on pure technology storytelling, clean design systems, and author empowerment.',
    },
    {
      year: '2025',
      title: 'Community & Scalability',
      description:
        'Introduced multi-author role hierarchies, categorized editorial beats, real-time reader engagement, and verified contributor badges.',
    },
    {
      year: '2026',
      title: 'Global Readership & Beyond',
      description:
        'Scaling into a premier digital hub with enhanced AEO/SEO indexing, dark-mode-first aesthetics, and next-generation publication tooling.',
    },
  ];

  return (
    <div style={{ backgroundColor: 'var(--color-background)', minHeight: '100vh', paddingBottom: '5rem' }}>
      <SeoHead
        title={"About " + siteName + " | Digital Journal & Editorial Platform"}
        description={siteDescription}
      />

      <section
        style={{
          position: 'relative',
          padding: '4rem 1rem 3.5rem 1rem',
          background: 'linear-gradient(180deg, var(--color-surface) 0%, var(--color-background) 100%)',
          borderBottom: '1px solid var(--color-border)',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: '-20%',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '600px',
            height: '350px',
            background: 'radial-gradient(ellipse at center, var(--color-secondary-glow, rgba(99,102,241,0.15)) 0%, transparent 70%)',
            pointerEvents: 'none',
          }}
        />

        <div className="container" style={{ maxWidth: '1000px', textAlign: 'center', position: 'relative', zIndex: 2 }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              backgroundColor: 'var(--color-surface-alt)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-full)',
              padding: '0.4rem 1rem',
              fontSize: '0.82rem',
              fontWeight: 700,
              color: 'var(--color-secondary)',
              marginBottom: '1.5rem',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            <Sparkles size={14} /> Pioneering the Next Era of Digital Journalism
          </div>

          <div style={{ marginBottom: '1.25rem' }}>
            <BrandLogo size={44} showText={true} textSuffix="Editorial" style={{ justifyContent: 'center' }} />
          </div>

          <h1
            style={{
              fontSize: 'clamp(2rem, 4.5vw, 3.25rem)',
              fontWeight: 900,
              lineHeight: 1.18,
              letterSpacing: '-0.03em',
              color: 'var(--color-text)',
              marginBottom: '1.25rem',
              fontFamily: 'var(--font-heading)',
            }}
          >
            Empowering Curious Minds Through{' '}
            <span
              style={{
                background: 'linear-gradient(135deg, var(--color-secondary), var(--color-accent))',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              High-Impact Stories
            </span>
          </h1>

          <p
            style={{
              fontSize: 'clamp(1rem, 1.8vw, 1.18rem)',
              lineHeight: 1.75,
              color: 'var(--color-text-secondary)',
              maxWidth: '820px',
              margin: '0 auto 2.25rem auto',
            }}
          >
            {siteDescription}
          </p>

          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '0.85rem',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Link
              to="/blog"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                backgroundColor: 'var(--color-secondary)',
                color: '#FFFFFF',
                padding: '0.8rem 1.6rem',
                borderRadius: 'var(--radius-md)',
                fontWeight: 700,
                fontSize: '0.92rem',
                textDecoration: 'none',
                boxShadow: '0 4px 14px var(--color-secondary-glow, rgba(99,102,241,0.4))',
                transition: 'transform var(--transition-fast)',
              }}
              onMouseEnter={e => (e.currentTarget.style.transform = 'translateY(-2px)')}
              onMouseLeave={e => (e.currentTarget.style.transform = 'translateY(0)')}
            >
              <BookOpen size={17} /> Explore Stories <ArrowRight size={15} />
            </Link>

            <Link
              to="/authors"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                backgroundColor: 'var(--color-card)',
                color: 'var(--color-text)',
                border: '1px solid var(--color-border)',
                padding: '0.8rem 1.4rem',
                borderRadius: 'var(--radius-md)',
                fontWeight: 700,
                fontSize: '0.92rem',
                textDecoration: 'none',
                transition: 'all var(--transition-fast)',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.backgroundColor = 'var(--color-surface-alt)';
                e.currentTarget.style.borderColor = 'var(--color-secondary)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.backgroundColor = 'var(--color-card)';
                e.currentTarget.style.borderColor = 'var(--color-border)';
              }}
            >
              <Users size={17} /> Meet Our Authors
            </Link>

            <Link
              to="/apply"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                backgroundColor: 'transparent',
                color: 'var(--color-text-secondary)',
                border: '1px dashed var(--color-border)',
                padding: '0.8rem 1.25rem',
                borderRadius: 'var(--radius-md)',
                fontWeight: 600,
                fontSize: '0.92rem',
                textDecoration: 'none',
                transition: 'color var(--transition-fast)',
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
              <Feather size={16} /> Become a Contributor
            </Link>
          </div>
        </div>
      </section>

      <section style={{ transform: 'translateY(-1.5rem)', padding: '0 1rem', marginBottom: '2rem' }}>
        <div className="container" style={{ maxWidth: '1000px' }}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '1rem',
              backgroundColor: 'var(--color-card)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-lg)',
              padding: '1.75rem 1.5rem',
              boxShadow: 'var(--shadow-md)',
            }}
          >
            <div style={{ textAlign: 'center', borderRight: '1px solid var(--color-border)' }}>
              <span
                style={{
                  fontSize: '2rem',
                  fontWeight: 900,
                  fontFamily: 'var(--font-heading)',
                  color: 'var(--color-secondary)',
                  display: 'block',
                  lineHeight: 1.1,
                }}
              >
                {stats.articlesCount}+
              </span>
              <span style={{ fontSize: '0.84rem', fontWeight: 600, color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Published Stories
              </span>
            </div>

            <div style={{ textAlign: 'center', borderRight: '1px solid var(--color-border)' }}>
              <span
                style={{
                  fontSize: '2rem',
                  fontWeight: 900,
                  fontFamily: 'var(--font-heading)',
                  color: 'var(--color-accent)',
                  display: 'block',
                  lineHeight: 1.1,
                }}
              >
                {stats.authorsCount}
              </span>
              <span style={{ fontSize: '0.84rem', fontWeight: 600, color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Verified Authors
              </span>
            </div>

            <div style={{ textAlign: 'center', borderRight: '1px solid var(--color-border)' }}>
              <span
                style={{
                  fontSize: '2rem',
                  fontWeight: 900,
                  fontFamily: 'var(--font-heading)',
                  color: '#10B981',
                  display: 'block',
                  lineHeight: 1.1,
                }}
              >
                {stats.categoriesCount}
              </span>
              <span style={{ fontSize: '0.84rem', fontWeight: 600, color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Topic Channels
              </span>
            </div>

            <div style={{ textAlign: 'center' }}>
              <span
                style={{
                  fontSize: '2rem',
                  fontWeight: 900,
                  fontFamily: 'var(--font-heading)',
                  color: '#F59E0B',
                  display: 'block',
                  lineHeight: 1.1,
                }}
              >
                100%
              </span>
              <span style={{ fontSize: '0.84rem', fontWeight: 600, color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Independent & Ad-Free
              </span>
            </div>
          </div>
        </div>
      </section>

      <section className="container" style={{ maxWidth: '1000px', paddingTop: '2rem', paddingBottom: '3.5rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <span
            style={{
              fontSize: '0.8rem',
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              color: 'var(--color-secondary)',
              display: 'block',
              marginBottom: '0.4rem',
            }}
          >
            Editorial Principles
          </span>
          <h2
            style={{
              fontSize: 'clamp(1.6rem, 3vw, 2.2rem)',
              fontWeight: 800,
              letterSpacing: '-0.02em',
              color: 'var(--color-text)',
              margin: 0,
              fontFamily: 'var(--font-heading)',
            }}
          >
            Why We Built {siteName}
          </h2>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '1.25rem',
          }}
        >
          {corePillars.map((pillar, idx) => {
            const Icon = pillar.icon;
            return (
              <div
                key={idx}
                style={{
                  padding: '1.75rem',
                  backgroundColor: 'var(--color-card)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-lg)',
                  boxShadow: 'var(--shadow-sm)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.85rem',
                  transition: 'transform var(--transition-fast), border-color var(--transition-fast)',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = 'translateY(-3px)';
                  e.currentTarget.style.borderColor = pillar.color;
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.borderColor = 'var(--color-border)';
                }}
              >
                <div
                  style={{
                    width: '46px',
                    height: '46px',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'var(--color-surface-alt)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: pillar.color,
                    border: '1px solid var(--color-border)',
                  }}
                >
                  <Icon size={22} />
                </div>
                <h3
                  style={{
                    fontSize: '1.12rem',
                    fontWeight: 800,
                    margin: 0,
                    color: 'var(--color-text)',
                    fontFamily: 'var(--font-heading)',
                  }}
                >
                  {pillar.title}
                </h3>
                <p
                  style={{
                    fontSize: '0.88rem',
                    lineHeight: 1.65,
                    color: 'var(--color-text-secondary)',
                    margin: 0,
                  }}
                >
                  {pillar.description}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      <section
        style={{
          backgroundColor: 'var(--color-surface)',
          padding: '4rem 1rem',
          borderTop: '1px solid var(--color-border)',
          borderBottom: '1px solid var(--color-border)',
        }}
      >
        <div className="container" style={{ maxWidth: '900px' }}>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <span
              style={{
                fontSize: '0.8rem',
                fontWeight: 800,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                color: 'var(--color-secondary)',
                display: 'block',
                marginBottom: '0.4rem',
              }}
            >
              The Evolution
            </span>
            <h2
              style={{
                fontSize: 'clamp(1.6rem, 3vw, 2.2rem)',
                fontWeight: 800,
                color: 'var(--color-text)',
                margin: '0 0 0.75rem 0',
                fontFamily: 'var(--font-heading)',
              }}
            >
              Our Journey & Milestones
            </h2>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.95rem', maxWidth: '650px', margin: '0 auto' }}>
              How {siteName} evolved from an ambitious concept into a recognized digital publishing platform.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', position: 'relative' }}>
            {milestones.map((item, idx) => (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  gap: '1.5rem',
                  alignItems: 'flex-start',
                  backgroundColor: 'var(--color-card)',
                  padding: '1.5rem',
                  borderRadius: 'var(--radius-lg)',
                  border: '1px solid var(--color-border)',
                  boxShadow: 'var(--shadow-sm)',
                }}
              >
                <div
                  style={{
                    backgroundColor: 'var(--color-secondary)',
                    color: '#FFFFFF',
                    fontWeight: 900,
                    fontSize: '0.92rem',
                    padding: '0.4rem 0.85rem',
                    borderRadius: 'var(--radius-sm)',
                    fontFamily: 'var(--font-heading)',
                    flexShrink: 0,
                    boxShadow: '0 2px 8px var(--color-secondary-glow, rgba(99,102,241,0.3))',
                  }}
                >
                  {item.year}
                </div>
                <div style={{ flex: 1 }}>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--color-text)', margin: '0 0 0.4rem 0' }}>
                    {item.title}
                  </h3>
                  <p style={{ fontSize: '0.88rem', lineHeight: 1.6, color: 'var(--color-text-secondary)', margin: 0 }}>
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {authors.length > 0 && (
        <section className="container" style={{ maxWidth: '1000px', paddingTop: '4rem', paddingBottom: '3rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2.5rem' }}>
            <div>
              <span
                style={{
                  fontSize: '0.8rem',
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  color: 'var(--color-secondary)',
                  display: 'block',
                  marginBottom: '0.4rem',
                }}
              >
                The Voices Behind BitBlog
              </span>
              <h2
                style={{
                  fontSize: 'clamp(1.6rem, 3vw, 2.2rem)',
                  fontWeight: 800,
                  color: 'var(--color-text)',
                  margin: 0,
                  fontFamily: 'var(--font-heading)',
                }}
              >
                Featured Authors & Editors
              </h2>
            </div>

            <Link
              to="/authors"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                fontSize: '0.88rem',
                fontWeight: 700,
                color: 'var(--color-secondary)',
                textDecoration: 'none',
              }}
            >
              View Directory <ArrowRight size={14} />
            </Link>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '1.25rem',
            }}
          >
            {authors.map(author => (
              <Link
                key={author.user_id || author.id}
                to={"/authors/" + (author.username || author.user_id)}
                style={{
                  padding: '1.5rem',
                  backgroundColor: 'var(--color-card)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-lg)',
                  textDecoration: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  transition: 'all var(--transition-fast)',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = 'translateY(-3px)';
                  e.currentTarget.style.borderColor = 'var(--color-secondary)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.borderColor = 'var(--color-border)';
                }}
              >
                <UserAvatar
                  name={author.name}
                  src={author.profile_image}
                  size={52}
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.2rem' }}>
                    <h3
                      style={{
                        fontSize: '1rem',
                        fontWeight: 800,
                        color: 'var(--color-text)',
                        margin: 0,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {author.name}
                    </h3>
                  </div>
                  <span
                    style={{
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      color: 'var(--color-secondary)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.04em',
                      display: 'block',
                      marginBottom: '0.4rem',
                    }}
                  >
                    {author.role || 'Staff Author'}
                  </span>
                  <p
                    style={{
                      fontSize: '0.8rem',
                      color: 'var(--color-text-secondary)',
                      margin: 0,
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                      lineHeight: 1.4,
                    }}
                  >
                    {author.bio || 'Contributing insights on engineering, modern technology, and design.'}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="container" style={{ maxWidth: '1000px', paddingTop: '1.5rem', paddingBottom: '3.5rem' }}>
        <div
          style={{
            padding: '2.5rem 2rem',
            backgroundColor: 'var(--color-card)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-xl, 16px)',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '4px',
              background: 'linear-gradient(90deg, var(--color-secondary), var(--color-accent), #10B981)',
            }}
          />

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1rem' }}>
            <ShieldCheck size={22} color="var(--color-secondary)" />
            <h2
              style={{
                fontSize: '1.35rem',
                fontWeight: 800,
                color: 'var(--color-text)',
                margin: 0,
                fontFamily: 'var(--font-heading)',
              }}
            >
              Our Editorial Standards & Publishing Ethics
            </h2>
          </div>

          <p style={{ color: 'var(--color-text-secondary)', lineHeight: 1.7, fontSize: '0.92rem', marginBottom: '1.5rem' }}>
            At {siteName}, every article is curated with strict guidelines for factual precision, technical depth, and clear attribution. We believe readers deserve transparent journalism free of manipulative clickbait.
          </p>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
              gap: '1rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.6rem' }}>
              <CheckCircle2 size={18} color="#10B981" style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <strong style={{ fontSize: '0.88rem', color: 'var(--color-text)', display: 'block' }}>
                  Peer & Editorial Review
                </strong>
                <span style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
                  Submissions pass rigorous checks by certified staff editors before going live.
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.6rem' }}>
              <CheckCircle2 size={18} color="#10B981" style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <strong style={{ fontSize: '0.88rem', color: 'var(--color-text)', display: 'block' }}>
                  Verified Authorship
                </strong>
                <span style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
                  Author profiles include authentic bios, verified credentials, and real portfolios.
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.6rem' }}>
              <CheckCircle2 size={18} color="#10B981" style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <strong style={{ fontSize: '0.88rem', color: 'var(--color-text)', display: 'block' }}>
                  Clear Corrections & Updates
                </strong>
                <span style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
                  Any post modifications are timestamped with full transparency for our readers.
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="container" style={{ maxWidth: '1000px' }}>
        <div
          style={{
            padding: '3rem 2rem',
            background: 'linear-gradient(135deg, var(--color-surface-alt) 0%, var(--color-card) 100%)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-xl, 16px)',
            textAlign: 'center',
            boxShadow: 'var(--shadow-md)',
          }}
        >
          <h2
            style={{
              fontSize: 'clamp(1.5rem, 3vw, 2rem)',
              fontWeight: 900,
              color: 'var(--color-text)',
              marginBottom: '0.75rem',
              fontFamily: 'var(--font-heading)',
            }}
          >
            Have a Story or Expertise to Share?
          </h2>
          <p
            style={{
              color: 'var(--color-text-secondary)',
              fontSize: '0.95rem',
              maxWidth: '600px',
              margin: '0 auto 1.75rem auto',
              lineHeight: 1.6,
            }}
          >
            Join {siteName}&apos;s verified contributor network. Reach passionate readers across technology, design, and modern digital craft.
          </p>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', justifyContent: 'center' }}>
            <Link
              to="/apply"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.45rem',
                backgroundColor: 'var(--color-secondary)',
                color: '#FFFFFF',
                padding: '0.75rem 1.5rem',
                borderRadius: 'var(--radius-md)',
                fontWeight: 700,
                fontSize: '0.9rem',
                textDecoration: 'none',
                boxShadow: '0 4px 12px var(--color-secondary-glow, rgba(99,102,241,0.35))',
              }}
            >
              Apply as Contributor <ArrowRight size={15} />
            </Link>

            <Link
              to="/contact"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.45rem',
                backgroundColor: 'var(--color-surface)',
                color: 'var(--color-text)',
                border: '1px solid var(--color-border)',
                padding: '0.75rem 1.4rem',
                borderRadius: 'var(--radius-md)',
                fontWeight: 600,
                fontSize: '0.9rem',
                textDecoration: 'none',
              }}
            >
              <Mail size={15} /> Contact Editorial Desk
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

