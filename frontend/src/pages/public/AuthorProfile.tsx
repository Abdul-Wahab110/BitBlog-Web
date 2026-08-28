import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  User,
  FileText,
  Calendar,
  Eye,
  Globe,
  Twitter,
  Github,
  Linkedin,
  Facebook,
  Instagram,
  Youtube,
  Tag,
  ArrowLeft,
  Share2,
  Check,
} from 'lucide-react';
import { ArticleGrid } from '../../components/common/ArticleGrid';
import { LoadingState } from '../../components/common/LoadingState';
import { Sidebar } from '../../components/common/Sidebar';
import { UserAvatar } from '../../components/common/UserAvatar';
import { SeoHead } from '../../components/common/SeoHead';
import { ApiService } from '../../services/api';
import { useSettings } from '../../context/SettingsContext';

export const AuthorProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [author, setAuthor] = useState<any>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const { settings } = useSettings();
  const siteName = settings.site_name || 'BitBlog';

  useEffect(() => {
    if (!id) return;
    setLoading(true);

    const loadAuthorAndPosts = async () => {
      try {
        // 1. Fetch Author Profile
        let authorData: any = null;
        try {
          const res = await ApiService.getAuthorById(id);
          if (res && res.data) authorData = res.data;
        } catch {}

        if (!authorData) {
          try {
            const adminAuthorsRes = await ApiService.getAdminAuthors();
            if (adminAuthorsRes && adminAuthorsRes.data) {
              authorData = adminAuthorsRes.data.find(
                (a: any) =>
                  String(a.user_id) === String(id) ||
                  (a.username && a.username.toLowerCase() === id.toLowerCase()) ||
                  (a.name && a.name.toLowerCase() === id.toLowerCase())
              );
            }
          } catch {}
        }

        if (!authorData) {
          authorData = { user_id: id, name: `Author #${id}`, role: 'Contributor' };
        }
        setAuthor(authorData);

        // 2. Fetch Author Posts (try id, username, or user_id)
        const primaryQuery = authorData.username || String(authorData.user_id || id);
        let postsRes = await ApiService.getPosts({ author: primaryQuery, limit: 50 }).catch(() => null);
        let authorPosts = postsRes?.data || [];

        // Fallback: If 0 posts found by username, try by numeric user_id
        if (authorPosts.length === 0 && authorData.user_id) {
          const fallbackRes = await ApiService.getPosts({ author: String(authorData.user_id), limit: 50 }).catch(() => null);
          if (fallbackRes?.data && fallbackRes.data.length > 0) {
            authorPosts = fallbackRes.data;
          }
        }

        // Fallback: If still 0 and URL id was different, try URL id
        if (authorPosts.length === 0 && id && id !== primaryQuery) {
          const fallbackRes2 = await ApiService.getPosts({ author: String(id), limit: 50 }).catch(() => null);
          if (fallbackRes2?.data && fallbackRes2.data.length > 0) {
            authorPosts = fallbackRes2.data;
          }
        }

        setPosts(authorPosts);
      } catch (err) {
        console.error('Error loading author profile and posts:', err);
      } finally {
        setLoading(false);
      }
    };

    loadAuthorAndPosts();
  }, [id]);

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const socialLinks = author?.social_links || {};

  return (
    <div className="container" style={{ paddingTop: '1.5rem', paddingBottom: '3.5rem' }}>
      <SeoHead
        title={`${author?.name || 'Author'} - Editorial Profile | ${siteName}`}
        description={author?.short_description || author?.bio || `Read articles and editorial insights by ${author?.name || 'author'} on ${siteName}.`}
      />

      {/* Breadcrumb Navigation */}
      <nav
        aria-label="Breadcrumb"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.4rem',
          fontSize: '0.82rem',
          color: 'var(--color-muted)',
          marginBottom: '1.5rem',
        }}
      >
        <Link to="/" style={{ color: 'var(--color-muted)', textDecoration: 'none' }}>Home</Link>
        <span>/</span>
        <Link to="/authors" style={{ color: 'var(--color-muted)', textDecoration: 'none' }}>Authors</Link>
        <span>/</span>
        <span style={{ color: 'var(--color-text)', fontWeight: 600 }}>{author?.name || `Author #${id}`}</span>
      </nav>

      {/* Author Hero Profile Header */}
      <header
        style={{
          backgroundColor: 'var(--color-card)',
          padding: '2.5rem 2rem',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--color-border)',
          marginBottom: '2rem',
          boxShadow: 'var(--shadow-md)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Subtle Ambient Background Glow */}
        <div
          style={{
            position: 'absolute',
            top: '-60px',
            right: '-60px',
            width: '240px',
            height: '240px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, var(--color-secondary-glow) 0%, transparent 70%)',
            opacity: 0.6,
            pointerEvents: 'none',
          }}
        />

        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '1.75rem',
            flexWrap: 'wrap',
            position: 'relative',
            zIndex: 1,
          }}
        >
          {/* Author Large Avatar Image */}
          <UserAvatar
            src={author?.profile_image}
            name={author?.name}
            size={100}
            showOnline={true}
            style={{
              boxShadow: '0 6px 20px rgba(0,0,0,0.18)',
              border: '3px solid var(--color-secondary)',
            }}
          />

          {/* Author Details & Bio */}
          <div style={{ flex: 1, minWidth: '280px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '0.35rem' }}>
              <div>
                <span
                  style={{
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    color: 'var(--color-secondary)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    display: 'block',
                    marginBottom: '0.2rem',
                  }}
                >
                  {author?.role || 'Staff Columnist'}
                </span>
                <h1 style={{ fontSize: '2rem', margin: 0, fontFamily: 'var(--font-heading)' }}>
                  {author?.name || `Author #${id}`}
                </h1>
              </div>

              {/* Share Profile Button */}
              <button
                type="button"
                onClick={handleShare}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  padding: '0.45rem 0.85rem',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  backgroundColor: 'var(--color-surface)',
                  border: '1px solid var(--color-border)',
                  color: 'var(--color-text)',
                  borderRadius: 'var(--radius-md)',
                  cursor: 'pointer',
                }}
              >
                {copied ? <Check size={14} color="#10B981" /> : <Share2 size={14} />}
                {copied ? 'Link Copied!' : 'Share Profile'}
              </button>
            </div>

            {/* Short Tagline / Headline */}
            {author?.short_description && (
              <p style={{ color: 'var(--color-secondary)', fontSize: '0.95rem', fontWeight: 600, margin: '0.25rem 0 0.6rem 0' }}>
                {author.short_description}
              </p>
            )}

            {/* Full Biography */}
            <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.92rem', lineHeight: '1.6', margin: '0 0 1rem 0' }}>
              {author?.bio || 'Journalist and analyst contributing stories on modern technology, design, and editorial insights.'}
            </p>

            {/* Author Expertise Tags */}
            {author?.author_tags && author.author_tags.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '1.25rem' }}>
                {author.author_tags.map((t: string) => (
                  <span
                    key={t}
                    style={{
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      padding: '0.2rem 0.6rem',
                      backgroundColor: 'var(--color-surface-alt)',
                      color: 'var(--color-secondary)',
                      borderRadius: 'var(--radius-full)',
                      border: '1px solid var(--color-border)',
                    }}
                  >
                    #{t}
                  </span>
                ))}
              </div>
            )}

            {/* Statistics & Social Links Bar */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '1rem',
                paddingTop: '1rem',
                borderTop: '1px solid var(--color-border)',
              }}
            >
              {/* Publication Stats */}
              <div style={{ display: 'flex', gap: '1.25rem', fontSize: '0.85rem' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontWeight: 600 }}>
                  <FileText size={15} color="var(--color-secondary)" /> {author?.published_count || posts.length} Published Stories
                </span>
                {author?.total_views !== undefined && author.total_views > 0 && (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--color-muted)' }}>
                    <Eye size={15} /> {author.total_views.toLocaleString()} Total Reads
                  </span>
                )}
              </div>

              {/* Social Channels */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                {author?.website && (
                  <a
                    href={author.website.startsWith('http') ? author.website : `https://${author.website}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      padding: '0.4rem',
                      borderRadius: 'var(--radius-sm)',
                      backgroundColor: 'var(--color-surface-alt)',
                      color: 'var(--color-text)',
                      display: 'flex',
                      alignItems: 'center',
                    }}
                    title="Author Website"
                  >
                    <Globe size={16} />
                  </a>
                )}
                {socialLinks.twitter && (
                  <a
                    href={socialLinks.twitter.startsWith('http') ? socialLinks.twitter : `https://x.com/${socialLinks.twitter.replace(/^@/, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      padding: '0.4rem',
                      borderRadius: 'var(--radius-sm)',
                      backgroundColor: 'var(--color-surface-alt)',
                      color: '#1DA1F2',
                      display: 'flex',
                      alignItems: 'center',
                    }}
                    title="Twitter / X"
                  >
                    <Twitter size={16} />
                  </a>
                )}
                {socialLinks.github && (
                  <a
                    href={socialLinks.github.startsWith('http') ? socialLinks.github : `https://github.com/${socialLinks.github.replace(/^@/, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      padding: '0.4rem',
                      borderRadius: 'var(--radius-sm)',
                      backgroundColor: 'var(--color-surface-alt)',
                      color: 'var(--color-text)',
                      display: 'flex',
                      alignItems: 'center',
                    }}
                    title="GitHub"
                  >
                    <Github size={16} />
                  </a>
                )}
                {socialLinks.linkedin && (
                  <a
                    href={socialLinks.linkedin.startsWith('http') ? socialLinks.linkedin : `https://linkedin.com/in/${socialLinks.linkedin}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      padding: '0.4rem',
                      borderRadius: 'var(--radius-sm)',
                      backgroundColor: 'var(--color-surface-alt)',
                      color: '#0A66C2',
                      display: 'flex',
                      alignItems: 'center',
                    }}
                    title="LinkedIn"
                  >
                    <Linkedin size={16} />
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Grid: Articles + Sidebar */}
      <div className="grid-main-sidebar">
        <main style={{ minHeight: 'auto' }}>
          {loading ? (
            <LoadingState message="Loading author stories archive..." />
          ) : (
            <ArticleGrid
              title={`Stories Written by ${author?.name || 'Author'}`}
              articles={posts}
              emptyTitle="No Published Stories"
              emptyDescription={`No published articles found for this author yet.`}
            />
          )}
        </main>

        <Sidebar />
      </div>
    </div>
  );
};
