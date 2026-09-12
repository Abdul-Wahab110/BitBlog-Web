import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FileText,
  Plus,
  Edit,
  Trash2,
  Clock,
  CheckCircle2,
  AlertCircle,
  Eye,
  ExternalLink,
  MessageSquare,
  HelpCircle,
  AlertTriangle,
} from 'lucide-react';
import { ApiService } from '../../services/api';
import { SeoHead } from '../../components/common/SeoHead';
import { useConfirm } from '../../context/ConfirmDialogContext';
import { useSettings } from '../../context/SettingsContext';

export const UserArticles: React.FC = () => {
  const confirm = useConfirm();
  const { settings } = useSettings();
  const siteName = settings.site_name || 'BitBlog';
  const [articles, setArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchArticles = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await ApiService.getUserArticles();
      if (res && res.data) {
        setArticles(res.data);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to load your articles');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArticles();
  }, []);

  const handleDelete = async (id: number, title: string) => {
    const isConfirmed = await confirm({
      title: 'Delete Article',
      message: `Are you sure you want to delete '${title}'? This action cannot be undone.`,
      confirmText: 'Yes, Delete',
      type: 'danger',
    });

    if (!isConfirmed) return;

    try {
      await ApiService.deleteUserArticle(id);
      setArticles(prev => prev.filter(a => a.post_id !== id));
    } catch (err: any) {
      alert(err.message || 'Error deleting article');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'published':
        return (
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.3rem',
              padding: '0.25rem 0.65rem',
              borderRadius: 'var(--radius-full)',
              fontSize: '0.75rem',
              fontWeight: 700,
              backgroundColor: 'rgba(16, 185, 129, 0.12)',
              color: 'var(--color-success)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
            }}
          >
            <CheckCircle2 size={12} /> Published
          </span>
        );
      case 'pending_review':
        return (
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.3rem',
              padding: '0.25rem 0.65rem',
              borderRadius: 'var(--radius-full)',
              fontSize: '0.75rem',
              fontWeight: 700,
              backgroundColor: 'rgba(245, 158, 11, 0.12)',
              color: 'var(--color-warning)',
              border: '1px solid rgba(245, 158, 11, 0.3)',
            }}
          >
            <Clock size={12} /> Pending Review
          </span>
        );
      case 'changes_requested':
        return (
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.3rem',
              padding: '0.25rem 0.65rem',
              borderRadius: 'var(--radius-full)',
              fontSize: '0.75rem',
              fontWeight: 700,
              backgroundColor: 'rgba(236, 72, 153, 0.12)',
              color: '#EC4899',
              border: '1px solid rgba(236, 72, 153, 0.3)',
            }}
          >
            <AlertTriangle size={12} /> Changes Requested
          </span>
        );
      case 'rejected':
        return (
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.3rem',
              padding: '0.25rem 0.65rem',
              borderRadius: 'var(--radius-full)',
              fontSize: '0.75rem',
              fontWeight: 700,
              backgroundColor: 'rgba(239, 68, 68, 0.12)',
              color: 'var(--color-danger)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
            }}
          >
            <AlertCircle size={12} /> Rejected
          </span>
        );
      case 'draft':
      default:
        return (
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.3rem',
              padding: '0.25rem 0.65rem',
              borderRadius: 'var(--radius-full)',
              fontSize: '0.75rem',
              fontWeight: 700,
              backgroundColor: 'rgba(107, 114, 128, 0.12)',
              color: 'var(--color-muted)',
              border: '1px solid rgba(107, 114, 128, 0.3)',
            }}
          >
            <FileText size={12} /> Draft
          </span>
        );
    }
  };

  return (
    <div>
      <SeoHead
        title={`My Submitted Articles | ${siteName}`}
        description="View and manage your article drafts, submissions, and editorial review statuses."
        robots="noindex, nofollow"
      />

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1.75rem',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div>
          <h1 style={{ fontSize: '1.65rem', fontWeight: 800, margin: 0, fontFamily: 'var(--font-heading)' }}>
            My Articles & Submissions
          </h1>
          <p style={{ fontSize: '0.85rem', color: 'var(--color-muted)', margin: '0.25rem 0 0 0' }}>
            Write stories, submit them for editorial approval, and track publication status.
          </p>
        </div>

        <Link
          to="/user/articles/new"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.45rem',
            padding: '0.65rem 1.25rem',
            backgroundColor: 'var(--color-secondary)',
            color: '#FFFFFF',
            fontWeight: 700,
            fontSize: '0.88rem',
            borderRadius: 'var(--radius-md)',
            boxShadow: '0 2px 8px var(--color-secondary-glow)',
            minHeight: '40px',
          }}
        >
          <Plus size={16} /> Write New Story
        </Link>
      </div>

      {errorMsg && (
        <div
          role="alert"
          style={{
            padding: '0.85rem 1.25rem',
            backgroundColor: 'rgba(239, 68, 68, 0.12)',
            border: '1px solid var(--color-danger)',
            borderRadius: 'var(--radius-md)',
            color: 'var(--color-danger)',
            marginBottom: '1.5rem',
            fontSize: '0.88rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          <AlertCircle size={18} />
          <span>{errorMsg}</span>
        </div>
      )}

      {loading ? (
        <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--color-muted)' }}>
          <p>Loading your articles from database...</p>
        </div>
      ) : articles.length === 0 ? (
        <div
          style={{
            padding: '3.5rem 2rem',
            backgroundColor: 'var(--color-card)',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--color-border)',
            textAlign: 'center',
          }}
        >
          <div
            style={{
              width: '56px',
              height: '56px',
              borderRadius: 'var(--radius-full)',
              backgroundColor: 'var(--color-surface-alt)',
              color: 'var(--color-muted)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '1rem',
            }}
          >
            <FileText size={28} />
          </div>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.5rem', fontFamily: 'var(--font-heading)' }}>
            No articles yet.
          </h3>
          <p style={{ fontSize: '0.88rem', color: 'var(--color-text-secondary)', maxWidth: '420px', margin: '0 auto 1.5rem auto', lineHeight: 1.5 }}>
            Share your insights, technical tutorials, and opinions with the {siteName} community. Submit a story to get started!
          </p>
          <Link
            to="/user/articles/new"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.6rem 1.25rem',
              backgroundColor: 'var(--color-secondary)',
              color: '#FFFFFF',
              fontWeight: 700,
              fontSize: '0.88rem',
              borderRadius: 'var(--radius-md)',
            }}
          >
            <Plus size={16} /> Write Your First Story
          </Link>
        </div>
      ) : (
        <div className="cms-table-wrapper">
          <table className="cms-responsive-table">
            <thead>
              <tr style={{ backgroundColor: 'var(--color-surface-alt)', borderBottom: '1px solid var(--color-border)' }}>
                <th style={{ padding: '0.85rem 1.25rem', fontWeight: 700, color: 'var(--color-muted)', fontSize: '0.75rem', textTransform: 'uppercase' }}>Article</th>
                <th style={{ padding: '0.85rem 1rem', fontWeight: 700, color: 'var(--color-muted)', fontSize: '0.75rem', textTransform: 'uppercase' }}>Status</th>
                <th style={{ padding: '0.85rem 1rem', fontWeight: 700, color: 'var(--color-muted)', fontSize: '0.75rem', textTransform: 'uppercase' }}>Category</th>
                <th style={{ padding: '0.85rem 1rem', fontWeight: 700, color: 'var(--color-muted)', fontSize: '0.75rem', textTransform: 'uppercase' }}>Last Updated</th>
                <th style={{ padding: '0.85rem 1.25rem', fontWeight: 700, color: 'var(--color-muted)', fontSize: '0.75rem', textTransform: 'uppercase', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {articles.map(article => (
                <tr
                  key={article.post_id}
                  className="cms-table-row"
                >
                  <td className="cms-td-title" style={{ padding: '0.85rem 1.25rem' }}>
                    <div style={{ fontWeight: 700, color: 'var(--color-text)', fontSize: '0.94rem', marginBottom: '0.35rem', lineHeight: 1.35 }}>
                      {article.title}
                    </div>
                    {article.reviewer_feedback && (
                      <div
                        style={{
                          fontSize: '0.78rem',
                          color: article.status === 'rejected' ? 'var(--color-danger)' : '#EC4899',
                          backgroundColor: 'var(--color-surface-alt)',
                          padding: '0.35rem 0.6rem',
                          borderRadius: 'var(--radius-sm)',
                          marginTop: '0.35rem',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.3rem',
                        }}
                      >
                        <MessageSquare size={13} />
                        <span>Reviewer note: {article.reviewer_feedback}</span>
                      </div>
                    )}
                  </td>
                  <td className="cms-td-category" style={{ padding: '0.85rem 1rem' }}>
                    <span className="cms-mobile-label">Status</span>
                    {getStatusBadge(article.status)}
                  </td>
                  <td className="cms-td-category" style={{ padding: '0.85rem 1rem', color: 'var(--color-text-secondary)' }}>
                    <span className="cms-mobile-label">Category</span>
                    <span style={{ fontWeight: 600, fontSize: '0.85rem' }}>{article.category_name || 'General'}</span>
                  </td>
                  <td className="cms-td-updated" style={{ padding: '0.85rem 1rem', color: 'var(--color-muted)', fontSize: '0.82rem' }}>
                    <span className="cms-mobile-label">Updated</span>
                    <span>
                      {new Date(article.updated_at || article.created_at).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </span>
                  </td>
                  <td className="cms-td-actions" style={{ padding: '0.85rem 1.25rem', textAlign: 'right' }}>
                    <div className="cms-actions-group">
                      {article.status === 'published' ? (
                        <Link
                          to={`/post/${article.slug}`}
                          title="View live article"
                          className="cms-btn-view"
                        >
                          <ExternalLink size={14} /> <span>View Live</span>
                        </Link>
                      ) : null}

                      <Link
                        to={`/user/articles/edit/${article.post_id}`}
                        title="Edit article"
                        className="cms-btn-edit"
                      >
                        <Edit size={14} /> <span>Edit Story</span>
                      </Link>

                      {article.status !== 'published' && (
                        <button
                          type="button"
                          onClick={() => handleDelete(article.post_id, article.title)}
                          title="Delete article"
                          className="cms-btn-delete"
                        >
                          <Trash2 size={14} /> <span>Delete</span>
                        </button>
                      )}
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

