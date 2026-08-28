import React, { useState, useMemo } from 'react';
import {
  Globe,
  Bot,
  Compass,
  Plus,
  Trash2,
  ChevronDown,
  ChevronUp,
  HelpCircle,
  ListOrdered,
  Layers,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Zap,
  Search,
  Share2,
  Twitter,
  BookOpen,
  Key,
  Link2,
  FileText,
  Image as ImageIcon,
  ShieldCheck,
  Eye,
  Info,
} from 'lucide-react';
import { useSettings } from '../../context/SettingsContext';

export interface SeoData {
  metaTitle?: string;
  metaDescription?: string;
  canonicalUrl?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  twitterTitle?: string;
  twitterDescription?: string;
  twitterImage?: string;
  twitterCard?: 'summary_large_image' | 'summary';
  robots?: string;
  focusKeyword?: string;
  secondaryKeywords?: string;
  searchIntent?: string;
  imageAltText?: string;
}

export interface FaqItem {
  question: string;
  answer: string;
}

export interface HowToStep {
  stepNumber: number;
  title: string;
  text: string;
  image?: string;
}

export interface AeoData {
  directAnswer?: string;
  keyTakeaways?: string;
  faqList?: FaqItem[];
  howToData?: HowToStep[];
}

export interface GeoData {
  locationContext?: string;
  sourceCitations?: string;
  entityContext?: string;
  factualContext?: string;
}

interface SeoAeoGeoEditorProps {
  seo: SeoData;
  onChangeSeo: (seo: SeoData) => void;
  aeo: AeoData;
  onChangeAeo: (aeo: AeoData) => void;
  geo: GeoData;
  onChangeGeo: (geo: GeoData) => void;
  defaultTitle?: string;
  defaultExcerpt?: string;
  defaultImage?: string;
  content?: string;
  slug?: string;
  authorName?: string;
  authorAvatar?: string;
  categoryName?: string;
  tags?: string[];
}

export interface AuditCheck {
  id: string;
  category: 'Technical' | 'Content' | 'Keywords' | 'Images' | 'Links' | 'AEO' | 'GEO' | 'Schema';
  label: string;
  status: 'pass' | 'warning' | 'fail';
  detail: string;
  whyItMatters: string;
  howToFix: string;
}

