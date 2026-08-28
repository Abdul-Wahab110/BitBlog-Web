import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Code,
  Link as LinkIcon,
  Image as ImageIcon,
  Video,
  Minus,
  Table as TableIcon,
  Eye,
  Code2,
  Upload,
  X,
  Loader2,
  CheckCircle2,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Sparkles,
  Lightbulb,
  CheckSquare,
  Type,
  Trash2,
  FileText,
} from 'lucide-react';

interface RichEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minHeight?: string;
}

export const RichEditor: React.FC<RichEditorProps> = ({
  value,
  onChange,
  placeholder = 'Start writing your story here... You can type freely or use the toolbar above to add headings, images, quotes, and callouts.',
  minHeight = '380px',
}) => {
  // Modes: 'visual' (Word-like WYSIWYG), 'preview' (Live Article View), 'source' (Raw HTML)
  const [activeTab, setActiveTab] = useState<'visual' | 'preview' | 'source'>('visual');

  // Modals state
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [linkModalOpen, setLinkModalOpen] = useState(false);
  const [videoModalOpen, setVideoModalOpen] = useState(false);

  // Link form state
  const [linkText, setLinkText] = useState('');
  const [linkUrl, setLinkUrl] = useState('');

  // Video form state
  const [videoUrl, setVideoUrl] = useState('');

  // Image form state
  const [uploading, setUploading] = useState(false);
  const [uploadedPreview, setUploadedPreview] = useState('');
  const [imageUrlInput, setImageUrlInput] = useState('');
  const [imageAltInput, setImageAltInput] = useState('');
  const [uploadError, setUploadError] = useState<string | null>(null);

  const visualEditorRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Synchronize incoming value into contentEditable when needed
  useEffect(() => {
    if (visualEditorRef.current && activeTab === 'visual') {
      if (visualEditorRef.current.innerHTML !== value) {
        visualEditorRef.current.innerHTML = value || '';
      }
    }
  }, [value, activeTab]);

  // Execute standard formatting command
  const formatDoc = (command: string, arg: string | undefined = undefined) => {
    if (activeTab !== 'visual') {
      setActiveTab('visual');
    }
    setTimeout(() => {
      if (visualEditorRef.current) {
        visualEditorRef.current.focus();
        document.execCommand(command, false, arg);
        onChange(visualEditorRef.current.innerHTML);
      }
    }, 10);
  };

  // Format Block Element (h1, h2, h3, p, blockquote)
  const formatBlock = (tag: string) => {
    formatDoc('formatBlock', `<${tag}>`);
  };

  // Insert HTML Snippet directly at cursor
  const insertHtmlAtCursor = (html: string) => {
    if (activeTab === 'source') {
      if (textareaRef.current) {
        const textarea = textareaRef.current;
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const newValue = value.substring(0, start) + html + value.substring(end);
        onChange(newValue);
      }
      return;
    }

    if (visualEditorRef.current) {
      visualEditorRef.current.focus();
      document.execCommand('insertHTML', false, html);
      onChange(visualEditorRef.current.innerHTML);
    }
  };

  // Insert Quick Block Templates (Callout, Quote, Checklist, Table, Divider)
  const insertCalloutBox = (type: 'tip' | 'info' | 'warning' = 'tip') => {
    const bgColors = {
      tip: 'rgba(16, 185, 129, 0.08)',
      info: 'rgba(59, 130, 246, 0.08)',
      warning: 'rgba(245, 158, 11, 0.08)',
    };
    const borderColors = {
      tip: '#10b981',
      info: '#3b82f6',
      warning: '#f59e0b',
    };
    const titles = {
      tip: '💡 Pro Tip',
      info: 'ℹ️ Key Takeaway',
      warning: '⚠️ Important Note',
    };

    const calloutHtml = `
      <div style="background-color:${bgColors[type]};border-left:4px solid ${borderColors[type]};padding:1rem 1.25rem;border-radius:6px;margin:1.5rem 0;">
        <strong style="color:${borderColors[type]};display:block;margin-bottom:0.35rem;font-size:0.95rem;">${titles[type]}</strong>
        <p style="margin:0;font-size:0.92rem;line-height:1.6;">Write your helpful note, summary, or callout insight here...</p>
      </div>
      <p><br></p>
    `;
    insertHtmlAtCursor(calloutHtml);
  };

  const insertQuote = () => {
    const quoteHtml = `
      <blockquote style="border-left:4px solid var(--color-secondary, #6366f1);padding:0.75rem 1.25rem;margin:1.5rem 0;font-style:italic;background:var(--color-surface-alt, #f8fafc);border-radius:0 8px 8px 0;">
        <p style="margin:0 0 0.5rem 0;font-size:1.05rem;line-height:1.6;">"Write an inspiring quote, key phrase, or expert testimony here."</p>
        <cite style="display:block;font-size:0.85rem;color:var(--color-muted, #64748b);font-style:normal;font-weight:600;">— Author Name / Source</cite>
      </blockquote>
      <p><br></p>
    `;
    insertHtmlAtCursor(quoteHtml);
  };

  const insertChecklist = () => {
    const checklistHtml = `
      <div style="margin:1.25rem 0;">
        <p style="margin:0.4rem 0;">☑️ Step 1: Research your topic and target audience</p>
        <p style="margin:0.4rem 0;">☑️ Step 2: Outline key headlines and supporting sections</p>
        <p style="margin:0.4rem 0;">☑️ Step 3: Add engaging imagery, examples, and takeaways</p>
      </div>
      <p><br></p>
    `;
    insertHtmlAtCursor(checklistHtml);
  };

  const insertTable = () => {
    const tableHtml = `
      <div style="margin:1.5rem 0;overflow-x:auto;">
        <table style="width:100%;border-collapse:collapse;text-align:left;font-size:0.9rem;">
          <thead>
            <tr style="background-color:rgba(99, 102, 241, 0.08);border-bottom:2px solid var(--color-border, #e2e8f0);">
              <th style="padding:0.75rem 1rem;border:1px solid var(--color-border, #e2e8f0);font-weight:700;">Feature / Topic</th>
              <th style="padding:0.75rem 1rem;border:1px solid var(--color-border, #e2e8f0);font-weight:700;">Description</th>
              <th style="padding:0.75rem 1rem;border:1px solid var(--color-border, #e2e8f0);font-weight:700;">Status</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style="padding:0.75rem 1rem;border:1px solid var(--color-border, #e2e8f0);">Item 1</td>
              <td style="padding:0.75rem 1rem;border:1px solid var(--color-border, #e2e8f0);">Explain detail here</td>
              <td style="padding:0.75rem 1rem;border:1px solid var(--color-border, #e2e8f0);color:#10b981;font-weight:600;">Active</td>
            </tr>
            <tr>
              <td style="padding:0.75rem 1rem;border:1px solid var(--color-border, #e2e8f0);">Item 2</td>
              <td style="padding:0.75rem 1rem;border:1px solid var(--color-border, #e2e8f0);">Explain detail here</td>
              <td style="padding:0.75rem 1rem;border:1px solid var(--color-border, #e2e8f0);color:#3b82f6;font-weight:600;">Review</td>
            </tr>
          </tbody>
        </table>
      </div>
      <p><br></p>
    `;
    insertHtmlAtCursor(tableHtml);
  };

  const insertDivider = () => {
    insertHtmlAtCursor('<hr style="border:none;border-top:2px dashed var(--color-border, #cbd5e1);margin:2.5rem 0;" /><p><br></p>');
  };

  // Image Upload Handling
  const handleInsertImageHtml = (url: string, altText?: string) => {
    if (!url) return;
    const alt = altText || 'Article illustration';
    const imageHtml = `
      <figure style="margin:1.75rem 0;text-align:center;">
        <img src="${url}" alt="${alt}" style="max-width:100%;height:auto;border-radius:8px;box-shadow:0 4px 14px rgba(0,0,0,0.12);" />
        <figcaption style="font-size:0.82rem;color:var(--color-muted, #64748b);margin-top:0.5rem;font-style:italic;">${alt}</figcaption>
      </figure>
      <p><br></p>
    `;
    insertHtmlAtCursor(imageHtml);
    setImageModalOpen(false);
    setImageUrlInput('');
    setImageAltInput('');
    setUploadedPreview('');
    setUploadError(null);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0]) return;
    const file = e.target.files[0];
    setUploadError(null);

    if (file.size > 5 * 1024 * 1024) {
      setUploadError('Image file size exceeds the 5 MB limit.');
      return;
    }

    const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowed.includes(file.type)) {
      setUploadError('Only JPG, PNG, WEBP, and GIF images are supported.');
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('altText', imageAltInput || file.name.replace(/\.[^/.]+$/, ''));

      const token = localStorage.getItem('modernblog_token');
      const res = await fetch('/api/media/upload', {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
      }).then(r => r.json());

      if (res && res.success && res.data && res.data.url) {
        setUploadedPreview(res.data.url);
        setImageUrlInput(res.data.url);
        if (!imageAltInput) {
          setImageAltInput(file.name.replace(/\.[^/.]+$/, ''));
        }
      } else {
        // Fallback for demo mode (base64 preview)
        const reader = new FileReader();
        reader.onload = () => {
          const b64 = reader.result as string;
          setUploadedPreview(b64);
          setImageUrlInput(b64);
        };
        reader.readAsDataURL(file);
      }
    } catch {
      // Fallback base64 for offline preview
      const reader = new FileReader();
      reader.onload = () => {
        const b64 = reader.result as string;
        setUploadedPreview(b64);
        setImageUrlInput(b64);
      };
      reader.readAsDataURL(file);
    } finally {
      setUploading(false);
    }
  };

  // Link Modal Submit
  const handleLinkSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!linkUrl.trim()) return;
    const href = linkUrl.startsWith('http') ? linkUrl.trim() : `https://${linkUrl.trim()}`;
    const text = linkText.trim() || href;
    insertHtmlAtCursor(`<a href="${href}" target="_blank" rel="noopener noreferrer" style="color:var(--color-secondary, #6366f1);text-decoration:underline;font-weight:600;">${text}</a> `);
    setLinkModalOpen(false);
    setLinkUrl('');
    setLinkText('');
  };

  // Video Modal Submit
  const handleVideoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!videoUrl.trim()) return;
    let embedSrc = videoUrl.trim();

    if (embedSrc.includes('youtube.com/watch?v=')) {
      embedSrc = embedSrc.replace('watch?v=', 'embed/');
    } else if (embedSrc.includes('youtu.be/')) {
      embedSrc = embedSrc.replace('youtu.be/', 'youtube.com/embed/');
    }

    const videoHtml = `
      <div style="position:relative;padding-bottom:56.25%;height:0;margin:1.75rem 0;overflow:hidden;border-radius:8px;box-shadow:0 4px 14px rgba(0,0,0,0.15);">
        <iframe src="${embedSrc}" style="position:absolute;top:0;left:0;width:100%;height:100%;border:none;border-radius:8px;" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
      </div>
      <p><br></p>
    `;
    insertHtmlAtCursor(videoHtml);
    setVideoModalOpen(false);
    setVideoUrl('');
  };

  // Word count & Reading time calculator
  const getStats = () => {
    const textOnly = value.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
    const words = textOnly ? textOnly.split(' ').length : 0;
    const chars = textOnly.length;
    const readTime = Math.max(1, Math.ceil(words / 200));
    return { words, chars, readTime };
  };

  const stats = getStats();

  return (
    <div
      style={{
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-lg, 12px)',
        backgroundColor: 'var(--color-card)',
        overflow: 'hidden',
        width: '100%',
        boxShadow: 'var(--shadow-sm, 0 1px 3px rgba(0,0,0,0.05))',
      }}
    >
      {/* 1. Top Editor Header: Mode Switcher + Easy One-Click Blocks */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0.65rem 0.85rem',
          backgroundColor: 'var(--color-surface-alt)',
          borderBottom: '1px solid var(--color-border)',
          gap: '0.5rem',
        }}
      >
        {/* Editor Tabs (Visual / Preview / HTML) */}
        <div
          style={{
            display: 'flex',
            backgroundColor: 'var(--color-surface)',
            borderRadius: 'var(--radius-md)',
            padding: '0.2rem',
            border: '1px solid var(--color-border)',
          }}
        >
          <button
            type="button"
            onClick={() => setActiveTab('visual')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              padding: '0.35rem 0.75rem',
              fontSize: '0.82rem',
              fontWeight: activeTab === 'visual' ? 700 : 500,
              backgroundColor: activeTab === 'visual' ? 'var(--color-secondary)' : 'transparent',
              color: activeTab === 'visual' ? '#FFFFFF' : 'var(--color-text-secondary)',
              borderRadius: 'var(--radius-sm)',
              boxShadow: activeTab === 'visual' ? 'var(--shadow-sm)' : 'none',
              transition: 'all 0.15s ease',
            }}
          >
            <Type size={14} /> Visual Editor
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('preview')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              padding: '0.35rem 0.75rem',
              fontSize: '0.82rem',
              fontWeight: activeTab === 'preview' ? 700 : 500,
              backgroundColor: activeTab === 'preview' ? 'var(--color-secondary)' : 'transparent',
              color: activeTab === 'preview' ? '#FFFFFF' : 'var(--color-text-secondary)',
              borderRadius: 'var(--radius-sm)',
              boxShadow: activeTab === 'preview' ? 'var(--shadow-sm)' : 'none',
              transition: 'all 0.15s ease',
            }}
          >
            <Eye size={14} /> Live Preview
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('source')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              padding: '0.35rem 0.75rem',
              fontSize: '0.82rem',
              fontWeight: activeTab === 'source' ? 700 : 500,
              backgroundColor: activeTab === 'source' ? 'var(--color-secondary)' : 'transparent',
              color: activeTab === 'source' ? '#FFFFFF' : 'var(--color-text-secondary)',
              borderRadius: 'var(--radius-sm)',
              boxShadow: activeTab === 'source' ? 'var(--shadow-sm)' : 'none',
              transition: 'all 0.15s ease',
            }}
          >
            <Code2 size={14} /> HTML Source
          </button>
        </div>

        {/* Word Count Indicator */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.78rem', color: 'var(--color-muted)' }}>
          <span><strong>{stats.words}</strong> words</span>
          <span>•</span>
          <span>⏱️ <strong>{stats.readTime}</strong> min read</span>
        </div>
      </div>

      {/* 2. Visual Formatting Toolbar (Word / Medium Style) */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          gap: '0.3rem',
          padding: '0.5rem 0.85rem',
          backgroundColor: 'var(--color-surface)',
          borderBottom: '1px solid var(--color-border)',
        }}
      >
        {/* Headings & Text Format Dropdown / Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
          <button
            type="button"
            onClick={() => formatBlock('p')}
            title="Normal Paragraph Text"
            style={{
              padding: '0.35rem 0.6rem',
              fontSize: '0.8rem',
              fontWeight: 600,
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--color-border)',
              backgroundColor: 'var(--color-card)',
              color: 'var(--color-text)',
            }}
          >
            Paragraph
          </button>
          <button
            type="button"
            onClick={() => formatBlock('h1')}
            title="Large Heading (H1)"
            style={{
              padding: '0.35rem 0.5rem',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--color-border)',
              backgroundColor: 'var(--color-card)',
              color: 'var(--color-text)',
            }}
          >
            <Heading1 size={16} />
          </button>
          <button
            type="button"
            onClick={() => formatBlock('h2')}
            title="Medium Heading (H2)"
            style={{
              padding: '0.35rem 0.5rem',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--color-border)',
              backgroundColor: 'var(--color-card)',
              color: 'var(--color-text)',
            }}
          >
            <Heading2 size={16} />
          </button>
          <button
            type="button"
            onClick={() => formatBlock('h3')}
            title="Small Subheading (H3)"
            style={{
              padding: '0.35rem 0.5rem',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--color-border)',
              backgroundColor: 'var(--color-card)',
              color: 'var(--color-text)',
            }}
          >
            <Heading3 size={16} />
          </button>
        </div>

        <div style={{ width: '1px', height: '20px', backgroundColor: 'var(--color-border)', margin: '0 0.25rem' }} />

        {/* Text Styles (Bold, Italic, Underline, Strikethrough) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
          <button
            type="button"
            onClick={() => formatDoc('bold')}
            title="Bold (Ctrl+B)"
            style={{ padding: '0.35rem 0.5rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)', backgroundColor: 'var(--color-card)', color: 'var(--color-text)' }}
          >
            <Bold size={15} />
          </button>
          <button
            type="button"
            onClick={() => formatDoc('italic')}
            title="Italic (Ctrl+I)"
            style={{ padding: '0.35rem 0.5rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)', backgroundColor: 'var(--color-card)', color: 'var(--color-text)' }}
          >
            <Italic size={15} />
          </button>
          <button
            type="button"
            onClick={() => formatDoc('underline')}
            title="Underline (Ctrl+U)"
            style={{ padding: '0.35rem 0.5rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)', backgroundColor: 'var(--color-card)', color: 'var(--color-text)' }}
          >
            <Underline size={15} />
          </button>
          <button
            type="button"
            onClick={() => formatDoc('strikeThrough')}
            title="Strikethrough"
            style={{ padding: '0.35rem 0.5rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)', backgroundColor: 'var(--color-card)', color: 'var(--color-text)' }}
          >
            <Strikethrough size={15} />
          </button>
        </div>

        <div style={{ width: '1px', height: '20px', backgroundColor: 'var(--color-border)', margin: '0 0.25rem' }} />

        {/* Alignment */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
          <button
            type="button"
            onClick={() => formatDoc('justifyLeft')}
            title="Align Left"
            style={{ padding: '0.35rem 0.45rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)', backgroundColor: 'var(--color-card)', color: 'var(--color-text)' }}
          >
            <AlignLeft size={15} />
          </button>
          <button
            type="button"
            onClick={() => formatDoc('justifyCenter')}
            title="Align Center"
            style={{ padding: '0.35rem 0.45rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)', backgroundColor: 'var(--color-card)', color: 'var(--color-text)' }}
          >
            <AlignCenter size={15} />
          </button>
          <button
            type="button"
            onClick={() => formatDoc('justifyRight')}
            title="Align Right"
            style={{ padding: '0.35rem 0.45rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)', backgroundColor: 'var(--color-card)', color: 'var(--color-text)' }}
          >
            <AlignRight size={15} />
          </button>
        </div>

        <div style={{ width: '1px', height: '20px', backgroundColor: 'var(--color-border)', margin: '0 0.25rem' }} />

        {/* Lists */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
          <button
            type="button"
            onClick={() => formatDoc('insertUnorderedList')}
            title="Bullet List"
            style={{ padding: '0.35rem 0.5rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)', backgroundColor: 'var(--color-card)', color: 'var(--color-text)' }}
          >
            <List size={15} />
          </button>
          <button
            type="button"
            onClick={() => formatDoc('insertOrderedList')}
            title="Numbered List"
            style={{ padding: '0.35rem 0.5rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)', backgroundColor: 'var(--color-card)', color: 'var(--color-text)' }}
          >
            <ListOrdered size={15} />
          </button>
        </div>

        <div style={{ width: '1px', height: '20px', backgroundColor: 'var(--color-border)', margin: '0 0.25rem' }} />

        {/* Media & Links */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
          <button
            type="button"
            onClick={() => setImageModalOpen(true)}
            title="Add Picture / Upload Image"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.3rem',
              padding: '0.35rem 0.65rem',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--color-secondary)',
              backgroundColor: 'rgba(99, 102, 241, 0.08)',
              color: 'var(--color-secondary)',
              fontWeight: 700,
              fontSize: '0.8rem',
            }}
          >
            <ImageIcon size={14} /> Add Image
          </button>
          <button
            type="button"
            onClick={() => setLinkModalOpen(true)}
            title="Insert Link"
            style={{ padding: '0.35rem 0.5rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)', backgroundColor: 'var(--color-card)', color: 'var(--color-text)' }}
          >
            <LinkIcon size={15} />
          </button>
          <button
            type="button"
            onClick={() => setVideoModalOpen(true)}
            title="Embed YouTube Video"
            style={{ padding: '0.35rem 0.5rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)', backgroundColor: 'var(--color-card)', color: 'var(--color-text)' }}
          >
            <Video size={15} />
          </button>
        </div>

        <div style={{ width: '1px', height: '20px', backgroundColor: 'var(--color-border)', margin: '0 0.25rem' }} />

        {/* 1-Click One Touch Blocks */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
          <button
            type="button"
            onClick={() => insertCalloutBox('tip')}
            title="Insert Highlighted Callout Box"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.25rem',
              padding: '0.35rem 0.55rem',
              fontSize: '0.78rem',
              fontWeight: 600,
              borderRadius: 'var(--radius-sm)',
              border: '1px solid rgba(16, 185, 129, 0.4)',
              backgroundColor: 'rgba(16, 185, 129, 0.08)',
              color: '#10b981',
            }}
          >
            <Lightbulb size={13} /> Tip Box
          </button>

          <button
            type="button"
            onClick={insertQuote}
            title="Insert Pull Quote Block"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.25rem',
              padding: '0.35rem 0.55rem',
              fontSize: '0.78rem',
              fontWeight: 600,
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--color-border)',
              backgroundColor: 'var(--color-card)',
              color: 'var(--color-text)',
            }}
          >
            <Quote size={13} /> Quote
          </button>

          <button
            type="button"
            onClick={insertChecklist}
            title="Insert Checklist Block"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.25rem',
              padding: '0.35rem 0.55rem',
              fontSize: '0.78rem',
              fontWeight: 600,
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--color-border)',
              backgroundColor: 'var(--color-card)',
              color: 'var(--color-text)',
            }}
          >
            <CheckSquare size={13} /> Checklist
          </button>

          <button
            type="button"
            onClick={insertTable}
            title="Insert Comparison Table"
            style={{ padding: '0.35rem 0.5rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)', backgroundColor: 'var(--color-card)', color: 'var(--color-text)' }}
          >
            <TableIcon size={14} />
          </button>

          <button
            type="button"
            onClick={insertDivider}
            title="Insert Line Divider"
            style={{ padding: '0.35rem 0.5rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)', backgroundColor: 'var(--color-card)', color: 'var(--color-text)' }}
          >
            <Minus size={14} />
          </button>
        </div>

        {/* Clear / Reset Formatting */}
        <div style={{ marginLeft: 'auto' }}>
          <button
            type="button"
            onClick={() => formatDoc('removeFormat')}
            title="Clear text formatting"
            style={{
              padding: '0.35rem 0.5rem',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--color-border)',
              backgroundColor: 'transparent',
              color: 'var(--color-muted)',
              fontSize: '0.75rem',
            }}
          >
            Clear Format
          </button>
        </div>
      </div>

      {/* 3. Main Editing Surfaces based on Active Tab */}
      <div style={{ minHeight, position: 'relative', backgroundColor: 'var(--color-card)' }}>
        {/* Visual WYSIWYG Surface */}
        {activeTab === 'visual' && (
          <div
            ref={visualEditorRef}
            contentEditable
            onInput={() => {
              if (visualEditorRef.current) {
                onChange(visualEditorRef.current.innerHTML);
              }
            }}
            onBlur={() => {
              if (visualEditorRef.current) {
                onChange(visualEditorRef.current.innerHTML);
              }
            }}
            data-placeholder={placeholder}
            style={{
              minHeight,
              padding: '1.25rem 1.5rem',
              fontSize: '1.05rem',
              lineHeight: 1.8,
              outline: 'none',
              color: 'var(--color-text)',
              fontFamily: 'var(--font-body)',
            }}
          />
        )}

        {/* Live Preview Surface */}
        {activeTab === 'preview' && (
          <div
            style={{
              minHeight,
              padding: '1.5rem 2rem',
              fontSize: '1.05rem',
              lineHeight: 1.8,
              color: 'var(--color-text)',
              fontFamily: 'var(--font-body)',
              backgroundColor: 'var(--color-surface-alt)',
            }}
          >
            {value.trim() ? (
              <div
                className="article-content"
                dangerouslySetInnerHTML={{ __html: value }}
              />
            ) : (
              <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--color-muted)' }}>
                <FileText size={36} style={{ margin: '0 auto 0.75rem auto', opacity: 0.5 }} />
                <p style={{ margin: 0, fontWeight: 600 }}>Your article preview will appear here</p>
                <span style={{ fontSize: '0.82rem' }}>Switch back to Visual Editor to start writing content.</span>
              </div>
            )}
          </div>
        )}

        {/* Raw HTML Source Surface */}
        {activeTab === 'source' && (
          <textarea
            ref={textareaRef}
            value={value}
            onChange={e => onChange(e.target.value)}
            placeholder="<html><body>Raw HTML Source Code...</body></html>"
            style={{
              width: '100%',
              minHeight,
              padding: '1.25rem',
              fontSize: '0.9rem',
              fontFamily: 'Consolas, Monaco, monospace',
              lineHeight: 1.6,
              border: 'none',
              outline: 'none',
              resize: 'vertical',
              backgroundColor: 'var(--color-background)',
              color: 'var(--color-text)',
            }}
          />
        )}
      </div>

      {/* 4. Bottom Helper Bar for Simple Users */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0.5rem 1rem',
          backgroundColor: 'var(--color-surface-alt)',
          borderTop: '1px solid var(--color-border)',
          fontSize: '0.78rem',
          color: 'var(--color-muted)',
          gap: '0.5rem',
        }}
      >
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          <Sparkles size={13} color="var(--color-secondary)" />
          <strong>Tip:</strong> Select any text and click <b>B</b> for Bold, <b>H1/H2</b> for Headings, or click <b>Add Image</b> to insert pictures!
        </span>
        <span style={{ color: 'var(--color-success)', fontWeight: 600 }}>
          ✓ Content Auto-Sync Active
        </span>
      </div>

      {/* Modal 1: Image Upload & Insertion */}
      {imageModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Upload story image modal"
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 12, 28, 0.75)',
            zIndex: 500,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
            backdropFilter: 'blur(6px)',
          }}
          onClick={e => {
            if (e.target === e.currentTarget) setImageModalOpen(false);
          }}
        >
          <div
            style={{
              width: '100%',
              maxWidth: '520px',
              backgroundColor: 'var(--color-surface)',
              borderRadius: 'var(--radius-lg, 12px)',
              padding: '1.75rem',
              boxShadow: 'var(--shadow-xl)',
              maxHeight: '90vh',
              overflowY: 'auto',
              border: '1px solid var(--color-border)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.2rem', margin: 0, fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                <ImageIcon size={22} color="var(--color-secondary)" /> Insert Picture / Image
              </h3>
              <button
                type="button"
                onClick={() => setImageModalOpen(false)}
                aria-label="Close modal"
                style={{ background: 'transparent', padding: '0.3rem', color: 'var(--color-muted)' }}
              >
                <X size={20} />
              </button>
            </div>

            {uploadError && (
              <div style={{ padding: '0.6rem 0.85rem', backgroundColor: 'rgba(239, 68, 68, 0.12)', border: '1px solid var(--color-danger)', borderRadius: 'var(--radius-sm)', color: 'var(--color-danger)', marginBottom: '1rem', fontSize: '0.82rem' }}>
                {uploadError}
              </div>
            )}

            {/* Direct File Upload Dropzone */}
            <div
              onClick={() => fileInputRef.current?.click()}
              style={{
                border: '2px dashed var(--color-secondary)',
                borderRadius: 'var(--radius-md)',
                padding: '1.75rem 1rem',
                textAlign: 'center',
                backgroundColor: 'var(--color-surface-alt)',
                cursor: 'pointer',
                marginBottom: '1.25rem',
                transition: 'all 0.2s ease',
              }}
            >
              {uploading ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                  <Loader2 size={30} color="var(--color-secondary)" style={{ animation: 'spin 1s linear infinite' }} />
                  <span style={{ fontSize: '0.88rem', fontWeight: 600 }}>Uploading image...</span>
                </div>
              ) : uploadedPreview ? (
                <div>
                  <img src={uploadedPreview} alt="Uploaded preview" style={{ maxHeight: '180px', maxWidth: '100%', margin: '0 auto 0.75rem auto', borderRadius: 'var(--radius-sm)', objectFit: 'cover' }} />
                  <p style={{ fontSize: '0.82rem', color: 'var(--color-success)', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.3rem' }}>
                    <CheckCircle2 size={15} /> Image loaded! Click to choose another
                  </p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.4rem' }}>
                  <Upload size={32} color="var(--color-secondary)" />
                  <p style={{ fontSize: '0.95rem', fontWeight: 700, margin: 0 }}>Click To Upload Image From Device</p>
                  <p style={{ fontSize: '0.78rem', color: 'var(--color-text-secondary)', margin: 0 }}>Supports JPG, PNG, WEBP, GIF (up to 5MB)</p>
                </div>
              )}
              <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept="image/jpeg,image/jpg,image/png,image/webp,image/gif" style={{ display: 'none' }} />
            </div>

            <div style={{ textAlign: 'center', margin: '0.85rem 0', fontSize: '0.74rem', color: 'var(--color-muted)', fontWeight: 700, letterSpacing: '0.05em' }}>
              ─── OR PASTE ONLINE IMAGE URL ───
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.35rem' }}>Image Web URL</label>
              <input
                type="url"
                value={imageUrlInput}
                onChange={e => {
                  setImageUrlInput(e.target.value);
                  setUploadedPreview(e.target.value);
                }}
                placeholder="https://images.unsplash.com/photo-..."
                style={{ width: '100%', padding: '0.6rem 0.85rem', fontSize: '0.88rem' }}
              />
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.35rem' }}>Image Caption / Title *</label>
              <input
                type="text"
                value={imageAltInput}
                onChange={e => setImageAltInput(e.target.value)}
                placeholder="e.g. Modern Office Workspace, Beautiful Sunset..."
                style={{ width: '100%', padding: '0.6rem 0.85rem', fontSize: '0.88rem' }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.6rem' }}>
              <button
                type="button"
                onClick={() => setImageModalOpen(false)}
                style={{
                  backgroundColor: 'var(--color-surface-alt)',
                  color: 'var(--color-text)',
                  padding: '0.55rem 1.15rem',
                  fontSize: '0.88rem',
                  borderRadius: 'var(--radius-md)',
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleInsertImageHtml(imageUrlInput || uploadedPreview, imageAltInput)}
                disabled={!imageUrlInput.trim() && !uploadedPreview}
                style={{
                  backgroundColor: 'var(--color-secondary)',
                  color: '#FFFFFF',
                  padding: '0.55rem 1.4rem',
                  fontSize: '0.88rem',
                  fontWeight: 700,
                  borderRadius: 'var(--radius-md)',
                  boxShadow: '0 2px 8px var(--color-secondary-glow)',
                }}
              >
                Insert Image
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal 2: Insert Link */}
      {linkModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 12, 28, 0.75)',
            zIndex: 500,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
            backdropFilter: 'blur(6px)',
          }}
          onClick={e => {
            if (e.target === e.currentTarget) setLinkModalOpen(false);
          }}
        >
          <form
            onSubmit={handleLinkSubmit}
            style={{
              width: '100%',
              maxWidth: '440px',
              backgroundColor: 'var(--color-surface)',
              borderRadius: 'var(--radius-lg, 12px)',
              padding: '1.75rem',
              border: '1px solid var(--color-border)',
              boxShadow: 'var(--shadow-xl)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.15rem', margin: 0, fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                <LinkIcon size={20} color="var(--color-secondary)" /> Insert Website Link
              </h3>
              <button type="button" onClick={() => setLinkModalOpen(false)} style={{ background: 'transparent', padding: '0.3rem', color: 'var(--color-muted)' }}>
                <X size={20} />
              </button>
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.35rem' }}>Display Text</label>
              <input
                type="text"
                value={linkText}
                onChange={e => setLinkText(e.target.value)}
                placeholder="e.g. Read full guide here"
                style={{ width: '100%', padding: '0.6rem 0.85rem', fontSize: '0.88rem' }}
              />
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.35rem' }}>Web Address (URL) *</label>
              <input
                type="text"
                value={linkUrl}
                onChange={e => setLinkUrl(e.target.value)}
                placeholder="https://example.com"
                required
                autoFocus
                style={{ width: '100%', padding: '0.6rem 0.85rem', fontSize: '0.88rem' }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.6rem' }}>
              <button
                type="button"
                onClick={() => setLinkModalOpen(false)}
                style={{ backgroundColor: 'var(--color-surface-alt)', color: 'var(--color-text)', padding: '0.55rem 1.15rem', fontSize: '0.88rem', borderRadius: 'var(--radius-md)' }}
              >
                Cancel
              </button>
              <button
                type="submit"
                style={{ backgroundColor: 'var(--color-secondary)', color: '#FFFFFF', padding: '0.55rem 1.4rem', fontSize: '0.88rem', fontWeight: 700, borderRadius: 'var(--radius-md)' }}
              >
                Insert Link
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Modal 3: Embed Video */}
      {videoModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 12, 28, 0.75)',
            zIndex: 500,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
            backdropFilter: 'blur(6px)',
          }}
          onClick={e => {
            if (e.target === e.currentTarget) setVideoModalOpen(false);
          }}
        >
          <form
            onSubmit={handleVideoSubmit}
            style={{
              width: '100%',
              maxWidth: '480px',
              backgroundColor: 'var(--color-surface)',
              borderRadius: 'var(--radius-lg, 12px)',
              padding: '1.75rem',
              border: '1px solid var(--color-border)',
              boxShadow: 'var(--shadow-xl)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.15rem', margin: 0, fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                <Video size={20} color="var(--color-secondary)" /> Embed YouTube Video
              </h3>
              <button type="button" onClick={() => setVideoModalOpen(false)} style={{ background: 'transparent', padding: '0.3rem', color: 'var(--color-muted)' }}>
                <X size={20} />
              </button>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.35rem' }}>YouTube Video URL *</label>
              <input
                type="text"
                value={videoUrl}
                onChange={e => setVideoUrl(e.target.value)}
                placeholder="https://www.youtube.com/watch?v=..."
                required
                autoFocus
                style={{ width: '100%', padding: '0.6rem 0.85rem', fontSize: '0.88rem' }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.6rem' }}>
              <button
                type="button"
                onClick={() => setVideoModalOpen(false)}
                style={{ backgroundColor: 'var(--color-surface-alt)', color: 'var(--color-text)', padding: '0.55rem 1.15rem', fontSize: '0.88rem', borderRadius: 'var(--radius-md)' }}
              >
                Cancel
              </button>
              <button
                type="submit"
                style={{ backgroundColor: 'var(--color-secondary)', color: '#FFFFFF', padding: '0.55rem 1.4rem', fontSize: '0.88rem', fontWeight: 700, borderRadius: 'var(--radius-md)' }}
              >
                Embed Video
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Editor CSS helper styles */}
      <style>{`
        [contenteditable]:empty:before {
          content: attr(data-placeholder);
          color: var(--color-muted);
          cursor: text;
          display: block;
        }
        .article-content img {
          max-width: 100%;
          height: auto;
          border-radius: 8px;
        }
        .article-content h1, .article-content h2, .article-content h3 {
          font-family: var(--font-heading);
          margin-top: 1.5rem;
          margin-bottom: 0.75rem;
        }
        .article-content p {
          margin-bottom: 1rem;
        }
      `}</style>
    </div>
  );
};
