-- ============================================================================
-- ModernBlog CMS - Oracle Database Schema
-- Script 00: Optional System Roles Initializer
-- ============================================================================
-- NOTE: This file ONLY inserts the 4 fundamental system security roles required
-- for Role-Based Access Control (RBAC).
-- It DOES NOT insert fake users, fake posts, or demo content.
-- ============================================================================

INSERT INTO roles (role_name, description) 
VALUES ('Admin', 'Full system administration and infrastructure control privileges');

INSERT INTO roles (role_name, description) 
VALUES ('Editor', 'Content management, post approval, and comment moderation privileges');

INSERT INTO roles (role_name, description) 
VALUES ('Author', 'Article creation, editing, and submission privileges');

INSERT INTO roles (role_name, description) 
VALUES ('User', 'Registered reader with commenting, bookmarking, and liking privileges');

COMMIT;
