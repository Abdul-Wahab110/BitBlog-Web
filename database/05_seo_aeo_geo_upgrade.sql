-- ============================================================================
-- ModernBlog CMS - Oracle Database Schema Upgrade
-- Script 05: Professional SEO, AEO & GEO Metadata Upgrade
-- ============================================================================

-- Add advanced SEO, Twitter Card, Keyword & GEO columns to seo_metadata if not present
ALTER TABLE seo_metadata ADD (
    focus_keyword VARCHAR2(150),
    secondary_keywords VARCHAR2(500),
    search_intent VARCHAR2(50) DEFAULT 'informational',
    twitter_title VARCHAR2(255),
    twitter_description VARCHAR2(500),
    twitter_image VARCHAR2(500),
    twitter_card VARCHAR2(50) DEFAULT 'summary_large_image',
    image_alt_text VARCHAR2(255),
    direct_answer VARCHAR2(1000),
    key_takeaways CLOB,
    faq_data CLOB,
    howto_data CLOB,
    references_data CLOB,
    entity_context CLOB,
    factual_context CLOB,
    location_context VARCHAR2(255)
);

-- Index for Fast Post SEO Lookup
CREATE INDEX idx_seo_post_id ON seo_metadata(post_id);
CREATE INDEX idx_seo_focus_kw ON seo_metadata(focus_keyword);
