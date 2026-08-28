import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Folder, ArrowRight, Layers, Image as ImageIcon, BookOpen } from 'lucide-react';
import { LoadingState } from '../../components/common/LoadingState';
import { EmptyState } from '../../components/common/EmptyState';
import { SeoHead } from '../../components/common/SeoHead';
import { ApiService } from '../../services/api';
import { useSettings } from '../../context/SettingsContext';

export const Categories: React.FC = () => {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { settings } = useSettings();

  useEffect(() => {
    ApiService.getCategories()
      .then(res => {
        if (res && res.data) {
          setCategories(res.data);
        }
      })
      .catch(() => {
        setCategories([]);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  // Separate top-level categories and subcategories
  const topLevelCategories = categories.filter(c => !c.parent_category_id && !c.parent_id);

  return (
    <div className="container" style={{ paddingTop: '1.5rem', paddingBottom: '3rem' }}>
      <SeoHead
        title={`Explore Topic Categories | ${settings.site_name || 'BitBlog'}`}
        description="Browse all subject matters, technologies, and editorial categories."
        canonicalUrl="/categories"
        ogTitle={`Publication Categories | ${settings.site_name || 'BitBlog'}`}
        ogDescription="Explore curated story archives organized by subject and editorial domain."
        type="website"
      />

      <header
        style={{
          backgroundColor: 'var(--color-card)',
          padding: '2rem',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--color-border)',
          marginBottom: '2rem',
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--color-secondary)', fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.35rem' }}>
          <Folder size={16} /> Taxonomy & Domains
        </div>
        <h1 style={{ fontSize: 'clamp(1.8rem, 3vw, 2.4rem)', marginBottom: '0.4rem', fontWeight: 800, fontFamily: 'var(--font-heading)' }}>
          Editorial Categories
        </h1>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.95rem', maxWidth: '750px', margin: 0 }}>
          Explore curated story archives, deep-dive investigations, and specialized reporting organized by topic
        </p>
      </header>

      {loading ? (
        <LoadingState message="Fetching publication categories..." />
      ) : categories.length === 0 ? (
        <EmptyState
          title="No Categories Defined"
          description="Categories created in the CMS admin panel will be listed here automatically."
        />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.75rem' }}>
          {categories.map(cat => {
            const catImage = cat.image || cat.image_url;
            const subCategories = categories.filter(
              c => c.parent_category_id === cat.category_id || c.parent_id === cat.category_id
            );

            return (
              <div
                key={cat.category_id}
                style={{
                  backgroundColor: 'var(--color-card)',
                  borderRadius: 'var(--radius-lg)',
                  border: '1px solid var(--color-border)',
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                  boxShadow: 'var(--shadow-sm)',
                  transition: 'transform var(--transition-fast), box-shadow var(--transition-fast)',
                }}
              >
                {/* Category Cover Image Banner */}
                <Link to={`/category/${cat.slug}`} style={{ textDecoration: 'none', display: 'block', height: '160px', position: 'relative', overflow: 'hidden', backgroundColor: 'var(--color-surface-alt)' }}>
                  {catImage ? (
                    <img
                      src={catImage}
                      alt={`${cat.name} Category Cover`}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        transition: 'transform var(--transition-normal)',
                      }}
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
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: 'linear-gradient(135deg, var(--color-surface-alt), var(--color-card))',
                        color: 'var(--color-secondary)',
                      }}
                    >
                      <Folder size={36} opacity={0.6} />
                      <span style={{ fontSize: '0.78rem', color: 'var(--color-muted)', marginTop: '0.4rem', fontWeight: 600 }}>{cat.name}</span>
                    </div>
                  )}

                  {/* Article Count Tag */}
                  <span
                    style={{
                      position: 'absolute',
                      top: '12px',
                      right: '12px',
                      backgroundColor: 'rgba(0, 0, 0, 0.75)',
                      color: '#FFFFFF',
                      backdropFilter: 'blur(4px)',
                      padding: '0.25rem 0.6rem',
                      borderRadius: 'var(--radius-full)',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                    }}
                  >
                    {cat.post_count || 0} stories
                  </span>
                </Link>

                {/* Category Details */}
                <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'space-between' }}>
                  <div>
                    {cat.parent_category_name && (
                      <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--color-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '0.3rem' }}>
                        Under {cat.parent_category_name}
                      </span>
                    )}

                    <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '0.4rem', fontFamily: 'var(--font-heading)' }}>
                      <Link to={`/category/${cat.slug}`} style={{ color: 'var(--color-text)', textDecoration: 'none' }}>
                        {cat.name}
                      </Link>
                    </h3>

                    <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', lineHeight: 1.5, marginBottom: '1rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {cat.description || `Discover in-depth reporting, editorial analysis, and stories in ${cat.name}.`}
                    </p>

                    {/* Subcategories List */}
                    {subCategories.length > 0 && (
                      <div style={{ marginBottom: '1rem', display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                        {subCategories.map(sub => (
                          <Link
                            key={sub.category_id}
                            to={`/category/${sub.slug}`}
                            style={{
                              fontSize: '0.72rem',
                              fontWeight: 600,
                              color: 'var(--color-secondary)',
                              backgroundColor: 'var(--color-surface-alt)',
                              padding: '0.15rem 0.5rem',
                              borderRadius: 'var(--radius-sm)',
                              textDecoration: 'none',
                              border: '1px solid var(--color-border)',
                            }}
                          >
                            #{sub.name}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>

                  <Link
                    to={`/category/${cat.slug}`}
                    style={{
                      fontSize: '0.85rem',
                      fontWeight: 700,
                      color: 'var(--color-secondary)',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      textDecoration: 'none',
                      marginTop: '0.5rem',
                    }}
                  >
                    View All Stories <ArrowRight size={14} />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
