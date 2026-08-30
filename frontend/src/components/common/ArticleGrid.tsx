import React from 'react';
import { ArticleCard, ArticleCardProps } from './ArticleCard';
import { EmptyState } from './EmptyState';

interface ArticleGridProps {
  title?: string;
  articles?: ArticleCardProps[];
  emptyTitle?: string;
  emptyDescription?: string;
}

export const ArticleGrid: React.FC<ArticleGridProps> = ({
  title,
  articles = [],
  emptyTitle = 'No Articles Published Yet',
  emptyDescription = 'Published posts will appear here automatically when created in the CMS admin panel.',
}) => {
  return (
    <section style={{ padding: 0, margin: 0 }}>
      {title && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '1.25rem',
            paddingBottom: '0.65rem',
            borderBottom: '2px solid var(--color-secondary)',
          }}
        >
          <h2
            style={{
              fontSize: '1.15rem',
              fontWeight: 800,
              margin: 0,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              color: 'var(--color-text)',
              lineHeight: 1.2,
            }}
          >
            {title}
          </h2>
        </div>
      )}

      {articles.length === 0 ? (
        <EmptyState title={emptyTitle} description={emptyDescription} />
      ) : (
        <div className="grid-layout">
          {articles.map((article, idx) => (
            <ArticleCard key={article.post_id || article.id || article.slug || idx} {...article} />
          ))}
        </div>
      )}
    </section>
  );
};

