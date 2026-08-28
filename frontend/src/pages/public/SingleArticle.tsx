import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Clock,
  Eye,
  Calendar,
  Heart,
  Bookmark,
  Share2,
  Facebook,
  Twitter,
  Linkedin,
  Copy,
  Check,
  MessageSquare,
  BookOpen,
  CheckCircle,
  ListOrdered,
  HelpCircle,
  User,
  Send,
  AlertCircle,
  CheckCircle2,
  Tag as TagIcon,
} from 'lucide-react';
import { SeoHead } from '../../components/common/SeoHead';
import { sanitizeHtml } from '../../utils/sanitize';
import { CategoryBadge } from '../../components/common/CategoryBadge';
import { LoadingState } from '../../components/common/LoadingState';
import { EmptyState } from '../../components/common/EmptyState';
import { Sidebar } from '../../components/common/Sidebar';
import { UserAvatar } from '../../components/common/UserAvatar';
import { useAuth } from '../../context/AuthContext';
import { useSettings } from '../../context/SettingsContext';
import { ApiService } from '../../services/api';

export const SingleArticle: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { isAuthenticated, openAuthModal } = useAuth();
  const { settings } = useSettings();
  const siteName = settings.site_name || 'BitBlog';

  const [post, setPost] = useState<any | null>(null);
  const [seoMeta, setSeoMeta] = useState<any | null>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [commentText, setCommentText] = useState('');
  const [commentSubmitting, setCommentSubmitting] = useState(false);
  const [commentMsg, setCommentMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [bookmarked, setBookmarked] = useState(false);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);

    ApiService.getPostBySlug(slug)
      .then(async res => {
        if (res && res.data) {
          const article = res.data;
          setPost(article);
          setLikesCount(article.likes_count || 0);

          // Record privacy-aware view metric
          ApiService.recordView(article.post_id).catch(() => {});

          // Fetch SEO, AEO & GEO Metadata
          try {
            const seoRes = await ApiService.getSeoByPost(article.post_id);
            if (seoRes && seoRes.data) {
              setSeoMeta(seoRes.data);
            }
          } catch (e) {}

          // Fetch Approved Comments
          try {
            const commRes = await ApiService.getPostComments(article.post_id);
            if (commRes && commRes.data) {
              setComments(commRes.data);
            }
          } catch (e) {}
        } else {
          setPost(null);
        }
      })
      .catch(() => {
        setPost(null);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [slug]);

  const handleToggleLike = async () => {
    if (!post) return;
    if (!isAuthenticated) {
      openAuthModal('login');
      return;
    }
    try {
      const res = await ApiService.toggleLike(post.post_id);
      if (res && res.data) {
        setLiked(res.data.liked);
        setLikesCount(res.data.totalLikes);
      } else {
        setLiked(!liked);
        setLikesCount(prev => (liked ? Math.max(0, prev - 1) : prev + 1));
      }
    } catch (err: any) {
      alert(err.message || 'Error toggling like');
    }
  };

  const handleToggleBookmark = async () => {
    if (!post) return;
    if (!isAuthenticated) {
      openAuthModal('login');
      return;
    }
    try {
      const res = await ApiService.toggleBookmark(post.post_id);
      if (res && res.data) {
        setBookmarked(res.data.bookmarked);
      } else {
        setBookmarked(!bookmarked);
      }
    } catch (err: any) {
      alert(err.message || 'Error saving bookmark');
    }
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!post || !commentText.trim()) return;

    if (!isAuthenticated) {
      setCommentMsg({ type: 'error', text: 'Please sign in to submit a comment on this story.' });
      return;
    }

    setCommentSubmitting(true);
    setCommentMsg(null);

    try {
      await ApiService.createComment({
        postId: post.post_id,
        content: commentText.trim(),
      });
      setCommentText('');
      setCommentMsg({ type: 'success', text: 'Thank you! Your comment has been submitted for moderation.' });

      // Refresh comments
      const commRes = await ApiService.getPostComments(post.post_id);
      if (commRes && commRes.data) setComments(commRes.data);
    } catch (err: any) {
      setCommentMsg({ type: 'error', text: err.message || 'Failed to submit comment' });
    } finally {
      setCommentSubmitting(false);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return <LoadingState message="Loading editorial story and structured content..." />;
  }

  if (!post) {
    return (
      <div className="container" style={{ padding: '4rem 1rem' }}>
        <EmptyState
          title="Article Not Found"
          description={`No published story was found matching '/post/${slug}'. It may have been archived or moved.`}
        />
        <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
          <Link to="/" style={{ color: 'var(--color-secondary)', fontWeight: 700 }}>
            ← Return to Publication Homepage
          </Link>
        </div>
      </div>
    );
  }

  // Parse FAQ and How-To data for AEO
  let faqList: Array<{ question: string; answer: string }> = [];
  if (seoMeta?.faq_data) {
    try {
      faqList = JSON.parse(seoMeta.faq_data);
    } catch (e) {}
  }

  let howToData: any = null;
  if (seoMeta?.howto_data) {
    try {
      howToData = JSON.parse(seoMeta.howto_data);
    } catch (e) {}
  }

  const breadcrumbs = [
    { name: 'Home', url: window.location.origin },
    { name: post.category_name || 'Articles', url: `${window.location.origin}/category/${post.category_slug || 'news'}` },
    { name: post.title, url: window.location.href },
  ];

  return (
    <div className="container" style={{ paddingTop: '1.5rem', paddingBottom: '3rem' }}>
      {/* Dynamic SEO, AEO, GEO & JSON-LD Meta Head */}
      <SeoHead
        title={seoMeta?.meta_title || `${post.title} | ${siteName}`}
        description={seoMeta?.meta_description || post.excerpt}
        canonicalUrl={seoMeta?.canonical_url || window.location.href}
        ogTitle={seoMeta?.og_title || seoMeta?.meta_title || post.title}
        ogDescription={seoMeta?.og_description || seoMeta?.meta_description || post.excerpt}
        ogImage={seoMeta?.og_image || post.featured_image}
        twitterTitle={seoMeta?.twitter_title || seoMeta?.og_title || seoMeta?.meta_title || post.title}
        twitterDescription={seoMeta?.twitter_description || seoMeta?.og_description || seoMeta?.meta_description || post.excerpt}
        twitterImage={seoMeta?.twitter_image || seoMeta?.og_image || post.featured_image}
        twitterCard={seoMeta?.twitter_card || 'summary_large_image'}
        robots={seoMeta?.robots || 'index, follow'}
        focusKeyword={seoMeta?.focus_keyword}
        type="article"
        authorName={post.author_name}
        authorUrl={post.author_id ? `${window.location.origin}/author/${post.author_id}` : undefined}
        authorAvatar={post.author_avatar}
        publishedAt={post.published_at || post.created_at}
        updatedAt={post.updated_at || post.published_at}
        imageAlt={seoMeta?.image_alt_text || post.title}
        directAnswer={seoMeta?.direct_answer}
        keyTakeaways={seoMeta?.key_takeaways}
        faqList={faqList}
        howToData={howToData}
        breadcrumbs={breadcrumbs}
      />

      {/* Semantic Breadcrumbs Navigation */}
      <nav aria-label="Breadcrumbs" style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
        <Link to="/">Home</Link>
        <span>/</span>
        {post.category_slug ? (
          <Link to={`/category/${post.category_slug}`}>{post.category_name}</Link>
        ) : (
          <span>Articles</span>
        )}
        <span>/</span>
        <span style={{ color: 'var(--color-text)', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '300px' }}>
          {post.title}
        </span>
      </nav>

      <div className="grid-main-sidebar">
        <main style={{ minHeight: 'auto' }}>
          <article style={{ border: 'none', backgroundColor: 'transparent', boxShadow: 'none' }}>
            {/* Header */}
            <header style={{ border: 'none', backgroundColor: 'transparent', padding: 0, marginBottom: '1.5rem' }}>
              <div style={{ marginBottom: '0.75rem' }}>
                <CategoryBadge name={post.category_name || 'General'} slug={post.category_slug || 'general'} />
              </div>

              <h1 style={{ fontSize: 'clamp(1.75rem, 3.5vw, 2.5rem)', lineHeight: 1.25, fontWeight: 800, marginBottom: '1rem', fontFamily: 'var(--font-heading)' }}>
                {post.title}
              </h1>

              {post.excerpt && (
                <p style={{ fontSize: '1.1rem', lineHeight: 1.6, color: 'var(--color-text-secondary)', marginBottom: '1.5rem' }}>
                  {post.excerpt}
                </p>
              )}

              {/* Author & Meta Attribution Bar */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '1rem 0',
                  borderTop: '1px solid var(--color-border)',
                  borderBottom: '1px solid var(--color-border)',
                  flexWrap: 'wrap',
                  gap: '1rem',
                  fontSize: '0.875rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <Link to={post.author_id ? `/author/${post.author_id}` : '/authors'} style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <UserAvatar
                      src={post.author_avatar}
                      name={post.author_name}
                      size={42}
                      showOnline={true}
                    />
                    <div>
                      <span style={{ display: 'block', fontWeight: 700, color: 'var(--color-text)' }}>
                        {post.author_name || 'Editorial Staff'}
                      </span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--color-muted)' }}>
                        Published on {new Date(post.published_at || post.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </Link>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', color: 'var(--color-text-secondary)' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <Clock size={15} /> {post.reading_time || 4} min read
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <Eye size={15} /> {post.views_count || 0} views
                  </span>
                </div>
              </div>
            </header>

            {/* Featured Image */}
            {post.featured_image && (
              <figure style={{ marginBottom: '2.5rem', margin: 0, borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
                <img
                  src={post.featured_image}
                  alt={post.title}
                  loading="eager"
                  style={{ width: '100%', maxHeight: '480px', objectFit: 'cover', borderRadius: 'var(--radius-md)' }}
                />
              </figure>
            )}

            {/* AEO Direct Answer Summary Box */}
            {seoMeta?.direct_answer && (
              <section
                aria-label="Direct Summary"
                style={{
                  backgroundColor: 'var(--color-surface-alt)',
                  borderLeft: '4px solid var(--color-secondary)',
                  padding: '1.25rem 1.5rem',
                  borderRadius: 'var(--radius-md)',
                  marginBottom: '2rem',
                }}
              >
                <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-secondary)' }}>
                  <BookOpen size={18} /> Direct Answer / Quick Summary
                </h3>
                <p style={{ fontSize: '0.95rem', lineHeight: 1.6, color: 'var(--color-text)' }}>
                  {seoMeta.direct_answer}
                </p>
              </section>
            )}

            {/* AEO Key Takeaways */}
            {seoMeta?.key_takeaways && (
              <section
                aria-label="Key Takeaways"
                style={{
                  backgroundColor: 'var(--color-card)',
                  border: '1px solid var(--color-border)',
                  padding: '1.25rem 1.5rem',
                  borderRadius: 'var(--radius-md)',
                  marginBottom: '2rem',
                }}
              >
                <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <CheckCircle size={18} color="var(--color-success)" /> Key Takeaways
                </h3>
                <p style={{ fontSize: '0.925rem', lineHeight: 1.6, color: 'var(--color-text-secondary)' }}>
                  {seoMeta.key_takeaways}
                </p>
              </section>
            )}

            {/* Main Article Body */}
            <section
              style={{
                fontSize: '1.1rem',
                lineHeight: 1.85,
                color: 'var(--color-text)',
                marginBottom: '3rem',
                wordBreak: 'break-word',
                overflowWrap: 'break-word',
              }}
              dangerouslySetInnerHTML={{ __html: sanitizeHtml(post.content) }}
            />

            {/* AEO Step-by-Step How-To */}
            {howToData && howToData.steps && howToData.steps.length > 0 && (
              <section
                aria-label="How-To Step-by-Step Guide"
                style={{
                  backgroundColor: 'var(--color-card)',
                  border: '1px solid var(--color-border)',
                  padding: '1.5rem',
                  borderRadius: 'var(--radius-md)',
                  marginBottom: '2.5rem',
                }}
              >
                <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <ListOrdered size={20} color="var(--color-secondary)" /> {howToData.title || 'Step-by-Step Instructions'}
                </h3>
                {howToData.description && (
                  <p style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)', marginBottom: '1.25rem' }}>{howToData.description}</p>
                )}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {howToData.steps.map((step: any, idx: number) => (
                    <div key={idx} style={{ padding: '0.85rem', backgroundColor: 'var(--color-surface-alt)', borderRadius: 'var(--radius-sm)' }}>
                      <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.25rem' }}>
                        Step {idx + 1}: {step.title}
                      </h4>
                      <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>{step.description}</p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* AEO FAQ Section */}
            {faqList.length > 0 && (
              <section
                aria-label="Frequently Asked Questions"
                style={{
                  backgroundColor: 'var(--color-card)',
                  border: '1px solid var(--color-border)',
                  padding: '1.5rem',
                  borderRadius: 'var(--radius-md)',
                  marginBottom: '2.5rem',
                }}
              >
                <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <HelpCircle size={20} color="var(--color-secondary)" /> Frequently Asked Questions
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {faqList.map((item, idx) => (
                    <div key={idx} style={{ padding: '1rem', backgroundColor: 'var(--color-surface-alt)', borderRadius: 'var(--radius-sm)' }}>
                      <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.35rem' }}>{item.question}</h4>
                      <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>{item.answer}</p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Article Topic Tags */}
            {post.tags && post.tags.length > 0 && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '0.5rem',
                  marginBottom: '1.75rem',
                  padding: '1rem 1.25rem',
                  backgroundColor: 'var(--color-surface-alt)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--color-border)',
                }}
              >
                <span style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--color-secondary)', display: 'inline-flex', alignItems: 'center', gap: '0.35rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  <TagIcon size={14} /> Topic Tags:
                </span>
                {post.tags.map((t: any) => (
                  <Link
                    key={t.tag_id || t.id || t.slug}
                    to={`/tag/${t.slug}`}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.3rem',
                      padding: '0.25rem 0.75rem',
                      backgroundColor: 'var(--color-card)',
                      border: '1px solid var(--color-border)',
                      borderRadius: 'var(--radius-full)',
                      fontSize: '0.82rem',
                      fontWeight: 700,
                      color: 'var(--color-text)',
                      textDecoration: 'none',
                      transition: 'all var(--transition-fast)',
                    }}
                  >
                    #{t.name}
                  </Link>
                ))}
              </div>
            )}

            {/* Social Engagement Actions */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '1.25rem 0',
                borderTop: '1px solid var(--color-border)',
                borderBottom: '1px solid var(--color-border)',
                marginBottom: '3rem',
                flexWrap: 'wrap',
                gap: '1rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <button
                  type="button"
                  onClick={handleToggleLike}
                  style={{
                    backgroundColor: liked ? 'rgba(239, 68, 68, 0.12)' : 'var(--color-surface-alt)',
                    color: liked ? 'var(--color-danger)' : 'var(--color-text)',
                    padding: '0.5rem 1rem',
                    borderRadius: 'var(--radius-md)',
                    fontWeight: 600,
                    fontSize: '0.875rem',
                  }}
                >
                  <Heart size={16} fill={liked ? 'currentColor' : 'none'} /> {likesCount} Likes
                </button>

                <button
                  type="button"
                  onClick={handleToggleBookmark}
                  style={{
                    backgroundColor: bookmarked ? 'rgba(99, 102, 241, 0.12)' : 'var(--color-surface-alt)',
                    color: bookmarked ? 'var(--color-secondary)' : 'var(--color-text)',
                    padding: '0.5rem 1rem',
                    borderRadius: 'var(--radius-md)',
                    fontWeight: 600,
                    fontSize: '0.875rem',
                  }}
                >
                  <Bookmark size={16} fill={bookmarked ? 'currentColor' : 'none'} /> {bookmarked ? 'Saved' : 'Save Story'}
                </button>
              </div>

              {/* Social Share Buttons */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', fontWeight: 600 }}>Share:</span>
                <button onClick={handleCopyLink} title="Copy link to clipboard" style={{ padding: '0.45rem 0.65rem', backgroundColor: 'var(--color-surface-alt)', color: 'var(--color-text)' }}>
                  {copied ? <Check size={15} color="var(--color-success)" /> : <Copy size={15} />}
                </button>
                <a href={`https://facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`} target="_blank" rel="noreferrer" style={{ padding: '0.45rem 0.65rem', backgroundColor: 'var(--color-social-facebook)', color: '#FFF', borderRadius: 'var(--radius-md)', display: 'inline-flex' }}>
                  <Facebook size={15} />
                </a>
                <a href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(window.location.href)}`} target="_blank" rel="noreferrer" style={{ padding: '0.45rem 0.65rem', backgroundColor: 'var(--color-social-twitter)', color: '#FFF', borderRadius: 'var(--radius-md)', display: 'inline-flex' }}>
                  <Twitter size={15} />
                </a>
                <a href={`https://linkedin.com/shareArticle?url=${encodeURIComponent(window.location.href)}`} target="_blank" rel="noreferrer" style={{ padding: '0.45rem 0.65rem', backgroundColor: 'var(--color-social-linkedin)', color: '#FFF', borderRadius: 'var(--radius-md)', display: 'inline-flex' }}>
                  <Linkedin size={15} />
                </a>
              </div>
            </div>

            {/* Reader Discussion / Comments Section */}
            <section style={{ marginBottom: '2.5rem' }}>
              <h3 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <MessageSquare size={20} color="var(--color-secondary)" /> Reader Discussion ({comments.length})
              </h3>

              {commentMsg && (
                <div style={{ padding: '0.75rem 1rem', backgroundColor: commentMsg.type === 'success' ? 'rgba(16, 185, 129, 0.12)' : 'rgba(239, 68, 68, 0.12)', border: `1px solid ${commentMsg.type === 'success' ? 'var(--color-success)' : 'var(--color-danger)'}`, borderRadius: 'var(--radius-md)', color: commentMsg.type === 'success' ? 'var(--color-success)' : 'var(--color-danger)', marginBottom: '1.25rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  {commentMsg.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                  <span>{commentMsg.text}</span>
                </div>
              )}

              {/* Add Comment Form */}
              <form onSubmit={handleCommentSubmit} style={{ marginBottom: '2rem', backgroundColor: 'var(--color-card)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: '1.25rem' }}>
                <label htmlFor="article-comment" style={{ display: 'block', fontWeight: 600, fontSize: '0.85rem', marginBottom: '0.4rem' }}>
                  Leave a Comment
                </label>
                <textarea
                  id="article-comment"
                  value={commentText}
                  onChange={e => setCommentText(e.target.value)}
                  placeholder={isAuthenticated ? 'Join the discussion... Type your perspective here.' : 'Please sign in to join the reader discussion.'}
                  rows={3}
                  required
                  disabled={!isAuthenticated}
                  style={{ width: '100%', padding: '0.75rem', fontSize: '0.9rem', marginBottom: '0.75rem' }}
                />
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  {isAuthenticated ? (
                    <button
                      type="submit"
                      disabled={commentSubmitting}
                      style={{
                        backgroundColor: 'var(--color-secondary)',
                        color: '#FFFFFF',
                        padding: '0.55rem 1.25rem',
                        fontSize: '0.85rem',
                        fontWeight: 700,
                        borderRadius: 'var(--radius-md)',
                      }}
                    >
                      <Send size={14} /> {commentSubmitting ? 'Posting...' : 'Post Comment'}
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => openAuthModal('login')}
                      style={{
                        backgroundColor: 'var(--color-secondary)',
                        color: '#FFFFFF',
                        padding: '0.55rem 1.25rem',
                        fontSize: '0.85rem',
                        fontWeight: 700,
                        borderRadius: 'var(--radius-md)',
                      }}
                    >
                      Sign In to Comment
                    </button>
                  )}
                </div>
              </form>

              {/* Comments List */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {comments.length === 0 ? (
                  <div style={{ padding: '2rem', backgroundColor: 'var(--color-card)', borderRadius: 'var(--radius-md)', textAlign: 'center', border: '1px solid var(--color-border)' }}>
                    <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem', margin: 0 }}>
                      No comments posted on this story yet. Be the first reader to share your perspective!
                    </p>
                  </div>
                ) : (
                  comments.map(c => (
                    <div key={c.comment_id} style={{ padding: '1.25rem', backgroundColor: 'var(--color-card)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.65rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                          <UserAvatar
                            src={c.user_avatar || c.author_avatar}
                            name={c.author_name || c.user_name || 'Reader'}
                            size={32}
                          />
                          <div>
                            <span style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--color-text)', display: 'block' }}>
                              {c.author_name || c.user_name || 'Reader'}
                            </span>
                            <span style={{ fontSize: '0.72rem', color: 'var(--color-muted)' }}>
                              {new Date(c.created_at).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                      <p style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)', lineHeight: 1.6, margin: 0, paddingLeft: '2.6rem' }}>
                        {c.content}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </section>
          </article>
        </main>

        <Sidebar />
      </div>
    </div>
  );
};
