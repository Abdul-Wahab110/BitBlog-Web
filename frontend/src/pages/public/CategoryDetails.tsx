import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Folder, ChevronLeft, ChevronRight, Layers, ArrowRight, BookOpen } from 'lucide-react';
import { ArticleGrid } from '../../components/common/ArticleGrid';
import { LoadingState } from '../../components/common/LoadingState';
import { Sidebar } from '../../components/common/Sidebar';
import { SeoHead } from '../../components/common/SeoHead';
import { ApiService } from '../../services/api';
import { useSettings } from '../../context/SettingsContext';

export const CategoryDetails: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [category, setCategory] = useState<any>(null);
  const [allCategories, setAllCategories] = useState<any[]>([]);
  const [posts, setPosts] = useState<any[]>([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const { settings } = useSettings();

  const fetchCategoryArticles = (pageNumber = 1) => {
    if (!slug) return;
    setLoading(true);

    Promise.all([
      ApiService.getCategoryBySlug(slug).catch(() => null),
      ApiService.getCategories().catch(() => ({ data: [] })),
      ApiService.getPosts({ category: slug, page: pageNumber, limit: 10 }).catch(() => ({ data: [], pagination: {} })),
    ]).then(([catRes, allCatsRes, postsRes]) => {
      if (catRes && catRes.data) {
        setCategory(catRes.data);
      } else {
        setCategory({ name: slug.charAt(0).toUpperCase() + slug.slice(1), slug, description: `Articles published under ${slug} category.` });
      }

      if (allCatsRes && allCatsRes.data) {
        setAllCategories(allCatsRes.data);
      }

      if (postsRes && postsRes.data) {
        setPosts(postsRes.data);
        if (postsRes.pagination) {
          setPagination(postsRes.pagination);
        }
      }
      setLoading(false);
    });
  };

  useEffect(() => {
    fetchCategoryArticles(1);
  }, [slug]);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      fetchCategoryArticles(newPage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const categoryImage = category?.image || category?.image_url;
  const subCategories = allCategories.filter(
    c => category?.category_id && (c.parent_category_id === category.category_id || c.parent_id === category.category_id)
  );

  const breadcrumbs = [
    { name: 'Home', url: window.location.origin },
    { name: 'Categories', url: `${window.location.origin}/categories` },
    ...(category?.parent_category_name ? [{ name: category.parent_category_name, url: `${window.location.origin}/category/${category.parent_category_slug || 'general'}` }] : []),
    { name: category?.name || slug || 'Category', url: window.location.href },
  ];

  return (
    <div className="container" style={{ paddingTop: '1.5rem', paddingBottom: '3rem' }}>
      {/* Category SEO Head */}
      <SeoHead
        title={`${category?.name || 'Category'} Articles & Stories | ${settings.site_name || 'BitBlog'}`}
        description={category?.description || `Explore latest articles, reporting and analysis in ${category?.name || slug}.`}
        canonicalUrl={window.location.href}
        ogTitle={`${category?.name || 'Category'} | ${settings.site_name || 'BitBlog'}`}
        ogDescription={category?.description || `Discover curated digital journalism and stories in ${category?.name || slug}.`}
        ogImage={categoryImage || settings.default_og_image}
        type="website"
        breadcrumbs={breadcrumbs}
      />

      {/* Semantic Breadcrumbs Navigation */}
      <nav aria-label="Breadcrumb" style={{ fontSize: '0.82rem', color: 'var(--color-text-secondary)', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
        <Link to="/" style={{ color: 'var(--color-text-secondary)', textDecoration: 'none' }}>Home</Link>
        <span>/</span>
        <Link to="/categories" style={{ color: 'var(--color-text-secondary)', textDecoration: 'none' }}>Categories</Link>
        {category?.parent_category_name && (
          <>
            <span>/</span>
            <span style={{ color: 'var(--color-muted)' }}>{category.parent_category_name}</span>
          </>
        )}
        <span>/</span>
        <span style={{ color: 'var(--color-secondary)', fontWeight: 700 }}>{category?.name || slug}</span>
      </nav>

      {/* Dynamic Category Hero Banner */}
      <header
        style={{
          position: 'relative',
          backgroundColor: 'var(--color-card)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--color-border)',
          overflow: 'hidden',
          marginBottom: '2.5rem',
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        {categoryImage && (
          <div
            style={{
              width: '100%',
              height: '240px',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <img
              src={categoryImage}
              alt={`${category?.name || 'Category'} Cover Banner`}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
              }}
              onError={(e: any) => {
                e.currentTarget.parentElement.style.display = 'none';
              }}
            />
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background: 'linear-gradient(180deg, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.7) 100%)',
              }}
            />
          </div>
        )}

        <div style={{ padding: '1.75rem 2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-secondary)', fontSize: '0.82rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.4rem' }}>
            <Folder size={16} /> Category Archive • {pagination.total || posts.length} Published Articles
          </div>

          <h1 style={{ fontSize: 'clamp(1.8rem, 3vw, 2.5rem)', fontWeight: 800, marginBottom: '0.5rem', fontFamily: 'var(--font-heading)' }}>
            {category?.name || (slug ? slug.toUpperCase() : 'Category')}
          </h1>

          {category?.description && (
            <p style={{ color: 'var(--color-text-secondary)', fontSize: '1rem', lineHeight: 1.6, maxWidth: '800px', margin: 0 }}>
              {category.description}
            </p>
          )}

          {/* Subcategories Chips */}
          {subCategories.length > 0 && (
            <div style={{ marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-muted)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <Layers size={13} /> Subtopics:
              </span>
              {subCategories.map(sub => (
                <Link
                  key={sub.category_id}
                  to={`/category/${sub.slug}`}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.3rem',
                    padding: '0.25rem 0.65rem',
                    backgroundColor: 'var(--color-surface-alt)',
                    border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-full)',
                    fontSize: '0.78rem',
                    fontWeight: 600,
                    color: 'var(--color-text)',
                    textDecoration: 'none',
                  }}
                >
                  {sub.name} <ArrowRight size={11} />
                </Link>
              ))}
            </div>
          )}
        </div>
      </header>

      {/* Main Content & Sidebar Grid */}
      <div className="grid-main-sidebar">
        <main style={{ minHeight: 'auto' }}>
          {loading ? (
            <LoadingState message={`Fetching articles in category '${slug}'...`} />
          ) : (
            <>
              <ArticleGrid
                title={`Articles in ${category?.name || slug}`}
                articles={posts}
                emptyTitle="No Articles in this Category"
                emptyDescription={`No published articles have been assigned to '${category?.name || slug}' yet.`}
              />

              {/* Server-Side Pagination */}
              {pagination.totalPages > 1 && (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginTop: '2.5rem' }}>
                  <button
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={pagination.page <= 1}
                    style={{
                      padding: '0.45rem 0.85rem',
                      backgroundColor: 'var(--color-surface)',
                      border: '1px solid var(--color-border)',
                      borderRadius: 'var(--radius-md)',
                      color: 'var(--color-text)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.3rem',
                      cursor: pagination.page <= 1 ? 'not-allowed' : 'pointer',
                      opacity: pagination.page <= 1 ? 0.5 : 1,
                    }}
                  >
                    <ChevronLeft size={16} /> Previous
                  </button>

                  <span style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', padding: '0 0.75rem' }}>
                    Page {pagination.page} of {pagination.totalPages}
                  </span>

                  <button
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={pagination.page >= pagination.totalPages}
                    style={{
                      padding: '0.45rem 0.85rem',
                      backgroundColor: 'var(--color-surface)',
                      border: '1px solid var(--color-border)',
                      borderRadius: 'var(--radius-md)',
                      color: 'var(--color-text)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.3rem',
                      cursor: pagination.page >= pagination.totalPages ? 'not-allowed' : 'pointer',
                      opacity: pagination.page >= pagination.totalPages ? 0.5 : 1,
                    }}
                  >
                    Next <ChevronRight size={16} />
                  </button>
                </div>
              )}
            </>
          )}
        </main>

        <Sidebar />
      </div>
    </div>
  );
};
