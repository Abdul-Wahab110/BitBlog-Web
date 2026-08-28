import { Database } from '../config/database';

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
  aeo_faq_enabled: boolean;
  aeo_howto_enabled: boolean;
  geo_organization_name: string;
  geo_publisher_logo?: string;
}

const defaultSettings: SiteSettings = {
  site_name: 'BitBlog CMS',
  site_logo: '',
  site_favicon: '',
  site_description: 'A high-performance digital publication platform and content management system.',
  contact_email: 'editorial@bitblog.com',
  social_facebook: 'https://facebook.com',
  social_twitter: 'https://x.com',
  social_linkedin: 'https://linkedin.com',
  social_youtube: 'https://youtube.com',
  footer_text: '© 2026 BitBlog CMS. All rights reserved.',
  posts_per_page: 10,
  comments_enabled: true,
  newsletter_enabled: true,
  default_seo_title: 'BitBlog CMS - Digital Journal & Publication',
  default_meta_description: 'Discover editorial stories, technology commentary, and curated digital journalism.',
  default_og_image: '',
  default_robots: 'index, follow',
  site_canonical_base_url: process.env.FRONTEND_URL || 'http://localhost:5173',
  aeo_faq_enabled: true,
  aeo_howto_enabled: true,
  geo_organization_name: 'BitBlog Media Corp',
  geo_publisher_logo: '',
};

export class SettingModel {
  public static async getSettings(): Promise<SiteSettings> {
    try {
      const sql = `SELECT setting_key, setting_value FROM site_settings`;
      const rows = await Database.execute<{ SETTING_KEY?: string; setting_key?: string; SETTING_VALUE?: string; setting_value?: string }>(sql, []);
      
      const dbSettings: Record<string, any> = {};
      if (rows && rows.length > 0) {
        for (const row of rows) {
          const key = row.SETTING_KEY || row.setting_key;
          const val = row.SETTING_VALUE || row.setting_value;
          if (key) {
            // Parse boolean/numbers if applicable
            if (val === 'true') dbSettings[key] = true;
            else if (val === 'false') dbSettings[key] = false;
            else if (val !== null && val !== undefined && !isNaN(Number(val)) && val.trim() !== '' && !val.startsWith('http') && !val.includes('@')) {
              dbSettings[key] = Number(val);
            } else {
              dbSettings[key] = val;
            }
          }
        }
      }

      const store = Database.getStore();
      const rawStoreSettings = store.settings || {};
      const parsedStoreSettings: Record<string, any> = {};
      for (const [k, v] of Object.entries(rawStoreSettings)) {
        if (v === 'true') parsedStoreSettings[k] = true;
        else if (v === 'false') parsedStoreSettings[k] = false;
        else if (k === 'posts_per_page') parsedStoreSettings[k] = Number(v) || 10;
        else parsedStoreSettings[k] = v;
      }

      const merged: any = {
        ...defaultSettings,
        ...parsedStoreSettings,
        ...dbSettings,
      };

      if (merged.posts_per_page) merged.posts_per_page = Number(merged.posts_per_page) || 10;
      if (merged.comments_enabled !== undefined) merged.comments_enabled = merged.comments_enabled === true || merged.comments_enabled === 'true';
      if (merged.newsletter_enabled !== undefined) merged.newsletter_enabled = merged.newsletter_enabled === true || merged.newsletter_enabled === 'true';

      return merged;
    } catch {
      const store = Database.getStore();
      const current: Record<string, any> = store.settings || {};
      return {
        ...defaultSettings,
        ...current,
        posts_per_page: Number(current.posts_per_page) || 10,
        comments_enabled: current.comments_enabled === true || current.comments_enabled === 'true',
        newsletter_enabled: current.newsletter_enabled === true || current.newsletter_enabled === 'true',
      };
    }
  }

  public static async updateSettings(data: Partial<SiteSettings>): Promise<SiteSettings> {
    const store = Database.getStore();
    if (!store.settings) store.settings = {};

    // 1. Update In-Memory / File Persistent Store
    for (const [key, value] of Object.entries(data)) {
      if (value !== undefined) {
        store.settings[key] = String(value);
      }
    }
    Database.saveStore();

    // 2. Persist to Oracle SQL site_settings Table
    try {
      for (const [key, value] of Object.entries(data)) {
        if (value !== undefined) {
          const strValue = String(value);
          const checkSql = `SELECT setting_id FROM site_settings WHERE setting_key = :1`;
          const existing = await Database.execute<{ SETTING_ID: number }>(checkSql, [key]);

          if (existing && existing.length > 0) {
            const updateSql = `UPDATE site_settings SET setting_value = :1, updated_at = CURRENT_TIMESTAMP WHERE setting_key = :2`;
            await Database.execute(updateSql, [strValue, key]);
          } else {
            const insertSql = `INSERT INTO site_settings (setting_key, setting_value) VALUES (:1, :2)`;
            await Database.execute(insertSql, [key, strValue]);
          }
        }
      }
    } catch (err) {
      console.warn('Oracle site_settings table sync notice:', err);
    }

    return this.getSettings();
  }
}
