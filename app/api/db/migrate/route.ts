import { getSupabaseServerClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const supabase = await getSupabaseServerClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { error: integrationError } = await supabase.rpc('exec_sql', {
      sql_query: `
        CREATE TABLE IF NOT EXISTS user_integrations (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
          service VARCHAR(50) NOT NULL,
          config JSONB NOT NULL,
          active BOOLEAN DEFAULT false,
          created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
          UNIQUE(user_id, service)
        );

        ALTER TABLE user_integrations ENABLE ROW LEVEL SECURITY;

        DROP POLICY IF EXISTS "Users can manage their own integrations" ON user_integrations;

        CREATE POLICY "Users can manage their own integrations"
          ON user_integrations
          FOR ALL
          USING (user_id = auth.uid())
          WITH CHECK (user_id = auth.uid());

        CREATE INDEX IF NOT EXISTS idx_user_integrations_user_service
          ON user_integrations(user_id, service);
      `
    });

    const { error: tasksError } = await supabase.rpc('exec_sql', {
      sql_query: `
        CREATE TABLE IF NOT EXISTS project_tasks (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          timeline_id UUID NOT NULL REFERENCES project_timelines(id) ON DELETE CASCADE,
          title VARCHAR(255) NOT NULL,
          description TEXT,
          status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed')),
          completion_percentage INTEGER DEFAULT 0 CHECK (completion_percentage >= 0 AND completion_percentage <= 100),
          contribution_percentage INTEGER DEFAULT 0 CHECK (contribution_percentage >= 0 AND contribution_percentage <= 100),
          priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
          assigned_to UUID REFERENCES auth.users(id) ON DELETE SET NULL,
          due_date DATE,
          created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW()
        );

        ALTER TABLE project_tasks ENABLE ROW LEVEL SECURITY;

        DROP POLICY IF EXISTS "Users can manage tasks for their timelines" ON project_tasks;

        CREATE POLICY "Users can manage tasks for their timelines"
          ON project_tasks
          FOR ALL
          USING (
            timeline_id IN (
              SELECT pt.id FROM project_timelines pt
              JOIN startup_ideas si ON pt.idea_id = si.id
              WHERE si.user_id = auth.uid()
            )
          )
          WITH CHECK (
            timeline_id IN (
              SELECT pt.id FROM project_timelines pt
              JOIN startup_ideas si ON pt.idea_id = si.id
              WHERE si.user_id = auth.uid()
            )
          );

        CREATE INDEX IF NOT EXISTS idx_project_tasks_timeline
          ON project_tasks(timeline_id);
        CREATE INDEX IF NOT EXISTS idx_project_tasks_assigned_to
          ON project_tasks(assigned_to);
      `
    });

    if (integrationError || tasksError) {
      console.error('[v0] Migration errors:', { integrationError, tasksError });
      return NextResponse.json(
        { error: 'Migration failed', details: integrationError || tasksError },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, message: 'Migrations completed' });
  } catch (error) {
    console.error('[v0] Migration error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: String(error) },
      { status: 500 }
    );
  }
}
