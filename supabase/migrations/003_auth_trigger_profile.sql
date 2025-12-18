-- ASEEC App - Auth Trigger for Profile Creation
-- Run this in Supabase SQL Editor
-- This trigger automatically creates a profile when a new user signs up

-- =============================================================================
-- FUNCTION: Handle New User Registration
-- =============================================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url, role, active)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'full_name', 'Novo Usuário'),
    new.raw_user_meta_data->>'avatar_url',
    'user',  -- Default role for new users
    true
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================================================
-- TRIGGER: Execute on new user creation
-- =============================================================================

-- Drop existing trigger if exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =============================================================================
-- VERIFICATION: Check trigger was created
-- =============================================================================

-- To verify, run:
-- SELECT * FROM pg_trigger WHERE tgname = 'on_auth_user_created';
