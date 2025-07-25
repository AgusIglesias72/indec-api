# API de Pobreza e Indigencia - Endpoints

## Endpoints Disponibles

### 1. `/api/poverty`
Endpoint principal para obtener datos de pobreza con filtros.

**Parámetros:**
- `start_date`: Fecha inicial (YYYY-MM-DD)
- `end_date`: Fecha final (YYYY-MM-DD)
- `data_type`: Tipo de datos (national, regional)
- `region`: Región específica
- `indicator`: Indicador específico
- `limit`: Límite de registros (1-1000)
- `format`: Formato de respuesta (json, csv)

**Ejemplo:**
```
GET /api/poverty?region=Gran Buenos Aires&limit=10
```

### 2. `/api/poverty/latest`
Obtiene los datos más recientes de pobreza.

**Parámetros:**
- `region`: Región específica (opcional)

**Ejemplos:**
```
GET /api/poverty/latest
GET /api/poverty/latest?region=Cuyo
```

**Respuesta:**
```json
{
  "data": {
    "national": {
      "date": "2024-12-31",
      "period": "S2 2024",
      "poverty_rate_persons": 52.9,
      "poverty_rate_households": 42.5,
      "indigence_rate_persons": 18.1,
      "indigence_rate_households": 12.3
    },
    "regional": [...]
  },
  "metadata": {
    "last_updated": "2024-12-31",
    "period": "S2 2024",
    "regions_count": 6
  }
}
```

### 3. `/api/poverty/series`
Obtiene series temporales de indicadores de pobreza.

**Parámetros:**
- `region`: Región (default: Total 31 aglomerados)
- `indicator`: Indicador específico (poverty_rate_persons, etc.)
- `start_date`: Fecha inicial
- `end_date`: Fecha final

**Ejemplos:**
```
GET /api/poverty/series?indicator=poverty_rate_persons
GET /api/poverty/series?region=Noreste&start_date=2020-01-01
```

### 4. `/api/poverty/comparison`
Compara pobreza entre regiones o períodos.

**Parámetros:**
- `type`: Tipo de comparación (regional, temporal)
- `period`: Período específico (para comparación regional)
- `regions`: Regiones a comparar (para comparación temporal)

**Ejemplos:**
```
GET /api/poverty/comparison?type=regional
GET /api/poverty/comparison?type=temporal&regions=Total 31 aglomerados,Gran Buenos Aires
```

## Indicadores Disponibles

### Tasas Principales
- `poverty_rate_persons`: Tasa de pobreza por personas (%)
- `poverty_rate_households`: Tasa de pobreza por hogares (%)
- `indigence_rate_persons`: Tasa de indigencia por personas (%)
- `indigence_rate_households`: Tasa de indigencia por hogares (%)

### Brechas e Intensidad
- `poverty_gap`: Brecha de pobreza
- `indigence_gap`: Brecha de indigencia
- `poverty_severity`: Severidad de pobreza
- `indigence_severity`: Severidad de indigencia

## Regiones Disponibles
- Total 31 aglomerados
- Gran Buenos Aires
- Cuyo
- Noreste
- Noroeste
- Pampeana
- Patagonia

## Límites y Performance
- Máximo 1000 registros por request
- Los endpoints usan views optimizadas en Supabase
- Cache de 60 segundos en producción
- Formato CSV disponible para exportación masiva