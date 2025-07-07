// src/services/labor-market-fetcher.ts

import * as XLSX from 'xlsx';
import axios from 'axios';
import { LaborMarketData, LaborMarketRawRow } from '@/types/labor-market';

interface ProcessedLaborData {
  date: string;
  period: string;
  region: string;
  age_group: string | null;
  gender: string | null;
  [key: string]: any;
}

/**
 * Obtiene los datos del mercado laboral desde el Excel de la EPH del INDEC
 * @returns Array de datos del mercado laboral procesados
 */
export async function fetchLaborMarketData(): Promise<Omit<LaborMarketData, "id">[]> {
  try {
    // Obtener el trimestre y año actual para construir la URL
    const now = new Date();
    const currentQuarter = Math.ceil((now.getMonth() + 1) / 3);
    const currentYear = now.getFullYear();
    
    // Construir URLs posibles (el INDEC usa diferentes formatos)
    const possibleUrls = [
      `https://www.indec.gob.ar/ftp/cuadros/menusuperior/eph/cuadros_tasas_indicadores_eph_${String(currentQuarter).padStart(2, '0')}_${String(currentYear).slice(-2)}.xls`,
      `https://www.indec.gob.ar/ftp/cuadros/menusuperior/eph/EPH_usu_${currentQuarter}T${currentYear}.xlsx`,
      `https://www.indec.gob.ar/ftp/cuadros/sociedad/eph/cuadros_tasas_indicadores_eph_${String(currentQuarter).padStart(2, '0')}_${String(currentYear).slice(-2)}.xls`
    ];

    let workbook: XLSX.WorkBook | null = null;
    let successUrl = '';

    // Intentar descargar desde las URLs posibles
    for (const url of possibleUrls) {
      try {
        console.info(`Intentando descargar EPH desde: ${url}`);
        const response = await axios.get(url, {
          responseType: 'arraybuffer',
          timeout: 30000
        });

        workbook = XLSX.read(response.data, {
          cellStyles: false,
          cellDates: true,
          sheetStubs: false
        });
        
        successUrl = url;
        console.info(`Descarga exitosa desde: ${url}`);
        break;
      } catch (error) {
        console.warn(`Error descargando desde ${url}:`, (error as Error).message);
        continue;
      }
    }

    if (!workbook) {
      throw new Error('No se pudo descargar el archivo EPH desde ninguna URL');
    }

    console.info(`Archivo EPH descargado exitosamente desde: ${successUrl}`);
    console.info(`Hojas disponibles: ${workbook.SheetNames.join(', ')}`);

    // Procesar las hojas del Excel
    const allData: Omit<LaborMarketData, "id">[] = [];

    // Buscar la hoja principal (suele ser la primera o tener un nombre específico)
    const mainSheetName = workbook.SheetNames.find(name => 
      name.toLowerCase().includes('tasas') || 
      name.toLowerCase().includes('indicadores') ||
      name.toLowerCase().includes('cuadro') ||
      workbook.SheetNames.indexOf(name) === 0
    ) || workbook.SheetNames[0];

    const worksheet = workbook.Sheets[mainSheetName];
    console.info(`Procesando hoja principal: ${mainSheetName}`);

    // Convertir a JSON para procesamiento
    const rawData = XLSX.utils.sheet_to_json(worksheet, { 
      header: 1,
      defval: null,
      blankrows: false
    }) as any[][];

    if (!rawData || rawData.length === 0) {
      throw new Error('No se encontraron datos en la hoja principal');
    }

    // Encontrar la fila de encabezados con los períodos
    const headerRow = findHeaderRow(rawData);
    if (headerRow === -1) {
      throw new Error('No se pudo encontrar la fila de encabezados con períodos');
    }

    // Extraer períodos de los encabezados
    const periods = extractPeriods(rawData[headerRow]);
    console.info(`Períodos encontrados: ${periods.length} (desde ${periods[0]} hasta ${periods[periods.length - 1]})`);

    // Procesar secciones de datos
    const sections = findDataSections(rawData, headerRow);
    
    for (const section of sections) {
      const sectionData = processDataSection(rawData, section, periods, headerRow);
      allData.push(...sectionData);
    }

    console.info(`Total de registros procesados: ${allData.length}`);
    
    // Filtrar datos válidos y ordenar por fecha
    const validData = allData
      .filter(item => item.date && item.region)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    console.info(`Registros válidos después del filtrado: ${validData.length}`);
    
    return validData;

  } catch (error) {
    console.error('Error en fetchLaborMarketData:', error);
    throw error;
  }
}

/**
 * Busca la fila que contiene los encabezados con períodos trimestrales
 */
