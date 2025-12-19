-- ASEEC App - Add Director Role
-- Migration: 004_add_director_role.sql
-- Description: Adds 'director' role to the profiles table

-- =============================================================================
-- UPDATE ROLE CONSTRAINT
-- =============================================================================

-- Remove existing constraint
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_role_check;

-- Add new constraint with director role
ALTER TABLE profiles ADD CONSTRAINT profiles_role_check 
  CHECK (role IN ('admin', 'editor', 'director', 'user'));

-- =============================================================================
-- UPDATE RLS POLICIES (if needed)
-- =============================================================================

-- Director has same read access as editor but no write access
-- Most policies already handle this via the role check

-- =============================================================================
-- VERIFICATION
-- =============================================================================

-- To verify, run:
-- SELECT DISTINCT role FROM profiles;
