// src/data/api-endpoints.ts
// Datos actualizados de los endpoints para la documentación de la API

export interface ApiParameter {
  name: string;
  type: string;
  required: boolean;
  description: string;
}

export interface ApiEndpoint {
  method: string;
  path: string;
  description: string;
  parameters: ApiParameter[];
  notes?: string[];
  responseExample: string;
}

export interface ApiGroup {
  id: string;
  title: string;
  description: string;
  endpoints: ApiEndpoint[];
}

// Endpoints del Calendario
export const calendarEndpoints: ApiEndpoint[] = [
  {
    method: "GET",
    path: "/api/calendar",
    description: "Obtiene eventos del calendario de publicaciones",
    parameters: [
      { name: "month", type: "number", required: false, description: "Mes (1-12)" },
      { name: "year", type: "number", required: false, description: "Año (ej. 2023)" },
      { name: "start_date", type: "string", required: false, description: "Fecha de inicio (YYYY-MM-DD)" },
      { name: "end_date", type: "string", required: false, description: "Fecha de fin (YYYY-MM-DD)" }
    ],
    notes: [
      "Se recomienda utilizar o bien la combinación month/year, o bien start_date/end_date, pero no ambas simultáneamente.",
      "La respuesta incluye todos los eventos que cumplen con los criterios de filtrado, sin paginación.",
      "Las fechas se devuelven en formato ISO con hora (YYYY-MM-DDThh:mm:ss)."
    ],
    responseExample: `{
  "data": [
    {
      "date": "2025-01-03T19:00:00",
      "day_week": "Viernes",
      "indicator": "Encuesta Nacional a Grandes Empresas",
      "period": "Año 2023",
      "source": "INDEC"
    },
    {
      "date": "2025-01-08T19:00:00",
      "day_week": "Miércoles",
      "indicator": "Índice de producción industrial manufacturero (IPI manufacturero)",
      "period": "Noviembre 2024",
      "source": "INDEC"
    },
    ...resto de los eventos
  ],
  "metadata": {
    "count": 150,
    "filtered_by": {
      "year": 2025
    }    
  }
}`
  }
];

