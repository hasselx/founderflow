-- Create project_tasks table for task management
CREATE TABLE IF NOT EXISTS project_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  timeline_id UUID NOT NULL REFERENCES project_timelines(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed')),
  completion_percentage INTEGER DEFAULT 0 CHECK (completion_percentage >= 0 AND completion_percentage <= 100),
  contribution_percentage INTEGER DEFAULT 0 CHECK (contribution_percentage >= 0 AND contribution_percentage <= 100),
  priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  assigned_to UUID REFERENCES users(id) ON DELETE SET NULL,
  due_date DATE,
  created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE project_tasks ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can only access tasks for their timelines
CREATE POLICY "Users can manage tasks for their timelines"
  ON project_tasks
  FOR ALL
  USING (
    timeline_id IN (
      SELECT pt.id FROM project_timelines pt
      JOIN startup_ideas si ON pt.idea_id = si.id
      WHERE si.user_id = auth.uid()
    )
  );

-- Indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_project_tasks_timeline
  ON project_tasks(timeline_id);
CREATE INDEX IF NOT EXISTS idx_project_tasks_assigned_to
  ON project_tasks(assigned_to);
