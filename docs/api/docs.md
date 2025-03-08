# API de Indicadores Económicos INDEC

Esta documentación describe todos los endpoints disponibles para consultar datos económicos oficiales de Argentina, proporcionados por el Instituto Nacional de Estadística y Censos (INDEC).

## Información General

### URL Base

`https://api.econovista.gov.ar/v1`

### Autenticación

Actualmente, nuestras APIs son de acceso público y no requieren autenticación para las consultas básicas.

### Formato de Respuesta

Todas las APIs devuelven datos en formato JSON por defecto y soportan formato CSV cuando se especifica con el parámetro `format=csv`.

### Manejo de Errores

En caso de error, las APIs devuelven un código de estado HTTP apropiado junto con un mensaje de error en formato JSON:

```json
{
  "error": "Descripción del error",
  "details": "Información adicional sobre el error (opcional)"
}
```

## Códigos de Respuesta HTTP

| Código | Descripción |
|--------|-------------|
| 200 | OK - La solicitud se procesó correctamente |
| 400 | Bad Request - Parámetros de consulta inválidos |
| 401 | Unauthorized - Autenticación necesaria o inválida |
| 404 | Not Found - No se encontraron datos |
| 500 | Internal Server Error - Error del servidor al procesar la solicitud |

## Endpoints de Calendario

### GET `/api/calendar`

Obtiene eventos del calendario de publicaciones estadísticas del INDEC.

#### Parámetros de consulta

| Parámetro | Tipo | Descripción | Valor por defecto |
|-----------|------|-------------|-------------------|
| `month` | number | Mes (1-12) | *null* |
| `year` | number | Año (ej. 2023) | *null* |
| `start_date` | string | Fecha de inicio (YYYY-MM-DD) | *null* |
| `end_date` | string | Fecha de fin (YYYY-MM-DD) | *null* |
| `limit` | number | Cantidad de eventos a devolver | 10 |
| `page` | number | Número de página para paginación | 1 |

#### Notas
- Se recomienda utilizar o bien la combinación month/year, o bien start_date/end_date, pero no ambas simultáneamente.
- La respuesta incluye metadata con información sobre la cantidad total de eventos, filtros aplicados y paginación.

#### Ejemplos de uso

```
GET /api/calendar?month=8&year=2023
GET /api/calendar?start_date=2023-01-01&end_date=2023-12-31
GET /api/calendar?limit=50&page=2
```

#### Respuesta (JSON)

```json
{
  "data": [
    {
      "date": "2025-01-03T00:00:00",
      "day_week": "Viernes",
      "indicator": "Encuesta Nacional a Grandes Empresas",
      "period": "Año 2023",
      "source": "INDEC"
    },
    {
      "date": "2025-01-08T00:00:00",
      "day_week": "Miércoles",
      "indicator": "Índice de producción industrial manufacturero (IPI manufacturero)",
      "period": "Noviembre 2024",
      "source": "INDEC"
    },
    ...
  ],
  "metadata": {
    "count": 150,
    "total_count": 336,
    "filtered_by": {}    
    },
  "pagination": {
      "page": 1,
      "limit": 10,
      "total_pages": 34,
      "has_more": true
    } 
}
```

## Endpoints del EMAE (Estimador Mensual de Actividad Económica)

### GET `/api/emae`

Obtiene datos del EMAE general con series original, desestacionalizada y tendencia-ciclo.

#### Parámetros de consulta

| Parámetro | Tipo | Descripción | Valor por defecto |
|-----------|------|-------------|-------------------|
| `start_date` | string | Fecha inicial en formato ISO (YYYY-MM-DD) | *null* |
| `end_date` | string | Fecha final en formato ISO (YYYY-MM-DD) | *null* |
| `limit` | number | Cantidad máxima de registros a devolver | 12 |
| `page` | number | Número de página para paginación | 1 |
| `format` | string | Formato de respuesta: `json` o `csv` | `json` |
| `sector` | string | Código del sector específico (solo aplicable si `by_activity=true`) | `GENERAL` |
| `by_activity` | boolean | Devolver datos por actividad económica | `false` |
| `include_variations` | boolean | Incluir variaciones calculadas | `true` |

