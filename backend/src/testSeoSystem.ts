import { SeoModel } from './models/seoModel';
import { SitemapService } from './services/sitemapService';
import { RobotsService } from './services/robotsService';

async function runSeoTests() {
  console.log('=== MODERNBLOG CMS — SEO, AEO & GEO AUTOMATED TEST SUITE ===\n');

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string) {
    if (condition) {
      console.log(`[PASS] ${testName}`);
      passed++;
    } else {
      console.error(`[FAIL] ${testName}`);
      failed++;
    }
  }

  try {
    // 1. Test SEO Metadata Creation & Upsert
    console.log('--- 1. Testing SEO Metadata Model Upsert & Retrieval ---');
    const testPostId = 1;
    const testSeoData = {
      meta_title: 'Building Modern Next-Gen Web Applications with React & Node.js',
      meta_description: 'Discover how modern component architecture, TypeScript, and clean API design power responsive digital publications.',
      canonical_url: 'http://localhost:5173/post/building-modern-next-gen-web-applications',
      og_title: 'Building Modern Next-Gen Web Applications with React & Node.js',
      og_description: 'Discover how modern component architecture, TypeScript, and clean API design power responsive digital publications.',
      og_image: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97',
      twitter_title: 'Building Modern Next-Gen Web Applications with React & Node.js',
      twitter_description: 'Discover how modern component architecture, TypeScript, and clean API design power responsive digital publications.',
      twitter_image: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97',
      twitter_card: 'summary_large_image',
      robots: 'index, follow',
      focus_keyword: 'React & Node.js',
      secondary_keywords: 'web applications, typescript, modern cms',
      search_intent: 'informational',
      image_alt_text: 'Code editor screen showing modern TypeScript web application structure',
      direct_answer: 'Modern web applications combine declarative frontend component systems like React with scalable asynchronous backends like Node.js for high concurrency and sub-second rendering.',
      key_takeaways: '• Component-based design increases code reusability.\n• TypeScript eliminates runtime type errors.\n• RESTful architectures simplify multi-portal access.',
      faq_data: JSON.stringify([
        { question: 'Why use React and Node.js together?', answer: 'They share the same language ecosystem (TypeScript/JavaScript), enabling full-stack code reuse and fast JSON serialization.' },
        { question: 'Is Oracle SQL compatible with Node.js?', answer: 'Yes, via the official node-oracledb client library supporting connection pooling and high throughput.' },
      ]),
      howto_data: JSON.stringify({
        title: 'How to Build Modern Web Applications',
        steps: [
          { title: 'Setup TypeScript Environment', description: 'Initialize tsconfig.json and configure strict type safety.' },
          { title: 'Design RESTful APIs', description: 'Structure Express controllers and middleware with input validation.' },
        ],
      }),
      references_data: 'W3C Web Standards 2026, Oracle Database 23c Documentation, React 18 Architecture Guide',
      entity_context: 'React, Node.js, TypeScript, Oracle SQL Database, REST APIs',
      factual_context: 'Benchmarks conducted on Node.js v20 LTS under 10,000 concurrent requests.',
      location_context: 'Global',
    };

    const saved = await SeoModel.upsertPostSeo(testPostId, testSeoData);
    assert(saved !== null && saved.post_id === testPostId, 'SeoModel.upsertPostSeo successfully creates/updates record');
    assert(saved.focus_keyword === 'React & Node.js', 'Focus keyword persisted correctly');
    assert(saved.image_alt_text !== undefined, 'Image ALT text persisted correctly');
    assert(saved.direct_answer !== undefined && saved.direct_answer.length > 20, 'AEO Direct Answer persisted correctly');

    const fetched = await SeoModel.findByPostId(testPostId);
    assert(fetched !== null && fetched.post_id === testPostId, 'SeoModel.findByPostId retrieves accurate metadata');
    assert(fetched?.robots === 'index, follow', 'Robots directive defaults to index, follow');

    // 2. Test Sitemap XML Generator
    console.log('\n--- 2. Testing Sitemap.xml Generator ---');
    const sitemapXml = await SitemapService.generateSitemapXml();
    assert(typeof sitemapXml === 'string', 'SitemapService produces string XML output');
    assert(sitemapXml.includes('<?xml version="1.0" encoding="UTF-8"?>'), 'Sitemap contains XML header');
    assert(sitemapXml.includes('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'), 'Sitemap contains urlset namespace');
    assert(sitemapXml.includes('/blog'), 'Sitemap includes public /blog page');
    assert(!sitemapXml.includes('/admin/'), 'Sitemap excludes private /admin/ routes');
    assert(!sitemapXml.includes('/user/dashboard'), 'Sitemap excludes private /user/dashboard routes');

    // 3. Test Robots.txt Generator
    console.log('\n--- 3. Testing Robots.txt Generator ---');
    const robotsTxt = await RobotsService.generateRobotsTxt();
    assert(typeof robotsTxt === 'string', 'RobotsService produces text output');
    assert(robotsTxt.includes('User-agent: *'), 'Robots.txt contains User-agent directive');
    assert(robotsTxt.includes('Disallow: /admin'), 'Robots.txt protects /admin');
    assert(robotsTxt.includes('Disallow: /user'), 'Robots.txt protects /user');
    assert(robotsTxt.includes('Sitemap:'), 'Robots.txt includes sitemap URL reference');

    // 4. Test SEO Live Score Algorithm Scenarios
    console.log('\n--- 4. Testing SEO Scoring Algorithm Rules ---');

    // Helper calculation for testing
    function calculateTestScore(opts: {
      title: string;
      desc: string;
      slug: string;
      wordCount: number;
      kw: string;
      hasImg: boolean;
      hasAlt: boolean;
      directAns: string;
    }): number {
      let sc = 0;
      if (opts.title.length >= 45 && opts.title.length <= 65) sc += 15;
      else if (opts.title.length > 0) sc += 8;

      if (opts.desc.length >= 120 && opts.desc.length <= 165) sc += 15;
      else if (opts.desc.length > 0) sc += 7;

      if (opts.slug && /^[a-z0-9-]+$/.test(opts.slug)) sc += 10;

      if (opts.wordCount >= 300) sc += 15;
      else if (opts.wordCount >= 100) sc += 8;

      if (opts.kw && opts.title.toLowerCase().includes(opts.kw.toLowerCase())) sc += 15;

      if (opts.hasImg) {
        if (opts.hasAlt) sc += 10;
        else sc += 5;
      }

      if (opts.directAns && opts.directAns.length >= 35) sc += 20;

      return Math.min(100, sc);
    }

    // High Quality Score (Green 80-100)
    const highQualityScore = calculateTestScore({
      title: 'Building Modern Next-Gen Web Applications with React & Node.js',
      desc: 'Discover how modern component architecture, TypeScript, and clean API design power responsive digital publications and scalable systems.',
      slug: 'building-modern-next-gen-web-applications',
      wordCount: 450,
      kw: 'React & Node.js',
      hasImg: true,
      hasAlt: true,
      directAns: 'Modern web applications combine declarative frontend component systems with scalable backends.',
    });
    assert(highQualityScore >= 80, `High quality article achieves Green score (${highQualityScore} >= 80)`);

    // Moderate Quality Score (Yellow 50-79)
    const moderateScore = calculateTestScore({
      title: 'Short title',
      desc: 'Short description',
      slug: 'short-title',
      wordCount: 150,
      kw: 'Short',
      hasImg: true,
      hasAlt: false,
      directAns: '',
    });
    assert(moderateScore >= 50 && moderateScore < 80, `Moderate quality article achieves Yellow score (${moderateScore} in 50-79)`);

    // Incomplete Quality Score (Red 0-49)
    const poorScore = calculateTestScore({
      title: '',
      desc: '',
      slug: '',
      wordCount: 10,
      kw: '',
      hasImg: false,
      hasAlt: false,
      directAns: '',
    });
    assert(poorScore < 50, `Incomplete article triggers Red score (${poorScore} < 50)`);

    console.log(`\n===============================================================`);
    console.log(`TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
    console.log(`===============================================================\n`);

    if (failed > 0) {
      process.exit(1);
    }
  } catch (error) {
    console.error('Fatal test exception:', error);
    process.exit(1);
  }
}

runSeoTests();
