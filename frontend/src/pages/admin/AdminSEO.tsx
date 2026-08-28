import React, { useState, useEffect } from 'react';
import {
  Globe,
  Save,
  CheckCircle2,
  AlertCircle,
  FileCode,
  ExternalLink,
  Shield,
  FileText,
  X,
  Copy,
  Check,
} from 'lucide-react';
import { ApiService } from '../../services/api';
import { LoadingState } from '../../components/common/LoadingState';
import { EmptyState } from '../../components/common/EmptyState';
import { SeoAeoGeoEditor, SeoData, AeoData, GeoData } from '../../components/editor/SeoAeoGeoEditor';

export const AdminSEO: React.FC = () => {
  const [posts, setPosts] = useState<any[]>([]);
  const [selectedPostId, setSelectedPostId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Live Technical SEO File Viewer Modal
  const [viewerModal, setViewerModal] = useState<{
    isOpen: boolean;
    type: 'sitemap' | 'robots';
    title: string;
    url: string;
    content: string;
    loading: boolean;
    copied: boolean;
  }>({
    isOpen: false,
    type: 'sitemap',
    title: 'sitemap.xml',
    url: '/sitemap.xml',
    content: '',
    loading: false,
    copied: false,
  });

  // SEO, AEO, and GEO state
  const [seo, setSeo] = useState<SeoData>({
    metaTitle: '',
    metaDescription: '',
    canonicalUrl: '',
    ogTitle: '',
    ogDescription: '',
    ogImage: '',
    twitterTitle: '',
    twitterDescription: '',
    twitterImage: '',
    twitterCard: 'summary_large_image',
    robots: 'index, follow',
    focusKeyword: '',
    secondaryKeywords: '',
    searchIntent: 'informational',
    imageAltText: '',
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

  useEffect(() => {
    ApiService.getAdminPosts()
      .then(res => {
        if (res && res.data && res.data.length > 0) {
          setPosts(res.data);
          setSelectedPostId(res.data[0].post_id);
        }
      })
      .catch(err => {
        console.error('Failed to load posts for SEO:', err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const currentPost = posts.find(p => p.post_id === selectedPostId);

  useEffect(() => {
    if (!selectedPostId || !currentPost) return;

    // Fetch existing SEO metadata for selected article
    ApiService.getSeoByPost(selectedPostId)
      .then(res => {
        const data = res?.data;
        if (data) {
          setSeo({
            metaTitle: data.meta_title || currentPost.title || '',
            metaDescription: data.meta_description || currentPost.excerpt || '',
            canonicalUrl: data.canonical_url || `${window.location.origin}/post/${currentPost.slug || ''}`,
            ogTitle: data.og_title || currentPost.title || '',
            ogDescription: data.og_description || currentPost.excerpt || '',
            ogImage: data.og_image || currentPost.featured_image || '',
            twitterTitle: data.twitter_title || data.og_title || currentPost.title || '',
            twitterDescription: data.twitter_description || data.og_description || currentPost.excerpt || '',
            twitterImage: data.twitter_image || data.og_image || currentPost.featured_image || '',
            twitterCard: data.twitter_card || 'summary_large_image',
            robots: data.robots || 'index, follow',
            focusKeyword: data.focus_keyword || '',
            secondaryKeywords: data.secondary_keywords || '',
            searchIntent: data.search_intent || 'informational',
            imageAltText: data.image_alt_text || '',
          });

          let parsedFaqs: any[] = [];
          if (data.faq_data) {
            try {
              parsedFaqs = JSON.parse(data.faq_data);
            } catch (e) {
              parsedFaqs = [];
            }
          }

          let parsedHowTo: any[] = [];
          if (data.howto_data) {
            try {
              const hData = JSON.parse(data.howto_data);
              parsedHowTo = hData.steps || [];
            } catch (e) {
              parsedHowTo = [];
            }
          }

          setAeo({
            directAnswer: data.direct_answer || '',
            keyTakeaways: data.key_takeaways || '',
            faqList: parsedFaqs,
            howToData: parsedHowTo,
          });

          setGeo({
            locationContext: data.location_context || '',
            sourceCitations: data.references_data || '',
            entityContext: data.entity_context || '',
            factualContext: data.factual_context || '',
          });
        } else {
          // Initialize with current post defaults
          setSeo({
            metaTitle: currentPost.title || '',
            metaDescription: currentPost.excerpt || '',
            canonicalUrl: `${window.location.origin}/post/${currentPost.slug || ''}`,
            ogTitle: currentPost.title || '',
            ogDescription: currentPost.excerpt || '',
            ogImage: currentPost.featured_image || '',
            twitterTitle: currentPost.title || '',
            twitterDescription: currentPost.excerpt || '',
            twitterImage: currentPost.featured_image || '',
            twitterCard: 'summary_large_image',
            robots: 'index, follow',
            focusKeyword: '',
            secondaryKeywords: '',
            searchIntent: 'informational',
            imageAltText: '',
          });

          setAeo({
            directAnswer: '',
            keyTakeaways: '',
            faqList: [],
            howToData: [],
          });

          setGeo({
            locationContext: '',
            sourceCitations: '',
            entityContext: '',
            factualContext: '',
          });
        }
      })
      .catch(() => {
        // Safe fallback initialization
        setSeo({
          metaTitle: currentPost.title || '',
          metaDescription: currentPost.excerpt || '',
          canonicalUrl: `${window.location.origin}/post/${currentPost.slug || ''}`,
          ogTitle: currentPost.title || '',
          ogDescription: currentPost.excerpt || '',
          ogImage: currentPost.featured_image || '',
          twitterTitle: currentPost.title || '',
          twitterDescription: currentPost.excerpt || '',
          twitterImage: currentPost.featured_image || '',
          twitterCard: 'summary_large_image',
          robots: 'index, follow',
          focusKeyword: '',
          secondaryKeywords: '',
          searchIntent: 'informational',
          imageAltText: '',
        });
      });
  }, [selectedPostId, posts]);

  // Open Live Viewer for Sitemap / Robots
  const handleOpenViewer = async (type: 'sitemap' | 'robots') => {
    const isSitemap = type === 'sitemap';
    const targetUrl = isSitemap ? '/sitemap.xml' : '/robots.txt';

    setViewerModal({
      isOpen: true,
      type,
      title: isSitemap ? 'Dynamic XML Sitemap (sitemap.xml)' : 'Search Robots Directives (robots.txt)',
      url: targetUrl,
      content: '',
      loading: true,
      copied: false,
    });

    try {
      const res = await fetch(targetUrl);
      const text = await res.text();
      setViewerModal(prev => ({
        ...prev,
        content: text,
        loading: false,
      }));
    } catch (err: any) {
      setViewerModal(prev => ({
        ...prev,
        content: `Failed to load ${targetUrl}: ${err.message || 'Unknown network error'}`,
        loading: false,
      }));
    }
  };

  const handleCopyContent = () => {
    if (!viewerModal.content) return;
    navigator.clipboard.writeText(viewerModal.content);
    setViewerModal(prev => ({ ...prev, copied: true }));
    setTimeout(() => {
      setViewerModal(prev => ({ ...prev, copied: false }));
    }, 2000);
  };

  const handleSaveSeo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPostId) return;

    setSaving(true);
    setErrorMsg(null);
    setMsg(null);

    try {
      const howtoDataObj = (aeo.howToData && aeo.howToData.length > 0)
        ? { title: currentPost?.title || 'Guide', steps: aeo.howToData }
        : null;

      const payload = {
        meta_title: seo.metaTitle || null,
        meta_description: seo.metaDescription || null,
        canonical_url: seo.canonicalUrl || null,
        og_title: seo.ogTitle || null,
        og_description: seo.ogDescription || null,
        og_image: seo.ogImage || null,
        twitter_title: seo.twitterTitle || seo.ogTitle || null,
        twitter_description: seo.twitterDescription || seo.ogDescription || null,
        twitter_image: seo.twitterImage || seo.ogImage || null,
        twitter_card: seo.twitterCard || 'summary_large_image',
        robots: seo.robots || 'index, follow',
        focus_keyword: seo.focusKeyword || null,
        secondary_keywords: seo.secondaryKeywords || null,
        search_intent: seo.searchIntent || 'informational',
        image_alt_text: seo.imageAltText || null,
        direct_answer: aeo.directAnswer || null,
        key_takeaways: aeo.keyTakeaways || null,
        faq_data: aeo.faqList && aeo.faqList.length > 0 ? JSON.stringify(aeo.faqList) : null,
        howto_data: howtoDataObj ? JSON.stringify(howtoDataObj) : null,
        references_data: geo.sourceCitations || null,
        entity_context: geo.entityContext || null,
        factual_context: geo.factualContext || null,
        location_context: geo.locationContext || null,
      };

      const res = await ApiService.upsertSeoByPost(selectedPostId, payload);
      if (res && res.success) {
        setMsg(`SEO, AEO & GEO metadata for "${currentPost?.title}" saved successfully!`);
        setTimeout(() => setMsg(null), 3500);
      } else {
        throw new Error(res?.message || 'Failed to update SEO settings');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'An error occurred while saving SEO settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <LoadingState message="Loading articles and SEO database..." />;
  }

  if (posts.length === 0) {
    return (
      <EmptyState
        title="No Articles Found"
        description="Create an article first to configure dedicated SEO, AEO, and GEO metadata."
      />
    );
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header Section */}
      <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <h1 style={{ fontSize: '1.6rem', marginBottom: '0.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Globe size={24} color="var(--color-secondary)" /> Professional SEO, AEO & GEO Manager
          </h1>
          <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', margin: 0 }}>
            Configure on-page metadata, answer engine summaries, and generative AI signals with live real-time scoring
          </p>
        </div>

        {/* Technical Sitemap & Robots Action Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <button
            type="button"
            onClick={() => handleOpenViewer('sitemap')}
            title="Click to view live generated sitemap.xml for Google & Bing crawlers"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.45rem 0.85rem',
              backgroundColor: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.82rem',
              fontWeight: 600,
              color: 'var(--color-secondary)',
              cursor: 'pointer',
            }}
          >
            <FileCode size={15} /> View sitemap.xml <ExternalLink size={12} />
          </button>

          <button
            type="button"
            onClick={() => handleOpenViewer('robots')}
            title="Click to view live robots.txt crawl directives"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.45rem 0.85rem',
              backgroundColor: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.82rem',
              fontWeight: 600,
              color: 'var(--color-text)',
              cursor: 'pointer',
            }}
          >
            <Shield size={15} /> View robots.txt <ExternalLink size={12} />
          </button>
        </div>
      </div>

      {msg && (
        <div style={{ padding: '0.85rem 1rem', backgroundColor: 'rgba(16, 185, 129, 0.15)', border: '1px solid var(--color-success)', borderRadius: 'var(--radius-md)', color: 'var(--color-success)', marginBottom: '1.25rem', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <CheckCircle2 size={18} /> {msg}
        </div>
      )}

      {errorMsg && (
        <div style={{ padding: '0.85rem 1rem', backgroundColor: 'rgba(239, 68, 68, 0.12)', border: '1px solid var(--color-danger)', borderRadius: 'var(--radius-md)', color: 'var(--color-danger)', marginBottom: '1.25rem', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <AlertCircle size={18} /> {errorMsg}
        </div>
      )}

      {/* Target Article Selector */}
      <div style={{ backgroundColor: 'var(--color-card)', padding: '1rem 1.25rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)', marginBottom: '1.25rem' }}>
        <label htmlFor="select-article" style={{ display: 'block', fontWeight: 700, marginBottom: '0.4rem', fontSize: '0.85rem' }}>
          Select Target Publication Article *
        </label>
        <select
          id="select-article"
          value={selectedPostId || ''}
          onChange={e => setSelectedPostId(Number(e.target.value))}
          style={{ width: '100%', padding: '0.6rem 0.85rem', fontSize: '0.9rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}
        >
          {posts.map(p => (
            <option key={p.post_id} value={p.post_id}>
              [{p.status.toUpperCase()}] {p.title} (/post/{p.slug})
            </option>
          ))}
        </select>
      </div>

      {/* Comprehensive Live SEO / AEO / GEO Editor */}
      {currentPost && (
        <form onSubmit={handleSaveSeo}>
          <SeoAeoGeoEditor
            seo={seo}
            onChangeSeo={setSeo}
            aeo={aeo}
            onChangeAeo={setAeo}
            geo={geo}
            onChangeGeo={setGeo}
            defaultTitle={currentPost.title}
            defaultExcerpt={currentPost.excerpt}
            defaultImage={currentPost.featured_image}
            content={currentPost.content}
            slug={currentPost.slug}
            authorName={currentPost.author_name}
            categoryName={currentPost.category_name}
          />

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button
              type="submit"
              disabled={saving}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                backgroundColor: 'var(--color-secondary)',
                color: '#FFFFFF',
                padding: '0.75rem 1.5rem',
                borderRadius: 'var(--radius-md)',
                fontWeight: 700,
                fontSize: '0.92rem',
                boxShadow: '0 2px 8px var(--color-secondary-glow)',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              <Save size={18} /> {saving ? 'Saving Changes...' : `Save SEO Settings for Article #${selectedPostId}`}
            </button>
          </div>
        </form>
      )}

      {/* Live Technical SEO Viewer Modal */}
      {viewerModal.isOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '1.5rem',
          }}
          onClick={() => setViewerModal(prev => ({ ...prev, isOpen: false }))}
        >
          <div
            style={{
              backgroundColor: 'var(--color-card)',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--color-border)',
              width: '100%',
              maxWidth: '820px',
              maxHeight: '85vh',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: 'var(--shadow-lg)',
              overflow: 'hidden',
            }}
            onClick={e => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div
              style={{
                padding: '1rem 1.25rem',
                borderBottom: '1px solid var(--color-border)',
                backgroundColor: 'var(--color-surface-alt)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                {viewerModal.type === 'sitemap' ? (
                  <FileCode size={18} color="var(--color-secondary)" />
                ) : (
                  <Shield size={18} color="var(--color-secondary)" />
                )}
                <h3 style={{ fontSize: '1rem', fontWeight: 800, margin: 0 }}>
                  {viewerModal.title}
                </h3>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <a
                  href={viewerModal.url}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.3rem',
                    padding: '0.3rem 0.6rem',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: 'var(--color-surface)',
                    border: '1px solid var(--color-border)',
                    color: 'var(--color-secondary)',
                    textDecoration: 'none',
                  }}
                >
                  Open Raw URL <ExternalLink size={11} />
                </a>

                <button
                  type="button"
                  onClick={handleCopyContent}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.3rem',
                    padding: '0.3rem 0.6rem',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: 'var(--color-surface)',
                    border: '1px solid var(--color-border)',
                    color: viewerModal.copied ? 'var(--color-success)' : 'var(--color-text)',
                    cursor: 'pointer',
                  }}
                >
                  {viewerModal.copied ? <Check size={12} /> : <Copy size={12} />}
                  {viewerModal.copied ? 'Copied!' : 'Copy'}
                </button>

                <button
                  type="button"
                  onClick={() => setViewerModal(prev => ({ ...prev, isOpen: false }))}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    padding: '0.25rem',
                    color: 'var(--color-muted)',
                    cursor: 'pointer',
                  }}
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Modal Body / Code Viewer */}
            <div style={{ padding: '1.25rem', overflowY: 'auto', flex: 1, backgroundColor: 'var(--color-background)' }}>
              {viewerModal.loading ? (
                <LoadingState message={`Fetching real-time ${viewerModal.type === 'sitemap' ? 'sitemap.xml' : 'robots.txt'} output...`} />
              ) : (
                <pre
                  style={{
                    margin: 0,
                    padding: '1rem',
                    backgroundColor: 'var(--color-surface)',
                    border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-md)',
                    fontFamily: 'Consolas, Monaco, monospace',
                    fontSize: '0.84rem',
                    lineHeight: 1.55,
                    color: 'var(--color-text)',
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-all',
                    maxHeight: '58vh',
                    overflowY: 'auto',
                  }}
                >
                  {viewerModal.content}
                </pre>
              )}
            </div>

            {/* Modal Footer */}
            <div
              style={{
                padding: '0.75rem 1.25rem',
                borderTop: '1px solid var(--color-border)',
                backgroundColor: 'var(--color-surface-alt)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontSize: '0.78rem',
                color: 'var(--color-text-secondary)',
              }}
            >
              <span>Endpoint: <code>{viewerModal.url}</code></span>
              <span>Automatically generated from live database</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
