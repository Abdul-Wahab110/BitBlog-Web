import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Save, Eye, Send, AlertCircle, CheckCircle2, Folder, ArrowLeft, Tag, X, Plus, Hash } from 'lucide-react';
import { RichEditor } from '../../components/editor/RichEditor';
import { ArticlePreviewModal } from '../../components/editor/ArticlePreviewModal';
import { ImageUploadDropzone } from '../../components/common/ImageUploadDropzone';
import { SeoAeoGeoEditor, SeoData, AeoData, GeoData } from '../../components/editor/SeoAeoGeoEditor';
import { generateSlug } from '../../utils/slug';
import { ApiService } from '../../services/api';
import { SeoHead } from '../../components/common/SeoHead';
import { useSettings } from '../../context/SettingsContext';

export const UserAddArticle: React.FC = () => {
  const navigate = useNavigate();
  const { settings } = useSettings();
  const siteName = settings.site_name || 'BitBlog';

  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [customSlug, setCustomSlug] = useState(false);
  const [excerpt, setExcerpt] = useState('');
  const [content, setContent] = useState('');
  const [featuredImage, setFeaturedImage] = useState('');
  const [categoryId, setCategoryId] = useState<number | undefined>(undefined);
  const [categories, setCategories] = useState<any[]>([]);

  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [availableTags, setAvailableTags] = useState<any[]>([]);
  const [tagInput, setTagInput] = useState('');

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

  const handleSave = async (targetStatus: 'draft' | 'pending_review') => {
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!title.trim() || title.trim().length < 3) {
      setErrorMsg('Article title must be at least 3 characters long.');
      return;
    }

    if (!content.trim() || content.trim().length < 10) {
      setErrorMsg('Article content must be at least 10 characters long.');
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
        status: targetStatus,
        seo,
        aeo,
        geo,
      };

      const res = await ApiService.createUserArticle(payload);
      setSubmitting(false);

      if (res && res.success) {
        setSuccessMsg(
          targetStatus === 'pending_review'
            ? 'Your article has been submitted for editorial review!'
            : 'Article draft saved successfully!'
        );
        setTimeout(() => {
          navigate('/user/articles');
        }, 1200);
      } else {
        throw new Error(res?.message || 'Failed to submit article');
      }
    } catch (err: any) {
      setSubmitting(false);
      setErrorMsg(err.message || 'An error occurred while saving the article');
    }
  };

  return (
    <div style={{ maxWidth: '1050px', margin: '0 auto' }}>
      <SeoHead
        title={`Write Article | ${siteName}`}
        description={`Write and submit a new article for editorial approval on ${siteName}.`}
        robots="noindex, nofollow"
      />

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
          <button
            type="button"
            onClick={() => navigate('/user/articles')}
            style={{
              background: 'transparent',
              color: 'var(--color-muted)',
              fontSize: '0.82rem',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.3rem',
              marginBottom: '0.35rem',
              padding: 0,
            }}
          >
            <ArrowLeft size={14} /> Back to My Articles
          </button>
          <h1 style={{ fontSize: '1.65rem', fontWeight: 800, margin: 0, fontFamily: 'var(--font-heading)' }}>
            Write New Story
          </h1>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={() => setPreviewOpen(true)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.35rem',
              padding: '0.5rem 0.95rem',
              backgroundColor: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.85rem',
              fontWeight: 600,
              color: 'var(--color-text)',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
            }}
          >
            <Eye size={15} /> Preview
          </button>

          <button
            type="button"
            disabled={submitting}
            onClick={() => handleSave('draft')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.35rem',
              padding: '0.5rem 0.95rem',
              backgroundColor: 'var(--color-surface-alt)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.85rem',
              fontWeight: 600,
              color: 'var(--color-text)',
              cursor: submitting ? 'not-allowed' : 'pointer',
              whiteSpace: 'nowrap',
            }}
          >
            <Save size={15} /> Save Draft
          </button>

          <button
            type="button"
            disabled={submitting}
            onClick={() => handleSave('pending_review')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.35rem',
              padding: '0.5rem 1.15rem',
              backgroundColor: 'var(--color-secondary)',
              color: '#FFFFFF',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.85rem',
              fontWeight: 700,
              boxShadow: '0 2px 8px var(--color-secondary-glow)',
              cursor: submitting ? 'not-allowed' : 'pointer',
              whiteSpace: 'nowrap',
              border: 'none',
            }}
          >
            <Send size={15} /> {submitting ? 'Submitting...' : 'Submit for Review'}
          </button>
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

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

        <div
          style={{
            padding: '1.5rem',
            backgroundColor: 'var(--color-card)',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--color-border)',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <div style={{ marginBottom: '1.25rem' }}>
            <label htmlFor="user-post-title" style={{ display: 'block', fontWeight: 700, marginBottom: '0.4rem', fontSize: '0.9rem' }}>
              Article Title *
            </label>
            <input
              id="user-post-title"
              type="text"
              value={title}
              onChange={handleTitleChange}
              placeholder="e.g. Modern Database Paradigms for Next-Gen Web Platforms"
              required
              style={{ width: '100%', padding: '0.75rem 1rem', fontSize: '1.05rem', fontWeight: 600 }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
            <div>
              <label htmlFor="user-post-slug" style={{ display: 'block', fontWeight: 600, marginBottom: '0.35rem', fontSize: '0.82rem' }}>
                URL Slug
              </label>
              <input
                id="user-post-slug"
                type="text"
                value={slug}
                onChange={handleSlugChange}
                placeholder="url-friendly-slug"
                style={{ width: '100%', padding: '0.6rem 0.85rem', fontSize: '0.85rem' }}
              />
            </div>

            <div>
              <label htmlFor="user-post-category" style={{ display: 'block', fontWeight: 600, marginBottom: '0.35rem', fontSize: '0.82rem' }}>
                Primary Category
              </label>
              <select
                id="user-post-category"
                value={categoryId}
                onChange={e => setCategoryId(Number(e.target.value))}
                style={{ width: '100%', padding: '0.6rem 0.85rem', fontSize: '0.85rem' }}
              >
                {categories.map(cat => (
                  <option key={cat.category_id} value={cat.category_id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ marginTop: '1.25rem', borderTop: '1px solid var(--color-border)', paddingTop: '1rem' }}>
            <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.35rem', fontSize: '0.82rem' }}>
              <Tag size={13} style={{ display: 'inline', marginRight: '4px' }} /> Topic Tags (Keywords)
            </label>
            <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '0.6rem' }}>
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
                placeholder="Type tag name and press Enter (e.g. AI, React, Cloud)..."
                style={{ flex: 1, padding: '0.5rem 0.75rem', fontSize: '0.85rem' }}
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
                  padding: '0.5rem 0.85rem',
                  backgroundColor: 'var(--color-secondary)',
                  color: '#FFF',
                  borderRadius: 'var(--radius-sm)',
                  border: 'none',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                <Plus size={14} /> Add
              </button>
            </div>

            {selectedTags.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '0.5rem' }}>
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

            {availableTags.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem', marginTop: '0.4rem' }}>
                <span style={{ fontSize: '0.72rem', color: 'var(--color-muted)', alignSelf: 'center', fontWeight: 600 }}>Suggestions:</span>
                {availableTags.slice(0, 8).map(t => {
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
            )}
          </div>
        </div>

        <div
          style={{
            padding: '1.5rem',
            backgroundColor: 'var(--color-card)',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--color-border)',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <label style={{ display: 'block', fontWeight: 700, marginBottom: '0.5rem', fontSize: '0.9rem' }}>
            Featured Cover Image
          </label>
          <ImageUploadDropzone
            value={featuredImage}
            onChange={url => setFeaturedImage(url)}
            label="Upload story cover image"
          />
        </div>

        <div
          style={{
            padding: '1.5rem',
            backgroundColor: 'var(--color-card)',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--color-border)',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <label htmlFor="user-post-excerpt" style={{ display: 'block', fontWeight: 700, marginBottom: '0.4rem', fontSize: '0.9rem' }}>
            Story Excerpt / Summary
          </label>
          <textarea
            id="user-post-excerpt"
            rows={3}
            value={excerpt}
            onChange={e => setExcerpt(e.target.value)}
            placeholder="A compelling 1-2 sentence lead summary of your article..."
            style={{ width: '100%', padding: '0.75rem 1rem', fontSize: '0.88rem' }}
          />
        </div>

        <div
          style={{
            padding: '1.5rem',
            backgroundColor: 'var(--color-card)',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--color-border)',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <label style={{ display: 'block', fontWeight: 700, marginBottom: '0.65rem', fontSize: '0.9rem' }}>
            Article Body Content *
          </label>
          <RichEditor
            value={content}
            onChange={val => setContent(val)}
            placeholder="Write your story here with rich headings, direct image uploads, code blocks, and formatted lists..."
            minHeight="420px"
          />
        </div>

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

        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '0.75rem',
            padding: '1.25rem 0',
          }}
        >
          <button
            type="button"
            disabled={submitting}
            onClick={() => handleSave('draft')}
            style={{
              padding: '0.65rem 1.25rem',
              backgroundColor: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-md)',
              fontWeight: 600,
              fontSize: '0.9rem',
              color: 'var(--color-text)',
            }}
          >
            Save as Draft
          </button>

          <button
            type="button"
            disabled={submitting}
            onClick={() => handleSave('pending_review')}
            style={{
              padding: '0.65rem 1.5rem',
              backgroundColor: 'var(--color-secondary)',
              color: '#FFFFFF',
              borderRadius: 'var(--radius-md)',
              fontWeight: 700,
              fontSize: '0.9rem',
              boxShadow: '0 2px 8px var(--color-secondary-glow)',
            }}
          >
            {submitting ? 'Submitting...' : 'Submit for Review'}
          </button>
        </div>
      </div>

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

