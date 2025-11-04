-- Add INSERT policy to users table to allow authenticated users to create their profiles
CREATE POLICY "Users can insert their own data"
  ON users
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Add INSERT policy to cofounder_profiles table
CREATE POLICY "Users can insert their own cofounder profile"
  ON cofounder_profiles
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Add UPDATE and SELECT policies to cofounder_profiles
CREATE POLICY "Users can update their own cofounder profile"
  ON cofounder_profiles
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can read their own cofounder profile"
  ON cofounder_profiles
  FOR SELECT
  USING (auth.uid() = user_id);

-- Add policies to portfolios table
CREATE POLICY "Users can insert their own portfolio"
  ON portfolios
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can read their own portfolio"
  ON portfolios
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own portfolio"
  ON portfolios
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Add policies to project_timelines table
CREATE POLICY "Users can read timelines for their ideas"
  ON project_timelines
  FOR SELECT
  USING (
    idea_id IN (
      SELECT id FROM startup_ideas WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert timelines for their ideas"
  ON project_timelines
  FOR INSERT
  WITH CHECK (
    idea_id IN (
      SELECT id FROM startup_ideas WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update timelines for their ideas"
  ON project_timelines
  FOR UPDATE
  USING (
    idea_id IN (
      SELECT id FROM startup_ideas WHERE user_id = auth.uid()
    )
  );

-- Add policies to competitors table
CREATE POLICY "Users can read competitors for their ideas"
  ON competitors
  FOR SELECT
  USING (
    idea_id IN (
      SELECT id FROM startup_ideas WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert competitors for their ideas"
  ON competitors
  FOR INSERT
  WITH CHECK (
    idea_id IN (
      SELECT id FROM startup_ideas WHERE user_id = auth.uid()
    )
  );

-- Add UPDATE policy to discussion_comments
CREATE POLICY "Users can update their own comments"
  ON discussion_comments
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Add DELETE policy to discussion_comments
CREATE POLICY "Users can delete their own comments"
  ON discussion_comments
  FOR DELETE
  USING (auth.uid() = user_id);

-- Add UPDATE and DELETE policies to discussions
CREATE POLICY "Users can update their own discussions"
  ON discussions
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own discussions"
  ON discussions
  FOR DELETE
  USING (auth.uid() = user_id);
