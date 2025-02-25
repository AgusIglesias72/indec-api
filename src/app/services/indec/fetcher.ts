import axios from 'axios';
import * as cheerio from 'cheerio';
import { parse } from 'csv-parse/sync';
import { EmaeRow, EmaeByActivityInsert } from '@/types';

/**
 * Servicio para obtener datos del INDEC mediante web scraping
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
 * Obtiene los datos del EMAE general desde el sitio del INDEC
 * Nota: El INDEC suele publicar CSVs o archivos Excel con los datos
 */
async function fetchEmaeData(): Promise<EmaeRow[]> {
  try {
    // URL del archivo CSV o Excel (esto varía según INDEC)
    const url = 'https://www.indec.gob.ar/ftp/cuadros/economia/sh_emae_base2004.xls';
    
    // Descargar archivo
    const response = await axios.get(url, {
      responseType: 'arraybuffer'
    });
    
    // En un caso real, procesaríamos el archivo Excel aquí
    // Para este ejemplo, simularemos algunos datos
    
    // Simulación de datos para ejemplo
    const currentDate = new Date();
    const data: EmaeRow[] = [];
    
    // Generar 24 meses de datos de muestra
    for (let i = 0; i < 24; i++) {
      const date = new Date(currentDate);
      date.setMonth(date.getMonth() - i);
      
      // Formato YYYY-MM-DD
      const formattedDate = date.toISOString().split('T')[0];
      // Valor original (simulado como una serie con tendencia y estacionalidad)
      const originalValue = 100 + Math.sin(i * 0.5) * 10 + i * 0.2;
      // Valor desestacionalizado (simulado como la tendencia)
      const seasonallyAdjustedValue = 100 + i * 0.2;
      // Valor de tendencia-ciclo 
      const cycleTrendValue = 100 + i * 0.2 - Math.sin(i * 0.1) * 2;
      
      data.push({
        id: `emae-${formattedDate}`,
        date: formattedDate,
        original_value: parseFloat(originalValue.toFixed(1)),
        seasonally_adjusted_value: parseFloat(seasonallyAdjustedValue.toFixed(1)),
        cycle_trend_value: parseFloat(cycleTrendValue.toFixed(1)),
        activities_data: null,
        created_at: new Date().toISOString()
      });
    }
    
    return data;
  } catch (error) {
    console.error('Error al obtener datos del EMAE:', error);
    throw new Error(`Error al obtener datos del EMAE: ${(error as Error).message}`);
  }
}

/**
 * Obtiene los datos del EMAE por actividad económica
 */
async function fetchEmaeByActivityData(): Promise<EmaeByActivityInsert[]> {
  try {
    // Similar al anterior, pero para datos por sector
    
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
    const data: EmaeByActivityInsert[] = [];
    
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
          id: `emae-${sector.code}-${formattedDate}`,
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
function parseEmaeCSV(records: any[]): EmaeRow[] {
  return records.map(record => ({
    id: `emae-${record.date}`,
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
function parseEmaeByActivityCSV(records: any[]): EmaeByActivityInsert[] {
  return records.map(record => ({
    id: `emae-${record.economy_sector_code}-${record.date}`,
    date: record.date,
    economy_sector: record.economy_sector,
    economy_sector_code: record.economy_sector_code,
    original_value: parseFloat(record.original_value),
    created_at: new Date().toISOString()
  }));
}