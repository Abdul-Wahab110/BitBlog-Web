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
  },
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

// Convert ISO strings or invalid dates to MySQL DATETIME format YYYY-MM-DD HH:MM:SS
function formatDateTime(val) {
  if (!val) return null;
  try {
    const d = new Date(val);
    if (isNaN(d.getTime())) return null;
    return d.toISOString().slice(0, 19).replace('T', ' ');
  } catch (e) {
    return null;
  }
}

function toJson(val) {
  if (val === undefined || val === null) return null;
  if (typeof val === 'string') {
    try {
      JSON.parse(val);
      return val;
    } catch {
      return JSON.stringify(val);
    }
  }
  return JSON.stringify(val);
}

async function main() {
  console.log('🚀 Connecting to TiDB Cloud gateway...');
  
  // Step 1: Connect to root/default database first to ensure `bitblog` database exists
  const initialConnection = await mysql.createConnection({
    host: TIDB_CONFIG.host,
    port: TIDB_CONFIG.port,
    user: TIDB_CONFIG.user,
    password: TIDB_CONFIG.password,
    ssl: TIDB_CONFIG.ssl
  });

  console.log('✅ Connected to TiDB server. Ensuring database "bitblog" exists...');
  await initialConnection.query('CREATE DATABASE IF NOT EXISTS bitblog CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;');
  await initialConnection.end();

  // Step 2: Connect to `bitblog` database
  const connection = await mysql.createConnection(TIDB_CONFIG);
  console.log('✅ Connected to `bitblog` database on TiDB!');

  // Read local db.json
  const dbPath = path.resolve(__dirname, '../backend/data/db.json');
  if (!fs.existsSync(dbPath)) {
    throw new Error('Local db.json not found at ' + dbPath);
  }
  const dbData = JSON.parse(fs.readFileSync(dbPath, 'utf8'));

  console.log('\n📦 Resetting & creating clean TiDB tables with BIGINT IDs...');

  // Drop existing tables in TiDB
  const tablesToDrop = [
    'audit_logs', 'role_applications', 'seo_metadata', 'media', 'subscribers',
    'messages', 'settings', 'notifications', 'bookmarks', 'likes',
    'comments', 'post_tags', 'posts', 'tags', 'categories', 'users', 'roles'
  ];

  for (const tbl of tablesToDrop) {
    await connection.query(`DROP TABLE IF EXISTS \`${tbl}\`;`);
  }

  // 1. Roles table
  await connection.query(`
    CREATE TABLE roles (
      role_id BIGINT AUTO_INCREMENT PRIMARY KEY,
      role_name VARCHAR(50) NOT NULL UNIQUE,
      description VARCHAR(255),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);

  // 2. Users table
  await connection.query(`
    CREATE TABLE users (
      user_id BIGINT AUTO_INCREMENT PRIMARY KEY,
      role_id BIGINT NOT NULL,
      role_name VARCHAR(50),
      name VARCHAR(100) NOT NULL,
      username VARCHAR(50) NOT NULL UNIQUE,
      email VARCHAR(255) NOT NULL UNIQUE,
      password_hash VARCHAR(255) NOT NULL,
      profile_image VARCHAR(500),
      bio TEXT,
      website VARCHAR(255),
      author_tags JSON,
      social_links JSON,
      short_description TEXT,
      is_verified BOOLEAN DEFAULT FALSE,
      verification_token VARCHAR(255),
      verification_expires DATETIME,
      status VARCHAR(20) DEFAULT 'ACTIVE' NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      last_login DATETIME
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);

  // 3. Categories table
  await connection.query(`
    CREATE TABLE categories (
      category_id BIGINT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(100) NOT NULL UNIQUE,
      slug VARCHAR(120) NOT NULL UNIQUE,
      description TEXT,
      image VARCHAR(500),
      image_url VARCHAR(500),
      parent_id BIGINT,
      parent_category_id BIGINT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);

  // 4. Tags table
  await connection.query(`
    CREATE TABLE tags (
      tag_id BIGINT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(50) NOT NULL UNIQUE,
      slug VARCHAR(60) NOT NULL UNIQUE,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);

  // 5. Posts table
  await connection.query(`
    CREATE TABLE posts (
      post_id BIGINT AUTO_INCREMENT PRIMARY KEY,
      author_id BIGINT NOT NULL,
      author_name VARCHAR(100),
      author_username VARCHAR(50),
      author_avatar VARCHAR(500),
      category_id BIGINT,
      category_name VARCHAR(100),
      category_slug VARCHAR(120),
      title VARCHAR(255) NOT NULL,
      slug VARCHAR(255) NOT NULL UNIQUE,
      excerpt TEXT,
      content LONGTEXT,
      featured_image VARCHAR(500),
      status VARCHAR(50) DEFAULT 'draft' NOT NULL,
      published_at DATETIME,
      scheduled_at DATETIME,
      reviewer_feedback TEXT,
      reviewed_by BIGINT,
      reviewed_at DATETIME,
      reading_time INT DEFAULT 1,
      views_count INT DEFAULT 0,
      comment_count INT DEFAULT 0,
      like_count INT DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      tag_ids JSON
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);

  // 6. Post_Tags junction table
  await connection.query(`
    CREATE TABLE post_tags (
      post_id BIGINT NOT NULL,
      tag_id BIGINT NOT NULL,
      PRIMARY KEY (post_id, tag_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);

  // 7. Comments table
  await connection.query(`
    CREATE TABLE comments (
      comment_id BIGINT AUTO_INCREMENT PRIMARY KEY,
      post_id BIGINT NOT NULL,
      user_id BIGINT NOT NULL,
      parent_comment_id BIGINT,
      author_name VARCHAR(100),
      author_username VARCHAR(50),
      author_avatar VARCHAR(500),
      author_role VARCHAR(50),
      content TEXT NOT NULL,
      status VARCHAR(20) DEFAULT 'APPROVED' NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);

  // 8. Likes table
  await connection.query(`
    CREATE TABLE likes (
      like_id BIGINT AUTO_INCREMENT PRIMARY KEY,
      post_id BIGINT NOT NULL,
      user_id BIGINT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE KEY unique_user_post_like (post_id, user_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);

  // 9. Bookmarks table
  await connection.query(`
    CREATE TABLE bookmarks (
      bookmark_id BIGINT AUTO_INCREMENT PRIMARY KEY,
      post_id BIGINT NOT NULL,
      user_id BIGINT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE KEY unique_user_post_bookmark (post_id, user_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);

  // 10. Notifications table
  await connection.query(`
    CREATE TABLE notifications (
      notification_id BIGINT AUTO_INCREMENT PRIMARY KEY,
      user_id BIGINT NOT NULL,
      title VARCHAR(255) NOT NULL,
      message TEXT NOT NULL,
      type VARCHAR(50),
      link_url VARCHAR(500),
      is_read BOOLEAN DEFAULT FALSE,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);

  // 11. Settings table
  await connection.query(`
    CREATE TABLE settings (
      setting_key VARCHAR(100) PRIMARY KEY,
      setting_value TEXT,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);

  // 12. Messages / Contact table
  await connection.query(`
    CREATE TABLE messages (
      message_id BIGINT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      email VARCHAR(255) NOT NULL,
      subject VARCHAR(255),
      message TEXT NOT NULL,
      status VARCHAR(20) DEFAULT 'UNREAD',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);

  // 13. Subscribers table
  await connection.query(`
    CREATE TABLE subscribers (
      subscriber_id BIGINT AUTO_INCREMENT PRIMARY KEY,
      email VARCHAR(255) NOT NULL UNIQUE,
      name VARCHAR(100),
      topics JSON,
      status VARCHAR(50) DEFAULT 'SUBSCRIBED',
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      subscribed_at DATETIME,
      unsubscribed_at DATETIME
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);

  // 14. Media table
  await connection.query(`
    CREATE TABLE media (
      media_id BIGINT AUTO_INCREMENT PRIMARY KEY,
      filename VARCHAR(255) NOT NULL,
      original_name VARCHAR(255) NOT NULL,
      url VARCHAR(500) NOT NULL,
      mimetype VARCHAR(100),
      size BIGINT,
      alt_text VARCHAR(255),
      uploaded_by BIGINT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);

  // 15. SEO & AEO & GEO Metadata table
  await connection.query(`
    CREATE TABLE seo_metadata (
      seo_id BIGINT AUTO_INCREMENT PRIMARY KEY,
      post_id BIGINT,
      page_identifier VARCHAR(100),
      meta_title VARCHAR(255),
      meta_description TEXT,
      canonical_url VARCHAR(500),
      og_title VARCHAR(255),
      og_description TEXT,
      og_image VARCHAR(500),
      twitter_title VARCHAR(255),
      twitter_description TEXT,
      twitter_image VARCHAR(500),
      twitter_card VARCHAR(50),
      robots VARCHAR(100),
      focus_keyword VARCHAR(100),
      secondary_keywords TEXT,
      search_intent VARCHAR(100),
      image_alt_text TEXT,
      direct_answer TEXT,
      key_takeaways TEXT,
      faq_data JSON,
      howto_data JSON,
      references_data JSON,
      entity_context TEXT,
      factual_context TEXT,
      location_context TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);

  // 16. Role Applications table
  await connection.query(`
    CREATE TABLE role_applications (
      application_id BIGINT AUTO_INCREMENT PRIMARY KEY,
      user_id BIGINT NOT NULL,
      name VARCHAR(100) NOT NULL,
      username VARCHAR(50) NOT NULL,
      email VARCHAR(255) NOT NULL,
      role_applied VARCHAR(50) NOT NULL,
      bio TEXT,
      sample_urls TEXT,
      topics JSON,
      motivation TEXT,
      status VARCHAR(50) DEFAULT 'pending',
      feedback TEXT,
      reviewed_by BIGINT,
      reviewed_at DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);

  // 17. Audit Logs table
  await connection.query(`
    CREATE TABLE audit_logs (
      log_id BIGINT AUTO_INCREMENT PRIMARY KEY,
      user_id BIGINT,
      user_name VARCHAR(100),
      user_role VARCHAR(50),
      action VARCHAR(100) NOT NULL,
      category VARCHAR(50),
      details TEXT,
      ip_address VARCHAR(100),
      severity VARCHAR(20) DEFAULT 'info',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);

  console.log('✅ All 17 tables created cleanly in TiDB!');

  console.log('\n🔄 Inserting data into TiDB...');

  // 1. Insert Roles
  if (dbData.roles?.length) {
    for (const r of dbData.roles) {
      await connection.query(
        `INSERT INTO roles (role_id, role_name, description)
         VALUES (?, ?, ?)
         ON DUPLICATE KEY UPDATE role_name=VALUES(role_name), description=VALUES(description);`,
        [r.role_id, r.role_name, r.description]
      );
    }
    console.log(`✓ Roles inserted (${dbData.roles.length} records)`);
  }

  // 2. Insert Users
  if (dbData.users?.length) {
    for (const u of dbData.users) {
      await connection.query(
        `INSERT INTO users (
          user_id, role_id, role_name, name, username, email, password_hash,
          profile_image, bio, website, author_tags, social_links, short_description,
          is_verified, status, created_at, updated_at, last_login
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
          role_id=VALUES(role_id), role_name=VALUES(role_name), name=VALUES(name),
          email=VALUES(email), password_hash=VALUES(password_hash), profile_image=VALUES(profile_image),
          bio=VALUES(bio), website=VALUES(website), author_tags=VALUES(author_tags),
          social_links=VALUES(social_links), short_description=VALUES(short_description),
          is_verified=VALUES(is_verified), status=VALUES(status),
          updated_at=VALUES(updated_at), last_login=VALUES(last_login);`,
        [
          u.user_id,
          u.role_id || 4,
          u.role_name || 'User',
          u.name,
          u.username,
          u.email,
          u.password_hash,
          u.profile_image || null,
          u.bio || null,
          u.website || null,
          toJson(u.author_tags),
          toJson(u.social_links),
          u.short_description || null,
          u.is_verified ? 1 : 0,
          u.status || 'ACTIVE',
          formatDateTime(u.created_at),
          formatDateTime(u.updated_at),
          formatDateTime(u.last_login)
        ]
      );
    }
    console.log(`✓ Users inserted (${dbData.users.length} records)`);
  }

  // 3. Insert Categories
  if (dbData.categories?.length) {
    for (const c of dbData.categories) {
      await connection.query(
        `INSERT INTO categories (
          category_id, name, slug, description, image, image_url, parent_id, parent_category_id, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
          name=VALUES(name), slug=VALUES(slug), description=VALUES(description),
          image=VALUES(image), image_url=VALUES(image_url),
          parent_id=VALUES(parent_id), parent_category_id=VALUES(parent_category_id),
          updated_at=VALUES(updated_at);`,
        [
          c.category_id,
          c.name,
          c.slug,
          c.description || null,
          c.image || null,
          c.image_url || null,
          c.parent_id || null,
          c.parent_category_id || null,
          formatDateTime(c.created_at),
          formatDateTime(c.updated_at)
        ]
      );
    }
    console.log(`✓ Categories inserted (${dbData.categories.length} records)`);
  }

  // 4. Insert Tags
  if (dbData.tags?.length) {
    for (const t of dbData.tags) {
      await connection.query(
        `INSERT INTO tags (tag_id, name, slug, created_at)
         VALUES (?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE name=VALUES(name), slug=VALUES(slug);`,
        [t.tag_id, t.name, t.slug, formatDateTime(t.created_at)]
      );
    }
    console.log(`✓ Tags inserted (${dbData.tags.length} records)`);
  }

  // 5. Insert Posts
  if (dbData.posts?.length) {
    for (const p of dbData.posts) {
      await connection.query(
        `INSERT INTO posts (
          post_id, author_id, author_name, author_username, author_avatar,
          category_id, category_name, category_slug, title, slug, excerpt,
          content, featured_image, status, published_at, scheduled_at,
          reviewer_feedback, reviewed_by, reviewed_at, reading_time,
          views_count, comment_count, like_count, created_at, updated_at, tag_ids
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
          author_id=VALUES(author_id), author_name=VALUES(author_name),
          author_username=VALUES(author_username), author_avatar=VALUES(author_avatar),
          category_id=VALUES(category_id), category_name=VALUES(category_name),
          category_slug=VALUES(category_slug), title=VALUES(title), slug=VALUES(slug),
          excerpt=VALUES(excerpt), content=VALUES(content), featured_image=VALUES(featured_image),
          status=VALUES(status), published_at=VALUES(published_at), scheduled_at=VALUES(scheduled_at),
          reviewer_feedback=VALUES(reviewer_feedback), reviewed_by=VALUES(reviewed_by),
          reviewed_at=VALUES(reviewed_at), reading_time=VALUES(reading_time),
          views_count=VALUES(views_count), comment_count=VALUES(comment_count),
          like_count=VALUES(like_count), updated_at=VALUES(updated_at), tag_ids=VALUES(tag_ids);`,
        [
          p.post_id,
          p.author_id,
          p.author_name || null,
          p.author_username || null,
          p.author_avatar || null,
          p.category_id || null,
          p.category_name || null,
          p.category_slug || null,
          p.title,
          p.slug,
          p.excerpt || null,
          p.content || '',
          p.featured_image || null,
          p.status || 'draft',
          formatDateTime(p.published_at),
          formatDateTime(p.scheduled_at),
          p.reviewer_feedback || null,
          p.reviewed_by || null,
          formatDateTime(p.reviewed_at),
          p.reading_time || 1,
          p.views_count || 0,
          p.comment_count || 0,
          p.like_count || 0,
          formatDateTime(p.created_at),
          formatDateTime(p.updated_at),
          toJson(p.tag_ids)
        ]
      );

      // Populate post_tags junction
      if (Array.isArray(p.tag_ids)) {
        for (const tagId of p.tag_ids) {
          await connection.query(
            `INSERT IGNORE INTO post_tags (post_id, tag_id) VALUES (?, ?);`,
            [p.post_id, tagId]
          );
        }
      }
    }
    console.log(`✓ Posts inserted (${dbData.posts.length} records)`);
  }

  // 6. Insert Comments
  if (dbData.comments?.length) {
    for (const c of dbData.comments) {
      await connection.query(
        `INSERT INTO comments (
          comment_id, post_id, user_id, author_name, author_username, author_avatar, author_role, content, status, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
          content=VALUES(content), status=VALUES(status), updated_at=VALUES(updated_at);`,
        [
          c.comment_id,
          c.post_id,
          c.user_id,
          c.author_name || null,
          c.author_username || null,
          c.author_avatar || null,
          c.author_role || null,
          c.content,
          c.status || 'APPROVED',
          formatDateTime(c.created_at),
          formatDateTime(c.updated_at)
        ]
      );
    }
    console.log(`✓ Comments inserted (${dbData.comments.length} records)`);
  }

  // 7. Insert Likes
  if (dbData.likes?.length) {
    for (const l of dbData.likes) {
      await connection.query(
        `INSERT INTO likes (like_id, post_id, user_id, created_at)
         VALUES (?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE created_at=VALUES(created_at);`,
        [l.like_id, l.post_id, l.user_id, formatDateTime(l.created_at)]
      );
    }
    console.log(`✓ Likes inserted (${dbData.likes.length} records)`);
  }

  // 8. Insert Bookmarks
  if (dbData.bookmarks?.length) {
    for (const b of dbData.bookmarks) {
      await connection.query(
        `INSERT INTO bookmarks (bookmark_id, post_id, user_id, created_at)
         VALUES (?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE created_at=VALUES(created_at);`,
        [b.bookmark_id, b.post_id, b.user_id, formatDateTime(b.created_at)]
      );
    }
    console.log(`✓ Bookmarks inserted (${dbData.bookmarks.length} records)`);
  }

  // 9. Insert Notifications
  if (dbData.notifications?.length) {
    for (const n of dbData.notifications) {
      await connection.query(
        `INSERT INTO notifications (notification_id, user_id, title, message, type, link_url, is_read, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE is_read=VALUES(is_read);`,
        [
          n.notification_id,
          n.user_id,
          n.title,
          n.message,
          n.type || null,
          n.link_url || null,
          n.is_read ? 1 : 0,
          formatDateTime(n.created_at)
        ]
      );
    }
    console.log(`✓ Notifications inserted (${dbData.notifications.length} records)`);
  }

  // 10. Insert Settings
  if (dbData.settings && typeof dbData.settings === 'object') {
    const keys = Object.keys(dbData.settings);
    for (const k of keys) {
      const val = typeof dbData.settings[k] === 'object' ? JSON.stringify(dbData.settings[k]) : String(dbData.settings[k]);
      await connection.query(
        `INSERT INTO settings (setting_key, setting_value)
         VALUES (?, ?)
         ON DUPLICATE KEY UPDATE setting_value=VALUES(setting_value);`,
        [k, val]
      );
    }
    console.log(`✓ Settings inserted (${keys.length} key-value pairs)`);
  }

  // 11. Insert Subscribers
  if (dbData.subscribers?.length) {
    for (const s of dbData.subscribers) {
      await connection.query(
        `INSERT INTO subscribers (subscriber_id, email, name, topics, status, notes, created_at, subscribed_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE
           name=VALUES(name), topics=VALUES(topics), status=VALUES(status), notes=VALUES(notes);`,
        [
          s.subscriber_id,
          s.email,
          s.name || null,
          toJson(s.topics),
          s.status || 'SUBSCRIBED',
          s.notes || null,
          formatDateTime(s.created_at),
          formatDateTime(s.subscribed_at)
        ]
      );
    }
    console.log(`✓ Subscribers inserted (${dbData.subscribers.length} records)`);
  }

  // 12. Insert Role Applications
  if (dbData.role_applications?.length) {
    for (const a of dbData.role_applications) {
      await connection.query(
        `INSERT INTO role_applications (
          application_id, user_id, name, username, email, role_applied,
          bio, sample_urls, topics, motivation, status, feedback, reviewed_by, reviewed_at, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
          status=VALUES(status), feedback=VALUES(feedback), reviewed_by=VALUES(reviewed_by),
          reviewed_at=VALUES(reviewed_at), updated_at=VALUES(updated_at);`,
        [
          a.application_id,
          a.user_id,
          a.name,
          a.username,
          a.email,
          a.role_applied,
          a.bio || null,
          a.sample_urls || null,
          toJson(a.topics),
          a.motivation || null,
          a.status || 'pending',
          a.feedback || null,
          a.reviewed_by || null,
          formatDateTime(a.reviewed_at),
          formatDateTime(a.created_at),
          formatDateTime(a.updated_at)
        ]
      );
    }
    console.log(`✓ Role Applications inserted (${dbData.role_applications.length} records)`);
  }

  // 13. Insert Audit Logs
  if (dbData.audit_logs?.length) {
    for (const log of dbData.audit_logs) {
      await connection.query(
        `INSERT INTO audit_logs (
          log_id, user_id, user_name, user_role, action, category, details, ip_address, severity, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE details=VALUES(details);`,
        [
          log.log_id,
          log.user_id || null,
          log.user_name || 'System',
          log.user_role || 'User',
          log.action,
          log.category || 'AUTH',
          log.details || '',
          log.ip_address || null,
          log.severity || 'info',
          formatDateTime(log.created_at)
        ]
      );
    }
    console.log(`✓ Audit Logs inserted (${dbData.audit_logs.length} records)`);
  }

  // Final Verification
  console.log('\n📊 === TiDB CLOUD VERIFICATION SUMMARY ===');
  const [tables] = await connection.query(`
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'bitblog'
    ORDER BY table_name;
  `);

  for (const t of tables) {
    const tableName = t.TABLE_NAME || t.table_name;
    const [cnt] = await connection.query(`SELECT COUNT(*) as cnt FROM \`${tableName}\`;`);
    console.log(`  ✓ ${tableName.padEnd(20)}: ${cnt[0].cnt} rows`);
  }

  await connection.end();
  console.log('\n🎉 ALL DATABASE TABLES AND DATA SUCCESSFULLY UPLOADED TO TIDB!');
}

main().catch(err => {
  console.error('❌ Migration Error:', err);
  process.exit(1);
});
