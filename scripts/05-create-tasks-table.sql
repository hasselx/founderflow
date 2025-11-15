-- Project Tasks Table
CREATE TABLE IF NOT EXISTS project_tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  timeline_id UUID NOT NULL REFERENCES project_timelines(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed')),
  completion_percentage INTEGER DEFAULT 0 CHECK (completion_percentage >= 0 AND completion_percentage <= 100),
  assigned_to VARCHAR(255),
  priority VARCHAR(50) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  due_date DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Index for better query performance
CREATE INDEX IF NOT EXISTS idx_project_tasks_timeline_id ON project_tasks(timeline_id);
CREATE INDEX IF NOT EXISTS idx_project_tasks_status ON project_tasks(status);

-- Enable RLS (Row Level Security)
ALTER TABLE project_tasks ENABLE ROW LEVEL SECURITY;

-- RLS Policies - Users can manage tasks for their timeline phases
CREATE POLICY "Users can read tasks for their timelines" ON project_tasks
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM project_timelines pt
      JOIN startup_ideas si ON pt.idea_id = si.id
      WHERE pt.id = project_tasks.timeline_id
      AND si.user_id::text = auth.uid()::text
    )
  );

CREATE POLICY "Users can insert tasks for their timelines" ON project_tasks
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM project_timelines pt
      JOIN startup_ideas si ON pt.idea_id = si.id
      WHERE pt.id = project_tasks.timeline_id
      AND si.user_id::text = auth.uid()::text
    )
  );

CREATE POLICY "Users can update tasks for their timelines" ON project_tasks
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM project_timelines pt
      JOIN startup_ideas si ON pt.idea_id = si.id
      WHERE pt.id = project_tasks.timeline_id
      AND si.user_id::text = auth.uid()::text
    )
  );

CREATE POLICY "Users can delete tasks for their timelines" ON project_tasks
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM project_timelines pt
      JOIN startup_ideas si ON pt.idea_id = si.id
      WHERE pt.id = project_tasks.timeline_id
      AND si.user_id::text = auth.uid()::text
    )
  );
