import React, { useEffect } from 'react';
import { useSettings } from '../../context/SettingsContext';

export interface BreadcrumbItem {
  name: string;
  url: string;
}

export interface FaqItem {
  question: string;
  answer: string;
}

export interface HowToStep {
  title: string;
  description?: string;
  text?: string;
  image?: string;
}

export interface SeoProps {
  title?: string;
  description?: string;
  canonicalUrl?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  ogType?: 'article' | 'website';
  twitterTitle?: string;
  twitterDescription?: string;
  twitterImage?: string;
  twitterCard?: 'summary_large_image' | 'summary';
  robots?: string;
  focusKeyword?: string;
  type?: 'article' | 'website';
  authorName?: string;
  authorUrl?: string;
  authorAvatar?: string;
  authorRole?: string;
  authorBio?: string;
  publishedAt?: string;
  updatedAt?: string;
  imageAlt?: string;
  directAnswer?: string;
  keyTakeaways?: string;
  faqList?: FaqItem[];
  howToData?: {
    title: string;
    description?: string;
    totalTime?: string;
    steps: HowToStep[];
  };
  breadcrumbs?: BreadcrumbItem[];
}

export const SeoHead: React.FC<SeoProps> = ({
  title,
  description,
  canonicalUrl,
  ogTitle,
  ogDescription,
  ogImage,
  ogType = 'website',
  twitterTitle,
  twitterDescription,
  twitterImage,
  twitterCard = 'summary_large_image',
  robots = 'index, follow',
  focusKeyword,
  type = 'website',
  authorName,
  authorUrl,
  authorAvatar,
  authorRole,
  authorBio,
  publishedAt,
  updatedAt,
  imageAlt,
  directAnswer,
  keyTakeaways,
  faqList = [],
  howToData,
  breadcrumbs = [],
}) => {
  const { settings } = useSettings();
  const siteName = settings.site_name || 'BitBlog';
  const finalTitle = title || settings.default_seo_title || `${siteName} - Digital Journal & Publication`;
  const finalDescription = description || settings.default_meta_description || 'Discover editorial stories, technology commentary, and curated digital journalism.';
  const finalAuthor = authorName || `${siteName} Editorial Team`;
  const currentUrl = canonicalUrl || window.location.href;
  const finalOgTitle = ogTitle || title;
  const finalOgDescription = ogDescription || description;
  const finalTwitterTitle = twitterTitle || finalOgTitle;
  const finalTwitterDescription = twitterDescription || finalOgDescription;
  const finalTwitterImage = twitterImage || ogImage;

  useEffect(() => {

    document.title = finalTitle;

    const updateMeta = (selector: string, attr: string, value: string) => {
      let el = document.querySelector(selector);
      if (!el) {
        el = document.createElement('meta');
        if (selector.includes('property=')) {
          const propName = selector.split('property="')[1]?.replace('"]', '');
          if (propName) el.setAttribute('property', propName);
        } else if (selector.includes('name=')) {
          const metaName = selector.split('name="')[1]?.replace('"]', '');
          if (metaName) el.setAttribute('name', metaName);
        }
        document.head.appendChild(el);
      }
      el.setAttribute(attr, value);
    };

    updateMeta('meta[name="description"]', 'content', finalDescription);
    updateMeta('meta[name="robots"]', 'content', robots);
    if (focusKeyword) {
      updateMeta('meta[name="keywords"]', 'content', focusKeyword);
    }

    let canonicalLink = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.setAttribute('href', currentUrl);

    updateMeta('meta[property="og:title"]', 'content', finalOgTitle || finalTitle);
    updateMeta('meta[property="og:description"]', 'content', finalOgDescription || finalDescription);
    updateMeta('meta[property="og:url"]', 'content', currentUrl);
    updateMeta('meta[property="og:type"]', 'content', ogType || type || 'website');
    updateMeta('meta[property="og:site_name"]', 'content', siteName);
    if (ogImage) {
      updateMeta('meta[property="og:image"]', 'content', ogImage);
      if (imageAlt) {
        updateMeta('meta[property="og:image:alt"]', 'content', imageAlt);
      }
    }

    updateMeta('meta[name="twitter:card"]', 'content', twitterCard);
    updateMeta('meta[name="twitter:title"]', 'content', finalTwitterTitle || finalTitle);
    updateMeta('meta[name="twitter:description"]', 'content', finalTwitterDescription || finalDescription);
    if (finalTwitterImage) {
      updateMeta('meta[name="twitter:image"]', 'content', finalTwitterImage);
      if (imageAlt) {
        updateMeta('meta[name="twitter:image:alt"]', 'content', imageAlt);
      }
    }

    if (type === 'article' || ogType === 'article') {
      if (publishedAt) {
        updateMeta('meta[property="article:published_time"]', 'content', publishedAt);
      }
      if (updatedAt) {
        updateMeta('meta[property="article:modified_time"]', 'content', updatedAt);
      }
      if (finalAuthor) {
        updateMeta('meta[property="article:author"]', 'content', finalAuthor);
      }
    }

    if (directAnswer) {
      updateMeta('meta[name="direct-answer"]', 'content', directAnswer);
    }
    if (keyTakeaways) {
      updateMeta('meta[name="key-takeaways"]', 'content', keyTakeaways);
    }

    const origin = window.location.origin;
    const schemas: any[] = [];

    if (type === 'article' || ogType === 'article') {
      const authorSchema: any = {
        '@type': 'Person',
        name: finalAuthor,
      };
      if (authorUrl) authorSchema.url = authorUrl.startsWith('http') ? authorUrl : `${origin}${authorUrl}`;
      if (authorAvatar) authorSchema.image = authorAvatar;
      if (authorRole) authorSchema.jobTitle = authorRole;
      if (authorBio) authorSchema.description = authorBio;

      schemas.push({
        '@context': 'https://schema.org',
        '@type': 'BlogPosting',
        headline: finalTitle,
        description: finalDescription,
        image: ogImage ? [ogImage] : undefined,
        datePublished: publishedAt,
        dateModified: updatedAt || publishedAt,
        mainEntityOfPage: {
          '@type': 'WebPage',
          '@id': currentUrl,
        },
        author: authorSchema,
        publisher: {
          '@type': 'Organization',
          name: settings.geo_organization_name || `${siteName} Media Corp`,
          logo: {
            '@type': 'ImageObject',
            url: settings.site_logo ? (settings.site_logo.startsWith('http') ? settings.site_logo : `${origin}${settings.site_logo}`) : `${origin}/assets/logo.png`,
          },
        },
      });
    }

    schemas.push({
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: siteName,
      url: origin,
      potentialAction: {
        '@type': 'SearchAction',
        target: `${origin}/search?q={search_term_string}`,
        'query-input': 'required name=search_term_string',
      },
    });

    schemas.push({
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: settings.geo_organization_name || `${siteName} Media Corp`,
      url: origin,
      logo: {
        '@type': 'ImageObject',
        url: settings.site_logo ? (settings.site_logo.startsWith('http') ? settings.site_logo : `${origin}${settings.site_logo}`) : `${origin}/assets/logo.png`,
      },
    });

    if (breadcrumbs && breadcrumbs.length > 0) {
      schemas.push({
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: breadcrumbs.map((b, idx) => ({
          '@type': 'ListItem',
          position: idx + 1,
          name: b.name,
          item: b.url.startsWith('http') ? b.url : `${origin}${b.url}`,
        })),
      });
    }

    const validFaqs = (faqList || []).filter(item => item.question && item.question.trim() && item.answer && item.answer.trim());
    if (validFaqs.length > 0) {
      schemas.push({
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: validFaqs.map(item => ({
          '@type': 'Question',
          name: item.question.trim(),
          acceptedAnswer: {
            '@type': 'Answer',
            text: item.answer.trim(),
          },
        })),
      });
    }

    if (howToData && Array.isArray(howToData.steps) && howToData.steps.length > 0) {
      const validSteps = howToData.steps.filter(s => s.title && s.title.trim());
      if (validSteps.length > 0) {
        schemas.push({
          '@context': 'https://schema.org',
          '@type': 'HowTo',
          name: howToData.title || title,
          description: howToData.description || description,
          totalTime: howToData.totalTime || 'PT15M',
          step: validSteps.map((step, idx) => ({
            '@type': 'HowToStep',
            position: idx + 1,
            name: step.title.trim(),
            text: (step.description || step.text || '').trim(),
            image: step.image || undefined,
          })),
        });
      }
    }

    const oldScripts = document.querySelectorAll('script[data-seo-jsonld="true"]');
    oldScripts.forEach(s => s.remove());

    schemas.forEach(schemaObj => {
      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.setAttribute('data-seo-jsonld', 'true');
      script.text = JSON.stringify(schemaObj);
      document.head.appendChild(script);
    });
  }, [
    title,
    description,
    canonicalUrl,
    ogTitle,
    ogDescription,
    ogImage,
    ogType,
    twitterTitle,
    twitterDescription,
    twitterImage,
    twitterCard,
    robots,
    focusKeyword,
    type,
    authorName,
    authorUrl,
    authorAvatar,
    authorRole,
    authorBio,
    publishedAt,
    updatedAt,
    imageAlt,
    directAnswer,
    keyTakeaways,
    faqList,
    howToData,
    breadcrumbs,
  ]);

  return null;
};

