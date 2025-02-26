# Documentación de la API de IPC

Esta documentación describe el endpoint disponible para consultar datos del Índice de Precios al Consumidor (IPC) del INDEC.

## Endpoint

### GET `/api/ipc`

Obtiene datos del IPC general y sus componentes, con variaciones calculadas dinámicamente.

#### Parámetros de consulta

| Parámetro | Tipo | Descripción | Valor por defecto |
|-----------|------|-------------|-------------------|
| `start_date` | string | Fecha inicial en formato ISO (YYYY-MM-DD) | `null` |
| `end_date` | string | Fecha final en formato ISO (YYYY-MM-DD) | `null` |
| `limit` | number | Cantidad máxima de registros a devolver | 100 |
| `page` | number | Número de página para paginación | 1 |
| `component_type` | string | Tipo de componente: 'GENERAL', 'RUBRO', 'CATEGORIA', 'BYS' | `null` (todos) |
| `component_code` | string | Código específico del componente | `null` (todos) |
| `region` | string | Región para la cual se solicitan los datos (Nacional, GBA, Pampeana, etc.) | `Nacional` |
| `include_variations` | boolean | Si se deben incluir las variaciones calculadas | `true` |
| `format` | string | Formato de respuesta: `json` o `csv` | `json` |

#### Ejemplos de uso

```
GET /api/ipc?start_date=2022-01-01&end_date=2022-12-31
GET /api/ipc?limit=50&page=2
GET /api/ipc?component_type=GENERAL
GET /api/ipc?component_type=RUBRO
GET /api/ipc?region=GBA
GET /api/ipc?include_variations=false
GET /api/ipc?format=csv
```

#### Respuesta (JSON)

```json
{
  "data": [
    {
      "date": "2022-01-01",
      "component": "Nivel general",
      "component_code": "GENERAL",
      "component_type": "GENERAL",
      "index_value": 1046.9,
      "monthly_pct_change": 3.9,
      "yearly_pct_change": 50.7,
      "accumulated_pct_change": 3.9,
      "region": "Nacional"
    },
    // ... más registros
  ],
  "metadata": {
    "count": 12,
    "page": 1,
    "limit": 100,
    "start_date": "2022-01-01",
    "end_date": "2022-12-31",
    "component_type": "GENERAL",
    "component_code": null,
    "region": "Nacional",
    "include_variations": true
  }
}
```

## Variaciones calculadas dinámicamente

El endpoint calcula las siguientes variaciones para cada registro:

- **monthly_pct_change**: Variación porcentual respecto al mes anterior
- **yearly_pct_change**: Variación porcentual respecto al mismo mes del año anterior
- **accumulated_pct_change**: Variación porcentual acumulada desde diciembre del año anterior

Estas variaciones se calculan dinámicamente en el momento de la consulta, utilizando los datos históricos disponibles en la base de datos.

## Tipos de componentes

El IPC se estructura en diferentes tipos de componentes:

1. **GENERAL**: Índice de nivel general (base total del IPC)
2. **RUBRO**: Categorías principales como "Alimentos y bebidas no alcohólicas", "Vestimenta", etc.
3. **CATEGORIA**: Agrupamientos específicos: "Estacional", "Núcleo" y "Regulados"
4. **BYS**: División en "Bienes" y "Servicios"

Puedes filtrar por un tipo específico mediante el parámetro `component_type`.

## Regiones disponibles

El IPC cuenta con datos para diferentes regiones geográficas:

1. **Nacional**: Cobertura nacional completa (default)
2. **GBA**: Gran Buenos Aires
3. **Pampeana**: Región Pampeana
4. **Noroeste**: Región Noroeste
5. **Noreste**: Región Noreste
6. **Cuyo**: Región de Cuyo
7. **Patagonia**: Región Patagónica

Puedes especificar la región deseada mediante el parámetro `region`.

## Formatos de respuesta

### JSON (Formato por defecto)

El formato JSON devuelve un objeto con dos propiedades principales:

- `data`: Array con los datos solicitados.
- `metadata`: Información sobre la consulta realizada y parámetros utilizados.

### CSV (format=csv)

El formato CSV devuelve un archivo delimitado por comas con:

- Primera fila: Nombres de columnas
- Filas siguientes: Datos

Se incluye un encabezado `Content-Disposition` para sugerir al navegador que descargue el archivo.

## Códigos de error

| Código HTTP | Descripción |
|-------------|-------------|
| 200 | OK - La solicitud se procesó correctamente |
| 400 | Bad Request - Parámetros de consulta inválidos |
| 404 | Not Found - No se encontraron datos |
| 500 | Internal Server Error - Error del servidor al procesar la solicitud |

## Consideraciones para el rendimiento

Cuando `include_variations=true` (valor por defecto), la API realizará consultas adicionales para obtener datos históricos necesarios para calcular las variaciones correctamente. Esto puede aumentar ligeramente el tiempo de respuesta.

Si no necesitas las variaciones, puedes usar `include_variations=false` para obtener respuestas más rápidas.