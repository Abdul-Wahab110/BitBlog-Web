-- ============================================================================
-- BitBlog CMS - Oracle Database Schema
-- Script 01: Table Definitions
-- ============================================================================
-- Compatible with Oracle Database 12c, 18c, 19c, 21c, 23c
--
-- EXECUTION ORDER:
--   1. 01_create_tables.sql  (Table DDL)
--   2. 02_constraints.sql    (Foreign Keys, Unique & Check Constraints)
--   3. 03_indexes.sql        (Performance & Search Indexes)
--   4. 04_views.sql          (System Reporting & Publication Views)
--   5. 00_initial_roles.sql   (Optional System Roles Setup)
-- ============================================================================

-- 1. Roles Table
CREATE TABLE roles (
    role_id NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    role_name VARCHAR2(50) NOT NULL UNIQUE,
    description VARCHAR2(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- 2. Users Table
CREATE TABLE users (
    user_id NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    role_id NUMBER NOT NULL,
    name VARCHAR2(100) NOT NULL,
    username VARCHAR2(50) NOT NULL UNIQUE,
    email VARCHAR2(255) NOT NULL UNIQUE,
    password_hash VARCHAR2(255) NOT NULL,
    profile_image VARCHAR2(500),
    bio VARCHAR2(1000),
    status VARCHAR2(20) DEFAULT 'ACTIVE' NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    last_login TIMESTAMP
);

-- 3. Categories Table (Supports Parent Categories & Subcategories)
CREATE TABLE categories (
    category_id NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name VARCHAR2(100) NOT NULL UNIQUE,
    slug VARCHAR2(120) NOT NULL UNIQUE,
    description VARCHAR2(500),
    image VARCHAR2(500),
    parent_id NUMBER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- 4. Tags Table
CREATE TABLE tags (
    tag_id NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name VARCHAR2(50) NOT NULL UNIQUE,
    slug VARCHAR2(60) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- 5. Posts Table
CREATE TABLE posts (
    post_id NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    author_id NUMBER NOT NULL,
    category_id NUMBER,
    title VARCHAR2(255) NOT NULL,
    slug VARCHAR2(300) NOT NULL UNIQUE,
    excerpt VARCHAR2(1000),
    content CLOB NOT NULL,
    featured_image VARCHAR2(500),
    status VARCHAR2(20) DEFAULT 'draft' NOT NULL,
    published_at TIMESTAMP,
    scheduled_at TIMESTAMP,
    reading_time NUMBER DEFAULT 5 NOT NULL,
    views_count NUMBER DEFAULT 0 NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- 6. Post Tags Mapping Table (Many-to-Many Relationship)
CREATE TABLE post_tags (
    post_id NUMBER NOT NULL,
    tag_id NUMBER NOT NULL,
    PRIMARY KEY (post_id, tag_id)
);

-- 7. Comments Table (Supports Nested Threaded Replies)
CREATE TABLE comments (
    comment_id NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    post_id NUMBER NOT NULL,
    user_id NUMBER NOT NULL,
    parent_comment_id NUMBER,
    content VARCHAR2(2000) NOT NULL,
    status VARCHAR2(20) DEFAULT 'pending' NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- 8. Post Likes Table (Unique Per User & Post)
CREATE TABLE post_likes (
    like_id NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    post_id NUMBER NOT NULL,
    user_id NUMBER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT uq_post_likes UNIQUE (post_id, user_id)
);

-- 9. Bookmarks Table (Unique Per User & Post)
CREATE TABLE bookmarks (
    bookmark_id NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    post_id NUMBER NOT NULL,
    user_id NUMBER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT uq_bookmarks UNIQUE (post_id, user_id)
);

-- 10. Media Files Table
CREATE TABLE media (
    media_id NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    uploaded_by NUMBER NOT NULL,
    file_name VARCHAR2(255) NOT NULL,
    file_path VARCHAR2(500) NOT NULL,
    file_type VARCHAR2(100) NOT NULL,
    file_size NUMBER NOT NULL,
    alt_text VARCHAR2(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- 11. Newsletter Subscribers Table
CREATE TABLE newsletter_subscribers (
    subscriber_id NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    email VARCHAR2(255) NOT NULL UNIQUE,
    status VARCHAR2(20) DEFAULT 'SUBSCRIBED' NOT NULL,
    subscribed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    unsubscribed_at TIMESTAMP
);

-- 12. Contact Messages Table
CREATE TABLE contact_messages (
    message_id NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name VARCHAR2(100) NOT NULL,
    email VARCHAR2(255) NOT NULL,
    subject VARCHAR2(200) NOT NULL,
    message VARCHAR2(4000) NOT NULL,
    status VARCHAR2(20) DEFAULT 'UNREAD' NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- 13. Notifications Table
CREATE TABLE notifications (
    notification_id NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id NUMBER NOT NULL,
    type VARCHAR2(50) NOT NULL,
    title VARCHAR2(200) NOT NULL,
    message VARCHAR2(1000) NOT NULL,
    is_read NUMBER(1) DEFAULT 0 NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- 14. Post Views Table (Privacy-Safe Analytics Log)
CREATE TABLE post_views (
    view_id NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    post_id NUMBER NOT NULL,
    user_id NUMBER,
    ip_hash VARCHAR2(64),
    user_agent VARCHAR2(500),
    viewed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- 15. SEO Metadata Table
CREATE TABLE seo_metadata (
    seo_id NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    post_id NUMBER,
    page_identifier VARCHAR2(100),
    meta_title VARCHAR2(255),
    meta_description VARCHAR2(500),
    canonical_url VARCHAR2(500),
    og_title VARCHAR2(255),
    og_description VARCHAR2(500),
    og_image VARCHAR2(500),
    twitter_title VARCHAR2(255),
    twitter_description VARCHAR2(500),
    twitter_image VARCHAR2(500),
    twitter_card VARCHAR2(50) DEFAULT 'summary_large_image',
    robots VARCHAR2(100) DEFAULT 'index, follow',
    focus_keyword VARCHAR2(150),
    secondary_keywords VARCHAR2(500),
    search_intent VARCHAR2(50) DEFAULT 'informational',
    image_alt_text VARCHAR2(255),
    direct_answer VARCHAR2(1000),
    key_takeaways CLOB,
    faq_data CLOB,
    howto_data CLOB,
    references_data CLOB,
    entity_context CLOB,
    factual_context CLOB,
    location_context VARCHAR2(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- 16. Site Settings Table
CREATE TABLE site_settings (
    setting_id NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    setting_key VARCHAR2(100) NOT NULL UNIQUE,
    setting_value CLOB,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- 17. Password Reset Tokens Table
CREATE TABLE password_reset_tokens (
    token_id NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id NUMBER NOT NULL,
    token_hash VARCHAR2(255) NOT NULL UNIQUE,
    expires_at TIMESTAMP NOT NULL,
    used_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- 18. Newsletter Campaigns Table
CREATE TABLE newsletter_campaigns (
    campaign_id NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    subject VARCHAR2(255) NOT NULL,
    content CLOB NOT NULL,
    status VARCHAR2(20) DEFAULT 'DRAFT' NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    sent_at TIMESTAMP
);

-- 19. Newsletter Campaign Recipients Table
CREATE TABLE newsletter_campaign_recipients (
    recipient_id NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    campaign_id NUMBER NOT NULL,
    subscriber_id NUMBER NOT NULL,
    status VARCHAR2(20) DEFAULT 'PENDING' NOT NULL,
    sent_at TIMESTAMP
);
