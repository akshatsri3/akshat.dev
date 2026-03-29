-- Create the blogs table
CREATE TABLE IF NOT EXISTS public.blogs (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    date TEXT NOT NULL,
    likes INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.blogs ENABLE ROW LEVEL SECURITY;

-- 1. Give everyone READ access
CREATE POLICY "Public Read Access" 
ON public.blogs 
FOR SELECT 
USING (true);

-- 2. Give everyone access to UPDATE likes
CREATE POLICY "Public Update Likes" 
ON public.blogs 
FOR UPDATE 
USING (true)
WITH CHECK (true);

-- 3. Give everyone access to INSERT and DELETE (minimal setup)
-- Note: In a production app, these would be restricted to authenticated users.
CREATE POLICY "Public Insert Access" 
ON public.blogs 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Public Delete Access" 
ON public.blogs 
FOR DELETE 
USING (true);
