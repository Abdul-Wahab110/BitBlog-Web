import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { UserCheck, FileText, Eye, ExternalLink } from 'lucide-react';
import { LoadingState } from '../../components/common/LoadingState';
import { EmptyState } from '../../components/common/EmptyState';
import { UserAvatar } from '../../components/common/UserAvatar';
import { ApiService } from '../../services/api';

export const AdminAuthors: React.FC = () => {
  const [authors, setAuthors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    ApiService.getAdminAuthors()
      .then(res => {
        if (res && res.data) {
          setAuthors(res.data);
        }
      })
      .catch(err => {
        console.error('Failed to fetch authors:', err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  return (
    <div>
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.6rem', marginBottom: '0.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <UserCheck size={22} color="var(--color-secondary)" /> Editorial Authors & Columnists
        </h1>
        <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>Authors, editors, and administrators with publication rights</p>
      </div>

      {loading ? (
        <LoadingState message="Fetching editorial author profiles..." />
      ) : authors.length === 0 ? (
        <EmptyState title="No Authors Found" description="No accounts with author or editor privileges found in the database." />
      ) : (
        <div className="table-responsive" style={{ backgroundColor: 'var(--color-card)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
            <thead>
              <tr style={{ backgroundColor: 'var(--color-surface-alt)', borderBottom: '1px solid var(--color-border)', color: 'var(--color-text-secondary)', fontWeight: 700 }}>
                <th style={{ padding: '0.75rem 1rem' }}>Author</th>
                <th style={{ padding: '0.75rem 1rem' }}>Email</th>
                <th style={{ padding: '0.75rem 1rem' }}>Role</th>
                <th style={{ padding: '0.75rem 1rem' }}>Published Stories</th>
                <th style={{ padding: '0.75rem 1rem' }}>Total Article Views</th>
                <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>Public Profile</th>
              </tr>
            </thead>
            <tbody>
              {authors.map(author => (
                <tr key={author.user_id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                  <td style={{ padding: '0.75rem 1rem', fontWeight: 600 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                      <UserAvatar
                        src={author.profile_image}
                        name={author.name}
                        size={34}
                      />
                      <div>
                        <span>{author.name}</span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--color-muted)', display: 'block' }}>@{author.username}</span>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '0.75rem 1rem', color: 'var(--color-text-secondary)' }}>{author.email}</td>
                  <td style={{ padding: '0.75rem 1rem', fontWeight: 600, color: 'var(--color-secondary)' }}>{author.role}</td>
                  <td style={{ padding: '0.75rem 1rem' }}>{author.published_count || 0}</td>
                  <td style={{ padding: '0.75rem 1rem' }}>{author.total_views || 0}</td>
                  <td style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', justifyContent: 'flex-end' }}>
                      <Link
                        to="/admin/users"
                        title="Edit Author Profile & Role"
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.25rem',
                          padding: '0.3rem 0.65rem',
                          fontSize: '0.78rem',
                          borderRadius: 'var(--radius-sm)',
                          backgroundColor: 'var(--color-surface)',
                          border: '1px solid var(--color-border)',
                          color: 'var(--color-text)',
                          fontWeight: 600,
                          textDecoration: 'none',
                        }}
                      >
                        Edit Profile
                      </Link>

                      <Link
                        to={`/author/${author.user_id}`}
                        target="_blank"
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.3rem',
                          padding: '0.3rem 0.65rem',
                          fontSize: '0.78rem',
                          borderRadius: 'var(--radius-sm)',
                          backgroundColor: 'var(--color-surface-alt)',
                          border: '1px solid var(--color-secondary-glow)',
                          color: 'var(--color-secondary)',
                          fontWeight: 600,
                          textDecoration: 'none',
                        }}
                      >
                        View <ExternalLink size={12} />
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
