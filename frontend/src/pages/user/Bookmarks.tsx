import React, { useState, useEffect } from 'react';
import { Bookmark as BookmarkIcon } from 'lucide-react';
import { ArticleGrid } from '../../components/common/ArticleGrid';
import { LoadingState } from '../../components/common/LoadingState';
import { ApiService } from '../../services/api';

export const Bookmarks: React.FC = () => {
  const [bookmarks, setBookmarks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    ApiService.getUserBookmarks()
      .then(res => {
        if (res && res.data) {
          setBookmarks(res.data);
        }
      })
      .catch(() => {
        setBookmarks([]);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  return (
    <div>
      <header style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.6rem', marginBottom: '0.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <BookmarkIcon size={22} color="var(--color-secondary)" /> Saved Bookmarks
        </h1>
        <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>Articles you have saved to read later</p>
      </header>

      {loading ? (
        <LoadingState message="Fetching saved bookmarks..." />
      ) : (
        <ArticleGrid
          title="Saved Articles"
          articles={bookmarks}
          emptyTitle="No bookmarks yet."
          emptyDescription="You have not saved any articles to your personal reading list yet. Click the bookmark icon on any article page to save it here."
        />
      )}
    </div>
  );
};
