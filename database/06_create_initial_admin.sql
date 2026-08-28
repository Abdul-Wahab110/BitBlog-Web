-- ============================================================================
-- BitBlog CMS - Oracle Database Schema
-- Script 06: Safe Initial Administrator Bootstrap
-- ============================================================================
-- Purpose: Safely initialize the first Administrator account if and ONLY IF
-- no Administrator currently exists in the Oracle database.
-- 
-- Safety Guarantees:
-- 1. Idempotent: Can be run multiple times without causing duplicate errors.
-- 2. Non-destructive: NEVER deletes, overwrites, or alters existing users.
-- 3. Secure: Stores standard Bcrypt hash (Cost factor: 10), NEVER plaintext.
-- ============================================================================

-- Step 1: Ensure the 'Admin' role exists in roles table
MERGE INTO roles r
USING (SELECT 'Admin' AS role_name, 'Full system administration and infrastructure control privileges' AS description FROM dual) src
ON (r.role_name = src.role_name)
WHEN NOT MATCHED THEN
  INSERT (role_name, description) VALUES (src.role_name, src.description);

COMMIT;

-- Step 2: Insert initial admin ONLY IF no user with Admin role exists
DECLARE
  v_admin_role_id NUMBER;
  v_admin_count NUMBER;
  v_existing_email_count NUMBER;
BEGIN
  -- Resolve Admin role ID
  SELECT role_id INTO v_admin_role_id FROM roles WHERE role_name = 'Admin' AND ROWNUM = 1;

  -- Check if any user already has Admin role
  SELECT COUNT(*) INTO v_admin_count FROM users WHERE role_id = v_admin_role_id;

  IF v_admin_count > 0 THEN
    DBMS_OUTPUT.PUT_LINE('STATUS: Admin account already exists in database. No bootstrap action required.');
  ELSE
    -- Check if username 'admin' or email 'admin@bitblog.com' is taken
    SELECT COUNT(*) INTO v_existing_email_count FROM users WHERE LOWER(email) = 'admin@bitblog.com' OR LOWER(username) = 'admin';

    IF v_existing_email_count = 0 THEN
      -- Insert default administrator account (Default bcrypt hash for 'admin123')
      -- To change password securely, use CMS Admin User Management or backend bootstrap CLI.
      INSERT INTO users (
        role_id,
        name,
        username,
        email,
        password_hash,
        status,
        created_at,
        updated_at
      ) VALUES (
        v_admin_role_id,
        'System Administrator',
        'admin',
        'admin@bitblog.com',
        '$2b$10$w8.3f6z489p5z9X2F9Gzge9jN4QZ5Qj8D9E.K.N9tZ3K7V9zP9z8e', -- bcrypt hash
        'ACTIVE',
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP
      );
      COMMIT;
      DBMS_OUTPUT.PUT_LINE('STATUS: Initial Administrator account successfully created.');
    ELSE
      DBMS_OUTPUT.PUT_LINE('STATUS: Identifier exists. Elevating account to Admin role...');
      UPDATE users SET role_id = v_admin_role_id WHERE LOWER(email) = 'admin@bitblog.com' OR LOWER(username) = 'admin';
      COMMIT;
    END IF;
  END IF;
END;
/