function findHeaderRow(data: any[][]): number {
  for (let i = 0; i < Math.min(20, data.length); i++) {
    const row = data[i];
    if (!row) continue;

    // Buscar patrones típicos de períodos trimestrales
    const hasTrimesters = row.some((cell: any) => {
      if (!cell) return false;
      const cellStr = String(cell).toLowerCase();
      return cellStr.includes('t1') || 
             cellStr.includes('t2') || 
             cellStr.includes('t3') || 
             cellStr.includes('t4') ||
             cellStr.match(/trimestre/i) ||
             cellStr.match(/\d{4}/); // Años
    });

    if (hasTrimesters) {
      return i;
    }
  }
  return -1;
}

/**
 * Extrae los períodos trimestrales de la fila de encabezados
 */
function extractPeriods(headerRow: any[]): string[] {
  const periods: string[] = [];
  
  for (let i = 1; i < headerRow.length; i++) {
    const cell = headerRow[i];
    if (!cell) continue;

    const cellStr = String(cell).trim();
    
    // Intentar diferentes formatos de períodos
    let period = '';
    
    // Formato "T1 2017", "T2 2017", etc.
    const trimesterMatch = cellStr.match(/(T[1-4])\s*(\d{4})/i);
    if (trimesterMatch) {
      period = `${trimesterMatch[1].toUpperCase()} ${trimesterMatch[2]}`;
    }
    
    // Formato "1er Trim 2017", "2do Trim 2017", etc.
    const trimesterTextMatch = cellStr.match(/(\d)[er|do|to]?\s*trim\w*\s*(\d{4})/i);
    if (trimesterTextMatch) {
      period = `T${trimesterTextMatch[1]} ${trimesterTextMatch[2]}`;
    }
    
    // Si encontramos un año solo, intentar inferir el trimestre
    const yearMatch = cellStr.match(/^\d{4}$/);
    if (yearMatch && periods.length > 0) {
      // Inferir el trimestre basado en la posición
      const lastPeriod = periods[periods.length - 1];
      const lastTrimesterMatch = lastPeriod.match(/T(\d)/);
      if (lastTrimesterMatch) {
        const nextTrimester = (parseInt(lastTrimesterMatch[1]) % 4) + 1;
        period = `T${nextTrimester} ${yearMatch[0]}`;
      }
    }

    if (period) {
      periods.push(period);
    }
  }

  return periods;
}

/**
 * Encuentra las secciones de datos en el Excel
 */
function findDataSections(data: any[][], headerRow: number): Array<{
  name: string;
  startRow: number;
  endRow: number;
  region: string;
  age_group?: string;
  gender?: string;
}> {
  const sections: Array<{
    name: string;
    startRow: number;
    endRow: number;
    region: string;
    age_group?: string;
    gender?: string;
  }> = [];

  // Patrones comunes en los datos de EPH
  const regionPatterns = [
    /total\s*31\s*aglomerados/i,
    /gba/i,
    /interior/i,
    /región\s*pampeana/i,
    /región\s*noa/i,
    /región\s*nea/i,
    /región\s*cuyo/i,
    /región\s*patagónica/i
  ];

  const indicatorPatterns = [
    /tasa\s*de\s*actividad/i,
    /tasa\s*de\s*empleo/i,
    /tasa\s*de\s*desocupación/i,
    /población\s*económicamente\s*activa/i,
    /población\s*ocupada/i,
    /población\s*desocupada/i
  ];

  let currentSection: any = null;

  for (let i = headerRow + 1; i < data.length; i++) {
    const row = data[i];
    if (!row || !row[0]) continue;

    const cellStr = String(row[0]).trim().toLowerCase();

    // Detectar inicio de nueva sección por región
    const regionMatch = regionPatterns.find(pattern => pattern.test(cellStr));
    if (regionMatch) {
      // Cerrar sección anterior
      if (currentSection) {
        currentSection.endRow = i - 1;
        sections.push(currentSection);
      }

      // Iniciar nueva sección
      currentSection = {
        name: cellStr,
        startRow: i,
        endRow: -1,
        region: normalizeRegionName(cellStr),
        age_group: extractAgeGroup(cellStr),
        gender: extractGender(cellStr)
      };
    }

    // Detectar final de sección (fila vacía o nueva región)
    if (!cellStr && currentSection) {
      currentSection.endRow = i - 1;
      sections.push(currentSection);
      currentSection = null;
    }
  }

  // Cerrar última sección
  if (currentSection) {
    currentSection.endRow = data.length - 1;
    sections.push(currentSection);
  }

  return sections;
}

/**
 * Procesa una sección específica de datos
 */
