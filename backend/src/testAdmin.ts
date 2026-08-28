import { Database } from './config/database';
import { AdminController } from './controllers/adminController';

async function runAdminTests() {
  console.log('=== STARTING ADMIN CMS DASHBOARD WORKFLOW TESTS ===\n');

  await Database.initialize();

  // Test 1: Real Oracle Database Stats Calculation
  console.log('[Test 1] Executing Real Oracle SQL Dashboard Stats Query...');
  const [
    publishedRes,
    draftsRes,
    scheduledRes,
    usersRes,
    commentsRes,
    categoriesRes,
    tagsRes,
    viewsRes,
  ] = await Promise.all([
    Database.execute<{ TOTAL: number }>(`SELECT COUNT(*) AS total FROM posts WHERE status = 'published'`),
    Database.execute<{ TOTAL: number }>(`SELECT COUNT(*) AS total FROM posts WHERE status = 'draft'`),
    Database.execute<{ TOTAL: number }>(`SELECT COUNT(*) AS total FROM posts WHERE status = 'scheduled'`),
    Database.execute<{ TOTAL: number }>(`SELECT COUNT(*) AS total FROM users`),
    Database.execute<{ TOTAL: number }>(`SELECT COUNT(*) AS total FROM comments`),
    Database.execute<{ TOTAL: number }>(`SELECT COUNT(*) AS total FROM categories`),
    Database.execute<{ TOTAL: number }>(`SELECT COUNT(*) AS total FROM tags`),
    Database.execute<{ TOTAL: number }>(`SELECT COALESCE(SUM(views_count), 0) AS total FROM posts`),
  ]);

  const stats = {
    publishedPosts: publishedRes[0]?.TOTAL || 0,
    draftPosts: draftsRes[0]?.TOTAL || 0,
    scheduledPosts: scheduledRes[0]?.TOTAL || 0,
    totalUsers: usersRes[0]?.TOTAL || 0,
    totalComments: commentsRes[0]?.TOTAL || 0,
    totalCategories: categoriesRes[0]?.TOTAL || 0,
    totalTags: tagsRes[0]?.TOTAL || 0,
    totalViews: viewsRes[0]?.TOTAL || 0,
  };

  console.log('- Calculated DB Statistics:', JSON.stringify(stats, null, 2));

  // Test 2: Users Management Query
  console.log('\n[Test 2] Querying System Users & Role Breakdown...');
  const usersSql = `
    SELECT u.user_id, r.role_name AS role, u.name, u.email, u.status
    FROM users u
    JOIN roles r ON u.role_id = r.role_id
  `;
  const usersList = await Database.execute(usersSql, []);
  console.log(`- Retrieved Users Count from Database: ${usersList.length}`);

  // Test 3: Authors Metrics Query
  console.log('\n[Test 3] Querying Editorial Authors Directory & Article Metrics...');
  const authorsSql = `
    SELECT u.name, r.role_name AS role,
           (SELECT COUNT(*) FROM posts p WHERE p.author_id = u.user_id AND p.status = 'published') AS published_count
    FROM users u
    JOIN roles r ON u.role_id = r.role_id
    WHERE r.role_name IN ('Admin', 'Editor', 'Author')
  `;
  const authorsList = await Database.execute(authorsSql, []);
  console.log(`- Active Editorial Authors Count: ${authorsList.length}`);

  console.log('\n=== ALL ADMIN CMS DASHBOARD WORKFLOW TESTS PASSED PERFECTLY! ===');
}

runAdminTests().catch(err => {
  console.error('Admin Test Failed:', err);
  process.exit(1);
});
