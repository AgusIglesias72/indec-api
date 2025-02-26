// src/app/services/indec/fetcher.ts
import axios from 'axios';
import * as XLSX from 'xlsx';
import { parse } from 'csv-parse/sync';
import { EmaeRow, EmaeByActivityInsert } from '@/types';

/**
 * Servicio para obtener datos del INDEC
 */
export async function fetchINDECData(indicator: string): Promise<any[]> {
  switch (indicator.toLowerCase()) {
    case 'emae':
      return await fetchEmaeData();
    case 'emae_by_activity':
      return await fetchEmaeByActivityData();
    default:
      throw new Error(`Indicador no soportado: ${indicator}`);
  }
}

/**
 * Obtiene los datos del EMAE general desde el archivo Excel del INDEC
 */
async function fetchEmaeData(): Promise<Omit<EmaeRow, 'id'>[]> {
  try {
    // URL del archivo Excel del INDEC
    const url = 'https://www.indec.gob.ar/ftp/cuadros/economia/sh_emae_mensual_base2004.xls';
    
    console.log(`Descargando Excel del INDEC desde: ${url}`);
    
    // Descargar archivo
    const response = await axios.get(url, {
      responseType: 'arraybuffer'
    });
    
    // Procesar el archivo Excel
    console.log('Archivo descargado, procesando Excel...');
    const workbook = XLSX.read(response.data, { 
      type: 'buffer',
      cellDates: true
    });
    
    console.log('Hojas disponibles en el Excel:', workbook.SheetNames);
    
    // En el EMAE, la hoja principal suele ser la primera
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    
    // Convertir a matriz para procesamiento
    const data = XLSX.utils.sheet_to_json(worksheet, {
      header: 1,
      defval: null,
      blankrows: false
    }) as any[][];
    
    console.log(`Filas totales en el Excel: ${data.length}`);
    
    // Procesar los datos - usar directamente las columnas especificadas
    const processedData: Omit<EmaeRow, 'id'>[] = [];
    let currentYear: number | null = null;
    
    // Mapeo de nombres de meses a números
    const monthMap: Record<string, string> = {
      'enero': '01', 
      'febrero': '02', 
      'marzo': '03', 
      'abril': '04', 
      'mayo': '05', 
      'junio': '06', 
      'julio': '07', 
      'agosto': '08', 
      'septiembre': '09', 
      'octubre': '10', 
      'noviembre': '11', 
      'diciembre': '12'
    };
    
    // Recorrer todas las filas y procesar aquellas que tienen datos
    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      if (!row || row.length < 7) continue; // Necesitamos al menos 7 columnas (A-G)
      
      // Verificar si hay un año en la columna A
      if (row[0] !== null && row[0] !== undefined && typeof row[0] === 'number') {
        // Verificar si es un año válido (entre 1990 y 2030)
        if (row[0] >= 1990 && row[0] <= 2030) {
          currentYear = row[0];
        }
      }
      
      // Verificar si tenemos un mes en la columna B
      if (!row[1] || typeof row[1] !== 'string') continue;
      
      const monthStr = row[1].toLowerCase().trim();
      if (!monthMap[monthStr]) continue; // No es un mes válido
      
      // Si no tenemos un año válido, no podemos procesar esta fila
      if (currentYear === null) continue;
      
      // Extraer valores de las columnas específicas
      let originalValue = 0;
      let seasonallyAdjustedValue = 0;
      let cycleTrendValue = 0;
      
      // Serie original (Columna C - índice 2)
      if (row[2] !== null && row[2] !== undefined) {
        if (typeof row[2] === 'number') {
          originalValue = row[2];
        } else if (typeof row[2] === 'string' && !isNaN(parseFloat(row[2]))) {
          originalValue = parseFloat(row[2]);
        }
      }
      
      // Serie desestacionalizada (Columna E - índice 4)
      if (row[4] !== null && row[4] !== undefined) {
        if (typeof row[4] === 'number') {
          seasonallyAdjustedValue = row[4];
        } else if (typeof row[4] === 'string' && !isNaN(parseFloat(row[4]))) {
          seasonallyAdjustedValue = parseFloat(row[4]);
        }
      }
      
      // Tendencia-ciclo (Columna G - índice 6)
      if (row[6] !== null && row[6] !== undefined) {
        if (typeof row[6] === 'number') {
          cycleTrendValue = row[6];
        } else if (typeof row[6] === 'string' && !isNaN(parseFloat(row[6]))) {
          cycleTrendValue = parseFloat(row[6]);
        }
      }
      
      // Crear fecha ISO
      const date = `${currentYear}-${monthMap[monthStr]}-01`;
      
      // Agregar registro procesado
      processedData.push({
        date,
        original_value: originalValue,
        seasonally_adjusted_value: seasonallyAdjustedValue,
        cycle_trend_value: cycleTrendValue,
        activities_data: null,
        created_at: new Date().toISOString()
      });
      
      if (processedData.length <= 3 || processedData.length % 20 === 0) {
        console.log(`Registro ${processedData.length}: ${date}, Original=${originalValue}, Desest=${seasonallyAdjustedValue}, Tendencia=${cycleTrendValue}`);
      }
    }
    
    // Ordenar por fecha
    processedData.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    // Eliminar duplicados por fecha
    const uniqueData: Record<string, Omit<EmaeRow, 'id'>> = {};
    processedData.forEach(item => {
      uniqueData[item.date] = item;
    });
    
    const finalData = Object.values(uniqueData);
    
    console.log(`Datos procesados: ${processedData.length} registros iniciales, ${finalData.length} registros únicos`);
    
    if (finalData.length > 0) {
      console.log('Primer registro:', finalData[0]);
      console.log('Último registro:', finalData[finalData.length - 1]);
    } else {
      console.warn('No se encontraron datos válidos');
    }
    
    return finalData;
  } catch (error) {
    console.error('Error al obtener datos del EMAE:', error);
    throw new Error(`Error al obtener datos del EMAE: ${(error as Error).message}`);
  }
}

