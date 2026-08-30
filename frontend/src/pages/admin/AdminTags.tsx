import React, { useState, useEffect } from 'react';
import { Tag, Plus, Search, CheckCircle2, AlertCircle, Edit2, Trash2, ExternalLink, X, Check, Hash } from 'lucide-react';
import { LoadingState } from '../../components/common/LoadingState';
import { EmptyState } from '../../components/common/EmptyState';
import { ApiService } from '../../services/api';
import { useConfirm } from '../../context/ConfirmDialogContext';

export const AdminTags: React.FC = () => {
  const confirm = useConfirm();
  const [tags, setTags] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [name, setName] = useState('');
  const [customSlug, setCustomSlug] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Editing state
  const [editingTagId, setEditingTagId] = useState<number | null>(null);
  const [editName, setEditName] = useState('');
  const [editSlug, setEditSlug] = useState('');

  const fetchTags = async () => {
    setLoading(true);
    try {
      const res = await ApiService.getTags();
      if (res && res.data) {
        setTags(res.data);
      }
    } catch (err) {
      console.error('Failed to fetch tags:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTags();
  }, []);

  const handleCreateTag = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setSubmitting(true);
    setMsg(null);

    try {
      const res = await ApiService.createTag({
        name: name.trim(),
        slug: customSlug.trim() || undefined,
      });

      if (res && res.success) {
        setMsg({ text: `Tag '${name}' created successfully!`, type: 'success' });
        setName('');
        setCustomSlug('');
        fetchTags();
      } else {
        setMsg({ text: res?.message || `Tag '${name}' saved.`, type: 'success' });
        setName('');
        setCustomSlug('');
        fetchTags();
      }
    } catch (err: any) {
      setMsg({ text: err.message || 'Failed to create tag', type: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  const startEdit = (tag: any) => {
    setEditingTagId(tag.tag_id || tag.id);
    setEditName(tag.name);
    setEditSlug(tag.slug);
  };

  const cancelEdit = () => {
    setEditingTagId(null);
    setEditName('');
    setEditSlug('');
  };

  const handleUpdateTag = async (id: number) => {
    if (!editName.trim()) return;
    try {
      const res = await ApiService.updateTag(id, {
        name: editName.trim(),
        slug: editSlug.trim() || undefined,
      });
      if (res && res.success) {
        setMsg({ text: `Tag updated to '${editName}'`, type: 'success' });
        cancelEdit();
        fetchTags();
      } else {
        setMsg({ text: res?.message || 'Failed to update tag', type: 'error' });
      }
    } catch (err: any) {
      setMsg({ text: err.message || 'Error updating tag', type: 'error' });
    }
  };

  const handleDeleteTag = async (id: number, tagName: string) => {
    const isConfirmed = await confirm({
      title: 'Delete Tag',
      message: `Are you sure you want to delete the tag '#${tagName}'? Articles with this tag will not be deleted.`,
      confirmText: 'Yes, Delete Tag',
      type: 'danger',
    });

    if (!isConfirmed) return;
    try {
      const res = await ApiService.deleteTag(id);
      if (res && res.success) {
        setMsg({ text: `Tag '${tagName}' deleted`, type: 'success' });
        fetchTags();
      } else {
        setMsg({ text: res?.message || 'Failed to delete tag', type: 'error' });
      }
    } catch (err: any) {
      setMsg({ text: err.message || 'Error deleting tag', type: 'error' });
    }
  };

  const filteredTags = tags.filter(t =>
    t.name?.toLowerCase().includes(search.toLowerCase()) ||
    t.slug?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: '0.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontFamily: 'var(--font-heading)' }}>
          <Tag size={22} color="var(--color-secondary)" /> Tag Taxonomy Management
        </h1>
        <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
          Manage topic tags, keywords, and URLs used across all published stories
        </p>
      </div>

      {msg && (
        <div
          style={{
            padding: '0.85rem 1.15rem',
            backgroundColor: msg.type === 'success' ? 'rgba(16, 185, 129, 0.12)' : 'rgba(239, 68, 68, 0.12)',
            border: `1px solid ${msg.type === 'success' ? 'var(--color-success)' : 'var(--color-danger)'}`,
            borderRadius: 'var(--radius-md)',
            color: msg.type === 'success' ? 'var(--color-success)' : 'var(--color-danger)',
            marginBottom: '1.25rem',
            fontSize: '0.875rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          {msg.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          {msg.text}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(290px, 1fr))', gap: '1.5rem', alignItems: 'start' }}>
        {/* Add Tag Form */}
        <div
          style={{
            backgroundColor: 'var(--color-card)',
            padding: '1.5rem',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--color-border)',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Plus size={16} color="var(--color-secondary)" /> Add New Keyword Tag
          </h3>

          <form onSubmit={handleCreateTag} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label htmlFor="tag-name" style={{ display: 'block', fontWeight: 600, marginBottom: '0.35rem', fontSize: '0.85rem' }}>
                Tag Name *
              </label>
              <input
                id="tag-name"
                type="text"
                value={name}
                onChange={e => {
                  setName(e.target.value);
                  if (!customSlug) {
                    setCustomSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''));
                  }
                }}
                placeholder="e.g. Artificial Intelligence, React, Cloud"
                required
                style={{ width: '100%', padding: '0.65rem 0.85rem', fontSize: '0.88rem' }}
              />
            </div>

            <div>
              <label htmlFor="tag-slug" style={{ display: 'block', fontWeight: 600, marginBottom: '0.35rem', fontSize: '0.85rem' }}>
                URL Slug (Optional)
              </label>
              <input
                id="tag-slug"
                type="text"
                value={customSlug}
                onChange={e => setCustomSlug(e.target.value)}
                placeholder="e.g. artificial-intelligence"
                style={{ width: '100%', padding: '0.65rem 0.85rem', fontSize: '0.88rem' }}
              />
              <span style={{ fontSize: '0.75rem', color: 'var(--color-muted)', marginTop: '0.25rem', display: 'block' }}>
                Accessible at: <code>/tag/{customSlug || 'tag-name'}</code>
              </span>
            </div>

            <button
              type="submit"
              disabled={submitting}
              style={{
                backgroundColor: 'var(--color-secondary)',
                color: '#FFFFFF',
                padding: '0.65rem 1.25rem',
                fontSize: '0.88rem',
                fontWeight: 700,
                borderRadius: 'var(--radius-md)',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.4rem',
                cursor: submitting ? 'not-allowed' : 'pointer',
                border: 'none',
              }}
            >
              <Plus size={16} /> {submitting ? 'Creating...' : 'Create Keyword Tag'}
            </button>
          </form>
        </div>

        {/* Tags List Table */}
        <div
          style={{
            backgroundColor: 'var(--color-card)',
            padding: '1.5rem',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--color-border)',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>Existing Tags ({tags.length})</h3>
              <span style={{ fontSize: '0.78rem', color: 'var(--color-muted)' }}>Click edit or view to manage individual keywords</span>
            </div>

            <div style={{ position: 'relative', width: '100%', maxWidth: '240px' }}>
              <Search size={15} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-muted)' }} />
              <input
                type="search"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search tags..."
                style={{ width: '100%', padding: '0.45rem 0.65rem 0.45rem 2rem', fontSize: '0.82rem', boxSizing: 'border-box', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}
              />
            </div>
          </div>

          {loading ? (
            <LoadingState message="Fetching taxonomy tags..." />
          ) : filteredTags.length === 0 ? (
            <EmptyState title="No Tags Found" description="No taxonomy tags match your search or exist in the database." />
          ) : (
            <div className="cms-table-wrapper">
              <table className="cms-responsive-table">
                <thead>
                  <tr style={{ backgroundColor: 'var(--color-surface-alt)', borderBottom: '1px solid var(--color-border)', color: 'var(--color-text-secondary)', fontWeight: 700 }}>
                    <th style={{ padding: '0.65rem 0.85rem' }}>Tag Name</th>
                    <th style={{ padding: '0.65rem 0.85rem' }}>Slug</th>
                    <th style={{ padding: '0.65rem 0.85rem', textAlign: 'center' }}>Stories</th>
                    <th style={{ padding: '0.65rem 0.85rem', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTags.map(tag => {
                    const id = tag.tag_id || tag.id;
                    const isEditing = editingTagId === id;

                    return (
                      <tr key={id} className="cms-table-row">
                        <td className="cms-td-title" style={{ padding: '0.75rem 0.85rem', fontWeight: 600 }}>
                          {isEditing ? (
                            <input
                              type="text"
                              value={editName}
                              onChange={e => setEditName(e.target.value)}
                              style={{ padding: '0.45rem 0.6rem', fontSize: '0.85rem', width: '100%', boxSizing: 'border-box' }}
                            />
                          ) : (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', flexWrap: 'wrap' }}>
                              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', color: 'var(--color-text)', fontSize: '0.94rem', fontWeight: 700 }}>
                                <Hash size={15} color="var(--color-secondary)" />
                                {tag.name}
                              </span>
                              <span
                                style={{
                                  backgroundColor: 'rgba(99, 102, 241, 0.12)',
                                  padding: '0.15rem 0.5rem',
                                  borderRadius: 'var(--radius-full)',
                                  fontSize: '0.75rem',
                                  fontWeight: 700,
                                  color: 'var(--color-secondary)',
                                }}
                              >
                                {tag.post_count || 0} stories
                              </span>
                            </div>
                          )}
                        </td>

                        <td className="cms-td-category" style={{ padding: '0.75rem 0.85rem', color: 'var(--color-text-secondary)' }}>
                          <span className="cms-mobile-label">Slug</span>
                          {isEditing ? (
                            <input
                              type="text"
                              value={editSlug}
                              onChange={e => setEditSlug(e.target.value)}
                              style={{ padding: '0.45rem 0.6rem', fontSize: '0.85rem', width: '100%', boxSizing: 'border-box' }}
                            />
                          ) : (
                            <a
                              href={`/tag/${tag.slug}`}
                              target="_blank"
                              rel="noreferrer"
                              style={{ color: 'var(--color-secondary)', display: 'inline-flex', alignItems: 'center', gap: '0.25rem', textDecoration: 'none', fontSize: '0.82rem', fontWeight: 600 }}
                            >
                              /tag/{tag.slug} <ExternalLink size={12} />
                            </a>
                          )}
                        </td>

                        <td className="cms-td-updated" style={{ padding: '0.75rem 0.85rem', textAlign: 'center' }}>
                          <span className="cms-mobile-label">Articles</span>
                          <span
                            style={{
                              backgroundColor: 'var(--color-surface-alt)',
                              padding: '0.15rem 0.55rem',
                              borderRadius: 'var(--radius-full)',
                              fontSize: '0.78rem',
                              fontWeight: 700,
                              color: 'var(--color-secondary)',
                            }}
                          >
                            {tag.post_count || 0}
                          </span>
                        </td>

                        <td className="cms-td-actions" style={{ padding: '0.75rem 0.85rem', textAlign: 'right' }}>
                          {isEditing ? (
                            <div className="cms-actions-group">
                              <button
                                type="button"
                                onClick={() => handleUpdateTag(id)}
                                title="Save changes"
                                className="cms-btn-approve"
                              >
                                <Check size={14} /> <span>Save</span>
                              </button>
                              <button
                                type="button"
                                onClick={cancelEdit}
                                title="Cancel"
                                className="cms-btn-delete"
                              >
                                <X size={14} /> <span>Cancel</span>
                              </button>
                            </div>
                          ) : (
                            <div className="cms-actions-group">
                              <a
                                href={`/tag/${tag.slug}`}
                                target="_blank"
                                rel="noreferrer"
                                title="View public tag page"
                                className="cms-btn-view"
                              >
                                <ExternalLink size={14} /> <span>View Tag</span>
                              </a>
                              <button
                                type="button"
                                onClick={() => startEdit(tag)}
                                title="Edit tag"
                                className="cms-btn-edit"
                              >
                                <Edit2 size={14} /> <span>Edit</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteTag(id, tag.name)}
                                title="Delete tag"
                                className="cms-btn-delete"
                              >
                                <Trash2 size={14} /> <span>Delete</span>
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

