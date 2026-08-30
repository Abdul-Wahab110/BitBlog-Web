import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Save, Eye, Send, Calendar, AlertCircle, CheckCircle2, Folder, Clock, Tag, X, Plus, Hash, Archive, FileText } from 'lucide-react';
import { RichEditor } from '../../components/editor/RichEditor';
import { ArticlePreviewModal } from '../../components/editor/ArticlePreviewModal';
import { ImageUploadDropzone } from '../../components/common/ImageUploadDropzone';
import { SeoAeoGeoEditor, SeoData, AeoData, GeoData } from '../../components/editor/SeoAeoGeoEditor';
import { EditorSidebarTools } from '../../components/editor/EditorSidebarTools';
import { generateSlug } from '../../utils/slug';
import { ApiService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export const AddPost: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isAuthor = user?.role === 'Author';

  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [customSlug, setCustomSlug] = useState(false);
  const [excerpt, setExcerpt] = useState('');
  const [content, setContent] = useState('');
  const [featuredImage, setFeaturedImage] = useState('');
  const [categoryId, setCategoryId] = useState<number | undefined>(undefined);
  const [categories, setCategories] = useState<any[]>([]);
  const [status, setStatus] = useState<'draft' | 'published' | 'pending_review' | 'scheduled' | 'archived'>(
    isAuthor ? 'pending_review' : 'published'
  );
  const [scheduledAt, setScheduledAt] = useState('');

  // Topic Tags
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [availableTags, setAvailableTags] = useState<any[]>([]);
  const [tagInput, setTagInput] = useState('');

  // Integrated SEO, AEO, and GEO Settings
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

  const [previewOpen, setPreviewOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    ApiService.getCategories()
      .then(res => {
        if (res && res.data) {
          setCategories(res.data);
          if (res.data.length > 0 && categoryId === undefined) {
            setCategoryId(res.data[0].category_id);
          }
        }
      })
      .catch(() => { });

    ApiService.getTags()
      .then(res => {
        if (res && res.data) {
          setAvailableTags(res.data);
        }
      })
      .catch(() => { });
  }, []);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setTitle(val);
    if (!customSlug) {
      setSlug(generateSlug(val));
    }
  };

  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCustomSlug(true);
    setSlug(generateSlug(e.target.value));
  };

  const handleSubmit = async (e: React.FormEvent, targetStatus?: 'draft' | 'published' | 'scheduled' | 'pending_review' | 'archived') => {
    if (e) e.preventDefault();
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

      const res = await ApiService.createPost(payload);
      setSubmitting(false);

      if (res && res.success) {
        setSuccessMsg(`Article '${title}' saved successfully as ${finalStatus.toUpperCase()}!`);
        setTimeout(() => {
          navigate('/admin/posts');
        }, 1200);
      } else {
        throw new Error(res?.message || 'Failed to create article in database');
      }
    } catch (err: any) {
      setSubmitting(false);
      setErrorMsg(err.message || 'An unexpected error occurred while creating the article');
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

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header Bar with Action Buttons */}
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
            Add New Article
          </h1>
          <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
            Compose, format, and publish stories with direct media uploads and integrated SEO/AEO/GEO
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <button
            type="button"
            onClick={() => setPreviewOpen(true)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.35rem',
              backgroundColor: 'var(--color-surface-alt)',
              color: 'var(--color-text)',
              padding: '0.5rem 0.95rem',
              fontSize: '0.85rem',
              fontWeight: 600,
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--color-border)',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
            }}
          >
            <Eye size={15} /> Preview
          </button>

          <button
            type="button"
            onClick={e => handleSubmit(e, 'draft')}
            disabled={submitting}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.35rem',
              backgroundColor: 'var(--color-surface-alt)',
              color: 'var(--color-text)',
              padding: '0.5rem 0.95rem',
              fontSize: '0.85rem',
              fontWeight: 600,
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--color-border)',
              cursor: submitting ? 'not-allowed' : 'pointer',
              whiteSpace: 'nowrap',
            }}
          >
            <Save size={15} /> Save Draft
          </button>

          {isAuthor ? (
            <button
              type="button"
              onClick={e => handleSubmit(e, 'pending_review')}
              disabled={submitting}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.35rem',
                backgroundColor: 'var(--color-secondary)',
                color: '#FFFFFF',
                padding: '0.5rem 1.25rem',
                fontSize: '0.85rem',
                fontWeight: 700,
                borderRadius: 'var(--radius-md)',
                boxShadow: '0 2px 8px var(--color-secondary-glow)',
                cursor: submitting ? 'not-allowed' : 'pointer',
                whiteSpace: 'nowrap',
                border: 'none',
              }}
            >
              <Send size={15} /> {submitting ? 'Submitting...' : 'Submit for Review'}
            </button>
          ) : status === 'scheduled' ? (
            <button
              type="button"
              onClick={e => handleSubmit(e, 'scheduled')}
              disabled={submitting}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.35rem',
                backgroundColor: 'var(--color-accent)',
                color: '#FFFFFF',
                padding: '0.5rem 1.25rem',
                fontSize: '0.85rem',
                fontWeight: 700,
                borderRadius: 'var(--radius-md)',
                boxShadow: '0 2px 8px rgba(245, 158, 11, 0.35)',
                cursor: submitting ? 'not-allowed' : 'pointer',
                whiteSpace: 'nowrap',
                border: 'none',
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
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.35rem',
                backgroundColor: 'var(--color-secondary)',
                color: '#FFFFFF',
                padding: '0.5rem 1.25rem',
                fontSize: '0.85rem',
                fontWeight: 700,
                borderRadius: 'var(--radius-md)',
                boxShadow: '0 2px 8px var(--color-secondary-glow)',
                cursor: submitting ? 'not-allowed' : 'pointer',
                whiteSpace: 'nowrap',
                border: 'none',
              }}
            >
              <Send size={15} /> {submitting ? 'Publishing...' : 'Publish Now'}
            </button>
          )}
        </div>
      </div>

      {/* Feedback Status Alerts */}
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

      {/* Main Two-Column Layout */}
      <form onSubmit={e => handleSubmit(e)}>
        <div className="editor-layout-grid">
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
                  onChange={handleTitleChange}
                  placeholder="e.g. Modern Web Architecture with Oracle Database & React"
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
                    onChange={handleSlugChange}
                    placeholder="modern-web-architecture"
                    style={{ flex: 1, padding: '0.5rem 0.75rem', fontSize: '0.85rem' }}
                  />
                </div>
              </div>
            </div>

            {/* Direct Featured Image Upload */}
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
                placeholder="A concise summary of the article for archive listings and RSS feeds..."
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
                placeholder="Compose your story here with rich formatting, direct image uploads, headers, lists, code..."
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
            {/* Publishing Status Card */}
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

              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', fontWeight: 600, fontSize: '0.82rem', marginBottom: '0.5rem', color: 'var(--color-text-secondary)' }}>
                  Publication Status
                </label>

                {/* Modern Interactive Status Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.45rem' }}>
                  {(isAuthor
                    ? [
                        { value: 'pending_review', label: 'Submit Review', icon: Clock, color: '#F59E0B', bg: 'rgba(245, 158, 11, 0.14)', glow: 'rgba(245, 158, 11, 0.25)' },
                        { value: 'draft', label: 'Save Draft', icon: FileText, color: '#94A3B8', bg: 'rgba(148, 163, 184, 0.14)', glow: 'rgba(148, 163, 184, 0.2)' },
                        { value: 'scheduled', label: 'Schedule Post', icon: Calendar, color: '#38BDF8', bg: 'rgba(56, 189, 248, 0.14)', glow: 'rgba(56, 189, 248, 0.25)' },
                      ]
                    : [
                        { value: 'published', label: 'Published', icon: CheckCircle2, color: '#10B981', bg: 'rgba(16, 185, 129, 0.14)', glow: 'rgba(16, 185, 129, 0.25)' },
                        { value: 'draft', label: 'Draft', icon: FileText, color: '#94A3B8', bg: 'rgba(148, 163, 184, 0.14)', glow: 'rgba(148, 163, 184, 0.2)' },
                        { value: 'pending_review', label: 'Pending Review', icon: Clock, color: '#F59E0B', bg: 'rgba(245, 158, 11, 0.14)', glow: 'rgba(245, 158, 11, 0.25)' },
                        { value: 'scheduled', label: 'Scheduled', icon: Calendar, color: '#38BDF8', bg: 'rgba(56, 189, 248, 0.14)', glow: 'rgba(56, 189, 248, 0.25)' },
                        { value: 'archived', label: 'Archived', icon: Archive, color: '#818CF8', bg: 'rgba(129, 140, 248, 0.14)', glow: 'rgba(129, 140, 248, 0.25)' },
                      ]
                  ).map(opt => {
                    const isActive = status === opt.value;
                    const Icon = opt.icon;
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setStatus(opt.value as any)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.45rem',
                          padding: '0.55rem 0.75rem',
                          borderRadius: 'var(--radius-md)',
                          border: isActive ? `2px solid ${opt.color}` : '1px solid var(--color-border)',
                          backgroundColor: isActive ? opt.bg : 'var(--color-surface-alt)',
                          color: isActive ? opt.color : 'var(--color-text)',
                          fontWeight: isActive ? 700 : 500,
                          fontSize: '0.82rem',
                          cursor: 'pointer',
                          textAlign: 'left',
                          transition: 'all var(--transition-fast)',
                          boxShadow: isActive ? `0 0 10px ${opt.glow}` : 'none',
                        }}
                      >
                        <Icon size={15} style={{ flexShrink: 0, color: opt.color }} />
                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {opt.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
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
                    htmlFor="post-schedule-date"
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
                    id="post-schedule-date"
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
                    ? 'Saving...'
                    : status === 'pending_review'
                    ? 'Submit for Editorial Review'
                    : status === 'published'
                    ? 'Publish Story'
                    : status === 'scheduled'
                    ? 'Schedule Story'
                    : 'Save Draft'}
                </span>
              </button>
            </div>

            {/* Category Selection Card */}
            <div
              style={{
                backgroundColor: 'var(--color-card)',
                padding: '1.25rem',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--color-border)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem' }}>
                <h3 style={{ fontSize: '0.95rem', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Folder size={16} color="var(--color-secondary)" /> Category
                </h3>
                {categoryId && (
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-secondary)', fontWeight: 700 }}>
                    Selected: {categories.find(c => c.category_id === categoryId)?.name}
                  </span>
                )}
              </div>

              {/* Interactive Category Chips Grid */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.45rem', maxHeight: '220px', overflowY: 'auto', padding: '0.15rem' }}>
                {categories.map(cat => {
                  const isSelected = categoryId === cat.category_id;
                  return (
                    <button
                      key={cat.category_id}
                      type="button"
                      onClick={() => setCategoryId(cat.category_id)}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.4rem',
                        padding: '0.45rem 0.85rem',
                        borderRadius: 'var(--radius-full)',
                        border: isSelected ? '1.5px solid var(--color-secondary)' : '1px solid var(--color-border)',
                        backgroundColor: isSelected ? 'rgba(99, 102, 241, 0.16)' : 'var(--color-surface-alt)',
                        color: isSelected ? 'var(--color-secondary)' : 'var(--color-text)',
                        fontWeight: isSelected ? 700 : 500,
                        fontSize: '0.82rem',
                        cursor: 'pointer',
                        transition: 'all var(--transition-fast)',
                        boxShadow: isSelected ? '0 0 10px rgba(99, 102, 241, 0.25)' : 'none',
                      }}
                    >
                      {isSelected ? <CheckCircle2 size={13} color="var(--color-secondary)" /> : <Folder size={13} style={{ opacity: 0.6 }} />}
                      <span>{cat.name}</span>
                    </button>
                  );
                })}
              </div>
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

      {/* Article Preview Modal */}
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
