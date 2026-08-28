-- ============================================================================
-- BitBlog CMS - Oracle Database Schema
-- Script 04: Reporting & Publication Views
-- ============================================================================

-- 1. Published Posts View
-- Provides a clean view of all published articles with author, category, comment count, and like count.
CREATE OR REPLACE VIEW published_posts_view AS
SELECT 
    p.post_id,
    p.title,
    p.slug,
    p.excerpt,
    p.featured_image,
    p.status,
    p.reading_time,
    p.views_count,
    p.published_at,
    p.created_at,
    p.updated_at,
    u.user_id AS author_id,
    u.name AS author_name,
    u.username AS author_username,
    u.profile_image AS author_avatar,
    c.category_id,
    c.name AS category_name,
    c.slug AS category_slug,
    (SELECT COUNT(*) FROM comments cm WHERE cm.post_id = p.post_id AND cm.status = 'approved') AS approved_comment_count,
    (SELECT COUNT(*) FROM post_likes pl WHERE pl.post_id = p.post_id) AS total_likes,
    (SELECT COUNT(*) FROM bookmarks bm WHERE bm.post_id = p.post_id) AS total_bookmarks
FROM posts p
JOIN users u ON p.author_id = u.user_id
LEFT JOIN categories c ON p.category_id = c.category_id
WHERE p.status = 'published' AND p.published_at <= CURRENT_TIMESTAMP;

-- 2. Post Statistics View
-- Aggregates engagement statistics for every article in the system.
CREATE OR REPLACE VIEW post_statistics_view AS
SELECT 
    p.post_id,
    p.title,
    p.slug,
    p.status,
    p.views_count,
    COUNT(DISTINCT cm.comment_id) AS total_comments,
    COUNT(DISTINCT CASE WHEN cm.status = 'approved' THEN cm.comment_id END) AS approved_comments,
    COUNT(DISTINCT pl.like_id) AS total_likes,
    COUNT(DISTINCT bm.bookmark_id) AS total_bookmarks,
    COUNT(DISTINCT pv.view_id) AS total_tracked_views
FROM posts p
LEFT JOIN comments cm ON p.post_id = cm.post_id
LEFT JOIN post_likes pl ON p.post_id = pl.post_id
LEFT JOIN bookmarks bm ON p.post_id = bm.post_id
LEFT JOIN post_views pv ON p.post_id = pv.post_id
GROUP BY p.post_id, p.title, p.slug, p.status, p.views_count;

-- 3. Author Statistics View
-- Provides overview metrics for content creators and editorial authors.
CREATE OR REPLACE VIEW author_statistics_view AS
SELECT 
    u.user_id AS author_id,
    u.name AS author_name,
    u.username AS author_username,
    u.email,
    u.status AS account_status,
    COUNT(DISTINCT p.post_id) AS total_posts,
    COUNT(DISTINCT CASE WHEN p.status = 'published' THEN p.post_id END) AS published_posts,
    COUNT(DISTINCT CASE WHEN p.status = 'draft' THEN p.post_id END) AS draft_posts,
    NVL(SUM(p.views_count), 0) AS total_article_views
FROM users u
JOIN roles r ON u.role_id = r.role_id
LEFT JOIN posts p ON u.user_id = p.author_id
WHERE r.role_name IN ('Admin', 'Editor', 'Author')
GROUP BY u.user_id, u.name, u.username, u.email, u.status;

-- 4. Category Statistics View
-- Summarizes content output across category taxonomies and subcategories.
CREATE OR REPLACE VIEW category_statistics_view AS
SELECT 
    c.category_id,
    c.name AS category_name,
    c.slug AS category_slug,
    c.parent_id,
    p_cat.name AS parent_category_name,
    COUNT(p.post_id) AS total_posts,
    COUNT(CASE WHEN p.status = 'published' THEN p.post_id END) AS published_posts
FROM categories c
LEFT JOIN categories p_cat ON c.parent_id = p_cat.category_id
LEFT JOIN posts p ON c.category_id = p.category_id
GROUP BY c.category_id, c.name, c.slug, c.parent_id, p_cat.name;
