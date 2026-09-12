import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Tag as TagIcon, Search, TrendingUp, Hash, Layers, ArrowRight, Sparkles } from 'lucide-react';
import { LoadingState } from '../../components/common/LoadingState';
import { EmptyState } from '../../components/common/EmptyState';
import { ApiService } from '../../services/api';

export const Tags: React.FC = () => {
  const [tags, setTags] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<'popular' | 'alpha'>('popular');

  useEffect(() => {
    ApiService.getTags()
      .then(res => {
        if (res && res.data) {
          setTags(res.data);
        }
      })
      .catch(() => {
        setTags([]);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const filteredAndSortedTags = useMemo(() => {
    let list = tags.filter(t => {
      const q = search.trim().toLowerCase();
      if (!q) return true;
      return (
        t.name?.toLowerCase().includes(q) ||
        t.slug?.toLowerCase().includes(q)
      );
    });

    if (sortBy === 'popular') {
      list.sort((a, b) => (b.post_count || 0) - (a.post_count || 0) || a.name.localeCompare(b.name));
    } else {
      list.sort((a, b) => a.name.localeCompare(b.name));
    }

    return list;
  }, [tags, search, sortBy]);

  const popularTags = useMemo(() => {
    return [...tags]
      .sort((a, b) => (b.post_count || 0) - (a.post_count || 0))
      .slice(0, 8);
  }, [tags]);

  const totalStoriesTagged = useMemo(() => {
    return tags.reduce((sum, t) => sum + (t.post_count || 0), 0);
  }, [tags]);

  return (
    <div className="container" style={{ paddingTop: '2rem', paddingBottom: '4rem' }}>

      <header
        style={{
          background: 'linear-gradient(135deg, var(--color-surface), var(--color-surface-alt))',
          padding: '2.5rem 2rem',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--color-border)',
          marginBottom: '2rem',
          boxShadow: 'var(--shadow-sm)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: '-20%',
            right: '-10%',
            width: '240px',
            height: '240px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, var(--color-secondary-glow), transparent 70%)',
            pointerEvents: 'none',
          }}
        />

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-secondary)', fontSize: '0.85rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
          <TagIcon size={16} /> Story Taxonomy & Topics
        </div>
        <h1 style={{ fontSize: '2.2rem', fontWeight: 900, marginBottom: '0.5rem', fontFamily: 'var(--font-heading)' }}>
          Explore by Keywords & Tags
        </h1>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: '1rem', maxWidth: '650px', margin: 0, lineHeight: 1.6 }}>
          Discover articles curated across {tags.length} specialized topics, technologies, and editorial keywords ({totalStoriesTagged} published story links).
        </p>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
            marginTop: '1.75rem',
            flexWrap: 'wrap',
          }}
        >
          <div
            style={{
              position: 'relative',
              flex: '1 1 300px',
              maxWidth: '450px',
            }}
          >
            <Search
              size={17}
              style={{
                position: 'absolute',
                left: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--color-muted)',
              }}
            />
            <input
              type="search"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by topic name (e.g. AI, React, Cloud)..."
              style={{
                width: '100%',
                padding: '0.65rem 1rem 0.65rem 2.4rem',
                fontSize: '0.9rem',
                borderRadius: 'var(--radius-full)',
                backgroundColor: 'var(--color-card)',
                border: '1px solid var(--color-border)',
                outline: 'none',
              }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.82rem', color: 'var(--color-text-secondary)', fontWeight: 600 }}>Sort By:</span>
            <button
              type="button"
              onClick={() => setSortBy('popular')}
              style={{
                padding: '0.45rem 0.85rem',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.8rem',
                fontWeight: 700,
                border: '1px solid var(--color-border)',
                backgroundColor: sortBy === 'popular' ? 'var(--color-secondary)' : 'var(--color-card)',
                color: sortBy === 'popular' ? '#FFFFFF' : 'var(--color-text)',
                cursor: 'pointer',
                transition: 'all var(--transition-fast)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
              }}
            >
              <TrendingUp size={13} /> Most Stories
            </button>
            <button
              type="button"
              onClick={() => setSortBy('alpha')}
              style={{
                padding: '0.45rem 0.85rem',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.8rem',
                fontWeight: 700,
                border: '1px solid var(--color-border)',
                backgroundColor: sortBy === 'alpha' ? 'var(--color-secondary)' : 'var(--color-card)',
                color: sortBy === 'alpha' ? '#FFFFFF' : 'var(--color-text)',
                cursor: 'pointer',
                transition: 'all var(--transition-fast)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
              }}
            >
              <Layers size={13} /> A - Z
            </button>
          </div>
        </div>
      </header>

      {!search && popularTags.length > 0 && (
        <section style={{ marginBottom: '2.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.85rem', fontSize: '0.9rem', fontWeight: 800, color: 'var(--color-text)' }}>
            <Sparkles size={16} color="var(--color-secondary)" /> Popular Topics
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem' }}>
            {popularTags.map(tag => (
              <Link
                key={tag.tag_id || tag.id}
                to={`/tag/${tag.slug}`}
                style={{
                  backgroundColor: 'var(--color-card)',
                  borderRadius: 'var(--radius-full)',
                  border: '1px solid var(--color-border)',
                  padding: '0.45rem 1rem',
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  color: 'var(--color-text)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  transition: 'all var(--transition-fast)',
                  boxShadow: 'var(--shadow-sm)',
                }}
              >
                <Hash size={14} color="var(--color-secondary)" />
                <span>{tag.name}</span>
                <span
                  style={{
                    backgroundColor: 'var(--color-surface-alt)',
                    padding: '0.1rem 0.45rem',
                    borderRadius: 'var(--radius-full)',
                    fontSize: '0.72rem',
                    color: 'var(--color-secondary)',
                    fontWeight: 800,
                  }}
                >
                  {tag.post_count || 0}
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {loading ? (
        <LoadingState message="Fetching publication tags..." />
      ) : filteredAndSortedTags.length === 0 ? (
        <EmptyState
          title="No Tags Found"
          description={search ? `No tags matching "${search}". Try searching another keyword.` : "No taxonomy tags defined in the system."}
        />
      ) : (
        <div>
          <div style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', marginBottom: '1rem', fontWeight: 600 }}>
            Showing {filteredAndSortedTags.length} {filteredAndSortedTags.length === 1 ? 'topic' : 'topics'}
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
              gap: '1rem',
            }}
          >
            {filteredAndSortedTags.map(tag => {
              const count = tag.post_count || 0;
              return (
                <Link
                  key={tag.tag_id || tag.id}
                  to={`/tag/${tag.slug}`}
                  style={{
                    backgroundColor: 'var(--color-card)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--color-border)',
                    padding: '1.15rem 1.25rem',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    gap: '0.85rem',
                    textDecoration: 'none',
                    color: 'inherit',
                    transition: 'all var(--transition-normal)',
                    boxShadow: 'var(--shadow-sm)',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.borderColor = 'var(--color-secondary)';
                    e.currentTarget.style.transform = 'translateY(-3px)';
                    e.currentTarget.style.boxShadow = 'var(--shadow-md)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.borderColor = 'var(--color-border)';
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                    <div
                      style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: 'var(--radius-sm)',
                        backgroundColor: 'var(--color-surface-alt)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'var(--color-secondary)',
                        fontWeight: 800,
                        flexShrink: 0,
                      }}
                    >
                      <Hash size={16} />
                    </div>
                    <div>
                      <h3 style={{ fontSize: '0.98rem', fontWeight: 800, margin: 0, fontFamily: 'var(--font-heading)' }}>
                        {tag.name}
                      </h3>
                      <span style={{ fontSize: '0.75rem', color: 'var(--color-muted)' }}>
                        /tag/{tag.slug}
                      </span>
                    </div>
                  </div>

                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      borderTop: '1px solid var(--color-border)',
                      paddingTop: '0.65rem',
                      fontSize: '0.8rem',
                      color: 'var(--color-text-secondary)',
                    }}
                  >
                    <span>{count} {count === 1 ? 'story' : 'stories'}</span>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.2rem', color: 'var(--color-secondary)', fontWeight: 700 }}>
                      Explore <ArrowRight size={13} />
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

