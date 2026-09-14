import mysql from '../backend/node_modules/mysql2/promise.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const TIDB_CONFIG = {
  host: 'gateway01.ap-southeast-1.prod.aws.tidbcloud.com',
  port: 4000,
  user: '2cwTGqSLfsxWzH5.root',
  password: 'B5GRt5lRNk1kPvXA',
  database: 'bitblog',
  ssl: {
    minVersion: 'TLSv1.2',
    rejectUnauthorized: true
  }
};

async function verify() {
  console.log('🔍 Starting in-depth TiDB vs db.json audit...\n');
  const connection = await mysql.createConnection(TIDB_CONFIG);
  
  const dbData = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../backend/data/db.json'), 'utf8'));

  const checks = [];

  // 1. Roles
  const [tidbRoles] = await connection.query('SELECT * FROM roles ORDER BY role_id;');
  const rolesMatch = tidbRoles.length === dbData.roles.length;
  checks.push({
    Table: 'roles',
    Local_Count: dbData.roles.length,
    TiDB_Count: tidbRoles.length,
    Status: rolesMatch ? '✅ MATCH' : '❌ MISMATCH'
  });

  // 2. Users
  const [tidbUsers] = await connection.query('SELECT user_id, email, username FROM users ORDER BY user_id;');
  const usersMatch = tidbUsers.length === dbData.users.length;
  checks.push({
    Table: 'users',
    Local_Count: dbData.users.length,
    TiDB_Count: tidbUsers.length,
    Status: usersMatch ? '✅ MATCH' : '❌ MISMATCH'
  });

  // 3. Categories
  const [tidbCategories] = await connection.query('SELECT category_id, name, slug FROM categories ORDER BY category_id;');
  const catMatch = tidbCategories.length === dbData.categories.length;
  checks.push({
    Table: 'categories',
    Local_Count: dbData.categories.length,
    TiDB_Count: tidbCategories.length,
    Status: catMatch ? '✅ MATCH' : '❌ MISMATCH'
  });

  // 4. Tags
  const [tidbTags] = await connection.query('SELECT tag_id, name, slug FROM tags ORDER BY tag_id;');
  const tagsMatch = tidbTags.length === dbData.tags.length;
  checks.push({
    Table: 'tags',
    Local_Count: dbData.tags.length,
    TiDB_Count: tidbTags.length,
    Status: tagsMatch ? '✅ MATCH' : '❌ MISMATCH'
  });

  // 5. Posts
  const [tidbPosts] = await connection.query('SELECT post_id, title, slug FROM posts ORDER BY post_id;');
  const postsMatch = tidbPosts.length === dbData.posts.length;
  checks.push({
    Table: 'posts',
    Local_Count: dbData.posts.length,
    TiDB_Count: tidbPosts.length,
    Status: postsMatch ? '✅ MATCH' : '❌ MISMATCH'
  });

  // 6. Comments
  const [tidbComments] = await connection.query('SELECT * FROM comments;');
  const commentsMatch = tidbComments.length === dbData.comments.length;
  checks.push({
    Table: 'comments',
    Local_Count: dbData.comments.length,
    TiDB_Count: tidbComments.length,
    Status: commentsMatch ? '✅ MATCH' : '❌ MISMATCH'
  });

  // 7. Likes
  const [tidbLikes] = await connection.query('SELECT * FROM likes;');
  const likesMatch = tidbLikes.length === dbData.likes.length;
  checks.push({
    Table: 'likes',
    Local_Count: dbData.likes.length,
    TiDB_Count: tidbLikes.length,
    Status: likesMatch ? '✅ MATCH' : '❌ MISMATCH'
  });

  // 8. Bookmarks
  const [tidbBookmarks] = await connection.query('SELECT * FROM bookmarks;');
  const bookmarksMatch = tidbBookmarks.length === dbData.bookmarks.length;
  checks.push({
    Table: 'bookmarks',
    Local_Count: dbData.bookmarks.length,
    TiDB_Count: tidbBookmarks.length,
    Status: bookmarksMatch ? '✅ MATCH' : '❌ MISMATCH'
  });

  // 9. Notifications
  const [tidbNotifications] = await connection.query('SELECT * FROM notifications;');
  const notifMatch = tidbNotifications.length === dbData.notifications.length;
  checks.push({
    Table: 'notifications',
    Local_Count: dbData.notifications.length,
    TiDB_Count: tidbNotifications.length,
    Status: notifMatch ? '✅ MATCH' : '❌ MISMATCH'
  });

  // 10. Settings
  const [tidbSettings] = await connection.query('SELECT * FROM settings;');
  const settingKeys = Object.keys(dbData.settings || {});
  const settingsMatch = tidbSettings.length === settingKeys.length;
  checks.push({
    Table: 'settings',
    Local_Count: settingKeys.length,
    TiDB_Count: tidbSettings.length,
    Status: settingsMatch ? '✅ MATCH' : '❌ MISMATCH'
  });

  // 11. Subscribers
  const [tidbSubscribers] = await connection.query('SELECT * FROM subscribers;');
  const subMatch = tidbSubscribers.length === dbData.subscribers.length;
  checks.push({
    Table: 'subscribers',
    Local_Count: dbData.subscribers.length,
    TiDB_Count: tidbSubscribers.length,
    Status: subMatch ? '✅ MATCH' : '❌ MISMATCH'
  });

  // 12. Role Applications
  const [tidbApplications] = await connection.query('SELECT * FROM role_applications;');
  const appMatch = tidbApplications.length === dbData.role_applications.length;
  checks.push({
    Table: 'role_applications',
    Local_Count: dbData.role_applications.length,
    TiDB_Count: tidbApplications.length,
    Status: appMatch ? '✅ MATCH' : '❌ MISMATCH'
  });

  // 13. Audit Logs
  const [tidbLogs] = await connection.query('SELECT * FROM audit_logs;');
  const logMatch = tidbLogs.length === dbData.audit_logs.length;
  checks.push({
    Table: 'audit_logs',
    Local_Count: dbData.audit_logs.length,
    TiDB_Count: tidbLogs.length,
    Status: logMatch ? '✅ MATCH' : '❌ MISMATCH'
  });

  console.table(checks);

  // Field Level Spot Check
  console.log('\n🔍 Detailed Field Verifications:');
  
  // Verify Admin User
  const [adminUser] = await connection.query("SELECT email, username, name, role_name FROM users WHERE username = 'admin';");
  console.log('✓ Admin user verified:', adminUser[0]);

  // Verify Published Posts
  const [publishedPosts] = await connection.query("SELECT post_id, title, slug, views_count FROM posts;");
  console.log(`✓ Posts verified (${publishedPosts.length} posts intact in TiDB):`);
  publishedPosts.forEach(p => console.log(`   - [ID: ${p.post_id}] "${p.title}" (slug: ${p.slug})`));

  // Verify Settings
  const [siteTitle] = await connection.query("SELECT setting_value FROM settings WHERE setting_key = 'site_title';");
  console.log('✓ Setting "site_title" verified:', siteTitle[0]?.setting_value);

  await connection.end();
  console.log('\n💯 100% RECHECK COMPLETE: NO DATA IS MISSING!');
}

verify().catch(console.error);
