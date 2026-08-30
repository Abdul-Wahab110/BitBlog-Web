import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Crop as CropIcon,
  RotateCw,
  RotateCcw,
  FlipHorizontal,
  FlipVertical,
  Check,
  X,
  Loader2,
  RefreshCw,
  Undo2,
  Sparkles,
} from 'lucide-react';

export interface CropStateData {
  x: number;
  y: number;
  width: number;
  height: number;
  aspectPreset?: AspectPreset;
  rotation?: number;
  flipH?: boolean;
  flipV?: boolean;
}

interface ImageCropModalProps {
  isOpen: boolean;
  imageSrc: string;
  originalSrc?: string;
  initialCropState?: CropStateData | null;
  onClose: () => void;
  onCropComplete: (croppedUrl: string, originalUrl: string, cropState: CropStateData) => void;
  onRevertOriginal?: () => void;
}

type AspectPreset = 'free' | '16:9' | '4:3' | '1:1' | '3:2' | '9:16' | '2:1';

export const ImageCropModal: React.FC<ImageCropModalProps> = ({
  isOpen,
  imageSrc,
  originalSrc,
  initialCropState,
  onClose,
  onCropComplete,
  onRevertOriginal,
}) => {

  const effectiveSource = originalSrc || imageSrc;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [aspectPreset, setAspectPreset] = useState<AspectPreset>('free');
  const [rotation, setRotation] = useState<number>(0);
  const [flipH, setFlipH] = useState<boolean>(false);
  const [flipV, setFlipV] = useState<boolean>(false);

  const [cropBox, setCropBox] = useState<{ x: number; y: number; width: number; height: number }>({
    x: 5,
    y: 5,
    width: 90,
    height: 90,
  });

  const [activeDrag, setActiveDrag] = useState<string | null>(null);
  const dragStartRef = useRef<{
    startX: number;
    startY: number;
    startBox: { x: number; y: number; width: number; height: number };
  } | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  const initCrop = useCallback(() => {
    if (initialCropState) {
      setCropBox({
        x: initialCropState.x ?? 5,
        y: initialCropState.y ?? 5,
        width: initialCropState.width ?? 90,
        height: initialCropState.height ?? 90,
      });
      setAspectPreset(initialCropState.aspectPreset || 'free');
      setRotation(initialCropState.rotation || 0);
      setFlipH(initialCropState.flipH || false);
      setFlipV(initialCropState.flipV || false);
    } else {
      setRotation(0);
      setFlipH(false);
      setFlipV(false);
      setAspectPreset('free');
      setCropBox({ x: 5, y: 5, width: 90, height: 90 });
    }
  }, [initialCropState]);

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      initCrop();
    }
  }, [isOpen, effectiveSource, initCrop]);

  const applyAspectPreset = (preset: AspectPreset) => {
    setAspectPreset(preset);
    if (!imgRef.current) return;

    if (preset === 'free') return;

    let targetRatio = 1;
    if (preset === '16:9') targetRatio = 16 / 9;
    else if (preset === '4:3') targetRatio = 4 / 3;
    else if (preset === '1:1') targetRatio = 1;
    else if (preset === '3:2') targetRatio = 3 / 2;
    else if (preset === '9:16') targetRatio = 9 / 16;
    else if (preset === '2:1') targetRatio = 2 / 1;

    const imgWidth = imgRef.current.clientWidth || 400;
    const imgHeight = imgRef.current.clientHeight || 300;
    const imgAspect = imgWidth / imgHeight;

    let newWidth = 80;
    let newHeight = 80;

    if (targetRatio > imgAspect) {
      newWidth = 85;
      newHeight = Math.min(85, (newWidth / targetRatio) * (imgWidth / imgHeight));
    } else {
      newHeight = 85;
      newWidth = Math.min(85, (newHeight * targetRatio) / (imgWidth / imgHeight));
    }

    const newX = Math.max(0, (100 - newWidth) / 2);
    const newY = Math.max(0, (100 - newHeight) / 2);

    setCropBox({
      x: newX,
      y: newY,
      width: newWidth,
      height: newHeight,
    });
  };

  const handlePointerDown = (e: React.PointerEvent, handle: string) => {
    e.preventDefault();
    e.stopPropagation();

    setActiveDrag(handle);
    dragStartRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      startBox: { ...cropBox },
    };

    const onPointerMove = (moveEvt: PointerEvent) => {
      if (!dragStartRef.current || !containerRef.current) return;
      moveEvt.preventDefault();

      const containerRect = containerRef.current.getBoundingClientRect();
      const deltaXPct = ((moveEvt.clientX - dragStartRef.current.startX) / containerRect.width) * 100;
      const deltaYPct = ((moveEvt.clientY - dragStartRef.current.startY) / containerRect.height) * 100;

      const { startBox } = dragStartRef.current;
      let nextBox = { ...startBox };

      if (handle === 'move') {

        nextBox.x = Math.max(0, Math.min(100 - startBox.width, startBox.x + deltaXPct));
        nextBox.y = Math.max(0, Math.min(100 - startBox.height, startBox.y + deltaYPct));
      } else {

        if (handle.includes('e')) {
          nextBox.width = Math.max(10, Math.min(100 - startBox.x, startBox.width + deltaXPct));
        }
        if (handle.includes('s')) {
          nextBox.height = Math.max(10, Math.min(100 - startBox.y, startBox.height + deltaYPct));
        }
        if (handle.includes('w')) {
          const maxDeltaLeft = startBox.width - 10;
          const clampedDeltaX = Math.max(-startBox.x, Math.min(maxDeltaLeft, deltaXPct));
          nextBox.x = startBox.x + clampedDeltaX;
          nextBox.width = startBox.width - clampedDeltaX;
        }
        if (handle.includes('n')) {
          const maxDeltaTop = startBox.height - 10;
          const clampedDeltaY = Math.max(-startBox.y, Math.min(maxDeltaTop, deltaYPct));
          nextBox.y = startBox.y + clampedDeltaY;
          nextBox.height = startBox.height - clampedDeltaY;
        }
      }

      setCropBox(nextBox);
    };

    const onPointerUp = () => {
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      setActiveDrag(null);
      dragStartRef.current = null;
    };

    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
  };

  const handlePerformCrop = async () => {
    if (!imgRef.current) return;
    setSaving(true);

    try {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = effectiveSource;

      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
      });

      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Canvas 2D context not available');

      const nw = img.naturalWidth;
      const nh = img.naturalHeight;

      const cropPxX = (cropBox.x / 100) * nw;
      const cropPxY = (cropBox.y / 100) * nh;
      const cropPxW = (cropBox.width / 100) * nw;
      const cropPxH = (cropBox.height / 100) * nh;

      const isRotated90or270 = rotation === 90 || rotation === 270;
      canvas.width = isRotated90or270 ? cropPxH : cropPxW;
      canvas.height = isRotated90or270 ? cropPxW : cropPxH;

      ctx.save();
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate((rotation * Math.PI) / 180);
      ctx.scale(flipH ? -1 : 1, flipV ? -1 : 1);

      const drawWidth = isRotated90or270 ? canvas.height : canvas.width;
      const drawHeight = isRotated90or270 ? canvas.width : canvas.height;

      ctx.drawImage(
        img,
        cropPxX,
        cropPxY,
        cropPxW,
        cropPxH,
        -drawWidth / 2,
        -drawHeight / 2,
        drawWidth,
        drawHeight
      );
      ctx.restore();

      const cropStatePayload: CropStateData = {
        x: cropBox.x,
        y: cropBox.y,
        width: cropBox.width,
        height: cropBox.height,
        aspectPreset,
        rotation,
        flipH,
        flipV,
      };

      const blob = await new Promise<Blob | null>(res => canvas.toBlob(res, 'image/jpeg', 0.92));

      if (blob) {
        try {
          const formData = new FormData();
          formData.append('file', blob, `cropped-${Date.now()}.jpg`);
          formData.append('altText', 'Cropped Article Image');

          const token = localStorage.getItem('bitblog_token');
          const uploadRes = await fetch('/api/media/upload', {
            method: 'POST',
            headers: token ? { Authorization: `Bearer ${token}` } : {},
            body: formData,
          }).then(r => r.json());

          if (uploadRes && uploadRes.success && uploadRes.data && uploadRes.data.url) {
            onCropComplete(uploadRes.data.url, effectiveSource, cropStatePayload);
            onClose();
            return;
          }
        } catch {

        }

        const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
        onCropComplete(dataUrl, effectiveSource, cropStatePayload);
        onClose();
      }
    } catch (err) {
      console.error('Failed to crop image:', err);
      alert('Unable to process image crop. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleRevertToOriginal = () => {
    if (onRevertOriginal) {
      onRevertOriginal();
      onClose();
    } else {
      setRotation(0);
      setFlipH(false);
      setFlipV(false);
      setAspectPreset('free');
      setCropBox({ x: 0, y: 0, width: 100, height: 100 });
    }
  };

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(10, 8, 20, 0.85)',
        zIndex: 600,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.25rem',
        backdropFilter: 'blur(8px)',
        animation: 'fadeIn 0.2s ease',
      }}
      onClick={e => {
        if (e.target === e.currentTarget && !saving) onClose();
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '880px',
          maxHeight: '94vh',
          backgroundColor: 'var(--color-surface)',
          borderRadius: 'var(--radius-lg, 14px)',
          border: '1px solid var(--color-border)',
          boxShadow: '0 25px 60px rgba(0,0,0,0.4)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '1rem 1.5rem',
            backgroundColor: 'var(--color-surface-alt)',
            borderBottom: '1px solid var(--color-border)',
            gap: '1rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div
              style={{
                width: '34px',
                height: '34px',
                borderRadius: '8px',
                backgroundColor: 'var(--color-secondary)',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 2px 8px var(--color-secondary-glow)',
                flexShrink: 0,
              }}
            >
              <CropIcon size={18} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                Interactive Picture Crop & Framing Studio
                <span
                  style={{
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    color: 'var(--color-success, #10b981)',
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    padding: '0.15rem 0.5rem',
                    borderRadius: 'var(--radius-full)',
                    border: '1px solid rgba(16, 185, 129, 0.2)',
                  }}
                >
                  Non-Destructive
                </span>
              </h2>
              <span style={{ fontSize: '0.74rem', color: 'var(--color-muted)' }}>
                Drag corner and edge handles with mouse pointer to adjust crop boundaries. You can always re-crop or revert to the original full upload.
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--color-muted)',
              cursor: 'pointer',
              padding: '0.4rem',
              borderRadius: 'var(--radius-sm)',
            }}
          >
            <X size={20} />
          </button>
        </div>

        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0.65rem 1.5rem',
            backgroundColor: 'var(--color-surface)',
            borderBottom: '1px solid var(--color-border)',
            gap: '0.75rem',
          }}
        >

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--color-muted)', textTransform: 'uppercase', marginRight: '0.2rem' }}>
              Aspect:
            </span>
            {(['free', '16:9', '4:3', '1:1', '3:2', '9:16', '2:1'] as AspectPreset[]).map(preset => (
              <button
                key={preset}
                type="button"
                onClick={() => applyAspectPreset(preset)}
                style={{
                  padding: '0.25rem 0.55rem',
                  fontSize: '0.76rem',
                  fontWeight: aspectPreset === preset ? 700 : 500,
                  borderRadius: 'var(--radius-sm)',
                  border: `1px solid ${aspectPreset === preset ? 'var(--color-secondary)' : 'var(--color-border)'}`,
                  backgroundColor: aspectPreset === preset ? 'var(--color-secondary)' : 'var(--color-surface-alt)',
                  color: aspectPreset === preset ? '#FFFFFF' : 'var(--color-text)',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                {preset === 'free' ? 'Freeform' : preset}
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <button
              type="button"
              onClick={() => setRotation(r => (r + 270) % 360)}
              title="Rotate 90° Left"
              style={{
                padding: '0.35rem 0.55rem',
                fontSize: '0.76rem',
                fontWeight: 600,
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--color-border)',
                backgroundColor: 'var(--color-surface-alt)',
                color: 'var(--color-text)',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.25rem',
              }}
            >
              <RotateCcw size={13} /> -90°
            </button>
            <button
              type="button"
              onClick={() => setRotation(r => (r + 90) % 360)}
              title="Rotate 90° Right"
              style={{
                padding: '0.35rem 0.55rem',
                fontSize: '0.76rem',
                fontWeight: 600,
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--color-border)',
                backgroundColor: 'var(--color-surface-alt)',
                color: 'var(--color-text)',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.25rem',
              }}
            >
              <RotateCw size={13} /> +90°
            </button>
            <button
              type="button"
              onClick={() => setFlipH(f => !f)}
              title="Flip Horizontal"
              style={{
                padding: '0.35rem 0.55rem',
                fontSize: '0.76rem',
                fontWeight: 600,
                borderRadius: 'var(--radius-sm)',
                border: `1px solid ${flipH ? 'var(--color-secondary)' : 'var(--color-border)'}`,
                backgroundColor: flipH ? 'rgba(99, 102, 241, 0.1)' : 'var(--color-surface-alt)',
                color: flipH ? 'var(--color-secondary)' : 'var(--color-text)',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.25rem',
              }}
            >
              <FlipHorizontal size={13} /> Flip H
            </button>

            <button
              type="button"
              onClick={handleRevertToOriginal}
              title="Revert Crop to Full Original Upload Photo"
              style={{
                padding: '0.35rem 0.65rem',
                fontSize: '0.76rem',
                fontWeight: 700,
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--color-border)',
                backgroundColor: 'rgba(245, 158, 11, 0.1)',
                color: '#d97706',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.3rem',
              }}
            >
              <Undo2 size={13} /> Revert to Full Photo
            </button>
          </div>
        </div>

        <div
          style={{
            flex: 1,
            minHeight: '380px',
            maxHeight: '52vh',
            backgroundColor: '#0c0a14',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1.5rem',
            overflow: 'hidden',
            position: 'relative',
            userSelect: 'none',
          }}
        >
          {loading && (
            <div style={{ position: 'absolute', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#FFFFFF', zIndex: 10 }}>
              <Loader2 size={24} className="animate-spin" /> Loading full original asset...
            </div>
          )}

          <div
            ref={containerRef}
            style={{
              position: 'relative',
              display: 'inline-block',
              maxWidth: '100%',
              maxHeight: '100%',
              transform: `rotate(${rotation}deg) scale(${flipH ? -1 : 1}, ${flipV ? -1 : 1})`,
              transition: activeDrag ? 'none' : 'transform 0.2s ease',
            }}
          >
            <img
              ref={imgRef}
              src={effectiveSource}
              alt="Source"
              onLoad={() => setLoading(false)}
              style={{
                display: 'block',
                maxWidth: '680px',
                maxHeight: '44vh',
                objectFit: 'contain',
                pointerEvents: 'none',
                opacity: loading ? 0 : 1,
              }}
            />

            {!loading && (
              <>

                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: `${cropBox.y}%`, backgroundColor: 'rgba(0,0,0,0.65)', pointerEvents: 'none' }} />

                <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: `${100 - (cropBox.y + cropBox.height)}%`, backgroundColor: 'rgba(0,0,0,0.65)', pointerEvents: 'none' }} />

                <div style={{ position: 'absolute', top: `${cropBox.y}%`, left: 0, width: `${cropBox.x}%`, height: `${cropBox.height}%`, backgroundColor: 'rgba(0,0,0,0.65)', pointerEvents: 'none' }} />

                <div style={{ position: 'absolute', top: `${cropBox.y}%`, right: 0, width: `${100 - (cropBox.x + cropBox.width)}%`, height: `${cropBox.height}%`, backgroundColor: 'rgba(0,0,0,0.65)', pointerEvents: 'none' }} />

                <div
                  onPointerDown={e => handlePointerDown(e, 'move')}
                  style={{
                    position: 'absolute',
                    top: `${cropBox.y}%`,
                    left: `${cropBox.x}%`,
                    width: `${cropBox.width}%`,
                    height: `${cropBox.height}%`,
                    boxShadow: '0 0 0 2px #FFFFFF, 0 0 16px rgba(0,0,0,0.6)',
                    cursor: 'move',
                    touchAction: 'none',
                  }}
                >

                  <div style={{ position: 'absolute', top: '33.33%', left: 0, right: 0, height: '1px', borderTop: '1px dashed rgba(255,255,255,0.4)', pointerEvents: 'none' }} />
                  <div style={{ position: 'absolute', top: '66.66%', left: 0, right: 0, height: '1px', borderTop: '1px dashed rgba(255,255,255,0.4)', pointerEvents: 'none' }} />
                  <div style={{ position: 'absolute', left: '33.33%', top: 0, bottom: 0, width: '1px', borderLeft: '1px dashed rgba(255,255,255,0.4)', pointerEvents: 'none' }} />
                  <div style={{ position: 'absolute', left: '66.66%', top: 0, bottom: 0, width: '1px', borderLeft: '1px dashed rgba(255,255,255,0.4)', pointerEvents: 'none' }} />

                  <div
                    onPointerDown={e => handlePointerDown(e, 'nw')}
                    title="Drag to crop Top-Left"
                    style={{
                      position: 'absolute',
                      top: '-4px',
                      left: '-4px',
                      width: '18px',
                      height: '18px',
                      borderTop: '4px solid #FFFFFF',
                      borderLeft: '4px solid #FFFFFF',
                      cursor: 'nwse-resize',
                    }}
                  />

                  <div
                    onPointerDown={e => handlePointerDown(e, 'ne')}
                    title="Drag to crop Top-Right"
                    style={{
                      position: 'absolute',
                      top: '-4px',
                      right: '-4px',
                      width: '18px',
                      height: '18px',
                      borderTop: '4px solid #FFFFFF',
                      borderRight: '4px solid #FFFFFF',
                      cursor: 'nesw-resize',
                    }}
                  />

                  <div
                    onPointerDown={e => handlePointerDown(e, 'sw')}
                    title="Drag to crop Bottom-Left"
                    style={{
                      position: 'absolute',
                      bottom: '-4px',
                      left: '-4px',
                      width: '18px',
                      height: '18px',
                      borderBottom: '4px solid #FFFFFF',
                      borderLeft: '4px solid #FFFFFF',
                      cursor: 'nesw-resize',
                    }}
                  />

                  <div
                    onPointerDown={e => handlePointerDown(e, 'se')}
                    title="Drag to crop Bottom-Right"
                    style={{
                      position: 'absolute',
                      bottom: '-4px',
                      right: '-4px',
                      width: '18px',
                      height: '18px',
                      borderBottom: '4px solid #FFFFFF',
                      borderRight: '4px solid #FFFFFF',
                      cursor: 'nwse-resize',
                    }}
                  />

                  <div
                    onPointerDown={e => handlePointerDown(e, 'n')}
                    title="Drag to crop Top"
                    style={{
                      position: 'absolute',
                      top: '-3px',
                      left: 'calc(50% - 15px)',
                      width: '30px',
                      height: '6px',
                      backgroundColor: '#FFFFFF',
                      borderRadius: '2px',
                      cursor: 'ns-resize',
                    }}
                  />

                  <div
                    onPointerDown={e => handlePointerDown(e, 's')}
                    title="Drag to crop Bottom"
                    style={{
                      position: 'absolute',
                      bottom: '-3px',
                      left: 'calc(50% - 15px)',
                      width: '30px',
                      height: '6px',
                      backgroundColor: '#FFFFFF',
                      borderRadius: '2px',
                      cursor: 'ns-resize',
                    }}
                  />

                  <div
                    onPointerDown={e => handlePointerDown(e, 'w')}
                    title="Drag to crop Left"
                    style={{
                      position: 'absolute',
                      left: '-3px',
                      top: 'calc(50% - 15px)',
                      width: '6px',
                      height: '30px',
                      backgroundColor: '#FFFFFF',
                      borderRadius: '2px',
                      cursor: 'ew-resize',
                    }}
                  />

                  <div
                    onPointerDown={e => handlePointerDown(e, 'e')}
                    title="Drag to crop Right"
                    style={{
                      position: 'absolute',
                      right: '-3px',
                      top: 'calc(50% - 15px)',
                      width: '6px',
                      height: '30px',
                      backgroundColor: '#FFFFFF',
                      borderRadius: '2px',
                      cursor: 'ew-resize',
                    }}
                  />
                </div>
              </>
            )}
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '1rem 1.5rem',
            backgroundColor: 'var(--color-surface-alt)',
            borderTop: '1px solid var(--color-border)',
          }}
        >
          <span style={{ fontSize: '0.78rem', color: 'var(--color-muted)' }}>
            💡 Tip: Click and drag inside the frame to move, or drag the white brackets to adjust your crop.
          </span>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              style={{
                backgroundColor: 'var(--color-surface)',
                color: 'var(--color-text)',
                padding: '0.55rem 1.25rem',
                fontSize: '0.85rem',
                fontWeight: 600,
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--color-border)',
                cursor: 'pointer',
              }}
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handlePerformCrop}
              disabled={saving || loading}
              style={{
                backgroundColor: 'var(--color-secondary)',
                color: '#FFFFFF',
                padding: '0.55rem 1.5rem',
                fontSize: '0.85rem',
                fontWeight: 700,
                borderRadius: 'var(--radius-md)',
                border: 'none',
                cursor: saving || loading ? 'not-allowed' : 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.45rem',
                boxShadow: '0 2px 10px var(--color-secondary-glow)',
              }}
            >
              {saving ? (
                <>
                  <Loader2 size={15} className="animate-spin" /> Saving Crop...
                </>
              ) : (
                <>
                  <Check size={15} /> Apply Crop to Article
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

