import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Save, Eye, Send, Calendar, AlertCircle, CheckCircle2, Folder, Clock, Tag, X, Plus, Hash } from 'lucide-react';
import { RichEditor } from '../../components/editor/RichEditor';
import { ArticlePreviewModal } from '../../components/editor/ArticlePreviewModal';
import { ImageUploadDropzone } from '../../components/common/ImageUploadDropzone';
import { LoadingState } from '../../components/common/LoadingState';
import { SeoAeoGeoEditor, SeoData, AeoData, GeoData } from '../../components/editor/SeoAeoGeoEditor';
import { EditorSidebarTools } from '../../components/editor/EditorSidebarTools';
import { generateSlug } from '../../utils/slug';
import { ApiService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export const EditPost: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isAuthor = user?.role === 'Author';

  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [content, setContent] = useState('');
  const [featuredImage, setFeaturedImage] = useState('');
  const [categoryId, setCategoryId] = useState<number | undefined>(undefined);
  const [categories, setCategories] = useState<any[]>([]);
  const [status, setStatus] = useState<'draft' | 'published' | 'pending_review' | 'changes_requested' | 'rejected' | 'scheduled' | 'archived'>('draft');
  const [scheduledAt, setScheduledAt] = useState('');

  // Topic Tags
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [availableTags, setAvailableTags] = useState<any[]>([]);
  const [tagInput, setTagInput] = useState('');

  // SEO, AEO, GEO Integrated State
  const [seo, setSeo] = useState<SeoData>({
    metaTitle: '',
    metaDescription: '',
    canonicalUrl: '',
    ogTitle: '',
    ogDescription: '',
    ogImage: '',
    robots: 'index, follow',
  });

  const [aeo, setAeo] = useState<AeoData>({
    directAnswer: '',
    keyTakeaways: '',
    faqList: [],
    howToData: [],
  });

  const [geo, setGeo] = useState<GeoData>({
    locationContext: '',
    sourceCitations: '',
    entityContext: '',
    factualContext: '',
  });

  const [loading, setLoading] = useState(true);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    ApiService.getCategories()
      .then(res => {
        if (res && res.data) setCategories(res.data);
      })
      .catch(() => {});

    ApiService.getTags()
      .then(res => {
        if (res && res.data) setAvailableTags(res.data);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!id) return;
    setLoading(true);

    Promise.all([
      ApiService.getPostById(parseInt(id)),
      ApiService.getSeoByPost(parseInt(id)).catch(() => null),
    ])
      .then(([postRes, seoRes]) => {
        if (postRes && postRes.data) {
          const post = postRes.data;
          setTitle(post.title || '');
          setSlug(post.slug || '');
          setExcerpt(post.excerpt || '');
          setContent(post.content || '');
          setFeaturedImage(post.featured_image || '');
          setCategoryId(post.category_id);
          setStatus(post.status || 'draft');
          if (post.tags && Array.isArray(post.tags)) {
            setSelectedTags(post.tags.map((t: any) => t.name || t.slug));
          }
          if (post.scheduled_at) {
            const d = new Date(post.scheduled_at);
            const pad = (n: number) => (n < 10 ? '0' + n : n);
            setScheduledAt(
              d.getFullYear() +
                '-' +
                pad(d.getMonth() + 1) +
                '-' +
                pad(d.getDate()) +
                'T' +
                pad(d.getHours()) +
                ':' +
                pad(d.getMinutes())
            );
          }
        }
        if (seoRes && seoRes.data) {
          const s = seoRes.data;
          setSeo({
            metaTitle: s.meta_title || '',
            metaDescription: s.meta_description || '',
            canonicalUrl: s.canonical_url || '',
            ogTitle: s.og_title || '',
            ogDescription: s.og_description || '',
            ogImage: s.og_image || '',
            robots: s.robots || 'index, follow',
          });
          setAeo({
            directAnswer: s.direct_answer || '',
            keyTakeaways: s.key_takeaways || '',
            faqList: s.faq_data ? JSON.parse(s.faq_data) : [],
            howToData: s.howto_data ? JSON.parse(s.howto_data) : [],
          });
        }
      })
      .catch(err => {
        setErrorMsg(err.message || 'Failed to load article details');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [id]);

  const handleSubmit = async (e: React.FormEvent, targetStatus?: 'draft' | 'published' | 'scheduled') => {
    if (e) e.preventDefault();
    if (!id) return;

    setErrorMsg(null);
    setSuccessMsg(null);

    const finalStatus = targetStatus || status;

    if (!title.trim() || title.trim().length < 3) {
      setErrorMsg('Article title must be at least 3 characters long.');
      return;
    }

    if (!content.trim() || content.trim().length < 10) {
      setErrorMsg('Article content must be at least 10 characters long.');
      return;
    }

    if (finalStatus === 'scheduled' && !scheduledAt) {
      setErrorMsg('Scheduled publishing requires selecting a future date and time.');
      return;
    }

    setSubmitting(true);

    try {
      const payload = {
        title: title.trim(),
        slug: slug.trim() || generateSlug(title),
        excerpt: excerpt.trim() || undefined,
        content,
        featuredImage: featuredImage.trim() || undefined,
        categoryId: categoryId ? Number(categoryId) : undefined,
        tags: selectedTags,
        status: finalStatus,
        scheduledAt: finalStatus === 'scheduled' && scheduledAt ? (scheduledAt.includes('Z') ? scheduledAt : new Date(scheduledAt).toISOString()) : undefined,
        seo,
        aeo,
        geo,
      };

      const res = await ApiService.updatePost(parseInt(id), payload);
      setSubmitting(false);

      if (res && res.success) {
        setSuccessMsg(`Article '${title}' updated successfully as ${finalStatus.toUpperCase()}!`);
        setTimeout(() => {
          if (finalStatus === 'scheduled') {
            navigate('/admin/posts/scheduled');
          } else {
            navigate('/admin/posts');
          }
        }, 800);
      } else {
        throw new Error(res?.message || 'Failed to update article in database');
      }
    } catch (err: any) {
      setSubmitting(false);
      setErrorMsg(err.message || 'An unexpected error occurred while updating the article');
    }
  };
  const formatForDateTimeInput = (d: Date) => {
    const pad = (n: number) => (n < 10 ? '0' + n : n);
    return (
      d.getFullYear() +
      '-' +
      pad(d.getMonth() + 1) +
      '-' +
      pad(d.getDate()) +
      'T' +
      pad(d.getHours()) +
      ':' +
      pad(d.getMinutes())
    );
  };

  const setPresetTime = (offsetHours: number) => {
    const target = new Date();
    target.setHours(target.getHours() + offsetHours);
    setScheduledAt(formatForDateTimeInput(target));
  };

  if (loading) {
    return <LoadingState message="Loading article records for editing..." />;
  }

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '1.5rem',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div>
          <h1 style={{ fontSize: '1.6rem', marginBottom: '0.2rem', fontFamily: 'var(--font-heading)' }}>
            Edit Article #{id}
          </h1>
          <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
            Update story content, featured cover image, taxonomy, and SEO/AEO/GEO metadata
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={() => setPreviewOpen(true)}
            style={{
              backgroundColor: 'var(--color-surface-alt)',
              color: 'var(--color-text)',
              padding: '0.5rem 1rem',
              fontSize: '0.85rem',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--color-border)',
            }}
          >
            <Eye size={15} /> Preview
          </button>

          <button
            type="button"
            onClick={e => handleSubmit(e, 'draft')}
            disabled={submitting}
            style={{
              backgroundColor: 'var(--color-surface-alt)',
              color: 'var(--color-text)',
              padding: '0.5rem 1rem',
              fontSize: '0.85rem',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--color-border)',
            }}
          >
            <Save size={15} /> Save Draft
          </button>

          {status === 'scheduled' ? (
            <button
              type="button"
              onClick={e => handleSubmit(e, 'scheduled')}
              disabled={submitting}
              style={{
                backgroundColor: 'var(--color-accent)',
                color: '#FFFFFF',
                padding: '0.5rem 1.25rem',
                fontSize: '0.85rem',
                borderRadius: 'var(--radius-md)',
                boxShadow: '0 2px 8px rgba(245, 158, 11, 0.35)',
              }}
            >
              <Clock size={15} /> {submitting ? 'Scheduling...' : 'Schedule Story'}
            </button>
          ) : (
            <button
              type="button"
              onClick={e => handleSubmit(e, 'published')}
              disabled={submitting}
              style={{
                backgroundColor: 'var(--color-secondary)',
                color: '#FFFFFF',
                padding: '0.5rem 1.25rem',
                fontSize: '0.85rem',
                borderRadius: 'var(--radius-md)',
                boxShadow: '0 2px 8px var(--color-secondary-glow)',
              }}
            >
              <Send size={15} /> {submitting ? 'Updating...' : 'Publish Update'}
            </button>
          )}
        </div>
      </div>

      {errorMsg && (
        <div
          role="alert"
          style={{
            padding: '0.85rem 1.25rem',
            backgroundColor: 'rgba(239, 68, 68, 0.12)',
            border: '1px solid var(--color-danger)',
            borderRadius: 'var(--radius-md)',
            color: 'var(--color-danger)',
            marginBottom: '1.5rem',
            fontSize: '0.88rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          <AlertCircle size={18} />
          <span>{errorMsg}</span>
        </div>
      )}

      {successMsg && (
        <div
          role="status"
          style={{
            padding: '0.85rem 1.25rem',
            backgroundColor: 'rgba(16, 185, 129, 0.12)',
            border: '1px solid var(--color-success)',
            borderRadius: 'var(--radius-md)',
            color: 'var(--color-success)',
            marginBottom: '1.5rem',
            fontSize: '0.88rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          <CheckCircle2 size={18} />
          <span>{successMsg}</span>
        </div>
      )}

      <form onSubmit={e => handleSubmit(e)}>
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 320px', gap: '1.5rem', alignItems: 'start' }}>
          {/* Main Column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Title & Slug */}
            <div
              style={{
                backgroundColor: 'var(--color-card)',
                padding: '1.5rem',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--color-border)',
              }}
            >
              <div style={{ marginBottom: '1.25rem' }}>
                <label htmlFor="post-title" style={{ display: 'block', fontWeight: 700, marginBottom: '0.4rem', fontSize: '0.9rem' }}>
                  Article Headline / Title *
                </label>
                <input
                  id="post-title"
                  type="text"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  required
                  style={{ width: '100%', padding: '0.75rem 1rem', fontSize: '1.1rem', fontWeight: 600 }}
                />
              </div>

              <div>
                <label htmlFor="post-slug" style={{ display: 'block', fontWeight: 600, marginBottom: '0.35rem', fontSize: '0.82rem', color: 'var(--color-text-secondary)' }}>
                  Permanent URL Slug
                </label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <span style={{ fontSize: '0.85rem', color: 'var(--color-muted)' }}>/post/</span>
                  <input
                    id="post-slug"
                    type="text"
                    value={slug}
                    onChange={e => setSlug(e.target.value)}
                    style={{ flex: 1, padding: '0.5rem 0.75rem', fontSize: '0.85rem' }}
                  />
                </div>
              </div>
            </div>

            {/* Featured Image */}
            <div
              style={{
                backgroundColor: 'var(--color-card)',
                padding: '1.5rem',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--color-border)',
              }}
            >
              <label style={{ display: 'block', fontWeight: 700, marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                Featured Hero Image
              </label>
              <ImageUploadDropzone
                value={featuredImage}
                onChange={url => setFeaturedImage(url)}
                label="Directly upload hero image (JPG, PNG, WEBP, GIF)"
              />
            </div>

            {/* Excerpt */}
            <div
              style={{
                backgroundColor: 'var(--color-card)',
                padding: '1.5rem',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--color-border)',
              }}
            >
              <label htmlFor="post-excerpt" style={{ display: 'block', fontWeight: 700, marginBottom: '0.4rem', fontSize: '0.9rem' }}>
                Article Excerpt / Summary
              </label>
              <textarea
                id="post-excerpt"
                rows={3}
                value={excerpt}
                onChange={e => setExcerpt(e.target.value)}
                style={{ width: '100%', padding: '0.75rem 1rem', fontSize: '0.88rem' }}
              />
            </div>

            {/* Rich Editor */}
            <div
              style={{
                backgroundColor: 'var(--color-card)',
                padding: '1.5rem',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--color-border)',
              }}
            >
              <label style={{ display: 'block', fontWeight: 700, marginBottom: '0.6rem', fontSize: '0.9rem' }}>
                Article Content *
              </label>
              <RichEditor
                value={content}
                onChange={val => setContent(val)}
                minHeight="450px"
              />
            </div>

            {/* Integrated SEO, AEO, and GEO Settings Section Below Content on Same Page */}
            <SeoAeoGeoEditor
              seo={seo}
              onChangeSeo={setSeo}
              aeo={aeo}
              onChangeAeo={setAeo}
              geo={geo}
              onChangeGeo={setGeo}
              defaultTitle={title}
              defaultExcerpt={excerpt}
              defaultImage={featuredImage}
              content={content}
              slug={slug}
              categoryName={categories.find(c => c.category_id === categoryId)?.name}
              tags={selectedTags}
            />
          </div>

          {/* Right Sidebar Publishing Controls */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div
              style={{
                backgroundColor: 'var(--color-card)',
                padding: '1.25rem',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--color-border)',
              }}
            >
              <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Calendar size={16} /> Publishing Controls
              </h3>

              <div style={{ marginBottom: '1rem' }}>
                <label htmlFor="edit-status-select" style={{ display: 'block', fontWeight: 600, fontSize: '0.82rem', marginBottom: '0.35rem' }}>
                  Status
                </label>
                <select
                  id="edit-status-select"
                  value={status}
                  onChange={e => setStatus(e.target.value as any)}
                  style={{ width: '100%', padding: '0.55rem 0.75rem', fontSize: '0.88rem' }}
                >
                  {isAuthor ? (
                    <>
                      <option value="pending_review">Submit for Editorial Review</option>
                      <option value="draft">Save as Draft</option>
                      <option value="scheduled">Schedule Release</option>
                      {status === 'changes_requested' && (
                        <option value="changes_requested">Changes Requested (Addressing Feedback)</option>
                      )}
                    </>
                  ) : (
                    <>
                      <option value="published">Published</option>
                      <option value="draft">Draft</option>
                      <option value="pending_review">Pending Review</option>
                      <option value="changes_requested">Changes Requested</option>
                      <option value="rejected">Rejected</option>
                      <option value="scheduled">Scheduled</option>
                      <option value="archived">Archived</option>
                    </>
                  )}
                </select>
              </div>

              {status === 'scheduled' && (
                <div
                  style={{
                    marginBottom: '1rem',
                    padding: '0.85rem',
                    backgroundColor: 'rgba(245, 158, 11, 0.1)',
                    border: '1px solid rgba(245, 158, 11, 0.3)',
                    borderRadius: 'var(--radius-md)',
                  }}
                >
                  <label
                    htmlFor="edit-schedule-date"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      fontWeight: 700,
                      fontSize: '0.85rem',
                      marginBottom: '0.5rem',
                      color: 'var(--color-accent)',
                    }}
                  >
                    <Clock size={15} /> Select Target Publish Date & Time *
                  </label>

                  <input
                    id="edit-schedule-date"
                    type="datetime-local"
                    value={scheduledAt}
                    min={formatForDateTimeInput(new Date())}
                    onChange={e => setScheduledAt(e.target.value)}
                    required={status === 'scheduled'}
                    style={{
                      width: '100%',
                      padding: '0.6rem 0.75rem',
                      fontSize: '0.9rem',
                      fontWeight: 600,
                      marginBottom: '0.6rem',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--color-border)',
                      backgroundColor: 'var(--color-surface)',
                      color: 'var(--color-text)',
                    }}
                  />

                  {/* Quick Presets */}
                  <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap', marginBottom: '0.5rem' }}>
                    <button
                      type="button"
                      onClick={() => setPresetTime(1)}
                      style={{
                        padding: '0.25rem 0.5rem',
                        fontSize: '0.72rem',
                        fontWeight: 600,
                        borderRadius: 'var(--radius-sm)',
                        border: '1px solid var(--color-border)',
                        backgroundColor: 'var(--color-surface)',
                        color: 'var(--color-text)',
                      }}
                    >
                      +1 Hour
                    </button>
                    <button
                      type="button"
                      onClick={() => setPresetTime(3)}
                      style={{
                        padding: '0.25rem 0.5rem',
                        fontSize: '0.72rem',
                        fontWeight: 600,
                        borderRadius: 'var(--radius-sm)',
                        border: '1px solid var(--color-border)',
                        backgroundColor: 'var(--color-surface)',
                        color: 'var(--color-text)',
                      }}
                    >
                      +3 Hours
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const tomorrow = new Date();
                        tomorrow.setDate(tomorrow.getDate() + 1);
                        tomorrow.setHours(9, 0, 0, 0);
                        setScheduledAt(formatForDateTimeInput(tomorrow));
                      }}
                      style={{
                        padding: '0.25rem 0.5rem',
                        fontSize: '0.72rem',
                        fontWeight: 600,
                        borderRadius: 'var(--radius-sm)',
                        border: '1px solid var(--color-border)',
                        backgroundColor: 'var(--color-surface)',
                        color: 'var(--color-text)',
                      }}
                    >
                      Tomorrow 9 AM
                    </button>
                  </div>

                  {scheduledAt && (
                    <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--color-accent)', fontWeight: 600 }}>
                      ✓ Will automatically publish on {new Date(scheduledAt).toLocaleString()}
                    </p>
                  )}
                </div>
              )}

              <button
                type="submit"
                disabled={submitting}
                style={{
                  width: '100%',
                  backgroundColor: status === 'scheduled' ? 'var(--color-accent)' : 'var(--color-secondary)',
                  color: '#FFFFFF',
                  padding: '0.65rem',
                  fontWeight: 700,
                  fontSize: '0.9rem',
                  borderRadius: 'var(--radius-md)',
                  boxShadow: status === 'scheduled' ? '0 2px 8px rgba(245, 158, 11, 0.35)' : '0 2px 8px var(--color-secondary-glow)',
                }}
              >
                {status === 'scheduled' ? <Clock size={15} /> : <Send size={15} />}
                <span>
                  {submitting
                    ? 'Updating...'
                    : status === 'published'
                    ? 'Publish Story'
                    : status === 'scheduled'
                    ? 'Schedule Story'
                    : 'Save Article Changes'}
                </span>
              </button>
            </div>

            <div
              style={{
                backgroundColor: 'var(--color-card)',
                padding: '1.25rem',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--color-border)',
              }}
            >
              <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Folder size={16} /> Category
              </h3>

              <select
                value={categoryId}
                onChange={e => setCategoryId(Number(e.target.value))}
                style={{ width: '100%', padding: '0.55rem 0.75rem', fontSize: '0.88rem' }}
              >
                {categories.map(cat => (
                  <option key={cat.category_id} value={cat.category_id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Keyword & Topic Tags Card */}
            <div
              style={{
                backgroundColor: 'var(--color-card)',
                padding: '1.25rem',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--color-border)',
              }}
            >
              <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Tag size={16} color="var(--color-secondary)" /> Topic Tags
              </h3>

              {/* Tag Input Field */}
              <div style={{ display: 'flex', gap: '0.35rem', marginBottom: '0.75rem' }}>
                <input
                  type="text"
                  value={tagInput}
                  onChange={e => setTagInput(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter' || e.key === ',') {
                      e.preventDefault();
                      const clean = tagInput.trim().replace(/^#/, '').replace(/,$/, '');
                      if (clean && !selectedTags.includes(clean)) {
                        setSelectedTags([...selectedTags, clean]);
                      }
                      setTagInput('');
                    }
                  }}
                  placeholder="Add tag (Press Enter)..."
                  style={{ flex: 1, padding: '0.45rem 0.65rem', fontSize: '0.82rem' }}
                />
                <button
                  type="button"
                  onClick={() => {
                    const clean = tagInput.trim().replace(/^#/, '');
                    if (clean && !selectedTags.includes(clean)) {
                      setSelectedTags([...selectedTags, clean]);
                    }
                    setTagInput('');
                  }}
                  style={{
                    padding: '0.45rem 0.75rem',
                    backgroundColor: 'var(--color-secondary)',
                    color: '#FFF',
                    borderRadius: 'var(--radius-sm)',
                    border: 'none',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  <Plus size={14} />
                </button>
              </div>

              {/* Selected Tags Pills */}
              {selectedTags.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '0.85rem' }}>
                  {selectedTags.map(tagName => (
                    <span
                      key={tagName}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.25rem',
                        padding: '0.2rem 0.55rem',
                        backgroundColor: 'var(--color-surface-alt)',
                        border: '1px solid var(--color-secondary)',
                        color: 'var(--color-secondary)',
                        borderRadius: 'var(--radius-full)',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                      }}
                    >
                      #{tagName}
                      <button
                        type="button"
                        onClick={() => setSelectedTags(selectedTags.filter(t => t !== tagName))}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: 'var(--color-danger)',
                          padding: 0,
                          cursor: 'pointer',
                          display: 'inline-flex',
                        }}
                      >
                        <X size={12} />
                      </button>
                    </span>
                  ))}
                </div>
              )}

              {/* Available Tags Quick Suggestions */}
              {availableTags.length > 0 && (
                <div>
                  <span style={{ fontSize: '0.72rem', color: 'var(--color-muted)', display: 'block', marginBottom: '0.35rem', fontWeight: 600 }}>
                    Quick Select:
                  </span>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem', maxHeight: '110px', overflowY: 'auto' }}>
                    {availableTags.slice(0, 10).map(t => {
                      const isSelected = selectedTags.includes(t.name) || selectedTags.includes(t.slug);
                      return (
                        <button
                          key={t.tag_id || t.id}
                          type="button"
                          onClick={() => {
                            if (isSelected) {
                              setSelectedTags(selectedTags.filter(st => st !== t.name && st !== t.slug));
                            } else {
                              setSelectedTags([...selectedTags, t.name]);
                            }
                          }}
                          style={{
                            padding: '0.15rem 0.5rem',
                            fontSize: '0.72rem',
                            fontWeight: 600,
                            borderRadius: 'var(--radius-full)',
                            border: `1px solid ${isSelected ? 'var(--color-secondary)' : 'var(--color-border)'}`,
                            backgroundColor: isSelected ? 'var(--color-secondary)' : 'var(--color-surface)',
                            color: isSelected ? '#FFFFFF' : 'var(--color-text)',
                            cursor: 'pointer',
                          }}
                        >
                          +{t.name}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Editorial Tools Suite: Health Score, Content Metrics, Outline & Checklist */}
            <EditorSidebarTools
              title={title}
              excerpt={excerpt}
              content={content}
              featuredImage={featuredImage}
              categorySelected={categoryId !== undefined}
              tagsCount={selectedTags.length}
            />
          </div>
        </div>
      </form>

      <ArticlePreviewModal
        isOpen={previewOpen}
        onClose={() => setPreviewOpen(false)}
        title={title}
        content={content}
        featuredImage={featuredImage}
        categoryName={categories.find(c => c.category_id === categoryId)?.name || 'General'}
      />
    </div>
  );
};
