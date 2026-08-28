import React, { useState, useEffect } from 'react';
import {
  PlusCircle,
  Edit3,
  Trash2,
  FolderTree,
  Search,
  CheckCircle2,
  AlertCircle,
  Image as ImageIcon,
  Layers,
  ArrowUpRight,
} from 'lucide-react';
import { LoadingState } from '../../components/common/LoadingState';
import { EmptyState } from '../../components/common/EmptyState';
import { generateSlug } from '../../utils/slug';
import { ApiService } from '../../services/api';
import { ImageUploadDropzone } from '../../components/common/ImageUploadDropzone';
import { useConfirm } from '../../context/ConfirmDialogContext';

export const AdminCategories: React.FC = () => {
  const confirm = useConfirm();
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Form State
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [parentCategoryId, setParentCategoryId] = useState<string>('');
  const [image, setImage] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await ApiService.getCategories();
      if (res && res.data) {
        setCategories(res.data);
      }
    } catch (err) {
      console.error('Failed to fetch categories:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setName(val);
    if (!isEditing) {
      setSlug(generateSlug(val));
    }
  };

  const handleEdit = (cat: any) => {
    setIsEditing(true);
    setEditId(cat.category_id);
    setName(cat.name);
    setSlug(cat.slug);
    setDescription(cat.description || '');
    setParentCategoryId(cat.parent_category_id || cat.parent_id ? String(cat.parent_category_id || cat.parent_id) : '');
    setImage(cat.image || cat.image_url || '');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditId(null);
    setName('');
    setSlug('');
    setDescription('');
    setParentCategoryId('');
    setImage('');
    setMsg(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setSubmitting(true);
    setMsg(null);

    try {
      const payload = {
        name: name.trim(),
        slug: slug.trim() || generateSlug(name),
        description: description.trim() || undefined,
        parentCategoryId: parentCategoryId ? parseInt(parentCategoryId) : undefined,
        image: image.trim() || undefined,
      };

      if (isEditing && editId) {
        await ApiService.updateCategory(editId, payload);
        setMsg({ type: 'success', text: `Category '${name}' updated successfully with image & hierarchy!` });
      } else {
        await ApiService.createCategory(payload);
        setMsg({ type: 'success', text: `Category '${name}' created successfully with image!` });
      }

      handleCancel();
      fetchCategories();
    } catch (err: any) {
      setMsg({ type: 'error', text: err.message || 'Operation failed' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number, catName: string) => {
    const isConfirmed = await confirm({
      title: 'Delete Category',
      message: `Are you sure you want to delete category '${catName}'?\n\nNote: Published articles under this category will NOT be deleted; they will be safely preserved.`,
      confirmText: 'Yes, Delete Category',
      type: 'danger',
    });

    if (isConfirmed) {
      try {
        await ApiService.deleteCategory(id);
        setMsg({ type: 'success', text: `Category '${catName}' removed. Articles safely preserved.` });
        fetchCategories();
      } catch (err: any) {
        alert(err.message || 'Failed to delete category');
      }
    }
  };

  const filteredCategories = categories.filter(cat =>
    cat.name.toLowerCase().includes(search.toLowerCase()) || cat.slug.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.6rem', marginBottom: '0.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <FolderTree size={24} color="var(--color-secondary)" /> Category & Taxonomy Manager
          </h1>
          <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', margin: 0 }}>
            Organize articles into hierarchical parent/subcategories with custom banners, cover images, and SEO slugs
          </p>
        </div>
      </div>

      {msg && (
        <div style={{ padding: '0.85rem 1rem', backgroundColor: msg.type === 'success' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)', border: `1px solid ${msg.type === 'success' ? 'var(--color-success)' : 'var(--color-danger)'}`, borderRadius: 'var(--radius-md)', color: msg.type === 'success' ? 'var(--color-success)' : 'var(--color-danger)', marginBottom: '1.25rem', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {msg.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />} {msg.text}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem' }}>
        {/* Create / Edit Category Form */}
        <div style={{ backgroundColor: 'var(--color-card)', padding: '1.5rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)' }}>
          <h3 style={{ fontSize: '1.1rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700 }}>
            <Layers size={18} color="var(--color-secondary)" /> {isEditing ? `Edit Category #${editId}: ${name}` : 'Add New Category'}
          </h3>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem' }}>
              <div>
                <label htmlFor="cat-name" style={{ display: 'block', fontWeight: 600, marginBottom: '0.3rem', fontSize: '0.85rem' }}>
                  Category Name *
                </label>
                <input
                  id="cat-name"
                  type="text"
                  value={name}
                  onChange={handleNameChange}
                  placeholder="e.g. Artificial Intelligence"
                  required
                  style={{ width: '100%', padding: '0.6rem 0.85rem', fontSize: '0.875rem' }}
                />
              </div>

              <div>
                <label htmlFor="cat-slug" style={{ display: 'block', fontWeight: 600, marginBottom: '0.3rem', fontSize: '0.85rem' }}>
                  URL Slug *
                </label>
                <input
                  id="cat-slug"
                  type="text"
                  value={slug}
                  onChange={e => setSlug(generateSlug(e.target.value))}
                  placeholder="artificial-intelligence"
                  style={{ width: '100%', padding: '0.6rem 0.85rem', fontSize: '0.875rem' }}
                />
              </div>

              <div>
                <label htmlFor="parent-cat" style={{ display: 'block', fontWeight: 600, marginBottom: '0.3rem', fontSize: '0.85rem' }}>
                  Parent Category (Hierarchy)
                </label>
                <select
                  id="parent-cat"
                  value={parentCategoryId}
                  onChange={e => setParentCategoryId(e.target.value)}
                  style={{ width: '100%', padding: '0.6rem 0.85rem', fontSize: '0.875rem' }}
                >
                  <option value="">None (Top-Level Category)</option>
                  {categories.filter(c => !editId || c.category_id !== editId).map(c => (
                    <option key={c.category_id} value={c.category_id}>
                      {c.name} {c.parent_category_name ? `(Under ${c.parent_category_name})` : ''}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="cat-desc" style={{ display: 'block', fontWeight: 600, marginBottom: '0.3rem', fontSize: '0.85rem' }}>
                Category Description / Lead Summary
              </label>
              <textarea
                id="cat-desc"
                rows={2}
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Curated editorial reporting, research breakthroughs, and deep-dives in this domain..."
                style={{ width: '100%', padding: '0.6rem 0.85rem', fontSize: '0.875rem' }}
              />
            </div>

            {/* Category Cover Image & Banner Upload */}
            <div>
              <label style={{ display: 'block', fontWeight: 700, marginBottom: '0.4rem', fontSize: '0.88rem' }}>
                Category Banner / Cover Image
              </label>
              <ImageUploadDropzone
                value={image}
                onChange={url => setImage(url)}
                label="Upload Category Cover Banner"
                helperText="Upload JPG, PNG, WEBP (Max 5 MB). Displayed on Category Header, Archive & Cards."
              />
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', paddingTop: '0.5rem' }}>
              {isEditing && (
                <button
                  type="button"
                  onClick={handleCancel}
                  style={{
                    backgroundColor: 'var(--color-surface-alt)',
                    color: 'var(--color-text)',
                    padding: '0.6rem 1.25rem',
                    fontSize: '0.88rem',
                    fontWeight: 600,
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--color-border)',
                    cursor: 'pointer',
                  }}
                >
                  Cancel Edit
                </button>
              )}
              <button
                type="submit"
                disabled={submitting}
                style={{
                  backgroundColor: 'var(--color-secondary)',
                  color: '#FFF',
                  padding: '0.6rem 1.5rem',
                  fontSize: '0.88rem',
                  fontWeight: 700,
                  borderRadius: 'var(--radius-md)',
                  border: 'none',
                  cursor: 'pointer',
                  boxShadow: '0 2px 8px var(--color-secondary-glow)',
                }}
              >
                {isEditing ? 'Save Category Changes' : 'Create Category'}
              </button>
            </div>
          </form>
        </div>

        {/* Categories Database Table */}
        <div style={{ backgroundColor: 'var(--color-card)', padding: '1.5rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>
              Publication Categories ({categories.length})
            </h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Search size={16} color="var(--color-muted)" />
              <input
                type="search"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search categories..."
                style={{ padding: '0.4rem 0.75rem', fontSize: '0.85rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}
              />
            </div>
          </div>

          {loading ? (
            <LoadingState message="Fetching publication categories..." />
          ) : filteredCategories.length === 0 ? (
            <EmptyState title="No Categories Found" description="No categories match your search criteria." />
          ) : (
            <div className="table-responsive">
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
                <thead>
                  <tr style={{ backgroundColor: 'var(--color-surface-alt)', borderBottom: '1px solid var(--color-border)', color: 'var(--color-text-secondary)', fontWeight: 700 }}>
                    <th style={{ padding: '0.75rem 1rem', width: '70px' }}>Cover</th>
                    <th style={{ padding: '0.75rem 1rem' }}>Category Name</th>
                    <th style={{ padding: '0.75rem 1rem' }}>URL Slug</th>
                    <th style={{ padding: '0.75rem 1rem' }}>Hierarchy</th>
                    <th style={{ padding: '0.75rem 1rem' }}>Articles</th>
                    <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCategories.map(cat => {
                    const catImage = cat.image || cat.image_url;
                    return (
                      <tr key={cat.category_id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                        <td style={{ padding: '0.75rem 1rem' }}>
                          {catImage ? (
                            <img
                              src={catImage}
                              alt={`${cat.name} Category Cover`}
                              style={{ width: '48px', height: '36px', objectFit: 'cover', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)' }}
                              onError={(e: any) => {
                                e.currentTarget.style.display = 'none';
                              }}
                            />
                          ) : (
                            <div style={{ width: '48px', height: '36px', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--color-surface-alt)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-muted)' }}>
                              <ImageIcon size={18} />
                            </div>
                          )}
                        </td>
                        <td style={{ padding: '0.75rem 1rem', fontWeight: 600 }}>
                          <span style={{ color: 'var(--color-text)' }}>{cat.name}</span>
                          {cat.description && (
                            <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--color-muted)', maxWidth: '280px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {cat.description}
                            </span>
                          )}
                        </td>
                        <td style={{ padding: '0.75rem 1rem', color: 'var(--color-text-secondary)', fontFamily: 'monospace', fontSize: '0.8rem' }}>
                          <a href={`/category/${cat.slug}`} target="_blank" rel="noreferrer" style={{ color: 'var(--color-secondary)', display: 'inline-flex', alignItems: 'center', gap: '0.2rem', textDecoration: 'none' }}>
                            /category/{cat.slug} <ArrowUpRight size={11} />
                          </a>
                        </td>
                        <td style={{ padding: '0.75rem 1rem', color: 'var(--color-text-secondary)' }}>
                          {cat.parent_category_name ? (
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.8rem', padding: '0.2rem 0.5rem', backgroundColor: 'var(--color-surface-alt)', borderRadius: 'var(--radius-sm)' }}>
                              ↳ {cat.parent_category_name}
                            </span>
                          ) : (
                            <span style={{ fontSize: '0.75rem', color: 'var(--color-muted)', fontWeight: 600 }}>Top-Level</span>
                          )}
                        </td>
                        <td style={{ padding: '0.75rem 1rem' }}>
                          <span style={{ padding: '0.2rem 0.5rem', backgroundColor: 'var(--color-surface-alt)', borderRadius: 'var(--radius-full)', fontSize: '0.78rem', fontWeight: 700 }}>
                            {cat.post_count || 0}
                          </span>
                        </td>
                        <td style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.4rem' }}>
                            <button
                              onClick={() => handleEdit(cat)}
                              title="Edit Category & Image"
                              style={{ padding: '0.35rem', background: 'transparent', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', color: 'var(--color-secondary)', cursor: 'pointer' }}
                            >
                              <Edit3 size={15} />
                            </button>
                            <button
                              onClick={() => handleDelete(cat.category_id, cat.name)}
                              title="Delete Category"
                              style={{ padding: '0.35rem', background: 'transparent', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', color: 'var(--color-danger)', cursor: 'pointer' }}
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
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
