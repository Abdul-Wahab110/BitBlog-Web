import { Database } from '../config/database';
import { SettingModel } from '../models/settingModel';

export class SitemapService {
  public static async generateSitemapXml(): Promise<string> {
    const settings = await SettingModel.getSettings();
    const baseUrl = settings.site_canonical_base_url.replace(/\/$/, '');

    const postsSql = `
      SELECT slug, updated_at, published_at
      FROM posts
      WHERE status = 'published'
      ORDER BY published_at DESC
    `;
    const posts = await Database.execute<{ SLUG: string; UPDATED_AT: string; PUBLISHED_AT: string }>(postsSql, []) || [];

    const categoriesSql = `SELECT slug, updated_at FROM categories ORDER BY name ASC`;
    const categories = await Database.execute<{ SLUG: string; UPDATED_AT: string }>(categoriesSql, []) || [];

    const tagsSql = `SELECT slug FROM tags ORDER BY name ASC`;
    const tags = await Database.execute<{ SLUG: string }>(tagsSql, []) || [];

    const authorsSql = `
      SELECT u.user_id, MAX(u.updated_at) AS updated_at
      FROM users u
      JOIN roles r ON u.role_id = r.role_id
      WHERE r.role_name IN ('Admin', 'Editor', 'Author')
      GROUP BY u.user_id
    `;
    const authors = await Database.execute<{ USER_ID: number; UPDATED_AT: string }>(authorsSql, []) || [];

    const nowIso = new Date().toISOString().split('T')[0];

    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

    const staticPages = [
      { loc: '/', priority: '1.0', changefreq: 'daily' },
      { loc: '/blog', priority: '0.9', changefreq: 'daily' },
      { loc: '/about', priority: '0.6', changefreq: 'monthly' },
      { loc: '/contact', priority: '0.6', changefreq: 'monthly' },
      { loc: '/privacy-policy', priority: '0.3', changefreq: 'yearly' },
      { loc: '/terms', priority: '0.3', changefreq: 'yearly' },
      { loc: '/disclaimer', priority: '0.3', changefreq: 'yearly' },
    ];

    for (const page of staticPages) {
      xml += `  <url>\n`;
      xml += `    <loc>${baseUrl}${page.loc}</loc>\n`;
      xml += `    <lastmod>${nowIso}</lastmod>\n`;
      xml += `    <changefreq>${page.changefreq}</changefreq>\n`;
      xml += `    <priority>${page.priority}</priority>\n`;
      xml += `  </url>\n`;
    }

    for (const p of posts) {
      const lastmod = (p.UPDATED_AT || p.PUBLISHED_AT || nowIso).split('T')[0];
      xml += `  <url>\n`;
      xml += `    <loc>${baseUrl}/post/${p.SLUG}</loc>\n`;
      xml += `    <lastmod>${lastmod}</lastmod>\n`;
      xml += `    <changefreq>weekly</changefreq>\n`;
      xml += `    <priority>0.8</priority>\n`;
      xml += `  </url>\n`;
    }

    for (const c of categories) {
      const lastmod = (c.UPDATED_AT || nowIso).split('T')[0];
      xml += `  <url>\n`;
      xml += `    <loc>${baseUrl}/category/${c.SLUG}</loc>\n`;
      xml += `    <lastmod>${lastmod}</lastmod>\n`;
      xml += `    <changefreq>weekly</changefreq>\n`;
      xml += `    <priority>0.7</priority>\n`;
      xml += `  </url>\n`;
    }

    for (const t of tags) {
      xml += `  <url>\n`;
      xml += `    <loc>${baseUrl}/tag/${t.SLUG}</loc>\n`;
      xml += `    <lastmod>${nowIso}</lastmod>\n`;
      xml += `    <changefreq>weekly</changefreq>\n`;
      xml += `    <priority>0.5</priority>\n`;
      xml += `  </url>\n`;
    }

    for (const a of authors) {
      const lastmod = (a.UPDATED_AT || nowIso).split('T')[0];
      xml += `  <url>\n`;
      xml += `    <loc>${baseUrl}/author/${a.USER_ID}</loc>\n`;
      xml += `    <lastmod>${lastmod}</lastmod>\n`;
      xml += `    <changefreq>monthly</changefreq>\n`;
      xml += `    <priority>0.6</priority>\n`;
      xml += `  </url>\n`;
    }

    xml += `</urlset>`;
    return xml;
  }
}

