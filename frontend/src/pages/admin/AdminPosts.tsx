import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  PlusCircle,
  Edit3,
  Trash2,
  Eye,
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
  FileText,
  Sparkles,
  ExternalLink,
  MessageSquare,
} from 'lucide-react';
import { LoadingState } from '../../components/common/LoadingState';
import { EmptyState } from '../../components/common/EmptyState';
import { ApiService } from '../../services/api';
import { useConfirm } from '../../context/ConfirmDialogContext';

export const AdminPosts: React.FC = () => {
  const confirm = useConfirm();
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  const fetchAdminPosts = async () => {
    setLoading(true);
    try {
      const res = await ApiService.getAdminPosts();
      if (res && res.data) {
        setPosts(res.data);
      }
    } catch (err) {
      console.error('Failed to fetch admin posts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminPosts();
  }, []);

  const handleDelete = async (id: number, title: string) => {
    const isConfirmed = await confirm({
      title: 'Delete Article',
      message: `Are you sure you want to permanently delete article '${title}'?`,
      confirmText: 'Yes, Delete',
      type: 'danger',
    });

    if (isConfirmed) {
      try {
        await ApiService.deletePost(id);
        fetchAdminPosts();
      } catch (err: any) {
        alert(err.message || 'Failed to delete article');
      }
    }
  };

  const handleApprove = async (id: number, title: string) => {
    const isConfirmed = await confirm({
      title: 'Publish Article',
      message: `Approve and immediately publish '${title}' to the journal?`,
      confirmText: 'Approve & Publish',
      type: 'success',
    });

    if (!isConfirmed) return;
    setActionLoading(id);
    try {
      await ApiService.approvePost(id);
      await fetchAdminPosts();
    } catch (err: any) {
      alert(err.message || 'Failed to approve article');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (id: number, title: string) => {
    const reason = window.prompt(`Please provide a rejection reason for '${title}':`);
    if (reason === null) return; // cancelled
    setActionLoading(id);
    try {
      await ApiService.rejectPost(id, reason);
      await fetchAdminPosts();
    } catch (err: any) {
      alert(err.message || 'Failed to reject article');
    } finally {
      setActionLoading(null);
    }
  };

  const handleRequestChanges = async (id: number, title: string) => {
    const feedback = window.prompt(`Enter editorial revision instructions for '${title}':`);
    if (!feedback || !feedback.trim()) return;
    setActionLoading(id);
    try {
      await ApiService.requestChangesPost(id, feedback.trim());
      await fetchAdminPosts();
    } catch (err: any) {
      alert(err.message || 'Failed to request changes');
    } finally {
      setActionLoading(null);
    }
  };

  const pendingCount = posts.filter(p => p.status === 'pending_review').length;

  const filteredPosts = posts.filter(post => {
    const matchesSearch =
      post.title.toLowerCase().includes(search.toLowerCase()) ||
      (post.author_name && post.author_name.toLowerCase().includes(search.toLowerCase()));
    const matchesStatus = statusFilter === 'all' || post.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'published':
        return (
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.25rem',
              padding: '0.2rem 0.55rem',
              borderRadius: 'var(--radius-full)',
              fontSize: '0.72rem',
              fontWeight: 700,
              backgroundColor: 'rgba(16, 185, 129, 0.12)',
              color: 'var(--color-success)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
            }}
          >
            <CheckCircle2 size={11} /> Published
          </span>
        );
      case 'pending_review':
        return (
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.25rem',
              padding: '0.2rem 0.55rem',
              borderRadius: 'var(--radius-full)',
              fontSize: '0.72rem',
              fontWeight: 700,
              backgroundColor: 'rgba(245, 158, 11, 0.12)',
              color: 'var(--color-warning)',
              border: '1px solid rgba(245, 158, 11, 0.3)',
            }}
          >
            <Clock size={11} /> Pending Review
          </span>
        );
      case 'changes_requested':
        return (
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.25rem',
              padding: '0.2rem 0.55rem',
              borderRadius: 'var(--radius-full)',
              fontSize: '0.72rem',
              fontWeight: 700,
              backgroundColor: 'rgba(236, 72, 153, 0.12)',
              color: '#EC4899',
              border: '1px solid rgba(236, 72, 153, 0.3)',
            }}
          >
            <AlertTriangle size={11} /> Changes Requested
          </span>
        );
      case 'rejected':
        return (
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.25rem',
              padding: '0.2rem 0.55rem',
              borderRadius: 'var(--radius-full)',
              fontSize: '0.72rem',
              fontWeight: 700,
              backgroundColor: 'rgba(239, 68, 68, 0.12)',
              color: 'var(--color-danger)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
            }}
          >
            <XCircle size={11} /> Rejected
          </span>
        );
      case 'scheduled':
        return (
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.25rem',
              padding: '0.2rem 0.55rem',
              borderRadius: 'var(--radius-full)',
              fontSize: '0.72rem',
              fontWeight: 700,
              backgroundColor: 'rgba(59, 130, 246, 0.12)',
              color: '#3B82F6',
              border: '1px solid rgba(59, 130, 246, 0.3)',
            }}
          >
            <Clock size={11} /> Scheduled
          </span>
        );
      case 'draft':
      default:
        return (
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.25rem',
              padding: '0.2rem 0.55rem',
              borderRadius: 'var(--radius-full)',
              fontSize: '0.72rem',
              fontWeight: 700,
              backgroundColor: 'rgba(107, 114, 128, 0.12)',
              color: 'var(--color-muted)',
              border: '1px solid rgba(107, 114, 128, 0.3)',
            }}
          >
            <FileText size={11} /> Draft
          </span>
        );
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.6rem', marginBottom: '0.2rem', fontFamily: 'var(--font-heading)' }}>
            Articles Management & Approvals
          </h1>
          <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
            Manage editorial articles, review submitted reader posts, approve publications, and inspect SEO/AEO/GEO
          </p>
        </div>

        <Link
          to="/admin/posts/new"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            backgroundColor: 'var(--color-secondary)',
            color: '#FFFFFF',
            padding: '0.55rem 1.1rem',
            borderRadius: 'var(--radius-md)',
            fontWeight: 600,
            fontSize: '0.875rem',
            boxShadow: '0 2px 8px var(--color-secondary-glow)',
          }}
        >
          <PlusCircle size={16} /> Add New Article
        </Link>
      </div>

      {/* Filter and Tab Bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
          marginBottom: '1.25rem',
          backgroundColor: 'var(--color-card)',
          padding: '0.85rem 1rem',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--color-border)',
          flexWrap: 'wrap',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1, minWidth: '220px' }}>
          <Search size={16} color="var(--color-muted)" />
          <input
            type="search"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search articles by title or author..."
            style={{ width: '100%', padding: '0.4rem 0.6rem', fontSize: '0.875rem' }}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={() => setStatusFilter('pending_review')}
            style={{
              padding: '0.35rem 0.75rem',
              fontSize: '0.82rem',
              fontWeight: statusFilter === 'pending_review' ? 700 : 500,
              backgroundColor: statusFilter === 'pending_review' ? 'rgba(245, 158, 11, 0.2)' : 'var(--color-surface)',
              color: statusFilter === 'pending_review' ? 'var(--color-warning)' : 'var(--color-text)',
              border: '1px solid rgba(245, 158, 11, 0.4)',
              borderRadius: 'var(--radius-sm)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
            }}
          >
            <Clock size={13} /> Pending Approvals ({pendingCount})
          </button>

          <span style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', fontWeight: 600 }}>Status:</span>
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            style={{ padding: '0.4rem 0.6rem', fontSize: '0.85rem' }}
          >
            <option value="all">All Articles ({posts.length})</option>
            <option value="pending_review">Pending Review ({pendingCount})</option>
            <option value="published">Published</option>
            <option value="changes_requested">Changes Requested</option>
            <option value="rejected">Rejected</option>
            <option value="draft">Drafts</option>
            <option value="scheduled">Scheduled</option>
            <option value="archived">Archived</option>
          </select>
        </div>
      </div>

      {/* Articles Table */}
      {loading ? (
        <LoadingState message="Fetching article database records..." />
      ) : filteredPosts.length === 0 ? (
        <EmptyState
          title="No Articles Found"
          description={
            statusFilter === 'pending_review'
              ? 'No pending article submissions waiting for review at this time.'
              : search
              ? `No articles match filter '${search}'.`
              : 'No articles created yet in the database.'
          }
        />
      ) : (
        <div className="table-responsive" style={{ backgroundColor: 'var(--color-card)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
            <thead>
              <tr style={{ backgroundColor: 'var(--color-surface-alt)', borderBottom: '1px solid var(--color-border)', color: 'var(--color-text-secondary)', fontWeight: 700 }}>
                <th style={{ padding: '0.75rem 1rem' }}>Title & Status</th>
                <th style={{ padding: '0.75rem 1rem' }}>Author</th>
                <th style={{ padding: '0.75rem 1rem' }}>Category</th>
                <th style={{ padding: '0.75rem 1rem' }}>SEO / AEO / GEO</th>
                <th style={{ padding: '0.75rem 1rem' }}>Updated</th>
                <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredPosts.map(post => (
                <tr
                  key={post.post_id}
                  style={{
                    borderBottom: '1px solid var(--color-border)',
                    backgroundColor: post.status === 'pending_review' ? 'rgba(245, 158, 11, 0.04)' : 'transparent',
                    transition: 'background-color var(--transition-fast)',
                  }}
                >
                  <td style={{ padding: '0.85rem 1rem' }}>
                    <div style={{ fontWeight: 700, color: 'var(--color-text)', fontSize: '0.92rem', marginBottom: '0.25rem' }}>
                      {post.title}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
                      {getStatusBadge(post.status)}
                      <span style={{ fontSize: '0.75rem', color: 'var(--color-muted)' }}>
                        {post.views_count || 0} views
                      </span>
                    </div>
                    {post.reviewer_feedback && (
                      <div
                        style={{
                          fontSize: '0.75rem',
                          color: post.status === 'rejected' ? 'var(--color-danger)' : '#EC4899',
                          marginTop: '0.35rem',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.25rem',
                        }}
                      >
                        <MessageSquare size={12} />
                        <span>Note: {post.reviewer_feedback}</span>
                      </div>
                    )}
                  </td>

                  <td style={{ padding: '0.85rem 1rem', color: 'var(--color-text)' }}>
                    <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{post.author_name || 'Author'}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--color-muted)' }}>@{post.author_username || 'user'}</div>
                  </td>

                  <td style={{ padding: '0.85rem 1rem', color: 'var(--color-text-secondary)' }}>
                    {post.category_name || 'General'}
                  </td>

                  <td style={{ padding: '0.85rem 1rem' }}>
                    <div style={{ display: 'flex', gap: '0.25rem', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '0.7rem', padding: '0.15rem 0.4rem', backgroundColor: 'var(--color-surface-alt)', borderRadius: 'var(--radius-sm)', color: 'var(--color-secondary)', fontWeight: 600 }}>
                        SEO
                      </span>
                      <span style={{ fontSize: '0.7rem', padding: '0.15rem 0.4rem', backgroundColor: 'var(--color-surface-alt)', borderRadius: 'var(--radius-sm)', color: 'var(--color-secondary)', fontWeight: 600 }}>
                        AEO
                      </span>
                      <span style={{ fontSize: '0.7rem', padding: '0.15rem 0.4rem', backgroundColor: 'var(--color-surface-alt)', borderRadius: 'var(--radius-sm)', color: 'var(--color-secondary)', fontWeight: 600 }}>
                        GEO
                      </span>
                    </div>
                  </td>

                  <td style={{ padding: '0.85rem 1rem', color: 'var(--color-muted)', fontSize: '0.8rem' }}>
                    {new Date(post.updated_at || post.created_at).toLocaleDateString(undefined, {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </td>

                  <td style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                      {/* Approval Workflow Controls for Pending Articles */}
                      {post.status === 'pending_review' && (
                        <>
                          <button
                            type="button"
                            disabled={actionLoading === post.post_id}
                            onClick={() => handleApprove(post.post_id, post.title)}
                            title="Approve & Publish"
                            style={{
                              padding: '0.35rem 0.65rem',
                              backgroundColor: 'rgba(16, 185, 129, 0.15)',
                              color: 'var(--color-success)',
                              border: '1px solid rgba(16, 185, 129, 0.4)',
                              borderRadius: 'var(--radius-sm)',
                              fontSize: '0.75rem',
                              fontWeight: 700,
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.25rem',
                            }}
                          >
                            <CheckCircle2 size={13} /> Approve
                          </button>

                          <button
                            type="button"
                            disabled={actionLoading === post.post_id}
                            onClick={() => handleRequestChanges(post.post_id, post.title)}
                            title="Request Revisions"
                            style={{
                              padding: '0.35rem 0.65rem',
                              backgroundColor: 'rgba(236, 72, 153, 0.15)',
                              color: '#EC4899',
                              border: '1px solid rgba(236, 72, 153, 0.4)',
                              borderRadius: 'var(--radius-sm)',
                              fontSize: '0.75rem',
                              fontWeight: 700,
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.25rem',
                            }}
                          >
                            <AlertTriangle size={13} /> Changes
                          </button>

                          <button
                            type="button"
                            disabled={actionLoading === post.post_id}
                            onClick={() => handleReject(post.post_id, post.title)}
                            title="Reject Story"
                            style={{
                              padding: '0.35rem 0.65rem',
                              backgroundColor: 'rgba(239, 68, 68, 0.15)',
                              color: 'var(--color-danger)',
                              border: '1px solid rgba(239, 68, 68, 0.4)',
                              borderRadius: 'var(--radius-sm)',
                              fontSize: '0.75rem',
                              fontWeight: 700,
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.25rem',
                            }}
                          >
                            <XCircle size={13} /> Reject
                          </button>
                        </>
                      )}

                      {post.status === 'published' && (
                        <Link
                          to={`/post/${post.slug}`}
                          title="View live article"
                          style={{
                            padding: '0.4rem',
                            color: 'var(--color-secondary)',
                            backgroundColor: 'var(--color-surface-alt)',
                            borderRadius: 'var(--radius-sm)',
                            display: 'inline-flex',
                          }}
                        >
                          <ExternalLink size={15} />
                        </Link>
                      )}

                      <Link
                        to={`/admin/posts/${post.post_id}`}
                        title="Edit article"
                        style={{
                          padding: '0.4rem',
                          color: 'var(--color-text-secondary)',
                          backgroundColor: 'var(--color-surface-alt)',
                          borderRadius: 'var(--radius-sm)',
                          display: 'inline-flex',
                        }}
                      >
                        <Edit3 size={15} />
                      </Link>

                      <button
                        onClick={() => handleDelete(post.post_id, post.title)}
                        title="Delete article"
                        style={{
                          padding: '0.4rem',
                          color: 'var(--color-danger)',
                          backgroundColor: 'var(--color-surface-alt)',
                          borderRadius: 'var(--radius-sm)',
                          display: 'inline-flex',
                        }}
                      >
                        <Trash2 size={15} />
                      </button>
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
