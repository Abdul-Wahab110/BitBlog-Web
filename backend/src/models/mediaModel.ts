import fs from 'fs';
import path from 'path';
import { Database } from '../config/database';

export interface MediaRecord {
  media_id: number;
  uploaded_by: number;
  file_name: string;
  file_path: string;
  file_type: string;
  file_size: number;
  alt_text?: string;
  created_at: string;
  updated_at: string;
}

export class MediaModel {
  public static async createMedia(data: {
    uploadedBy: number;
    fileName: string;
    filePath: string;
    fileType: string;
    fileSize: number;
    altText?: string;
  }): Promise<MediaRecord> {
    const store = Database.getStore();
    if (!store.media) store.media = [];

    const now = new Date().toISOString();
    const maxId = store.media.reduce((max, m) => Math.max(max, m.media_id), 0);
    const newId = maxId + 1;

    const record: any = {
      media_id: newId,
      filename: data.fileName,
      original_name: data.fileName,
      url: data.filePath,
      mimetype: data.fileType,
      size: data.fileSize,
      alt_text: data.altText,
      uploaded_by: data.uploadedBy,
      created_at: now,
      updated_at: now,
    };

    store.media.push(record);
    Database.saveStore();

    return {
      media_id: newId,
      uploaded_by: data.uploadedBy,
      file_name: data.fileName,
      file_path: data.filePath,
      file_type: data.fileType,
      file_size: data.fileSize,
      alt_text: data.altText,
      created_at: now,
      updated_at: now,
    };
  }

  public static async findAll(search?: string): Promise<MediaRecord[]> {
    const store = Database.getStore();
    let list = [...(store.media || [])];

    if (search && search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(m => (m.filename || '').toLowerCase().includes(q) || (m.alt_text || '').toLowerCase().includes(q));
    }

    list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    return list.map((m: any) => ({
      media_id: m.media_id,
      uploaded_by: m.uploaded_by,
      file_name: m.filename || m.file_name,
      file_path: m.url || m.file_path,
      file_type: m.mimetype || m.file_type || 'image/jpeg',
      file_size: m.size || m.file_size || 0,
      alt_text: m.alt_text,
      created_at: m.created_at,
      updated_at: m.updated_at || m.created_at,
    }));
  }

  public static async findById(id: number): Promise<MediaRecord | null> {
    const store = Database.getStore();
    const m: any = (store.media || []).find(med => med.media_id === id);
    if (!m) return null;
    return {
      media_id: m.media_id,
      uploaded_by: m.uploaded_by,
      file_name: m.filename || m.file_name,
      file_path: m.url || m.file_path,
      file_type: m.mimetype || m.file_type || 'image/jpeg',
      file_size: m.size || m.file_size || 0,
      alt_text: m.alt_text,
      created_at: m.created_at,
      updated_at: m.updated_at || m.created_at,
    };
  }

  public static async updateAltText(id: number, altText: string): Promise<MediaRecord | null> {
    const store = Database.getStore();
    const m = (store.media || []).find(med => med.media_id === id);
    if (!m) return null;

    m.alt_text = altText;
    Database.saveStore();
    return this.findById(id);
  }