#### Notas
- Al solicitar formato CSV (format=csv), se omite la paginación y se devuelven hasta 10.000 registros.
- Los datos incluyen valores originales y, si están disponibles, series desestacionalizadas y tendencia-ciclo.
- El parámetro `include_variations` añade las variaciones mensuales e interanuales a los resultados.

#### Ejemplos de uso

```
GET /api/emae?start_date=2022-01-01&end_date=2022-12-31
GET /api/emae?limit=50&page=2
GET /api/emae?format=csv
```

#### Respuesta (JSON)

```json
{
  "data": [
    {
      "date": "2023-06-01",
      "sector": "General",
      "sector_code": "GENERAL",
      "original_value": 145.2,
      "seasonally_adjusted_value": 144.5,
      "trend_cycle_value": 143.8,
      "monthly_pct_change": 0.5,
      "yearly_pct_change": 2.7
    },
    {
      "date": "2023-05-01",
      "sector": "General",
      "sector_code": "GENERAL",
      "original_value": 142.7,
      "seasonally_adjusted_value": 143.9,
      "trend_cycle_value": 143.2,
      "monthly_pct_change": 0.2,
      "yearly_pct_change": 1.9
    }
  ],
  "metadata": {
    "count": 2,
    "total_count": 234,
    "page": 1,
    "limit": 12,
    "start_date": "2023-05-01",
    "end_date": "2023-06-01",
    "sector_code": "GENERAL",
    "include_variations": true,
    "by_activity": false
  },
  "pagination": {
    "page": 1,
    "limit": 12,
    "total_items": 234,
    "total_pages": 20,
    "has_more": true
  }
}
```

### GET `/api/emae/sectors`

Obtiene datos del EMAE desagregados por sectores económicos.

#### Parámetros de consulta

| Parámetro | Tipo | Descripción | Valor por defecto |
|-----------|------|-------------|-------------------|
| `start_date` | string | Fecha inicial en formato ISO (YYYY-MM-DD) | *null* |
| `end_date` | string | Fecha final en formato ISO (YYYY-MM-DD) | *null* |
| `sector_code` | string | Código del sector económico (A, B, C, etc.) | *null* |
| `limit` | number | Cantidad de registros por página | 16 |
| `page` | number | Número de página para paginación | 1 |
| `format` | string | Formato de respuesta: `json` o `csv` | `json` |

#### Notas
- Al solicitar formato CSV (format=csv), se omite la paginación y se devuelven hasta 10.000 registros.
- Los datos por sector solo incluyen la serie original (sin desestacionalizar).
- Para obtener la lista completa de sectores y sus códigos, consulte el endpoint de metadata.

#### Ejemplos de uso

```
GET /api/emae/sectors?sector_code=A
GET /api/emae/sectors?start_date=2022-01-01&end_date=2022-12-31
GET /api/emae/sectors?format=csv
```

#### Respuesta (JSON)

```json
{
  "data": [
   {
    "date": "2023-01-01",
    "economy_sector": "Agricultura, ganadería, caza y silvicultura",
    "economy_sector_code": "A",
    "original_value": 81.4273753163762
    },
    {
    "date": "2023-01-01",
    "economy_sector": "Pesca",
    "economy_sector_code": "B",
    "original_value": 176.518839342202
    },
    {
    "date": "2023-01-01",
    "economy_sector": "Explotación de minas y canteras",
    "economy_sector_code": "C",
    "original_value": 102.883370327119
    },
    {
    "date": "2023-01-01",
    "economy_sector": "Industria manufacturera",
    "economy_sector_code": "D",
    "original_value": 113.605761133453
    }
  ],
  "metadata": {
    "count": 4,
    "date_range": {
      "first_date": "2004-01-01",
      "last_date": "2023-06-01",
      "total_months": 234
    },
    "filtered_by": {
      "end_date": "2023-06-01"
    }
  },
  "pagination": {
    "page": 1,
    "limit": 16,
    "total_items": 32,
    "total_pages": 2,
    "has_more": true
  }
}
```

