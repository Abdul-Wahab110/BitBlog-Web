-- ============================================================================
-- BitBlog CMS - Migration 06: Article Review Workflow & Multi-Role Submission
-- ============================================================================

-- 1. Add review workflow columns to posts table if not exists
BEGIN
  EXECUTE IMMEDIATE 'ALTER TABLE posts ADD (
    reviewer_feedback VARCHAR2(1000),
    reviewed_by NUMBER,
    reviewed_at TIMESTAMP
  )';
EXCEPTION
  WHEN OTHERS THEN
    IF SQLCODE != -01430 THEN -- ORA-01430: column being added already exists in table
      RAISE;
    END IF;
END;
/

-- 2. Ensure post status constraint supports review workflow: draft, pending_review, changes_requested, rejected, published, scheduled, archived
BEGIN
  EXECUTE IMMEDIATE 'ALTER TABLE posts DROP CONSTRAINT chk_posts_status';
EXCEPTION
  WHEN OTHERS THEN NULL;
END;
/

BEGIN
  EXECUTE IMMEDIATE 'ALTER TABLE posts ADD CONSTRAINT chk_posts_status CHECK (status IN (''draft'', ''pending_review'', ''changes_requested'', ''rejected'', ''published'', ''scheduled'', ''archived''))';
EXCEPTION
  WHEN OTHERS THEN NULL;
END;
/

-- 3. Create index for fast pending review queries
BEGIN
  EXECUTE IMMEDIATE 'CREATE INDEX idx_posts_pending_review ON posts (status, updated_at)';
EXCEPTION
  WHEN OTHERS THEN NULL;
END;
/

COMMIT;
