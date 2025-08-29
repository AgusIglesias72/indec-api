-- Fix RLS policy for event_predictions to work with Clerk
DROP POLICY IF EXISTS "Authenticated users can create predictions" ON event_predictions;

CREATE POLICY "Authenticated users can create predictions" ON event_predictions
  FOR INSERT WITH CHECK (true); -- Allow authenticated users to insert

-- Remove the constraints that prevent negative numbers
ALTER TABLE event_predictions 
  DROP CONSTRAINT IF EXISTS event_predictions_ipc_general_check,
  DROP CONSTRAINT IF EXISTS event_predictions_ipc_bienes_check, 
  DROP CONSTRAINT IF EXISTS event_predictions_ipc_servicios_check,
  DROP CONSTRAINT IF EXISTS event_predictions_ipc_alimentos_bebidas_check;

-- Add new constraints that allow negative numbers
ALTER TABLE event_predictions 
  ADD CONSTRAINT event_predictions_ipc_general_check CHECK (ipc_general >= -99.9 AND ipc_general <= 99.9),
  ADD CONSTRAINT event_predictions_ipc_bienes_check CHECK (ipc_bienes >= -99.9 AND ipc_bienes <= 99.9),
  ADD CONSTRAINT event_predictions_ipc_servicios_check CHECK (ipc_servicios >= -99.9 AND ipc_servicios <= 99.9),
  ADD CONSTRAINT event_predictions_ipc_alimentos_bebidas_check CHECK (ipc_alimentos_bebidas >= -99.9 AND ipc_alimentos_bebidas <= 99.9);