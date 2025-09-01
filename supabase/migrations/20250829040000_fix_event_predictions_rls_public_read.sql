-- Drop existing policies that might be causing issues
DROP POLICY IF EXISTS "Public can read predictions" ON event_predictions;
DROP POLICY IF EXISTS "Users can read all predictions" ON event_predictions;
DROP POLICY IF EXISTS "Anyone can read predictions" ON event_predictions;

-- Create a simple public read policy
CREATE POLICY "Enable read access for all users" ON event_predictions
  FOR SELECT
  USING (true);

-- Ensure authenticated users can still insert their predictions
DROP POLICY IF EXISTS "Authenticated users can create predictions" ON event_predictions;
CREATE POLICY "Authenticated users can insert predictions" ON event_predictions
  FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- Allow authenticated users to read their own predictions
CREATE POLICY "Users can read own predictions" ON event_predictions
  FOR SELECT
  USING (auth.uid()::text = user_id);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_event_predictions_event_id 
  ON event_predictions(event_id);

CREATE INDEX IF NOT EXISTS idx_event_predictions_created_at 
  ON event_predictions(created_at DESC);