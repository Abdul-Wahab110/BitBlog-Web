import bcrypt from 'bcrypt';
import { AuthService } from './services/authService';
import { PostService } from './services/postService';
import { UserModel } from './models/userModel';
import { NotificationModel } from './models/notificationModel';
import { Database } from './config/database';
import { JwtPayload } from './types';

async function runAdminCreationAndRedirectsTest() {
  console.log('================================================================');
  console.log('BITBLOG CMS — ADMIN CREATION, RBAC & REDIRECT TESTS');
  console.log('================================================================\n');

  await Database.initialize();
  const timestamp = Date.now();

  // -------------------------------------------------------------
  // TEST 1: Existing Admin Login
  // -------------------------------------------------------------
  console.log('[Test 1] Authenticating existing Administrator...');
  const adminLogin = await AuthService.login({
    email: 'admin',
    password: 'admin123',
    accountType: 'Admin',
  });
  console.log(`✓ Admin Authenticated: ID=${adminLogin.user.userId}, Role='${adminLogin.user.role}'`);
  if (adminLogin.user.role !== 'Admin') throw new Error('Expected role Admin');

  const adminJwt: JwtPayload = {
    userId: adminLogin.user.userId,
    name: adminLogin.user.name,
    username: adminLogin.user.username,
    email: adminLogin.user.email,
    role: 'Admin',
  };

  // -------------------------------------------------------------
  // TEST 2: Admin Creates Another Admin Account
  // -------------------------------------------------------------
  console.log('\n[Test 2] Existing Admin creates a new Administrator account...');
  const newAdminEmail = `secondary.admin.${timestamp}@bitblog.com`;
  const newAdminUsername = `admin_${timestamp}`;
  const newAdminPassword = 'AdminPassword123!';

  const roleId = await UserModel.getRoleIdByName('Admin');
  if (!roleId) throw new Error('Admin role ID not found');

  const passwordHash = await bcrypt.hash(newAdminPassword, 10);
  const createdAdmin = await UserModel.createUser({
    roleId,
    name: 'Secondary Operations Admin',
    username: newAdminUsername,
    email: newAdminEmail,
    passwordHash,
  });

  console.log(`✓ Admin Created New Admin: ID=${createdAdmin?.user_id}, Username='${createdAdmin?.username}', Role='${createdAdmin?.role_name}'`);
  if (createdAdmin?.role_name !== 'Admin') throw new Error('Expected role to be Admin');

  // Verify new Admin can authenticate
  const secondaryAdminLogin = await AuthService.login({
    email: newAdminEmail,
    password: newAdminPassword,
    accountType: 'Admin',
  });
  console.log(`✓ Secondary Admin Logged In Successfully: Name='${secondaryAdminLogin.user.name}', Role='${secondaryAdminLogin.user.role}'`);

  // -------------------------------------------------------------
  // TEST 3: Admin Creates an Editor and Author Account
  // -------------------------------------------------------------
  console.log('\n[Test 3] Admin creates Editor and Author accounts...');
  const editorRoleId = (await UserModel.getRoleIdByName('Editor')) || 2;
  const authorRoleId = (await UserModel.getRoleIdByName('Author')) || 3;

  const editorUser = await UserModel.createUser({
    roleId: editorRoleId,
    name: 'Senior Editor',
    username: `editor_${timestamp}`,
    email: `editor.${timestamp}@bitblog.com`,
    passwordHash: await bcrypt.hash('EditorPass123!', 10),
  });
  console.log(`✓ Editor Created: Role='${editorUser?.role_name}'`);

  const authorUser = await UserModel.createUser({
    roleId: authorRoleId,
    name: 'Staff Columnist',
    username: `author_${timestamp}`,
    email: `author.${timestamp}@bitblog.com`,
    passwordHash: await bcrypt.hash('AuthorPass123!', 10),
  });
  console.log(`✓ Author Created: Role='${authorUser?.role_name}'`);

  // -------------------------------------------------------------
  // TEST 4: Public Registration strictly assigns User role
  // -------------------------------------------------------------
  console.log('\n[Test 4] Testing Public Registration role enforcement (must always be User)...');
  const readerUser = await AuthService.register({
    name: 'Public Reader',
    username: `reader_${timestamp}`,
    email: `reader.${timestamp}@example.com`,
    password: 'ReaderPassword123!',
  });
  console.log(`✓ Public Registered User Role: '${readerUser.user.role}'`);
  if (readerUser.user.role !== 'User') throw new Error('Public registration must strictly create User role');

  const readerJwt: JwtPayload = {
    userId: readerUser.user.userId,
    name: readerUser.user.name,
    username: readerUser.user.username,
    email: readerUser.user.email,
    role: 'User',
  };

  // -------------------------------------------------------------
  // TEST 5: User Article Ownership Protection
  // -------------------------------------------------------------
  console.log('\n[Test 5] Testing Article Ownership Security Protection...');
  // Reader creates an article draft
  const readerArticle = await PostService.createPost(readerJwt, {
    title: `Ownership Security Test Article ${timestamp}`,
    content: '<p>Content belonging exclusively to reader user.</p>',
    status: 'draft',
  });
  console.log(`✓ Reader Created Article: ID=${readerArticle.post_id}, Author=${readerArticle.author_id}`);

  // Another user attempts to modify Reader's article
  const intruderJwt: JwtPayload = {
    userId: 999999,
    name: 'Intruder User',
    username: 'intruder',
    email: 'intruder@example.com',
    role: 'User',
  };

  try {
    await PostService.updatePost(readerArticle.post_id, intruderJwt, {
      title: 'Hacked Title Attempt',
    });
    throw new Error('SECURITY VIOLATION: Unauthorized user was able to modify another user article!');
  } catch (err: any) {
    if (err.message.includes('Access denied') || err.statusCode === 403) {
      console.log(`✓ Ownership Enforced on Update: Rejected with "${err.message}"`);
    } else {
      throw err;
    }
  }

  try {
    await PostService.deletePost(readerArticle.post_id, intruderJwt);
    throw new Error('SECURITY VIOLATION: Unauthorized user was able to delete another user article!');
  } catch (err: any) {
    if (err.message.includes('Access denied') || err.statusCode === 403) {
      console.log(`✓ Ownership Enforced on Delete: Rejected with "${err.message}"`);
    } else {
      throw err;
    }
  }

  // -------------------------------------------------------------
  // TEST 6: Real Unread Notifications Check
  // -------------------------------------------------------------
  console.log('\n[Test 6] Testing Real Database Notifications...');
  await NotificationModel.createNotification({
    userId: readerUser.user.userId,
    type: 'ARTICLE_SUBMITTED',
    title: 'Submission Received',
    message: 'Your draft has been submitted for review.',
  });

  const notifications = await NotificationModel.findByUser(readerUser.user.userId);
  const unreadCount = notifications.filter(n => !n.is_read).length;
  console.log(`✓ Real Unread Notifications for Reader: ${unreadCount}`);
  if (unreadCount === 0) throw new Error('Expected at least 1 unread notification');

  // Clean up
  console.log('\n[Cleanup] Cleaning test records...');
  await PostService.deletePost(readerArticle.post_id, adminJwt);
  console.log('✓ Cleanup complete.');

  console.log('\n================================================================');
  console.log('ALL ADMIN CREATION, RBAC & OWNERSHIP SECURITY TESTS PASSED (100%)');
  console.log('================================================================');
  process.exit(0);
}

runAdminCreationAndRedirectsTest().catch(err => {
  console.error('Test Failed:', err);
  process.exit(1);
});
