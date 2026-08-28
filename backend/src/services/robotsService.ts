import { SettingModel } from '../models/settingModel';

export class RobotsService {
  public static async generateRobotsTxt(): Promise<string> {
    const settings = await SettingModel.getSettings();
    const baseUrl = settings.site_canonical_base_url.replace(/\/$/, '');

    let txt = `# Robots.txt for BitBlog CMS\n`;
    txt += `User-agent: *\n`;
    txt += `Allow: /\n`;
    txt += `Allow: /blog\n`;
    txt += `Allow: /post/\n`;
    txt += `Allow: /category/\n`;
    txt += `Allow: /tag/\n`;
    txt += `Allow: /author/\n`;
    txt += `Allow: /about\n`;
    txt += `Allow: /contact\n`;
    txt += `Allow: /assets/\n`;
    txt += `\n`;
    txt += `# Disallow Private, System & Search Result Pages\n`;
    txt += `Disallow: /super-admin\n`;
    txt += `Disallow: /superadmin\n`;
    txt += `Disallow: /superadmin-login\n`;
    txt += `Disallow: /admin/\n`;
    txt += `Disallow: /admin\n`;
    txt += `Disallow: /user/\n`;
    txt += `Disallow: /user\n`;
    txt += `Disallow: /dashboard/\n`;
    txt += `Disallow: /dashboard\n`;
    txt += `Disallow: /login\n`;
    txt += `Disallow: /register\n`;
    txt += `Disallow: /search\n`;
    txt += `Disallow: /api/\n`;
    txt += `\n`;
    txt += `# XML Sitemap Index Reference\n`;
    txt += `Sitemap: ${baseUrl}/sitemap.xml\n`;

    return txt;
  }
}
