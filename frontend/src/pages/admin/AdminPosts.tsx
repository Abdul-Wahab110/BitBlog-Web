import React, { useState, useEffect, useRef } from 'react';
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
  ChevronDown,
  Filter,
  Check,
  CheckCircle,
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
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
    if (reason === null) return;
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

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '0.75rem',
          marginBottom: '1.25rem',
          backgroundColor: 'var(--color-card)',
          padding: '0.75rem 0.85rem',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--color-border)',
          flexWrap: 'wrap',
          width: '100%',
          boxSizing: 'border-box',
          overflow: 'visible',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: '1 1 200px', minWidth: 0, width: '100%' }}>
          <Search size={16} color="var(--color-muted)" style={{ flexShrink: 0 }} />
          <input
            type="search"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search articles by title or author..."
            style={{ width: '100%', minWidth: 0, padding: '0.4rem 0.6rem', fontSize: '0.875rem' }}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={() => setStatusFilter(statusFilter === 'pending_review' ? 'all' : 'pending_review')}
            style={{
              padding: '0.45rem 0.85rem',
              fontSize: '0.82rem',
              fontWeight: statusFilter === 'pending_review' ? 700 : 600,
              backgroundColor: statusFilter === 'pending_review' ? 'rgba(245, 158, 11, 0.2)' : 'var(--color-surface)',
              color: statusFilter === 'pending_review' ? 'var(--color-warning)' : 'var(--color-text)',
              border: statusFilter === 'pending_review' ? '1px solid var(--color-warning)' : '1px solid var(--color-border)',
              borderRadius: 'var(--radius-md)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            <Clock size={14} color="var(--color-warning)" />
            <span>Pending Approvals ({pendingCount})</span>
          </button>

          <div ref={dropdownRef} style={{ position: 'relative' }}>
            <button
              type="button"
              onClick={() => setDropdownOpen(!dropdownOpen)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.45rem',
                padding: '0.45rem 0.85rem',
                backgroundColor: 'var(--color-surface-alt)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-md)',
                color: 'var(--color-text)',
                fontSize: '0.84rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              <Filter size={14} color="var(--color-secondary)" />
              <span>
                {statusFilter === 'all'
                  ? `All Articles (${posts.length})`
                  : statusFilter === 'pending_review'
                  ? `Pending Review (${pendingCount})`
                  : statusFilter === 'published'
                  ? 'Published'
                  : statusFilter === 'changes_requested'
                  ? 'Changes Requested'
                  : statusFilter === 'rejected'
                  ? 'Rejected'
                  : statusFilter === 'draft'
                  ? 'Drafts'
                  : statusFilter === 'scheduled'
                  ? 'Scheduled'
                  : statusFilter === 'archived'
                  ? 'Archived'
                  : 'Status Filter'}
              </span>
              <ChevronDown
                size={14}
                style={{
                  transform: dropdownOpen ? 'rotate(180deg)' : 'none',
                  transition: 'transform 0.2s ease',
                }}
              />
            </button>

            {dropdownOpen && (
              <div className="cms-filter-dropdown-menu">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.35rem 0.6rem 0.45rem', borderBottom: '1px solid var(--color-border)', marginBottom: '0.2rem' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Filter by Status</span>
                  <button type="button" onClick={() => setDropdownOpen(false)} style={{ background: 'transparent', border: 'none', color: 'var(--color-muted)', cursor: 'pointer', padding: 0, fontSize: '0.85rem' }}>✕</button>
                </div>
                {[
                  { value: 'all', label: `All Articles (${posts.length})`, color: 'var(--color-secondary)' },
                  { value: 'pending_review', label: `Pending Review (${pendingCount})`, color: 'var(--color-warning)' },
                  { value: 'published', label: 'Published', color: 'var(--color-success)' },
                  { value: 'changes_requested', label: 'Changes Requested', color: '#EC4899' },
                  { value: 'rejected', label: 'Rejected', color: 'var(--color-danger)' },
                  { value: 'draft', label: 'Drafts', color: 'var(--color-muted)' },
                  { value: 'scheduled', label: 'Scheduled', color: '#38BDF8' },
                  { value: 'archived', label: 'Archived', color: '#9CA3AF' },
                ].map(opt => {
                  const isSelected = statusFilter === opt.value;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => {
                        setStatusFilter(opt.value);
                        setDropdownOpen(false);
                      }}
                      className={`cms-filter-dropdown-item ${isSelected ? 'active' : ''}`}
                    >
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span
                          style={{
                            width: '8px',
                            height: '8px',
                            borderRadius: '50%',
                            backgroundColor: opt.color || 'var(--color-muted)',
                            display: 'inline-block',
                            flexShrink: 0,
                          }}
                        />
                        {opt.label}
                      </span>
                      {isSelected && <Check size={14} color="var(--color-secondary)" style={{ flexShrink: 0 }} />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

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
        <div className="cms-table-wrapper">
          <table className="cms-responsive-table">
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
                  className="cms-table-row"
                  style={{
                    backgroundColor: post.status === 'pending_review' ? 'rgba(245, 158, 11, 0.04)' : undefined,
                  }}
                >
                  <td className="cms-td-title" style={{ padding: '0.85rem 1rem' }}>
                    <div style={{ fontWeight: 700, color: 'var(--color-text)', fontSize: '0.94rem', marginBottom: '0.35rem', lineHeight: 1.35 }}>
                      {post.title}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', flexWrap: 'wrap' }}>
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

                  <td className="cms-td-author" style={{ padding: '0.85rem 1rem', color: 'var(--color-text)' }}>
                    <span className="cms-mobile-label">Author</span>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{post.author_name || 'Author'}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--color-muted)' }}>@{post.author_username || 'user'}</div>
                    </div>
                  </td>

                  <td className="cms-td-category" style={{ padding: '0.85rem 1rem', color: 'var(--color-text-secondary)' }}>
                    <span className="cms-mobile-label">Category</span>
                    <span style={{ fontWeight: 600, fontSize: '0.85rem' }}>{post.category_name || 'General'}</span>
                  </td>

                  <td className="cms-td-seo" style={{ padding: '0.85rem 1rem' }}>
                    <span className="cms-mobile-label">Optimization</span>
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

                  <td className="cms-td-updated" style={{ padding: '0.85rem 1rem', color: 'var(--color-muted)', fontSize: '0.8rem' }}>
                    <span className="cms-mobile-label">Updated</span>
                    <span>
                      {new Date(post.updated_at || post.created_at).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </span>
                  </td>

                  <td className="cms-td-actions" style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>
                    <div className="cms-actions-group">

                      {post.status === 'pending_review' && (
                        <>
                          <button
                            type="button"
                            disabled={actionLoading === post.post_id}
                            onClick={() => handleApprove(post.post_id, post.title)}
                            title="Approve & Publish"
                            className="cms-btn-approve"
                          >
                            <CheckCircle2 size={13} /> <span>Approve</span>
                          </button>

                          <button
                            type="button"
                            disabled={actionLoading === post.post_id}
                            onClick={() => handleRequestChanges(post.post_id, post.title)}
                            title="Request Revisions"
                            className="cms-btn-changes"
                          >
                            <AlertTriangle size={13} /> <span>Changes</span>
                          </button>

                          <button
                            type="button"
                            disabled={actionLoading === post.post_id}
                            onClick={() => handleReject(post.post_id, post.title)}
                            title="Reject Story"
                            className="cms-btn-reject"
                          >
                            <XCircle size={13} /> <span>Reject</span>
                          </button>
                        </>
                      )}

                      {post.status === 'published' && (
                        <Link
                          to={`/post/${post.slug}`}
                          title="View live article"
                          className="cms-btn-view"
                        >
                          <ExternalLink size={14} /> <span>View Live</span>
                        </Link>
                      )}

                      <Link
                        to={`/admin/posts/${post.post_id}`}
                        title="Edit article"
                        className="cms-btn-edit"
                      >
                        <Edit3 size={14} /> <span>Edit Story</span>
                      </Link>

                      <button
                        type="button"
                        onClick={() => handleDelete(post.post_id, post.title)}
                        title="Delete article"
                        className="cms-btn-delete"
                      >
                        <Trash2 size={14} /> <span>Delete</span>
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

