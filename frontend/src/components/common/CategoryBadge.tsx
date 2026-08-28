import React from 'react';
import { Link } from 'react-router-dom';

interface CategoryBadgeProps {
  name: string;
  slug: string;
  colorHex?: string;
}

export const CategoryBadge: React.FC<CategoryBadgeProps> = ({ name, slug, colorHex = '#2563EB' }) => {
  return (
    <Link
      to={`/category/${slug}`}
      style={{
        display: 'inline-block',
        backgroundColor: colorHex,
        color: '#FFFFFF',
        padding: '0.2rem 0.6rem',
        borderRadius: 'var(--radius-sm)',
        fontSize: '0.75rem',
        fontWeight: 600,
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
      }}
    >
      {name}
    </Link>
  );
};
