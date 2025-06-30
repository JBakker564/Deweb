/*
  # Create about content management

  1. New Tables
    - `about_content`
      - `id` (uuid, primary key)
      - `content_type` (text) - 'text' or 'image'
      - `title` (text) - for organizing content
      - `content` (text) - text content or image URL
      - `order_index` (integer) - for ordering content
      - `is_active` (boolean) - to enable/disable content
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `about_content` table
    - Add policies for public read access
    - Add policies for authenticated admin access
*/

CREATE TABLE IF NOT EXISTS about_content (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content_type text NOT NULL CHECK (content_type IN ('text', 'image')),
  title text NOT NULL,
  content text NOT NULL,
  order_index integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE about_content ENABLE ROW LEVEL SECURITY;

-- Allow everyone to read active about content
CREATE POLICY "Anyone can view active about content"
  ON about_content
  FOR SELECT
  USING (is_active = true);

-- Allow authenticated users to manage about content
CREATE POLICY "Authenticated users can insert about content"
  ON about_content
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update about content"
  ON about_content
  FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can delete about content"
  ON about_content
  FOR DELETE
  TO authenticated
  USING (true);

-- Create trigger for updated_at
CREATE TRIGGER update_about_content_updated_at 
  BEFORE UPDATE ON about_content 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Insert default about content
INSERT INTO about_content (content_type, title, content, order_index) VALUES
  ('text', 'About Text', 'Ik ben een cinematograaf uit Groningen met een passie voor beelden die verhalen raken en emoties opwekken. De afgelopen jaren heb ik gewerkt aan meerdere prijswinnende documentaires en short-films, waarin ik steeds op zoek ging naar echtheid en de juiste sfeer. Of het nu gaat om een intieme vertelling of een groter project, ik geloof dat elke productie een eigen visuele taal verdient. Met oog voor detail, licht en compositie werk ik nauw samen met regisseurs en crew om beelden te creëren die bijblijven.', 1),
  ('image', 'Main Portrait', 'https://images.pexels.com/photos/3062541/pexels-photo-3062541.jpeg', 2),
  ('image', 'Behind the Scenes 1', 'https://images.pexels.com/photos/66134/pexels-photo-66134.jpeg', 3),
  ('image', 'Equipment Shot', 'https://images.pexels.com/photos/274937/pexels-photo-274937.jpeg', 4)
ON CONFLICT (id) DO NOTHING;