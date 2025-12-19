-- ASEEC App - Schema Update: Invite Code User Details
-- Generated: 2024-12-19
-- Description: Add intended user details to invite codes, remove redundant used_by columns

-- =============================================================================
-- ADD NEW COLUMNS FOR INTENDED USER
-- =============================================================================

ALTER TABLE invite_codes ADD COLUMN invited_name TEXT;
ALTER TABLE invite_codes ADD COLUMN invited_email TEXT;

-- =============================================================================
-- REMOVE REDUNDANT COLUMNS
-- (User details now known at generation time, not just when used)
-- =============================================================================

ALTER TABLE invite_codes DROP COLUMN used_by;
ALTER TABLE invite_codes DROP COLUMN used_by_email;
