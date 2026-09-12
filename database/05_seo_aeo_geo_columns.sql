-- ============================================================================
-- BitBlog CMS - Oracle Database Schema Migration
-- Script 05: AEO & GEO Metadata Columns Extension for seo_metadata
-- ============================================================================

ALTER TABLE seo_metadata ADD (
    direct_answer VARCHAR2(1000),
    faq_data CLOB,
    howto_data CLOB,
    key_takeaways VARCHAR2(2000),
    references_data VARCHAR2(2000)
);
