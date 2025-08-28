-- Create events table
CREATE TABLE IF NOT EXISTS events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  event_date TIMESTAMP WITH TIME ZONE NOT NULL,
  submission_deadline TIMESTAMP WITH TIME ZONE NOT NULL,
  prize_amount DECIMAL(10, 2),
  prize_currency VARCHAR(10) DEFAULT 'USD',
  status VARCHAR(50) DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'active', 'closed', 'finished')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create event predictions table
CREATE TABLE IF NOT EXISTS event_predictions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  user_id VARCHAR(255) NOT NULL, -- Clerk user ID
  user_email VARCHAR(255) NOT NULL,
  ipc_general DECIMAL(4, 2) NOT NULL CHECK (ipc_general >= 0 AND ipc_general <= 99.9),
  ipc_bienes DECIMAL(4, 2) NOT NULL CHECK (ipc_bienes >= 0 AND ipc_bienes <= 99.9),
  ipc_servicios DECIMAL(4, 2) NOT NULL CHECK (ipc_servicios >= 0 AND ipc_servicios <= 99.9),
  ipc_alimentos_bebidas DECIMAL(4, 2) NOT NULL CHECK (ipc_alimentos_bebidas >= 0 AND ipc_alimentos_bebidas <= 99.9),
  score DECIMAL(10, 4), -- Calculated after results are in
  rank INTEGER, -- Position in leaderboard
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(event_id, user_id) -- One prediction per user per event
);

-- Create event results table
CREATE TABLE IF NOT EXISTS event_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  ipc_general DECIMAL(4, 2) NOT NULL,
  ipc_bienes DECIMAL(4, 2) NOT NULL,
  ipc_servicios DECIMAL(4, 2) NOT NULL,
  ipc_alimentos_bebidas DECIMAL(4, 2) NOT NULL,
  published_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by VARCHAR(255) NOT NULL, -- Admin who input the results
  UNIQUE(event_id) -- One result per event
);

-- Create event winners table for historical tracking
CREATE TABLE IF NOT EXISTS event_winners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  user_id VARCHAR(255) NOT NULL,
  user_email VARCHAR(255) NOT NULL,
  rank INTEGER NOT NULL,
  score DECIMAL(10, 4) NOT NULL,
  prize_amount DECIMAL(10, 2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_event_predictions_event_id ON event_predictions(event_id);
CREATE INDEX idx_event_predictions_user_id ON event_predictions(user_id);
CREATE INDEX idx_event_predictions_score ON event_predictions(score DESC);
CREATE INDEX idx_event_winners_user_id ON event_winners(user_id);

-- Enable RLS
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_winners ENABLE ROW LEVEL SECURITY;

-- RLS Policies for events table (everyone can read)
CREATE POLICY "Anyone can view events" ON events
  FOR SELECT USING (true);

CREATE POLICY "Only admins can manage events" ON events
  FOR ALL USING (auth.jwt() ->> 'email' = 'agusiglesias72@gmail.com');

-- RLS Policies for event_predictions
CREATE POLICY "Users can view their own predictions" ON event_predictions
  FOR SELECT USING (true); -- We'll filter sensitive data in the API

CREATE POLICY "Authenticated users can create predictions" ON event_predictions
  FOR INSERT WITH CHECK (auth.jwt() ->> 'sub' = user_id);

CREATE POLICY "Users cannot update predictions" ON event_predictions
  FOR UPDATE USING (false);

-- RLS Policies for event_results
CREATE POLICY "Anyone can view results" ON event_results
  FOR SELECT USING (true);

CREATE POLICY "Only admins can manage results" ON event_results
  FOR ALL USING (auth.jwt() ->> 'email' = 'agusiglesias72@gmail.com');

-- RLS Policies for event_winners
CREATE POLICY "Anyone can view winners" ON event_winners
  FOR SELECT USING (true);

CREATE POLICY "Only admins can manage winners" ON event_winners
  FOR ALL USING (auth.jwt() ->> 'email' = 'agusiglesias72@gmail.com');

-- Insert the first event for August 2025 IPC
INSERT INTO events (
  name,
  description,
  event_date,
  submission_deadline,
  prize_amount,
  prize_currency,
  status
) VALUES (
  'IPC Agosto 2025',
  'Predice los valores del IPC de agosto 2025 y gana US$ 100',
  '2025-09-12T15:00:00Z', -- When INDEC typically releases data
  '2025-09-09T19:00:00Z', -- September 9 at 19 GMT
  100.00,
  'USD',
  'active'
);