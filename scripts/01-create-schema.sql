-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Users and Authentication
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  full_name VARCHAR(255),
  avatar_url TEXT,
  role VARCHAR(50) NOT NULL CHECK (role IN ('creator', 'community_member', 'investor')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User Domains/Interests
CREATE TABLE IF NOT EXISTS user_domains (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  domain VARCHAR(100) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Startup Ideas
CREATE TABLE IF NOT EXISTS startup_ideas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  problem TEXT,
  solution TEXT,
  target_market TEXT,
  value_proposition TEXT,
  business_model VARCHAR(100),
  status VARCHAR(50) DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'completed')),
  estimated_funding BIGINT,
  team_size INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Competitors
CREATE TABLE IF NOT EXISTS competitors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  idea_id UUID REFERENCES startup_ideas(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  funding_raised BIGINT,
  market_position VARCHAR(255),
  strengths TEXT,
  weaknesses TEXT,
  funding_rounds INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Project Timelines
CREATE TABLE IF NOT EXISTS project_timelines (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  idea_id UUID NOT NULL REFERENCES startup_ideas(id) ON DELETE CASCADE,
  phase_name VARCHAR(255) NOT NULL,
  start_date DATE,
  end_date DATE,
  phase_number INTEGER,
  objectives TEXT,
  deliverables TEXT,
  resources_needed TEXT,
  status VARCHAR(50) DEFAULT 'planned' CHECK (status IN ('planned', 'in_progress', 'completed')),
  progress_percentage INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Community Discussions
CREATE TABLE IF NOT EXISTS discussions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  category VARCHAR(100) NOT NULL CHECK (category IN ('validation', 'funding', 'marketing', 'technical', 'general')),
  upvotes INTEGER DEFAULT 0,
  views INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Discussion Comments
CREATE TABLE IF NOT EXISTS discussion_comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  discussion_id UUID NOT NULL REFERENCES discussions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  upvotes INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Co-founder Profiles
CREATE TABLE IF NOT EXISTS cofounder_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  bio TEXT,
  skills TEXT[],
  experience_years INTEGER,
  looking_for_role VARCHAR(100),
  interests TEXT[],
  location VARCHAR(255),
  visibility BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Portfolio Builder
CREATE TABLE IF NOT EXISTS portfolios (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  idea_id UUID REFERENCES startup_ideas(id) ON DELETE CASCADE,
  executive_summary TEXT,
  investor_pitch TEXT,
  use_of_funds TEXT,
  market_opportunity TEXT,
  team_description TEXT,
  financial_projections JSONB,
  visibility VARCHAR(50) DEFAULT 'private' CHECK (visibility IN ('public', 'private', 'investor_only')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Market Insights Cache
CREATE TABLE IF NOT EXISTS market_insights (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  domain VARCHAR(100) NOT NULL,
  insight_type VARCHAR(50) NOT NULL CHECK (insight_type IN ('trend', 'opportunity', 'funding', 'news')),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  data JSONB,
  source VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP
);

-- Create Indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_user_domains_user_id ON user_domains(user_id);
CREATE INDEX IF NOT EXISTS idx_startup_ideas_user_id ON startup_ideas(user_id);
CREATE INDEX IF NOT EXISTS idx_startup_ideas_status ON startup_ideas(status);
CREATE INDEX IF NOT EXISTS idx_competitors_idea_id ON competitors(idea_id);
CREATE INDEX IF NOT EXISTS idx_project_timelines_idea_id ON project_timelines(idea_id);
CREATE INDEX IF NOT EXISTS idx_discussions_user_id ON discussions(user_id);
CREATE INDEX IF NOT EXISTS idx_discussions_category ON discussions(category);
CREATE INDEX IF NOT EXISTS idx_discussion_comments_discussion_id ON discussion_comments(discussion_id);
CREATE INDEX IF NOT EXISTS idx_cofounder_profiles_user_id ON cofounder_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_portfolios_user_id ON portfolios(user_id);
CREATE INDEX IF NOT EXISTS idx_market_insights_domain ON market_insights(domain);
CREATE INDEX IF NOT EXISTS idx_market_insights_expires ON market_insights(expires_at);

-- Enable RLS (Row Level Security)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_domains ENABLE ROW LEVEL SECURITY;
ALTER TABLE startup_ideas ENABLE ROW LEVEL SECURITY;
ALTER TABLE competitors ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_timelines ENABLE ROW LEVEL SECURITY;
ALTER TABLE discussions ENABLE ROW LEVEL SECURITY;
ALTER TABLE discussion_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE cofounder_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolios ENABLE ROW LEVEL SECURITY;
ALTER TABLE market_insights ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Users can read their own data
CREATE POLICY "Users can read their own data" ON users
  FOR SELECT USING (auth.uid()::text = id::text);

-- Users can update their own data
CREATE POLICY "Users can update their own data" ON users
  FOR UPDATE USING (auth.uid()::text = id::text);

-- Similar policies for other tables
CREATE POLICY "Users can read their own domains" ON user_domains
  FOR SELECT USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can insert their own domains" ON user_domains
  FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "Users can read their own ideas" ON startup_ideas
  FOR SELECT USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can insert their own ideas" ON startup_ideas
  FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "Users can update their own ideas" ON startup_ideas
  FOR UPDATE USING (auth.uid()::text = user_id::text);

-- Public read access to discussions
CREATE POLICY "Anyone can read discussions" ON discussions
  FOR SELECT USING (true);

CREATE POLICY "Users can insert discussions" ON discussions
  FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "Anyone can read comments" ON discussion_comments
  FOR SELECT USING (true);

CREATE POLICY "Users can insert comments" ON discussion_comments
  FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

-- Market insights are public
CREATE POLICY "Anyone can read market insights" ON market_insights
  FOR SELECT USING (true);
