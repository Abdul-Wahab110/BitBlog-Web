import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  X,
  ZoomIn,
  ZoomOut,
  RotateCw,
  RotateCcw,
  FlipHorizontal,
  FlipVertical,
  Sun,
  Contrast,
  Sliders,
  Sparkles,
  Check,
  RotateCcw as ResetIcon,
  Crop,
  Eye,
  Camera,
} from 'lucide-react';

export interface AvatarPhotoEditorProps {
  isOpen: boolean;
  imageSrc: string;
  onClose: () => void;
  onApply: (croppedFile: File, previewUrl: string) => void;
  title?: string;
}

type FilterPreset = 'none' | 'portrait' | 'monochrome' | 'vivid' | 'warm' | 'cyber';

export const AvatarPhotoEditorModal: React.FC<AvatarPhotoEditorProps> = ({
  isOpen,
  imageSrc,
  onClose,
  onApply,
  title = 'Professional Photo Studio & Editor',
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [imageObj, setImageObj] = useState<HTMLImageElement | null>(null);

  // Transform states
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [flipH, setFlipH] = useState(false);
  const [flipV, setFlipV] = useState(false);
  const [panX, setPanX] = useState(0);
  const [panY, setPanY] = useState(0);

  // Adjustment states
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [saturation, setSaturation] = useState(100);
  const [preset, setPreset] = useState<FilterPreset>('none');
  const [activeTab, setActiveTab] = useState<'crop' | 'adjust' | 'presets'>('crop');

  // Dragging interaction
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // Load image when imageSrc changes
  useEffect(() => {
    if (!imageSrc) return;
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      setImageObj(img);
      // Reset transformations
      setZoom(1);
      setRotation(0);
      setFlipH(false);
      setFlipV(false);
      setPanX(0);
      setPanY(0);
      setBrightness(100);
      setContrast(100);
      setSaturation(100);
      setPreset('none');
    };
    img.src = imageSrc;
  }, [imageSrc]);

  // Apply preset filter values
  const applyPreset = (p: FilterPreset) => {
    setPreset(p);
    switch (p) {
      case 'portrait':
        setBrightness(108);
        setContrast(105);
        setSaturation(110);
        break;
      case 'monochrome':
        setBrightness(102);
        setContrast(120);
        setSaturation(0);
        break;
      case 'vivid':
        setBrightness(105);
        setContrast(115);
        setSaturation(135);
        break;
      case 'warm':
        setBrightness(104);
        setContrast(108);
        setSaturation(115);
        break;
      case 'cyber':
        setBrightness(110);
        setContrast(125);
        setSaturation(120);
        break;
      case 'none':
      default:
        setBrightness(100);
        setContrast(100);
        setSaturation(100);
        break;
    }
  };

  // Render to preview canvas
  const drawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !imageObj) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const size = canvas.width;
    ctx.clearRect(0, 0, size, size);
    ctx.save();

    // Setup filter
    let filterString = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%)`;
    if (preset === 'warm') {
      filterString += ' sepia(20%)';
    } else if (preset === 'cyber') {
      filterString += ' hue-rotate(15deg)';
    }
    ctx.filter = filterString;

    // Move origin to center of canvas
    ctx.translate(size / 2 + panX, size / 2 + panY);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.scale(flipH ? -1 : 1, flipV ? -1 : 1);

    // Calculate aspect ratio fit with zoom
    const imgAspect = imageObj.width / imageObj.height;
    let drawWidth = size * zoom;
    let drawHeight = size * zoom;

    if (imgAspect > 1) {
      drawWidth = size * imgAspect * zoom;
    } else {
      drawHeight = (size / imgAspect) * zoom;
    }

    ctx.drawImage(imageObj, -drawWidth / 2, -drawHeight / 2, drawWidth, drawHeight);
    ctx.restore();
  }, [imageObj, zoom, rotation, flipH, flipV, panX, panY, brightness, contrast, saturation, preset]);

  useEffect(() => {
    if (isOpen) {
      drawCanvas();
    }
  }, [isOpen, drawCanvas]);

  // Mouse / Touch handlers for panning
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - panX, y: e.clientY - panY });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPanX(e.clientX - dragStart.x);
    setPanY(e.clientY - dragStart.y);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      setIsDragging(true);
      setDragStart({ x: e.touches[0].clientX - panX, y: e.touches[0].clientY - panY });
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || e.touches.length !== 1) return;
    setPanX(e.touches[0].clientX - dragStart.x);
    setPanY(e.touches[0].clientY - dragStart.y);
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY * -0.0015;
    setZoom(prev => Math.min(3.5, Math.max(0.6, prev + delta)));
  };

  const handleResetAll = () => {
    setZoom(1);
    setRotation(0);
    setFlipH(false);
    setFlipV(false);
    setPanX(0);
    setPanY(0);
    setBrightness(100);
    setContrast(100);
    setSaturation(100);
    setPreset('none');
  };

  // Export cropped, enhanced high-resolution image
  const handleApplyCrop = () => {
    if (!imageObj) return;

    // High resolution output canvas (512x512)
    const exportSize = 512;
    const exportCanvas = document.createElement('canvas');
    exportCanvas.width = exportSize;
    exportCanvas.height = exportSize;
    const ctx = exportCanvas.getContext('2d');

    if (!ctx) return;

    // Setup filter
    let filterString = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%)`;
    if (preset === 'warm') {
      filterString += ' sepia(20%)';
    } else if (preset === 'cyber') {
      filterString += ' hue-rotate(15deg)';
    }
    ctx.filter = filterString;

    // Center translation adjusted for the 512x512 scale
    const scaleRatio = exportSize / 320;
    ctx.translate(exportSize / 2 + panX * scaleRatio, exportSize / 2 + panY * scaleRatio);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.scale(flipH ? -1 : 1, flipV ? -1 : 1);

    const imgAspect = imageObj.width / imageObj.height;
    let drawWidth = exportSize * zoom;
    let drawHeight = exportSize * zoom;

    if (imgAspect > 1) {
      drawWidth = exportSize * imgAspect * zoom;
    } else {
      drawHeight = (exportSize / imgAspect) * zoom;
    }

    ctx.drawImage(imageObj, -drawWidth / 2, -drawHeight / 2, drawWidth, drawHeight);

    // Create high quality WebP/PNG Blob
    exportCanvas.toBlob(
      blob => {
        if (!blob) return;
        const editedFile = new File([blob], `avatar_${Date.now()}.webp`, { type: 'image/webp' });
        const previewUrl = URL.createObjectURL(blob);
        onApply(editedFile, previewUrl);
        onClose();
      },
      'image/webp',
      0.95
    );
  };

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(12, 10, 24, 0.85)',
        backdropFilter: 'blur(8px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
      }}
      onClick={e => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '560px',
          backgroundColor: 'var(--color-surface)',
          borderRadius: 'var(--radius-xl)',
          border: '1px solid var(--color-border)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          maxHeight: '92vh',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '1rem 1.4rem',
            borderBottom: '1px solid var(--color-border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: 'var(--color-surface-alt)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                backgroundColor: 'var(--color-secondary-glow)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--color-secondary)',
              }}
            >
              <Camera size={18} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, fontFamily: 'var(--font-heading)' }}>
                {title}
              </h3>
              <span style={{ fontSize: '0.75rem', color: 'var(--color-muted)' }}>
                Crop, rotate, filter & refine your profile photo
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close photo editor"
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--color-muted)',
              cursor: 'pointer',
              padding: '0.35rem',
              borderRadius: 'var(--radius-sm)',
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Studio Canvas Viewport */}
        <div
          style={{
            position: 'relative',
            backgroundColor: '#090810',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1.5rem',
            userSelect: 'none',
            overflow: 'hidden',
          }}
        >
          {/* Canvas Viewport Stage */}
          <div
            style={{
              position: 'relative',
              width: '300px',
              height: '300px',
              cursor: isDragging ? 'grabbing' : 'grab',
              touchAction: 'none',
            }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onWheel={handleWheel}
          >
            <canvas
              ref={canvasRef}
              width={300}
              height={300}
              style={{
                width: '100%',
                height: '100%',
                display: 'block',
                borderRadius: '8px',
              }}
            />

            {/* Circular Avatar Guide Mask Overlay */}
            <div
              style={{
                position: 'absolute',
                inset: 0,
                borderRadius: '50%',
                boxShadow: '0 0 0 9999px rgba(9, 8, 16, 0.72)',
                border: '2px solid var(--color-secondary)',
                pointerEvents: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  top: '10px',
                  backgroundColor: 'rgba(0,0,0,0.65)',
                  color: '#FFFFFF',
                  fontSize: '0.68rem',
                  fontWeight: 700,
                  padding: '0.15rem 0.6rem',
                  borderRadius: '12px',
                  backdropFilter: 'blur(4px)',
                }}
              >
                Avatar Frame Preview
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div
          style={{
            display: 'flex',
            borderBottom: '1px solid var(--color-border)',
            backgroundColor: 'var(--color-surface)',
          }}
        >
          <button
            type="button"
            onClick={() => setActiveTab('crop')}
            style={{
              flex: 1,
              padding: '0.65rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.4rem',
              fontSize: '0.82rem',
              fontWeight: 700,
              background: 'transparent',
              border: 'none',
              borderBottom: activeTab === 'crop' ? '2px solid var(--color-secondary)' : '2px solid transparent',
              color: activeTab === 'crop' ? 'var(--color-secondary)' : 'var(--color-text-secondary)',
              cursor: 'pointer',
            }}
          >
            <Crop size={14} /> Framing & Zoom
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('presets')}
            style={{
              flex: 1,
              padding: '0.65rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.4rem',
              fontSize: '0.82rem',
              fontWeight: 700,
              background: 'transparent',
              border: 'none',
              borderBottom: activeTab === 'presets' ? '2px solid var(--color-secondary)' : '2px solid transparent',
              color: activeTab === 'presets' ? 'var(--color-secondary)' : 'var(--color-text-secondary)',
              cursor: 'pointer',
            }}
          >
            <Sparkles size={14} /> Studio Presets
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('adjust')}
            style={{
              flex: 1,
              padding: '0.65rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.4rem',
              fontSize: '0.82rem',
              fontWeight: 700,
              background: 'transparent',
              border: 'none',
              borderBottom: activeTab === 'adjust' ? '2px solid var(--color-secondary)' : '2px solid transparent',
              color: activeTab === 'adjust' ? 'var(--color-secondary)' : 'var(--color-text-secondary)',
              cursor: 'pointer',
            }}
          >
            <Sliders size={14} /> Enhancements
          </button>
        </div>

        {/* Tab Controls Content */}
        <div style={{ padding: '1rem 1.25rem', overflowY: 'auto', flex: 1, backgroundColor: 'var(--color-card)' }}>
          {activeTab === 'crop' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
              {/* Zoom Slider */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem', fontSize: '0.78rem', fontWeight: 600 }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    <ZoomIn size={13} color="var(--color-secondary)" /> Zoom Level
                  </span>
                  <span style={{ color: 'var(--color-muted)' }}>{Math.round(zoom * 100)}%</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <ZoomOut size={15} color="var(--color-muted)" />
                  <input
                    type="range"
                    min="0.6"
                    max="3"
                    step="0.05"
                    value={zoom}
                    onChange={e => setZoom(parseFloat(e.target.value))}
                    style={{ flex: 1, cursor: 'pointer', accentColor: 'var(--color-secondary)' }}
                  />
                  <ZoomIn size={15} color="var(--color-muted)" />
                </div>
              </div>

              {/* Rotation & Flip Toolbar */}
              <div>
                <span style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, marginBottom: '0.4rem' }}>
                  Orientation & Mirroring
                </span>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.45rem' }}>
                  <button
                    type="button"
                    onClick={() => setRotation(r => (r - 90) % 360)}
                    style={{
                      padding: '0.45rem 0.6rem',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      backgroundColor: 'var(--color-surface)',
                      border: '1px solid var(--color-border)',
                      borderRadius: 'var(--radius-md)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.3rem',
                      cursor: 'pointer',
                      color: 'var(--color-text)',
                    }}
                  >
                    <RotateCcw size={13} /> -90°
                  </button>

                  <button
                    type="button"
                    onClick={() => setRotation(r => (r + 90) % 360)}
                    style={{
                      padding: '0.45rem 0.6rem',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      backgroundColor: 'var(--color-surface)',
                      border: '1px solid var(--color-border)',
                      borderRadius: 'var(--radius-md)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.3rem',
                      cursor: 'pointer',
                      color: 'var(--color-text)',
                    }}
                  >
                    <RotateCw size={13} /> +90°
                  </button>

                  <button
                    type="button"
                    onClick={() => setFlipH(f => !f)}
                    style={{
                      padding: '0.45rem 0.6rem',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      backgroundColor: flipH ? 'var(--color-secondary-glow)' : 'var(--color-surface)',
                      border: `1px solid ${flipH ? 'var(--color-secondary)' : 'var(--color-border)'}`,
                      borderRadius: 'var(--radius-md)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.3rem',
                      cursor: 'pointer',
                      color: flipH ? 'var(--color-secondary)' : 'var(--color-text)',
                    }}
                  >
                    <FlipHorizontal size={13} /> Flip H
                  </button>

                  <button
                    type="button"
                    onClick={() => setFlipV(f => !f)}
                    style={{
                      padding: '0.45rem 0.6rem',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      backgroundColor: flipV ? 'var(--color-secondary-glow)' : 'var(--color-surface)',
                      border: `1px solid ${flipV ? 'var(--color-secondary)' : 'var(--color-border)'}`,
                      borderRadius: 'var(--radius-md)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.3rem',
                      cursor: 'pointer',
                      color: flipV ? 'var(--color-secondary)' : 'var(--color-text)',
                    }}
                  >
                    <FlipVertical size={13} /> Flip V
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'presets' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
              {[
                { id: 'none', label: 'Original', desc: 'Natural lighting' },
                { id: 'portrait', label: 'Portrait Glow', desc: 'Warm skin tones' },
                { id: 'vivid', label: 'Vibrant', desc: 'Punchy saturation' },
                { id: 'monochrome', label: 'Editorial B&W', desc: 'Classic monochrome' },
                { id: 'warm', label: 'Retro Warm', desc: 'Soft sepia tone' },
                { id: 'cyber', label: 'Cyber Violet', desc: 'Modern cool tint' },
              ].map(item => {
                const isActive = preset === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => applyPreset(item.id as FilterPreset)}
                    style={{
                      padding: '0.65rem 0.5rem',
                      borderRadius: 'var(--radius-md)',
                      border: `1px solid ${isActive ? 'var(--color-secondary)' : 'var(--color-border)'}`,
                      backgroundColor: isActive ? 'var(--color-secondary-glow)' : 'var(--color-surface)',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'all 0.15s ease',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.2rem',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontWeight: 700, fontSize: '0.8rem', color: isActive ? 'var(--color-secondary)' : 'var(--color-text)' }}>
                        {item.label}
                      </span>
                      {isActive && <Check size={13} color="var(--color-secondary)" />}
                    </div>
                    <span style={{ fontSize: '0.68rem', color: 'var(--color-muted)' }}>
                      {item.desc}
                    </span>
                  </button>
                );
              })}
            </div>
          )}

          {activeTab === 'adjust' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {/* Brightness */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem', fontSize: '0.78rem', fontWeight: 600 }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    <Sun size={13} color="var(--color-secondary)" /> Brightness
                  </span>
                  <span style={{ color: 'var(--color-muted)' }}>{brightness}%</span>
                </div>
                <input
                  type="range"
                  min="60"
                  max="140"
                  value={brightness}
                  onChange={e => {
                    setBrightness(parseInt(e.target.value));
                    setPreset('none');
                  }}
                  style={{ width: '100%', cursor: 'pointer', accentColor: 'var(--color-secondary)' }}
                />
              </div>

              {/* Contrast */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem', fontSize: '0.78rem', fontWeight: 600 }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    <Contrast size={13} color="var(--color-secondary)" /> Contrast
                  </span>
                  <span style={{ color: 'var(--color-muted)' }}>{contrast}%</span>
                </div>
                <input
                  type="range"
                  min="60"
                  max="140"
                  value={contrast}
                  onChange={e => {
                    setContrast(parseInt(e.target.value));
                    setPreset('none');
                  }}
                  style={{ width: '100%', cursor: 'pointer', accentColor: 'var(--color-secondary)' }}
                />
              </div>

              {/* Saturation */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem', fontSize: '0.78rem', fontWeight: 600 }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    <Sliders size={13} color="var(--color-secondary)" /> Saturation
                  </span>
                  <span style={{ color: 'var(--color-muted)' }}>{saturation}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="200"
                  value={saturation}
                  onChange={e => {
                    setSaturation(parseInt(e.target.value));
                    setPreset('none');
                  }}
                  style={{ width: '100%', cursor: 'pointer', accentColor: 'var(--color-secondary)' }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div
          style={{
            padding: '0.9rem 1.4rem',
            borderTop: '1px solid var(--color-border)',
            backgroundColor: 'var(--color-surface-alt)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '0.75rem',
          }}
        >
          <button
            type="button"
            onClick={handleResetAll}
            title="Reset all transformations and filters"
            style={{
              padding: '0.45rem 0.75rem',
              backgroundColor: 'transparent',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.78rem',
              fontWeight: 600,
              color: 'var(--color-muted)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.3rem',
              cursor: 'pointer',
            }}
          >
            <ResetIcon size={13} /> Reset
          </button>

          <div style={{ display: 'flex', gap: '0.6rem' }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '0.55rem 1rem',
                backgroundColor: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.84rem',
                fontWeight: 600,
                color: 'var(--color-text)',
                cursor: 'pointer',
              }}
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleApplyCrop}
              style={{
                padding: '0.55rem 1.25rem',
                backgroundColor: 'var(--color-secondary)',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.84rem',
                fontWeight: 700,
                boxShadow: '0 2px 8px var(--color-secondary-glow)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                cursor: 'pointer',
              }}
            >
              <Check size={15} /> Apply & Save Photo
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
