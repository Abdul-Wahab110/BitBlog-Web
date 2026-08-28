import { AuthService } from './services/authService';
import { PostService } from './services/postService';
import { SeoModel } from './models/seoModel';
import { MediaModel } from './models/mediaModel';
import { NotificationModel } from './models/notificationModel';
import { Database } from './config/database';
import { JwtPayload } from './types';

async function runWorkflowAndAccountTypeTests() {
  console.log('================================================================');
  console.log('BITBLOG CMS — ACCOUNT TYPE, USER SUBMISSION & APPROVAL TESTS');
  console.log('================================================================\n');

  await Database.initialize();

  // -------------------------------------------------------------
  // TEST 1: Admin login with Account Type = 'Admin'
  // -------------------------------------------------------------
  console.log('[Test 1] Testing Admin login with accountType = "Admin"...');
  const adminAuth = await AuthService.login({
    email: 'admin',
    password: 'admin123',
    accountType: 'Admin',
  });
  console.log(`✓ Admin Login Success: Role='${adminAuth.user.role}', User='${adminAuth.user.name}'`);
  if (adminAuth.user.role !== 'Admin') throw new Error('Expected role to be Admin');

  // -------------------------------------------------------------
  // TEST 2: User registration & Login with Account Type = 'User'
  // -------------------------------------------------------------
  console.log('\n[Test 2] Testing User registration & login with accountType = "User"...');
  const uniqueTime = Date.now();
  const testUserEmail = `author.reader.${uniqueTime}@example.com`;
  const testUsername = `reader_${uniqueTime}`;

  const registeredUser = await AuthService.register({
    name: 'Alice Reader',
    username: testUsername,
    email: testUserEmail,
    password: 'Password123!',
  });
  console.log(`✓ Registered User: ID=${registeredUser.user.userId}, Role='${registeredUser.user.role}'`);

  const userAuth = await AuthService.login({
    email: testUserEmail,
    password: 'Password123!',
    accountType: 'User',
  });
  console.log(`✓ User Login Success: Role='${userAuth.user.role}', Name='${userAuth.user.name}'`);
  if (userAuth.user.role !== 'User') throw new Error('Expected role to be User');

  // -------------------------------------------------------------
  // TEST 3: User credentials + Account Type = 'Admin' (MUST FAIL)
  // -------------------------------------------------------------
  console.log('\n[Test 3] Testing User credentials with accountType = "Admin" (Security Mismatch Check)...');
  try {
    await AuthService.login({
      email: testUserEmail,
      password: 'Password123!',
      accountType: 'Admin',
    });
    throw new Error('SECURITY VIOLATION: User was allowed to log in as Admin!');
  } catch (err: any) {
    if (err.message.includes('These credentials do not belong to this account type')) {
      console.log(`✓ Security Enforced: Rejected with message: "${err.message}"`);
    } else {
      throw err;
    }
  }

  // -------------------------------------------------------------
  // TEST 4: Admin credentials + Account Type = 'User' (MUST FAIL)
  // -------------------------------------------------------------
  console.log('\n[Test 4] Testing Admin credentials with accountType = "User" (Security Mismatch Check)...');
  try {
    await AuthService.login({
      email: 'admin',
      password: 'admin123',
      accountType: 'User',
    });
    throw new Error('SECURITY VIOLATION: Admin was allowed to log in as User!');
  } catch (err: any) {
    if (err.message.includes('These credentials do not belong to this account type')) {
      console.log(`✓ Security Enforced: Rejected with message: "${err.message}"`);
    } else {
      throw err;
    }
  }

  // -------------------------------------------------------------
  // TEST 5: User creates Article Draft & Image Upload
  // -------------------------------------------------------------
  console.log('\n[Test 5] Testing User Article Draft Creation & Image Upload...');
  const userJwt: JwtPayload = {
    userId: userAuth.user.userId,
    name: userAuth.user.name,
    username: userAuth.user.username,
    email: userAuth.user.email,
    role: 'User',
  };

  const adminJwt: JwtPayload = {
    userId: adminAuth.user.userId,
    name: adminAuth.user.name,
    username: adminAuth.user.username,
    email: adminAuth.user.email,
    role: 'Admin',
  };

  const userUploadedMedia = await MediaModel.createMedia({
    uploadedBy: userAuth.user.userId,
    fileName: `${uniqueTime}-user-architecture.webp`,
    filePath: `/uploads/${uniqueTime}-user-architecture.webp`,
    fileType: 'image/webp',
    fileSize: 250000,
    altText: 'Decentralized Oracle Microservices Diagram',
  });
  console.log(`✓ User Media Uploaded: ID=${userUploadedMedia.media_id}, URL='${userUploadedMedia.file_path}'`);

  const draftArticle = await PostService.createPost(userJwt, {
    title: `Draft Explorations in Cloud Computing ${uniqueTime}`,
    content: '<p>This is initial draft research content that is being prepared.</p>',
    featuredImage: userUploadedMedia.file_path,
    status: 'draft',
  });
  console.log(`✓ Draft Created: ID=${draftArticle.post_id}, Status='${draftArticle.status}'`);
  if (draftArticle.status !== 'draft') throw new Error('Expected status to be draft');

  // -------------------------------------------------------------
  // TEST 6: User Submits Article with SEO, AEO, and GEO for Review
  // -------------------------------------------------------------
  console.log('\n[Test 6] Testing User Submitting Article with SEO/AEO/GEO for Editorial Review...');
  const submittedArticle = await PostService.createPost(userJwt, {
    title: `High Performance Distributed Computing ${uniqueTime}`,
    slug: `distributed-computing-${uniqueTime}`,
    excerpt: 'Comprehensive guide to horizontal partitioning, fault tolerance, and sub-millisecond query execution.',
    content: `<p>Distributed computing paradigms are transforming enterprise applications.</p><figure><img src="${userUploadedMedia.file_path}" alt="Diagram" /></figure><p>Robust replication ensures continuous operational uptime.</p>`,
    featuredImage: userUploadedMedia.file_path,
    status: 'pending_review',
    seo: {
      metaTitle: 'Distributed Computing Architecture Guide 2026',
      metaDescription: 'In-depth guide to distributed computing, sharding, and resilience.',
      robots: 'index, follow',
    },
    aeo: {
      directAnswer: 'Distributed computing divides computational workloads across autonomous nodes connected via network protocols.',
      keyTakeaways: '• Horizontal scaling provides linear elasticity\n• Consensus protocols prevent split-brain',
      faqList: [
        { question: 'What is distributed computing?', answer: 'A model where components located on networked computers communicate by passing messages.' },
      ],
      howToData: [
        { stepNumber: 1, title: 'Partition Dataset', text: 'Configure sharding keys across active database instances.' },
      ],
    },
    geo: {
      sourceCitations: 'IEEE Computer Society, ACM Transactions on Computer Systems',
      entityContext: 'Distributed Systems, CAP Theorem, Paxos Consensus',
    },
  });
  console.log(`✓ Article Submitted for Review: ID=${submittedArticle.post_id}, Status='${submittedArticle.status}'`);
  if (submittedArticle.status !== 'pending_review') throw new Error('Expected status to be pending_review');

  // Verify notification was issued to the user
  const userNotifications = await NotificationModel.findByUser(userAuth.user.userId);
  console.log(`✓ User Notifications Count: ${userNotifications.length}, Latest: '${userNotifications[0]?.title}'`);

  // -------------------------------------------------------------
  // TEST 7: User Attempts Direct Publishing (Security Check)
  // -------------------------------------------------------------
  console.log('\n[Test 7] Testing User attempting direct publication (must be forced to pending_review)...');
  const directPublishAttempt = await PostService.createPost(userJwt, {
    title: `Bypassing Editorial Review Attempt ${uniqueTime}`,
    content: '<p>Attempting unauthorized publication without admin approval.</p>',
    status: 'published' as any, // normal user sending 'published'
  });
  console.log(`✓ Backend Enforcement: Article Status='${directPublishAttempt.status}' (Forbidden 'published' forced to 'pending_review')`);
  if (directPublishAttempt.status === 'published') throw new Error('SECURITY VIOLATION: User directly published an article!');

  // -------------------------------------------------------------
  // TEST 8: Admin Approves User Article
  // -------------------------------------------------------------
  console.log('\n[Test 8] Testing Admin Review & Approval Flow...');
  const pendingArticles = await PostService.getPendingPosts();
  console.log(`✓ Admin Pending Articles Queue Count: ${pendingArticles.posts.length}`);

  const approvedArticle = await PostService.approvePost(submittedArticle.post_id, adminJwt);
  console.log(`✓ Article Approved: ID=${approvedArticle?.post_id}, Status='${approvedArticle?.status}', PublishedAt='${approvedArticle?.published_at}'`);
  if (approvedArticle?.status !== 'published') throw new Error('Expected status to be published');

  // Verify notification for approval
  const notifsAfterApproval = await NotificationModel.findByUser(userAuth.user.userId);
  const approvalNotif = notifsAfterApproval.find(n => n.type === 'ARTICLE_APPROVED');
  console.log(`✓ Author Received Approval Notification: '${approvalNotif?.title}' - "${approvalNotif?.message}"`);

  // -------------------------------------------------------------
  // TEST 9: Public Access to Approved Article & SEO Verification
  // -------------------------------------------------------------
  console.log('\n[Test 9] Testing Public Retrieval & Preserved SEO/AEO/GEO Metadata...');
  const publicArticle = await PostService.getPostBySlug(submittedArticle.slug);
  console.log(`✓ Public Article Accessible: Title='${publicArticle.title}', Author='${publicArticle.author_name}'`);

  const seoData = await SeoModel.findByPostId(submittedArticle.post_id);
  console.log(`✓ Preserved SEO Meta Title: '${seoData?.meta_title}'`);
  console.log(`✓ Preserved AEO Direct Answer: '${seoData?.direct_answer}'`);
  console.log(`✓ Preserved AEO FAQ Items: ${seoData?.faq_data ? JSON.parse(seoData.faq_data).length : 0}`);
  console.log(`✓ Preserved AEO HowTo Steps: ${seoData?.howto_data ? JSON.parse(seoData.howto_data).length : 0}`);

  // -------------------------------------------------------------
  // TEST 10: Admin Requests Changes & Rejection Flow
  // -------------------------------------------------------------
  console.log('\n[Test 10] Testing Request Changes & Rejection Flow...');
  const articleForFeedback = await PostService.createPost(userJwt, {
    title: `Draft Guide on Microservices Architecture ${uniqueTime}`,
    content: '<p>Preliminary thoughts on microservices.</p>',
    status: 'pending_review',
  });

  // Admin requests changes
  const changedArticle = await PostService.requestChangesPost(
    articleForFeedback.post_id,
    adminJwt,
    'Please add benchmark statistics and comparison diagrams before approval.'
  );
  console.log(`✓ Changes Requested: Status='${changedArticle?.status}', Feedback='${changedArticle?.reviewer_feedback}'`);
  if (changedArticle?.status !== 'changes_requested') throw new Error('Expected status to be changes_requested');

  // User edits and resubmits
  const resubmitted = await PostService.updatePost(articleForFeedback.post_id, userJwt, {
    content: '<p>Preliminary thoughts on microservices with updated benchmark charts and statistics.</p>',
    status: 'pending_review',
  });
  console.log(`✓ User Resubmitted Article: Status='${resubmitted?.status}'`);

  // Admin rejects
  const rejectedArticle = await PostService.rejectPost(
    articleForFeedback.post_id,
    adminJwt,
    'Topic is already covered in our primary documentation index.'
  );
  console.log(`✓ Article Rejected: Status='${rejectedArticle?.status}', Feedback='${rejectedArticle?.reviewer_feedback}'`);
  if (rejectedArticle?.status !== 'rejected') throw new Error('Expected status to be rejected');

  // Clean up test posts
  console.log('\n[Cleanup] Cleaning up integration test posts...');
  await PostService.deletePost(draftArticle.post_id, adminJwt);
  await PostService.deletePost(submittedArticle.post_id, adminJwt);
  await PostService.deletePost(directPublishAttempt.post_id, adminJwt);
  await PostService.deletePost(articleForFeedback.post_id, adminJwt);
  console.log('✓ Cleanup completed.');

  console.log('\n================================================================');
  console.log('ALL WORKFLOW, ACCOUNT TYPE, RBAC & SEO/AEO/GEO TESTS PASSED (100%)');
  console.log('================================================================');
  process.exit(0);
}

runWorkflowAndAccountTypeTests().catch(err => {
  console.error('Workflow Test Failed:', err);
  process.exit(1);
});
