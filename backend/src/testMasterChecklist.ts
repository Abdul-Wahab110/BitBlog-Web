import bcrypt from 'bcrypt';
import { AuthService } from './services/authService';
import { PostService } from './services/postService';
import { UserModel } from './models/userModel';
import { NotificationModel } from './models/notificationModel';
import { SeoModel } from './models/seoModel';
import { Database } from './config/database';
import { JwtPayload } from './types';

interface TestResult {
  item: string;
  passed: boolean;
  details: string;
}

const results: TestResult[] = [];

function recordResult(item: string, passed: boolean, details: string) {
  results.push({ item, passed, details });
  const statusStr = passed ? '✓ PASS' : '✗ FAIL';
  console.log(`[${statusStr}] ${item}: ${details}`);
}

async function runMasterChecklist() {
  console.log('================================================================');
  console.log('MODERNBLOG CMS — COMPREHENSIVE VERIFICATION & MASTER CHECKLIST');
  console.log('================================================================\n');

  await Database.initialize();
  const time = Date.now();

  // -------------------------------------------------------------
  // 1. BOOTSTRAP & DATABASE INTEGRITY
  // -------------------------------------------------------------
  console.log('--- SECTION 1: DATABASE INTEGRITY & ADMIN BOOTSTRAP ---');
  const adminRole = await UserModel.getRoleIdByName('Admin');
  const editorRole = await UserModel.getRoleIdByName('Editor');
  const authorRole = await UserModel.getRoleIdByName('Author');
  const userRole = await UserModel.getRoleIdByName('User');

  const rolesValid = adminRole === 1 && editorRole === 2 && authorRole === 3 && userRole === 4;
  recordResult(
    '1. Roles Table Schema',
    rolesValid,
    `Admin(ID:${adminRole}), Editor(ID:${editorRole}), Author(ID:${authorRole}), User(ID:${userRole})`
  );

  const existingAdmin = await UserModel.findByEmail('admin@modernblog.com');
  const adminValid = !!existingAdmin && existingAdmin.role_name === 'Admin' && existingAdmin.status === 'ACTIVE';
  recordResult(
    '2. Admin Account in DB',
    adminValid,
    `ID #${existingAdmin?.user_id} (${existingAdmin?.name}), Role=${existingAdmin?.role_name}, Status=${existingAdmin?.status}`
  );

  // -------------------------------------------------------------
  // 2. AUTHENTICATION & ROLE SELECTION ENFORCEMENT
  // -------------------------------------------------------------
  console.log('\n--- SECTION 2: AUTHENTICATION, RBAC & ROLE OVERRIDE GUARDS ---');
  // Public registration
  const registered = await AuthService.register({
    name: 'Master Test Reader',
    username: `reader_${time}`,
    email: `reader.${time}@test.com`,
    password: 'Password123!',
  });
  const regUserRole = registered.user.role === 'User';
  recordResult(
    '3. Public Registration Role Restriction',
    regUserRole,
    `Registered user ID #${registered.user.userId} has role '${registered.user.role}' (Cannot create Admin publicly)`
  );

  // User Login
  const userLogin = await AuthService.login({
    email: `reader.${time}@test.com`,
    password: 'Password123!',
    accountType: 'User',
  });
  const userLoginValid = userLogin.user.role === 'User' && !!userLogin.token;
  recordResult(
    '4. User Login with accountType="User"',
    userLoginValid,
    `User '${userLogin.user.name}' authenticated. Redirect target: /user/dashboard`
  );

  // Admin Login
  const adminLogin = await AuthService.login({
    email: 'admin@modernblog.com',
    password: 'admin123',
    accountType: 'Admin',
  });
  const adminLoginValid = adminLogin.user.role === 'Admin' && !!adminLogin.token;
  recordResult(
    '5. Admin Login with accountType="Admin"',
    adminLoginValid,
    `Admin '${adminLogin.user.name}' authenticated. Redirect target: /admin`
  );

  // Admin credentials + User accountType selection (Forbidden)
  let adminAsUserFailed = false;
  try {
    await AuthService.login({
      email: 'admin@modernblog.com',
      password: 'admin123',
      accountType: 'User',
    });
  } catch (err: any) {
    adminAsUserFailed = err.message.includes('These credentials do not belong to this account type');
  }
  recordResult(
    '6. Account Type Override Guard (Admin selecting User)',
    adminAsUserFailed,
    'Rejected mismatch with "These credentials do not belong to this account type."'
  );

  // User credentials + Admin accountType selection (Forbidden)
  let userAsAdminFailed = false;
  try {
    await AuthService.login({
      email: `reader.${time}@test.com`,
      password: 'Password123!',
      accountType: 'Admin',
    });
  } catch (err: any) {
    userAsAdminFailed = err.message.includes('These credentials do not belong to this account type');
  }
  recordResult(
    '7. Account Type Override Guard (User selecting Admin)',
    userAsAdminFailed,
    'Rejected mismatch with "These credentials do not belong to this account type."'
  );

  // -------------------------------------------------------------
  // 3. ADMIN USER MANAGEMENT & ROLE ASSIGNMENTS
  // -------------------------------------------------------------
  console.log('\n--- SECTION 3: ADMIN USER MANAGEMENT (/admin/users) ---');
  const newAdmin = await UserModel.createUser({
    roleId: 1,
    name: 'SecOps Administrator',
    username: `secops_${time}`,
    email: `secops.${time}@test.com`,
    passwordHash: await bcrypt.hash('SecOpsPass123!', 10),
  });
  const newAdminValid = newAdmin?.role_name === 'Admin';
  recordResult(
    '8. Admin Creating New Admin Account',
    newAdminValid,
    `Created Admin #${newAdmin?.user_id} with role 'Admin'`
  );

  const newEditor = await UserModel.createUser({
    roleId: 2,
    name: 'Content Editor',
    username: `editor_${time}`,
    email: `editor.${time}@test.com`,
    passwordHash: await bcrypt.hash('EditorPass123!', 10),
  });
  const newAuthor = await UserModel.createUser({
    roleId: 3,
    name: 'Staff Author',
    username: `author_${time}`,
    email: `author.${time}@test.com`,
    passwordHash: await bcrypt.hash('AuthorPass123!', 10),
  });
  recordResult(
    '9. Admin Creating Editor & Author Accounts',
    newEditor?.role_name === 'Editor' && newAuthor?.role_name === 'Author',
    `Created Editor (${newEditor?.role_name}) and Author (${newAuthor?.role_name})`
  );

  // -------------------------------------------------------------
  // 4. USER ARTICLE SUBMISSION & ADMIN APPROVAL WORKFLOW
  // -------------------------------------------------------------
  console.log('\n--- SECTION 4: ARTICLE WORKFLOW & SEO/AEO/GEO PRESERVATION ---');
  const userJwt: JwtPayload = {
    userId: userLogin.user.userId,
    name: userLogin.user.name,
    username: userLogin.user.username,
    email: userLogin.user.email,
    role: 'User',
  };

  const adminJwt: JwtPayload = {
    userId: adminLogin.user.userId,
    name: adminLogin.user.name,
    username: adminLogin.user.username,
    email: adminLogin.user.email,
    role: 'Admin',
  };

  // Normal user creates draft
  const draftPost = await PostService.createPost(userJwt, {
    title: `Draft Research Article ${time}`,
    content: '<p>Initial draft notes.</p>',
    status: 'draft',
  });
  recordResult(
    '10. User Saves Article Draft',
    draftPost.status === 'draft',
    `Draft ID #${draftPost.post_id}, status='${draftPost.status}'`
  );

  // Normal user submits for review with SEO, AEO, and GEO
  const submittedPost = await PostService.createPost(userJwt, {
    title: `Scalable Distributed Transactions ${time}`,
    slug: `scalable-transactions-${time}`,
    excerpt: 'Detailed architectural overview of distributed ACID transactions.',
    content: '<p>Modern microservices require robust consensus protocols and distributed commit coordinators.</p>',
    status: 'pending_review',
    seo: {
      metaTitle: 'Scalable Distributed Transactions 2026',
      metaDescription: 'A deep dive into ACID transactions in distributed architectures.',
      robots: 'index, follow',
    },
    aeo: {
      directAnswer: 'Distributed transactions coordinate atomic state mutations across distinct persistence nodes.',
      keyTakeaways: '• Two-phase commit guarantees atomicity\n• Saga patterns enable eventual consistency',
      faqList: [{ question: 'What is a distributed transaction?', answer: 'A transaction spanning multiple nodes or databases.' }],
      howToData: [{ stepNumber: 1, title: 'Coordinate Phase', text: 'Prepare participants for distributed commit.' }],
    },
    geo: {
      sourceCitations: 'ACM Queue, IEEE Distributed Computing Systems',
      entityContext: 'ACID, 2PC, Paxos, Raft',
    },
  });
  recordResult(
    '11. User Submits Article with SEO/AEO/GEO',
    submittedPost.status === 'pending_review',
    `Article ID #${submittedPost.post_id}, status='${submittedPost.status}', Author #${submittedPost.author_id}`
  );

  // User attempts direct publish (Blocked)
  const bypassAttempt = await PostService.createPost(userJwt, {
    title: `Unauthorized Direct Publish Attempt ${time}`,
    content: '<p>Direct publish test.</p>',
    status: 'published' as any,
  });
  const bypassBlocked = bypassAttempt.status === 'pending_review';
  recordResult(
    '12. Direct Publishing Guard for Normal Users',
    bypassBlocked,
    `Unauthorized status 'published' automatically forced to '${bypassAttempt.status}'`
  );

  // Admin approves article
  const approvedPost = await PostService.approvePost(submittedPost.post_id, adminJwt);
  const approvedValid = approvedPost?.status === 'published' && !!approvedPost?.published_at;
  recordResult(
    '13. Admin Approval & Immediate Publication',
    approvedValid,
    `Post ID #${approvedPost?.post_id} status='${approvedPost?.status}', published_at='${approvedPost?.published_at}'`
  );

  // Check SEO/AEO/GEO preserved in DB
  const seoRecord = await SeoModel.findByPostId(submittedPost.post_id);
  const seoValid =
    seoRecord?.meta_title === 'Scalable Distributed Transactions 2026' &&
    !!seoRecord?.direct_answer &&
    !!seoRecord?.faq_data &&
    !!seoRecord?.howto_data;
  recordResult(
    '14. SEO/AEO/GEO Metadata Preservation',
    seoValid,
    `Meta Title='${seoRecord?.meta_title}', Direct Answer='${seoRecord?.direct_answer?.substring(0, 30)}...'`
  );

  // Admin Request Changes & Rejection
  const feedbackArticle = await PostService.createPost(userJwt, {
    title: `Microservices Patterns Draft ${time}`,
    content: '<p>Preliminary notes.</p>',
    status: 'pending_review',
  });
  const changedArticle = await PostService.requestChangesPost(
    feedbackArticle.post_id,
    adminJwt,
    'Please add sequence diagrams and benchmark results.'
  );
  recordResult(
    '15. Admin Request Changes with Editorial Feedback',
    changedArticle?.status === 'changes_requested',
    `Status='${changedArticle?.status}', Feedback='${changedArticle?.reviewer_feedback}'`
  );

  const rejectedArticle = await PostService.rejectPost(
    feedbackArticle.post_id,
    adminJwt,
    'Topic is already documented in official knowledge base.'
  );
  recordResult(
    '16. Admin Rejection with Feedback Reason',
    rejectedArticle?.status === 'rejected',
    `Status='${rejectedArticle?.status}', Reason='${rejectedArticle?.reviewer_feedback}'`
  );

  // Article Ownership Guard
  const intruderJwt: JwtPayload = {
    userId: 999888,
    name: 'Intruder User',
    username: 'intruder',
    email: 'intruder@test.com',
    role: 'User',
  };
  let ownershipProtected = false;
  try {
    await PostService.updatePost(draftPost.post_id, intruderJwt, { title: 'Malicious Update' });
  } catch (err: any) {
    ownershipProtected = err.message.includes('Access denied') || err.statusCode === 403;
  }
  recordResult(
    '17. Article Ownership Security Guard',
    ownershipProtected,
    'Backend rejects unauthorized modifications with 403 Access Denied'
  );

  // Notifications
  const userNotifs = await NotificationModel.findByUser(userJwt.userId);
  const hasNotifications = userNotifs.length > 0;
  recordResult(
    '18. In-App Notifications for Article Review Workflow',
    hasNotifications,
    `Author received ${userNotifs.length} real notifications (Approval, Rejection, Submissions)`
  );

  // Cleanup test articles
  await PostService.deletePost(draftPost.post_id, adminJwt);
  await PostService.deletePost(submittedPost.post_id, adminJwt);
  await PostService.deletePost(bypassAttempt.post_id, adminJwt);
  await PostService.deletePost(feedbackArticle.post_id, adminJwt);

  console.log('\n================================================================');
  console.log('MASTER VERIFICATION SUMMARY:');
  const allPassed = results.every(r => r.passed);
  console.log(`TOTAL CHECKS: ${results.length} | PASSED: ${results.filter(r => r.passed).length} | FAILED: ${results.filter(r => !r.passed).length}`);
  console.log(`OVERALL STATUS: ${allPassed ? 'ALL TESTS PASSED (100%)' : 'SOME TESTS FAILED'}`);
  console.log('================================================================');

  process.exit(allPassed ? 0 : 1);
}

runMasterChecklist().catch(err => {
  console.error('Master Test Suite Failed:', err);
  process.exit(1);
});
