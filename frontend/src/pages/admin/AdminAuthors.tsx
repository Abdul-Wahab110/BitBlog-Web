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
        <div className="cms-table-wrapper">
          <table className="cms-responsive-table">
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
                <tr key={author.user_id} className="cms-table-row">
                  <td className="cms-td-author" style={{ padding: '0.85rem 1rem', fontWeight: 600 }}>
                    <span className="cms-mobile-label">Author</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <UserAvatar
                        src={author.profile_image}
                        name={author.name}
                        size={38}
                      />
                      <div>
                        <div style={{ fontWeight: 700, color: 'var(--color-text)', fontSize: '0.94rem' }}>{author.name}</div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--color-muted)' }}>@{author.username}</div>
                      </div>
                    </div>
                  </td>

                  <td className="cms-td-category" style={{ padding: '0.85rem 1rem', color: 'var(--color-text-secondary)' }}>
                    <span className="cms-mobile-label">Email</span>
                    <span style={{ fontSize: '0.85rem', wordBreak: 'break-all' }}>{author.email}</span>
                  </td>

                  <td className="cms-td-category" style={{ padding: '0.85rem 1rem' }}>
                    <span className="cms-mobile-label">Role</span>
                    <span
                      style={{
                        padding: '0.2rem 0.6rem',
                        borderRadius: 'var(--radius-full)',
                        fontSize: '0.78rem',
                        fontWeight: 700,
                        backgroundColor:
                          author.role === 'Admin'
                            ? 'rgba(239, 68, 68, 0.15)'
                            : author.role === 'Editor'
                            ? 'rgba(236, 72, 153, 0.15)'
                            : 'rgba(99, 102, 241, 0.15)',
                        color:
                          author.role === 'Admin'
                            ? 'var(--color-danger)'
                            : author.role === 'Editor'
                            ? '#EC4899'
                            : 'var(--color-secondary)',
                      }}
                    >
                      {author.role}
                    </span>
                  </td>

                  <td className="cms-td-updated" style={{ padding: '0.85rem 1rem' }}>
                    <span className="cms-mobile-label">Stories</span>
                    <span style={{ padding: '0.2rem 0.55rem', backgroundColor: 'var(--color-surface-alt)', borderRadius: 'var(--radius-full)', fontSize: '0.78rem', fontWeight: 700, color: 'var(--color-secondary)' }}>
                      {author.published_count || 0} published
                    </span>
                  </td>

                  <td className="cms-td-updated" style={{ padding: '0.85rem 1rem' }}>
                    <span className="cms-mobile-label">Views</span>
                    <span style={{ padding: '0.2rem 0.55rem', backgroundColor: 'var(--color-surface-alt)', borderRadius: 'var(--radius-full)', fontSize: '0.78rem', fontWeight: 700, color: 'var(--color-muted)' }}>
                      {author.total_views || 0} views
                    </span>
                  </td>

                  <td className="cms-td-actions" style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>
                    <div className="cms-actions-group">
                      <Link
                        to={`/author/${author.user_id}`}
                        target="_blank"
                        className="cms-btn-view"
                        title="View public author profile"
                      >
                        <ExternalLink size={14} /> <span>View Profile</span>
                      </Link>

                      <Link
                        to="/admin/users"
                        className="cms-btn-edit"
                        title="Edit author profile & privileges"
                      >
                        <FileText size={14} /> <span>Manage Access</span>
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
