/*
  # Add video ordering and metadata columns

  1. New Columns
    - `order_index` (integer) - Voor het sorteren van video volgorde
    - `format` (text) - Video format zoals "4K Digital", "16mm Film", etc.
    - `runtime` (text) - Video runtime zoals "5:30", "12:45", etc.

  2. Data Migration
    - Bestaande videos krijgen automatisch een order_index toegewezen
    - Standaard format wordt "4K Digital"

  3. Index
    - Index op order_index voor snelle sortering
*/

-- Add new columns to videos table
DO $$
BEGIN
  -- Add order_index column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'videos' AND column_name = 'order_index'
  ) THEN
    ALTER TABLE videos ADD COLUMN order_index INTEGER DEFAULT 0;
  END IF;

  -- Add format column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'videos' AND column_name = 'format'
  ) THEN
    ALTER TABLE videos ADD COLUMN format TEXT DEFAULT '4K Digital';
  END IF;

  -- Add runtime column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'videos' AND column_name = 'runtime'
  ) THEN
    ALTER TABLE videos ADD COLUMN runtime TEXT;
  END IF;
END $$;

-- Update existing videos with order_index based on created_at
UPDATE videos 
SET order_index = subquery.row_number
FROM (
  SELECT id, ROW_NUMBER() OVER (ORDER BY created_at ASC) as row_number
  FROM videos
  WHERE order_index IS NULL OR order_index = 0
) AS subquery
WHERE videos.id = subquery.id;

-- Create index for better performance on ordering
CREATE INDEX IF NOT EXISTS idx_videos_order_index ON videos(order_index);

-- Update any NULL format values to default
UPDATE videos SET format = '4K Digital' WHERE format IS NULL;