// Endpoints del EMAE
export const emaeEndpoints: ApiEndpoint[] = [
  {
    method: "GET",
    path: "/api/emae",
    description: "Obtiene datos generales del EMAE con series original, desestacionalizada y tendencia-ciclo.",
    parameters: [
      { name: "start_date", type: "string", required: false, description: "Fecha de inicio (YYYY-MM-DD)" },
      { name: "end_date", type: "string", required: false, description: "Fecha de fin (YYYY-MM-DD)" },
      { name: "month", type: "number", required: false, description: "Filtrar por mes específico (1-12)" },
      { name: "year", type: "number", required: false, description: "Filtrar por año específico (ej. 2023)" },
      { name: "format", type: "string", required: false, description: "Formato de respuesta: 'json' (por defecto) o 'csv'" },
      { name: "include_variations", type: "boolean", required: false, description: "Incluir variaciones mensuales e interanuales (por defecto: true)" }
    ],
    notes: [
      "Al solicitar formato CSV (format=csv), los datos se devuelven en formato UTF-8 con BOM.",
      "Los datos incluyen valores originales y, si están disponibles, series desestacionalizadas y tendencia-ciclo.",
      "Todos los filtros se aplican directamente en la base de datos para un rendimiento óptimo.",
      "La respuesta incluye todos los datos que cumplen con los criterios de filtrado, sin paginación."
    ],
    responseExample: `{
  "data": [
    {
      "date": "2023-06-01",
      "original_value": 145.2,
      "seasonally_adjusted_value": 144.5,
      "cycle_trend_value": 143.8,
      "sector_code": "GENERAL",
      "sector": "Nivel General",
      "monthly_pct_change": 0.5,
      "yearly_pct_change": 4.2
    },
    {
      "date": "2023-05-01",
      "original_value": 142.7,
      "seasonally_adjusted_value": 143.9,
      "cycle_trend_value": 143.2,
      "sector_code": "GENERAL",
      "sector": "Nivel General",
      "monthly_pct_change": 0.4,
      "yearly_pct_change": 4.8
    }
  ],
  "metadata": {
    "count": 2,
    "filtered_by": {
      "start_date": "2023-05-01",
      "end_date": "2023-06-01",
      "include_variations": true
    }
  }
}`
  },
  {
    method: "GET",
    path: "/api/emae/sectors",
    description: "Obtiene datos del EMAE desagregados por sectores económicos.",
    parameters: [
      { name: "start_date", type: "string", required: false, description: "Fecha de inicio (YYYY-MM-DD)" },
      { name: "end_date", type: "string", required: false, description: "Fecha de fin (YYYY-MM-DD)" },
      { name: "month", type: "number", required: false, description: "Mes específico (1-12)" },
      { name: "year", type: "number", required: false, description: "Año específico (ej. 2023)" },
      { name: "sector_code", type: "string", required: false, description: "Código o códigos del sector económico (A, B, C, etc.) separados por comas (ej. 'A,B,D')" },
      { name: "format", type: "string", required: false, description: "Formato de respuesta: 'json' (por defecto) o 'csv'" },
      { name: "include_variations", type: "boolean", required: false, description: "Incluir variaciones interanuales (por defecto: true)" }
    ],
    notes: [
      "Al solicitar formato CSV (format=csv), los datos se devuelven en formato UTF-8 con BOM.",
      "Los datos por sector incluyen la serie original y opcionalmente las variaciones interanuales.",
      "Los parámetros 'month' y 'year' permiten filtrar datos para un mes y/o año específico, facilitando análisis comparativos.",
      "Para obtener datos de múltiples sectores a la vez, especifique los códigos separados por comas (ej. sector_code=A,B,D).",
      "Todos los filtros se aplican directamente en la base de datos para un rendimiento óptimo.",
      "La respuesta incluye todos los datos que cumplen con los criterios de filtrado, sin paginación."
    ],
    responseExample: `{
  "data": [
    {
      "date": "2023-01-01",
      "economy_sector": "Agricultura, ganadería, caza y silvicultura",
      "economy_sector_code": "A",
      "original_value": 81.4273753163762,
      "year_over_year_change": 5.2
    },
    {
      "date": "2023-01-01",
      "economy_sector": "Pesca",
      "economy_sector_code": "B",
      "original_value": 176.518839342202,
      "year_over_year_change": -2.8
    },
    {
      "date": "2023-01-01",
      "economy_sector": "Explotación de minas y canteras",
      "economy_sector_code": "C",
      "original_value": 102.883370327119,
      "year_over_year_change": 3.6
    },
    {
      "date": "2023-01-01",
      "economy_sector": "Industria manufacturera",
      "economy_sector_code": "D",
      "original_value": 113.605761133453,
      "year_over_year_change": -1.5
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
      "month": 1,
      "year": 2023,
      "sector_code": "A,B,C,D"
    }
  }
}`
  },
  {
    method: "GET",
    path: "/api/emae/metadata",
    description: "Obtiene metadata sobre los datos del EMAE, incluyendo sectores disponibles y rango de fechas.",
    parameters: [],
    notes: [
      "Este endpoint no requiere parámetros y devuelve información útil para trabajar con los otros endpoints de EMAE.",
      "Incluye la lista completa de sectores económicos con sus códigos y el rango de fechas disponibles.",
      "La respuesta es cacheada durante una hora para mejorar el rendimiento."
    ],
    responseExample: `{
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
}`
  },
  {
    method: "GET",
    path: "/api/emae/latest",
    description: "Obtiene los datos más recientes del EMAE, incluyendo variaciones mensuales e interanuales.",
    parameters: [
      { name: "sector_code", type: "string", required: false, description: "Código del sector económico (por defecto: 'GENERAL')" },
      { name: "by_activity", type: "boolean", required: false, description: "Si es true, devuelve datos por actividad en lugar de datos generales (por defecto: false)" }
    ],
    notes: [
      "Este endpoint devuelve los datos del último mes disponible.",
      "Incluye variaciones porcentuales respecto al mes anterior y al mismo mes del año anterior.",
      "Para el EMAE general, también incluye los valores desestacionalizados y de tendencia-ciclo.",
      "La respuesta es cacheada durante una hora para mejorar el rendimiento."
    ],
    responseExample: `{ 
  "date": "2024-12-01",
  "sector_code": "GENERAL",
  "sector": "Nivel General",
  "original_value": 145.968275964961,
  "seasonally_adjusted_value": 149.183720667308,
  "trend_cycle_value": 148.276458932176,
  "monthly_pct_change": 0.5,
  "yearly_pct_change": 5.5
}`
  }
];