function processDataSection(
  data: any[][],
  section: any,
  periods: string[],
  headerRow: number
): Omit<LaborMarketData, "id">[] {
  const sectionData: Omit<LaborMarketData, "id">[] = [];

  for (let row = section.startRow; row <= section.endRow; row++) {
    const rowData = data[row];
    if (!rowData || !rowData[0]) continue;

    const indicatorName = String(rowData[0]).trim();
    
    // Mapear indicadores a campos de la base de datos
    const fieldMapping = getFieldMapping(indicatorName);
    if (!fieldMapping) continue;

    // Procesar cada período
    for (let col = 1; col < Math.min(rowData.length, periods.length + 1); col++) {
      const value = rowData[col];
      if (value === null || value === undefined || value === '') continue;

      const period = periods[col - 1];
      if (!period) continue;

      const date = periodToDate(period);
      if (!date) continue;

      // Buscar si ya existe un registro para esta fecha/región/demografía
      let existingRecord = sectionData.find(item => 
        item.date === date &&
        item.region === section.region &&
        item.age_group === section.age_group &&
        item.gender === section.gender
      );

      if (!existingRecord) {
        existingRecord = {
          date,
          period,
          region: section.region,
          age_group: section.age_group || null,
          gender: section.gender || null,
          total_population: null,
          economically_active_population: null,
          employed_population: null,
          unemployed_population: null,
          inactive_population: null,
          activity_rate: null,
          employment_rate: null,
          unemployment_rate: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        sectionData.push(existingRecord);
      }

      // Asignar el valor al campo correspondiente
      (existingRecord as any)[fieldMapping] = parseFloat(String(value)) || null;
    }
  }

  return sectionData;
}

/**
 * Mapea nombres de indicadores a campos de la base de datos
 */
function getFieldMapping(indicatorName: string): string | null {
  const normalizedName = indicatorName.toLowerCase();

  if (normalizedName.includes('tasa') && normalizedName.includes('actividad')) {
    return 'activity_rate';
  }
  if (normalizedName.includes('tasa') && normalizedName.includes('empleo')) {
    return 'employment_rate';
  }
  if (normalizedName.includes('tasa') && normalizedName.includes('desocupación')) {
    return 'unemployment_rate';
  }
  if (normalizedName.includes('población económicamente activa') || normalizedName.includes('pea')) {
    return 'economically_active_population';
  }
  if (normalizedName.includes('población ocupada')) {
    return 'employed_population';
  }
  if (normalizedName.includes('población desocupada')) {
    return 'unemployed_population';
  }
  if (normalizedName.includes('población inactiva')) {
    return 'inactive_population';
  }
  if (normalizedName.includes('población total')) {
    return 'total_population';
  }

  return null;
}

/**
 * Normaliza nombres de regiones
 */
function normalizeRegionName(regionStr: string): string {
  const normalized = regionStr.toLowerCase();
  
  if (normalized.includes('total') && normalized.includes('31')) {
    return 'Total 31 aglomerados';
  }
  if (normalized.includes('gba')) {
    return 'GBA';
  }
  if (normalized.includes('interior')) {
    return 'Interior';
  }
  if (normalized.includes('pampeana')) {
    return 'Región Pampeana';
  }
  if (normalized.includes('noa')) {
    return 'Región NOA';
  }
  if (normalized.includes('nea')) {
    return 'Región NEA';
  }
  if (normalized.includes('cuyo')) {
    return 'Región Cuyo';
  }
  if (normalized.includes('patagónica') || normalized.includes('patagonia')) {
    return 'Región Patagónica';
  }

  return regionStr;
}

/**
 * Extrae grupo etario del texto
 */
function extractAgeGroup(text: string): string | null {
  const normalized = text.toLowerCase();
  
  if (normalized.includes('14') && normalized.includes('29')) {
    return '14-29 años';
  }
  if (normalized.includes('30') && normalized.includes('64')) {
    return '30-64 años';
  }
  if (normalized.includes('65')) {
    return '65+ años';
  }
  
  return 'Total';
}

/**
 * Extrae género del texto
 */
function extractGender(text: string): string | null {
  const normalized = text.toLowerCase();
  
  if (normalized.includes('varones') || normalized.includes('hombres')) {
    return 'Varones';
  }
  if (normalized.includes('mujeres')) {
    return 'Mujeres';
  }
  
  return 'Total';
}

/**
 * Convierte un período trimestral a fecha (último día del trimestre)
 */
function periodToDate(period: string): string | null {
  const match = period.match(/T(\d)\s*(\d{4})/);
  if (!match) return null;

  const trimester = parseInt(match[1]);
  const year = parseInt(match[2]);

  // Último día de cada trimestre
  const trimesterEndDates = {
    1: '03-31',
    2: '06-30', 
    3: '09-30',
    4: '12-31'
  };

  const endDate = trimesterEndDates[trimester as keyof typeof trimesterEndDates];
  return `${year}-${endDate}`;
}