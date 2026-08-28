import React, { useState, useEffect } from 'react';
import {
  Image as ImageIcon,
  Search,
  Trash2,
  Edit3,
  CheckCircle2,
  Copy,
  Check,
  Calendar,
  HardDrive,
  FileCode,
  X,
  Save,
} from 'lucide-react';
import { ImageUploadDropzone } from '../../components/common/ImageUploadDropzone';
import { LoadingState } from '../../components/common/LoadingState';
import { EmptyState } from '../../components/common/EmptyState';
import { useConfirm } from '../../context/ConfirmDialogContext';

export const AdminMedia: React.FC = () => {
  const confirm = useConfirm();
  const [mediaList, setMediaList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [uploadedUrl, setUploadedUrl] = useState('');
  const [msg, setMsg] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<number | null>(null);

  // Edit Alt Text Modal State
  const [editingItem, setEditingItem] = useState<any | null>(null);
  const [newAltText, setNewAltText] = useState('');
  const [updatingAlt, setUpdatingAlt] = useState(false);

  const fetchMedia = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('bitblog_token');
      const res = await fetch(`/api/media${search ? `?search=${encodeURIComponent(search)}` : ''}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      }).then(r => r.json());

      if (res && res.data) {
        setMediaList(res.data);
      }
    } catch (err) {
      console.error('Failed to fetch media library:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMedia();
  }, [search]);

  const handleUploadComplete = (url: string) => {
    setUploadedUrl(url);
    fetchMedia();
    setMsg('Image asset uploaded to media library successfully!');
    setTimeout(() => {
      setMsg(null);
      setUploadedUrl('');
    }, 3000);
  };

  const handleDelete = async (id: number, name: string) => {
    const isConfirmed = await confirm({
      title: 'Permanently Delete Media Asset',
      message: `Are you sure you want to permanently delete media asset '${name}'?\n\n⚠️ Global Cleanup: This will permanently delete the file from the server and automatically remove it from any articles, author profiles, category banners, and site settings where it is currently used.`,
      confirmText: 'Yes, Delete Media',
      type: 'danger',
    });

    if (isConfirmed) {
      try {
        const token = localStorage.getItem('bitblog_token');
        const res = await fetch(`/api/media/${id}`, {
          method: 'DELETE',
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        }).then(r => r.json());

        if (res && res.success !== false) {
          const aff = res.data;
          let details = `Media '${name}' permanently deleted from server.`;
          if (aff && (aff.posts > 0 || aff.users > 0 || aff.categories > 0 || aff.settings)) {
            details += ` Automatically cleaned up from ${aff.posts} articles, ${aff.users} user profiles, and ${aff.categories} categories.`;
          }
          setMsg(details);
        } else {
          setMsg(`Asset '${name}' deleted.`);
        }
        setTimeout(() => setMsg(null), 4500);
        fetchMedia();
      } catch (err: any) {
        alert(err.message || 'Failed to delete media asset');
      }
    }
  };

  const handleCopyUrl = (id: number, url: string) => {
    const fullUrl = url.startsWith('http') ? url : `${window.location.origin}${url}`;
    navigator.clipboard.writeText(fullUrl);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleOpenEditAlt = (item: any) => {
    setEditingItem(item);
    setNewAltText(item.alt_text || item.file_name || '');
  };

  const handleSaveAltText = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;
    setUpdatingAlt(true);

    try {
      const token = localStorage.getItem('bitblog_token');
      await fetch(`/api/media/${editingItem.media_id || editingItem.id}/alt`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ altText: newAltText.trim() }),
      });
      setMsg('Media alt text updated successfully!');
      setTimeout(() => setMsg(null), 3000);
      setEditingItem(null);
      fetchMedia();
    } catch (err: any) {
      alert(err.message || 'Failed to update alt text');
    } finally {
      setUpdatingAlt(false);
    }
  };

  const formatFileSize = (bytes?: number): string => {
    if (!bytes || bytes === 0) return 'N/A';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  return (
    <div>
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.6rem', marginBottom: '0.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <ImageIcon size={22} color="var(--color-secondary)" /> Media Asset Library
        </h1>
        <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
          Direct file upload, metadata management, and publication image asset repository
        </p>
      </div>

      {msg && (
        <div
          role="status"
          style={{
            padding: '0.85rem 1rem',
            backgroundColor: 'rgba(16, 185, 129, 0.12)',
            border: '1px solid var(--color-success)',
            borderRadius: 'var(--radius-md)',
            color: 'var(--color-success)',
            marginBottom: '1.25rem',
            fontSize: '0.875rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          <CheckCircle2 size={18} /> {msg}
        </div>
      )}

      {/* Direct File Upload Dropzone */}
      <div
        style={{
          backgroundColor: 'var(--color-card)',
          padding: '1.5rem',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--color-border)',
          marginBottom: '2rem',
        }}
      >
        <h3 style={{ fontSize: '1.05rem', marginBottom: '1rem', fontWeight: 700 }}>
          Upload New Image Asset File
        </h3>
        <ImageUploadDropzone
          value={uploadedUrl}
          onChange={handleUploadComplete}
          label="Select Image File (JPG, PNG, WEBP, GIF up to 5MB)"
        />
      </div>

      {/* Filter Bar & Media Assets Grid */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1.25rem',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <h3 style={{ fontSize: '1.1rem' }}>
          Uploaded Assets ({mediaList.length})
        </h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', width: '100%', maxWidth: '300px' }}>
          <Search size={16} color="var(--color-muted)" />
          <input
            type="search"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search assets by name or alt..."
            style={{ width: '100%', padding: '0.4rem 0.75rem', fontSize: '0.85rem' }}
          />
        </div>
      </div>

      {loading ? (
        <LoadingState message="Fetching media assets library from server..." />
      ) : mediaList.length === 0 ? (
        <EmptyState
          title="No Media Assets Found"
          description={search ? `No image assets match search query '${search}'.` : 'No image files uploaded to media library yet. Use the dropzone above to upload your first image.'}
        />
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
            gap: '1.25rem',
          }}
        >
          {mediaList.map(item => {
            const id = item.media_id || item.id;
            const src = item.file_path || item.url;
            const name = item.file_name || item.alt_text || `Asset #${id}`;
            const alt = item.alt_text || item.file_name || 'Uploaded Image';
            const size = formatFileSize(item.file_size);
            const mime = item.file_type || 'image';
            const dateStr = item.created_at ? new Date(item.created_at).toLocaleDateString() : 'Recent';

            return (
              <article
                key={id}
                style={{
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--color-border)',
                  backgroundColor: 'var(--color-card)',
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                {/* Image Preview Container */}
                <div
                  style={{
                    height: '160px',
                    backgroundColor: 'var(--color-surface-alt)',
                    position: 'relative',
                    overflow: 'hidden',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <img
                    src={src}
                    alt={alt}
                    loading="lazy"
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                    }}
                  />
                </div>

                {/* Metadata & Controls */}
                <div style={{ padding: '0.85rem', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <h4
                      style={{
                        fontSize: '0.85rem',
                        fontWeight: 700,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        marginBottom: '0.35rem',
                      }}
                      title={name}
                    >
                      {name}
                    </h4>

                    {alt && alt !== name && (
                      <p style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', marginBottom: '0.5rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={`Alt: ${alt}`}>
                        Alt: {alt}
                      </p>
                    )}

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.72rem', color: 'var(--color-muted)', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.2rem' }}><FileCode size={11} /> {mime.replace('image/', '').toUpperCase()}</span>
                      <span>•</span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.2rem' }}><HardDrive size={11} /> {size}</span>
                      <span>•</span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.2rem' }}><Calendar size={11} /> {dateStr}</span>
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      borderTop: '1px solid var(--color-border)',
                      paddingTop: '0.5rem',
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => handleCopyUrl(id, src)}
                      title="Copy URL"
                      style={{
                        padding: '0.3rem 0.55rem',
                        fontSize: '0.75rem',
                        backgroundColor: 'var(--color-surface-alt)',
                        color: copiedId === id ? 'var(--color-success)' : 'var(--color-text)',
                        borderRadius: 'var(--radius-sm)',
                      }}
                    >
                      {copiedId === id ? <Check size={13} /> : <Copy size={13} />}
                      {copiedId === id ? 'Copied' : 'Copy URL'}
                    </button>

                    <div style={{ display: 'flex', gap: '0.25rem' }}>
                      <button
                        type="button"
                        onClick={() => handleOpenEditAlt(item)}
                        title="Edit Alt Text"
                        style={{ padding: '0.3rem', background: 'transparent', color: 'var(--color-secondary)' }}
                      >
                        <Edit3 size={15} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(id, name)}
                        title="Delete Asset"
                        style={{ padding: '0.3rem', background: 'transparent', color: 'var(--color-danger)' }}
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* Edit Alt Text Modal */}
      {editingItem && (
        <div
          role="dialog"
          aria-modal="true"
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'var(--color-overlay)',
            zIndex: 300,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
            backdropFilter: 'blur(4px)',
          }}
        >
          <div
            style={{
              width: '100%',
              maxWidth: '450px',
              backgroundColor: 'var(--color-surface)',
              borderRadius: 'var(--radius-lg)',
              padding: '1.5rem',
              boxShadow: 'var(--shadow-xl)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '1.1rem', margin: 0 }}>Edit Image Alt Text</h3>
              <button onClick={() => setEditingItem(null)} style={{ background: 'transparent', padding: '0.2rem' }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveAltText}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                  Alt Text Description *
                </label>
                <input
                  type="text"
                  value={newAltText}
                  onChange={e => setNewAltText(e.target.value)}
                  placeholder="Describe image for SEO and screen readers..."
                  required
                  style={{ width: '100%', padding: '0.55rem 0.75rem', fontSize: '0.9rem' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setEditingItem(null)}
                  style={{ backgroundColor: 'var(--color-surface-alt)', color: 'var(--color-text)', padding: '0.45rem 1rem', fontSize: '0.85rem' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updatingAlt}
                  style={{ backgroundColor: 'var(--color-secondary)', color: '#FFF', padding: '0.45rem 1.25rem', fontSize: '0.85rem', fontWeight: 700 }}
                >
                  <Save size={14} /> {updatingAlt ? 'Saving...' : 'Save Alt Text'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
