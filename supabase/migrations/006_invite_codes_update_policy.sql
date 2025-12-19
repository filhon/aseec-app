-- ASEEC App - Fix: Allow authenticated users to mark invite codes as used
-- Generated: 2024-12-19
-- Description: Add RLS policy for invite code update by authenticated users

-- Allow authenticated users to UPDATE invite codes (to mark as used)
-- This is necessary because the user who used the code needs to mark it as used
CREATE POLICY "Authenticated users can mark codes as used" ON invite_codes FOR UPDATE
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);
