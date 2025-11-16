-- Create user_integrations table for storing integration configs
CREATE TABLE IF NOT EXISTS user_integrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  service VARCHAR(50) NOT NULL,
  config JSONB NOT NULL,
  active BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, service)
);

-- Enable RLS
ALTER TABLE user_integrations ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can only access their own integrations
CREATE POLICY "Users can manage their own integrations"
  ON user_integrations
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_user_integrations_user_service
  ON user_integrations(user_id, service);
