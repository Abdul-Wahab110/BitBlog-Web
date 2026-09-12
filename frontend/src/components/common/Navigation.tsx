import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronDown, Sparkles, Layers, ArrowRight } from 'lucide-react';
import { ApiService } from '../../services/api';

export const Navigation: React.FC = () => {
  const location = useLocation();
  const path = location.pathname;
  const [categories, setCategories] = useState<any[]>([]);

  useEffect(() => {
    ApiService.getCategories()
      .then(res => {
        if (res && res.data) {
          setCategories(res.data.slice(0, 8));
        }
      })
      .catch(() => {});
  }, []);

  return (
    <nav style={{ display: 'flex', gap: 'clamp(0.85rem, 1.5vw, 1.75rem)', alignItems: 'center', whiteSpace: 'nowrap', flexWrap: 'nowrap' }}>
      <Link
        to="/"
        className={`nav-link-item ${path === '/' ? 'active' : ''}`}
      >
        Home
      </Link>

      <Link
        to="/blog"
        className={`nav-link-item ${path === '/blog' || path.startsWith('/post/') ? 'active' : ''}`}
      >
        Articles
      </Link>

      <div className="nav-dropdown-wrapper">
        <Link
          to="/categories"
          className={`nav-link-item ${path.startsWith('/categor') ? 'active' : ''}`}
        >
          Categories <ChevronDown size={14} style={{ transition: 'transform 0.2s ease' }} />
        </Link>

        <div className="nav-dropdown-panel">
          <div
            style={{
              fontSize: '0.68rem',
              fontWeight: 800,
              color: 'var(--color-secondary)',
              marginBottom: '0.45rem',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              padding: '0.2rem 0.5rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
            }}
          >
            <Sparkles size={12} /> Featured Topics
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.15rem' }}>
            {categories.length > 0 ? (
              categories.map(cat => (
                <Link
                  key={cat.category_id}
                  to={`/category/${cat.slug}`}
                  className="nav-dropdown-item"
                >
                  <span style={{ fontWeight: 600 }}>{cat.name}</span>
                  {cat.post_count > 0 && (
                    <span
                      style={{
                        fontSize: '0.7rem',
                        color: 'var(--color-muted)',
                        backgroundColor: 'var(--color-surface-alt)',
                        padding: '0.1rem 0.4rem',
                        borderRadius: 'var(--radius-full)',
                        fontWeight: 600,
                      }}
                    >
                      {cat.post_count}
                    </span>
                  )}
                </Link>
              ))
            ) : (
              <>
                <Link to="/category/technology" className="nav-dropdown-item">Technology</Link>
                <Link to="/category/design" className="nav-dropdown-item">Design & UX</Link>
                <Link to="/category/business" className="nav-dropdown-item">Business</Link>
                <Link to="/category/culture" className="nav-dropdown-item">Culture & AI</Link>
              </>
            )}

            <div style={{ height: '1px', backgroundColor: 'var(--color-border)', margin: '0.4rem 0' }} />

            <Link
              to="/categories"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontSize: '0.8rem',
                fontWeight: 700,
                color: 'var(--color-secondary)',
                padding: '0.4rem 0.65rem',
                borderRadius: 'var(--radius-sm)',
                textDecoration: 'none',
              }}
            >
              <span>Explore All Categories</span>
              <ArrowRight size={13} />
            </Link>
          </div>
        </div>
      </div>

      <Link
        to="/authors"
        className={`nav-link-item ${path === '/authors' || path.startsWith('/author/') ? 'active' : ''}`}
      >
        Authors
      </Link>

      <Link
        to="/about"
        className={`nav-link-item ${path === '/about' ? 'active' : ''}`}
      >
        About
      </Link>

      <Link
        to="/contact"
        className={`nav-link-item ${path === '/contact' ? 'active' : ''}`}
      >
        Contact
      </Link>
    </nav>
  );
};

