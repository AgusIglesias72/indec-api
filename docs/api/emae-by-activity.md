# Documentación de la API de EMAE por Actividad

Esta documentación describe el endpoint para consultar los datos del Estimador Mensual de Actividad Económica (EMAE) desglosados por actividad económica.

## Endpoint `/api/emae-by-activity`

Este endpoint permite obtener la serie de datos del EMAE desagregados por sector o actividad económica.

### Método HTTP
- GET

### Parámetros de consulta

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

### Ejemplos de uso

#### Consulta básica
```
GET /api/emae-by-activity
```

#### Filtrar por rango de fechas
```
GET /api/emae-by-activity?start_date=2022-01-01&end_date=2022-12-31
```

#### Filtrar por sector específico
```
GET /api/emae-by-activity?sector_code=A
```

#### Buscar por nombre de sector (búsqueda parcial)
```
GET /api/emae-by-activity?sector=Agricultura
```

#### Agrupar resultados por sector
```
GET /api/emae-by-activity?group_by_sector=true
```

#### Descargar datos en formato CSV
```
GET /api/emae-by-activity?format=csv
```

#### Combinación de parámetros
```
GET /api/emae-by-activity?start_date=2022-01-01&sector=Minería&group_by_sector=true
```

### Respuestas

#### Respuesta sin agrupar (`group_by_sector=false`)

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
    {
      "id": "def456",
      "date": "2022-01-01",
      "economy_sector": "Explotación de minas y canteras",
      "economy_sector_code": "B",
      "original_value": 145.8,
      "created_at": "2023-04-15T10:30:00Z"
    },
    // ... más registros
  ],
  "metadata": {
    "count": 32,
    "page": 1,
    "limit": 1000,
    "start_date": "2022-01-01",
    "end_date": "2022-12-31",
    "sector": null,
    "sector_code": null,
    "group_by_sector": false
  }
}
```

#### Respuesta agrupada por sector (`group_by_sector=true`)

```json
{
  "data": [
    {
      "sector_code": "A",
      "sector_name": "Agricultura, ganadería, caza y silvicultura",
      "data": [
        { "date": "2022-01-01", "value": 157.2 },
        { "date": "2022-02-01", "value": 159.5 },
        { "date": "2022-03-01", "value": 160.3 }
        // ... más fechas
      ]
    },
    {
      "sector_code": "B",
      "sector_name": "Explotación de minas y canteras",
      "data": [
        { "date": "2022-01-01", "value": 145.8 },
        { "date": "2022-02-01", "value": 144.2 },
        { "date": "2022-03-01", "value": 147.1 }
        // ... más fechas
      ]
    }
    // ... más sectores
  ],
  "metadata": {
    "count": 2,
    "page": 1,
    "limit": 1000,
    "start_date": "2022-01-01",
    "end_date": "2022-12-31",
    "sector": null,
    "sector_code": null,
    "group_by_sector": true
  }
}
```

#### Respuesta en formato CSV

Cuando se solicita `format=csv`, el endpoint devuelve un archivo CSV con las siguientes características:

- Primera fila: Nombres de columnas (id, date, economy_sector, economy_sector_code, original_value, created_at)
- Filas siguientes: Datos
- Codificación: UTF-8
- Separador: Coma (,)
- Valores con comas: Rodeados por comillas dobles (")

El navegador generalmente descargará automáticamente este archivo debido al encabezado `Content-Disposition`.

### Códigos de respuesta HTTP

| Código | Descripción |
|--------|-------------|
| 200 | OK - La solicitud fue procesada correctamente |
| 400 | Bad Request - La solicitud contiene parámetros inválidos |
| 404 | Not Found - No se encontraron datos para los criterios solicitados |
| 500 | Internal Server Error - Error en el servidor |

### Manejo de errores

Cuando ocurre un error, el API responde con un objeto JSON que contiene:

```json
{
  "error": "Descripción breve del error",
  "details": "Información detallada sobre el error (opcional)"
}
```

### Ejemplos usando curl

#### Consulta básica
```bash
curl "https://tu-dominio.com/api/emae-by-activity"
```

#### Filtrar por sector específico y agrupar
```bash
curl "https://tu-dominio.com/api/emae-by-activity?sector_code=A&group_by_sector=true"
```

#### Descargar en formato CSV
```bash
curl -o emae_by_activity.csv "https://tu-dominio.com/api/emae-by-activity?format=csv"
```

## Sectores económicos disponibles

Los datos del EMAE por actividad económica incluyen los siguientes sectores:

| Código | Sector |
|--------|--------|
| A | Agricultura, ganadería, caza y silvicultura |
| B | Pesca |
| C | Explotación de minas y canteras |
| D | Industria manufacturera |
| E | Electricidad, gas y agua |
| F | Construcción |
| G | Comercio mayorista, minorista y reparaciones |
| H | Hoteles y restaurantes |
| I | Transporte, almacenamiento y comunicaciones |
| J | Intermediación financiera |
| K | Actividades inmobiliarias, empresariales y de alquiler |
| L | Administración pública y defensa |
| M | Enseñanza |
| N | Servicios sociales y de salud |
| O | Otras actividades de servicios comunitarios, sociales y personales |
| P | Hogares privados con servicio doméstico |

## Notas adicionales

- Los datos de `original_value` representan índices con base 2004=100.
- Algunas series pueden tener datos faltantes para ciertos períodos.
- La agrupación por sector (`group_by_sector=true`) puede ser más eficiente para visualizar series temporales.
- Si no se especifica rango de fechas, el endpoint devuelve todos los datos disponibles, limitados por el parámetro `limit`.