import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Users, FileText, ArrowRight, Eye, Search, Tag, Globe, Twitter, Github, Linkedin } from 'lucide-react';
import { LoadingState } from '../../components/common/LoadingState';
import { EmptyState } from '../../components/common/EmptyState';
import { UserAvatar } from '../../components/common/UserAvatar';
import { SeoHead } from '../../components/common/SeoHead';
import { ApiService } from '../../services/api';
import { useSettings } from '../../context/SettingsContext';

export const Authors: React.FC = () => {
  const [authors, setAuthors] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const { settings } = useSettings();
  const siteName = settings.site_name || 'BitBlog';

  useEffect(() => {
    ApiService.getAuthors()
      .then(res => {
        if (res && res.data) {
          setAuthors(res.data);
        }
      })
      .catch(err => {
        console.error('Failed to load authors:', err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const filteredAuthors = authors.filter(author => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    const nameMatch = (author.name || '').toLowerCase().includes(q);
    const usernameMatch = (author.username || '').toLowerCase().includes(q);
    const bioMatch = (author.bio || '').toLowerCase().includes(q);
    const tagMatch = (author.author_tags || []).some((t: string) => t.toLowerCase().includes(q));
    return nameMatch || usernameMatch || bioMatch || tagMatch;
  });

  return (
    <div className="container" style={{ paddingTop: '1.5rem', paddingBottom: '3.5rem' }}>
      <SeoHead
        title={`Editorial Desk & Authors | ${siteName}`}
        description={`Meet the journalists, editors, and industry analysts writing for ${siteName}.`}
      />

      <header
        style={{
          backgroundColor: 'var(--color-card)',
          padding: '2.5rem 2rem',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--color-border)',
          marginBottom: '2rem',
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--color-secondary)', fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.5rem' }}>
          <Users size={16} /> Editorial Desk & Contributors
        </div>
        <h1 style={{ fontSize: '2.2rem', marginBottom: '0.5rem', fontFamily: 'var(--font-heading)' }}>
          Our Writers & Columnists
        </h1>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.95rem', maxWidth: '650px', lineHeight: '1.5', margin: 0 }}>
          Meet the journalists, editors, columnists, and technical contributors driving high-impact stories across {siteName}.
        </p>

        <div style={{ marginTop: '1.5rem', position: 'relative', maxWidth: '420px' }}>
          <Search size={16} color="var(--color-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search writers by name, topic, or expertise..."
            style={{
              width: '100%',
              padding: '0.65rem 1rem 0.65rem 2.4rem',
              fontSize: '0.88rem',
              borderRadius: 'var(--radius-full)',
              backgroundColor: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
            }}
          />
        </div>
      </header>

      {loading ? (
        <LoadingState message="Fetching editorial staff profiles..." />
      ) : filteredAuthors.length === 0 ? (
        <EmptyState
          title={searchQuery ? 'No Writers Match Your Search' : 'No Authors Found'}
          description={searchQuery ? 'Try searching for different keywords or clear your query.' : 'Registered authors and editors will be listed here automatically.'}
        />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 280px), 1fr))', gap: '1.5rem' }}>
          {filteredAuthors.map(author => (
            <Link
              key={author.user_id}
              to={`/author/${author.user_id}`}
              style={{
                backgroundColor: 'var(--color-card)',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--color-border)',
                padding: '1.5rem',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                transition: 'all var(--transition-fast)',
                textDecoration: 'none',
                color: 'inherit',
                boxShadow: 'var(--shadow-sm)',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = 'var(--color-secondary)';
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = 'var(--shadow-md)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = 'var(--color-border)';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
              }}
            >
              <div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                  <UserAvatar
                    src={author.profile_image}
                    name={author.name}
                    size={58}
                    showOnline={true}
                  />

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: '0 0 0.15rem 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {author.name}
                    </h3>
                    <span
                      style={{
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        padding: '0.15rem 0.5rem',
                        backgroundColor: 'var(--color-surface-alt)',
                        color: 'var(--color-secondary)',
                        borderRadius: 'var(--radius-full)',
                        display: 'inline-block',
                      }}
                    >
                      {author.role || 'Staff Writer'}
                    </span>
                  </div>
                </div>

                <p
                  style={{
                    color: 'var(--color-text-secondary)',
                    fontSize: '0.85rem',
                    lineHeight: '1.5',
                    margin: '0 0 1rem 0',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                  }}
                >
                  {author.short_description || author.bio || 'Contributing author and analyst at BitBlog.'}
                </p>

                {author.author_tags && author.author_tags.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', marginBottom: '1rem' }}>
                    {author.author_tags.slice(0, 3).map((t: string) => (
                      <span
                        key={t}
                        style={{
                          fontSize: '0.72rem',
                          fontWeight: 600,
                          padding: '0.15rem 0.45rem',
                          borderRadius: 'var(--radius-sm)',
                          backgroundColor: 'var(--color-surface)',
                          border: '1px solid var(--color-border)',
                          color: 'var(--color-text-secondary)',
                        }}
                      >
                        #{t}
                      </span>
                    ))}
                    {author.author_tags.length > 3 && (
                      <span style={{ fontSize: '0.7rem', color: 'var(--color-muted)', alignSelf: 'center' }}>
                        +{author.author_tags.length - 3} more
                      </span>
                    )}
                  </div>
                )}
              </div>

              <div
                style={{
                  borderTop: '1px solid var(--color-border)',
                  paddingTop: '0.85rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  fontSize: '0.8rem',
                  color: 'var(--color-muted)',
                }}
              >
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    <FileText size={13} color="var(--color-secondary)" /> {author.published_count || 0} stories
                  </span>
                  {author.total_views !== undefined && author.total_views > 0 && (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                      <Eye size={13} /> {author.total_views.toLocaleString()} views
                    </span>
                  )}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.2rem', color: 'var(--color-secondary)', fontWeight: 700, fontSize: '0.82rem' }}>
                  View Profile <ArrowRight size={14} />
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

