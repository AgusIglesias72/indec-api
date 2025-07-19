-- Create users table for Clerk integration
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  clerk_user_id VARCHAR(255) UNIQUE NOT NULL,
  email VARCHAR(255) NOT NULL,
  first_name VARCHAR(255),
  last_name VARCHAR(255),
  image_url VARCHAR(500),
  api_key VARCHAR(255) UNIQUE,
  subscription_status VARCHAR(50) DEFAULT 'free',
  twitter_handle VARCHAR(255),
  preferences JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_clerk_user_id ON users(clerk_user_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_api_key ON users(api_key);

-- Create user favorites table
CREATE TABLE IF NOT EXISTS user_favorites (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  indicator_type VARCHAR(50) NOT NULL, -- 'ipc', 'emae', 'riesgo-pais', 'empleo', 'dolar'
  indicator_id VARCHAR(100), -- For future specific indicator items
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  UNIQUE(user_id, indicator_type, indicator_id)
);

-- Create user alerts table
CREATE TABLE IF NOT EXISTS user_alerts (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  indicator_type VARCHAR(50) NOT NULL,
  condition_type VARCHAR(50) NOT NULL, -- 'above', 'below', 'change'
  threshold_value DECIMAL(15,4),
  percentage_change DECIMAL(5,2),
  is_active BOOLEAN DEFAULT true,
  last_triggered_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create RLS policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_alerts ENABLE ROW LEVEL SECURITY;

-- Users can only see and update their own data
CREATE POLICY "Users can view own data" ON users 
  FOR SELECT USING (auth.uid()::text = clerk_user_id);

CREATE POLICY "Users can update own data" ON users 
  FOR UPDATE USING (auth.uid()::text = clerk_user_id);

-- Service role can manage all users (for webhooks)
CREATE POLICY "Service role can manage users" ON users 
  FOR ALL USING (auth.role() = 'service_role');

-- User favorites policies
CREATE POLICY "Users can manage own favorites" ON user_favorites 
  FOR ALL USING (
    user_id IN (
      SELECT id FROM users WHERE clerk_user_id = auth.uid()::text
    )
  );

-- User alerts policies  
CREATE POLICY "Users can manage own alerts" ON user_alerts 
  FOR ALL USING (
    user_id IN (
      SELECT id FROM users WHERE clerk_user_id = auth.uid()::text
    )
  );

-- Grant permissions
GRANT ALL ON users TO authenticated;
GRANT ALL ON user_favorites TO authenticated;
GRANT ALL ON user_alerts TO authenticated;
GRANT ALL ON users TO service_role;
GRANT ALL ON user_favorites TO service_role;
GRANT ALL ON user_alerts TO service_role;