import React from 'react';
import { Link, useLocation } from 'react-router-dom';

export const Nav: React.FC = () => {
  const location = useLocation();

  const links = [
    { label: 'Home', path: '/' },
    { label: 'Blog', path: '/blog' },
    { label: 'Categories', path: '/categories' },
    { label: 'Tags', path: '/tags' },
    { label: 'Authors', path: '/authors' },
    { label: 'About', path: '/about' },
    { label: 'Contact', path: '/contact' },
  ];

  return (
    <nav style={{ padding: '0.75rem 0', gap: '1.5rem', flexWrap: 'wrap' }}>
      {links.map(link => {
        const isActive = location.pathname === link.path;
        return (
          <Link
            key={link.path}
            to={link.path}
            style={{
              fontWeight: isActive ? 700 : 500,
              color: isActive ? 'var(--color-secondary)' : 'var(--color-text-secondary)',
              fontSize: '0.95rem',
              transition: 'color var(--transition-fast)',
            }}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
};
