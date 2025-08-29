-- Add slug field to events table for SEO-friendly URLs
ALTER TABLE events ADD COLUMN slug VARCHAR(255) UNIQUE;

-- Update existing events with slugs
UPDATE events 
SET slug = 'ipc-agosto-2025' 
WHERE name = 'IPC Agosto 2025';

-- Make slug required for future events
ALTER TABLE events ALTER COLUMN slug SET NOT NULL;

-- Create index for better performance
CREATE INDEX idx_events_slug ON events(slug);