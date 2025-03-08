// src/app/services/indec/fetcher.ts
import axios from 'axios';
import * as XLSX from 'xlsx';
import { parse } from 'csv-parse/sync';
import { EmaeRow, EmaeByActivityInsert, IpcRow } from '../../../types';
import { fetchIPCData } from './ipc-fetcher';

/**
 * Servicio para obtener datos del INDEC
 */
export async function fetchINDECData(indicator: string): Promise<any[]> {
  switch (indicator.toLowerCase()) {
    case 'emae':
      return await fetchEmaeData();
    case 'emae_by_activity':
      return await fetchEmaeByActivityData();
    case 'ipc':
      return await fetchIPCData();
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
    
    console.info(`Descargando Excel del INDEC desde: ${url}`);
    
    // Descargar archivo
    const response = await axios.get(url, {
      responseType: 'arraybuffer'
    });
    
    // Procesar el archivo Excel
    console.info('Archivo descargado, procesando Excel...');
    const workbook = XLSX.read(response.data, { 
      type: 'buffer',
      cellDates: true
    });
    
    console.info('Hojas disponibles en el Excel:', workbook.SheetNames);
    
    // En el EMAE, la hoja principal suele ser la primera
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    
    // Convertir a matriz para procesamiento
    const data = XLSX.utils.sheet_to_json(worksheet, {
      header: 1,
      defval: null,
      blankrows: false
    }) as any[][];
    
    console.info(`Filas totales en el Excel: ${data.length}`);
    
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
        console.info(`Registro ${processedData.length}: ${date}, Original=${originalValue}, Desest=${seasonallyAdjustedValue}, Tendencia=${cycleTrendValue}`);
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
    
    console.info(`Datos procesados: ${processedData.length} registros iniciales, ${finalData.length} registros únicos`);
    
    if (finalData.length > 0) {
      console.info('Primer registro:', finalData[0]);
      console.info('Último registro:', finalData[finalData.length - 1]);
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
 * Obtiene los datos del EMAE por actividad económica desde el archivo Excel del INDEC
 */
async function fetchEmaeByActivityData(): Promise<Omit<EmaeByActivityInsert, 'id'>[]> {
    try {
      // URL del archivo Excel con datos por actividad
      const url = 'https://www.indec.gob.ar/ftp/cuadros/economia/sh_emae_actividad_base2004.xls';
      
      console.info(`Descargando Excel de EMAE por actividad desde: ${url}`);
      
      // Descargar archivo
      const response = await axios.get(url, {
        responseType: 'arraybuffer'
      });
      
      // Procesar el archivo Excel
      console.info('Archivo de actividades descargado, procesando Excel...');
      const workbook = XLSX.read(response.data, { 
        type: 'buffer',
        cellDates: true
      });
      
      console.info('Hojas disponibles en el Excel de actividades:', workbook.SheetNames);
      
      // En el EMAE por actividad, la hoja principal suele ser la primera
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      
      // Convertir a matriz para procesamiento
      const data = XLSX.utils.sheet_to_json(worksheet, {
        header: 1,
        defval: null,
        blankrows: false
      }) as any[][];
      
      console.info(`Filas totales en el Excel de actividades: ${data.length}`);
      
      // Identificar las actividades económicas (nombres de las columnas)
      // Generalmente están en las primeras filas del Excel, buscamos el encabezado
      let headerRow: any[] = [];
      let headerRowIndex = -1;
      
      // Buscar la fila de encabezado que contiene los nombres de las actividades
      for (let i = 0; i < Math.min(20, data.length); i++) {
        const row = data[i];
        // Si la fila tiene varios valores y no contiene año/mes, probablemente es el encabezado
        if (row && row.length > 5 && row.slice(2).some(cell => cell !== null)) {
          headerRow = row;
          headerRowIndex = i;
          break;
        }
      }
      
      if (headerRowIndex === -1) {
        throw new Error('No se pudo encontrar la fila de encabezado con los nombres de las actividades');
      }
      
      console.info(`Fila de encabezado encontrada en el índice ${headerRowIndex}`);
      
      // Mapeo de sectores económicos (columnas C a R, índices 2 a 17)
      // Determinamos los índices de cada sector y su nombre correspondiente
      const sectors: Array<{index: number, code: string, name: string}> = [];
      
      // Códigos de sector según clasificación estándar
      const sectorCodes = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P'];
      
      for (let i = 2; i < headerRow.length; i++) {
        if (headerRow[i] !== null && headerRow[i] !== undefined) {
          const sectorName = String(headerRow[i]).trim(); 
          
          // Asignar un código de sector según su posición o usar un valor por defecto
          const sectorCodeIndex = i - 2;
          const sectorCode = sectorCodeIndex < sectorCodes.length ? 
            sectorCodes[sectorCodeIndex] : `S${sectorCodeIndex + 1}`;
            
          sectors.push({
            index: i,
            code: sectorCode,
            name: sectorName
          });
          
          console.info(`Sector encontrado: ${sectorCode} - ${sectorName} (columna ${i})`);
        }
      }
      
      if (sectors.length === 0) {
        throw new Error('No se pudieron identificar sectores económicos en el Excel');
      }
      
      // Procesar los datos - empezamos después de la fila de encabezado
      const processedData: Omit<EmaeByActivityInsert, 'id'>[] = [];
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
      
      // Recorrer todas las filas de datos (después del encabezado)
      for (let i = headerRowIndex + 1; i < data.length; i++) {
        const row = data[i];
        if (!row || row.length < 3) continue; // Necesitamos al menos algunas columnas
        
        // Verificar si hay un año en la columna A
        if (row[0] !== null && row[0] !== undefined && typeof row[0] === 'number') {
          // Verificar si es un año válido (entre 1990 y 2030)
          if (row[0] >= 1990 && row[0] <= 2030) {
            currentYear = row[0];
            console.info(`Año encontrado: ${currentYear}`);
          }
        }
        
        // Verificar si tenemos un mes en la columna B
        if (!row[1] || typeof row[1] !== 'string') continue;
        
        const monthStr = row[1].toLowerCase().trim();
        if (!monthMap[monthStr]) continue; // No es un mes válido
        
        // Si no tenemos un año válido, no podemos procesar esta fila
        if (currentYear === null) continue;
        
        // Crear fecha ISO
        const date = `${currentYear}-${monthMap[monthStr]}-01`;
        
        // Procesar cada sector para esta fecha
        for (const sector of sectors) {
          let value = null;
          
          // Obtener el valor para este sector desde la columna correspondiente
          if (row[sector.index] !== null && row[sector.index] !== undefined) {
            if (typeof row[sector.index] === 'number') {
              value = row[sector.index];
            } else if (typeof row[sector.index] === 'string' && !isNaN(parseFloat(row[sector.index]))) {
              value = parseFloat(row[sector.index]);
            }
          }
          
          // Solo agregar registros si tenemos un valor
          if (value !== null) {
            const economySectorParts = sector.name.includes('-') ? String(sector.name.split('-')[1].trim()) : sector.name;
            processedData.push({
              date,
              economy_sector: economySectorParts,
              economy_sector_code: sector.code,
              original_value: value,
              created_at: new Date().toISOString()
            });
          }
        }
      }
      
      console.info(`Datos procesados: ${processedData.length} registros para ${sectors.length} sectores`);
      
      if (processedData.length === 0) {
        console.warn('No se encontraron datos válidos');
      } else {
        // Mostrar ejemplos de datos
        const groupedByDate: Record<string, EmaeByActivityInsert[]> = {};
        processedData.forEach(item => {
          if (!groupedByDate[item.date]) {
            groupedByDate[item.date] = [];
          }
          groupedByDate[item.date].push(item);
        });
        
        console.info(`Total de fechas encontradas: ${Object.keys(groupedByDate).length}`);
        
        // Mostrar la primera fecha como ejemplo
        const firstDate = Object.keys(groupedByDate).sort()[0];
        console.info(`Ejemplo para la fecha ${firstDate}:`);
        groupedByDate[firstDate].slice(0, 3).forEach(item => {
          console.info(`  Sector ${item.economy_sector_code} (${item.economy_sector}): ${item.original_value}`);
        });
      }
      
      return processedData;
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
      case 'ipc':
        return parseIpcCSV(records);
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


/**
 * Procesa registros CSV del IPC
 */
function parseIpcCSV(records: any[]): Omit<IpcRow, 'id'>[] {
  return records.map(record => ({
    date: record.date,
    component: record.component,
    component_code: record.component_code,
    component_type: record.component_type || 'RUBRO',
    index_value: parseFloat(record.index_value),
    monthly_pct_change: record.monthly_pct_change ? parseFloat(record.monthly_pct_change) : null,
    yearly_pct_change: record.yearly_pct_change ? parseFloat(record.yearly_pct_change) : null,
    accumulated_pct_change: record.accumulated_pct_change ? parseFloat(record.accumulated_pct_change) : null,
    region: record.region || 'Nacional',
    created_at: new Date().toISOString()
  }));
}