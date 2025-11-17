-- Update project_tasks status constraint to include planned and upcoming statuses
ALTER TABLE project_tasks DROP CONSTRAINT IF EXISTS project_tasks_status_check;

ALTER TABLE project_tasks ADD CONSTRAINT project_tasks_status_check 
  CHECK (status IN ('planned', 'upcoming', 'in_progress', 'completed'));

-- Update default status from pending to planned
ALTER TABLE project_tasks ALTER COLUMN status SET DEFAULT 'planned';
