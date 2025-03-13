// src/data/api-endpoints.ts
// Datos de los endpoints para la documentación de la API

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
        { name: "end_date", type: "string", required: false, description: "Fecha de fin (YYYY-MM-DD)" },
        { name: "limit", type: "number", required: false, description: "Cantidad de eventos a devolver (máx. 100, por defecto 10)" },
        { name: "page", type: "number", required: false, description: "Número de página para paginación" }
      ],
      notes: [
        "Se recomienda utilizar o bien la combinación month/year, o bien start_date/end_date, pero no ambas simultáneamente.",
        "La respuesta incluye metadata con información sobre la cantidad total de eventos, filtros aplicados y paginación."
      ],
      responseExample: `{
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
      ...resto de los eventos
    ],
    "metadata": {
      "count": 150,
      "total_count": 336,
      "filtered_by": {},    
      },
    "pagination": {
        "page": 1,
        "limit": 10,
        "total_pages": 34,
        "has_more": true
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
        { name: "limit", type: "number", required: false, description: "Cantidad de registros por página (por defecto 10)" },
        { name: "page", type: "number", required: false, description: "Número de página para paginación (por defecto 1)" },
        { name: "format", type: "string", required: false, description: "Formato de respuesta: 'json' (por defecto) o 'csv'" }
      ],
      notes: [
        "Al solicitar formato CSV (format=csv), se omite la paginación y se devuelven hasta 10.000 registros.",
        "Los datos incluyen valores originales y, si están disponibles, series desestacionalizadas y tendencia-ciclo.",
        "La respuesta incluye metadata con información sobre filtros aplicados y paginación."
      ],
      responseExample: `{
    "data": [
      {
        "date": "2023-06-01",
        "original_value": 145.2,
        "seasonally_adjusted_value": 144.5,
        "cycle_trend_value": 143.8
      },
      {
        "date": "2023-05-01",
        "original_value": 142.7,
        "seasonally_adjusted_value": 143.9,
        "cycle_trend_value": 143.2
      }
    ],
    "metadata": {
      "count": 2,
      "filtered_by": {
        "start_date": "2023-05-01",
        "end_date": "2023-06-01"
      }
    },
    "pagination": {
      "page": 1,
      "limit": 10,
      "total_items": 234,
      "total_pages": 24,
      "has_more": true
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
        { name: "limit", type: "number", required: false, description: "Cantidad de registros por página (por defecto 16)" },
        { name: "page", type: "number", required: false, description: "Número de página para paginación (por defecto 1)" },
        { name: "format", type: "string", required: false, description: "Formato de respuesta: 'json' (por defecto) o 'csv'" }
      ],
      notes: [
        "Al solicitar formato CSV (format=csv), se omite la paginación y se devuelven hasta 10.000 registros.",
        "Los datos por sector solo incluyen la serie original (sin desestacionalizar).",
        "Los parámetros 'month' y 'year' permiten filtrar los datos para un mes y/o año específico, lo que facilita análisis comparativos.",
        "Para obtener datos de múltiples sectores a la vez, especifique los códigos separados por comas (ej. sector_code=A,B,D).",
        "Para obtener la lista completa de sectores y sus códigos, consulte el endpoint de metadata."
      ],
      responseExample: `{
      "data": [
       {
        "date": "2023-01-01T00:00:00",
        "economy_sector": "Agricultura, ganadería, caza y silvicultura",
        "economy_sector_code": "A",
        "original_value": 81.4273753163762,
        "year_over_year_change": 5.2
        },
        {
        "date": "2023-01-01T00:00:00",
        "economy_sector": "Pesca",
        "economy_sector_code": "B",
        "original_value": 176.518839342202,
        "year_over_year_change": -2.8
        },
        {
        "date": "2023-01-01T00:00:00",
        "economy_sector": "Explotación de minas y canteras",
        "economy_sector_code": "C",
        "original_value": 102.883370327119,
        "year_over_year_change": 3.6
        },
        {
        "date": "2023-01-01T00:00:00",
        "economy_sector": "Industria manufacturera",
        "economy_sector_code": "D",
        "original_value": 113.605761133453,
        "year_over_year_change": -1.5
        }
      ],
      "metadata": {
        "count": 4,
        "total_count": 16,
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
      },
      "pagination": {
        "page": 1,
        "limit": 16,
        "total_items": 16,
        "total_pages": 1,
        "has_more": false
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
        "Incluye la lista completa de sectores económicos con sus códigos y el rango de fechas disponibles."
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
      parameters: [],
      notes: [
        "Este endpoint no requiere parámetros y devuelve los datos del último mes disponible.",
        "Incluye variaciones porcentuales respecto al mes anterior y al mismo mes del año anterior.",
        "También proporciona los datos desagregados por sector económico."
      ],
      responseExample: `{ 
    "date": "2024-12-01",
    "original_value": 145.968275964961,
    "seasonally_adjusted_value": 149.183720667308,
    "monthly_change": 0.5,
    "year_over_year_change": 5.5
  }`
    }
  ];
  
  // Endpoints del IPC
  export const ipcEndpoints: ApiEndpoint[] = [
    {
      method: "GET",
      path: "/api/ipc",
      description: "Obtiene datos del IPC general y por categorías.",
      parameters: [
        { name: "start_date", type: "string", required: false, description: "Fecha de inicio (YYYY-MM-DD)" },
        { name: "end_date", type: "string", required: false, description: "Fecha de fin (YYYY-MM-DD)" },
        { name: "month", type: "number", required: false, description: "Filtrar por mes específico (1-12)" },
        { name: "year", type: "number", required: false, description: "Filtrar por año específico (ej. 2023)" },
        { name: "category", type: "string", required: false, description: "Categoría específica a consultar (ej. 'GENERAL', 'RUBRO_ALIMENTOS')" },
        { name: "region", type: "string", required: false, description: "Región específica (ej. 'Nacional', 'GBA')" },
        { name: "component_type", type: "string", required: false, description: "Tipo de componente (ej. 'RUBRO', 'BYS', 'CATEGORIA')" },
        { name: "include_variations", type: "boolean", required: false, description: "Incluir variaciones mensuales, anuales y acumuladas (por defecto: true)" },
        { name: "limit", type: "number", required: false, description: "Cantidad de registros por página (por defecto 12)" },
        { name: "page", type: "number", required: false, description: "Número de página para paginación (por defecto 1)" },
        { name: "format", type: "string", required: false, description: "Formato de respuesta: 'json' (por defecto) o 'csv'" }
      ],
      notes: [
        "Los datos se ordenan por fecha descendente (más recientes primero).",
        "Al solicitar formato CSV (format=csv), se omite la paginación y se devuelven hasta 10.000 registros.",
        "Si no se especifica una categoría, se devuelven datos para la categoría 'GENERAL'.",
        "Los filtros de mes y año permiten analizar tendencias específicas (ej. todos los eneros, o toda la evolución de un año).",
        "La variación acumulada se calcula respecto a diciembre del año anterior.",
        "Para obtener la lista completa de categorías y regiones, consulte el endpoint de metadata."
      ],
      responseExample: `{
    "data": [
      {
        "date": "2025-01-01",
        "component": "Nivel General",
        "component_code": "GENERAL",
        "component_type": "NIVEL",
        "index_value": 7864.13,
        "region": "Nacional",
        "monthly_pct_change": 2.2,
        "yearly_pct_change": 84.5,
        "accumulated_pct_change": 2.2
      },
      {
        "date": "2024-12-01",
        "component": "Nivel General",
        "component_code": "GENERAL",
        "component_type": "NIVEL",
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
  }`
    },
    {
      method: "GET",
      path: "/api/ipc/latest",
      description: "Obtiene los datos más recientes del IPC para una categoría y región específicas.",
      parameters: [
        { name: "category", type: "string", required: false, description: "Categoría específica (ej. 'GENERAL', 'RUBRO_ALIMENTOS'). Por defecto: 'GENERAL'" },
        { name: "region", type: "string", required: false, description: "Región específica (ej. 'Nacional', 'GBA'). Por defecto: 'Nacional'" }
      ],
      notes: [
        "Este endpoint devuelve los datos del último mes disponible para la categoría y región especificadas.",
        "Incluye variaciones mensuales, interanuales y acumuladas.",
        "Es útil para obtener rápidamente el último valor del IPC sin necesidad de filtrar por fecha."
      ],
      responseExample: `{
    "date": "2025-01-01",
    "category": "Nivel General",
    "category_code": "GENERAL",
    "category_type": "NIVEL",
    "index_value": 7864.13,
    "region": "Nacional",
    "monthly_pct_change": 2.2,
    "yearly_pct_change": 84.5,
    "accumulated_pct_change": 2.2
  }`
    },
    {
      method: "GET",
      path: "/api/ipc/metadata",
      description: "Obtiene metadata sobre los datos del IPC, incluyendo regiones y componentes disponibles.",
      parameters: [],
      notes: [
        "Este endpoint no requiere parámetros y devuelve información útil para trabajar con los otros endpoints de IPC.",
        "Incluye información sobre la última actualización y los endpoints disponibles."
      ],
      responseExample: `{
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
          "code": "RUBRO_COMUNICACION",
          "name": "Comunicación"
        },
        {
          "code": "RUBRO_EDUCACION",
          "name": "Educación"
        },
        {
          "code": "RUBRO_EQUIPAMIENTO",
          "name": "Equipamiento y mantenimiento del hogar"
        },
        ...resto de los rubros
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
    }
  ];