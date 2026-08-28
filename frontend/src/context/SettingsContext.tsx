import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { ApiService } from '../services/api';

export interface SiteSettings {
  site_name: string;
  site_logo?: string;
  site_favicon?: string;
  site_description: string;
  contact_email: string;
  social_facebook?: string;
  social_twitter?: string;
  social_linkedin?: string;
  social_youtube?: string;
  footer_text?: string;
  posts_per_page: number;
  comments_enabled: boolean;
  newsletter_enabled: boolean;
  default_seo_title: string;
  default_meta_description: string;
  default_og_image?: string;
  default_robots: string;
  site_canonical_base_url: string;
  geo_organization_name: string;
  geo_publisher_logo?: string;
}

const defaultSettings: SiteSettings = {
  site_name: 'BitBlog',
  site_logo: '',
  site_favicon: '',
  site_description: 'A high-performance digital publication platform and content management system.',
  contact_email: 'editorial@bitblog.com',
  social_facebook: 'https://facebook.com',
  social_twitter: 'https://x.com',
  social_linkedin: 'https://linkedin.com',
  social_youtube: 'https://youtube.com',
  footer_text: `© ${new Date().getFullYear()} BitBlog. All rights reserved.`,
  posts_per_page: 10,
  comments_enabled: true,
  newsletter_enabled: true,
  default_seo_title: 'BitBlog - Digital Journal & Publication',
  default_meta_description: 'Discover editorial stories, technology commentary, and curated digital journalism.',
  default_og_image: '',
  default_robots: 'index, follow',
  site_canonical_base_url: window.location.origin,
  geo_organization_name: 'BitBlog Media Corp',
  geo_publisher_logo: '',
};

interface SettingsContextType {
  settings: SiteSettings;
  loading: boolean;
  updateSettings: (newSettings: Partial<SiteSettings>) => Promise<any>;
  reloadSettings: () => Promise<void>;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<SiteSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);

  const reloadSettings = useCallback(async () => {
    try {
      const res = await ApiService.getSettings();
      if (res && res.data) {
        setSettings(prev => ({
          ...prev,
          ...res.data,
          comments_enabled: res.data.comments_enabled === true || res.data.comments_enabled === 'true',
          newsletter_enabled: res.data.newsletter_enabled === true || res.data.newsletter_enabled === 'true',
          posts_per_page: Number(res.data.posts_per_page) || 10,
        }));
      }
    } catch (err) {
      console.warn('Could not load site settings from server:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    reloadSettings();
  }, [reloadSettings]);

  // Synchronize browser tab Favicon and Title in real-time
  useEffect(() => {
    // 1. Update Favicon
    if (settings.site_favicon) {
      let faviconLink: HTMLLinkElement | null = document.querySelector("link[rel*='icon']");
      if (!faviconLink) {
        faviconLink = document.createElement('link');
        faviconLink.rel = 'icon';
        document.head.appendChild(faviconLink);
      }
      faviconLink.href = settings.site_favicon;
    }

    // 2. Update Default Document Title
    if (settings.site_name) {
      if (document.title.includes('ModernBlog') || document.title.includes('BitBlog') || document.title === '') {
        document.title = settings.default_seo_title || `${settings.site_name} - Publication & Content Platform`;
      }
    }
  }, [settings.site_favicon, settings.site_name, settings.default_seo_title]);

  const updateSettings = async (newSettings: Partial<SiteSettings>) => {
    // 1. Optimistically update local state so UI reacts instantly
    setSettings(prev => ({
      ...prev,
      ...newSettings,
      comments_enabled: newSettings.comments_enabled !== undefined ? Boolean(newSettings.comments_enabled) : prev.comments_enabled,
      newsletter_enabled: newSettings.newsletter_enabled !== undefined ? Boolean(newSettings.newsletter_enabled) : prev.newsletter_enabled,
      posts_per_page: newSettings.posts_per_page ? Number(newSettings.posts_per_page) : prev.posts_per_page,
    }));

    // 2. Persist to Backend & Database
    const res = await ApiService.updateSettings(newSettings);
    if (res && res.data) {
      setSettings(prev => ({
        ...prev,
        ...res.data,
        comments_enabled: res.data.comments_enabled === true || res.data.comments_enabled === 'true',
        newsletter_enabled: res.data.newsletter_enabled === true || res.data.newsletter_enabled === 'true',
        posts_per_page: Number(res.data.posts_per_page) || 10,
      }));
    }
    return res;
  };

  return (
    <SettingsContext.Provider value={{ settings, loading, updateSettings, reloadSettings }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};
