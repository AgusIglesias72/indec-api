# Documentación de la API de EMAE

Esta documentación describe los endpoints disponibles para consultar datos del Estimador Mensual de Actividad Económica (EMAE) del INDEC.

## Endpoints

### 1. GET `/api/emae`

Obtiene datos del EMAE general.

#### Parámetros de consulta

| Parámetro | Tipo | Descripción | Valor por defecto |
|-----------|------|-------------|-------------------|
| `start_date` | string | Fecha inicial en formato ISO (YYYY-MM-DD) | `null` |
| `end_date` | string | Fecha final en formato ISO (YYYY-MM-DD) | `null` |
| `limit` | number | Cantidad máxima de registros a devolver | 100 |
| `page` | number | Número de página para paginación | 1 |
| `format` | string | Formato de respuesta: `json` o `csv` | `json` |

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
      "date": "2022-01-01",
      "original_value": 145.2,
      "seasonally_adjusted_value": 158.7,
      "cycle_trend_value": 152.3
    },
    // ... más registros
  ],
  "metadata": {
    "count": 12,
    "page": 1,
    "limit": 100,
    "start_date": "2022-01-01",
    "end_date": "2022-12-31"
  }
}
```

### 2. GET `/api/emae-by-activity`

Obtiene datos del EMAE desglosados por actividad económica.

#### Parámetros de consulta

| Parámetro | Tipo | Descripción | Valor por defecto |
|-----------|------|-------------|-------------------|
| `start_date` | string | Fecha inicial en formato ISO (YYYY-MM-DD) | `null` |
| `end_date` | string | Fecha final en formato ISO (YYYY-MM-DD) | `null` |
| `limit` | number | Cantidad máxima de registros a devolver | 1000 |
| `page` | number | Número de página para paginación | 1 |
| `sector` | string | Filtrar por nombre del sector (búsqueda parcial) | `null` |
| `sector_code` | string | Filtrar por código exacto del sector | `null` |
| `group_by_sector` | boolean | Si es `true`, agrupa los resultados por sector | `false` |
| `format` | string | Formato de respuesta: `json` o `csv` | `json` |

#### Ejemplos de uso

```
GET /api/emae-by-activity?start_date=2022-01-01&sector=Agricultura
GET /api/emae-by-activity?sector_code=A&group_by_sector=true
GET /api/emae-by-activity?format=csv
```

#### Respuesta (JSON)

**Sin agrupar por sector (`group_by_sector=false`):**

```json
{
  "data": [
    {
      "id": "abc123",
      "date": "2022-01-01",
      "economy_sector": "Agricultura, ganadería, caza y silvicultura",
      "economy_sector_code": "A",
      "original_value": 157.2,
      "created_at": "2023-04-15T10:30:00Z"
    },
    // ... más registros
  ],
  "metadata": {
    "count": 150,
    "page": 1,
    "limit": 1000,
    "start_date": "2022-01-01",
    "end_date": null,
    "sector": "Agricultura",
    "sector_code": null,
    "group_by_sector": false
  }
}
```

**Agrupado por sector (`group_by_sector=true`):**

```json
{
  "data": [
    {
      "sector_code": "A",
      "sector_name": "Agricultura, ganadería, caza y silvicultura",
      "data": [
        {
          "date": "2022-01-01",
          "value": 157.2
        },
        {
          "date": "2022-02-01",
          "value": 159.5
        }
        // ... más fechas
      ]
    },
    // ... más sectores
  ],
  "metadata": {
    "count": 150,
    "page": 1,
    "limit": 1000,
    "start_date": "2022-01-01",
    "end_date": null,
    "sector": null,
    "sector_code": null,
    "group_by_sector": true
  }
}
```

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

Ejemplo de respuesta de error:

```json
{
  "error": "Error al consultar la base de datos",
  "details": "Mensaje de error específico"
}
```

## Ejemplos de uso con curl

### Consulta básica de EMAE

```bash
curl "https://tu-dominio.com/api/emae?start_date=2022-01-01&end_date=2022-12-31"
```

### Consulta de EMAE por actividad para un sector específico

```bash
curl "https://tu-dominio.com/api/emae-by-activity?sector_code=A&group_by_sector=true"
```

### Descarga de datos en formato CSV

```bash
curl -o emae_data.csv "https://tu-dominio.com/api/emae?format=csv"
```

## Notas adicionales

- Todos los valores numéricos en las respuestas se devuelven como números, no como cadenas.
- Las fechas se devuelven en formato ISO (YYYY-MM-DD).
- En caso de no encontrar datos que coincidan con los filtros, se devolverá un array vacío en el campo `data`, no un error.