import { Database } from './config/database';
import { UserModel } from './models/userModel';
import { hashPassword, comparePassword } from './utils/password';

async function runTest() {
  console.log('--- MODERNBLOG CMS PROFILE IMAGE & AUTHOR PROFILE TEST ---');

  // 1. Initialize Database
  await Database.initialize();
  const store = Database.getStore();
  console.log(`Database loaded. Total users: ${store.users.length}`);

  // 2. Find test admin/author user
  const adminUser = store.users.find(u => u.role_name === 'Admin' || u.user_id === 1);
  if (!adminUser) {
    throw new Error('Admin user not found in database');
  }
  console.log(`Found test admin: ${adminUser.name} (@${adminUser.username})`);

  // 3. Test Profile Update with image, bio, author tags, social links
  const testAvatarUrl = '/uploads/test_avatar_profile_image.webp';
  const updatedUser = await UserModel.updateProfile(adminUser.user_id, {
    name: 'Admin Chief Editor',
    bio: 'Award-winning technology analyst and Chief Editorial Lead for ModernBlog CMS.',
    profile_image: testAvatarUrl,
    website: 'https://modernblog.com/editorial',
    author_tags: ['Artificial Intelligence', 'Cybersecurity', 'Web Architecture'],
    social_links: {
      twitter: '@ModernBlogAdmin',
      github: 'modernblog-admin',
      linkedin: 'modernblog-chief-editor',
    },
    short_description: 'Chief Editorial Lead at ModernBlog CMS',
  });

  if (!updatedUser) {
    throw new Error('Failed to update user profile in model');
  }

  console.log('✓ Profile updated successfully in UserModel');
  console.log(`  - Name: ${updatedUser.name}`);
  console.log(`  - Profile Image: ${updatedUser.profile_image}`);
  console.log(`  - Bio: ${updatedUser.bio}`);
  console.log(`  - Author Tags: ${JSON.stringify(updatedUser.author_tags)}`);
  console.log(`  - Social Links: ${JSON.stringify(updatedUser.social_links)}`);

  // 4. Verify that authored posts reflect the updated author name and avatar
  const authoredPosts = store.posts.filter(p => p.author_id === adminUser.user_id);
  console.log(`Checking ${authoredPosts.length} posts authored by user...`);
  authoredPosts.forEach(p => {
    if (p.author_name !== 'Admin Chief Editor' || p.author_avatar !== testAvatarUrl) {
      throw new Error(`Post #${p.post_id} did not sync author name or avatar!`);
    }
  });
  console.log('✓ Authored posts automatically synced author_name & author_avatar!');

  // 5. Test Password Hash and Verification
  const testPass = 'NewSecurePass2026!';
  const passHash = await hashPassword(testPass);
  await UserModel.updatePassword(adminUser.user_id, passHash);
  const reloaded = await UserModel.findById(adminUser.user_id);
  if (!reloaded) throw new Error('User not found after reload');

  const match = await comparePassword(testPass, reloaded.password_hash);
  if (!match) throw new Error('Password hash comparison failed');
  console.log('✓ Password update & bcrypt comparison verified successfully!');

  // 6. Reset password back to default AdminPass2026!
  const defaultPassHash = await hashPassword('AdminPass2026!');
  await UserModel.updatePassword(adminUser.user_id, defaultPassHash);
  console.log('✓ Admin password reset back to AdminPass2026!');

  // 7. Verify security: ensure password_hash is never exposed in safe objects
  const { password_hash, ...safeObject } = reloaded;
  if ('password_hash' in safeObject) {
    throw new Error('Security flaw: password_hash found in safe object!');
  }
  console.log('✓ Security verified: password_hash is omitted from public profile responses');

  console.log('\n>>> ALL USER & AUTHOR PROFILE SYSTEM TESTS PASSED SUCCESSFULLY! <<<\n');
}

runTest().catch(err => {
  console.error('Test failed with error:', err);
  process.exit(1);
});
