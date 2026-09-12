import React, { useState, useEffect, useCallback } from 'react';
import { BookOpen, ChevronLeft, ChevronRight } from 'lucide-react';
import { ArticleGrid } from '../../components/common/ArticleGrid';
import { LoadingState } from '../../components/common/LoadingState';
import { Sidebar } from '../../components/common/Sidebar';
import { ApiService } from '../../services/api';
import { useSettings } from '../../context/SettingsContext';

export const Blog: React.FC = () => {
  const { settings } = useSettings();
  const [posts, setPosts] = useState<any[]>([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);

  const postsPerPage = Number(settings.posts_per_page) || 10;

  const fetchPosts = useCallback((pageNumber = 1) => {
    setLoading(true);
    ApiService.getPosts({ page: pageNumber, limit: postsPerPage })
      .then(res => {
        if (res && res.data) {
          setPosts(res.data);
          if (res.pagination) {
            setPagination(res.pagination);
          } else {
            setPagination({
              page: pageNumber,
              limit: postsPerPage,
              total: res.data.length,
              totalPages: 1,
            });
          }
        }
      })
      .catch(() => {
        setPosts([]);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [postsPerPage]);

  useEffect(() => {
    fetchPosts(1);
  }, [fetchPosts]);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      fetchPosts(newPage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="container" style={{ paddingTop: '1.5rem', paddingBottom: '3rem' }}>

      <header
        style={{
          backgroundColor: 'var(--color-card)',
          padding: '2rem',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--color-border)',
          marginBottom: '2rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--color-secondary)', fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.35rem' }}>
          <BookOpen size={16} /> Publication Index
        </div>
        <h1 style={{ fontSize: '2rem', marginBottom: '0.35rem' }}>All Articles & Stories</h1>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.95rem' }}>
          Browse our complete catalog of digital journalism, analysis, and thought leadership
        </p>
      </header>

      <div className="grid-main-sidebar">
        <main style={{ minHeight: 'auto' }}>
          {loading ? (
            <LoadingState message="Fetching publication articles from database..." />
          ) : (
            <>
              <ArticleGrid
                title={`All Articles (${pagination.total || posts.length})`}
                articles={posts}
                emptyTitle="No Published Stories"
                emptyDescription="No articles have been created in the database yet. Stories created in the Admin CMS will appear here."
              />

              {pagination.totalPages > 1 && (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', marginTop: '2.5rem', flexWrap: 'wrap' }}>
                  <button
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={pagination.page <= 1}
                    aria-label="Previous Page"
                    style={{
                      padding: '0.5rem 0.9rem',
                      backgroundColor: 'var(--color-card)',
                      border: '1px solid var(--color-border)',
                      borderRadius: 'var(--radius-md)',
                      opacity: pagination.page <= 1 ? 0.4 : 1,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      cursor: pagination.page <= 1 ? 'not-allowed' : 'pointer',
                      color: 'var(--color-text)',
                      fontWeight: 600,
                      fontSize: '0.85rem',
                    }}
                  >
                    <ChevronLeft size={16} /> Prev
                  </button>

                  <div style={{ display: 'flex', gap: '0.3rem', alignItems: 'center' }}>
                    {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(p => {
                      const isCurrent = p === pagination.page;
                      return (
                        <button
                          key={p}
                          onClick={() => handlePageChange(p)}
                          style={{
                            minWidth: '34px',
                            height: '34px',
                            padding: '0 0.4rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderRadius: 'var(--radius-md)',
                            border: isCurrent ? '1px solid var(--color-secondary)' : '1px solid var(--color-border)',
                            backgroundColor: isCurrent ? 'var(--color-secondary)' : 'var(--color-card)',
                            color: isCurrent ? '#ffffff' : 'var(--color-text)',
                            fontWeight: isCurrent ? 700 : 500,
                            fontSize: '0.85rem',
                            cursor: 'pointer',
                            transition: 'all 0.15s ease',
                          }}
                        >
                          {p}
                        </button>
                      );
                    })}
                  </div>

                  <button
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={pagination.page >= pagination.totalPages}
                    aria-label="Next Page"
                    style={{
                      padding: '0.5rem 0.9rem',
                      backgroundColor: 'var(--color-card)',
                      border: '1px solid var(--color-border)',
                      borderRadius: 'var(--radius-md)',
                      opacity: pagination.page >= pagination.totalPages ? 0.4 : 1,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      cursor: pagination.page >= pagination.totalPages ? 'not-allowed' : 'pointer',
                      color: 'var(--color-text)',
                      fontWeight: 600,
                      fontSize: '0.85rem',
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
