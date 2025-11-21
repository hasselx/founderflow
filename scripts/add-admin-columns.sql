-- Add is_admin column to users table if it doesn't exist
ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT false;

-- Create business_insights table for admin management
CREATE TABLE IF NOT EXISTS public.business_insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  category VARCHAR(100) NOT NULL,
  content TEXT NOT NULL,
  author_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  is_published BOOLEAN DEFAULT false,
  views INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on business_insights
ALTER TABLE public.business_insights ENABLE ROW LEVEL SECURITY;

-- Drop existing policies before recreating them to avoid conflicts
DROP POLICY IF EXISTS "Anyone can read published insights" ON public.business_insights;
DROP POLICY IF EXISTS "Admins can manage all insights" ON public.business_insights;
DROP POLICY IF EXISTS "Admins can update insights" ON public.business_insights;
DROP POLICY IF EXISTS "Admins can delete insights" ON public.business_insights;

-- Allow anyone to read published insights
CREATE POLICY "Anyone can read published insights" ON public.business_insights
  FOR SELECT 
  USING (is_published = true);

-- Allow admins to manage all insights
CREATE POLICY "Admins can manage all insights" ON public.business_insights
  FOR ALL 
  USING ((SELECT is_admin FROM public.users WHERE id = auth.uid()));

-- Allow admins to update insights
CREATE POLICY "Admins can update insights" ON public.business_insights
  FOR UPDATE 
  USING ((SELECT is_admin FROM public.users WHERE id = auth.uid()));

-- Allow admins to delete insights  
CREATE POLICY "Admins can delete insights" ON public.business_insights
  FOR DELETE 
  USING ((SELECT is_admin FROM public.users WHERE id = auth.uid()));
