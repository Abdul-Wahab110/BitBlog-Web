-- ============================================================================
-- BitBlog CMS - Oracle Database Schema
-- Script 03: Performance & Search Indexes
-- ============================================================================

-- 1. Users Indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_role ON users(role_id);
CREATE INDEX idx_users_status ON users(status);

-- 2. Posts Indexes
CREATE INDEX idx_posts_slug ON posts(slug);
CREATE INDEX idx_posts_status_published ON posts(status, published_at DESC);
CREATE INDEX idx_posts_author ON posts(author_id);
CREATE INDEX idx_posts_category ON posts(category_id);
CREATE INDEX idx_posts_scheduled ON posts(status, scheduled_at);

-- 3. Categories & Tags Indexes
CREATE INDEX idx_categories_slug ON categories(slug);
CREATE INDEX idx_categories_parent ON categories(parent_id);
CREATE INDEX idx_tags_slug ON tags(slug);

-- 4. Comments Indexes
CREATE INDEX idx_comments_post_status ON comments(post_id, status);
CREATE INDEX idx_comments_user ON comments(user_id);
CREATE INDEX idx_comments_parent ON comments(parent_comment_id);

-- 5. User Interaction Indexes (Likes & Bookmarks)
CREATE INDEX idx_likes_post ON post_likes(post_id);
CREATE INDEX idx_likes_user ON post_likes(user_id);
CREATE INDEX idx_bookmarks_user ON bookmarks(user_id);

-- 6. Analytics, SEO & Notifications Indexes
CREATE INDEX idx_post_views_post ON post_views(post_id, viewed_at);
CREATE INDEX idx_notifications_user ON notifications(user_id, is_read);
CREATE INDEX idx_seo_post ON seo_metadata(post_id);
CREATE INDEX idx_seo_page ON seo_metadata(page_identifier);
