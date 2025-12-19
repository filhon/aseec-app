-- ASEEC App - Fix: Allow public invite code validation
-- Generated: 2024-12-19
-- Description: Add RLS policy to allow anyone to validate invite codes

-- Allow public SELECT on invite_codes for code validation
-- This is necessary because users validating codes are not yet authenticated
CREATE POLICY "Public can validate invite codes" ON invite_codes FOR SELECT
  USING (active = TRUE AND status = 'pending');

-- Note: The existing "Admin manage invite codes" policy handles all other operations
