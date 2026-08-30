import React, { useState, useEffect } from 'react';
import {
  Settings,
  Save,
  CheckCircle2,
  AlertCircle,
  Globe,
  Share2,
  Mail,
  Shield,
  MessageSquare,
  Sparkles,
  Image as ImageIcon,
  Compass,
} from 'lucide-react';
import { ApiService } from '../../services/api';
import { LoadingState } from '../../components/common/LoadingState';
import { useSettings } from '../../context/SettingsContext';
import { ImageUploadDropzone } from '../../components/common/ImageUploadDropzone';

export const AdminSettings: React.FC = () => {
  const { settings: globalSettings, loading, updateSettings: updateGlobalSettings } = useSettings();
  const [settings, setSettings] = useState<any>(globalSettings);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    setSettings(globalSettings);
  }, [globalSettings]);

  const handleChange = (key: string, val: any) => {
    setSettings((prev: any) => ({ ...prev, [key]: val }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setErrorMsg(null);
    setMsg(null);

    try {
      const res = await updateGlobalSettings(settings);
      if (res && res.success !== false) {
        setMsg('System, Publication & Favicon settings saved to database successfully!');
        setTimeout(() => setMsg(null), 3500);
      } else {
        throw new Error(res?.message || 'Failed to update settings in database');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'An error occurred while saving system settings.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <LoadingState message="Fetching live system configuration from database..." />;
  }

  const effectiveTitle = settings.default_seo_title || `${settings.site_name || 'BitBlog'} - Publication & Content Platform`;
  const effectiveFavicon = settings.site_favicon || '/favicon.svg';

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.6rem', marginBottom: '0.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Settings size={24} color="var(--color-secondary)" /> System & Publication Settings
        </h1>
        <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
          Manage global publication identity, favicon, browser title, SEO defaults, canonical URL, and feature toggles
        </p>
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

      {/* Live Browser Tab Simulation Box */}
      <div
        style={{
          backgroundColor: 'var(--color-surface-alt)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-lg)',
          padding: '1rem 1.25rem',
          marginBottom: '1.5rem',
        }}
      >
        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '0.5rem' }}>
          Live Browser Tab Simulation
        </span>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            backgroundColor: 'var(--color-card)',
            border: '1px solid var(--color-border)',
            borderRadius: '8px 8px 0 0',
            padding: '0.5rem 1rem',
            maxWidth: '360px',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <img
            src={effectiveFavicon}
            alt="Favicon Preview"
            style={{ width: '18px', height: '18px', objectFit: 'contain', borderRadius: '3px' }}
            onError={(e: any) => {
              e.currentTarget.src = '/favicon.svg';
            }}
          />
          <span
            style={{
              fontSize: '0.82rem',
              fontWeight: 600,
              color: 'var(--color-text)',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {effectiveTitle}
          </span>
        </div>
      </div>

      <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {/* 1. Publication Identity & Brand */}
        <div style={{ backgroundColor: 'var(--color-card)', padding: '1.25rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)' }}>
          <h3 style={{ fontSize: '1rem', marginBottom: '1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Globe size={16} color="var(--color-secondary)" /> 1. Publication Identity & Contact
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem' }}>
            <div>
              <label htmlFor="site-name" style={{ display: 'block', fontWeight: 600, marginBottom: '0.25rem', fontSize: '0.83rem' }}>Publication Name *</label>
              <input id="site-name" type="text" value={settings.site_name || ''} onChange={e => handleChange('site_name', e.target.value)} required style={{ width: '100%', padding: '0.55rem 0.75rem', fontSize: '0.85rem' }} />
            </div>

            <div>
              <label htmlFor="contact-email" style={{ display: 'block', fontWeight: 600, marginBottom: '0.25rem', fontSize: '0.83rem' }}>Contact / Editorial Email *</label>
              <input id="contact-email" type="email" value={settings.contact_email || ''} onChange={e => handleChange('contact_email', e.target.value)} required style={{ width: '100%', padding: '0.55rem 0.75rem', fontSize: '0.85rem' }} />
            </div>

            <div style={{ gridColumn: '1 / -1' }}>
              <label htmlFor="site-desc" style={{ display: 'block', fontWeight: 600, marginBottom: '0.25rem', fontSize: '0.83rem' }}>Publication Description</label>
              <textarea id="site-desc" rows={2} value={settings.site_description || ''} onChange={e => handleChange('site_description', e.target.value)} style={{ width: '100%', padding: '0.55rem 0.75rem', fontSize: '0.85rem' }} />
            </div>

            <div style={{ gridColumn: '1 / -1' }}>
              <label htmlFor="footer-text" style={{ display: 'block', fontWeight: 600, marginBottom: '0.25rem', fontSize: '0.83rem' }}>Footer Copyright Text</label>
              <input id="footer-text" type="text" value={settings.footer_text || ''} onChange={e => handleChange('footer_text', e.target.value)} style={{ width: '100%', padding: '0.55rem 0.75rem', fontSize: '0.85rem' }} />
            </div>
          </div>
        </div>

        {/* 2. Visual Branding: Favicon & Logo */}
        <div style={{ backgroundColor: 'var(--color-card)', padding: '1.25rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)' }}>
          <h3 style={{ fontSize: '1rem', marginBottom: '1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <ImageIcon size={16} color="var(--color-secondary)" /> 2. Favicon & Visual Branding
          </h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
            {/* Favicon Upload */}
            <div>
              <label style={{ display: 'block', fontWeight: 700, marginBottom: '0.35rem', fontSize: '0.85rem' }}>
                Website Favicon (Browser Tab Icon)
              </label>
              <p style={{ fontSize: '0.78rem', color: 'var(--color-muted)', marginBottom: '0.6rem' }}>
                Upload or paste image URL (PNG, SVG, ICO, WEBP). Recommended size: 32x32px or 64x64px.
              </p>
              <ImageUploadDropzone
                value={settings.site_favicon}
                onChange={url => handleChange('site_favicon', url)}
                label="Upload Website Favicon"
                helperText="Supports SVG, PNG, ICO, WEBP (Max 2 MB)"
              />
            </div>

            {/* Site Logo Upload */}
            <div>
              <label style={{ display: 'block', fontWeight: 700, marginBottom: '0.35rem', fontSize: '0.85rem' }}>
                Publication Header Logo / Brand Asset
              </label>
              <p style={{ fontSize: '0.78rem', color: 'var(--color-muted)', marginBottom: '0.6rem' }}>
                Upload custom publication banner or header logo asset.
              </p>
              <ImageUploadDropzone
                value={settings.site_logo}
                onChange={url => handleChange('site_logo', url)}
                label="Upload Publication Logo"
                helperText="Supports SVG, PNG, WEBP (Max 5 MB)"
              />
            </div>
          </div>
        </div>

        {/* 3. Global SEO & Canonical Settings */}
        <div style={{ backgroundColor: 'var(--color-card)', padding: '1.25rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)' }}>
          <h3 style={{ fontSize: '1rem', marginBottom: '1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Shield size={16} color="var(--color-secondary)" /> 3. Global SEO Defaults & Canonical Base URL
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label htmlFor="canonical-base" style={{ display: 'block', fontWeight: 600, marginBottom: '0.25rem', fontSize: '0.83rem' }}>Production Canonical Base URL *</label>
              <input id="canonical-base" type="url" value={settings.site_canonical_base_url || ''} onChange={e => handleChange('site_canonical_base_url', e.target.value)} required style={{ width: '100%', padding: '0.55rem 0.75rem', fontSize: '0.85rem' }} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem' }}>
              <div>
                <label htmlFor="def-title" style={{ display: 'block', fontWeight: 600, marginBottom: '0.25rem', fontSize: '0.83rem' }}>Default Browser Tab & Meta Title</label>
                <input id="def-title" type="text" value={settings.default_seo_title || ''} onChange={e => handleChange('default_seo_title', e.target.value)} placeholder="BitBlog CMS - Publication & Content Platform" style={{ width: '100%', padding: '0.55rem 0.75rem', fontSize: '0.85rem' }} />
              </div>

              <div>
                <label htmlFor="def-robots" style={{ display: 'block', fontWeight: 600, marginBottom: '0.25rem', fontSize: '0.83rem' }}>Default Meta Robots Directive</label>
                <select id="def-robots" value={settings.default_robots || 'index, follow'} onChange={e => handleChange('default_robots', e.target.value)} style={{ width: '100%', padding: '0.55rem 0.75rem', fontSize: '0.85rem' }}>
                  <option value="index, follow">index, follow (Allow Indexing)</option>
                  <option value="noindex, follow">noindex, follow</option>
                  <option value="noindex, nofollow">noindex, nofollow</option>
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="def-desc" style={{ display: 'block', fontWeight: 600, marginBottom: '0.25rem', fontSize: '0.83rem' }}>Default Meta Description</label>
              <textarea id="def-desc" rows={2} value={settings.default_meta_description || ''} onChange={e => handleChange('default_meta_description', e.target.value)} style={{ width: '100%', padding: '0.55rem 0.75rem', fontSize: '0.85rem' }} />
            </div>

            <div>
              <label htmlFor="geo-org" style={{ display: 'block', fontWeight: 600, marginBottom: '0.25rem', fontSize: '0.83rem' }}>Publisher / Organization Entity Name (Schema.org / GEO)</label>
              <input id="geo-org" type="text" value={settings.geo_organization_name || ''} onChange={e => handleChange('geo_organization_name', e.target.value)} style={{ width: '100%', padding: '0.55rem 0.75rem', fontSize: '0.85rem' }} />
            </div>
          </div>
        </div>

        {/* 4. Social Profiles */}
        <div style={{ backgroundColor: 'var(--color-card)', padding: '1.25rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)' }}>
          <h3 style={{ fontSize: '1rem', marginBottom: '1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Share2 size={16} color="var(--color-secondary)" /> 4. Official Social Channels
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem' }}>
            <div>
              <label htmlFor="social-fb" style={{ display: 'block', fontWeight: 600, marginBottom: '0.25rem', fontSize: '0.83rem' }}>Facebook URL</label>
              <input id="social-fb" type="url" value={settings.social_facebook || ''} onChange={e => handleChange('social_facebook', e.target.value)} placeholder="https://facebook.com/bitblog" style={{ width: '100%', padding: '0.55rem 0.75rem', fontSize: '0.85rem' }} />
            </div>
            <div>
              <label htmlFor="social-li" style={{ display: 'block', fontWeight: 600, marginBottom: '0.25rem', fontSize: '0.83rem' }}>LinkedIn URL</label>
              <input id="social-li" type="url" value={settings.social_linkedin || ''} onChange={e => handleChange('social_linkedin', e.target.value)} placeholder="https://linkedin.com/company/bitblog" style={{ width: '100%', padding: '0.55rem 0.75rem', fontSize: '0.85rem' }} />
            </div>
          </div>
        </div>

        {/* 5. Feature Toggles */}
        <div style={{ backgroundColor: 'var(--color-card)', padding: '1.25rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)' }}>
          <h3 style={{ fontSize: '1rem', marginBottom: '1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Sparkles size={16} color="var(--color-secondary)" /> 5. Publication Feature Controls & Toggles
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.25rem' }}>
            <div>
              <label htmlFor="posts-per-page" style={{ display: 'block', fontWeight: 600, marginBottom: '0.25rem', fontSize: '0.83rem' }}>Articles Per Page (Pagination)</label>
              <input id="posts-per-page" type="number" min={1} max={50} value={settings.posts_per_page || 10} onChange={e => handleChange('posts_per_page', Number(e.target.value))} style={{ width: '100%', padding: '0.55rem 0.75rem', fontSize: '0.85rem' }} />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', justifyContent: 'center' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600 }}>
                <input
                  type="checkbox"
                  checked={Boolean(settings.comments_enabled)}
                  onChange={e => handleChange('comments_enabled', e.target.checked)}
                  style={{ width: '16px', height: '16px' }}
                />
                Allow Reader Comments & Discussions
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600 }}>
                <input
                  type="checkbox"
                  checked={Boolean(settings.newsletter_enabled)}
                  onChange={e => handleChange('newsletter_enabled', e.target.checked)}
                  style={{ width: '16px', height: '16px' }}
                />
                Enable Newsletter Subscriptions
              </label>
            </div>
          </div>
        </div>

        {/* 6. Editorial Desk & Public Contact Module Configuration */}
        <div style={{ backgroundColor: 'var(--color-card)', padding: '1.25rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)' }}>
          <h3 style={{ fontSize: '1rem', marginBottom: '1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Mail size={16} color="var(--color-secondary)" /> 6. Editorial Desk & Contact Module Management
          </h3>

          {/* Department Direct Email Addresses */}
          <div style={{ marginBottom: '1.25rem' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--color-secondary)', display: 'block', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              A. Direct Newsroom Email Inboxes
            </span>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
              <div>
                <label htmlFor="contact_email" style={{ display: 'block', fontWeight: 600, marginBottom: '0.25rem', fontSize: '0.83rem' }}>Primary News Tips & Pitches Email *</label>
                <input id="contact_email" type="email" value={settings.contact_email || ''} onChange={e => handleChange('contact_email', e.target.value)} required placeholder="editorial@bitblog.com" style={{ width: '100%', padding: '0.55rem 0.75rem', fontSize: '0.85rem' }} />
              </div>

              <div>
                <label htmlFor="contact_partnerships_email" style={{ display: 'block', fontWeight: 600, marginBottom: '0.25rem', fontSize: '0.83rem' }}>Partnerships & Ads Email</label>
                <input id="contact_partnerships_email" type="email" value={settings.contact_partnerships_email || ''} onChange={e => handleChange('contact_partnerships_email', e.target.value)} placeholder="partners@bitblog.com" style={{ width: '100%', padding: '0.55rem 0.75rem', fontSize: '0.85rem' }} />
              </div>

              <div>
                <label htmlFor="contact_press_email" style={{ display: 'block', fontWeight: 600, marginBottom: '0.25rem', fontSize: '0.83rem' }}>Corrections & Press Desk Email</label>
                <input id="contact_press_email" type="email" value={settings.contact_press_email || ''} onChange={e => handleChange('contact_press_email', e.target.value)} placeholder="press@bitblog.com" style={{ width: '100%', padding: '0.55rem 0.75rem', fontSize: '0.85rem' }} />
              </div>
            </div>
          </div>

          {/* Inquiry Department Labels */}
          <div style={{ marginBottom: '1.25rem' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--color-secondary)', display: 'block', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              B. Inquiry Department Selector Button Labels
            </span>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.85rem' }}>
              <div>
                <label htmlFor="dept_pitch" style={{ display: 'block', fontWeight: 600, marginBottom: '0.25rem', fontSize: '0.82rem' }}>Dept 1 (Pitches / Tips)</label>
                <input id="dept_pitch" type="text" value={settings.contact_pitch_dept_name || 'Story Pitch / Tip'} onChange={e => handleChange('contact_pitch_dept_name', e.target.value)} style={{ width: '100%', padding: '0.5rem 0.75rem', fontSize: '0.85rem' }} />
              </div>

              <div>
                <label htmlFor="dept_general" style={{ display: 'block', fontWeight: 600, marginBottom: '0.25rem', fontSize: '0.82rem' }}>Dept 2 (General)</label>
                <input id="dept_general" type="text" value={settings.contact_general_dept_name || 'General Inquiry'} onChange={e => handleChange('contact_general_dept_name', e.target.value)} style={{ width: '100%', padding: '0.5rem 0.75rem', fontSize: '0.85rem' }} />
              </div>

              <div>
                <label htmlFor="dept_partner" style={{ display: 'block', fontWeight: 600, marginBottom: '0.25rem', fontSize: '0.82rem' }}>Dept 3 (Partnerships)</label>
                <input id="dept_partner" type="text" value={settings.contact_partnership_dept_name || 'Partnership & Ads'} onChange={e => handleChange('contact_partnership_dept_name', e.target.value)} style={{ width: '100%', padding: '0.5rem 0.75rem', fontSize: '0.85rem' }} />
              </div>

              <div>
                <label htmlFor="dept_correction" style={{ display: 'block', fontWeight: 600, marginBottom: '0.25rem', fontSize: '0.82rem' }}>Dept 4 (Corrections / Press)</label>
                <input id="dept_correction" type="text" value={settings.contact_correction_dept_name || 'Correction / Press'} onChange={e => handleChange('contact_correction_dept_name', e.target.value)} style={{ width: '100%', padding: '0.5rem 0.75rem', fontSize: '0.85rem' }} />
              </div>
            </div>
          </div>

          {/* Guarantees & SLA Badges */}
          <div style={{ marginBottom: '1.25rem' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--color-secondary)', display: 'block', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              C. Editorial Badges & SLA Response Texts
            </span>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '0.85rem' }}>
              <div>
                <label htmlFor="sla_text" style={{ display: 'block', fontWeight: 600, marginBottom: '0.25rem', fontSize: '0.82rem' }}>SLA Guarantee Text</label>
                <input id="sla_text" type="text" value={settings.contact_sla_text || 'Response under 24 hours'} onChange={e => handleChange('contact_sla_text', e.target.value)} style={{ width: '100%', padding: '0.5rem 0.75rem', fontSize: '0.85rem' }} />
              </div>

              <div>
                <label htmlFor="conf_text" style={{ display: 'block', fontWeight: 600, marginBottom: '0.25rem', fontSize: '0.82rem' }}>Confidentiality Badge Text</label>
                <input id="conf_text" type="text" value={settings.contact_confidentiality_text || 'Confidential Source Protection'} onChange={e => handleChange('contact_confidentiality_text', e.target.value)} style={{ width: '100%', padding: '0.5rem 0.75rem', fontSize: '0.85rem' }} />
              </div>

              <div>
                <label htmlFor="cov_text" style={{ display: 'block', fontWeight: 600, marginBottom: '0.25rem', fontSize: '0.82rem' }}>Coverage Badge Text</label>
                <input id="cov_text" type="text" value={settings.contact_global_coverage_text || 'Global Tech Coverage'} onChange={e => handleChange('contact_global_coverage_text', e.target.value)} style={{ width: '100%', padding: '0.5rem 0.75rem', fontSize: '0.85rem' }} />
              </div>
            </div>
          </div>

          {/* "Want to Write for Us" CTA Banner Controls */}
          <div style={{ marginBottom: '1.25rem' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--color-secondary)', display: 'block', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              D. "Want to Write for Us?" Call-to-Action Card
            </span>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '0.85rem' }}>
              <div>
                <label htmlFor="cta_title" style={{ display: 'block', fontWeight: 600, marginBottom: '0.25rem', fontSize: '0.82rem' }}>CTA Title</label>
                <input id="cta_title" type="text" value={settings.contact_cta_title || 'Want to Write for BitBlog?'} onChange={e => handleChange('contact_cta_title', e.target.value)} style={{ width: '100%', padding: '0.5rem 0.75rem', fontSize: '0.85rem' }} />
              </div>

              <div>
                <label htmlFor="cta_desc" style={{ display: 'block', fontWeight: 600, marginBottom: '0.25rem', fontSize: '0.82rem' }}>CTA Description</label>
                <input id="cta_desc" type="text" value={settings.contact_cta_desc || 'Publish your insights to thousands of tech readers worldwide.'} onChange={e => handleChange('contact_cta_desc', e.target.value)} style={{ width: '100%', padding: '0.5rem 0.75rem', fontSize: '0.85rem' }} />
              </div>

              <div>
                <label htmlFor="cta_btn_text" style={{ display: 'block', fontWeight: 600, marginBottom: '0.25rem', fontSize: '0.82rem' }}>Button Text</label>
                <input id="cta_btn_text" type="text" value={settings.contact_cta_btn_text || 'Apply as Author'} onChange={e => handleChange('contact_cta_btn_text', e.target.value)} style={{ width: '100%', padding: '0.5rem 0.75rem', fontSize: '0.85rem' }} />
              </div>

              <div>
                <label htmlFor="cta_btn_link" style={{ display: 'block', fontWeight: 600, marginBottom: '0.25rem', fontSize: '0.82rem' }}>Button Destination URL</label>
                <input id="cta_btn_link" type="text" value={settings.contact_cta_btn_link || '/apply'} onChange={e => handleChange('contact_cta_btn_link', e.target.value)} style={{ width: '100%', padding: '0.5rem 0.75rem', fontSize: '0.85rem' }} />
              </div>
            </div>
          </div>

          {/* Editorial FAQs Editor */}
          <div>
            <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--color-secondary)', display: 'block', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              E. Editorial FAQ Questions & Answers
            </span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {/* FAQ 1 */}
              <div style={{ padding: '0.85rem', backgroundColor: 'var(--color-surface-alt)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
                <label htmlFor="faq_1_q" style={{ display: 'block', fontWeight: 600, marginBottom: '0.25rem', fontSize: '0.82rem' }}>FAQ 1 Question</label>
                <input id="faq_1_q" type="text" value={settings.contact_faq_1_q || 'How do I pitch a story or apply as a contributing writer?'} onChange={e => handleChange('contact_faq_1_q', e.target.value)} style={{ width: '100%', padding: '0.45rem 0.65rem', fontSize: '0.85rem', marginBottom: '0.45rem' }} />
                <label htmlFor="faq_1_a" style={{ display: 'block', fontWeight: 600, marginBottom: '0.25rem', fontSize: '0.82rem' }}>FAQ 1 Answer</label>
                <textarea id="faq_1_a" rows={2} value={settings.contact_faq_1_a || 'We welcome original tech journalism, deep-dives, and tutorials! You can apply directly through our Contributor Program portal or use this form under "Story Pitch".'} onChange={e => handleChange('contact_faq_1_a', e.target.value)} style={{ width: '100%', padding: '0.45rem 0.65rem', fontSize: '0.85rem' }} />
              </div>

              {/* FAQ 2 */}
              <div style={{ padding: '0.85rem', backgroundColor: 'var(--color-surface-alt)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
                <label htmlFor="faq_2_q" style={{ display: 'block', fontWeight: 600, marginBottom: '0.25rem', fontSize: '0.82rem' }}>FAQ 2 Question</label>
                <input id="faq_2_q" type="text" value={settings.contact_faq_2_q || 'What is the standard editorial response time?'} onChange={e => handleChange('contact_faq_2_q', e.target.value)} style={{ width: '100%', padding: '0.45rem 0.65rem', fontSize: '0.85rem', marginBottom: '0.45rem' }} />
                <label htmlFor="faq_2_a" style={{ display: 'block', fontWeight: 600, marginBottom: '0.25rem', fontSize: '0.82rem' }}>FAQ 2 Answer</label>
                <textarea id="faq_2_a" rows={2} value={settings.contact_faq_2_a || 'Our editors review incoming tips and inquiries Monday through Friday. Standard responses are delivered within 24 business hours.'} onChange={e => handleChange('contact_faq_2_a', e.target.value)} style={{ width: '100%', padding: '0.45rem 0.65rem', fontSize: '0.85rem' }} />
              </div>

              {/* FAQ 3 */}
              <div style={{ padding: '0.85rem', backgroundColor: 'var(--color-surface-alt)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
                <label htmlFor="faq_3_q" style={{ display: 'block', fontWeight: 600, marginBottom: '0.25rem', fontSize: '0.82rem' }}>FAQ 3 Question</label>
                <input id="faq_3_q" type="text" value={settings.contact_faq_3_q || 'Can I submit an anonymous news tip or confidential whistleblower material?'} onChange={e => handleChange('contact_faq_3_q', e.target.value)} style={{ width: '100%', padding: '0.45rem 0.65rem', fontSize: '0.85rem', marginBottom: '0.45rem' }} />
                <label htmlFor="faq_3_a" style={{ display: 'block', fontWeight: 600, marginBottom: '0.25rem', fontSize: '0.82rem' }}>FAQ 3 Answer</label>
                <textarea id="faq_3_a" rows={2} value={settings.contact_faq_3_a || 'Yes. All news tips submitted through our editorial desk are handled with strict journalistic confidentiality under our source protection guidelines.'} onChange={e => handleChange('contact_faq_3_a', e.target.value)} style={{ width: '100%', padding: '0.45rem 0.65rem', fontSize: '0.85rem' }} />
              </div>
            </div>
          </div>
        </div>

        {/* Save Actions */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
          <button
            type="submit"
            disabled={saving}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              backgroundColor: 'var(--color-secondary)',
              color: '#FFFFFF',
              padding: '0.75rem 1.75rem',
              borderRadius: 'var(--radius-md)',
              fontWeight: 700,
              fontSize: '0.92rem',
              border: 'none',
              cursor: 'pointer',
              boxShadow: '0 2px 8px var(--color-secondary-glow)',
            }}
          >
            <Save size={18} /> {saving ? 'Saving to Database...' : 'Save System & Publication Settings'}
          </button>
        </div>
      </form>
    </div>
  );
};