### GET `/api/emae/metadata`

Obtiene metadata sobre los datos del EMAE, incluyendo sectores disponibles y rango de fechas.

#### Parámetros de consulta

Este endpoint no requiere parámetros.

#### Respuesta (JSON)

```json
{
  "sectors": [
    {
      "code": "A",
      "name": "Agricultura, ganadería, caza y silvicultura"
    },
    {
      "code": "B",
      "name": "Pesca"
    },
    {
      "code": "C",
      "name": "Explotación de minas y canteras"
    }
  ],
  "date_range": {
    "first_date": "2004-01-01",
    "last_date": "2023-06-01",
    "total_months": 234
  },
  "available_series": {
    "general": ["original_value", "seasonally_adjusted_value", "cycle_trend_value"],
    "by_activity": ["original_value"]
  },
  "metadata": {
    "last_updated": "2024-08-23",
    "available_formats": ["json", "csv"],
    "endpoints": {
      "main": "/api/emae",
      "sectors": "/api/emae/sectors",
      "metadata": "/api/emae/metadata"
    }
  }
}
```

### GET `/api/emae/latest`

Obtiene los datos más recientes del EMAE, incluyendo variaciones mensuales e interanuales.

#### Parámetros de consulta

| Parámetro | Tipo | Descripción | Valor por defecto |
|-----------|------|-------------|-------------------|
| `sector_code` | string | Código específico del sector | `GENERAL` |
| `by_activity` | boolean | Devolver datos por actividad | `false` |

#### Respuesta (JSON)

```json
{ 
  "date": "2024-12-01",
  "sector": "General",
  "sector_code": "GENERAL",
  "original_value": 145.968275964961,
  "seasonally_adjusted_value": 149.183720667308,
  "monthly_pct_change": 0.5,
  "yearly_pct_change": 5.5
}
```

## Endpoints del IPC (Índice de Precios al Consumidor)

### GET `/api/ipc`

Obtiene datos del IPC general y por categorías.

#### Parámetros de consulta

| Parámetro | Tipo | Descripción | Valor por defecto |
|-----------|------|-------------|-------------------|
| `start_date` | string | Fecha inicial en formato ISO (YYYY-MM-DD) | *null* |
| `end_date` | string | Fecha final en formato ISO (YYYY-MM-DD) | *null* |
| `month` | number | Filtrar por mes específico (1-12) | *null* |
| `year` | number | Filtrar por año específico (ej. 2023) | *null* |
| `category` | string | Categoría específica a consultar | `GENERAL` |
| `region` | string | Región específica | `Nacional` |
| `component_type` | string | Tipo de componente (ej. 'RUBRO', 'BYS', 'CATEGORIA') | *null* |
| `include_variations` | boolean | Incluir variaciones mensuales, anuales y acumuladas | `true` |
| `limit` | number | Cantidad de registros por página | 12 |
| `page` | number | Número de página para paginación | 1 |
| `format` | string | Formato de respuesta: `json` o `csv` | `json` |

#### Notas
- Los datos se ordenan por fecha descendente (más recientes primero).
- Al solicitar formato CSV (format=csv), se omite la paginación y se devuelven hasta 10.000 registros.
- Si no se especifica una categoría, se devuelven datos para la categoría 'GENERAL'.
- Los filtros de mes y año permiten analizar tendencias específicas (ej. todos los eneros, o toda la evolución de un año).
- La variación acumulada se calcula respecto a diciembre del año anterior.

#### Regiones disponibles

- `Nacional`: Datos a nivel país (valor por defecto)
- `GBA`: Gran Buenos Aires
- `Cuyo`: Región de Cuyo
- `Noreste`: Región Noreste
- `Noroeste`: Región Noroeste
- `Pampeana`: Región Pampeana
- `Patagonia`: Región Patagónica

