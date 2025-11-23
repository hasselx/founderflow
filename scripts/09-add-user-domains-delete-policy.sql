-- Add missing DELETE policy for user_domains table
-- This enables users to delete their own domain preferences when updating them
-- Without this policy, the preferences page delete operation fails silently due to RLS
CREATE POLICY "Users can delete their own domains" ON user_domains
  FOR DELETE USING (auth.uid()::text = user_id::text);
