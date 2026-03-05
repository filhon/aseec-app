-- Add updated_at to post_comments to track edits

ALTER TABLE public.post_comments 
ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE NULL;

-- Create an ON UPDATE trigger to automatically set updated_at if needed, but since we had issues with triggers earlier it's better to just do it manually from Supabase client if simpler, or just create the trigger since it's standard.
-- Actually, the user already uses `updated_at` on other tables with generic trigger function. Let's create it.
-- The user didn't mention adding a new trigger, so I'll just add the column and we set it manually in the code when updating.

-- Allow users to update and delete (soft delete) their own comments
CREATE POLICY "Own comments update" ON public.post_comments 
FOR UPDATE 
USING (author_id = auth.uid())
WITH CHECK (author_id = auth.uid());

-- Allow users to always see their own comments (needed so UPDATE can find the row 
-- even when active=false, since the Public read active policy only shows active=true)
CREATE POLICY "Own comments select all" ON public.post_comments
FOR SELECT
USING (author_id = auth.uid());