// Endpoints del IPC
export const ipcEndpoints: ApiEndpoint[] = [
  {
    method: "GET",
    path: "/api/ipc",
    description: "Endpoint unificado para datos del IPC con múltiples tipos de consulta.",
    parameters: [
      { name: "type", type: "string", required: false, description: "Tipo de consulta: 'latest', 'historical', 'metadata', 'components' (por defecto: 'historical')" },
      { name: "category", type: "string", required: false, description: "Código de categoría (por defecto: 'GENERAL')" },
      { name: "region", type: "string", required: false, description: "Región (por defecto: 'nacional')" },
      { name: "component_type", type: "string", required: false, description: "Tipo de componente para filtrar" },
      { name: "start_date", type: "string", required: false, description: "Fecha de inicio (YYYY-MM-DD)" },
      { name: "end_date", type: "string", required: false, description: "Fecha de fin (YYYY-MM-DD)" },
      { name: "month", type: "number", required: false, description: "Mes específico (1-12)" },
      { name: "year", type: "number", required: false, description: "Año específico (ej. 2024)" },
      { name: "limit", type: "number", required: false, description: "Número máximo de registros (máx: 1000, por defecto: 100)" },
      { name: "page", type: "number", required: false, description: "Página para paginación (por defecto: 1)" },
      { name: "order", type: "string", required: false, description: "Orden: 'asc' o 'desc' (por defecto: 'desc')" },
      { name: "format", type: "string", required: false, description: "Formato: 'json' o 'csv' (por defecto: 'json')" },
      { name: "include_variations", type: "boolean", required: false, description: "Incluir variaciones calculadas (por defecto: true)" }
    ],
    notes: [
      "type='latest': Obtiene el valor más reciente del IPC para la categoría/región especificada.",
      "type='historical': Datos históricos del IPC con paginación y filtros temporales.",
      "type='metadata': Información sobre regiones disponibles, componentes y estructura de la API.",
      "type='components': Componentes del IPC organizados por tipo.",
      "Formato CSV disponible para datos históricos (format=csv).",
      "Las variaciones incluyen cambios mensuales, anuales y acumulados.",
      "Soporte para paginación con límites configurables (máx 1000 registros)."
    ],
    responseExample: `{
  "success": true,
  "data": [
    {
      "date": "2025-01-01",
      "category": "Nivel General",
      "category_code": "GENERAL",
      "category_type": "NIVEL", 
      "index_value": 7864.13,
      "region": "nacional",
      "monthly_pct_change": 2.2,
      "yearly_pct_change": 84.5,
      "accumulated_pct_change": 2.2,
      "monthly_change_variation": -0.5
    }
  ],
  "pagination": {
    "current_page": 1,
    "per_page": 100,
    "total_pages": 1,
    "total_records": 150,
    "has_more": false
  },
  "metadata": {
    "filtered_by": {
      "type": "historical",
      "category": "GENERAL",
      "region": "nacional"
    },
    "last_updated": "2025-01-15T10:00:00Z"
  },
  "stats": {
    "avg_monthly_change": 2.5,
    "std_deviation": 1.2,
    "volatility": "moderate"
  }
}`
  }
];

