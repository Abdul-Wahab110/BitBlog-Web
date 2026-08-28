import { AuthService } from './services/authService';
import { PostService } from './services/postService';
import { MediaModel } from './models/mediaModel';
import { Database } from './config/database';
import { generateToken } from './utils/jwt';
import { JwtPayload } from './types';

async function runRecoveryVerificationSuite() {
  console.log('===========================================================');
  console.log('BITBLOG CMS COMPREHENSIVE RECOVERY & END-TO-END VERIFICATION');
  console.log('===========================================================\n');

  await Database.initialize();

  // Test 1: Existing Admin Account Login
  console.log('[Test 1] Testing Admin Account Authentication (Email & Username)...');
  const adminLoginByEmail = await AuthService.login({
    email: 'admin@bitblog.com',
    password: 'admin123',
  });
  console.log(`- Admin Login via Email Success: Name='${adminLoginByEmail.user.name}', Role='${adminLoginByEmail.user.role}'`);
  if (adminLoginByEmail.user.role !== 'Admin') throw new Error('Expected role to be Admin');

  const adminLoginByUsername = await AuthService.login({
    email: 'admin',
    password: 'admin123',
  });
  console.log(`- Admin Login via Username Success: Token Length=${adminLoginByUsername.token.length}`);

  // Test 2: New Reader Registration & Login Flow
  console.log('\n[Test 2] Testing User Registration & Reader Login Flow...');
  const testEmail = `new.reader.${Date.now()}@example.com`;
  const testUsername = `reader_${Date.now()}`;
  const registerResult = await AuthService.register({
    name: 'New Registered Reader',
    username: testUsername,
    email: testEmail,
    password: 'password123',
  });
  console.log(`- Registration Success: ID=${registerResult.user.userId}, Role='${registerResult.user.role}'`);

  const userLogin = await AuthService.login({
    email: testEmail,
    password: 'password123',
  });
  console.log(`- Reader Login Success: User='${userLogin.user.name}', Token Length=${userLogin.token.length}`);

  // Test 3: Media File Upload System
  console.log('\n[Test 3] Testing Direct Media File Upload Simulation...');
  const uploadedMedia = await MediaModel.createMedia({
    uploadedBy: adminLoginByEmail.user.userId,
    fileName: `${Date.now()}-article-featured-hero.webp`,
    filePath: `/uploads/${Date.now()}-article-featured-hero.webp`,
    fileType: 'image/webp',
    fileSize: 428000,
    altText: 'Editorial Technology Breakthrough Feature',
  });
  console.log(`- Media Asset Stored: ID=${uploadedMedia.media_id}, URL='${uploadedMedia.file_path}'`);

  // Test 4: Article Creation with Direct Media Image & Categories
  console.log('\n[Test 4] Testing Admin Article Creation Flow (Title, Slug, Rich Image, Excerpt)...');
  const adminJwtUser: JwtPayload = {
    userId: adminLoginByEmail.user.userId,
    name: adminLoginByEmail.user.name,
    username: adminLoginByEmail.user.username,
    email: adminLoginByEmail.user.email,
    role: 'Admin',
  };

  const newArticle = await PostService.createPost(adminJwtUser, {
    title: `Next-Gen Oracle Database Cloud Architecture ${Date.now()}`,
    slug: `oracle-cloud-architecture-${Date.now()}`,
    excerpt: 'Deep-dive analysis into modern enterprise Oracle Database cloud deployments and performance tuning.',
    content: `<p>Modern enterprises rely on robust database infrastructure.</p><figure><img src="${uploadedMedia.file_path}" alt="Architecture Diagram" /><figcaption>Cloud Architecture</figcaption></figure><p>Consistent ACID transactions and horizontal scaling provide unparalleled reliability.</p>`,
    featuredImage: uploadedMedia.file_path,
    categoryId: 1,
    status: 'published',
  });
  console.log(`- Article Created: ID=${newArticle.post_id}, Slug='${newArticle.slug}', ReadingTime=${newArticle.reading_time}m`);

  // Test 5: Public Article Retrieval by Slug & View Count Recording
  console.log('\n[Test 5] Testing Public Article Retrieval by Slug & View Increment...');
  const publicArticle = await PostService.getPostBySlug(newArticle.slug, 'test-ip-hash', 'test-agent', userLogin.user.userId);
  console.log(`- Public Article Retrieved: Title='${publicArticle.title}', Views=${publicArticle.views_count}`);

  // Test 6: Clean Up Test Post
  console.log('\n[Test 6] Cleaning up test article...');
  await PostService.deletePost(newArticle.post_id, adminJwtUser);
  console.log(`- Test Article #${newArticle.post_id} removed cleanly.`);

  console.log('\n===========================================================');
  console.log('ALL RECOVERY TESTS PASSED! BACKEND & AUTH FULLY OPERATIONAL');
  console.log('===========================================================');
  process.exit(0);
}

runRecoveryVerificationSuite().catch(err => {
  console.error('Recovery verification failed:', err);
  process.exit(1);
});
