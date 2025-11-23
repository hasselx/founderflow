-- Add image_url column to startup_ideas table
ALTER TABLE startup_ideas
ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Add a comment to describe the column
COMMENT ON COLUMN startup_ideas.image_url IS 'URL to the project thumbnail image stored in Supabase Storage';
