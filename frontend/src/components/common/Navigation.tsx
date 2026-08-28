import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronDown, Sparkles } from 'lucide-react';
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

  const linkStyle = (active: boolean): React.CSSProperties => ({
    color: active ? 'var(--color-secondary)' : 'var(--color-text)',
    fontSize: '0.85rem',
    fontWeight: active ? 700 : 600,
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
    padding: '0.5rem 0',
    position: 'relative',
    transition: 'color var(--transition-fast)',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.2rem',
  });

  return (
    <nav style={{ gap: '1.75rem', fontWeight: 600, fontSize: '0.85rem', alignItems: 'center' }}>
      <Link to="/" style={linkStyle(path === '/')}>
        Home
      </Link>

      <Link to="/blog" style={linkStyle(path === '/blog')}>
        Articles
      </Link>

      {/* Categories Dropdown */}
      <div className="dropdown" style={{ position: 'relative', cursor: 'pointer', display: 'inline-flex', alignItems: 'center' }}>
        <Link to="/categories" style={linkStyle(path.startsWith('/categor'))}>
          Categories <ChevronDown size={13} style={{ marginLeft: '1px' }} />
        </Link>

        <div className="dropdown-menu" style={{ width: '260px', padding: '0.75rem' }}>
          <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--color-secondary)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.08em', padding: '0 0.5rem' }}>
            Featured Topics
          </div>
          {categories.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.15rem' }}>
              {categories.map(cat => (
                <Link
                  key={cat.category_id}
                  to={`/category/${cat.slug}`}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.45rem 0.65rem',
                    fontSize: '0.85rem',
                  }}
                >
                  <span>{cat.name}</span>
                  {cat.post_count > 0 && (
                    <span style={{ fontSize: '0.7rem', color: 'var(--color-muted)' }}>{cat.post_count}</span>
                  )}
                </Link>
              ))}
              <div style={{ height: '1px', backgroundColor: 'var(--color-border)', margin: '0.35rem 0' }} />
              <Link to="/categories" style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-secondary)', padding: '0.35rem 0.65rem' }}>
                View All Categories →
              </Link>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.15rem' }}>
              <Link to="/category/technology" style={{ padding: '0.45rem 0.65rem', fontSize: '0.85rem' }}>Technology</Link>
              <Link to="/category/design" style={{ padding: '0.45rem 0.65rem', fontSize: '0.85rem' }}>Design</Link>
              <Link to="/category/business" style={{ padding: '0.45rem 0.65rem', fontSize: '0.85rem' }}>Business</Link>
              <Link to="/category/culture" style={{ padding: '0.45rem 0.65rem', fontSize: '0.85rem' }}>Culture</Link>
              <Link to="/categories" style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-secondary)', padding: '0.35rem 0.65rem' }}>
                All Categories →
              </Link>
            </div>
          )}
        </div>
      </div>

      <Link to="/authors" style={linkStyle(path === '/authors')}>
        Authors
      </Link>

      <Link to="/about" style={linkStyle(path === '/about')}>
        About
      </Link>

      <Link to="/contact" style={linkStyle(path === '/contact')}>
        Contact
      </Link>
    </nav>
  );
};
