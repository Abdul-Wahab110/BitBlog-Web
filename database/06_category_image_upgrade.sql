-- ===============================================================
-- BITBLOG CMS — CATEGORY IMAGE SCHEMA MIGRATION
-- Safe upgrade script for categories table image column
-- ===============================================================

BEGIN
    EXECUTE IMMEDIATE 'ALTER TABLE categories ADD image VARCHAR2(500)';
EXCEPTION
    WHEN OTHERS THEN
        IF SQLCODE != -1430 THEN -- ORA-01430: column being added already exists in table
            NULL; -- Ignore if column already exists
        END IF;
END;
/