export const SeoAeoGeoEditor: React.FC<SeoAeoGeoEditorProps> = ({
  seo,
  onChangeSeo,
  aeo,
  onChangeAeo,
  geo,
  onChangeGeo,
  defaultTitle = '',
  defaultExcerpt = '',
  defaultImage = '',
  content = '',
  slug = '',
  authorName = 'Editorial Team',
  authorAvatar = '',
  categoryName = 'Articles',
  tags = [],
}) => {
  const { settings } = useSettings();
  const siteName = settings.site_name || 'BitBlog';
  const siteDomain = settings.site_canonical_base_url ? new URL(settings.site_canonical_base_url).hostname : 'bitblog.com';
  const [activeTab, setActiveTab] = useState<'seo' | 'aeo' | 'geo' | 'previews' | 'audit'>('seo');
  const [previewTab, setPreviewTab] = useState<'google' | 'facebook' | 'twitter'>('google');
  const [isExpanded, setIsExpanded] = useState(true);
  const [filterCategory, setFilterCategory] = useState<string>('all');

  // Input Change Handlers
  const handleSeoChange = (field: keyof SeoData, value: string) => {
    onChangeSeo({ ...seo, [field]: value });
  };

  const handleAeoChange = (field: keyof AeoData, value: any) => {
    onChangeAeo({ ...aeo, [field]: value });
  };

  const handleGeoChange = (field: keyof GeoData, value: string) => {
    onChangeGeo({ ...geo, [field]: value });
  };

  // FAQ Handlers
  const addFaq = () => {
    const list = [...(aeo.faqList || [])];
    list.push({ question: '', answer: '' });
    onChangeAeo({ ...aeo, faqList: list });
  };

  const updateFaq = (index: number, field: 'question' | 'answer', value: string) => {
    const list = [...(aeo.faqList || [])];
    list[index] = { ...list[index], [field]: value };
    onChangeAeo({ ...aeo, faqList: list });
  };

  const removeFaq = (index: number) => {
    const list = (aeo.faqList || []).filter((_, i) => i !== index);
    onChangeAeo({ ...aeo, faqList: list });
  };

  // HowTo Handlers
  const addHowTo = () => {
    const list = [...(aeo.howToData || [])];
    list.push({ stepNumber: list.length + 1, title: '', text: '' });
    onChangeAeo({ ...aeo, howToData: list });
  };

  const updateHowTo = (index: number, field: 'title' | 'text' | 'image', value: string) => {
    const list = [...(aeo.howToData || [])];
    list[index] = { ...list[index], [field]: value };
    onChangeAeo({ ...aeo, howToData: list });
  };

  const removeHowTo = (index: number) => {
    const list = (aeo.howToData || [])
      .filter((_, i) => i !== index)
      .map((s, idx) => ({ ...s, stepNumber: idx + 1 }));
    onChangeAeo({ ...aeo, howToData: list });
  };

  // Plain Text & Content Metrics
  const titleText = (seo.metaTitle || defaultTitle || '').trim();
  const descText = (seo.metaDescription || defaultExcerpt || '').trim();
  const focusKw = (seo.focusKeyword || '').trim().toLowerCase();
  const activeImage = (seo.ogImage || defaultImage || '').trim();
  const imageAlt = (seo.imageAltText || '').trim();

  const plainContent = useMemo(() => {
    return content.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  }, [content]);

  const wordCount = useMemo(() => {
    return plainContent ? plainContent.split(/\s+/).length : 0;
  }, [plainContent]);

  // Headings Analysis
  const headingsCount = useMemo(() => {
    const h1Matches = content.match(/<h1[^>]*>/gi) || [];
    const h2Matches = content.match(/<h2[^>]*>/gi) || [];
    const h3Matches = content.match(/<h3[^>]*>/gi) || [];
    return {
      h1: h1Matches.length,
      h2: h2Matches.length,
      h3: h3Matches.length,
    };
  }, [content]);

  // Links Analysis
  const linksCount = useMemo(() => {
    const hrefs = (content.match(/href=["']([^"']*)["']/gi) || []).map(h => h.toLowerCase());
    const internal = hrefs.filter(h => h.includes('/post/') || h.includes('/category/') || h.includes('/tag/') || h.startsWith('href="/')).length;
    const external = hrefs.filter(h => h.startsWith('href="http') && !h.includes(window.location.hostname)).length;
    return { internal, external };
  }, [content]);

  // Readability Analysis
  const readability = useMemo(() => {
    if (wordCount < 40) return { grade: 'POOR', label: 'Insufficient content for readability check', color: 'var(--color-danger)' };
    const sentences = plainContent.split(/[.!?]+/).filter(Boolean);
    const avgSentenceLength = sentences.length > 0 ? wordCount / sentences.length : wordCount;
    if (avgSentenceLength <= 20 && headingsCount.h2 >= 1) {
      return { grade: 'GOOD', label: 'High readability with balanced sentence and paragraph flow', color: 'var(--color-success)' };
    }
    if (avgSentenceLength <= 26) {
      return { grade: 'NEEDS IMPROVEMENT', label: 'Moderate readability. Consider shorter sentences & bullet lists.', color: '#F59E0B' };
    }
    return { grade: 'POOR', label: 'Long, dense sentences. Break paragraphs into bite-sized points.', color: 'var(--color-danger)' };
  }, [wordCount, plainContent, headingsCount]);

  // Focus Keyword Density & Location
  const keywordAnalysis = useMemo(() => {
    if (!focusKw) {
      return {
        status: 'NONE',
        density: '0%',
        inTitle: false,
        inDesc: false,
        inSlug: false,
        inIntro: false,
        inHeadings: false,
        count: 0,
        label: 'No focus keyword specified',
      };
    }

    const regex = new RegExp(`\\b${focusKw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
    const matches = plainContent.match(regex) || [];
    const count = matches.length;
    const densityNum = wordCount > 0 ? (count / wordCount) * 100 : 0;
    const density = `${densityNum.toFixed(1)}%`;

    const inTitle = titleText.toLowerCase().includes(focusKw);
    const inDesc = descText.toLowerCase().includes(focusKw);
    const inSlug = (slug || '').toLowerCase().includes(focusKw.replace(/\s+/g, '-'));
    
    // First 100 words
    const introSnippet = plainContent.split(/\s+/).slice(0, 100).join(' ').toLowerCase();
    const inIntro = introSnippet.includes(focusKw);

    const inHeadings = (content.match(/<h[23][^>]*>(.*?)<\/h[23]>/gi) || [])
      .some(h => h.toLowerCase().includes(focusKw));

    let status = 'GOOD';
    let label = 'Balanced keyword usage';
    if (count === 0) {
      status = 'LOW';
      label = 'Keyword missing from body copy';
    } else if (densityNum > 3.0) {
      status = 'HIGH';
      label = 'Keyword stuffing detected (> 3.0%)';
    } else if (densityNum < 0.5 && wordCount > 200) {
      status = 'LOW';
      label = 'Keyword density is low (< 0.5%)';
    }

    return {
      status,
      density,
      inTitle,
      inDesc,
      inSlug,
      inIntro,
      inHeadings,
      count,
      label,
    };
  }, [focusKw, plainContent, wordCount, titleText, descText, slug, content]);

  // =========================================================================
  // COMPREHENSIVE WEIGHTED SEO / AEO / GEO SCORING ALGORITHM
  // =========================================================================
  const auditResult = useMemo(() => {
    const checks: AuditCheck[] = [];
    let score = 0;

    // 1. Title Checks (15 pts max)
    const tLen = titleText.length;
    if (tLen >= 45 && tLen <= 65) {
      score += 15;
      checks.push({
        id: 'title-opt',
        category: 'Technical',
        label: 'SEO Title Length',
        status: 'pass',
        detail: `Optimal length (${tLen} characters).`,
        whyItMatters: 'Search engines display 50-60 characters before truncating headlines.',
        howToFix: 'Maintain 45-65 characters with your core proposition.',
      });
    } else if (tLen > 0) {
      score += 8;
      checks.push({
        id: 'title-opt',
        category: 'Technical',
        label: 'SEO Title Length',
        status: 'warning',
        detail: tLen < 45 ? `Short title (${tLen} chars)` : `Long title (${tLen} chars)`,
        whyItMatters: 'Very short titles miss keywords; long titles get clipped on mobile.',
        howToFix: 'Aim for 45-65 characters with front-loaded value.',
      });
    } else {
      checks.push({
        id: 'title-opt',
        category: 'Technical',
        label: 'SEO Title Length',
        status: 'fail',
        detail: 'Title is empty.',
        whyItMatters: 'Title tag is the single most important on-page SEO element.',
        howToFix: 'Enter an engaging title in the Title or SEO Title field.',
      });
    }

    // 2. Meta Description Checks (15 pts max)
    const dLen = descText.length;
    if (dLen >= 120 && dLen <= 165) {
      score += 15;
      checks.push({
        id: 'desc-opt',
        category: 'Technical',
        label: 'Meta Description Length',
        status: 'pass',
        detail: `Optimal summary (${dLen} characters).`,
        whyItMatters: 'Directly influences Click-Through Rate (CTR) from Google search SERPs.',
        howToFix: 'Keep summaries concise, compelling, and under 165 characters.',
      });
    } else if (dLen > 0) {
      score += 7;
      checks.push({
        id: 'desc-opt',
        category: 'Technical',
        label: 'Meta Description Length',
        status: 'warning',
        detail: `Current length: ${dLen} chars (Recommended: 120-165).`,
        whyItMatters: 'Incomplete descriptions lower search snippet engagement.',
        howToFix: 'Expand or condense your summary to 120-165 characters.',
      });
    } else {
      checks.push({
        id: 'desc-opt',
        category: 'Technical',
        label: 'Meta Description Length',
        status: 'fail',
        detail: 'Meta description missing.',
        whyItMatters: 'Without a meta description, Google auto-generates unpredictable snippets.',
        howToFix: 'Write a 2-sentence summary outlining what readers learn.',
      });
    }

    // 3. Focus Keyword Inclusion (15 pts max)
    if (focusKw) {
      let kwPoints = 0;
      if (keywordAnalysis.inTitle) kwPoints += 4;
      if (keywordAnalysis.inDesc) kwPoints += 3;
      if (keywordAnalysis.inSlug) kwPoints += 3;
      if (keywordAnalysis.inIntro) kwPoints += 3;
      if (keywordAnalysis.inHeadings) kwPoints += 2;
      score += kwPoints;

      checks.push({
        id: 'kw-usage',
        category: 'Keywords',
        label: `Focus Keyword: "${focusKw}"`,
        status: kwPoints >= 10 ? 'pass' : kwPoints >= 5 ? 'warning' : 'fail',
        detail: `Found in ${[
          keywordAnalysis.inTitle && 'Title',
          keywordAnalysis.inDesc && 'Meta Desc',
          keywordAnalysis.inSlug && 'Slug',
          keywordAnalysis.inIntro && 'Intro',
          keywordAnalysis.inHeadings && 'Subheadings',
        ].filter(Boolean).join(', ') || 'nowhere yet'}. Density: ${keywordAnalysis.density}.`,
        whyItMatters: 'Search engines correlate consistent keyword placement with topic relevance.',
        howToFix: 'Naturally weave your keyword into the title, first 100 words, and an H2 heading.',
      });
    } else {
      checks.push({
        id: 'kw-usage',
        category: 'Keywords',
        label: 'Focus Keyword',
        status: 'warning',
        detail: 'No focus keyword entered.',
        whyItMatters: 'Keyword tracking enables on-page relevance auditing.',
        howToFix: 'Enter your target keyword in the Focus Keyword field.',
      });
    }

    // 4. URL Slug & Canonical (10 pts max)
    const cleanSlug = (slug || '').trim();
    if (cleanSlug && /^[a-z0-9-]+$/.test(cleanSlug)) {
      score += 10;
      checks.push({
        id: 'slug-check',
        category: 'Technical',
        label: 'Clean URL Slug',
        status: 'pass',
        detail: `Slug /post/${cleanSlug} is clean & URL-safe.`,
        whyItMatters: 'Human-readable, lowercase hyphens improve crawlability and shareability.',
        howToFix: 'Keep slugs lowercase with hyphens separating key terms.',
      });
    } else if (cleanSlug) {
      score += 5;
      checks.push({
        id: 'slug-check',
        category: 'Technical',
        label: 'Clean URL Slug',
        status: 'warning',
        detail: 'Slug contains uppercase or special characters.',
        whyItMatters: 'Non-standard slugs can cause duplicate indexation or broken links.',
        howToFix: 'Use only lowercase letters, numbers, and dashes.',
      });
    } else {
      checks.push({
        id: 'slug-check',
        category: 'Technical',
        label: 'Clean URL Slug',
        status: 'fail',
        detail: 'Slug is missing.',
        whyItMatters: 'A valid slug is required to generate the article permalink.',
        howToFix: 'Provide an article title to auto-generate a clean slug.',
      });
    }

    // 5. Content Depth & Structure (15 pts max)
    if (wordCount >= 300) {
      score += 15;
      checks.push({
        id: 'content-depth',
        category: 'Content',
        label: 'Content Word Count',
        status: 'pass',
        detail: `Comprehensive depth (${wordCount} words).`,
        whyItMatters: 'In-depth articles satisfy user search intent and rank higher.',
        howToFix: 'Maintain thorough research and clear explanations.',
      });
    } else if (wordCount >= 100) {
      score += 8;
      checks.push({
        id: 'content-depth',
        category: 'Content',
        label: 'Content Word Count',
        status: 'warning',
        detail: `Short article (${wordCount} words). Recommended >= 300 words.`,
        whyItMatters: 'Thin content may struggle to compete for high-intent search terms.',
        howToFix: 'Elaborate on key points, examples, and practical tips.',
      });
    } else {
      checks.push({
        id: 'content-depth',
        category: 'Content',
        label: 'Content Word Count',
        status: 'fail',
        detail: `Thin content (${wordCount} words).`,
        whyItMatters: 'Search engines de-index thin articles that provide minimal value.',
        howToFix: 'Write at least 150-300 words of informative content.',
      });
    }

    // 6. Featured Image & ALT Text (10 pts max)
    if (activeImage) {
      if (imageAlt && imageAlt.length >= 4) {
        score += 10;
        checks.push({
          id: 'img-alt-check',
          category: 'Images',
          label: 'Featured Image & ALT Text',
          status: 'pass',
          detail: 'Cover image set with descriptive ALT text.',
          whyItMatters: 'ALT text powers image search and screen reader accessibility.',
          howToFix: 'Ensure ALT text accurately describes the image visual.',
        });
      } else {
        score += 5;
        checks.push({
          id: 'img-alt-check',
          category: 'Images',
          label: 'Featured Image ALT Text Missing',
          status: 'warning',
          detail: 'Image is uploaded, but ALT description is empty.',
          whyItMatters: 'Missing ALT attributes trigger accessibility and Image SEO penalties.',
          howToFix: 'Fill in the "Featured Image ALT Text" field.',
        });
      }
    } else {
      checks.push({
        id: 'img-alt-check',
        category: 'Images',
        label: 'Featured Image',
        status: 'fail',
        detail: 'No featured cover image uploaded.',
        whyItMatters: 'Rich social cards (Open Graph / Twitter) require a visual image.',
        howToFix: 'Upload a high-resolution cover image.',
      });
    }

    // 7. AEO Direct Answer & FAQs (10 pts max)
    const directAns = (aeo.directAnswer || '').trim();
    const validFaqs = (aeo.faqList || []).filter(f => f.question.trim() && f.answer.trim());
    if (directAns.length >= 35 && validFaqs.length >= 1) {
      score += 10;
      checks.push({
        id: 'aeo-signals',
        category: 'AEO',
        label: 'Answer Engine Optimization (AEO)',
        status: 'pass',
        detail: `Direct answer defined (${directAns.length} chars) + ${validFaqs.length} FAQ item(s).`,
        whyItMatters: 'Powers instant direct answers on Perplexity, ChatGPT, and Gemini.',
        howToFix: 'Keep answers concise and strictly factual.',
      });
    } else if (directAns.length >= 35 || validFaqs.length >= 1) {
      score += 6;
      checks.push({
        id: 'aeo-signals',
        category: 'AEO',
        label: 'AEO Partial Setup',
        status: 'warning',
        detail: directAns ? 'Direct answer set; add FAQs for richer FAQPage schema.' : 'FAQs added; provide a 1-2 sentence Direct Answer.',
        whyItMatters: 'AI answer engines extract concise summaries for voice & chat answers.',
        howToFix: 'Complete both the Direct Answer and FAQ sections in the AEO tab.',
      });
    } else {
      checks.push({
        id: 'aeo-signals',
        category: 'AEO',
        label: 'AEO Answer Signals',
        status: 'warning',
        detail: 'No Direct Answer or FAQs configured.',
        whyItMatters: 'AI engines favor articles with explicit answers and Q&A blocks.',
        howToFix: 'Switch to the AEO tab and fill in a 1-2 sentence Direct Answer.',
      });
    }

    // 8. GEO Citations & Knowledge Graph (10 pts max)
    const citations = (geo.sourceCitations || '').trim();
    const entities = (geo.entityContext || '').trim();
    if (citations.length >= 10 || entities.length >= 8) {
      score += 10;
      checks.push({
        id: 'geo-signals',
        category: 'GEO',
        label: 'Generative AI Context (GEO)',
        status: 'pass',
        detail: `Citations & named entities (${entities || 'Standards'}) linked.`,
        whyItMatters: 'Grounds your content in verifiable Knowledge Graph entities.',
        howToFix: 'List primary standards, research docs, and domain concepts.',
      });
    } else {
      checks.push({
        id: 'geo-signals',
        category: 'GEO',
        label: 'GEO Citations & Entities',
        status: 'warning',
        detail: 'No external citations or named entities defined.',
        whyItMatters: 'Generative engines value grounded sources to prevent hallucinations.',
        howToFix: 'Add reference sources or primary entities in the GEO tab.',
      });
    }

    const finalScore = Math.min(100, Math.max(0, score));
    return { score: finalScore, checks };
  }, [
    titleText,
    descText,
    focusKw,
    keywordAnalysis,
    slug,
    wordCount,
    activeImage,
    imageAlt,
    aeo,
    geo,
  ]);

  // Small Circular Score Color (Red: 0-49, Yellow: 50-79, Green: 80-100)
  const score = auditResult.score;
  const scoreTier = useMemo(() => {
    if (score >= 80) {
      return {
        color: '#10B981', // Emerald Green
        bg: 'rgba(16, 185, 129, 0.12)',
        border: 'rgba(16, 185, 129, 0.35)',
        label: 'OPTIMAL',
        badgeText: 'Green (80-100)',
      };
    }
    if (score >= 50) {
      return {
        color: '#F59E0B', // Amber Yellow
        bg: 'rgba(245, 158, 11, 0.12)',
        border: 'rgba(245, 158, 11, 0.35)',
        label: 'NEEDS WORK',
        badgeText: 'Yellow (50-79)',
      };
    }
    return {
      color: '#EF4444', // Crimson Red
      bg: 'rgba(239, 68, 68, 0.12)',
      border: 'rgba(239, 68, 68, 0.35)',
      label: 'POOR',
      badgeText: 'Red (0-49)',
    };
  }, [score]);

  // SVG Circular Gauge Calculations (Radius = 24, Circumference ~ 150.8)
  const radius = 24;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  // Filtered Checklist
  const filteredChecks = useMemo(() => {
    if (filterCategory === 'all') return auditResult.checks;
    return auditResult.checks.filter(c => c.category.toLowerCase() === filterCategory.toLowerCase());
  }, [auditResult.checks, filterCategory]);

  return (
    <div
      style={{
        backgroundColor: 'var(--color-card)',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--color-border)',
        boxShadow: 'var(--shadow-sm)',
        overflow: 'hidden',
        marginTop: '1.5rem',
        width: '100%',
      }}
    >
      {/* Top Header Bar with Small Circular Score Indicator */}
      <div
        style={{
          padding: '0.85rem 1.25rem',
          backgroundColor: 'var(--color-surface-alt)',
          borderBottom: isExpanded ? '1px solid var(--color-border)' : 'none',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '0.75rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          {/* Small Professional Circular Score Indicator */}
          <div
            title={`Live SEO Score: ${score}/100 (${scoreTier.label})`}
            style={{
              position: 'relative',
              width: '58px',
              height: '58px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <svg width="58" height="58" viewBox="0 0 58 58" style={{ transform: 'rotate(-90deg)' }}>
              {/* Background Track */}
              <circle
                cx="29"
                cy="29"
                r={radius}
                fill="transparent"
                stroke="var(--color-border)"
                strokeWidth="4.5"
              />
              {/* Animated Live Value Ring */}
              <circle
                cx="29"
                cy="29"
                r={radius}
                fill="transparent"
                stroke={scoreTier.color}
                strokeWidth="4.5"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                style={{ transition: 'stroke-dashoffset 0.4s ease, stroke 0.3s ease' }}
              />
            </svg>

            {/* Inner Circular Score Content */}
            <div
              style={{
                position: 'absolute',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                lineHeight: 1,
              }}
            >
              <span style={{ fontSize: '0.95rem', fontWeight: 900, color: scoreTier.color }}>
                {score}
              </span>
              <span style={{ fontSize: '0.55rem', fontWeight: 800, color: 'var(--color-text-secondary)', letterSpacing: '0.5px' }}>
                SEO
              </span>
            </div>
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
              <h3 style={{ fontSize: '0.95rem', fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <Sparkles size={16} color="var(--color-secondary)" /> Professional SEO + AEO + GEO System
              </h3>
              <span
                style={{
                  fontSize: '0.72rem',
                  fontWeight: 800,
                  padding: '0.15rem 0.5rem',
                  borderRadius: 'var(--radius-full)',
                  backgroundColor: scoreTier.bg,
                  color: scoreTier.color,
                  border: `1px solid ${scoreTier.border}`,
                }}
              >
                Score: {score}/100 • {scoreTier.label}
              </span>
            </div>
            <p style={{ fontSize: '0.76rem', color: 'var(--color-text-secondary)', margin: 0, marginTop: '2px' }}>
              Real-time on-page optimization for Google Search, ChatGPT, Perplexity & Gemini
            </p>
          </div>
        </div>

        {/* Expand / Collapse Button */}
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          aria-label={isExpanded ? 'Collapse SEO Settings' : 'Expand SEO Settings'}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.35rem',
            padding: '0.35rem 0.65rem',
            fontSize: '0.78rem',
            fontWeight: 600,
            borderRadius: 'var(--radius-sm)',
            backgroundColor: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            color: 'var(--color-text)',
            cursor: 'pointer',
          }}
        >
          {isExpanded ? (
            <>Collapse <ChevronUp size={14} /></>
          ) : (
            <>Expand Settings <ChevronDown size={14} /></>
          )}
        </button>
      </div>

      {isExpanded && (
        <div style={{ padding: '1.25rem' }}>
          {/* Quick Metrics Bar: Keyword, Readability & Word Count */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: '0.75rem',
              marginBottom: '1.25rem',
              backgroundColor: 'var(--color-surface)',
              padding: '0.75rem 1rem',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--color-border)',
            }}
          >
            <div>
              <span style={{ fontSize: '0.72rem', color: 'var(--color-muted)', display: 'block', fontWeight: 600, textTransform: 'uppercase' }}>
                Word Count
              </span>
              <strong style={{ fontSize: '0.9rem', color: wordCount >= 300 ? 'var(--color-success)' : '#F59E0B' }}>
                {wordCount} words {wordCount >= 300 ? '✓' : '(Aim for 300+)'}
              </strong>
            </div>

            <div>
              <span style={{ fontSize: '0.72rem', color: 'var(--color-muted)', display: 'block', fontWeight: 600, textTransform: 'uppercase' }}>
                Readability
              </span>
              <strong style={{ fontSize: '0.9rem', color: readability.color }}>
                {readability.grade}
              </strong>
            </div>

            <div>
              <span style={{ fontSize: '0.72rem', color: 'var(--color-muted)', display: 'block', fontWeight: 600, textTransform: 'uppercase' }}>
                Keyword Density
              </span>
              <strong style={{ fontSize: '0.9rem', color: keywordAnalysis.status === 'GOOD' ? 'var(--color-success)' : keywordAnalysis.status === 'HIGH' ? 'var(--color-danger)' : '#F59E0B' }}>
                {keywordAnalysis.density} ({keywordAnalysis.status})
              </strong>
            </div>

            <div>
              <span style={{ fontSize: '0.72rem', color: 'var(--color-muted)', display: 'block', fontWeight: 600, textTransform: 'uppercase' }}>
                Internal / External Links
              </span>
              <strong style={{ fontSize: '0.9rem', color: 'var(--color-text)' }}>
                {linksCount.internal} internal • {linksCount.external} external
              </strong>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div
            style={{
              display: 'flex',
              gap: '0.4rem',
              borderBottom: '1px solid var(--color-border)',
              paddingBottom: '0.65rem',
              marginBottom: '1.25rem',
              flexWrap: 'wrap',
            }}
          >
            <button
              type="button"
              onClick={() => setActiveTab('seo')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                padding: '0.45rem 0.85rem',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.82rem',
                fontWeight: activeTab === 'seo' ? 700 : 500,
                backgroundColor: activeTab === 'seo' ? 'var(--color-secondary)' : 'var(--color-background)',
                color: activeTab === 'seo' ? '#FFFFFF' : 'var(--color-text)',
                border: '1px solid var(--color-border)',
                cursor: 'pointer',
              }}
            >
              <Globe size={14} /> 1. SEO & Metadata
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('aeo')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                padding: '0.45rem 0.85rem',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.82rem',
                fontWeight: activeTab === 'aeo' ? 700 : 500,
                backgroundColor: activeTab === 'aeo' ? 'var(--color-secondary)' : 'var(--color-background)',
                color: activeTab === 'aeo' ? '#FFFFFF' : 'var(--color-text)',
                border: '1px solid var(--color-border)',
                cursor: 'pointer',
              }}
            >
              <Bot size={14} /> 2. AEO (Answer Engines)
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('geo')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                padding: '0.45rem 0.85rem',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.82rem',
                fontWeight: activeTab === 'geo' ? 700 : 500,
                backgroundColor: activeTab === 'geo' ? 'var(--color-secondary)' : 'var(--color-background)',
                color: activeTab === 'geo' ? '#FFFFFF' : 'var(--color-text)',
                border: '1px solid var(--color-border)',
                cursor: 'pointer',
              }}
            >
              <Compass size={14} /> 3. GEO (Knowledge & Context)
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('previews')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                padding: '0.45rem 0.85rem',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.82rem',
                fontWeight: activeTab === 'previews' ? 700 : 500,
                backgroundColor: activeTab === 'previews' ? 'var(--color-secondary)' : 'var(--color-background)',
                color: activeTab === 'previews' ? '#FFFFFF' : 'var(--color-text)',
                border: '1px solid var(--color-border)',
                cursor: 'pointer',
              }}
            >
              <Eye size={14} /> Social & SERP Previews
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('audit')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                padding: '0.45rem 0.85rem',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.82rem',
                fontWeight: activeTab === 'audit' ? 700 : 500,
                backgroundColor: activeTab === 'audit' ? 'var(--color-secondary)' : 'var(--color-background)',
                color: activeTab === 'audit' ? '#FFFFFF' : 'var(--color-text)',
                border: '1px solid var(--color-border)',
                cursor: 'pointer',
              }}
            >
              <Zap size={14} /> Audit Checklist ({auditResult.checks.length})
            </button>
          </div>

          {/* TAB 1: SEO & METADATA */}
          {activeTab === 'seo' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {/* Focus Keyword & Search Intent */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
                <div>
                  <label htmlFor="seo-focus-kw" style={{ display: 'block', fontWeight: 600, marginBottom: '0.25rem', fontSize: '0.83rem' }}>
                    Focus Keyword (Target Search Term)
                  </label>
                  <input
                    id="seo-focus-kw"
                    type="text"
                    value={seo.focusKeyword || ''}
                    onChange={e => handleSeoChange('focusKeyword', e.target.value)}
                    placeholder="e.g. Oracle Database 23c"
                    style={{ width: '100%', padding: '0.55rem 0.75rem', fontSize: '0.85rem' }}
                  />
                </div>

                <div>
                  <label htmlFor="seo-secondary-kw" style={{ display: 'block', fontWeight: 600, marginBottom: '0.25rem', fontSize: '0.83rem' }}>
                    Secondary Keywords (Comma separated)
                  </label>
                  <input
                    id="seo-secondary-kw"
                    type="text"
                    value={seo.secondaryKeywords || ''}
                    onChange={e => handleSeoChange('secondaryKeywords', e.target.value)}
                    placeholder="e.g. database schema, relational queries, ACID"
                    style={{ width: '100%', padding: '0.55rem 0.75rem', fontSize: '0.85rem' }}
                  />
                </div>

                <div>
                  <label htmlFor="seo-search-intent" style={{ display: 'block', fontWeight: 600, marginBottom: '0.25rem', fontSize: '0.83rem' }}>
                    Search Intent
                  </label>
                  <select
                    id="seo-search-intent"
                    value={seo.searchIntent || 'informational'}
                    onChange={e => handleSeoChange('searchIntent', e.target.value)}
                    style={{ width: '100%', padding: '0.55rem 0.75rem', fontSize: '0.85rem' }}
                  >
                    <option value="informational">Informational (Guides, Tutorials, Answers)</option>
                    <option value="commercial">Commercial (Product Comparisons, Reviews)</option>
                    <option value="transactional">Transactional (Signups, Downloads)</option>
                    <option value="navigational">Navigational (Brand, Portal Links)</option>
                  </select>
                </div>
              </div>

              {/* SEO Title */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                  <label htmlFor="seo-meta-title" style={{ fontWeight: 600, fontSize: '0.83rem' }}>
                    SEO Meta Title (Target: 45-65 chars)
                  </label>
                  <span style={{ fontSize: '0.75rem', fontWeight: 600, color: titleText.length >= 45 && titleText.length <= 65 ? 'var(--color-success)' : titleText.length > 65 ? 'var(--color-danger)' : '#F59E0B' }}>
                    {titleText.length} / 60 characters
                  </span>
                </div>
                <input
                  id="seo-meta-title"
                  type="text"
                  value={seo.metaTitle || ''}
                  onChange={e => handleSeoChange('metaTitle', e.target.value)}
                  placeholder={defaultTitle || 'Compelling search title with target keywords'}
                  maxLength={75}
                  style={{ width: '100%', padding: '0.55rem 0.75rem', fontSize: '0.85rem' }}
                />
              </div>

              {/* Meta Description */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                  <label htmlFor="seo-meta-desc" style={{ fontWeight: 600, fontSize: '0.83rem' }}>
                    Meta Description (Target: 120-165 chars)
                  </label>
                  <span style={{ fontSize: '0.75rem', fontWeight: 600, color: descText.length >= 120 && descText.length <= 165 ? 'var(--color-success)' : descText.length > 165 ? 'var(--color-danger)' : '#F59E0B' }}>
                    {descText.length} / 160 characters
                  </span>
                </div>
                <textarea
                  id="seo-meta-desc"
                  rows={2}
                  value={seo.metaDescription || ''}
                  onChange={e => handleSeoChange('metaDescription', e.target.value)}
                  placeholder={defaultExcerpt || 'Brief, persuasive summary designed to maximize click-through rate in search results.'}
                  maxLength={180}
                  style={{ width: '100%', padding: '0.55rem 0.75rem', fontSize: '0.85rem', resize: 'vertical' }}
                />
              </div>

              {/* Image ALT Text & Canonical */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
                <div>
                  <label htmlFor="seo-img-alt" style={{ display: 'block', fontWeight: 600, marginBottom: '0.25rem', fontSize: '0.83rem' }}>
                    Featured Image ALT Text (Accessibility & Image SEO)
                  </label>
                  <input
                    id="seo-img-alt"
                    type="text"
                    value={seo.imageAltText || ''}
                    onChange={e => handleSeoChange('imageAltText', e.target.value)}
                    placeholder="Descriptive explanation of featured cover photo"
                    style={{ width: '100%', padding: '0.55rem 0.75rem', fontSize: '0.85rem' }}
                  />
                </div>

                <div>
                  <label htmlFor="seo-canonical" style={{ display: 'block', fontWeight: 600, marginBottom: '0.25rem', fontSize: '0.83rem' }}>
                    Canonical URL (Optional override)
                  </label>
                  <input
                    id="seo-canonical"
                    type="url"
                    value={seo.canonicalUrl || ''}
                    onChange={e => handleSeoChange('canonicalUrl', e.target.value)}
                    placeholder={`https://${siteDomain}/post/article-slug`}
                    style={{ width: '100%', padding: '0.55rem 0.75rem', fontSize: '0.85rem' }}
                  />
                </div>

                <div>
                  <label htmlFor="seo-robots" style={{ display: 'block', fontWeight: 600, marginBottom: '0.25rem', fontSize: '0.83rem' }}>
                    Robots Index Directive
                  </label>
                  <select
                    id="seo-robots"
                    value={seo.robots || 'index, follow'}
                    onChange={e => handleSeoChange('robots', e.target.value)}
                    style={{ width: '100%', padding: '0.55rem 0.75rem', fontSize: '0.85rem' }}
                  >
                    <option value="index, follow">index, follow (Allow Search Indexing)</option>
                    <option value="noindex, follow">noindex, follow (Hide from Search)</option>
                    <option value="noindex, nofollow">noindex, nofollow (Private)</option>
                  </select>
                </div>
              </div>

              {/* Social Open Graph & Twitter */}
              <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '1rem', marginTop: '0.5rem' }}>
                <h4 style={{ fontSize: '0.88rem', fontWeight: 700, marginBottom: '0.65rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Layers size={14} /> Open Graph & Twitter/X Social Cards
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
                  <div>
                    <label htmlFor="seo-og-title" style={{ display: 'block', fontWeight: 600, marginBottom: '0.25rem', fontSize: '0.8rem' }}>OG / Twitter Title</label>
                    <input
                      id="seo-og-title"
                      type="text"
                      value={seo.ogTitle || ''}
                      onChange={e => handleSeoChange('ogTitle', e.target.value)}
                      placeholder={defaultTitle}
                      style={{ width: '100%', padding: '0.5rem 0.75rem', fontSize: '0.82rem' }}
                    />
                  </div>
                  <div>
                    <label htmlFor="seo-og-image" style={{ display: 'block', fontWeight: 600, marginBottom: '0.25rem', fontSize: '0.8rem' }}>OG Image URL</label>
                    <input
                      id="seo-og-image"
                      type="text"
                      value={seo.ogImage || ''}
                      onChange={e => handleSeoChange('ogImage', e.target.value)}
                      placeholder={defaultImage || '/uploads/cover.jpg'}
                      style={{ width: '100%', padding: '0.5rem 0.75rem', fontSize: '0.82rem' }}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: AEO SETTINGS */}
          {activeTab === 'aeo' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label htmlFor="aeo-direct-answer" style={{ display: 'block', fontWeight: 600, marginBottom: '0.25rem', fontSize: '0.83rem' }}>
                  Direct Answer / Featured Snippet Summary (40-350 chars)
                </label>
                <textarea
                  id="aeo-direct-answer"
                  rows={2}
                  value={aeo.directAnswer || ''}
                  onChange={e => handleAeoChange('directAnswer', e.target.value)}
                  placeholder="A concise 1-2 sentence direct factual answer that AI engines (Perplexity, ChatGPT, Gemini, Copilot) can quote verbatim."
                  style={{ width: '100%', padding: '0.55rem 0.75rem', fontSize: '0.85rem' }}
                />
              </div>

              <div>
                <label htmlFor="aeo-takeaways" style={{ display: 'block', fontWeight: 600, marginBottom: '0.25rem', fontSize: '0.83rem' }}>
                  Key Takeaways (Bullet points for AI extraction)
                </label>
                <textarea
                  id="aeo-takeaways"
                  rows={2}
                  value={aeo.keyTakeaways || ''}
                  onChange={e => handleAeoChange('keyTakeaways', e.target.value)}
                  placeholder="• Core finding 1&#10;• Critical insight 2&#10;• Actionable takeaway 3"
                  style={{ width: '100%', padding: '0.55rem 0.75rem', fontSize: '0.85rem' }}
                />
              </div>

              {/* Dynamic FAQ List */}
              <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.65rem' }}>
                  <div>
                    <h4 style={{ fontSize: '0.88rem', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <HelpCircle size={14} /> Frequently Asked Questions (FAQ Schema)
                    </h4>
                    <span style={{ fontSize: '0.72rem', color: 'var(--color-muted)' }}>
                      Generates valid JSON-LD FAQPage schema for Google search rich snippets.
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={addFaq}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      padding: '0.35rem 0.65rem',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      backgroundColor: 'var(--color-surface)',
                      border: '1px solid var(--color-border)',
                      borderRadius: 'var(--radius-sm)',
                      color: 'var(--color-secondary)',
                      cursor: 'pointer',
                    }}
                  >
                    <Plus size={12} /> Add FAQ Item
                  </button>
                </div>

                {(aeo.faqList || []).length === 0 ? (
                  <p style={{ fontSize: '0.78rem', color: 'var(--color-muted)', fontStyle: 'italic', margin: 0 }}>
                    No FAQs added yet. Click "Add FAQ Item" to include structured Q&A.
                  </p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                    {(aeo.faqList || []).map((faq, index) => (
                      <div
                        key={index}
                        style={{
                          backgroundColor: 'var(--color-surface)',
                          padding: '0.75rem',
                          borderRadius: 'var(--radius-md)',
                          border: '1px solid var(--color-border)',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '0.4rem',
                        }}
                      >
                        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                          <input
                            type="text"
                            value={faq.question}
                            onChange={e => updateFaq(index, 'question', e.target.value)}
                            placeholder={`Question #${index + 1}`}
                            style={{ flex: 1, padding: '0.4rem 0.65rem', fontSize: '0.82rem' }}
                          />
                          <button
                            type="button"
                            onClick={() => removeFaq(index)}
                            aria-label={`Remove FAQ #${index + 1}`}
                            style={{ background: 'transparent', border: 'none', color: 'var(--color-danger)', padding: '0.25rem', cursor: 'pointer' }}
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                        <textarea
                          rows={2}
                          value={faq.answer}
                          onChange={e => updateFaq(index, 'answer', e.target.value)}
                          placeholder="Factual answer..."
                          style={{ width: '100%', padding: '0.4rem 0.65rem', fontSize: '0.82rem' }}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Dynamic How-To Steps */}
              <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.65rem' }}>
                  <div>
                    <h4 style={{ fontSize: '0.88rem', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <ListOrdered size={14} /> How-To Step-by-Step Guide (HowTo Schema)
                    </h4>
                    <span style={{ fontSize: '0.72rem', color: 'var(--color-muted)' }}>
                      Generates valid JSON-LD HowTo schema when steps exist.
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={addHowTo}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      padding: '0.35rem 0.65rem',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      backgroundColor: 'var(--color-surface)',
                      border: '1px solid var(--color-border)',
                      borderRadius: 'var(--radius-sm)',
                      color: 'var(--color-secondary)',
                      cursor: 'pointer',
                    }}
                  >
                    <Plus size={12} /> Add Step
                  </button>
                </div>

                {(aeo.howToData || []).length === 0 ? (
                  <p style={{ fontSize: '0.78rem', color: 'var(--color-muted)', fontStyle: 'italic', margin: 0 }}>
                    No How-To steps defined. Click "Add Step" if this article is a guide.
                  </p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                    {(aeo.howToData || []).map((step, index) => (
                      <div
                        key={index}
                        style={{
                          backgroundColor: 'var(--color-surface)',
                          padding: '0.75rem',
                          borderRadius: 'var(--radius-md)',
                          border: '1px solid var(--color-border)',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '0.4rem',
                        }}
                      >
                        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                          <span style={{ fontWeight: 700, fontSize: '0.78rem', color: 'var(--color-secondary)' }}>
                            Step {index + 1}:
                          </span>
                          <input
                            type="text"
                            value={step.title}
                            onChange={e => updateHowTo(index, 'title', e.target.value)}
                            placeholder="Step Title"
                            style={{ flex: 1, padding: '0.4rem 0.65rem', fontSize: '0.82rem' }}
                          />
                          <button
                            type="button"
                            onClick={() => removeHowTo(index)}
                            aria-label={`Remove Step #${index + 1}`}
                            style={{ background: 'transparent', border: 'none', color: 'var(--color-danger)', padding: '0.25rem', cursor: 'pointer' }}
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                        <textarea
                          rows={2}
                          value={step.text}
                          onChange={e => updateHowTo(index, 'text', e.target.value)}
                          placeholder="Detailed instructions for this step..."
                          style={{ width: '100%', padding: '0.4rem 0.65rem', fontSize: '0.82rem' }}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: GEO SETTINGS */}
          {activeTab === 'geo' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label htmlFor="geo-citations" style={{ display: 'block', fontWeight: 600, marginBottom: '0.25rem', fontSize: '0.83rem' }}>
                  Authoritative Sources & Citations (Research papers, standard docs, primary links)
                </label>
                <textarea
                  id="geo-citations"
                  rows={2}
                  value={geo.sourceCitations || ''}
                  onChange={e => handleGeoChange('sourceCitations', e.target.value)}
                  placeholder="e.g. IEEE Transactions, Oracle Database 23c Documentation, W3C Standards, Gartner Report"
                  style={{ width: '100%', padding: '0.55rem 0.75rem', fontSize: '0.85rem' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
                <div>
                  <label htmlFor="geo-entities" style={{ display: 'block', fontWeight: 600, marginBottom: '0.25rem', fontSize: '0.83rem' }}>
                    Primary Named Entities & Concepts (Knowledge Graph context)
                  </label>
                  <input
                    id="geo-entities"
                    type="text"
                    value={geo.entityContext || ''}
                    onChange={e => handleGeoChange('entityContext', e.target.value)}
                    placeholder="e.g. Oracle Database, React 18, ACID Transactions, Generative AI"
                    style={{ width: '100%', padding: '0.55rem 0.75rem', fontSize: '0.85rem' }}
                  />
                </div>

                <div>
                  <label htmlFor="geo-location" style={{ display: 'block', fontWeight: 600, marginBottom: '0.25rem', fontSize: '0.83rem' }}>
                    Geographic / Regional Context (Optional)
                  </label>
                  <input
                    id="geo-location"
                    type="text"
                    value={geo.locationContext || ''}
                    onChange={e => handleGeoChange('locationContext', e.target.value)}
                    placeholder="e.g. Global / North America / Asia-Pacific"
                    style={{ width: '100%', padding: '0.55rem 0.75rem', fontSize: '0.85rem' }}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="geo-facts" style={{ display: 'block', fontWeight: 600, marginBottom: '0.25rem', fontSize: '0.83rem' }}>
                  Factual Context, Disclosures & Empirical Methodology
                </label>
                <textarea
                  id="geo-facts"
                  rows={2}
                  value={geo.factualContext || ''}
                  onChange={e => handleGeoChange('factualContext', e.target.value)}
                  placeholder="Factual disclosures, empirical testing conditions, methodology, or benchmark specifications."
                  style={{ width: '100%', padding: '0.55rem 0.75rem', fontSize: '0.85rem' }}
                />
              </div>
            </div>
          )}

          {/* TAB 4: SOCIAL & SERP PREVIEWS */}
          {activeTab === 'previews' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setPreviewTab('google')}
                  style={{
                    padding: '0.35rem 0.75rem',
                    fontSize: '0.78rem',
                    fontWeight: 600,
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: previewTab === 'google' ? 'var(--color-secondary)' : 'var(--color-surface)',
                    color: previewTab === 'google' ? '#FFF' : 'var(--color-text)',
                    border: '1px solid var(--color-border)',
                    cursor: 'pointer',
                  }}
                >
                  <Search size={12} style={{ display: 'inline', marginRight: '4px' }} /> Google SERP
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewTab('facebook')}
                  style={{
                    padding: '0.35rem 0.75rem',
                    fontSize: '0.78rem',
                    fontWeight: 600,
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: previewTab === 'facebook' ? 'var(--color-secondary)' : 'var(--color-surface)',
                    color: previewTab === 'facebook' ? '#FFF' : 'var(--color-text)',
                    border: '1px solid var(--color-border)',
                    cursor: 'pointer',
                  }}
                >
                  <Share2 size={12} style={{ display: 'inline', marginRight: '4px' }} /> Open Graph
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewTab('twitter')}
                  style={{
                    padding: '0.35rem 0.75rem',
                    fontSize: '0.78rem',
                    fontWeight: 600,
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: previewTab === 'twitter' ? 'var(--color-secondary)' : 'var(--color-surface)',
                    color: previewTab === 'twitter' ? '#FFF' : 'var(--color-text)',
                    border: '1px solid var(--color-border)',
                    cursor: 'pointer',
                  }}
                >
                  <Twitter size={12} style={{ display: 'inline', marginRight: '4px' }} /> Twitter / X Card
                </button>
              </div>

              {previewTab === 'google' && (
                <div style={{ fontFamily: 'arial, sans-serif', padding: '1rem', backgroundColor: '#FFFFFF', border: '1px solid #dfe1e5', borderRadius: '8px', color: '#202124' }}>
                  <div style={{ fontSize: '0.75rem', color: '#202124', marginBottom: '0.2rem' }}>
                    {window.location.hostname} › post › {slug || 'article-slug'}
                  </div>
                  <div style={{ fontSize: '1.15rem', color: '#1a0dab', textDecoration: 'underline', marginBottom: '0.3rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {titleText || 'Article Title'}
                  </div>
                  <div style={{ fontSize: '0.85rem', color: '#4d5156', lineHeight: 1.4, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {descText || 'Meta description summary will appear here.'}
                  </div>
                </div>
              )}

              {previewTab === 'facebook' && (
                <div style={{ border: '1px solid var(--color-border)', borderRadius: '8px', overflow: 'hidden', backgroundColor: 'var(--color-surface)', maxWidth: '500px' }}>
                  {activeImage ? (
                    <img src={activeImage} alt="OG Preview" style={{ width: '100%', height: '180px', objectFit: 'cover' }} />
                  ) : (
                    <div style={{ height: '140px', backgroundColor: 'var(--color-surface-alt)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-muted)', fontSize: '0.85rem' }}>
                      No Open Graph Image Set
                    </div>
                  )}
                  <div style={{ padding: '0.85rem' }}>
                    <span style={{ fontSize: '0.72rem', color: 'var(--color-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{siteDomain.toUpperCase()}</span>
                    <h5 style={{ fontSize: '0.98rem', fontWeight: 700, margin: '0.25rem 0' }}>{seo.ogTitle || titleText}</h5>
                    <p style={{ fontSize: '0.82rem', color: 'var(--color-text-secondary)', margin: 0 }}>{seo.ogDescription || descText}</p>
                  </div>
                </div>
              )}

              {previewTab === 'twitter' && (
                <div style={{ border: '1px solid var(--color-border)', borderRadius: '12px', overflow: 'hidden', backgroundColor: 'var(--color-surface)', maxWidth: '480px' }}>
                  {activeImage ? (
                    <img src={activeImage} alt="Twitter Card" style={{ width: '100%', height: '180px', objectFit: 'cover' }} />
                  ) : (
                    <div style={{ height: '130px', backgroundColor: 'var(--color-surface-alt)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-muted)', fontSize: '0.82rem' }}>
                      No Twitter Card Image
                    </div>
                  )}
                  <div style={{ padding: '0.75rem 0.85rem' }}>
                    <h5 style={{ fontSize: '0.92rem', fontWeight: 700, margin: 0 }}>{seo.twitterTitle || seo.ogTitle || titleText}</h5>
                    <p style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', margin: '0.2rem 0' }}>{seo.twitterDescription || descText}</p>
                    <span style={{ fontSize: '0.7rem', color: 'var(--color-muted)' }}>{siteDomain}</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 5: COMPACT ACTIONABLE AUDIT CHECKLIST */}
          {activeTab === 'audit' && (
            <div>
              {/* Category Filter Pills */}
              <div style={{ display: 'flex', gap: '0.35rem', marginBottom: '0.85rem', flexWrap: 'wrap' }}>
                {['all', 'Technical', 'Content', 'Keywords', 'Images', 'AEO', 'GEO'].map(cat => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setFilterCategory(cat)}
                    style={{
                      padding: '0.25rem 0.6rem',
                      fontSize: '0.74rem',
                      fontWeight: 600,
                      borderRadius: 'var(--radius-sm)',
                      backgroundColor: filterCategory === cat ? 'var(--color-secondary)' : 'var(--color-surface-alt)',
                      color: filterCategory === cat ? '#FFF' : 'var(--color-text-secondary)',
                      border: '1px solid var(--color-border)',
                      cursor: 'pointer',
                      textTransform: 'capitalize',
                    }}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                {filteredChecks.map(check => {
                  const isPass = check.status === 'pass';
                  const isWarn = check.status === 'warning';
                  return (
                    <div
                      key={check.id}
                      style={{
                        padding: '0.65rem 0.85rem',
                        borderRadius: 'var(--radius-md)',
                        backgroundColor: isPass ? 'rgba(16, 185, 129, 0.05)' : isWarn ? 'rgba(245, 158, 11, 0.06)' : 'rgba(239, 68, 68, 0.06)',
                        border: `1px solid ${isPass ? 'rgba(16, 185, 129, 0.25)' : isWarn ? 'rgba(245, 158, 11, 0.25)' : 'rgba(239, 68, 68, 0.25)'}`,
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '0.55rem',
                      }}
                    >
                      {isPass ? (
                        <CheckCircle2 size={16} color="var(--color-success)" style={{ flexShrink: 0, marginTop: '2px' }} />
                      ) : isWarn ? (
                        <AlertTriangle size={16} color="#D97706" style={{ flexShrink: 0, marginTop: '2px' }} />
                      ) : (
                        <XCircle size={16} color="var(--color-danger)" style={{ flexShrink: 0, marginTop: '2px' }} />
                      )}

                      <div style={{ flex: 1, fontSize: '0.8rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.25rem' }}>
                          <strong style={{ color: 'var(--color-text)' }}>{check.label}</strong>
                          <span style={{ fontSize: '0.7rem', color: 'var(--color-muted)', fontWeight: 600 }}>{check.category}</span>
                        </div>
                        <div style={{ color: 'var(--color-text-secondary)', marginTop: '2px' }}>
                          {check.detail}
                        </div>
                        {!isPass && (
                          <div style={{ marginTop: '4px', fontSize: '0.74rem', color: isWarn ? '#B45309' : 'var(--color-danger)', backgroundColor: 'var(--color-surface)', padding: '0.3rem 0.5rem', borderRadius: 'var(--radius-sm)' }}>
                            <strong>Fix: </strong>{check.howToFix}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
