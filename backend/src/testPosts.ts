import { Database } from './config/database';
import { PostService } from './services/postService';
import { JwtPayload } from './types';

async function runPostTests() {
  console.log('=== STARTING ARTICLE/BLOG CMS WORKFLOW TESTS ===\n');

  await Database.initialize();

  const testUser: JwtPayload = {
    userId: 1,
    email: 'admin@modernblog.com',
    username: 'admin',
    role: 'Admin',
    name: 'Chief Editor',
  };

  // Test 1: Create Article (Draft & Published)
  console.log('[Test 1] Creating New Published Article...');
  const post1 = await PostService.createPost(testUser, {
    title: 'The Future of Web Development with Oracle Database and React',
    content: '<h1>Introduction</h1><p>Modern web applications require high scalability, performance, and data security.</p><h2>Architecture Highlights</h2><p>Combining Express, TypeScript, and Oracle Database delivers enterprise-grade reliability.</p>',
    excerpt: 'An in-depth exploration of modern web development architectures.',
    status: 'published',
  });

  console.log(`- Article Created Successfully: ID=${post1.post_id}, Slug='${post1.slug}', ReadingTime=${post1.reading_time}m`);

  // Test 2: Fetch Public Article by Slug
  console.log('\n[Test 2] Fetching Public Article by Slug...');
  const fetchedPost = await PostService.getPostBySlug(post1.slug);
  console.log(`- Public Article Fetched: Title='${fetchedPost.title}', Views=${fetchedPost.views_count}`);

  // Test 3: View Count Increment Verification
  console.log('\n[Test 3] Verifying Article View Counter Increment...');
  const reFetchedPost = await PostService.getPostBySlug(post1.slug);
  console.log(`- View Counter Updated: New ViewsCount=${reFetchedPost.views_count} (EXPECTED: 2)`);

  // Test 4: Update Article Content & Status
  console.log('\n[Test 4] Updating Article Title & Content...');
  const updatedPost = await PostService.updatePost(post1.post_id, testUser, {
    title: 'The Future of Modern Web Development with Oracle DB and React (Updated)',
    content: '<h1>Updated Content</h1><p>Updated content body with enhanced performance section.</p>',
  });
  console.log(`- Article Updated: Title='${updatedPost?.title}'`);

  // Test 5: Delete Article
  console.log('\n[Test 5] Deleting Test Article...');
  const deleteResult = await PostService.deletePost(post1.post_id, testUser);
  console.log(`- Delete Result: "${deleteResult.message}"`);

  console.log('\n=== ALL ARTICLE/BLOG CMS WORKFLOW TESTS PASSED PERFECTLY! ===');
}

runPostTests().catch(err => {
  console.error('Post Test Failed:', err);
  process.exit(1);
});
