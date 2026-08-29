import React, { useState, useEffect } from 'react';
import {
  AlignLeft,
  AlignCenter,
  AlignRight,
  Maximize2,
  Sliders,
  Sparkles,
  Crop,
  Layers,
  Palette,
  Eye,
  Trash2,
  Edit3,
  RotateCcw,
  Sun,
  Contrast,
  Circle,
  Square,
  X,
  Plus,
  Minus,
  Check,
  ChevronDown,
  Undo2,
} from 'lucide-react';

export interface PictureFormatState {
  stylePreset: 'default' | 'matte' | 'shadow' | 'glow' | 'pill' | 'reflected' | 'vintage';
  borderWidth: number;
  borderColor: string;
  borderStyle: 'solid' | 'dashed' | 'dotted' | 'double';
  borderRadius: number;
  shadow: 'none' | 'subtle' | 'deep' | 'glow';
  filter: 'none' | 'grayscale' | 'sepia' | 'contrast' | 'vibrant';
  wrapText: 'inline' | 'left' | 'right' | 'break' | 'full';
  widthPercent: number;
  aspectRatio: 'auto' | '16/9' | '4/3' | '1/1' | '21/9';
  alt: string;
  caption: string;
}

interface PictureFormatStudioProps {
  selectedFigure: HTMLElement | null;
  onApply: (styles: PictureFormatState) => void;
  onCropImage?: () => void;
  onRevertOriginalPhoto?: () => void;
  hasCropHistory?: boolean;
  onReplaceImage: () => void;
  onDeleteImage: () => void;
  onClose: () => void;
}