/**
 * Obtiene los datos del EMAE por actividad económica
 * (Mantenemos la simulación para este método por ahora)
 */
async function fetchEmaeByActivityData(): Promise<Omit<EmaeByActivityInsert, 'id'>[]> {
  try {
    // Nota: En un entorno real, aquí también implementaríamos la lectura desde un Excel
    // Para este ejemplo, mantenemos la simulación
    
    // Actividades económicas principales del EMAE
    const sectors = [
      { code: 'A', name: 'Agricultura, ganadería, caza y silvicultura' },
      { code: 'B', name: 'Pesca' },
      { code: 'C', name: 'Explotación de minas y canteras' },
      { code: 'D', name: 'Industria manufacturera' },
      { code: 'E', name: 'Electricidad, gas y agua' },
      { code: 'F', name: 'Construcción' },
      { code: 'G', name: 'Comercio' },
      { code: 'H', name: 'Hoteles y restaurantes' },
      { code: 'I', name: 'Transporte y comunicaciones' },
      { code: 'J', name: 'Intermediación financiera' },
      { code: 'K', name: 'Actividades inmobiliarias, empresariales y de alquiler' },
      { code: 'L', name: 'Administración pública y defensa' },
      { code: 'M', name: 'Enseñanza' },
      { code: 'N', name: 'Servicios sociales y de salud' },
      { code: 'O', name: 'Otras actividades de servicios' },
      { code: 'P', name: 'Hogares privados con servicio doméstico' }
    ];
    
    const currentDate = new Date();
    const data: Omit<EmaeByActivityInsert, 'id'>[] = [];
    
    // Generar datos para cada sector durante 24 meses
    for (let i = 0; i < 24; i++) {
      const date = new Date(currentDate);
      date.setMonth(date.getMonth() - i);
      const formattedDate = date.toISOString().split('T')[0];
      
      // Generar datos para cada sector
      sectors.forEach(sector => {
        // Simulación de valores con variación por sector
        const sectorVariation = (parseInt(sector.code.charCodeAt(0).toString()) % 5) * 0.5;
        const originalValue = 100 + Math.sin(i * 0.5) * (5 + sectorVariation) + i * (0.1 + sectorVariation * 0.05);
        
        data.push({
          date: formattedDate,
          economy_sector: sector.name,
          economy_sector_code: sector.code,
          original_value: parseFloat(originalValue.toFixed(1)),
          created_at: new Date().toISOString()
        });
      });
    }
    
    return data;
  } catch (error) {
    console.error('Error al obtener datos de EMAE por actividad:', error);
    throw new Error(`Error al obtener datos de EMAE por actividad: ${(error as Error).message}`);
  }
}

/**
 * Función para obtener datos históricos desde un archivo CSV
 */
export async function importHistoricalDataFromCSV(csvContent: string, indicator: string) {
  try {
    // Analizar CSV
    const records = parse(csvContent, {
      columns: true,
      skip_empty_lines: true
    });
    
    switch (indicator.toLowerCase()) {
      case 'emae':
        return parseEmaeCSV(records);
      case 'emae_by_activity':
        return parseEmaeByActivityCSV(records);
      default:
        throw new Error(`Indicador no soportado para importación: ${indicator}`);
    }
  } catch (error) {
    console.error('Error al importar datos históricos:', error);
    throw new Error(`Error al importar datos históricos: ${(error as Error).message}`);
  }
}

/**
 * Procesa registros CSV del EMAE general
 */
function parseEmaeCSV(records: any[]): Omit<EmaeRow, 'id'>[] {
  return records.map(record => ({
    date: record.date,
    original_value: parseFloat(record.original_value),
    seasonally_adjusted_value: parseFloat(record.seasonally_adjusted_value),
    cycle_trend_value: parseFloat(record.cycle_trend_value),
    activities_data: null,
    created_at: new Date().toISOString()
  }));
}

/**
 * Procesa registros CSV del EMAE por actividad
 */
function parseEmaeByActivityCSV(records: any[]): Omit<EmaeByActivityInsert, 'id'>[] {
  return records.map(record => ({
    date: record.date,
    economy_sector: record.economy_sector,
    economy_sector_code: record.economy_sector_code,
    original_value: parseFloat(record.original_value),
    created_at: new Date().toISOString()
  }));
}