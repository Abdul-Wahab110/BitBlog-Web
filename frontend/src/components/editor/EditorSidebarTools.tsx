import React, { useState } from 'react';
import {
  CheckCircle2,
  XCircle,
  Clock,
  BookOpen,
  Sparkles,
  BarChart2,
  ListTree,
  CheckSquare,
  Volume2,
  HelpCircle,
  FileText,
  Lightbulb,
  ExternalLink,
  ShieldCheck,
} from 'lucide-react';

interface EditorSidebarToolsProps {
  title: string;
  excerpt: string;
  content: string;
  featuredImage: string;
  categorySelected: boolean;
  tagsCount: number;
  onInsertSnippet?: (html: string) => void;
}

export const EditorSidebarTools: React.FC<EditorSidebarToolsProps> = ({
  title,
  excerpt,
  content,
  featuredImage,
  categorySelected,
  tagsCount,
  onInsertSnippet,
}) => {

  const [checklist, setChecklist] = useState({
    grammarChecked: true,
    citationsAdded: false,
    imageAltVerified: false,
    previewReviewed: false,
  });

  const textOnly = content.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  const words = textOnly ? textOnly.split(' ').length : 0;
  const chars = textOnly.length;
  const readingTime = Math.max(1, Math.ceil(words / 200));
  const speakingTime = Math.max(1, Math.ceil(words / 130));

  const h2Count = (content.match(/<h2/gi) || []).length;
  const h3Count = (content.match(/<h3/gi) || []).length;
  const imageCount = (content.match(/<img/gi) || []).length + (featuredImage ? 1 : 0);
  const paragraphCount = (content.match(/<p/gi) || []).length;

  const headings = Array.from(content.matchAll(/<(h[23])[^>]*>(.*?)<\/\1>/gi)).map((m, idx) => ({
    id: idx,
    level: m[1].toLowerCase(),
    text: m[2].replace(/<[^>]*>/g, '').trim(),
  })).filter(h => h.text.length > 0);

  let healthScore = 0;
  if (title.trim().length >= 10 && title.trim().length <= 90) healthScore += 20;
  else if (title.trim().length > 3) healthScore += 10;

  if (featuredImage.trim()) healthScore += 15;
  if (excerpt.trim().length >= 30) healthScore += 15;
  if (words >= 300) healthScore += 20;
  else if (words >= 100) healthScore += 10;

  if (h2Count >= 1 || h3Count >= 1) healthScore += 10;
  if (categorySelected) healthScore += 10;
  if (tagsCount >= 1) healthScore += 10;

  healthScore = Math.min(100, healthScore);

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'var(--color-success, #10b981)';
    if (score >= 50) return 'var(--color-accent, #f59e0b)';
    return 'var(--color-danger, #ef4444)';
  };

  const getReadabilityGrade = (wordCount: number, pCount: number) => {
    if (wordCount < 50) return { label: 'Drafting', desc: 'Add more content to calculate readability' };
    const avgWordsPerP = wordCount / Math.max(1, pCount);
    if (avgWordsPerP <= 25) return { label: 'Grade 8 (Optimal)', desc: 'Clear, concise, and easy to read' };
    if (avgWordsPerP <= 45) return { label: 'Grade 10 (Standard)', desc: 'Good editorial depth for tech articles' };
    return { label: 'Advanced', desc: 'Consider breaking long paragraphs' };
  };

  const readability = getReadabilityGrade(words, paragraphCount);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', width: '100%' }}>

      <div
        style={{
          backgroundColor: 'var(--color-card)',
          padding: '1.25rem',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--color-border)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem' }}>
          <h3 style={{ fontSize: '0.92rem', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <ShieldCheck size={16} color="var(--color-secondary)" /> Publishing Health
          </h3>
          <span
            style={{
              fontSize: '0.85rem',
              fontWeight: 800,
              color: getScoreColor(healthScore),
              backgroundColor: 'var(--color-surface-alt)',
              padding: '0.2rem 0.55rem',
              borderRadius: 'var(--radius-full)',
              border: `1px solid ${getScoreColor(healthScore)}`,
            }}
          >
            {healthScore} / 100
          </span>
        </div>

        <div style={{ width: '100%', height: '6px', backgroundColor: 'var(--color-surface-alt)', borderRadius: 'var(--radius-full)', overflow: 'hidden', marginBottom: '1rem' }}>
          <div
            style={{
              width: `${healthScore}%`,
              height: '100%',
              backgroundColor: getScoreColor(healthScore),
              transition: 'width 0.3s ease, background-color 0.3s ease',
              borderRadius: 'var(--radius-full)',
            }}
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem', fontSize: '0.78rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: title.length >= 10 ? 'var(--color-success)' : 'var(--color-muted)' }}>
            {title.length >= 10 ? <CheckCircle2 size={13} /> : <XCircle size={13} />}
            <span>Headline length ({title.length}/70 chars)</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: featuredImage ? 'var(--color-success)' : 'var(--color-muted)' }}>
            {featuredImage ? <CheckCircle2 size={13} /> : <XCircle size={13} />}
            <span>Hero Cover Image {featuredImage ? 'Supplied' : 'Missing'}</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: excerpt.length >= 30 ? 'var(--color-success)' : 'var(--color-muted)' }}>
            {excerpt.length >= 30 ? <CheckCircle2 size={13} /> : <XCircle size={13} />}
            <span>Article Excerpt / Summary</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: words >= 300 ? 'var(--color-success)' : 'var(--color-muted)' }}>
            {words >= 300 ? <CheckCircle2 size={13} /> : <XCircle size={13} />}
            <span>Body Length ({words}/300+ words)</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: (h2Count + h3Count) >= 1 ? 'var(--color-success)' : 'var(--color-muted)' }}>
            {(h2Count + h3Count) >= 1 ? <CheckCircle2 size={13} /> : <XCircle size={13} />}
            <span>Section Headings ({h2Count + h3Count} added)</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: tagsCount >= 1 ? 'var(--color-success)' : 'var(--color-muted)' }}>
            {tagsCount >= 1 ? <CheckCircle2 size={13} /> : <XCircle size={13} />}
            <span>Topic Tags ({tagsCount} selected)</span>
          </div>
        </div>
      </div>

      <div
        style={{
          backgroundColor: 'var(--color-card)',
          padding: '1.25rem',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--color-border)',
        }}
      >
        <h3 style={{ fontSize: '0.92rem', fontWeight: 700, marginBottom: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <BarChart2 size={16} color="var(--color-secondary)" /> Content Metrics
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem', marginBottom: '0.85rem' }}>
          <div style={{ padding: '0.6rem', backgroundColor: 'var(--color-surface-alt)', borderRadius: 'var(--radius-sm)' }}>
            <span style={{ display: 'block', fontSize: '0.68rem', color: 'var(--color-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Words</span>
            <span style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--color-text)' }}>{words}</span>
          </div>

          <div style={{ padding: '0.6rem', backgroundColor: 'var(--color-surface-alt)', borderRadius: 'var(--radius-sm)' }}>
            <span style={{ display: 'block', fontSize: '0.68rem', color: 'var(--color-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Reading Time</span>
            <span style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--color-text)' }}>{readingTime} min</span>
          </div>

          <div style={{ padding: '0.6rem', backgroundColor: 'var(--color-surface-alt)', borderRadius: 'var(--radius-sm)' }}>
            <span style={{ display: 'block', fontSize: '0.68rem', color: 'var(--color-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Images / Media</span>
            <span style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--color-text)' }}>{imageCount}</span>
          </div>

          <div style={{ padding: '0.6rem', backgroundColor: 'var(--color-surface-alt)', borderRadius: 'var(--radius-sm)' }}>
            <span style={{ display: 'block', fontSize: '0.68rem', color: 'var(--color-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Speaking Time</span>
            <span style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--color-text)' }}>{speakingTime} min</span>
          </div>
        </div>

        <div style={{ padding: '0.65rem 0.8rem', backgroundColor: 'var(--color-surface-alt)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.2rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text)' }}>Readability Level:</span>
            <span style={{ fontSize: '0.74rem', fontWeight: 800, color: 'var(--color-secondary)' }}>{readability.label}</span>
          </div>
          <p style={{ margin: 0, fontSize: '0.7rem', color: 'var(--color-muted)' }}>{readability.desc}</p>
        </div>
      </div>

      <div
        style={{
          backgroundColor: 'var(--color-card)',
          padding: '1.25rem',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--color-border)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
          <h3 style={{ fontSize: '0.92rem', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <ListTree size={16} color="var(--color-secondary)" /> Article Outline
          </h3>
          <span style={{ fontSize: '0.72rem', color: 'var(--color-muted)', fontWeight: 600 }}>
            {headings.length} sections
          </span>
        </div>

        {headings.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', maxHeight: '160px', overflowY: 'auto' }}>
            {headings.map(h => (
              <div
                key={h.id}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '0.35rem',
                  fontSize: '0.78rem',
                  paddingLeft: h.level === 'h3' ? '0.75rem' : '0',
                  color: h.level === 'h2' ? 'var(--color-text)' : 'var(--color-muted)',
                  fontWeight: h.level === 'h2' ? 600 : 400,
                  lineHeight: 1.4,
                }}
              >
                <span style={{ color: 'var(--color-secondary)', fontWeight: 800 }}>•</span>
                <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{h.text}</span>
              </div>
            ))}
          </div>
        ) : (
          <p style={{ margin: 0, fontSize: '0.76rem', color: 'var(--color-muted)', fontStyle: 'italic' }}>
            Add H2 or H3 headers in the visual editor to see your live article structure outline here.
          </p>
        )}
      </div>

      <div
        style={{
          backgroundColor: 'var(--color-card)',
          padding: '1.25rem',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--color-border)',
        }}
      >
        <h3 style={{ fontSize: '0.92rem', fontWeight: 700, marginBottom: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <CheckSquare size={16} color="var(--color-secondary)" /> Pre-Publish Checklist
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.78rem' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={checklist.grammarChecked}
              onChange={e => setChecklist({ ...checklist, grammarChecked: e.target.checked })}
              style={{ accentColor: 'var(--color-secondary)', cursor: 'pointer' }}
            />
            <span style={{ color: checklist.grammarChecked ? 'var(--color-text)' : 'var(--color-muted)' }}>
              Proofread for spelling & clarity
            </span>
          </label>

          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={checklist.citationsAdded}
              onChange={e => setChecklist({ ...checklist, citationsAdded: e.target.checked })}
              style={{ accentColor: 'var(--color-secondary)', cursor: 'pointer' }}
            />
            <span style={{ color: checklist.citationsAdded ? 'var(--color-text)' : 'var(--color-muted)' }}>
              Sources and external links verified
            </span>
          </label>

          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={checklist.imageAltVerified}
              onChange={e => setChecklist({ ...checklist, imageAltVerified: e.target.checked })}
              style={{ accentColor: 'var(--color-secondary)', cursor: 'pointer' }}
            />
            <span style={{ color: checklist.imageAltVerified ? 'var(--color-text)' : 'var(--color-muted)' }}>
              All images have descriptive captions
            </span>
          </label>

          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={checklist.previewReviewed}
              onChange={e => setChecklist({ ...checklist, previewReviewed: e.target.checked })}
              style={{ accentColor: 'var(--color-secondary)', cursor: 'pointer' }}
            />
            <span style={{ color: checklist.previewReviewed ? 'var(--color-text)' : 'var(--color-muted)' }}>
              Live preview verified on mobile & desktop
            </span>
          </label>
        </div>
      </div>
    </div>
  );
};

