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
  Maximize2,
  Sliders,
  Sparkles,
  Lightbulb,
  CheckSquare,
  Type,
  Trash2,
  FileText,
  Edit3,
  Plus,
  Unlink,
  ExternalLink,
  MousePointer2,
  Film,
  Play,
  Crop as CropIcon,
} from 'lucide-react';
import { PictureFormatStudio, PictureFormatState } from './PictureFormatStudio';
import { ImageCropModal } from './ImageCropModal';

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
  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [cropImageSrc, setCropImageSrc] = useState('');

  // Link form state
  const [linkText, setLinkText] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const [selectedLinkNode, setSelectedLinkNode] = useState<HTMLAnchorElement | null>(null);
  const [savedRange, setSavedRange] = useState<Range | null>(null);

  // Video form state & Caption
  const [videoUrl, setVideoUrl] = useState('');
  const [videoCaption, setVideoCaption] = useState('');

  // Image form state: URL, Alt, Alignment & Sizing Controls
  const [uploading, setUploading] = useState(false);
  const [uploadedPreview, setUploadedPreview] = useState('');
  const [imageUrlInput, setImageUrlInput] = useState('');
  const [imageAltInput, setImageAltInput] = useState('');
  const [imageCaption, setImageCaption] = useState('');
  const [imageAlignment, setImageAlignment] = useState<'left' | 'center' | 'right' | 'full'>('center');
  const [imageSizePreset, setImageSizePreset] = useState<'small' | 'medium' | 'large' | 'full'>('medium');
  const [imageCustomWidth, setImageCustomWidth] = useState<number>(65);
  const [imageBorderRadius, setImageBorderRadius] = useState<'none' | 'sm' | 'md' | 'lg'>('md');
  const [uploadError, setUploadError] = useState<string | null>(null);

  // In-Editor Selected Image State for Instant Live Editing, Resizing & Deletion
  const [selectedFigure, setSelectedFigure] = useState<HTMLElement | null>(null);
  const [selectedFigureAlign, setSelectedFigureAlign] = useState<'left' | 'center' | 'right' | 'full'>('center');
  const [selectedFigureWidth, setSelectedFigureWidth] = useState<number>(60);
  const [isEditingExisting, setIsEditingExisting] = useState<boolean>(false);

  // Interactive MS Word Mouse/Pointer Drag Resize State
  const [isResizing, setIsResizing] = useState<boolean>(false);
  const [overlayBox, setOverlayBox] = useState<{ top: number; left: number; width: number; height: number } | null>(null);
  const [dragFeedback, setDragFeedback] = useState<{ percent: number; px: number } | null>(null);

  const visualEditorRef = useRef<HTMLDivElement>(null);
  const editorContainerRef = useRef<HTMLDivElement>(null);
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

  // In-Editor Image Selection Detection
  const handleEditorClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    const figure = target.closest('figure') as HTMLElement | null;
    const img = target.tagName === 'IMG' ? (target as HTMLImageElement) : figure?.querySelector('img');

    if (figure && img) {
      setSelectedFigure(figure);

      // Determine current alignment
      const fStyle = figure.getAttribute('style') || '';
      let align: 'left' | 'center' | 'right' | 'full' = 'center';
      if (fStyle.includes('align-items:flex-start') || fStyle.includes('margin:1.5rem auto 1.5rem 0') || fStyle.includes('margin-right:auto')) {
        align = 'left';
      } else if (fStyle.includes('align-items:flex-end') || fStyle.includes('margin:1.5rem 0 1.5rem auto') || fStyle.includes('margin-left:auto')) {
        align = 'right';
      } else if (fStyle.includes('display:block;width:100%') || fStyle.includes('margin:2rem 0')) {
        align = 'full';
      }
      setSelectedFigureAlign(align);

      // Determine width
      const widthMatch = fStyle.match(/width:\s*(\d+)%/);
      const width = widthMatch ? parseInt(widthMatch[1], 10) : 60;
      setSelectedFigureWidth(width);
    } else if (target.tagName !== 'BUTTON' && !target.closest('button')) {
      setSelectedFigure(null);
    }
  };

  // 1. Instant In-Editor Alignment Mutation
  const updateSelectedFigureAlignment = (newAlign: 'left' | 'center' | 'right' | 'full') => {
    if (!selectedFigure || !visualEditorRef.current) return;
    const width = selectedFigureWidth || 60;

    let figureStyle = '';
    if (newAlign === 'left') {
      figureStyle = `display:flex;flex-direction:column;align-items:flex-start;width:${width}%;max-width:100%;margin:1.5rem auto 1.5rem 0;text-align:left;`;
    } else if (newAlign === 'right') {
      figureStyle = `display:flex;flex-direction:column;align-items:flex-end;width:${width}%;max-width:100%;margin:1.5rem 0 1.5rem auto;text-align:right;`;
    } else if (newAlign === 'full') {
      figureStyle = `display:block;width:100%;max-width:100%;margin:2rem 0;text-align:center;`;
    } else {
      figureStyle = `display:flex;flex-direction:column;align-items:center;width:${width}%;max-width:100%;margin:1.75rem auto;text-align:center;`;
    }

    selectedFigure.setAttribute('style', figureStyle);
    setSelectedFigureAlign(newAlign);
    onChange(visualEditorRef.current.innerHTML);
  };

  // 2. Instant In-Editor Resizing Mutation
  const updateSelectedFigureWidth = (newWidth: number) => {
    if (!selectedFigure || !visualEditorRef.current) return;
    const clamped = Math.max(20, Math.min(100, newWidth));
    const align = selectedFigureAlign || 'center';

    let figureStyle = '';
    if (align === 'left') {
      figureStyle = `display:flex;flex-direction:column;align-items:flex-start;width:${clamped}%;max-width:100%;margin:1.5rem auto 1.5rem 0;text-align:left;`;
    } else if (align === 'right') {
      figureStyle = `display:flex;flex-direction:column;align-items:flex-end;width:${clamped}%;max-width:100%;margin:1.5rem 0 1.5rem auto;text-align:right;`;
    } else if (align === 'full') {
      figureStyle = `display:block;width:100%;max-width:100%;margin:2rem 0;text-align:center;`;
    } else {
      figureStyle = `display:flex;flex-direction:column;align-items:center;width:${clamped}%;max-width:100%;margin:1.75rem auto;text-align:center;`;
    }

    selectedFigure.setAttribute('style', figureStyle);
    setSelectedFigureWidth(clamped);
    onChange(visualEditorRef.current.innerHTML);
  };

  // 3. Instant In-Editor Delete Mutation
  const deleteSelectedFigure = () => {
    if (!selectedFigure || !visualEditorRef.current) return;
    selectedFigure.remove();
    setSelectedFigure(null);
    onChange(visualEditorRef.current.innerHTML);
  };

  // 4. Open Modal for Existing Image Edit
  const openEditModalForSelectedFigure = () => {
    if (!selectedFigure) return;
    const img = selectedFigure.querySelector('img');
    const figcaption = selectedFigure.querySelector('figcaption');
    if (img) {
      setImageUrlInput(img.getAttribute('src') || '');
      setImageAltInput(img.getAttribute('alt') || '');
      setImageCaption(figcaption?.textContent || img.getAttribute('alt') || '');
      setUploadedPreview(img.getAttribute('src') || '');
      setImageAlignment(selectedFigureAlign);
      setImageCustomWidth(selectedFigureWidth);
      setIsEditingExisting(true);
      setImageModalOpen(true);
    }
  };

  // 5. Open Modal for Interactive Pointer Crop
  const openCropModalForSelectedFigure = () => {
    if (!selectedFigure) return;
    const img = selectedFigure.querySelector('img');
    if (img) {
      setCropImageSrc(img.getAttribute('src') || '');
      setCropModalOpen(true);
    }
  };

  const handleCropComplete = (croppedUrl: string) => {
    if (!selectedFigure || !visualEditorRef.current) return;
    const img = selectedFigure.querySelector('img');
    if (img) {
      img.setAttribute('src', croppedUrl);
      onChange(visualEditorRef.current.innerHTML);
      updateOverlayBox();
    }
  };

  // 6. Apply MS Word Picture Format Studio Changes
  const applyPictureFormatStudio = (fmt: PictureFormatState) => {
    if (!selectedFigure || !visualEditorRef.current) return;
    const img = selectedFigure.querySelector('img');
    const figcaption = selectedFigure.querySelector('figcaption');

    // Calculate Figure Layout
    let figureStyle = '';
    if (fmt.wrapText === 'left') {
      figureStyle = `display:flex;flex-direction:column;align-items:flex-start;float:left;width:${fmt.widthPercent}%;max-width:100%;margin:0.5rem 1.5rem 1rem 0;text-align:left;`;
    } else if (fmt.wrapText === 'right') {
      figureStyle = `display:flex;flex-direction:column;align-items:flex-end;float:right;width:${fmt.widthPercent}%;max-width:100%;margin:0.5rem 0 1rem 1.5rem;text-align:right;`;
    } else if (fmt.wrapText === 'full') {
      figureStyle = `display:block;clear:both;width:100%;max-width:100%;margin:2.5rem 0;text-align:center;`;
    } else if (fmt.wrapText === 'break') {
      figureStyle = `display:flex;flex-direction:column;align-items:center;clear:both;width:${fmt.widthPercent}%;max-width:100%;margin:2rem auto;text-align:center;`;
    } else {
      // inline center
      figureStyle = `display:flex;flex-direction:column;align-items:center;width:${fmt.widthPercent}%;max-width:100%;margin:1.75rem auto;text-align:center;`;
    }

    selectedFigure.setAttribute('style', figureStyle);

    // Apply Picture Styles, Border, Shadow, Filters to <img>
    if (img) {
      const radius = fmt.borderRadius === 9999 ? '9999px' : `${fmt.borderRadius}px`;
      let border = 'none';
      if (fmt.borderWidth > 0) {
        border = `${fmt.borderWidth}px ${fmt.borderStyle} ${fmt.borderColor}`;
      }

      let shadow = '0 4px 14px rgba(0,0,0,0.12)';
      if (fmt.shadow === 'none') shadow = 'none';
      else if (fmt.shadow === 'deep') shadow = '0 16px 32px -4px rgba(0,0,0,0.4)';
      else if (fmt.shadow === 'glow') shadow = `0 0 24px ${fmt.borderColor || 'rgba(99,102,241,0.6)'}`;

      let filter = 'none';
      if (fmt.filter === 'grayscale') filter = 'grayscale(100%)';
      else if (fmt.filter === 'sepia') filter = 'sepia(80%)';
      else if (fmt.filter === 'contrast') filter = 'contrast(130%) brightness(105%)';
      else if (fmt.filter === 'vibrant') filter = 'saturate(150%) contrast(110%)';

      const imgStyle = `width:100%;max-width:100%;height:auto;border-radius:${radius};border:${border};box-shadow:${shadow};filter:${filter};object-fit:cover;`;
      img.setAttribute('style', imgStyle);
      if (fmt.alt) img.setAttribute('alt', fmt.alt);
    }

    if (fmt.caption) {
      if (!figcaption) {
        const newCap = document.createElement('figcaption');
        newCap.setAttribute('style', 'font-size:0.84rem;color:var(--color-muted, #71717a);margin-top:0.5rem;font-style:italic;line-height:1.4;');
        newCap.textContent = fmt.caption;
        selectedFigure.appendChild(newCap);
      } else {
        figcaption.textContent = fmt.caption;
      }
    }

    onChange(visualEditorRef.current.innerHTML);
  };

  // Image Upload & Insertion/Update Handling
  const handleInsertImageHtml = (
    url: string,
    altText?: string,
    alignOverride?: 'left' | 'center' | 'right' | 'full',
    sizeOverride?: 'small' | 'medium' | 'large' | 'full',
    widthOverride?: number,
    radiusOverride?: 'none' | 'sm' | 'md' | 'lg'
  ) => {
    if (!url) return;
    const alt = altText || imageAltInput || 'Article illustration';
    const caption = imageCaption.trim() || alt;
    const align = alignOverride || imageAlignment;
    const size = sizeOverride || imageSizePreset;
    const customW = widthOverride !== undefined ? widthOverride : imageCustomWidth;
    const radius = radiusOverride || imageBorderRadius;

    let widthPercent = 100;
    if (size === 'small') widthPercent = 35;
    else if (size === 'medium') widthPercent = 60;
    else if (size === 'large') widthPercent = 85;
    else if (size === 'full') widthPercent = 100;
    else widthPercent = customW || 100;

    let radiusPx = '8px';
    if (radius === 'none') radiusPx = '0px';
    else if (radius === 'sm') radiusPx = '4px';
    else if (radius === 'md') radiusPx = '8px';
    else if (radius === 'lg') radiusPx = '16px';

    let figureStyle = '';
    if (align === 'left') {
      figureStyle = `display:flex;flex-direction:column;align-items:flex-start;width:${widthPercent}%;max-width:100%;margin:1.5rem auto 1.5rem 0;text-align:left;`;
    } else if (align === 'right') {
      figureStyle = `display:flex;flex-direction:column;align-items:flex-end;width:${widthPercent}%;max-width:100%;margin:1.5rem 0 1.5rem auto;text-align:right;`;
    } else if (align === 'full') {
      figureStyle = `display:block;width:100%;max-width:100%;margin:2rem 0;text-align:center;`;
    } else {
      figureStyle = `display:flex;flex-direction:column;align-items:center;width:${widthPercent}%;max-width:100%;margin:1.75rem auto;text-align:center;`;
    }

    if (isEditingExisting && selectedFigure && visualEditorRef.current) {
      // Update existing figure in place
      const img = selectedFigure.querySelector('img');
      if (img) {
        img.setAttribute('src', url);
        img.setAttribute('alt', alt);
        img.setAttribute('style', `width:100%;max-width:100%;height:auto;border-radius:${radiusPx};box-shadow:0 4px 16px rgba(0,0,0,0.12);object-fit:cover;`);
      }
      let figcaption = selectedFigure.querySelector('figcaption');
      if (caption) {
        if (!figcaption) {
          figcaption = document.createElement('figcaption');
          figcaption.setAttribute('style', 'font-size:0.84rem;color:var(--color-muted, #71717a);margin-top:0.5rem;font-style:italic;line-height:1.4;');
          selectedFigure.appendChild(figcaption);
        }
        figcaption.textContent = caption;
      } else if (figcaption) {
        figcaption.remove();
      }
      selectedFigure.setAttribute('style', figureStyle);
      onChange(visualEditorRef.current.innerHTML);
      setIsEditingExisting(false);
      setSelectedFigure(null);
    } else {
      // Insert new image figure
      const imageHtml = `
        <figure style="${figureStyle}">
          <img src="${url}" alt="${alt}" style="width:100%;max-width:100%;height:auto;border-radius:${radiusPx};box-shadow:0 4px 16px rgba(0,0,0,0.12);object-fit:cover;" />
          ${caption ? `<figcaption style="font-size:0.84rem;color:var(--color-muted, #71717a);margin-top:0.5rem;font-style:italic;line-height:1.4;">${caption}</figcaption>` : ''}
        </figure>
        <p><br></p>
      `;
      insertHtmlAtCursor(imageHtml);
    }

    setImageModalOpen(false);
    setImageUrlInput('');
    setImageAltInput('');
    setImageCaption('');
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

      const token = localStorage.getItem('bitblog_token');
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

  // Overlay Box tracking for MS Word style mouse pointer resize handles
  const updateOverlayBox = useCallback(() => {
    if (!selectedFigure || !editorContainerRef.current) {
      setOverlayBox(null);
      return;
    }
    const figureRect = selectedFigure.getBoundingClientRect();
    const containerRect = editorContainerRef.current.getBoundingClientRect();

    setOverlayBox({
      top: figureRect.top - containerRect.top,
      left: figureRect.left - containerRect.left,
      width: figureRect.width,
      height: figureRect.height,
    });
  }, [selectedFigure]);

  useEffect(() => {
    updateOverlayBox();
    window.addEventListener('resize', updateOverlayBox);
    window.addEventListener('scroll', updateOverlayBox, true);
    return () => {
      window.removeEventListener('resize', updateOverlayBox);
      window.removeEventListener('scroll', updateOverlayBox, true);
    };
  }, [updateOverlayBox]);

  // Interactive Pointer / Mouse Drag-to-Resize Handler
  const handleStartResize = (e: React.PointerEvent, direction: 'se' | 'sw' | 'ne' | 'nw' | 'e' | 'w') => {
    e.preventDefault();
    e.stopPropagation();
    if (!selectedFigure || !visualEditorRef.current) return;

    setIsResizing(true);
    const startX = e.clientX;
    const editorWidth = visualEditorRef.current.getBoundingClientRect().width;
    const initialWidthPx = selectedFigure.getBoundingClientRect().width;
    const isLeftHandle = direction === 'sw' || direction === 'nw' || direction === 'w';

    const onPointerMove = (moveEvent: PointerEvent) => {
      moveEvent.preventDefault();
      const deltaX = moveEvent.clientX - startX;
      const effectiveDelta = isLeftHandle ? -deltaX : deltaX;
      const newWidthPx = Math.max(120, Math.min(editorWidth, initialWidthPx + effectiveDelta * 1.5));
      const newPercent = Math.max(20, Math.min(100, Math.round((newWidthPx / editorWidth) * 100)));

      // Realtime inline style update
      selectedFigure.style.width = `${newPercent}%`;
      setSelectedFigureWidth(newPercent);
      setDragFeedback({ percent: newPercent, px: Math.round(newWidthPx) });
      updateOverlayBox();
    };

    const onPointerUp = () => {
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      setIsResizing(false);
      setDragFeedback(null);
      if (visualEditorRef.current) {
        onChange(visualEditorRef.current.innerHTML);
      }
      updateOverlayBox();
    };

    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
  };

  // Open Link Modal with selection pre-population
  const openLinkModal = () => {
    const selection = window.getSelection();
    let text = '';
    let url = '';
    let anchor: HTMLAnchorElement | null = null;

    if (selection && selection.rangeCount > 0) {
      setSavedRange(selection.getRangeAt(0).cloneRange());
      text = selection.toString();

      // Check if inside <a>
      let node: Node | null = selection.anchorNode;
      while (node && node !== visualEditorRef.current) {
        if (node.nodeName === 'A') {
          anchor = node as HTMLAnchorElement;
          break;
        }
        node = node.parentNode;
      }
    }

    if (anchor) {
      setSelectedLinkNode(anchor);
      setLinkText(anchor.textContent || '');
      setLinkUrl(anchor.getAttribute('href') || '');
    } else {
      setSelectedLinkNode(null);
      setLinkText(text);
      setLinkUrl('');
    }

    setLinkModalOpen(true);
  };

  // Link Modal Submit with proper protocol formatting and anchor creation
  const handleLinkSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!linkUrl.trim()) return;

    let href = linkUrl.trim();
    if (!href.startsWith('http://') && !href.startsWith('https://') && !href.startsWith('mailto:') && !href.startsWith('tel:') && !href.startsWith('#')) {
      href = `https://${href}`;
    }

    const text = linkText.trim() || href;

    if (selectedLinkNode) {
      selectedLinkNode.setAttribute('href', href);
      selectedLinkNode.setAttribute('target', '_blank');
      selectedLinkNode.setAttribute('rel', 'noopener noreferrer');
      selectedLinkNode.textContent = text;
      if (visualEditorRef.current) {
        onChange(visualEditorRef.current.innerHTML);
      }
    } else {
      if (savedRange && visualEditorRef.current) {
        const selection = window.getSelection();
        if (selection) {
          selection.removeAllRanges();
          selection.addRange(savedRange);
        }
      }
      const linkHtml = `<a href="${href}" target="_blank" rel="noopener noreferrer" style="color:var(--color-secondary, #6366f1);text-decoration:underline;font-weight:600;">${text}</a> `;
      insertHtmlAtCursor(linkHtml);
    }

    setLinkModalOpen(false);
    setLinkUrl('');
    setLinkText('');
    setSelectedLinkNode(null);
    setSavedRange(null);
  };

  // Unlink / Remove Link
  const handleUnlink = () => {
    if (selectedLinkNode && visualEditorRef.current) {
      const text = selectedLinkNode.textContent || '';
      selectedLinkNode.replaceWith(document.createTextNode(text));
      onChange(visualEditorRef.current.innerHTML);
    }
    setLinkModalOpen(false);
    setSelectedLinkNode(null);
    setLinkUrl('');
    setLinkText('');
  };

  // Robust Video Embed Parser (YouTube Shorts, Standard, Vimeo, Direct MP4/WebM)
  const parseVideoEmbed = (inputUrl: string): { type: 'youtube' | 'vimeo' | 'html5' | 'embed'; embedUrl: string } => {
    const trimmed = inputUrl.trim();
    if (!trimmed) return { type: 'embed', embedUrl: '' };

    // YouTube formats (standard, watch?v=, youtu.be, shorts, embed, live)
    const ytMatch = trimmed.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?|shorts|live)\/|.*[?&]v=)|youtu\.be\/)([^"&?/\s]{11})/i);
    if (ytMatch && ytMatch[1]) {
      return {
        type: 'youtube',
        embedUrl: `https://www.youtube-nocookie.com/embed/${ytMatch[1]}`,
      };
    }

    // Vimeo format
    const vimeoMatch = trimmed.match(/(?:vimeo\.com\/(?:channels\/(?:\w+\/)?|groups\/(?:[^\/]*)\/videos\/|album\/(?:\d+)\/video\/|video\/|)(\d+))/i);
    if (vimeoMatch && vimeoMatch[1]) {
      return {
        type: 'vimeo',
        embedUrl: `https://player.vimeo.com/video/${vimeoMatch[1]}`,
      };
    }

    // Direct MP4/WebM video
    if (trimmed.match(/\.(mp4|webm|ogg|mov)(\?.*)?$/i)) {
      return {
        type: 'html5',
        embedUrl: trimmed,
      };
    }

    return {
      type: 'embed',
      embedUrl: trimmed.startsWith('http') ? trimmed : `https://${trimmed}`,
    };
  };

  // Video Modal Submit
  const handleVideoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!videoUrl.trim()) return;

    const parsed = parseVideoEmbed(videoUrl);
    const caption = videoCaption.trim();

    let videoHtml = '';
    if (parsed.type === 'html5') {
      videoHtml = `
        <figure style="margin:1.75rem auto;width:100%;max-width:100%;text-align:center;">
          <video controls src="${parsed.embedUrl}" style="width:100%;max-height:480px;border-radius:10px;box-shadow:0 4px 18px rgba(0,0,0,0.15);background:#000;"></video>
          ${caption ? `<figcaption style="font-size:0.84rem;color:var(--color-muted, #71717a);margin-top:0.5rem;font-style:italic;line-height:1.4;">${caption}</figcaption>` : ''}
        </figure>
        <p><br></p>
      `;
    } else {
      videoHtml = `
        <figure style="margin:1.75rem auto;width:100%;max-width:100%;text-align:center;">
          <div style="position:relative;padding-bottom:56.25%;height:0;margin:0 auto;overflow:hidden;border-radius:10px;box-shadow:0 4px 18px rgba(0,0,0,0.15);background:#000;">
            <iframe src="${parsed.embedUrl}" style="position:absolute;top:0;left:0;width:100%;height:100%;border:none;border-radius:10px;" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>
          </div>
          ${caption ? `<figcaption style="font-size:0.84rem;color:var(--color-muted, #71717a);margin-top:0.5rem;font-style:italic;line-height:1.4;">${caption}</figcaption>` : ''}
        </figure>
        <p><br></p>
      `;
    }

    insertHtmlAtCursor(videoHtml);
    setVideoModalOpen(false);
    setVideoUrl('');
    setVideoCaption('');
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
            onClick={openLinkModal}
            title="Insert or Edit Link"
            style={{ padding: '0.35rem 0.5rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)', backgroundColor: 'var(--color-card)', color: 'var(--color-text)' }}
          >
            <LinkIcon size={15} />
          </button>
          <button
            type="button"
            onClick={() => setVideoModalOpen(true)}
            title="Embed YouTube / Vimeo / Video"
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
      <div ref={editorContainerRef} style={{ minHeight, position: 'relative', backgroundColor: 'var(--color-card)' }}>
        {/* Full MS Word "Picture Format" Ribbon Studio */}
        {activeTab === 'visual' && selectedFigure && (
          <PictureFormatStudio
            selectedFigure={selectedFigure}
            onApply={applyPictureFormatStudio}
            onCropImage={openCropModalForSelectedFigure}
            onReplaceImage={openEditModalForSelectedFigure}
            onDeleteImage={deleteSelectedFigure}
            onClose={() => setSelectedFigure(null)}
          />
        )}

        {/* MS Word Interactive Mouse / Pointer Drag Resize Handles Overlay */}
        {activeTab === 'visual' && selectedFigure && overlayBox && (
          <div
            style={{
              position: 'absolute',
              top: `${overlayBox.top}px`,
              left: `${overlayBox.left}px`,
              width: `${overlayBox.width}px`,
              height: `${overlayBox.height}px`,
              pointerEvents: 'none',
              border: '2px dashed var(--color-secondary, #6366f1)',
              borderRadius: '6px',
              zIndex: 30,
              boxShadow: '0 0 0 1px rgba(255,255,255,0.4)',
              transition: isResizing ? 'none' : 'all 0.1s ease',
            }}
          >
            {/* Live Size & Tooltip Pill Badge */}
            <div
              style={{
                position: 'absolute',
                top: '-32px',
                left: '50%',
                transform: 'translateX(-50%)',
                backgroundColor: 'var(--color-secondary, #6366f1)',
                color: '#FFFFFF',
                padding: '0.25rem 0.65rem',
                borderRadius: '12px',
                fontSize: '0.74rem',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                boxShadow: '0 4px 12px rgba(0,0,0,0.25)',
                whiteSpace: 'nowrap',
                pointerEvents: 'none',
              }}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <MousePointer2 size={12} />
                {dragFeedback ? `${dragFeedback.percent}% (${dragFeedback.px}px)` : `${selectedFigureWidth}%`}
              </span>

              <button
                type="button"
                onClick={e => {
                  e.preventDefault();
                  e.stopPropagation();
                  openCropModalForSelectedFigure();
                }}
                title="Open Interactive Crop Framing Tool"
                style={{
                  backgroundColor: 'rgba(255,255,255,0.2)',
                  color: '#FFFFFF',
                  border: '1px solid rgba(255,255,255,0.4)',
                  borderRadius: '6px',
                  padding: '0.12rem 0.45rem',
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.25rem',
                  pointerEvents: 'auto',
                  transition: 'all 0.15s ease',
                }}
              >
                <CropIcon size={11} /> Crop
              </button>
            </div>

            {/* Corner Resize Handles */}
            {/* Top-Left */}
            <div
              onPointerDown={e => handleStartResize(e, 'nw')}
              title="Drag to resize (Top-Left)"
              style={{
                position: 'absolute',
                top: '-7px',
                left: '-7px',
                width: '14px',
                height: '14px',
                backgroundColor: '#FFFFFF',
                border: '2px solid var(--color-secondary, #6366f1)',
                borderRadius: '3px',
                cursor: 'nwse-resize',
                pointerEvents: 'auto',
                boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
              }}
            />
            {/* Top-Right */}
            <div
              onPointerDown={e => handleStartResize(e, 'ne')}
              title="Drag to resize (Top-Right)"
              style={{
                position: 'absolute',
                top: '-7px',
                right: '-7px',
                width: '14px',
                height: '14px',
                backgroundColor: '#FFFFFF',
                border: '2px solid var(--color-secondary, #6366f1)',
                borderRadius: '3px',
                cursor: 'nesw-resize',
                pointerEvents: 'auto',
                boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
              }}
            />
            {/* Bottom-Left */}
            <div
              onPointerDown={e => handleStartResize(e, 'sw')}
              title="Drag to resize (Bottom-Left)"
              style={{
                position: 'absolute',
                bottom: '-7px',
                left: '-7px',
                width: '14px',
                height: '14px',
                backgroundColor: '#FFFFFF',
                border: '2px solid var(--color-secondary, #6366f1)',
                borderRadius: '3px',
                cursor: 'nesw-resize',
                pointerEvents: 'auto',
                boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
              }}
            />
            {/* Bottom-Right */}
            <div
              onPointerDown={e => handleStartResize(e, 'se')}
              title="Drag to resize (Bottom-Right)"
              style={{
                position: 'absolute',
                bottom: '-7px',
                right: '-7px',
                width: '14px',
                height: '14px',
                backgroundColor: '#FFFFFF',
                border: '2px solid var(--color-secondary, #6366f1)',
                borderRadius: '3px',
                cursor: 'nwse-resize',
                pointerEvents: 'auto',
                boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
              }}
            />

            {/* Edge Resize Handles */}
            {/* Middle-Left */}
            <div
              onPointerDown={e => handleStartResize(e, 'w')}
              title="Drag to resize width (Left)"
              style={{
                position: 'absolute',
                top: 'calc(50% - 7px)',
                left: '-7px',
                width: '14px',
                height: '14px',
                backgroundColor: '#FFFFFF',
                border: '2px solid var(--color-secondary, #6366f1)',
                borderRadius: '3px',
                cursor: 'ew-resize',
                pointerEvents: 'auto',
                boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
              }}
            />
            {/* Middle-Right */}
            <div
              onPointerDown={e => handleStartResize(e, 'e')}
              title="Drag to resize width (Right)"
              style={{
                position: 'absolute',
                top: 'calc(50% - 7px)',
                right: '-7px',
                width: '14px',
                height: '14px',
                backgroundColor: '#FFFFFF',
                border: '2px solid var(--color-secondary, #6366f1)',
                borderRadius: '3px',
                cursor: 'ew-resize',
                pointerEvents: 'auto',
                boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
              }}
            />
          </div>
        )}

        {/* Visual WYSIWYG Surface */}
        {activeTab === 'visual' && (
          <div
            ref={visualEditorRef}
            contentEditable
            onClick={handleEditorClick}
            onInput={() => {
              if (visualEditorRef.current) {
                onChange(visualEditorRef.current.innerHTML);
              }
              updateOverlayBox();
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

            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.35rem' }}>Image Caption / Alt Text</label>
              <input
                type="text"
                value={imageAltInput}
                onChange={e => setImageAltInput(e.target.value)}
                placeholder="e.g. System architecture diagram, Modern workspace..."
                style={{ width: '100%', padding: '0.6rem 0.85rem', fontSize: '0.88rem' }}
              />
            </div>

            {/* 1. Image Alignment Selector */}
            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '0.4rem' }}>
                Image Alignment
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem' }}>
                {[
                  { id: 'left', label: 'Left', icon: AlignLeft },
                  { id: 'center', label: 'Center', icon: AlignCenter },
                  { id: 'right', label: 'Right', icon: AlignRight },
                  { id: 'full', label: 'Full Width', icon: Maximize2 },
                ].map(opt => {
                  const Icon = opt.icon;
                  const selected = imageAlignment === opt.id;
                  return (
                    <button
                      type="button"
                      key={opt.id}
                      onClick={() => setImageAlignment(opt.id as any)}
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.3rem',
                        padding: '0.6rem 0.35rem',
                        borderRadius: 'var(--radius-md)',
                        border: `1.5px solid ${selected ? 'var(--color-secondary)' : 'var(--color-border)'}`,
                        backgroundColor: selected ? 'var(--color-surface-alt)' : 'transparent',
                        color: selected ? 'var(--color-secondary)' : 'var(--color-text)',
                        fontWeight: selected ? 700 : 500,
                        fontSize: '0.78rem',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      <Icon size={16} />
                      <span>{opt.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 2. Image Size Presets & Custom Width Slider */}
            <div style={{ marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                <label style={{ fontSize: '0.82rem', fontWeight: 700, margin: 0 }}>
                  Image Size & Width
                </label>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-secondary)' }}>
                  {imageSizePreset === 'small'
                    ? '35% (Small)'
                    : imageSizePreset === 'medium'
                    ? '60% (Medium)'
                    : imageSizePreset === 'large'
                    ? '85% (Large)'
                    : '100% (Full)'}
                </span>
              </div>

              {/* Preset Buttons */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem', marginBottom: '0.75rem' }}>
                {[
                  { id: 'small', label: 'Small (35%)' },
                  { id: 'medium', label: 'Medium (60%)' },
                  { id: 'large', label: 'Large (85%)' },
                  { id: 'full', label: 'Full (100%)' },
                ].map(sz => {
                  const isSel = imageSizePreset === sz.id;
                  return (
                    <button
                      type="button"
                      key={sz.id}
                      onClick={() => {
                        setImageSizePreset(sz.id as any);
                        if (sz.id === 'small') setImageCustomWidth(35);
                        else if (sz.id === 'medium') setImageCustomWidth(60);
                        else if (sz.id === 'large') setImageCustomWidth(85);
                        else setImageCustomWidth(100);
                      }}
                      style={{
                        padding: '0.45rem 0.25rem',
                        fontSize: '0.76rem',
                        fontWeight: isSel ? 700 : 500,
                        borderRadius: 'var(--radius-sm)',
                        border: `1px solid ${isSel ? 'var(--color-secondary)' : 'var(--color-border)'}`,
                        backgroundColor: isSel ? 'var(--color-secondary)' : 'var(--color-surface-alt)',
                        color: isSel ? '#FFFFFF' : 'var(--color-text)',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      {sz.label}
                    </button>
                  );
                })}
              </div>

              {/* Fine-tune Width Slider */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.5rem 0.75rem', backgroundColor: 'var(--color-surface-alt)', borderRadius: 'var(--radius-sm)' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--color-muted)', fontWeight: 600 }}>Custom:</span>
                <input
                  type="range"
                  min="20"
                  max="100"
                  step="5"
                  value={
                    imageSizePreset === 'small'
                      ? 35
                      : imageSizePreset === 'medium'
                      ? 60
                      : imageSizePreset === 'large'
                      ? 85
                      : imageSizePreset === 'full'
                      ? 100
                      : imageCustomWidth
                  }
                  onChange={e => {
                    const val = parseInt(e.target.value, 10);
                    setImageCustomWidth(val);
                    if (val <= 40) setImageSizePreset('small');
                    else if (val <= 70) setImageSizePreset('medium');
                    else if (val < 100) setImageSizePreset('large');
                    else setImageSizePreset('full');
                  }}
                  style={{ flex: 1, accentColor: 'var(--color-secondary)', cursor: 'pointer' }}
                />
                <span style={{ fontSize: '0.78rem', fontWeight: 700, minWidth: '38px', textAlign: 'right' }}>
                  {imageCustomWidth}%
                </span>
              </div>
            </div>

            {/* 3. Live Preview Box */}
            {(imageUrlInput || uploadedPreview) && (
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: 'var(--color-muted)', marginBottom: '0.35rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Live Article Preview
                </label>
                <div
                  style={{
                    padding: '1rem',
                    backgroundColor: 'var(--color-surface-alt)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px dashed var(--color-border)',
                    minHeight: '120px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: imageAlignment === 'left' ? 'flex-start' : imageAlignment === 'right' ? 'flex-end' : 'center',
                    overflow: 'hidden',
                  }}
                >
                  <img
                    src={imageUrlInput || uploadedPreview}
                    alt={imageAltInput || 'Preview'}
                    style={{
                      width: `${imageSizePreset === 'small' ? 35 : imageSizePreset === 'medium' ? 60 : imageSizePreset === 'large' ? 85 : 100}%`,
                      maxHeight: '160px',
                      objectFit: 'cover',
                      borderRadius: imageBorderRadius === 'none' ? '0px' : imageBorderRadius === 'sm' ? '4px' : imageBorderRadius === 'lg' ? '16px' : '8px',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.12)',
                    }}
                  />
                  {imageAltInput && (
                    <span style={{ fontSize: '0.75rem', color: 'var(--color-muted)', marginTop: '0.35rem', fontStyle: 'italic', textAlign: imageAlignment === 'left' ? 'left' : imageAlignment === 'right' ? 'right' : 'center' }}>
                      {imageAltInput}
                    </span>
                  )}
                </div>
              </div>
            )}

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
                  border: '1px solid var(--color-border)',
                  cursor: 'pointer',
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
                  border: 'none',
                  cursor: (!imageUrlInput.trim() && !uploadedPreview) ? 'not-allowed' : 'pointer',
                  opacity: (!imageUrlInput.trim() && !uploadedPreview) ? 0.6 : 1,
                }}
              >
                Insert Aligned Image
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal 2: Insert or Edit Link */}
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
              maxWidth: '460px',
              backgroundColor: 'var(--color-surface)',
              borderRadius: 'var(--radius-lg, 12px)',
              padding: '1.75rem',
              border: '1px solid var(--color-border)',
              boxShadow: 'var(--shadow-xl)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.15rem', margin: 0, fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                <LinkIcon size={20} color="var(--color-secondary)" /> {selectedLinkNode ? 'Edit Hyperlink' : 'Insert Website Link'}
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
                placeholder="e.g. Read comprehensive guide here"
                style={{ width: '100%', padding: '0.6rem 0.85rem', fontSize: '0.88rem' }}
              />
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.35rem' }}>Web Address (URL) *</label>
              <input
                type="text"
                value={linkUrl}
                onChange={e => setLinkUrl(e.target.value)}
                placeholder="https://example.com/article"
                required
                autoFocus
                style={{ width: '100%', padding: '0.6rem 0.85rem', fontSize: '0.88rem' }}
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', color: 'var(--color-muted)', marginBottom: '1.5rem' }}>
              <ExternalLink size={13} color="var(--color-secondary)" /> Links automatically open in a new secure tab (<code style={{ fontSize: '0.72rem' }}>target="_blank"</code>).
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.6rem' }}>
              {selectedLinkNode ? (
                <button
                  type="button"
                  onClick={handleUnlink}
                  style={{
                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                    color: '#ef4444',
                    border: '1px solid rgba(239, 68, 68, 0.25)',
                    padding: '0.55rem 0.9rem',
                    fontSize: '0.82rem',
                    fontWeight: 600,
                    borderRadius: 'var(--radius-md)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    cursor: 'pointer',
                  }}
                >
                  <Unlink size={14} /> Remove Link
                </button>
              ) : <div />}

              <div style={{ display: 'flex', gap: '0.6rem' }}>
                <button
                  type="button"
                  onClick={() => setLinkModalOpen(false)}
                  style={{ backgroundColor: 'var(--color-surface-alt)', color: 'var(--color-text)', padding: '0.55rem 1.15rem', fontSize: '0.88rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ backgroundColor: 'var(--color-secondary)', color: '#FFFFFF', padding: '0.55rem 1.4rem', fontSize: '0.88rem', fontWeight: 700, borderRadius: 'var(--radius-md)', border: 'none', cursor: 'pointer', boxShadow: '0 2px 8px var(--color-secondary-glow)' }}
                >
                  {selectedLinkNode ? 'Save Link' : 'Insert Link'}
                </button>
              </div>
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
              maxWidth: '520px',
              backgroundColor: 'var(--color-surface)',
              borderRadius: 'var(--radius-lg, 12px)',
              padding: '1.75rem',
              border: '1px solid var(--color-border)',
              boxShadow: 'var(--shadow-xl)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.15rem', margin: 0, fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                <Film size={20} color="var(--color-secondary)" /> Embed Video Player
              </h3>
              <button type="button" onClick={() => setVideoModalOpen(false)} style={{ background: 'transparent', padding: '0.3rem', color: 'var(--color-muted)' }}>
                <X size={20} />
              </button>
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                Video URL (YouTube, YouTube Shorts, Vimeo, or Direct MP4) *
              </label>
              <input
                type="text"
                value={videoUrl}
                onChange={e => setVideoUrl(e.target.value)}
                placeholder="https://www.youtube.com/watch?v=... or https://youtu.be/..."
                required
                autoFocus
                style={{ width: '100%', padding: '0.6rem 0.85rem', fontSize: '0.88rem' }}
              />
            </div>

            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                Caption / Description (Optional)
              </label>
              <input
                type="text"
                value={videoCaption}
                onChange={e => setVideoCaption(e.target.value)}
                placeholder="e.g. Watch the full walkthrough demo video"
                style={{ width: '100%', padding: '0.6rem 0.85rem', fontSize: '0.88rem' }}
              />
            </div>

            {/* Live Video Embed Preview */}
            {videoUrl.trim() && (
              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 700, color: 'var(--color-muted)', marginBottom: '0.35rem', textTransform: 'uppercase' }}>
                  Live Player Preview
                </label>
                <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0, overflow: 'hidden', borderRadius: '8px', backgroundColor: '#000' }}>
                  {parseVideoEmbed(videoUrl).type === 'html5' ? (
                    <video
                      controls
                      src={parseVideoEmbed(videoUrl).embedUrl}
                      style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'contain' }}
                    />
                  ) : (
                    <iframe
                      src={parseVideoEmbed(videoUrl).embedUrl}
                      style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none' }}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  )}
                </div>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.6rem' }}>
              <button
                type="button"
                onClick={() => setVideoModalOpen(false)}
                style={{ backgroundColor: 'var(--color-surface-alt)', color: 'var(--color-text)', padding: '0.55rem 1.15rem', fontSize: '0.88rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button
                type="submit"
                style={{ backgroundColor: 'var(--color-secondary)', color: '#FFFFFF', padding: '0.55rem 1.4rem', fontSize: '0.88rem', fontWeight: 700, borderRadius: 'var(--radius-md)', border: 'none', cursor: 'pointer', boxShadow: '0 2px 8px var(--color-secondary-glow)' }}
              >
                Embed Video
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Modal 4: Interactive Image Crop Studio */}
      <ImageCropModal
        isOpen={cropModalOpen}
        imageSrc={cropImageSrc}
        onClose={() => setCropModalOpen(false)}
        onCropComplete={handleCropComplete}
      />

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