export const PictureFormatStudio: React.FC<PictureFormatStudioProps> = ({
  selectedFigure,
  onApply,
  onCropImage,
  onRevertOriginalPhoto,
  hasCropHistory,
  onReplaceImage,
  onDeleteImage,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'styles' | 'border' | 'effects' | 'wrap' | 'size'>('styles');

  // Format State
  const [format, setFormat] = useState<PictureFormatState>({
    stylePreset: 'default',
    borderWidth: 0,
    borderColor: '#6366F1',
    borderStyle: 'solid',
    borderRadius: 8,
    shadow: 'subtle',
    filter: 'none',
    wrapText: 'inline',
    widthPercent: 65,
    aspectRatio: 'auto',
    alt: '',
    caption: '',
  });

  // Read current figure styles on mount / selection change
  useEffect(() => {
    if (!selectedFigure) return;

    const img = selectedFigure.querySelector('img');
    const figcaption = selectedFigure.querySelector('figcaption');
    const fStyle = selectedFigure.getAttribute('style') || '';
    const imgStyle = img?.getAttribute('style') || '';

    // Extract width
    const widthMatch = fStyle.match(/width:\s*(\d+)%/);
    const widthPercent = widthMatch ? parseInt(widthMatch[1], 10) : 65;

    // Extract wrap
    let wrapText: 'inline' | 'left' | 'right' | 'break' | 'full' = 'inline';
    if (fStyle.includes('float: left') || fStyle.includes('float:left')) wrapText = 'left';
    else if (fStyle.includes('float: right') || fStyle.includes('float:right')) wrapText = 'right';
    else if (fStyle.includes('display:block;width:100%') || fStyle.includes('margin:2.5rem 0')) wrapText = 'full';
    else if (fStyle.includes('clear: both') || fStyle.includes('clear:both')) wrapText = 'break';

    // Extract border radius
    let borderRadius = 8;
    if (imgStyle.includes('border-radius: 9999px') || imgStyle.includes('border-radius:9999px')) borderRadius = 9999;
    else if (imgStyle.includes('border-radius: 16px') || imgStyle.includes('border-radius:16px')) borderRadius = 16;
    else if (imgStyle.includes('border-radius: 0px') || imgStyle.includes('border-radius:0px')) borderRadius = 0;

    // Extract filter
    let filter: 'none' | 'grayscale' | 'sepia' | 'contrast' | 'vibrant' = 'none';
    if (imgStyle.includes('grayscale(100%)')) filter = 'grayscale';
    else if (imgStyle.includes('sepia(')) filter = 'sepia';
    else if (imgStyle.includes('contrast(')) filter = 'contrast';
    else if (imgStyle.includes('saturate(')) filter = 'vibrant';

    setFormat(prev => ({
      ...prev,
      widthPercent,
      wrapText,
      borderRadius,
      filter,
      alt: img?.getAttribute('alt') || '',
      caption: figcaption?.textContent || '',
    }));
  }, [selectedFigure]);

  const updateFormat = (updates: Partial<PictureFormatState>) => {
    const next = { ...format, ...updates };
    setFormat(next);
    onApply(next);
  };

  const applyStylePreset = (preset: PictureFormatState['stylePreset']) => {
    let updates: Partial<PictureFormatState> = { stylePreset: preset };
    if (preset === 'default') {
      updates = { ...updates, borderWidth: 0, borderRadius: 8, shadow: 'subtle', filter: 'none' };
    } else if (preset === 'matte') {
      updates = { ...updates, borderWidth: 4, borderColor: '#FFFFFF', borderStyle: 'solid', borderRadius: 10, shadow: 'deep' };
    } else if (preset === 'shadow') {
      updates = { ...updates, borderWidth: 1, borderColor: '#CBD5E1', borderStyle: 'solid', borderRadius: 8, shadow: 'deep' };
    } else if (preset === 'glow') {
      updates = { ...updates, borderWidth: 2, borderColor: '#6366F1', borderStyle: 'solid', borderRadius: 12, shadow: 'glow' };
    } else if (preset === 'pill') {
      updates = { ...updates, borderWidth: 0, borderRadius: 9999, shadow: 'subtle' };
    } else if (preset === 'reflected') {
      updates = { ...updates, borderWidth: 1, borderColor: '#818CF8', borderStyle: 'solid', borderRadius: 12, shadow: 'deep', filter: 'contrast' };
    } else if (preset === 'vintage') {
      updates = { ...updates, borderWidth: 2, borderColor: '#D97706', borderStyle: 'solid', borderRadius: 6, shadow: 'subtle', filter: 'sepia' };
    }
    updateFormat(updates);
  };

  const handleResetPicture = () => {
    const resetState: PictureFormatState = {
      stylePreset: 'default',
      borderWidth: 0,
      borderColor: '#6366F1',
      borderStyle: 'solid',
      borderRadius: 8,
      shadow: 'subtle',
      filter: 'none',
      wrapText: 'inline',
      widthPercent: 65,
      aspectRatio: 'auto',
      alt: format.alt,
      caption: format.caption,
    };
    setFormat(resetState);
    onApply(resetState);
  };

  return (
    <div
      style={{
        backgroundColor: 'var(--color-surface)',
        borderBottom: '2px solid var(--color-secondary)',
        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)',
        position: 'sticky',
        top: 0,
        zIndex: 50,
        fontSize: '0.82rem',
        animation: 'slideDown 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
        overflowX: 'auto',
        scrollbarWidth: 'thin',
      }}
    >
      {/* 1. MS Word Ribbon Header Tabs (Horizontal Scrollable) */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0.4rem 0.85rem',
          backgroundColor: 'var(--color-surface-alt)',
          borderBottom: '1px solid var(--color-border)',
          gap: '0.75rem',
          overflowX: 'auto',
          scrollbarWidth: 'thin',
          whiteSpace: 'nowrap',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', flexShrink: 0 }}>
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.3rem',
              fontWeight: 800,
              fontSize: '0.75rem',
              color: '#FFFFFF',
              backgroundColor: 'var(--color-secondary)',
              padding: '0.2rem 0.6rem',
              borderRadius: 'var(--radius-sm, 4px)',
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              flexShrink: 0,
            }}
          >
            <Sparkles size={12} /> Picture Format
          </span>

          {/* Sub Navigation Tabs */}
          {[
            { id: 'styles', label: 'Picture Styles' },
            { id: 'border', label: 'Border' },
            { id: 'effects', label: 'Effects & Filters' },
            { id: 'wrap', label: 'Wrap & Position' },
            { id: 'size', label: 'Size & Crop' },
          ].map(tab => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as any)}
              style={{
                padding: '0.25rem 0.65rem',
                fontSize: '0.78rem',
                fontWeight: activeTab === tab.id ? 700 : 500,
                border: 'none',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: activeTab === tab.id ? 'var(--color-surface)' : 'transparent',
                color: activeTab === tab.id ? 'var(--color-secondary)' : 'var(--color-text-secondary)',
                boxShadow: activeTab === tab.id ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
                cursor: 'pointer',
                flexShrink: 0,
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Action Controls: Reset, Crop, Replace, Delete, Close */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexShrink: 0 }}>
          <button
            type="button"
            onClick={handleResetPicture}
            title="Reset Picture Styles & Formatting to Original Look"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.25rem',
              padding: '0.25rem 0.65rem',
              fontSize: '0.76rem',
              fontWeight: 700,
              backgroundColor: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              color: 'var(--color-text)',
              borderRadius: 'var(--radius-sm)',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              flexShrink: 0,
            }}
          >
            <RotateCcw size={13} color="var(--color-secondary)" /> Reset Picture
          </button>

          {/* Revert Full Uncropped Photo Action */}
          {onRevertOriginalPhoto && (hasCropHistory || selectedFigure?.querySelector('img')?.hasAttribute('data-crop-state')) && (
            <button
              type="button"
              onClick={onRevertOriginalPhoto}
              title="Revert Crop & Restore Full Original Upload Photo"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.25rem',
                padding: '0.25rem 0.65rem',
                fontSize: '0.76rem',
                fontWeight: 700,
                backgroundColor: 'rgba(245, 158, 11, 0.1)',
                border: '1px solid #d97706',
                color: '#d97706',
                borderRadius: 'var(--radius-sm)',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                flexShrink: 0,
              }}
            >
              <Undo2 size={13} /> Revert Full Photo
            </button>
          )}

          {onCropImage && (
            <button
              type="button"
              onClick={onCropImage}
              title="Crop Picture Boundaries with Interactive Pointer"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.25rem',
                padding: '0.25rem 0.65rem',
                fontSize: '0.76rem',
                fontWeight: 700,
                backgroundColor: 'rgba(99, 102, 241, 0.1)',
                border: '1px solid var(--color-secondary)',
                color: 'var(--color-secondary)',
                borderRadius: 'var(--radius-sm)',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                flexShrink: 0,
              }}
            >
              <Crop size={13} /> Crop Picture
            </button>
          )}

          <button
            type="button"
            onClick={onReplaceImage}
            title="Replace Picture"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.25rem',
              padding: '0.25rem 0.65rem',
              fontSize: '0.76rem',
              fontWeight: 700,
              backgroundColor: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              color: 'var(--color-text)',
              borderRadius: 'var(--radius-sm)',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              flexShrink: 0,
            }}
          >
            <Edit3 size={13} /> Replace Image
          </button>

          <button
            type="button"
            onClick={onDeleteImage}
            title="Delete Image"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.25rem',
              padding: '0.25rem 0.65rem',
              fontSize: '0.76rem',
              fontWeight: 700,
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid var(--color-danger)',
              color: 'var(--color-danger)',
              borderRadius: 'var(--radius-sm)',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              flexShrink: 0,
            }}
          >
            <Trash2 size={13} /> Delete
          </button>

          <button
            type="button"
            onClick={onClose}
            title="Close Ribbon"
            style={{
              padding: '0.25rem',
              background: 'transparent',
              border: 'none',
              color: 'var(--color-muted)',
              cursor: 'pointer',
              flexShrink: 0,
            }}
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {/* 2. Ribbon Content Area by Tab */}
      <div style={{ padding: '0.65rem 1rem', overflowX: 'auto' }}>
        {/* Tab 1: Picture Styles Quick Gallery */}
        {activeTab === 'styles' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--color-muted)', fontWeight: 700, textTransform: 'uppercase' }}>
              Styles Gallery:
            </span>

            {[
              { id: 'default', label: 'Clean Standard', border: '1px solid #CBD5E1', radius: '6px', shadow: 'none' },
              { id: 'matte', label: 'Matte Frame', border: '3px solid #FFF', radius: '8px', shadow: '0 4px 10px rgba(0,0,0,0.3)' },
              { id: 'shadow', label: 'Drop Shadow', border: '1px solid #94A3B8', radius: '6px', shadow: '0 12px 20px -4px rgba(0,0,0,0.4)' },
              { id: 'glow', label: 'Neon Glow', border: '2px solid #6366F1', radius: '10px', shadow: '0 0 16px rgba(99,102,241,0.6)' },
              { id: 'pill', label: 'Soft Pill', border: 'none', radius: '9999px', shadow: '0 4px 12px rgba(0,0,0,0.15)' },
              { id: 'reflected', label: 'Reflected Glass', border: '1.5px solid #818CF8', radius: '10px', shadow: '0 12px 24px rgba(99,102,241,0.25)' },
              { id: 'vintage', label: 'Vintage Gold', border: '2px solid #D97706', radius: '4px', shadow: '0 4px 12px rgba(217,119,6,0.3)' },
            ].map(pst => {
              const isSelected = format.stylePreset === pst.id;
              return (
                <button
                  key={pst.id}
                  type="button"
                  onClick={() => applyStylePreset(pst.id as any)}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '0.3rem',
                    padding: '0.35rem 0.55rem',
                    borderRadius: 'var(--radius-md)',
                    border: `1.5px solid ${isSelected ? 'var(--color-secondary)' : 'var(--color-border)'}`,
                    backgroundColor: isSelected ? 'var(--color-surface-alt)' : 'transparent',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {/* Visual Miniature Preview */}
                  <div
                    style={{
                      width: '42px',
                      height: '28px',
                      backgroundColor: '#3B82F6',
                      backgroundImage: 'linear-gradient(135deg, #4F46E5 0%, #06B6D4 100%)',
                      border: pst.border,
                      borderRadius: pst.radius,
                      boxShadow: pst.shadow,
                    }}
                  />
                  <span style={{ fontSize: '0.72rem', fontWeight: isSelected ? 800 : 500, color: isSelected ? 'var(--color-secondary)' : 'var(--color-text)' }}>
                    {pst.label}
                  </span>
                </button>
              );
            })}
          </div>
        )}

        {/* Tab 2: Picture Border Customizer */}
        {activeTab === 'border' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', flexWrap: 'wrap' }}>
            {/* Border Thickness */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-muted)' }}>Width:</span>
              {[0, 1, 2, 4, 6].map(w => (
                <button
                  key={w}
                  type="button"
                  onClick={() => updateFormat({ borderWidth: w })}
                  style={{
                    padding: '0.2rem 0.5rem',
                    fontSize: '0.74rem',
                    fontWeight: format.borderWidth === w ? 700 : 500,
                    borderRadius: 'var(--radius-sm)',
                    border: `1px solid ${format.borderWidth === w ? 'var(--color-secondary)' : 'var(--color-border)'}`,
                    backgroundColor: format.borderWidth === w ? 'var(--color-secondary)' : 'var(--color-surface-alt)',
                    color: format.borderWidth === w ? '#FFF' : 'var(--color-text)',
                    cursor: 'pointer',
                  }}
                >
                  {w === 0 ? 'None' : `${w}px`}
                </button>
              ))}
            </div>

            {/* Border Color */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-muted)' }}>Color:</span>
              {[
                { label: 'Indigo', color: '#6366F1' },
                { label: 'Emerald', color: '#10B981' },
                { label: 'Amber', color: '#F59E0B' },
                { label: 'Rose', color: '#EC4899' },
                { label: 'Slate', color: '#475569' },
                { label: 'White', color: '#FFFFFF' },
                { label: 'Dark', color: '#0F172A' },
              ].map(c => (
                <button
                  key={c.color}
                  type="button"
                  onClick={() => updateFormat({ borderColor: c.color, borderWidth: format.borderWidth === 0 ? 2 : format.borderWidth })}
                  title={c.label}
                  style={{
                    width: '20px',
                    height: '20px',
                    borderRadius: '50%',
                    backgroundColor: c.color,
                    border: format.borderColor === c.color ? '2px solid var(--color-secondary)' : '1px solid var(--color-border)',
                    boxShadow: format.borderColor === c.color ? '0 0 6px var(--color-secondary-glow)' : 'none',
                    cursor: 'pointer',
                  }}
                />
              ))}
            </div>

            {/* Border Dash Style */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-muted)' }}>Pattern:</span>
              {(['solid', 'dashed', 'dotted', 'double'] as const).map(st => (
                <button
                  key={st}
                  type="button"
                  onClick={() => updateFormat({ borderStyle: st, borderWidth: format.borderWidth === 0 ? 2 : format.borderWidth })}
                  style={{
                    padding: '0.2rem 0.5rem',
                    fontSize: '0.74rem',
                    fontWeight: format.borderStyle === st ? 700 : 500,
                    borderRadius: 'var(--radius-sm)',
                    border: `1px solid ${format.borderStyle === st ? 'var(--color-secondary)' : 'var(--color-border)'}`,
                    backgroundColor: format.borderStyle === st ? 'var(--color-secondary)' : 'var(--color-surface-alt)',
                    color: format.borderStyle === st ? '#FFF' : 'var(--color-text)',
                    cursor: 'pointer',
                    textTransform: 'capitalize',
                  }}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Tab 3: Picture Effects & Visual Filters */}
        {activeTab === 'effects' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', flexWrap: 'wrap' }}>
            {/* Color Filter */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-muted)' }}>Color Filter:</span>
              {[
                { id: 'none', label: 'Original' },
                { id: 'grayscale', label: 'B&W Grayscale' },
                { id: 'sepia', label: 'Warm Sepia' },
                { id: 'contrast', label: 'High Contrast' },
                { id: 'vibrant', label: 'Vibrant' },
              ].map(f => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => updateFormat({ filter: f.id as any })}
                  style={{
                    padding: '0.2rem 0.5rem',
                    fontSize: '0.74rem',
                    fontWeight: format.filter === f.id ? 700 : 500,
                    borderRadius: 'var(--radius-sm)',
                    border: `1px solid ${format.filter === f.id ? 'var(--color-secondary)' : 'var(--color-border)'}`,
                    backgroundColor: format.filter === f.id ? 'var(--color-secondary)' : 'var(--color-surface-alt)',
                    color: format.filter === f.id ? '#FFF' : 'var(--color-text)',
                    cursor: 'pointer',
                  }}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {/* Shadow Depth */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-muted)' }}>Shadow:</span>
              {[
                { id: 'none', label: 'Flat' },
                { id: 'subtle', label: 'Soft Shadow' },
                { id: 'deep', label: '3D Deep' },
                { id: 'glow', label: 'Radiant Halo' },
              ].map(sh => (
                <button
                  key={sh.id}
                  type="button"
                  onClick={() => updateFormat({ shadow: sh.id as any })}
                  style={{
                    padding: '0.2rem 0.5rem',
                    fontSize: '0.74rem',
                    fontWeight: format.shadow === sh.id ? 700 : 500,
                    borderRadius: 'var(--radius-sm)',
                    border: `1px solid ${format.shadow === sh.id ? 'var(--color-secondary)' : 'var(--color-border)'}`,
                    backgroundColor: format.shadow === sh.id ? 'var(--color-secondary)' : 'var(--color-surface-alt)',
                    color: format.shadow === sh.id ? '#FFF' : 'var(--color-text)',
                    cursor: 'pointer',
                  }}
                >
                  {sh.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Tab 4: Wrap Text & Alignment Positioning */}
        {activeTab === 'wrap' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-muted)' }}>Text Wrap:</span>
            {[
              { id: 'inline', label: 'In Line Center', icon: AlignCenter },
              { id: 'left', label: 'Wrap Left (Float)', icon: AlignLeft },
              { id: 'right', label: 'Wrap Right (Float)', icon: AlignRight },
              { id: 'break', label: 'Top & Bottom (Break)', icon: Minus },
              { id: 'full', label: 'Full Bleed (100%)', icon: Maximize2 },
            ].map(wp => {
              const Icon = wp.icon;
              const isSelected = format.wrapText === wp.id;
              return (
                <button
                  key={wp.id}
                  type="button"
                  onClick={() => updateFormat({ wrapText: wp.id as any })}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.3rem',
                    padding: '0.3rem 0.65rem',
                    fontSize: '0.76rem',
                    fontWeight: isSelected ? 700 : 500,
                    borderRadius: 'var(--radius-sm)',
                    border: `1px solid ${isSelected ? 'var(--color-secondary)' : 'var(--color-border)'}`,
                    backgroundColor: isSelected ? 'var(--color-secondary)' : 'var(--color-surface-alt)',
                    color: isSelected ? '#FFF' : 'var(--color-text)',
                    cursor: 'pointer',
                  }}
                >
                  <Icon size={13} /> {wp.label}
                </button>
              );
            })}
          </div>
        )}

        {/* Tab 5: Size, Width & Aspect Ratio */}
        {activeTab === 'size' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', flexWrap: 'wrap' }}>
            {/* Width Percentage Quick Buttons */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-muted)' }}>Width:</span>
              {[
                { label: '25%', val: 25 },
                { label: '40%', val: 40 },
                { label: '60%', val: 60 },
                { label: '80%', val: 80 },
                { label: '100%', val: 100 },
              ].map(sz => (
                <button
                  key={sz.val}
                  type="button"
                  onClick={() => updateFormat({ widthPercent: sz.val })}
                  style={{
                    padding: '0.2rem 0.5rem',
                    fontSize: '0.74rem',
                    fontWeight: format.widthPercent === sz.val ? 700 : 500,
                    borderRadius: 'var(--radius-sm)',
                    border: `1px solid ${format.widthPercent === sz.val ? 'var(--color-secondary)' : 'var(--color-border)'}`,
                    backgroundColor: format.widthPercent === sz.val ? 'var(--color-secondary)' : 'var(--color-surface-alt)',
                    color: format.widthPercent === sz.val ? '#FFF' : 'var(--color-text)',
                    cursor: 'pointer',
                  }}
                >
                  {sz.label}
                </button>
              ))}

              <button
                type="button"
                onClick={() => updateFormat({ widthPercent: Math.max(20, format.widthPercent - 5) })}
                style={{
                  padding: '0.2rem 0.4rem',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--color-border)',
                  backgroundColor: 'var(--color-surface-alt)',
                  color: 'var(--color-text)',
                  cursor: 'pointer',
                }}
              >
                <Minus size={12} />
              </button>
              <button
                type="button"
                onClick={() => updateFormat({ widthPercent: Math.min(100, format.widthPercent + 5) })}
                style={{
                  padding: '0.2rem 0.4rem',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--color-border)',
                  backgroundColor: 'var(--color-surface-alt)',
                  color: 'var(--color-text)',
                  cursor: 'pointer',
                }}
              >
                <Plus size={12} />
              </button>
              <span style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--color-secondary)' }}>
                {format.widthPercent}%
              </span>
            </div>

            {/* Corner Radius */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-muted)' }}>Corners:</span>
              {[
                { label: 'Square (0px)', r: 0 },
                { label: 'Rounded (8px)', r: 8 },
                { label: 'Smooth (16px)', r: 16 },
                { label: 'Pill / Circle', r: 9999 },
              ].map(rn => (
                <button
                  key={rn.r}
                  type="button"
                  onClick={() => updateFormat({ borderRadius: rn.r })}
                  style={{
                    padding: '0.2rem 0.5rem',
                    fontSize: '0.74rem',
                    fontWeight: format.borderRadius === rn.r ? 700 : 500,
                    borderRadius: 'var(--radius-sm)',
                    border: `1px solid ${format.borderRadius === rn.r ? 'var(--color-secondary)' : 'var(--color-border)'}`,
                    backgroundColor: format.borderRadius === rn.r ? 'var(--color-secondary)' : 'var(--color-surface-alt)',
                    color: format.borderRadius === rn.r ? '#FFF' : 'var(--color-text)',
                    cursor: 'pointer',
                  }}
                >
                  {rn.label}
                </button>
              ))}
            </div>

            {/* Interactive Crop Tool Launcher */}
            {onCropImage && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', borderLeft: '1px solid var(--color-border)', paddingLeft: '0.75rem' }}>
                <button
                  type="button"
                  onClick={onCropImage}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    padding: '0.3rem 0.75rem',
                    fontSize: '0.76rem',
                    fontWeight: 700,
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: 'var(--color-secondary)',
                    color: '#FFFFFF',
                    border: 'none',
                    cursor: 'pointer',
                    boxShadow: '0 2px 6px var(--color-secondary-glow)',
                  }}
                >
                  <Crop size={14} /> Open Pointer Crop Studio
                </button>

                {onRevertOriginalPhoto && (hasCropHistory || selectedFigure?.querySelector('img')?.hasAttribute('data-crop-state')) && (
                  <button
                    type="button"
                    onClick={onRevertOriginalPhoto}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.3rem',
                      padding: '0.3rem 0.75rem',
                      fontSize: '0.76rem',
                      fontWeight: 700,
                      borderRadius: 'var(--radius-sm)',
                      backgroundColor: 'rgba(245, 158, 11, 0.1)',
                      color: '#d97706',
                      border: '1px solid #d97706',
                      cursor: 'pointer',
                    }}
                  >
                    <Undo2 size={13} /> Restore Full Photo
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