export const dollarEndpoints: ApiEndpoint[] = [
  {
    method: "GET",
    path: "/api/dollar",
    description: "Endpoint unificado para datos del dólar con múltiples tipos de consulta.",
    parameters: [
      { name: "type", type: "string", required: false, description: "Tipo de consulta: 'latest', 'historical', 'daily', 'metadata' (por defecto: 'latest')" },
      { name: "dollar_type", type: "string", required: false, description: "Tipo de dólar específico o múltiples separados por comas (OFICIAL, BLUE, MEP, CCL, MAYORISTA, CRYPTO, TARJETA)" },
      { name: "start_date", type: "string", required: false, description: "Fecha de inicio (YYYY-MM-DD)" },
      { name: "end_date", type: "string", required: false, description: "Fecha de fin (YYYY-MM-DD)" },
      { name: "limit", type: "number", required: false, description: "Número máximo de registros (máx: 1000, por defecto: 100)" },
      { name: "page", type: "number", required: false, description: "Página para paginación (por defecto: 1)" },
      { name: "order", type: "string", required: false, description: "Orden: 'asc' o 'desc' (por defecto: 'desc')" },
      { name: "format", type: "string", required: false, description: "Formato: 'json' o 'csv' (por defecto: 'json')" },
      { name: "include_variations", type: "boolean", required: false, description: "Incluir variaciones vs día anterior (por defecto: true para latest)" }
    ],
    notes: [
      "type='latest': Último valor de cada tipo de dólar con variaciones opcionales.",
      "type='historical': Datos históricos completos (múltiples actualizaciones diarias) con paginación.", 
      "type='daily': Cierres diarios (último valor de cada día) con estadísticas.",
      "type='metadata': Información sobre tipos disponibles, rangos de fechas y estructura.",
      "Formato CSV disponible para datos históricos y diarios.",
      "Soporte para múltiples tipos de dólar en una sola consulta.",
      "Las variaciones se calculan automáticamente comparando con el período anterior."
    ],
    responseExample: `{
  "success": true,
  "type": "latest", 
  "data": [
    {
      "date": "2025-03-15",
      "dollar_type": "BLUE",
      "dollar_name": "Dólar Blue (informal)",
      "buy_price": 1235.00,
      "sell_price": 1255.00,
      "spread": 1.62,
      "last_updated": "2025-03-15",
      "minutes_ago": 15,
      "buy_variation": 2.5,
      "sell_variation": 3.1
    },
    {
      "date": "2025-03-15", 
      "dollar_type": "OFICIAL",
      "dollar_name": "Dólar Oficial",
      "buy_price": 1065.50,
      "sell_price": 1085.50,
      "spread": 1.88,
      "last_updated": "2025-03-15",
      "minutes_ago": 15,
      "buy_variation": 0.2,
      "sell_variation": 0.3
    }
  ],
  "meta": {
    "type": "latest",
    "timestamp": "2025-03-15T18:30:45.123Z"
  },
  "stats": {
    "buy_price": {
      "min": 1065.50,
      "max": 1235.00,
      "avg": 1150.25
    },
    "sell_price": {
      "min": 1085.50,
      "max": 1255.00, 
      "avg": 1170.25
    },
    "avg_spread": 1.75,
    "total_records": 2
  }
}`
  }
];

// Endpoints de Riesgo País
export const riesgoPaisEndpoints: ApiEndpoint[] = [
  {
    method: "GET",
    path: "/api/riesgo-pais", 
    description: "Obtiene datos del riesgo país argentino (EMBI) con diferentes períodos temporales.",
    parameters: [
      { name: "type", type: "string", required: false, description: "Período: 'latest', 'last_7_days', 'last_30_days', 'last_90_days', 'year_to_date', 'last_year', 'last_5_years', 'all_time', 'custom' (por defecto: 'last_30_days')" },
      { name: "date_from", type: "string", required: false, description: "Fecha inicio para type='custom' (YYYY-MM-DD)" },
      { name: "date_to", type: "string", required: false, description: "Fecha fin para type='custom' (YYYY-MM-DD)" },
      { name: "limit", type: "number", required: false, description: "Número máximo de registros (máx: 5000, por defecto: 100)" },
      { name: "page", type: "number", required: false, description: "Página para paginación (por defecto: 1)" },
      { name: "per_page", type: "number", required: false, description: "Registros por página (máx: 1000, por defecto: 100)" },
      { name: "order", type: "string", required: false, description: "Orden: 'asc' o 'desc' (por defecto: 'desc')" },
      { name: "auto_paginate", type: "boolean", required: false, description: "Paginación automática para límites grandes (por defecto: true)" }
    ],
    notes: [
      "Los datos provienen de cierres diarios optimizados desde la vista 'v_embi_daily_closing'.",
      "auto_paginate=true maneja automáticamente grandes volúmenes de datos (>1000 registros).", 
      "Las estadísticas incluyen métricas de volatilidad y variaciones temporales.",
      "Los períodos predefinidos calculan automáticamente las fechas de inicio y fin.",
      "type='latest' devuelve solo el valor más reciente disponible."
    ],
    responseExample: `{
  "success": true,
  "data": [
    {
      "closing_date": "2025-01-15",
      "closing_value": 1250,
      "daily_change": -25,
      "daily_change_pct": -1.96,
      "monthly_change": 50,
      "monthly_change_pct": 4.17,
      "yearly_change": 200,
      "yearly_change_pct": 19.05
    }
  ],
  "meta": {
    "type": "last_30_days",
    "total_records": 30,
    "date_range": {
      "from": "2024-12-16",
      "to": "2025-01-15"
    },
    "auto_paginated": false
  },
  "stats": {
    "average": 1275.5,
    "min": 1200,
    "max": 1350, 
    "std_deviation": 42.3,
    "volatility": "moderate",
    "trend": "descending"
  }
}`
  }
];

