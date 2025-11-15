-- Add total_tasks field to project_timelines
ALTER TABLE project_timelines
ADD COLUMN IF NOT EXISTS total_tasks integer DEFAULT 0;

-- Add contribution_percentage to project_tasks if table exists, or create table if not
DO $$ 
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'project_tasks') THEN
    -- Table exists, just add the column if it doesn't exist
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'project_tasks' AND column_name = 'contribution_percentage') THEN
      ALTER TABLE project_tasks ADD COLUMN contribution_percentage integer DEFAULT 0 CHECK (contribution_percentage >= 0 AND contribution_percentage <= 100);
    END IF;
  ELSE
    -- Table doesn't exist, create it
    CREATE TABLE project_tasks (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      timeline_id uuid REFERENCES project_timelines(id) ON DELETE CASCADE NOT NULL,
      title varchar(255) NOT NULL,
      description text,
      status varchar(50) DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'blocked')),
      completion_percentage integer DEFAULT 0 CHECK (completion_percentage >= 0 AND completion_percentage <= 100),
      contribution_percentage integer DEFAULT 0 CHECK (contribution_percentage >= 0 AND contribution_percentage <= 100),
      assigned_to uuid,
      priority varchar(50) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
      due_date date,
      created_at timestamp DEFAULT now(),
      updated_at timestamp DEFAULT now()
    );

    -- Enable RLS
    ALTER TABLE project_tasks ENABLE ROW LEVEL SECURITY;

    -- Create RLS policies
    CREATE POLICY "Users can read tasks for their timelines" ON project_tasks
      FOR SELECT
      USING (
        timeline_id IN (
          SELECT pt.id FROM project_timelines pt
          JOIN startup_ideas si ON pt.idea_id = si.id
          WHERE si.user_id = auth.uid()
        )
      );

    CREATE POLICY "Users can insert tasks for their timelines" ON project_tasks
      FOR INSERT
      WITH CHECK (
        timeline_id IN (
          SELECT pt.id FROM project_timelines pt
          JOIN startup_ideas si ON pt.idea_id = si.id
          WHERE si.user_id = auth.uid()
        )
      );

    CREATE POLICY "Users can update tasks for their timelines" ON project_tasks
      FOR UPDATE
      USING (
        timeline_id IN (
          SELECT pt.id FROM project_timelines pt
          JOIN startup_ideas si ON pt.idea_id = si.id
          WHERE si.user_id = auth.uid()
        )
      );

    CREATE POLICY "Users can delete tasks for their timelines" ON project_tasks
      FOR DELETE
      USING (
        timeline_id IN (
          SELECT pt.id FROM project_timelines pt
          JOIN startup_ideas si ON pt.idea_id = si.id
          WHERE si.user_id = auth.uid()
        )
      );

    -- Create indexes
    CREATE INDEX idx_project_tasks_timeline_id ON project_tasks(timeline_id);
    CREATE INDEX idx_project_tasks_status ON project_tasks(status);
  END IF;
END $$;
