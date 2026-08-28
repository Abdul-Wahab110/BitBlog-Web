import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Clock,
  Eye,
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
  Send,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import { SeoHead } from '../components/common/SeoHead';
import { sanitizeHtml } from '../utils/sanitize';
import { CategoryBadge } from '../components/common/CategoryBadge';
import { LoadingState } from '../components/common/LoadingState';
import { EmptyState } from '../components/common/EmptyState';
import { Sidebar } from '../components/common/Sidebar';
import { useAuth } from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext';
import { ApiService } from '../services/api';

export const SingleArticle: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { isAuthenticated } = useAuth();
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

          ApiService.recordView(article.post_id).catch(() => {});

          try {
            const seoRes = await ApiService.getSeoByPost(article.post_id);
            if (seoRes && seoRes.data) {
              setSeoMeta(seoRes.data);
            }
          } catch (e) {}

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
      alert('Please sign in to like this story.');
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
      alert('Please sign in to save story bookmarks.');
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
    return <LoadingState message="Loading editorial story..." />;
  }

  if (!post) {
    return (
      <div className="container" style={{ padding: '4rem 1rem' }}>
        <EmptyState
          title="Article Not Found"
          description={`No published story was found matching '/post/${slug}'.`}
        />
        <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
          <Link to="/" style={{ color: 'var(--color-secondary)', fontWeight: 700 }}>
            ← Return to Publication Homepage
          </Link>
        </div>
      </div>
    );
  }

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
      <SeoHead
        title={seoMeta?.meta_title || `${post.title} | ${siteName}`}
        description={seoMeta?.meta_description || post.excerpt}
        canonicalUrl={seoMeta?.canonical_url || window.location.href}
        ogTitle={seoMeta?.og_title || post.title}
        ogDescription={seoMeta?.og_description || post.excerpt}
        ogImage={seoMeta?.og_image || post.featured_image}
        robots={seoMeta?.robots || 'index, follow'}
        type="article"
        authorName={post.author_name}
        publishedAt={post.published_at}
        updatedAt={post.updated_at}
        directAnswer={seoMeta?.direct_answer}
        faqList={faqList}
        howToData={howToData}
        breadcrumbs={breadcrumbs}
      />

      <nav aria-label="Breadcrumbs" style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
        <Link to="/">Home</Link>
        <span>/</span>
        {post.category_slug ? (
          <Link to={`/category/${post.category_slug}`}>{post.category_name}</Link>
        ) : (
          <span>Articles</span>
        )}
        <span>/</span>
        <span style={{ color: 'var(--color-text)', fontWeight: 600 }}>{post.title}</span>
      </nav>

      <div className="grid-main-sidebar">
        <main style={{ minHeight: 'auto' }}>
          <article style={{ border: 'none', backgroundColor: 'transparent', boxShadow: 'none' }}>
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
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 0', borderTop: '1px solid var(--color-border)', borderBottom: '1px solid var(--color-border)', flexWrap: 'wrap', gap: '1rem', fontSize: '0.875rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{ width: '38px', height: '38px', borderRadius: '50%', backgroundColor: 'var(--color-secondary)', color: '#FFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>
                    {post.author_name ? post.author_name.charAt(0) : 'A'}
                  </div>
                  <div>
                    <span style={{ display: 'block', fontWeight: 700 }}>{post.author_name || 'Editorial Staff'}</span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--color-muted)' }}>{new Date(post.published_at || post.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', color: 'var(--color-text-secondary)' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}><Clock size={15} /> {post.reading_time || 4} min read</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}><Eye size={15} /> {post.views_count || 0} views</span>
                </div>
              </div>
            </header>

            {post.featured_image && (
              <figure style={{ marginBottom: '2.5rem', margin: 0, borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
                <img src={post.featured_image} alt={post.title} style={{ width: '100%', maxHeight: '480px', objectFit: 'cover' }} />
              </figure>
            )}

            <section style={{ fontSize: '1.1rem', lineHeight: 1.85, marginBottom: '3rem' }} dangerouslySetInnerHTML={{ __html: sanitizeHtml(post.content) }} />

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.25rem 0', borderTop: '1px solid var(--color-border)', borderBottom: '1px solid var(--color-border)', marginBottom: '3rem', flexWrap: 'wrap', gap: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <button type="button" onClick={handleToggleLike} style={{ backgroundColor: liked ? 'rgba(239, 68, 68, 0.12)' : 'var(--color-surface-alt)', color: liked ? 'var(--color-danger)' : 'var(--color-text)', padding: '0.5rem 1rem', borderRadius: 'var(--radius-md)', fontWeight: 600, fontSize: '0.875rem' }}>
                  <Heart size={16} fill={liked ? 'currentColor' : 'none'} /> {likesCount} Likes
                </button>
                <button type="button" onClick={handleToggleBookmark} style={{ backgroundColor: bookmarked ? 'rgba(99, 102, 241, 0.12)' : 'var(--color-surface-alt)', color: bookmarked ? 'var(--color-secondary)' : 'var(--color-text)', padding: '0.5rem 1rem', borderRadius: 'var(--radius-md)', fontWeight: 600, fontSize: '0.875rem' }}>
                  <Bookmark size={16} fill={bookmarked ? 'currentColor' : 'none'} /> {bookmarked ? 'Saved' : 'Save Story'}
                </button>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', fontWeight: 600 }}>Share:</span>
                <button onClick={handleCopyLink} style={{ padding: '0.45rem 0.65rem', backgroundColor: 'var(--color-surface-alt)' }}>
                  {copied ? <Check size={15} color="var(--color-success)" /> : <Copy size={15} />}
                </button>
              </div>
            </div>
          </article>
        </main>
        <Sidebar />
      </div>
    </div>
  );
};
export default SingleArticle;
