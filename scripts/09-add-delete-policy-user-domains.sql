-- Add missing delete policy for user_domains table to fix preferences sync
-- Users need to be able to delete their own domains when updating preferences
CREATE POLICY "Users can delete their own domains" ON user_domains
  FOR DELETE USING (auth.uid()::text = user_id::text);
