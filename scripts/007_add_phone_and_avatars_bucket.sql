-- Add phone column to users table
ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS phone character varying(20);

-- Note: Storage bucket creation must be done via Supabase Dashboard or API
-- Go to Supabase Dashboard > Storage > New Bucket
-- Create a bucket named "avatars" with public access enabled
-- Add the following policies:

-- Policy 1: Allow authenticated users to upload avatars
-- Name: Users can upload avatars
-- Allowed operation: INSERT
-- Target roles: authenticated
-- WITH CHECK expression: (bucket_id = 'avatars')

-- Policy 2: Allow public access to avatars  
-- Name: Public avatar access
-- Allowed operation: SELECT
-- Target roles: public (anon)
-- USING expression: (bucket_id = 'avatars')

-- Policy 3: Allow users to update their own avatars
-- Name: Users can update avatars
-- Allowed operation: UPDATE
-- Target roles: authenticated
-- USING expression: (bucket_id = 'avatars')

-- Policy 4: Allow users to delete their own avatars
-- Name: Users can delete avatars
-- Allowed operation: DELETE
-- Target roles: authenticated
-- USING expression: (bucket_id = 'avatars')
