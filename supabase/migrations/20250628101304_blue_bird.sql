-- Run this SQL in your Supabase SQL Editor to set up the database

-- 1. Create videos table
CREATE TABLE IF NOT EXISTS videos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  url TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT,
  year INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Enable Row Level Security
ALTER TABLE videos ENABLE ROW LEVEL SECURITY;

-- 3. Create policies for videos table
-- Allow authenticated users to read all videos
CREATE POLICY "Anyone can view videos" ON videos
  FOR SELECT USING (true);

-- Allow authenticated users to insert videos
CREATE POLICY "Authenticated users can insert videos" ON videos
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Allow authenticated users to update videos
CREATE POLICY "Authenticated users can update videos" ON videos
  FOR UPDATE USING (auth.role() = 'authenticated');

-- Allow authenticated users to delete videos
CREATE POLICY "Authenticated users can delete videos" ON videos
  FOR DELETE USING (auth.role() = 'authenticated');

-- 4. Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 5. Create trigger for updated_at
CREATE TRIGGER update_videos_updated_at 
  BEFORE UPDATE ON videos 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- 6. Insert some sample data (optional)
INSERT INTO videos (title, url, category, description, year) VALUES
  ('Cinematic Masterpiece', 'https://www.youtube.com/embed/t9gqtyhL2m8', 'Short Films', 'A stunning visual journey through cinematic storytelling.', 2024),
  ('Visual Storytelling', 'https://www.youtube.com/embed/F6fHfOSRwSw', 'Documentaries', 'Exploring the art of visual narrative.', 2024),
  ('Creative Vision', 'https://www.youtube.com/embed/FBI42hpID5g', 'Music Videos', 'A creative exploration of music and visuals.', 2024)
ON CONFLICT (id) DO NOTHING;