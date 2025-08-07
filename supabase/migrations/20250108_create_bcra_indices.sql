-- Crear tabla para CER (Coeficiente de Estabilización de Referencia)
CREATE TABLE IF NOT EXISTS public.cer (
    id BIGSERIAL PRIMARY KEY,
    date DATE NOT NULL UNIQUE,
    value DECIMAL(10, 4) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Crear tabla para UVA (Unidad de Valor Adquisitivo)
CREATE TABLE IF NOT EXISTS public.uva (
    id BIGSERIAL PRIMARY KEY,
    date DATE NOT NULL UNIQUE,
    value DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Crear índices para optimizar consultas
CREATE INDEX idx_cer_date ON public.cer(date DESC);
CREATE INDEX idx_uva_date ON public.uva(date DESC);

-- Crear funciones para actualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Crear triggers
CREATE TRIGGER update_cer_updated_at BEFORE UPDATE ON public.cer
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_uva_updated_at BEFORE UPDATE ON public.uva
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Crear vista combinada con variaciones calculadas
CREATE OR REPLACE VIEW public.cer_with_variations AS
SELECT 
    c1.id,
    c1.date,
    c1.value,
    -- Variación diaria
    ROUND(((c1.value - c2.value) / c2.value * 100)::NUMERIC, 4) AS daily_pct_change,
    -- Variación mensual
    ROUND(((c1.value - c3.value) / c3.value * 100)::NUMERIC, 4) AS monthly_pct_change,
    -- Variación anual
    ROUND(((c1.value - c4.value) / c4.value * 100)::NUMERIC, 4) AS yearly_pct_change,
    c1.created_at,
    c1.updated_at
FROM 
    public.cer c1
LEFT JOIN 
    public.cer c2 ON c2.date = c1.date - INTERVAL '1 day'
LEFT JOIN 
    public.cer c3 ON c3.date = c1.date - INTERVAL '1 month'
LEFT JOIN 
    public.cer c4 ON c4.date = c1.date - INTERVAL '1 year'
ORDER BY 
    c1.date DESC;

-- Crear vista similar para UVA
CREATE OR REPLACE VIEW public.uva_with_variations AS
SELECT 
    u1.id,
    u1.date,
    u1.value,
    -- Variación diaria
    ROUND(((u1.value - u2.value) / u2.value * 100)::NUMERIC, 4) AS daily_pct_change,
    -- Variación mensual
    ROUND(((u1.value - u3.value) / u3.value * 100)::NUMERIC, 4) AS monthly_pct_change,
    -- Variación anual
    ROUND(((u1.value - u4.value) / u4.value * 100)::NUMERIC, 4) AS yearly_pct_change,
    u1.created_at,
    u1.updated_at
FROM 
    public.uva u1
LEFT JOIN 
    public.uva u2 ON u2.date = u1.date - INTERVAL '1 day'
LEFT JOIN 
    public.uva u3 ON u3.date = u1.date - INTERVAL '1 month'
LEFT JOIN 
    public.uva u4 ON u4.date = u1.date - INTERVAL '1 year'
ORDER BY 
    u1.date DESC;

-- Agregar comentarios descriptivos
COMMENT ON TABLE public.cer IS 'Coeficiente de Estabilización de Referencia (CER) del BCRA';
COMMENT ON TABLE public.uva IS 'Unidad de Valor Adquisitivo (UVA) del BCRA';
COMMENT ON COLUMN public.cer.value IS 'Valor del CER (Base 2.2.2002=1)';
COMMENT ON COLUMN public.uva.value IS 'Valor del UVA (en pesos, base 31.3.2016=14.05)';