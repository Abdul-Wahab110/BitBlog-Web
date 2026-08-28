import React, { useState, useEffect } from 'react';
import { BreakingNews } from '../../components/common/BreakingNews';
import { FeaturedGrid } from '../../components/common/FeaturedGrid';
import { ArticleGrid } from '../../components/common/ArticleGrid';
import { Sidebar } from '../../components/common/Sidebar';
import { LoadingState } from '../../components/common/LoadingState';
import { SeoHead } from '../../components/common/SeoHead';
import { useSettings } from '../../context/SettingsContext';
import { ApiService } from '../../services/api';

export const Home: React.FC = () => {
  const [posts, setPosts] = useState<any[]>([]);
  const [featuredPosts, setFeaturedPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { settings } = useSettings();
  const siteName = settings.site_name || 'BitBlog';

  useEffect(() => {
    Promise.all([
      ApiService.getPosts({ limit: 12, sort: 'newest' }).catch(() => ({ data: [] })),
      ApiService.getFeaturedPosts().catch(() => ({ data: [] })),
    ])
      .then(([postsRes, featRes]) => {
        if (postsRes && postsRes.data) {
          setPosts(postsRes.data);
        }
        if (featRes && featRes.data) {
          setFeaturedPosts(featRes.data);
        }
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const breakingNewsItems = posts.slice(0, 5).map(p => ({
    title: p.title,
    slug: p.slug,
  }));

  const recommendedPosts = posts.slice(3, 9);

  return (
    <div>
      <SeoHead
        title={settings.default_seo_title || `${siteName} - Digital Journal & Publication`}
        description={settings.default_meta_description || 'Discover editorial stories, technology commentary, and curated digital journalism.'}
      />
      {/* Breaking News Bar */}
      {breakingNewsItems.length > 0 && <BreakingNews items={breakingNewsItems} />}

      <div className="container" style={{ paddingTop: '1.5rem', paddingBottom: '3rem' }}>
        {/* Featured Hero Grid: Top 5 Highest Viewed & Most Popular Articles */}
        {(featuredPosts.length > 0 || posts.length > 0) && (
          <FeaturedGrid
            articles={
              featuredPosts.length > 0
                ? featuredPosts
                : [...posts].sort((a, b) => (b.views_count || 0) - (a.views_count || 0)).slice(0, 5)
            }
          />
        )}

        {/* Main Content & Sidebar Column Grid */}
        <div className="grid-main-sidebar">
          <main style={{ minHeight: 'auto' }}>
            {loading ? (
              <LoadingState message="Loading latest publication stories from Oracle database..." />
            ) : (
              <>
                {/* Latest Articles Section */}
                <ArticleGrid
                  title="LATEST ARTICLES"
                  articles={posts}
                  emptyTitle="No Published Articles"
                  emptyDescription="No articles have been published in the database yet. Stories published in the Admin CMS will appear here automatically."
                />



                {/* Recommended Articles Section */}
                {recommendedPosts.length > 0 && (
                  <div style={{ marginTop: '2.5rem' }}>
                    <ArticleGrid
                      title="RECOMMENDED READS"
                      articles={recommendedPosts}
                      emptyTitle="No Recommendations"
                      emptyDescription="Curated recommendations will appear here."
                    />
                  </div>
                )}
              </>
            )}
          </main>

          {/* Sidebar */}
          <Sidebar />
        </div>
      </div>
    </div>
  );
};
