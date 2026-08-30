import React, { useState, useEffect } from 'react';
import { BookOpen, ChevronLeft, ChevronRight, Search } from 'lucide-react';
import { ArticleGrid } from '../../components/common/ArticleGrid';
import { LoadingState } from '../../components/common/LoadingState';
import { Sidebar } from '../../components/common/Sidebar';
import { ApiService } from '../../services/api';

export const Blog: React.FC = () => {
  const [posts, setPosts] = useState<any[]>([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 9, total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);

  const fetchPosts = (pageNumber = 1) => {
    setLoading(true);
    ApiService.getPosts({ page: pageNumber, limit: 9 })
      .then(res => {
        if (res && res.data) {
          setPosts(res.data);
          if (res.pagination) {
            setPagination(res.pagination);
          }
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
    fetchPosts(1);
  }, []);

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
                title={`All Articles (${pagination.total})`}
                articles={posts}
                emptyTitle="No Published Stories"
                emptyDescription="No articles have been created in the database yet. Stories created in the Admin CMS will appear here."
              />

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
                      opacity: pagination.page <= 1 ? 0.5 : 1,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.3rem',
                    }}
                  >
                    <ChevronLeft size={16} /> Prev
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
                      opacity: pagination.page >= pagination.totalPages ? 0.5 : 1,
                      display: 'flex',
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

