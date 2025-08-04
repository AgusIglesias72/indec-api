-- Crear tabla para trackear requests de API
CREATE TABLE IF NOT EXISTS api_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
  endpoint TEXT NOT NULL,
  method TEXT NOT NULL DEFAULT 'GET',
  status_code INTEGER NOT NULL,
  response_time_ms INTEGER,
  user_agent TEXT,
  ip_address INET,
  referer TEXT,
  request_params JSONB,
  api_key_used TEXT,
  is_internal BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Crear índices para optimizar consultas
CREATE INDEX IF NOT EXISTS idx_api_requests_user_id ON api_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_api_requests_endpoint ON api_requests(endpoint);
CREATE INDEX IF NOT EXISTS idx_api_requests_created_at ON api_requests(created_at);
CREATE INDEX IF NOT EXISTS idx_api_requests_user_endpoint_date ON api_requests(user_id, endpoint, created_at);
CREATE INDEX IF NOT EXISTS idx_api_requests_api_key ON api_requests(api_key_used);

-- Crear trigger para actualizar updated_at
CREATE OR REPLACE FUNCTION update_api_requests_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_api_requests_updated_at
  BEFORE UPDATE ON api_requests
  FOR EACH ROW
  EXECUTE FUNCTION update_api_requests_updated_at();

-- RLS policies para seguridad
ALTER TABLE api_requests ENABLE ROW LEVEL SECURITY;

-- Solo los usuarios pueden ver sus propios requests
CREATE POLICY "Users can view their own requests" ON api_requests
  FOR SELECT USING (auth.uid()::text = user_id);

-- Solo el servicio puede insertar requests
CREATE POLICY "Service can insert requests" ON api_requests
  FOR INSERT WITH CHECK (true);

-- Función para obtener estadísticas de uso por usuario
CREATE OR REPLACE FUNCTION get_user_api_stats(
  user_id_param TEXT,
  start_date TIMESTAMPTZ DEFAULT now() - interval '30 days',
  end_date TIMESTAMPTZ DEFAULT now()
)
RETURNS TABLE (
  endpoint TEXT,
  request_count BIGINT,
  avg_response_time NUMERIC,
  last_request TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ar.endpoint,
    COUNT(*) as request_count,
    ROUND(AVG(ar.response_time_ms), 2) as avg_response_time,
    MAX(ar.created_at) as last_request
  FROM api_requests ar
  WHERE ar.user_id = user_id_param
    AND ar.created_at >= start_date
    AND ar.created_at <= end_date
  GROUP BY ar.endpoint
  ORDER BY request_count DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para limpiar requests antiguos (ejecutar via cron)
CREATE OR REPLACE FUNCTION cleanup_old_api_requests(days_to_keep INTEGER DEFAULT 90)
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM api_requests 
  WHERE created_at < now() - (days_to_keep || ' days')::interval;
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Comentarios para documentación
COMMENT ON TABLE api_requests IS 'Tabla para trackear todas las peticiones a la API';
COMMENT ON COLUMN api_requests.user_id IS 'ID del usuario que hizo la petición (si está autenticado)';
COMMENT ON COLUMN api_requests.endpoint IS 'Endpoint de la API que fue consultado';
COMMENT ON COLUMN api_requests.method IS 'Método HTTP utilizado';
COMMENT ON COLUMN api_requests.status_code IS 'Código de respuesta HTTP';
COMMENT ON COLUMN api_requests.response_time_ms IS 'Tiempo de respuesta en milisegundos';
COMMENT ON COLUMN api_requests.is_internal IS 'True si la petición viene del frontend propio';
COMMENT ON COLUMN api_requests.api_key_used IS 'API key utilizada para la petición (hasheada)';
COMMENT ON COLUMN api_requests.request_params IS 'Parámetros de la petición en formato JSON';