// Endpoints de Mercado Laboral  
export const laborMarketEndpoints: ApiEndpoint[] = [
  {
    method: "GET",
    path: "/api/labor-market",
    description: "Obtiene datos del mercado laboral argentino con diferentes vistas y filtros demográficos.",
    parameters: [
      { name: "view", type: "string", required: false, description: "Vista: 'temporal', 'latest', 'by_type', 'comparison', 'annual' (por defecto: 'temporal')" },
      { name: "data_type", type: "string", required: false, description: "Tipo de datos: 'national', 'regional', 'demographic', 'all' (por defecto: 'national')" },
      { name: "region", type: "string", required: false, description: "Región específica (GBA, Cuyo, NEA, NOA, Pampeana, Patagónica)" },
      { name: "gender", type: "string", required: false, description: "Filtro por género" },
      { name: "age_group", type: "string", required: false, description: "Grupo etario específico" },
      { name: "segment", type: "string", required: false, description: "Segmento demográfico" },
      { name: "indicator", type: "string", required: false, description: "Indicador: 'activity_rate', 'employment_rate', 'unemployment_rate', 'all' (por defecto: 'all')" },
      { name: "period", type: "string", required: false, description: "Período específico (ej. 'T1 2025', '2024')" },
      { name: "start_date", type: "string", required: false, description: "Fecha de inicio (YYYY-MM-DD)" },
      { name: "end_date", type: "string", required: false, description: "Fecha de fin (YYYY-MM-DD)" },
      { name: "include_variations", type: "boolean", required: false, description: "Incluir variaciones vs período anterior (por defecto: true)" },
      { name: "limit", type: "number", required: false, description: "Número máximo de registros (máx: 1000, por defecto: 100)" },
      { name: "format", type: "string", required: false, description: "Formato: 'json' o 'csv' (por defecto: 'json')" }
    ],
    notes: [
      "view='temporal': Series completas con variaciones temporales.",
      "view='latest': Datos más recientes por cada tipo de dato.",  
      "view='comparison': Comparación entre datos nacionales, regionales y demográficos.",
      "view='annual': Agregaciones anuales con promedios y variaciones interanuales.",
      "Los datos incluyen 31 aglomerados urbanos para datos nacionales.",
      "Las variaciones significativas (>1 punto porcentual) son destacadas automáticamente.",
      "Soporte para filtros trimestrales ('T1 2025') y anuales ('2024')."
    ],
    responseExample: `{
  "success": true,
  "data": {
    "national": [
      {
        "period": "T4 2024",
        "data_type": "nacional",
        "activity_rate": 47.8,
        "employment_rate": 44.2,
        "unemployment_rate": 7.5,
        "activity_rate_change": 0.3,
        "employment_rate_change": 0.5,
        "unemployment_rate_change": -0.2,
        "significant_changes": ["employment_rate"]
      }
    ]
  },
  "metadata": {
    "view": "latest",
    "data_types_included": ["national"],
    "period_coverage": "T4 2024",
    "available_filters": {
      "regions": ["GBA", "Cuyo", "NEA", "NOA", "Pampeana", "Patagónica"],
      "indicators": ["activity_rate", "employment_rate", "unemployment_rate"]
    }
  }
}`
  }
];

// Configuración de las pestañas con los grupos de endpoints
export const apiGroups: ApiGroup[] = [
  {
    id: "calendar",
    title: "API de Calendario",
    description: "Accede a información sobre publicaciones programadas del INDEC",
    endpoints: calendarEndpoints
  },
  {
    id: "emae",
    title: "API de EMAE",
    description: "Estimador Mensual de Actividad Económica - Datos generales y por sectores económicos",
    endpoints: emaeEndpoints
  },
  {
    id: "ipc",
    title: "API de IPC", 
    description: "Índice de Precios al Consumidor - Datos generales y por categorías",
    endpoints: ipcEndpoints
  },
  {
    id: "dollar",
    title: "API de Cotizaciones",
    description: "Cotizaciones de dólar y otras divisas - Datos históricos y actuales",
    endpoints: dollarEndpoints
  },
  {
    id: "riesgo-pais",
    title: "API de Riesgo País", 
    description: "Indicador EMBI+ de riesgo soberano argentino - Datos históricos y análisis",
    endpoints: riesgoPaisEndpoints
  },
  {
    id: "labor-market",
    title: "API de Mercado Laboral",
    description: "Indicadores laborales por región y demografía - Tasas de actividad, empleo y desempleo",
    endpoints: laborMarketEndpoints
  }
];