#### Ejemplos de uso

```
GET /api/ipc?start_date=2022-01-01&end_date=2022-12-31
GET /api/ipc?region=Patagonia&limit=5
GET /api/ipc?category=RUBRO_ALIMENTOS&region=Nacional&limit=5
GET /api/ipc?month=7&year=2023&category=GENERAL&region=Nacional
GET /api/ipc?include_variations=false&limit=10
```

#### Componentes del IPC

##### Nivel General
- `GENERAL`: Nivel general del IPC (valor por defecto)

##### Rubros
- `RUBRO_ALIMENTOS`: Alimentos y bebidas no alcohólicas
- `RUBRO_BEBIDAS_TABACO`: Bebidas alcohólicas y tabaco
- `RUBRO_PRENDAS`: Prendas de vestir y calzado
- `RUBRO_VIVIENDA`: Vivienda, agua, electricidad y otros combustibles
- Entre otros (consultar el endpoint de metadata para lista completa)

##### Categorías
- `CAT_NUCLEO`: IPC Núcleo
- `CAT_ESTACIONAL`: Estacionales
- `CAT_REGULADOS`: Regulados

##### Bienes y Servicios
- `BYS_BIENES`: Bienes
- `BYS_SERVICIOS`: Servicios

#### Respuesta (JSON)

```json
{
  "data": [
    {
      "date": "2025-01-01",
      "category": "Nivel General",
      "category_code": "GENERAL",
      "category_type": "NIVEL",
      "index_value": 7864.13,
      "region": "Nacional",
      "monthly_pct_change": 2.2,
      "yearly_pct_change": 84.5,
      "accumulated_pct_change": 2.2
    },
    {
      "date": "2024-12-01",
      "category": "Nivel General",
      "category_code": "GENERAL",
      "category_type": "NIVEL",
      "index_value": 7694.84,
      "region": "Nacional",
      "monthly_pct_change": 2.7,
      "yearly_pct_change": 88.3,
      "accumulated_pct_change": 211.4
    }
  ],
  "metadata": {
    "count": 2,
    "total_count": 96,
    "page": 1,
    "limit": 12,
    "start_date": null,
    "end_date": null,
    "month": null,
    "year": null,
    "component_type": null,
    "component_code": "GENERAL",
    "region": "Nacional",
    "include_variations": true
  },
  "pagination": {
    "page": 1,
    "limit": 12,
    "total_items": 96,
    "total_pages": 8,
    "has_more": true
  }
}
```

### GET `/api/ipc/latest`

Obtiene los datos más recientes del IPC para una categoría y región específicas.

#### Parámetros de consulta

| Parámetro | Tipo | Descripción | Valor por defecto |
|-----------|------|-------------|-------------------|
| `category` | string | Categoría específica | `GENERAL` |
| `region` | string | Región específica | `Nacional` |

#### Notas
- Este endpoint devuelve los datos del último mes disponible para la categoría y región especificadas.
- Incluye variaciones mensuales, interanuales y acumuladas.
- Es útil para obtener rápidamente el último valor del IPC sin necesidad de filtrar por fecha.

#### Respuesta (JSON)

```json
{
  "data": {
    "date": "2025-01-01",
    "category": "Nivel General",
    "category_code": "GENERAL",
    "category_type": "NIVEL",
    "index_value": 7864.13,
    "region": "Nacional",
    "monthly_pct_change": 2.2,
    "yearly_pct_change": 84.5,
    "accumulated_pct_change": 2.2,
    "monthly_change_variation": -0.5
  },
  "metadata": {
    "region": "Nacional",
    "component_code": "GENERAL",
    "last_updated": "2025-02-10T14:30:00Z"
  }
}
```

### GET `/api/ipc/metadata`

Obtiene metadata sobre los datos del IPC, incluyendo regiones y componentes disponibles.

