-- ============================================================================
-- ModernBlog CMS - Oracle Database Schema
-- Script 02: Constraints (Foreign Keys, Unique & Check Constraints)
-- ============================================================================

-- 1. Users Table Constraints
ALTER TABLE users ADD CONSTRAINT fk_users_role 
    FOREIGN KEY (role_id) REFERENCES roles(role_id) ON DELETE CASCADE;

ALTER TABLE users ADD CONSTRAINT chk_users_status 
    CHECK (status IN ('ACTIVE', 'SUSPENDED', 'PENDING'));

-- 2. Categories Self-Referencing Parent Constraint
ALTER TABLE categories ADD CONSTRAINT fk_categories_parent 
    FOREIGN KEY (parent_id) REFERENCES categories(category_id) ON DELETE SET NULL;

-- 3. Posts Constraints
ALTER TABLE posts ADD CONSTRAINT fk_posts_author 
    FOREIGN KEY (author_id) REFERENCES users(user_id) ON DELETE CASCADE;

ALTER TABLE posts ADD CONSTRAINT fk_posts_category 
    FOREIGN KEY (category_id) REFERENCES categories(category_id) ON DELETE SET NULL;

ALTER TABLE posts ADD CONSTRAINT chk_posts_status 
    CHECK (status IN ('draft', 'published', 'scheduled', 'archived'));

ALTER TABLE posts ADD CONSTRAINT chk_posts_views 
    CHECK (views_count >= 0);

ALTER TABLE posts ADD CONSTRAINT chk_posts_reading_time 
    CHECK (reading_time >= 0);

-- 4. Post Tags Mapping Constraints
ALTER TABLE post_tags ADD CONSTRAINT fk_post_tags_post 
    FOREIGN KEY (post_id) REFERENCES posts(post_id) ON DELETE CASCADE;

ALTER TABLE post_tags ADD CONSTRAINT fk_post_tags_tag 
    FOREIGN KEY (tag_id) REFERENCES tags(tag_id) ON DELETE CASCADE;

-- 5. Comments Constraints (Includes Threaded Parent-Child FK)
ALTER TABLE comments ADD CONSTRAINT fk_comments_post 
    FOREIGN KEY (post_id) REFERENCES posts(post_id) ON DELETE CASCADE;

ALTER TABLE comments ADD CONSTRAINT fk_comments_user 
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE;

ALTER TABLE comments ADD CONSTRAINT fk_comments_parent 
    FOREIGN KEY (parent_comment_id) REFERENCES comments(comment_id) ON DELETE CASCADE;

ALTER TABLE comments ADD CONSTRAINT chk_comments_status 
    CHECK (status IN ('pending', 'approved', 'rejected', 'spam'));

-- 6. Post Likes Constraints
ALTER TABLE post_likes ADD CONSTRAINT fk_likes_post 
    FOREIGN KEY (post_id) REFERENCES posts(post_id) ON DELETE CASCADE;

ALTER TABLE post_likes ADD CONSTRAINT fk_likes_user 
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE;

-- 7. Bookmarks Constraints
ALTER TABLE bookmarks ADD CONSTRAINT fk_bookmarks_post 
    FOREIGN KEY (post_id) REFERENCES posts(post_id) ON DELETE CASCADE;

ALTER TABLE bookmarks ADD CONSTRAINT fk_bookmarks_user 
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE;

-- 8. Media Constraints
ALTER TABLE media ADD CONSTRAINT fk_media_user 
    FOREIGN KEY (uploaded_by) REFERENCES users(user_id) ON DELETE CASCADE;

-- 9. Newsletter Subscribers Constraints
ALTER TABLE newsletter_subscribers ADD CONSTRAINT chk_subscribers_status 
    CHECK (status IN ('SUBSCRIBED', 'UNSUBSCRIBED'));

-- 10. Contact Messages Constraints
ALTER TABLE contact_messages ADD CONSTRAINT chk_contact_status 
    CHECK (status IN ('UNREAD', 'READ', 'REPLIED', 'ARCHIVED'));

-- 11. Notifications Constraints
ALTER TABLE notifications ADD CONSTRAINT fk_notifications_user 
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE;

ALTER TABLE notifications ADD CONSTRAINT chk_notifications_read 
    CHECK (is_read IN (0, 1));

-- 12. Post Views Constraints
ALTER TABLE post_views ADD CONSTRAINT fk_post_views_post 
    FOREIGN KEY (post_id) REFERENCES posts(post_id) ON DELETE CASCADE;

ALTER TABLE post_views ADD CONSTRAINT fk_post_views_user 
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE SET NULL;

-- 13. SEO Metadata Constraints
ALTER TABLE seo_metadata ADD CONSTRAINT fk_seo_post 
    FOREIGN KEY (post_id) REFERENCES posts(post_id) ON DELETE CASCADE;

-- 14. Password Reset Tokens Constraints
ALTER TABLE password_reset_tokens ADD CONSTRAINT fk_reset_tokens_user 
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE;

-- 15. Newsletter Campaigns & Recipients Constraints
ALTER TABLE newsletter_campaigns ADD CONSTRAINT chk_campaigns_status 
    CHECK (status IN ('DRAFT', 'SENDING', 'SENT', 'CANCELLED'));

ALTER TABLE newsletter_campaign_recipients ADD CONSTRAINT fk_campaign_recipients_campaign 
    FOREIGN KEY (campaign_id) REFERENCES newsletter_campaigns(campaign_id) ON DELETE CASCADE;

ALTER TABLE newsletter_campaign_recipients ADD CONSTRAINT fk_campaign_recipients_sub 
    FOREIGN KEY (subscriber_id) REFERENCES newsletter_subscribers(subscriber_id) ON DELETE CASCADE;

ALTER TABLE newsletter_campaign_recipients ADD CONSTRAINT chk_recipients_status 
    CHECK (status IN ('PENDING', 'SENT', 'FAILED', 'BOUNCED'));
