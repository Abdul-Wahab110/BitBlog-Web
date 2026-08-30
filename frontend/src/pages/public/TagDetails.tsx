import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Tag as TagIcon, ChevronLeft, ChevronRight, Hash, ArrowLeft, Layers, TrendingUp, Sparkles } from 'lucide-react';
import { ArticleGrid } from '../../components/common/ArticleGrid';
import { LoadingState } from '../../components/common/LoadingState';
import { Sidebar } from '../../components/common/Sidebar';
import { ApiService } from '../../services/api';

export const TagDetails: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [tagInfo, setTagInfo] = useState<any>(null);
  const [allTags, setAllTags] = useState<any[]>([]);
  const [posts, setPosts] = useState<any[]>([]);
  const [sort, setSort] = useState('newest');
  const [pagination, setPagination] = useState({ page: 1, limit: 9, total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    ApiService.getTags()
      .then(res => {
        if (res && res.data) {
          setAllTags(res.data);
        }
      })
      .catch(() => {});
  }, []);

  const fetchTagArticles = (pageNumber = 1, sortOption = sort) => {
    if (!slug) return;
    setLoading(true);

    ApiService.getTagBySlug(slug)
      .then(res => {
        if (res && res.data) {
          setTagInfo(res.data);
        }
      })
      .catch(() => {
        setTagInfo({ name: slug, slug, post_count: 0 });
      });

    ApiService.getPosts({ tag: slug, page: pageNumber, limit: 9, sort: sortOption })
      .then(res => {
        if (res && res.data) {
          setPosts(res.data);
          if (res.pagination) {
            setPagination(res.pagination);
          }
        } else {
          setPosts([]);
        }
      })
      .catch(() => {
        setPosts([]);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchTagArticles(1, sort);
  }, [slug, sort]);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      fetchTagArticles(newPage, sort);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const displayName = tagInfo?.name || slug;
  const otherTags = allTags.filter(t => t.slug !== slug).slice(0, 6);

  return (
    <div className="container" style={{ paddingTop: '1.5rem', paddingBottom: '3.5rem' }}>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.82rem', color: 'var(--color-muted)', marginBottom: '1.25rem' }}>
        <Link to="/" style={{ color: 'var(--color-text-secondary)', textDecoration: 'none' }}>Home</Link>
        <span>/</span>
        <Link to="/tags" style={{ color: 'var(--color-text-secondary)', textDecoration: 'none' }}>Tags</Link>
        <span>/</span>
        <span style={{ color: 'var(--color-secondary)', fontWeight: 700 }}>#{slug}</span>
      </div>

      <header
        style={{
          background: 'linear-gradient(135deg, var(--color-surface), var(--color-surface-alt))',
          padding: '2rem 2.25rem',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--color-border)',
          marginBottom: '2rem',
          boxShadow: 'var(--shadow-sm)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', color: 'var(--color-secondary)', fontSize: '0.82rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.35rem' }}>
              <Hash size={16} /> Tagged Archive
            </div>
            <h1 style={{ fontSize: '2.2rem', fontWeight: 900, margin: 0, fontFamily: 'var(--font-heading)' }}>
              #{displayName}
            </h1>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.92rem', marginTop: '0.4rem', marginBottom: 0 }}>
              Showing {pagination.total} {pagination.total === 1 ? 'article' : 'articles'} filed under topic keyword "#{displayName}".
            </p>
          </div>

          <Link
            to="/tags"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.5rem 1rem',
              backgroundColor: 'var(--color-card)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.85rem',
              fontWeight: 700,
              color: 'var(--color-text)',
              textDecoration: 'none',
              transition: 'all var(--transition-fast)',
            }}
          >
            <ArrowLeft size={15} /> All Tags Index
          </Link>
        </div>

        {otherTags.length > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '1.25rem', flexWrap: 'wrap', borderTop: '1px solid var(--color-border)', paddingTop: '1rem' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--color-muted)', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
              <Sparkles size={13} color="var(--color-secondary)" /> Other Topics:
            </span>
            {otherTags.map(ot => (
              <Link
                key={ot.tag_id || ot.id}
                to={`/tag/${ot.slug}`}
                style={{
                  fontSize: '0.78rem',
                  padding: '0.2rem 0.65rem',
                  borderRadius: 'var(--radius-full)',
                  backgroundColor: 'var(--color-card)',
                  border: '1px solid var(--color-border)',
                  color: 'var(--color-text)',
                  textDecoration: 'none',
                  fontWeight: 600,
                  transition: 'all var(--transition-fast)',
                }}
              >
                #{ot.name}
              </Link>
            ))}
          </div>
        )}
      </header>

      <div className="grid-main-sidebar">
        <main style={{ minHeight: 'auto' }}>

          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '1.25rem',
              flexWrap: 'wrap',
              gap: '0.75rem',
            }}
          >
            <h2 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0, fontFamily: 'var(--font-heading)' }}>
              Curated Stories
            </h2>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <label htmlFor="tag-sort-select" style={{ fontSize: '0.82rem', color: 'var(--color-text-secondary)', fontWeight: 600 }}>Sort:</label>
              <select
                id="tag-sort-select"
                value={sort}
                onChange={e => setSort(e.target.value)}
                style={{
                  padding: '0.35rem 0.75rem',
                  fontSize: '0.82rem',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'var(--color-card)',
                  border: '1px solid var(--color-border)',
                  color: 'var(--color-text)',
                  cursor: 'pointer',
                }}
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="views">Most Viewed</option>
                <option value="a-z">Title (A - Z)</option>
              </select>
            </div>
          </div>

          {loading ? (
            <LoadingState message={`Fetching articles tagged #${displayName}...`} />
          ) : (
            <>
              <ArticleGrid
                articles={posts}
                emptyTitle="No Articles Found"
                emptyDescription={`No published articles are currently associated with the tag '#${displayName}'.`}
              />

              {pagination.totalPages > 1 && (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginTop: '2.5rem' }}>
                  <button
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={pagination.page <= 1}
                    style={{
                      padding: '0.5rem 1rem',
                      backgroundColor: 'var(--color-card)',
                      border: '1px solid var(--color-border)',
                      borderRadius: 'var(--radius-md)',
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      color: 'var(--color-text)',
                      opacity: pagination.page <= 1 ? 0.4 : 1,
                      cursor: pagination.page <= 1 ? 'not-allowed' : 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.3rem',
                    }}
                  >
                    <ChevronLeft size={16} /> Prev
                  </button>

                  <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-secondary)', padding: '0 0.75rem' }}>
                    Page {pagination.page} of {pagination.totalPages}
                  </span>

                  <button
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={pagination.page >= pagination.totalPages}
                    style={{
                      padding: '0.5rem 1rem',
                      backgroundColor: 'var(--color-card)',
                      border: '1px solid var(--color-border)',
                      borderRadius: 'var(--radius-md)',
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      color: 'var(--color-text)',
                      opacity: pagination.page >= pagination.totalPages ? 0.4 : 1,
                      cursor: pagination.page >= pagination.totalPages ? 'not-allowed' : 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.3rem',
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

