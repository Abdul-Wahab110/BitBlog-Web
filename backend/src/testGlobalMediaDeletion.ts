import fs from 'fs';
import path from 'path';
import { MediaModel } from './models/mediaModel';
import { PostModel } from './models/postModel';
import { UserModel } from './models/userModel';
import { CategoryModel } from './models/categoryModel';
import { Database } from './config/database';

async function runGlobalMediaDeletionTests() {
  console.log('=== MODERNBLOG CMS — GLOBAL MEDIA DELETION TEST SUITE ===\n');

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
    // Setup uploads directory & dummy file
    const uploadsDir = path.join(process.cwd(), 'uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const testFileName = `test-cascading-asset-${Date.now()}.png`;
    const testFilePath = path.join(uploadsDir, testFileName);
    const testPublicUrl = `/uploads/${testFileName}`;

    // Write a dummy image file
    fs.writeFileSync(testFilePath, Buffer.from('FAKE_IMAGE_DATA_FOR_TEST'));
    assert(fs.existsSync(testFilePath), 'Physical dummy media file created on disk in uploads/');

    // 1. Create Media Record
    console.log('\n--- 1. Registering Media in Media Library ---');
    const media = await MediaModel.createMedia({
      uploadedBy: 1,
      fileName: testFileName,
      filePath: testPublicUrl,
      fileType: 'image/png',
      fileSize: 1024,
      altText: 'Test Cascading Media Item',
    });

    assert(media !== null && media.media_id > 0, 'Media asset registered in database');

    // 2. Assign Media to Multiple Website Entities
    console.log('\n--- 2. Linking Media to Posts, Users, Categories & Settings ---');
    
    // A. Post
    const testPost = await PostModel.createPost({
      authorId: 1,
      title: 'Article using Cascading Media ' + Date.now(),
      slug: 'cascading-article-' + Date.now(),
      excerpt: 'Post lead excerpt for media testing.',
      content: `<p>Intro paragraph.</p><p><img src="${testPublicUrl}" alt="Inline Test Image" /></p><p>Ending text.</p>`,
      featuredImage: testPublicUrl,
      status: 'published',
      readingTime: 3,
    });
    assert(testPost.featured_image === testPublicUrl, 'Post featured image linked');
    assert(testPost.content.includes(testFileName), 'Post content contains inline image HTML');

    // B. User Profile
    const testUser = await UserModel.createUser({
      roleId: 2,
      name: 'Media Test User',
      username: 'mediatestuser_' + Date.now(),
      email: `mediatest_${Date.now()}@example.com`,
      passwordHash: '$2b$10$abcdefghijklmnopqrstuv',
    });
    await UserModel.updateProfile(testUser.user_id, { profile_image: testPublicUrl });
    const userWithImage = await UserModel.findById(testUser.user_id);
    assert(userWithImage?.profile_image === testPublicUrl, 'User profile image linked');

    // C. Category
    const testCat = await CategoryModel.createCategory({
      name: 'Media Test Category ' + Date.now(),
      slug: 'media-test-cat-' + Date.now(),
      description: 'Category for testing global media deletion cascade.',
      image: testPublicUrl,
    });
    assert(testCat.image === testPublicUrl, 'Category cover image linked');

    // D. Site Settings
    const store = Database.getStore();
    store.settings.site_logo = testPublicUrl;
    store.settings.site_favicon = testPublicUrl;
    Database.saveStore();
    assert(store.settings.site_logo === testPublicUrl, 'Site Logo setting linked to media');
    assert(store.settings.site_favicon === testPublicUrl, 'Site Favicon setting linked to media');

    // 3. Execute Global Cascading Deletion
    console.log('\n--- 3. Executing MediaModel.deleteMedia() ---');
    const deleteResult = await MediaModel.deleteMedia(media.media_id);
    assert(deleteResult.success === true, 'deleteMedia returned success');
    assert(deleteResult.affected.posts > 0, `Cleaned up from posts (${deleteResult.affected.posts})`);
    assert(deleteResult.affected.users > 0, `Cleaned up from users (${deleteResult.affected.users})`);
    assert(deleteResult.affected.categories > 0, `Cleaned up from categories (${deleteResult.affected.categories})`);
    assert(deleteResult.affected.settings === true, 'Cleaned up from site settings');
    assert(deleteResult.affected.diskDeleted === true, 'Physical file unlinked from disk');

    // 4. Verify Physical & Database State
    console.log('\n--- 4. Verifying Global State Post-Deletion ---');
    assert(!fs.existsSync(testFilePath), 'Physical file is gone from uploads/ directory');

    const checkMedia = await MediaModel.findById(media.media_id);
    assert(checkMedia === null, 'Media asset no longer exists in Media Library');

    const updatedPost = await PostModel.findById(testPost.post_id);
    assert(!updatedPost?.featured_image, 'Post featured_image was reset to undefined/null');
    assert(!updatedPost?.content.includes(testFileName), 'Post content inline <img> was cleanly removed');

    const updatedUser = await UserModel.findById(testUser.user_id);
    assert(!updatedUser?.profile_image, 'User profile_image was reset to undefined/null');

    const updatedCat = await CategoryModel.findById(testCat.category_id);
    assert(!updatedCat?.image, 'Category image was reset to undefined/null');

    const updatedStore = Database.getStore();
    assert(!updatedStore.settings.site_logo, 'Site Logo setting was reset to empty string');
    assert(!updatedStore.settings.site_favicon, 'Site Favicon setting was reset to empty string');

    console.log(`\n===============================================================`);
    console.log(`GLOBAL MEDIA DELETION TESTS: ${passed} PASSED, ${failed} FAILED`);
    console.log(`===============================================================\n`);

    if (failed > 0) {
      process.exit(1);
    }
  } catch (err) {
    console.error('Test execution error:', err);
    process.exit(1);
  }
}

runGlobalMediaDeletionTests();
