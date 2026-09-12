import React, { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight, TrendingUp, Sparkles } from 'lucide-react';
import { BreakingNews } from '../../components/common/BreakingNews';
import { FeaturedGrid } from '../../components/common/FeaturedGrid';
import { ArticleGrid } from '../../components/common/ArticleGrid';
import { Sidebar } from '../../components/common/Sidebar';
import { LoadingState } from '../../components/common/LoadingState';
import { SeoHead } from '../../components/common/SeoHead';
import { useSettings } from '../../context/SettingsContext';
import { ApiService } from '../../services/api';

export const Home: React.FC = () => {
  const { settings, reloadSettings } = useSettings();
  const [posts, setPosts] = useState<any[]>([]);
  const [featuredPosts, setFeaturedPosts] = useState<any[]>([]);
  const [breakingPosts, setBreakingPosts] = useState<any[]>([]);
  const [recommendedPosts, setRecommendedPosts] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);

  const siteName = settings.site_name || 'BitBlog';
  const postsPerPage = Number(settings.posts_per_page) || 10;
  const recommendedCount = Number(settings.recommended_posts_count) || 4;

  // On mount, refresh settings from server and load featured/breaking/recommended articles
  useEffect(() => {
    reloadSettings().catch(() => {});

    Promise.all([
      ApiService.getFeaturedPosts().catch(() => ({ data: [] })),
      ApiService.getPosts({ limit: 6, sort: 'newest' }).catch(() => ({ data: [] })),
      ApiService.getPosts({ limit: recommendedCount, sort: 'views' }).catch(() => ({ data: [] })),
    ]).then(([featRes, breakRes, recRes]) => {
      if (featRes && featRes.data) {
        setFeaturedPosts(featRes.data);
      }
      if (breakRes && breakRes.data) {
        setBreakingPosts(breakRes.data);
      }
      if (recRes && recRes.data) {
        setRecommendedPosts(recRes.data);
      }
    });
  }, [reloadSettings, recommendedCount]);

  // Fetch paginated main articles honoring posts_per_page setting
  const fetchHomePosts = useCallback((pageNumber: number, limit: number) => {
    setLoading(true);
    ApiService.getPosts({
      page: pageNumber,
      limit: limit,
      sort: 'newest',
    })
      .then(postsRes => {
        if (postsRes && postsRes.data) {
          const clampedPosts = Array.isArray(postsRes.data) ? postsRes.data.slice(0, limit) : [];
          setPosts(clampedPosts);
          if (postsRes.pagination) {
            setPagination(postsRes.pagination);
          } else {
            setPagination({
              page: pageNumber,
              limit: limit,
              total: postsRes.data.length,
              totalPages: Math.ceil(postsRes.data.length / limit) || 1,
            });
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
  }, []);

  // Fetch articles when currentPage or postsPerPage changes
  useEffect(() => {
    fetchHomePosts(currentPage, postsPerPage);
  }, [currentPage, postsPerPage, fetchHomePosts]);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      setCurrentPage(newPage);
      const articleHeader = document.getElementById('home-latest-articles');
      if (articleHeader) {
        articleHeader.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

  const breakingNewsItems = (breakingPosts.length > 0 ? breakingPosts : posts)
    .slice(0, 5)
    .map(p => ({
      title: p.title,
      slug: p.slug,
    }));

  // Ensure recommended reads strictly display the configured count
  const effectiveRecommended = recommendedPosts.length > 0
    ? recommendedPosts.slice(0, recommendedCount)
    : [...posts].sort((a, b) => (b.views_count || 0) - (a.views_count || 0)).slice(0, recommendedCount);

  return (
    <div>
      <SeoHead
        title={settings.default_seo_title || `${siteName} - Digital Journal & Publication`}
        description={settings.default_meta_description || 'Discover editorial stories, technology commentary, and curated digital journalism.'}
      />

      {breakingNewsItems.length > 0 && <BreakingNews items={breakingNewsItems} />}

      <div className="container" style={{ paddingTop: '1.5rem', paddingBottom: '3rem' }}>

        {(featuredPosts.length > 0 || posts.length > 0) && (
          <FeaturedGrid
            articles={
              featuredPosts.length > 0
                ? featuredPosts
                : [...posts].sort((a, b) => (b.views_count || 0) - (a.views_count || 0)).slice(0, 5)
            }
          />
        )}

        <div className="grid-main-sidebar">
          <main style={{ minHeight: 'auto' }}>
            {loading ? (
              <LoadingState message="Loading publication stories..." />
            ) : (
              <>
                {/* 1. RECOMMENDED READS SECTION (NOW FIRST) */}
                {effectiveRecommended.length > 0 && (
                  <div style={{ marginBottom: '3.5rem' }}>
                    <ArticleGrid
                      title="RECOMMENDED READS"
                      articles={effectiveRecommended}
                      emptyTitle="No Recommendations"
                      emptyDescription="Curated recommendations will appear here."
                    />
                  </div>
                )}

                {/* 2. LATEST ARTICLES SECTION (PAGINATED, NOW SECOND) */}
                <div id="home-latest-articles">
                  <ArticleGrid
                    title={`LATEST ARTICLES${pagination.total ? ` (${pagination.total})` : ''}`}
                    articles={posts}
                    emptyTitle="No Published Articles"
                    emptyDescription="No articles have been published in the database yet. Stories published in the Admin CMS will appear here automatically."
                  />

                  {pagination.totalPages > 1 && (
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.4rem',
                        marginTop: '2rem',
                        flexWrap: 'wrap',
                      }}
                    >
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
                          transition: 'all 0.15s ease',
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
                          transition: 'all 0.15s ease',
                        }}
                      >
                        Next <ChevronRight size={16} />
                      </button>
                    </div>
                  )}
                </div>
              </>
            )}
          </main>

          <Sidebar />
        </div>
      </div>
    </div>
  );
};