#### Parámetros de consulta

Este endpoint no requiere parámetros.

#### Respuesta (JSON)

```json
{
  "regions": [
    "Cuyo",
    "GBA",
    "Nacional",
    "Noreste",
    "Noroeste",
    "Pampeana",
    "Patagonia"
  ],
  "components": {
    "BYS": [
      {
        "code": "BYS_BIENES",
        "name": "Bienes"
      },
      {
        "code": "BYS_SERVICIOS",
        "name": "Servicios"
      }
    ],
    "CATEGORIA": [
      {
        "code": "CAT_ESTACIONAL",
        "name": "Estacional"
      },
      {
        "code": "CAT_NUCLEO",
        "name": "Núcleo"
      },
      {
        "code": "CAT_REGULADOS",
        "name": "Regulados"
      }
    ],
    "RUBRO": [
      {
        "code": "RUBRO_ALIMENTOS",
        "name": "Alimentos y bebidas no alcohólicas"
      },
      {
        "code": "RUBRO_BEBIDAS_TABACO",
        "name": "Bebidas alcohólicas y tabaco"
      },
      {
        "code": "RUBRO_PRENDAS",
        "name": "Prendas de vestir y calzado"
      },
      {
        "code": "RUBRO_VIVIENDA",
        "name": "Vivienda, agua, electricidad, gas y otros combustibles"
      }
    ]
  },
  "metadata": {
    "last_updated": "2025-01-01",
    "available_formats": ["json", "csv"],
    "endpoints": {
      "main": "/api/ipc",
      "latest": "/api/ipc/latest",
      "metadata": "/api/ipc/metadata"
    }
  }
}
```

## Análisis Temporal del IPC

La API permite realizar análisis temporales específicos utilizando los parámetros `month` y `year`:

### Análisis de un mes específico a lo largo de los años

Para ver la evolución de un mes específico (por ejemplo, todos los eneros):

```
GET /api/ipc?month=1&category=GENERAL&region=Nacional
```

### Análisis de un año completo

Para ver todos los datos de un año específico:

```
GET /api/ipc?year=2023&category=GENERAL&region=Nacional
```

### Análisis de un mes específico en un año específico

Para ver los datos de un mes y año específicos:

```
GET /api/ipc?month=7&year=2023&category=GENERAL&region=Nacional
```

## Variaciones Calculadas

La API calcula automáticamente tres tipos de variaciones porcentuales:

- **monthly_pct_change**: Variación porcentual respecto al mes anterior
- **yearly_pct_change**: Variación porcentual interanual (respecto al mismo mes del año anterior)
- **accumulated_pct_change**: Variación porcentual acumulada desde diciembre del año anterior

Si no necesitas estos cálculos, puedes excluirlos para obtener respuestas más ligeras usando el parámetro `include_variations=false`.

## Ejemplos de uso con cURL

### Consulta básica de EMAE

```bash
curl "https://api.econovista.gov.ar/v1/api/emae?start_date=2022-01-01&end_date=2022-12-31"
```

### Consulta de EMAE por actividad para un sector específico

```bash
curl "https://api.econovista.gov.ar/v1/api/emae/sectors?sector_code=A"
```

### Descarga de datos IPC en formato CSV

```bash
curl -o ipc_data.csv "https://api.econovista.gov.ar/v1/api/ipc?format=csv"
```

### Consulta de eventos del calendario para un mes específico

```bash
curl "https://api.econovista.gov.ar/v1/api/calendar?month=8&year=2023"
```

## Notas adicionales

- Todos los valores numéricos en las respuestas se devuelven como números, no como cadenas.
- Las fechas se devuelven en formato ISO (YYYY-MM-DD).
- En caso de no encontrar datos que coincidan con los filtros, se devolverá un array vacío en el campo `data`, no un error.
- La API implementa caché con stale-while-revalidate para ofrecer mejor rendimiento.
- Las variaciones del IPC por defecto se muestran en puntos porcentuales, no en porcentajes base 100.