  /**
   * Complete Global Cascading Deletion:
   * When any media asset is deleted from Media Library, it is completely removed from:
   * 1. Physical Server Storage (uploads folder)
   * 2. Media Database & Store
   * 3. All Articles / Posts (Featured Cover Images & Inline HTML Images/Videos)
   * 4. User & Author Profiles (Avatar & Profile Images)
   * 5. Categories (Category Cover Banners & Thumbnails)
   * 6. System Settings (Site Logo, Favicon, Default OG Image)
   * 7. Oracle SQL Database Tables
   */
  public static async deleteMedia(id: number): Promise<{ success: boolean; affected: { posts: number; users: number; categories: number; settings: boolean; diskDeleted: boolean } }> {
    const store = Database.getStore();
    const mediaItem: any = (store.media || []).find(m => m.media_id === id);
    
    const affected = {
      posts: 0,
      users: 0,
      categories: 0,
      settings: false,
      diskDeleted: false,
    };

    if (!mediaItem) {
      return { success: false, affected };
    }

    const filePath = mediaItem.url || mediaItem.file_path || '';
    const fileName = mediaItem.filename || mediaItem.file_name || path.basename(filePath);

    // 1. Delete physical file from disk storage
    if (fileName) {
      const possiblePaths = [
        path.join(process.cwd(), 'uploads', fileName),
        path.join(process.cwd(), 'backend', 'uploads', fileName),
        path.join(__dirname, '..', '..', 'uploads', fileName),
        path.join(__dirname, '..', '..', '..', 'uploads', fileName),
      ];

      for (const p of possiblePaths) {
        try {
          if (fs.existsSync(p)) {
            fs.unlinkSync(p);
            affected.diskDeleted = true;
            break;
          }
        } catch (err) {
          console.warn(`[Media Cleanup] Notice: Could not unlink file ${p}:`, err);
        }
      }
    }

    // Helper matcher function
    const isMatchingAsset = (targetUrl?: string | null): boolean => {
      if (!targetUrl || typeof targetUrl !== 'string') return false;
      const t = targetUrl.trim();
      if (!t) return false;
      if (filePath && t === filePath.trim()) return true;
      if (fileName && (t.endsWith(`/${fileName}`) || t.endsWith(`\\${fileName}`) || t === fileName)) return true;
      if (filePath && t.includes(filePath)) return true;
      return false;
    };

    // 2. Cascade Clean: Posts (Featured Images & Inline Body Media)
    if (store.posts && Array.isArray(store.posts)) {
      store.posts.forEach(post => {
        let postChanged = false;

        // Check featured image
        if (isMatchingAsset(post.featured_image)) {
          post.featured_image = undefined;
          postChanged = true;
        }

        // Check and clean inline content images/videos
        if (post.content && typeof post.content === 'string' && fileName) {
          const escapedName = fileName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
          const figureRegex = new RegExp(`<figure[^>]*>.*?<img[^>]*src=["'][^"']*${escapedName}[^"']*["'][^>]*>.*?</figure>`, 'gis');
          const imgRegex = new RegExp(`<img[^>]*src=["'][^"']*${escapedName}[^"']*["'][^>]*>`, 'gis');
          const videoRegex = new RegExp(`<video[^>]*src=["'][^"']*${escapedName}[^"']*["'][^>]*>.*?</video>`, 'gis');
          const mdImgRegex = new RegExp(`!\\[[^\\]]*\\]\\([^)]*${escapedName}[^)]*\\)`, 'gis');

          const newContent = post.content
            .replace(figureRegex, '')
            .replace(imgRegex, '')
            .replace(videoRegex, '')
            .replace(mdImgRegex, '');

          if (newContent !== post.content) {
            post.content = newContent;
            postChanged = true;
          }
        }

        if (postChanged) {
          post.updated_at = new Date().toISOString();
          affected.posts++;
        }
      });
    }

    // 3. Cascade Clean: Users & Authors (Profile Images / Avatars)
    if (store.users && Array.isArray(store.users)) {
      store.users.forEach(user => {
        let userChanged = false;
        if (isMatchingAsset(user.profile_image)) {
          user.profile_image = undefined;
          userChanged = true;
        }
        if (userChanged) {
          user.updated_at = new Date().toISOString();
          affected.users++;
        }
      });
    }

    // 4. Cascade Clean: Categories (Banners & Covers)
    if (store.categories && Array.isArray(store.categories)) {
      store.categories.forEach(cat => {
        let catChanged = false;
        if (isMatchingAsset(cat.image) || isMatchingAsset(cat.image_url)) {
          cat.image = undefined;
          cat.image_url = undefined;
          catChanged = true;
        }
        if (catChanged) {
          cat.updated_at = new Date().toISOString();
          affected.categories++;
        }
      });
    }

    // 5. Cascade Clean: System Settings (Logo, Favicon, OG Image)
    if (store.settings) {
      if (isMatchingAsset(store.settings.site_logo)) {
        store.settings.site_logo = '';
        affected.settings = true;
      }
      if (isMatchingAsset(store.settings.site_favicon)) {
        store.settings.site_favicon = '';
        affected.settings = true;
      }
      if (isMatchingAsset(store.settings.default_og_image)) {
        store.settings.default_og_image = '';
        affected.settings = true;
      }
    }

    // 6. Cascade Clean: SEO Metadata
    if (store.seo && Array.isArray(store.seo)) {
      store.seo.forEach((s: any) => {
        if (isMatchingAsset(s.og_image)) s.og_image = null;
        if (isMatchingAsset(s.twitter_image)) s.twitter_image = null;
      });
    }

    // 7. Remove from Media Library
    store.media = (store.media || []).filter(m => m.media_id !== id);
    Database.saveStore();

    // 8. Oracle SQL Database Clean-up (Graceful Execution)
    try {
      if (fileName) {
        const pattern = `%${fileName}%`;
        await Database.execute(`DELETE FROM media WHERE media_id = :1`, [id]).catch(() => {});
        await Database.execute(`UPDATE posts SET featured_image = NULL WHERE featured_image LIKE :1`, [pattern]).catch(() => {});
        await Database.execute(`UPDATE users SET profile_image = NULL WHERE profile_image LIKE :1`, [pattern]).catch(() => {});
        await Database.execute(`UPDATE categories SET image = NULL WHERE image LIKE :1`, [pattern]).catch(() => {});
        await Database.execute(`UPDATE seo_metadata SET og_image = NULL, twitter_image = NULL WHERE og_image LIKE :1 OR twitter_image LIKE :1`, [pattern, pattern]).catch(() => {});
      }
    } catch (dbErr) {
      console.warn('[Media Cleanup] Oracle DB synchronization notice:', dbErr);
    }

    return { success: true, affected };
  }
}
