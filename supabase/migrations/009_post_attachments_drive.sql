-- Add original_url to post_attachments to store the Google Drive share link
ALTER TABLE public.post_attachments
ADD COLUMN IF NOT EXISTS original_url TEXT NULL;

-- Allow authenticated users to insert attachments (Drive links)
CREATE POLICY "Authenticated insert attachments" ON public.post_attachments
FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Allow authenticated users to update attachments (e.g. soft delete)
CREATE POLICY "Authenticated update attachments" ON public.post_attachments
FOR UPDATE USING (auth.role() = 'authenticated');
