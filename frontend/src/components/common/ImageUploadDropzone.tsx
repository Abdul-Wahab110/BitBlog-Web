import React, { useState, useRef } from 'react';
import { Upload, Link as LinkIcon, Sparkles, Trash2, RefreshCw, AlertCircle, CheckCircle2, Loader2, Image as ImageIcon } from 'lucide-react';

interface ImageUploadDropzoneProps {
  value?: string;
  onChange: (url: string) => void;
  label?: string;
  helperText?: string;
}

const PRESET_COVERS = [
  {
    name: 'Tech & AI',
    url: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80',
  },
  {
    name: 'Fashion & Style',
    url: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1200&q=80',
  },
  {
    name: 'Modern Web & Code',
    url: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1200&q=80',
  },
  {
    name: 'Business & Startup',
    url: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80',
  },
  {
    name: 'Design & Workspace',
    url: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=1200&q=80',
  },
  {
    name: 'Nature & Landscape',
    url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80',
  },
];

export const ImageUploadDropzone: React.FC<ImageUploadDropzoneProps> = ({
  value,
  onChange,
  label = 'Featured Cover Image',
  helperText = 'Supports JPG, PNG, WEBP, and GIF (Max 5 MB)',
}) => {
  const [activeTab, setActiveTab] = useState<'upload' | 'url' | 'presets'>('upload');
  const [urlInput, setUrlInput] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFile = async (file: File) => {
    setErrorMsg(null);
    setSuccessMsg(null);
    setFileName(file.name);

    const maxSizeBytes = 5 * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      setErrorMsg(`File size (${(file.size / (1024 * 1024)).toFixed(1)} MB) exceeds the maximum limit of 5 MB.`);
      return;
    }

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    const allowedExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];
    const ext = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();

    if (!allowedTypes.includes(file.type) && !allowedExtensions.includes(ext)) {
      setErrorMsg('Invalid file format. Only JPG, PNG, WEBP, and GIF images are supported.');
      return;
    }

    setUploading(true);
    setUploadProgress(30);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('altText', file.name.replace(/\.[^/.]+$/, ''));

      const token = localStorage.getItem('modernblog_token');
      const res = await fetch('/api/media/upload', {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
      }).then(r => r.json());

      setUploadProgress(100);

      if (res && res.success && res.data && res.data.url) {
        onChange(res.data.url);
        setSuccessMsg(`Image '${file.name}' uploaded successfully!`);
        setTimeout(() => setSuccessMsg(null), 3000);
      } else {
        throw new Error(res.message || 'File upload failed');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Error uploading image to server');
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleApplyUrl = (e: React.FormEvent) => {
    e.preventDefault();
    if (!urlInput.trim()) {
      setErrorMsg('Please enter a valid image web URL');
      return;
    }
    setErrorMsg(null);
    onChange(urlInput.trim());
    setSuccessMsg('Cover image URL applied!');
    setTimeout(() => setSuccessMsg(null), 3000);
  };

  return (
    <div style={{ width: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem' }}>
        <label style={{ fontWeight: 700, fontSize: '0.875rem' }}>
          {label}
        </label>

        {/* Mode Tabs */}
        {!value && (
          <div style={{ display: 'flex', gap: '0.3rem', backgroundColor: 'var(--color-surface-alt)', padding: '2px', borderRadius: 'var(--radius-sm)' }}>
            <button
              type="button"
              onClick={() => setActiveTab('upload')}
              style={{
                border: 'none',
                backgroundColor: activeTab === 'upload' ? 'var(--color-surface)' : 'transparent',
                color: activeTab === 'upload' ? 'var(--color-secondary)' : 'var(--color-text-secondary)',
                fontWeight: activeTab === 'upload' ? 700 : 500,
                padding: '0.2rem 0.55rem',
                fontSize: '0.75rem',
                borderRadius: 'var(--radius-sm)',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.25rem',
              }}
            >
              <Upload size={12} /> Upload
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('url')}
              style={{
                border: 'none',
                backgroundColor: activeTab === 'url' ? 'var(--color-surface)' : 'transparent',
                color: activeTab === 'url' ? 'var(--color-secondary)' : 'var(--color-text-secondary)',
                fontWeight: activeTab === 'url' ? 700 : 500,
                padding: '0.2rem 0.55rem',
                fontSize: '0.75rem',
                borderRadius: 'var(--radius-sm)',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.25rem',
              }}
            >
              <LinkIcon size={12} /> Image URL
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('presets')}
              style={{
                border: 'none',
                backgroundColor: activeTab === 'presets' ? 'var(--color-surface)' : 'transparent',
                color: activeTab === 'presets' ? 'var(--color-secondary)' : 'var(--color-text-secondary)',
                fontWeight: activeTab === 'presets' ? 700 : 500,
                padding: '0.2rem 0.55rem',
                fontSize: '0.75rem',
                borderRadius: 'var(--radius-sm)',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.25rem',
              }}
            >
              <Sparkles size={12} /> Presets
            </button>
          </div>
        )}
      </div>

      {errorMsg && (
        <div
          role="alert"
          style={{
            padding: '0.6rem 0.85rem',
            backgroundColor: 'rgba(239, 68, 68, 0.12)',
            border: '1px solid var(--color-danger)',
            borderRadius: 'var(--radius-sm)',
            color: 'var(--color-danger)',
            marginBottom: '0.75rem',
            fontSize: '0.8rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
          }}
        >
          <AlertCircle size={15} style={{ flexShrink: 0 }} />
          <span>{errorMsg}</span>
        </div>
      )}

      {successMsg && (
        <div
          role="status"
          style={{
            padding: '0.6rem 0.85rem',
            backgroundColor: 'rgba(16, 185, 129, 0.12)',
            border: '1px solid var(--color-success)',
            borderRadius: 'var(--radius-sm)',
            color: 'var(--color-success)',
            marginBottom: '0.75rem',
            fontSize: '0.8rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
          }}
        >
          <CheckCircle2 size={15} style={{ flexShrink: 0 }} />
          <span>{successMsg}</span>
        </div>
      )}

      {value ? (
        /* Image Preview & Controls */
        <div
          style={{
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-md)',
            overflow: 'hidden',
            backgroundColor: 'var(--color-surface)',
            padding: '0.75rem',
          }}
        >
          <div style={{ position: 'relative', marginBottom: '0.75rem', overflow: 'hidden', borderRadius: 'var(--radius-sm)', maxHeight: '200px' }}>
            <img
              src={value}
              alt="Uploaded Preview"
              style={{
                width: '100%',
                maxHeight: '200px',
                objectFit: 'cover',
                borderRadius: 'var(--radius-sm)',
              }}
            />
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={() => {
                onChange('');
                setFileName(null);
              }}
              style={{
                backgroundColor: 'rgba(239, 68, 68, 0.12)',
                color: 'var(--color-danger)',
                border: 'none',
                padding: '0.4rem 0.85rem',
                fontSize: '0.8rem',
                borderRadius: 'var(--radius-sm)',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.3rem',
              }}
            >
              <Trash2 size={13} /> Remove Cover Image
            </button>
          </div>
        </div>
      ) : activeTab === 'url' ? (
        /* Image URL Input Form */
        <div
          style={{
            border: '1px solid var(--color-border)',
            backgroundColor: 'var(--color-surface)',
            borderRadius: 'var(--radius-md)',
            padding: '1.25rem',
          }}
        >
          <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', marginBottom: '0.75rem' }}>
            Paste any direct image URL (e.g. Unsplash, Cloudinary, CDN) to use as featured card cover:
          </p>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <input
              type="url"
              value={urlInput}
              onChange={e => setUrlInput(e.target.value)}
              placeholder="https://images.unsplash.com/photo-..."
              style={{ flex: 1, padding: '0.55rem 0.85rem', fontSize: '0.88rem' }}
            />
            <button
              type="button"
              onClick={handleApplyUrl}
              style={{
                backgroundColor: 'var(--color-secondary)',
                color: '#FFFFFF',
                border: 'none',
                padding: '0.55rem 1rem',
                borderRadius: 'var(--radius-sm)',
                fontWeight: 700,
                fontSize: '0.85rem',
                cursor: 'pointer',
              }}
            >
              Apply
            </button>
          </div>
        </div>
      ) : activeTab === 'presets' ? (
        /* Curated Presets Grid */
        <div
          style={{
            border: '1px solid var(--color-border)',
            backgroundColor: 'var(--color-surface)',
            borderRadius: 'var(--radius-md)',
            padding: '1rem',
          }}
        >
          <p style={{ fontSize: '0.82rem', color: 'var(--color-text-secondary)', marginBottom: '0.75rem' }}>
            Select a high-resolution preset cover photo for your article:
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '0.6rem' }}>
            {PRESET_COVERS.map(preset => (
              <div
                key={preset.name}
                onClick={() => {
                  onChange(preset.url);
                  setSuccessMsg(`Applied '${preset.name}' cover!`);
                  setTimeout(() => setSuccessMsg(null), 3000);
                }}
                style={{
                  position: 'relative',
                  height: '80px',
                  borderRadius: 'var(--radius-sm)',
                  overflow: 'hidden',
                  cursor: 'pointer',
                  border: '1px solid var(--color-border)',
                }}
              >
                <img src={preset.url} alt={preset.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    backgroundColor: 'rgba(0,0,0,0.45)',
                    display: 'flex',
                    alignItems: 'flex-end',
                    padding: '0.35rem',
                    color: '#FFFFFF',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                  }}
                >
                  {preset.name}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* Drag and Drop Zone */
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          style={{
            border: `2px dashed ${dragActive ? 'var(--color-secondary)' : 'var(--color-border)'}`,
            backgroundColor: dragActive ? 'var(--color-surface-alt)' : 'var(--color-background)',
            borderRadius: 'var(--radius-md)',
            padding: '2.25rem 1.25rem',
            textAlign: 'center',
            cursor: 'pointer',
            transition: 'all var(--transition-fast)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
          }}
        >
          {uploading ? (
            <>
              <Loader2 size={32} color="var(--color-secondary)" className="animate-spin" style={{ animation: 'spin 1s linear infinite' }} />
              <p style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-text)' }}>
                Uploading image... {uploadProgress > 0 ? `${uploadProgress}%` : ''}
              </p>
            </>
          ) : (
            <>
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--color-surface-alt)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--color-secondary)',
                  marginBottom: '0.25rem',
                }}
              >
                <Upload size={22} />
              </div>
              <p style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--color-text)' }}>
                Click to upload or drag & drop image file
              </p>
              <p style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>
                {helperText}
              </p>
            </>
          )}
        </div>
      )}

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleInputChange}
        accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
        style={{ display: 'none' }}
      />
    </div>
  );
};

