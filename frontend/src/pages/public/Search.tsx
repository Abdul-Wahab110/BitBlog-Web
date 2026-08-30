import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search as SearchIcon, Filter, SlidersHorizontal, ChevronLeft, ChevronRight } from 'lucide-react';
import { ArticleGrid } from '../../components/common/ArticleGrid';
import { LoadingState } from '../../components/common/LoadingState';
import { Sidebar } from '../../components/common/Sidebar';
import { ApiService } from '../../services/api';

export const Search: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const query = searchParams.get('q') || '';
  const categoryParam = searchParams.get('category') || '';
  const tagParam = searchParams.get('tag') || '';
  const authorParam = searchParams.get('author') || '';
  const sortParam = searchParams.get('sort') || 'newest';
  const pageParam = parseInt(searchParams.get('page') || '1');

  const [searchInput, setSearchInput] = useState(query);
  const [categories, setCategories] = useState<any[]>([]);
  const [posts, setPosts] = useState<any[]>([]);
  const [pagination, setPagination] = useState({ page: pageParam, limit: 10, total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    ApiService.getCategories().then(res => {
      if (res && res.data) setCategories(res.data);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    setSearchInput(query);
    setLoading(true);

    ApiService.getPosts({
      search: query,
      category: categoryParam || undefined,
      tag: tagParam || undefined,
      author: authorParam || undefined,
      sort: sortParam,
      page: pageParam,
      limit: 10,
    })
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
  }, [query, categoryParam, tagParam, authorParam, sortParam, pageParam]);

  const updateParam = (key: string, value: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (value) {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    newParams.set('page', '1');
    setSearchParams(newParams);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateParam('q', searchInput);
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      const newParams = new URLSearchParams(searchParams);
      newParams.set('page', String(newPage));
      setSearchParams(newParams);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="container" style={{ paddingTop: '1.5rem', paddingBottom: '3rem' }}>
      {/* Search Header Form Banner */}
      <header
        style={{
          backgroundColor: 'var(--color-card)',
          padding: '2rem',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--color-border)',
          marginBottom: '2rem',
        }}
      >
        <h1 style={{ fontSize: '1.8rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <SearchIcon size={24} color="var(--color-secondary)" /> Search Articles & Discovery
        </h1>

        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1.25rem' }}>
          <input
            type="search"
            value={searchInput}
            onChange={e => setSearchInput(e.target.value)}
            placeholder="Search titles, content, categories, tags, or authors..."
            style={{ flex: '1 1 220px', minWidth: '160px', padding: '0.75rem 1rem', fontSize: '1rem' }}
          />
          <button type="submit" style={{ backgroundColor: 'var(--color-secondary)', color: '#FFF', padding: '0.75rem 1.5rem', fontSize: '0.9rem', whiteSpace: 'nowrap' }}>
            Search
          </button>
        </form>

        {/* Filter Controls Bar */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center', justifyContent: 'space-between', paddingTop: '0.75rem', borderTop: '1px solid var(--color-border)' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', color: 'var(--color-text-secondary)', fontWeight: 600 }}>
              <SlidersHorizontal size={15} /> Filters:
            </div>

            {/* Category Filter */}
            <select
              value={categoryParam}
              onChange={e => updateParam('category', e.target.value)}
              style={{ padding: '0.4rem 0.65rem', fontSize: '0.85rem', maxWidth: '100%' }}
            >
              <option value="">All Categories</option>
              {categories.map(cat => (
                <option key={cat.category_id} value={cat.slug}>{cat.name}</option>
              ))}
            </select>
          </div>

          {/* Sort Dropdown */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', fontWeight: 600 }}>Sort By:</span>
            <select
              value={sortParam}
              onChange={e => updateParam('sort', e.target.value)}
              style={{ padding: '0.4rem 0.65rem', fontSize: '0.85rem', maxWidth: '100%' }}
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="most_viewed">Most Viewed</option>
              <option value="a-z">Title (A-Z)</option>
              <option value="z-a">Title (Z-A)</option>
            </select>
          </div>
        </div>
      </header>

      <div className="grid-main-sidebar">
        <main style={{ minHeight: 'auto' }}>
          {loading ? (
            <LoadingState message="Searching article database..." />
          ) : (
            <>
              <ArticleGrid
                title={query ? `Search Results for '${query}' (${pagination.total})` : `All Published Articles (${pagination.total})`}
                articles={posts}
                emptyTitle="No articles found"
                emptyDescription={query ? `No articles matched your search query '${query}'. Try adjusting your search filters or terms.` : 'No published articles found in the database.'}
              />

              {pagination.totalPages > 1 && (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginTop: '2rem' }}>
                  <button
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={pagination.page <= 1}
                    style={{
                      padding: '0.4rem 0.75rem',
                      backgroundColor: 'var(--color-surface)',
                      border: '1px solid var(--color-border)',
                      opacity: pagination.page <= 1 ? 0.5 : 1,
                    }}
                  >
                    <ChevronLeft size={16} /> Prev
                  </button>

                  <span style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', padding: '0 0.5rem' }}>
                    Page {pagination.page} of {pagination.totalPages}
                  </span>

                  <button
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={pagination.page >= pagination.totalPages}
                    style={{
                      padding: '0.4rem 0.75rem',
                      backgroundColor: 'var(--color-surface)',
                      border: '1px solid var(--color-border)',
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
