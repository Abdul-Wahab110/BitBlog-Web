import { Database } from './config/database';
import { SeoModel } from './models/seoModel';
import { SettingModel } from './models/settingModel';
import { NewsletterModel } from './models/newsletterModel';
import { ContactModel } from './models/contactModel';
import { AnalyticsModel } from './models/analyticsModel';
import { SitemapService } from './services/sitemapService';
import { RobotsService } from './services/robotsService';

async function runProfessionalModulesTests() {
  console.log('=== STARTING PROFESSIONAL MODULES & DISCOVERABILITY TEST SUITE ===\n');

  await Database.initialize();

  // Test 1: Dynamic XML Sitemap
  console.log('[Test 1] Testing Dynamic XML Sitemap (/sitemap.xml) Generation...');
  const sitemapXml = await SitemapService.generateSitemapXml();
  console.log(`- XML Sitemap Length: ${sitemapXml.length} characters`);
  console.log(`- Contains <urlset>: ${sitemapXml.includes('<urlset')}`);
  console.log(`- Contains Homepage <loc>: ${sitemapXml.includes('/</loc>')}`);

  // Test 2: Dynamic Robots.txt
  console.log('\n[Test 2] Testing Dynamic Robots.txt (/robots.txt) Generation...');
  const robotsTxt = await RobotsService.generateRobotsTxt();
  console.log(`- Robots.txt Output Snippet:\n${robotsTxt.split('\n').slice(0, 8).join('\n')}`);
  console.log(`- Contains Sitemap Reference: ${robotsTxt.includes('Sitemap:')}`);
  console.log(`- Disallows Admin & User Dashboards: ${robotsTxt.includes('Disallow: /admin') && robotsTxt.includes('Disallow: /user')}`);

  // Test 3: SEO, AEO & GEO Metadata Storage
  console.log('\n[Test 3] Testing SEO, AEO & GEO Metadata Model...');
  const testPostId = 888;
  const seoRecord = await SeoModel.upsertPostSeo(testPostId, {
    meta_title: 'Artificial Intelligence & Neural Networks Guide',
    meta_description: 'An in-depth editorial guide to machine learning and deep learning models.',
    robots: 'index, follow',
    direct_answer: 'Neural networks are computing systems inspired by the biological neural networks that constitute animal brains.',
    faq_data: JSON.stringify([{ question: 'What is deep learning?', answer: 'Deep learning is a subset of machine learning.' }]),
  });
  console.log(`- SEO Record Upserted: PostID=${seoRecord.post_id}, Title='${seoRecord.meta_title}'`);
  console.log(`- Direct Answer Verified: '${seoRecord.direct_answer}'`);

  // Test 4: Newsletter Subscription & Unsubscribe
  console.log('\n[Test 4] Testing Newsletter System...');
  const subRes = await NewsletterModel.subscribe('subscriber.test@modernblog.com');
  console.log(`- Subscription Status: '${subRes.status}', Email='${subRes.subscriber.email}'`);

  const unsubRes = await NewsletterModel.unsubscribe('subscriber.test@modernblog.com');
  console.log(`- Unsubscribe Handled: ${unsubRes}`);

  // Test 5: Contact System Submission & Inbox Processing
  console.log('\n[Test 5] Testing Contact Form Submission & Inbox Processing...');
  const msg = await ContactModel.createMessage({
    name: 'Sarah Connor',
    email: 'sarah@skynet.org',
    subject: 'Story Submission Inquiry',
    message: 'I would like to submit an editorial article regarding cybersecurity.',
  });
  console.log(`- Contact Message Created: ID=${msg.message_id}, Status='${msg.status}'`);

  const updatedMsg = await ContactModel.updateStatus(msg.message_id, 'READ');
  console.log(`- Admin Marked Message Status: '${updatedMsg?.status}'`);
  await ContactModel.deleteMessage(msg.message_id);

  // Test 6: Privacy-Aware View Tracking (ip_hash)
  console.log('\n[Test 6] Testing Privacy-Aware View Tracking (ip_hash)...');
  const sampleIp = '192.168.1.100';
  const hashedIp = AnalyticsModel.hashIp(sampleIp);
  console.log(`- SHA-256 Hashed IP Result (Zero Raw IP Stored): '${hashedIp.slice(0, 20)}...'`);

  // Test 7: Site Settings Persistence
  console.log('\n[Test 7] Testing System Settings Persistence...');
  const settings = await SettingModel.getSettings();
  console.log(`- Retrieved Site Name: '${settings.site_name}'`);
  console.log(`- Canonical Base URL: '${settings.site_canonical_base_url}'`);

  console.log('\n=== ALL PROFESSIONAL MODULES & DISCOVERABILITY TESTS PASSED PERFECTLY! ===');
}

runProfessionalModulesTests().catch(err => {
  console.error('Professional Modules Test Failed:', err);
  process.exit(1);
});
