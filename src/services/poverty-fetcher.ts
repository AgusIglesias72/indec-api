// src/services/poverty-fetcher.ts - Fetcher específico para archivos de pobreza INDEC

import * as XLSX from 'xlsx';
import axios from 'axios';
import { PovertyData, PeriodMapping } from '@/types/poverty';

interface SemesterMapping {
  colIndex: number;
  year: string;
  semester: string;
  period: string;
  date: string;
}

/**
 * Fetcher específico para datos de pobreza e indigencia del INDEC
 * Procesa los cuadros 1, 2.1, 2.2, 4.3 y 4.4 del archivo oficial
 */
export async function fetchPovertyData(): Promise<Omit<PovertyData, "id">[]> {
  try {
    console.info('🚀 Iniciando fetcher de datos de pobreza INDEC...');
    
    const allData: Omit<PovertyData, "id">[] = [];
    
    // Generar URLs para descargar el archivo más reciente
    const urls = generatePovertyUrls();
    const workbook = await downloadWorkbook(urls);
    
    // Procesar cada cuadro
    console.info('📊 Procesando Cuadro 1 (tasas principales)...');
    const cuadro1Data = await processCuadro1(workbook);
    allData.push(...cuadro1Data);
    
    console.info('📊 Procesando Cuadro 2.1 (brecha de indigencia)...');
    const cuadro21Data = await processCuadro21(workbook);
    allData.push(...cuadro21Data);
    
    console.info('📊 Procesando Cuadro 2.2 (brecha de pobreza)...');
    const cuadro22Data = await processCuadro22(workbook);
    allData.push(...cuadro22Data);
    
    console.info('📊 Procesando Cuadro 4.3 (pobreza por regiones)...');
    const cuadro43Data = await processCuadro43(workbook);
    allData.push(...cuadro43Data);
    
    console.info('📊 Procesando Cuadro 4.4 (indigencia por regiones)...');
    const cuadro44Data = await processCuadro44(workbook);
    allData.push(...cuadro44Data);
    
    console.info(`✅ Total de registros procesados: ${allData.length}`);
    
    // Filtrar registros válidos
    const validData = allData.filter(record => 
      record.date && 
      record.period && 
      record.region &&
      record.data_type
    );
    
    console.info(`✅ Registros válidos después del filtrado: ${validData.length}`);
    
    return validData;
    
  } catch (error) {
    console.error('❌ Error en fetchPovertyData:', error);
    throw error;
  }
}

/**
 * Genera URLs para descargar archivos de pobreza
 */
function generatePovertyUrls(): string[] {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;
  
  const urls: string[] = [];
  
  // Los archivos se publican en marzo (datos S2 año anterior) y septiembre (datos S1 año actual)
  // Patrón: cuadros_informe_pobreza_MM_YY.xls
  
  const publications: Array<{month: number, year: number}> = [];
  
  // Si estamos después de septiembre, debería estar S1 del año actual
  if (currentMonth >= 9) {
    publications.push({month: 9, year: currentYear}); // Sept = S1 currentYear
  }
  
  // Si estamos después de marzo, debería estar S2 del año anterior
  if (currentMonth >= 3) {
    publications.push({month: 3, year: currentYear}); // Marzo = S2 (currentYear-1)
  }
  
  // Agregar publicaciones anteriores (últimos 4 años)
  for (let i = 0; i < 8; i++) {
    const pubYear = currentYear - Math.floor(i / 2);
    const isFirstHalf = i % 2 === 0;
    const month = isFirstHalf ? 9 : 3;
    
    if (pubYear < currentYear || (pubYear === currentYear && month < currentMonth)) {
      publications.push({month, year: pubYear});
    }
  }
  
  // Construir URLs
  publications.forEach(({month, year}) => {
    const monthStr = String(month).padStart(2, '0');
    const yearStr = String(year).slice(-2);
    
    urls.push(`http://www.indec.gob.ar/ftp/cuadros/sociedad/cuadros_informe_pobreza_${monthStr}_${yearStr}.xls`);
  });
  
  console.info(`🗓️ URLs generadas: ${urls.length} opciones`);
  urls.forEach((url, index) => {
    console.info(`  ${index + 1}. ${url}`);
  });
  
  return urls;
}

/**
 * Descarga workbook desde URLs
 */
async function downloadWorkbook(urls: string[]): Promise<XLSX.WorkBook> {
  console.info(`📥 Intentando descargar archivo de pobreza desde ${urls.length} URLs...`);
  
  for (let i = 0; i < urls.length; i++) {
    const url = urls[i];
    try {
      console.info(`📥 Intento ${i + 1}/${urls.length}: ${url}`);
      
      const response = await axios.get(url, {
        responseType: 'arraybuffer',
        timeout: 30000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });
      
      const workbook = XLSX.read(response.data, {
        cellStyles: false,
        cellDates: true,
        sheetStubs: false
      });
      
      console.info(`✅ Descarga exitosa desde: ${url}`);
      console.info(`📋 Hojas encontradas: ${workbook.SheetNames.join(', ')}`);
      
      return workbook;
      
    } catch (error) {
      console.warn(`⚠️ Intento ${i + 1} falló:`, (error as Error).message);
      if (i < urls.length - 1) {
        console.info(`🔄 Intentando siguiente URL...`);
      }
    }
  }
  
  throw new Error(`❌ No se pudo descargar desde ninguna URL`);
}

/**
 * Procesa Cuadro 1: Tasas de pobreza e indigencia
 */
async function processCuadro1(workbook: XLSX.WorkBook): Promise<Omit<PovertyData, "id">[]> {
  const sheetName = 'Cuadro 1';
  const sheet = workbook.Sheets[sheetName];
  
  if (!sheet) {
    console.warn(`❌ No se encontró ${sheetName}`);
    return [];
  }
  
  const data: Omit<PovertyData, "id">[] = [];
  
  // Extraer períodos de las columnas (desde B en adelante)
  const periods = extractSemesterPeriods(sheet);
  console.info(`📅 Períodos encontrados en Cuadro 1: ${periods.length}`);
  
  if (periods.length === 0) {
    console.warn('❌ No se encontraron períodos en Cuadro 1');
    return [];
  }
  
  // Mapeo de indicadores según las filas del Cuadro 1 (estructura real)
  const indicators = [
    { row: 5, field: 'poverty_rate_households', label: 'Pobreza - Hogares' },
    { row: 6, field: 'poverty_rate_persons', label: 'Pobreza - Personas' },
    { row: 9, field: 'indigence_rate_households', label: 'Indigencia - Hogares' },
    { row: 10, field: 'indigence_rate_persons', label: 'Indigencia - Personas' }
  ];
  
  // Extraer datos para cada período
  periods.forEach(period => {
    const baseRecord: Partial<PovertyData> = {
      date: period.date,
      period: period.period,
      semester: parseInt(period.semester),
      year: parseInt(period.year),
      data_type: 'national',
      region: 'Total 31 aglomerados',
      cuadro_source: 'Cuadro 1',
      source_file: 'cuadros_informe_pobreza',
      // Inicializar todos los campos
      poverty_rate_persons: null,
      poverty_rate_households: null,
      indigence_rate_persons: null,
      indigence_rate_households: null,
      indigence_gap: null,
      poverty_gap: null,
      indigence_severity: null,
      poverty_severity: null,
      variable_name: null,
      variable_value: null
    };
    
    // Extraer valores de indicadores
    indicators.forEach(indicator => {
      const cell = sheet[XLSX.utils.encode_cell({r: indicator.row, c: period.colIndex})];
      const value = cell ? (cell.v || cell.w || '') : '';
      
      if (value && !isNaN(parseFloat(value.toString()))) {
        (baseRecord as any)[indicator.field] = parseFloat(value.toString());
      }
    });
    
    data.push(baseRecord as Omit<PovertyData, "id">);
  });
  
  console.info(`✅ Cuadro 1: ${data.length} registros procesados`);
  return data;
}

/**
 * Procesa Cuadro 2.1: Brecha de indigencia
 */
async function processCuadro21(workbook: XLSX.WorkBook): Promise<Omit<PovertyData, "id">[]> {
  return processCuadro2x(workbook, 'Cuadro 2.1', 'indigence');
}

/**
 * Procesa Cuadro 2.2: Brecha de pobreza
 */
async function processCuadro22(workbook: XLSX.WorkBook): Promise<Omit<PovertyData, "id">[]> {
  return processCuadro2x(workbook, 'Cuadro 2.2', 'poverty');
}

/**
 * Función genérica para procesar Cuadros 2.1 y 2.2
 */
async function processCuadro2x(workbook: XLSX.WorkBook, sheetName: string, type: 'indigence' | 'poverty'): Promise<Omit<PovertyData, "id">[]> {
  const sheet = workbook.Sheets[sheetName];
  
  if (!sheet) {
    console.warn(`❌ No se encontró ${sheetName}`);
    return [];
  }
  
  const data: Omit<PovertyData, "id">[] = [];
  
  // Extraer períodos
  const periods = extractSemesterPeriods(sheet);
  console.info(`📅 Períodos encontrados en ${sheetName}: ${periods.length}`);
  
  if (periods.length === 0) {
    console.warn(`❌ No se encontraron períodos en ${sheetName}`);
    return [];
  }
  
  // Procesar indicadores principales (filas 4-6 aproximadamente)
  const mainIndicators = [
    { row: 4, field: type === 'indigence' ? 'indigence_gap' : 'poverty_gap', label: 'Brecha' },
    { row: 5, field: type === 'indigence' ? 'indigence_severity' : 'poverty_severity', label: 'Severidad' }
  ];
  
  periods.forEach(period => {
    mainIndicators.forEach(indicator => {
      const baseRecord: Partial<PovertyData> = {
        date: period.date,
        period: period.period,
        semester: parseInt(period.semester),
        year: parseInt(period.year),
        data_type: 'national',
        region: 'Total 31 aglomerados',
        cuadro_source: sheetName,
        source_file: 'cuadros_informe_pobreza',
        poverty_rate_persons: null,
        poverty_rate_households: null,
        indigence_rate_persons: null,
        indigence_rate_households: null,
        indigence_gap: null,
        poverty_gap: null,
        indigence_severity: null,
        poverty_severity: null,
        variable_name: indicator.label,
        variable_value: null
      };
      
      const cell = sheet[XLSX.utils.encode_cell({r: indicator.row, c: period.colIndex})];
      const value = cell ? (cell.v || cell.w || '') : '';
      
      if (value && !isNaN(parseFloat(value.toString()))) {
        (baseRecord as any)[indicator.field] = parseFloat(value.toString());
        baseRecord.variable_value = parseFloat(value.toString());
      }
      
      data.push(baseRecord as Omit<PovertyData, "id">);
    });
  });
  
  // Procesar variables adicionales desde fila 18
  const additionalVars = extractAdditionalVariables(sheet, periods, sheetName, 18);
  data.push(...additionalVars);
  
  console.info(`✅ ${sheetName}: ${data.length} registros procesados`);
  return data;
}

/**
 * Procesa Cuadro 4.3: Pobreza por regiones
 */
async function processCuadro43(workbook: XLSX.WorkBook): Promise<Omit<PovertyData, "id">[]> {
  return processCuadro4x(workbook, 'Cuadro 4.3', 'poverty');
}

/**
 * Procesa Cuadro 4.4: Indigencia por regiones
 */
async function processCuadro44(workbook: XLSX.WorkBook): Promise<Omit<PovertyData, "id">[]> {
  return processCuadro4x(workbook, 'Cuadro 4.4', 'indigence');
}

/**
 * Función genérica para procesar Cuadros 4.3 y 4.4 (datos regionales)
 */
async function processCuadro4x(workbook: XLSX.WorkBook, sheetName: string, type: 'poverty' | 'indigence'): Promise<Omit<PovertyData, "id">[]> {
  const sheet = workbook.Sheets[sheetName];
  
  if (!sheet) {
    console.warn(`❌ No se encontró ${sheetName}`);
    return [];
  }
  
  const ref = sheet['!ref'];
  if (!ref) {
    console.warn(`❌ No se encontró el rango de ${sheetName}`);
    return [];
  }
  
  const range = XLSX.utils.decode_range(ref);
  const data: Omit<PovertyData, "id">[] = [];
  
  // Buscar regiones objetivo
  const targetRegions = ['Gran Buenos Aires', 'Cuyo', 'Noreste', 'Noroeste', 'Pampeana', 'Patagonia'];
  const regions = findRegionalRows(sheet, targetRegions);
  
  console.info(`🗺️ Regiones encontradas en ${sheetName}: ${regions.length}`);
  
  // Extraer períodos y sus columnas correspondientes desde la fila 2
  const periodColumns: Array<{period: SemesterMapping, householdsCol: number, personsCol: number}> = [];
  
  // Buscar períodos en fila 2
  for (let col = 1; col <= range.e.c; col++) {
    const periodCell = sheet[XLSX.utils.encode_cell({r: 2, c: col})];
    const periodValue = periodCell ? (periodCell.v || periodCell.w || '').toString() : '';
    
    const semesterMatch = periodValue.match(/([12])\s*semestre\s*(\d{4})/i);
    
    if (semesterMatch) {
      const semester = semesterMatch[1];
      const year = semesterMatch[2];
      
      // Buscar columnas de Hogares y Personas para este período
      // Típicamente Hogares está en la misma columna del período y Personas 2 columnas después
      let householdsCol = col;
      let personsCol = col + 2;
      
      // Verificar en fila 3 las etiquetas
      const householdsLabelCell = sheet[XLSX.utils.encode_cell({r: 3, c: householdsCol})];
      const personsLabelCell = sheet[XLSX.utils.encode_cell({r: 3, c: personsCol})];
      
      const householdsLabel = householdsLabelCell ? (householdsLabelCell.v || householdsLabelCell.w || '').toString().toLowerCase() : '';
      const personsLabel = personsLabelCell ? (personsLabelCell.v || personsLabelCell.w || '').toString().toLowerCase() : '';
      
      // Si no encontramos las etiquetas esperadas, buscar en columnas cercanas
      if (!householdsLabel.includes('hogar')) {
        // Buscar en columnas adyacentes
        for (let offset = -1; offset <= 3; offset++) {
          const testCell = sheet[XLSX.utils.encode_cell({r: 3, c: col + offset})];
          const testValue = testCell ? (testCell.v || testCell.w || '').toString().toLowerCase() : '';
          if (testValue.includes('hogar')) {
            householdsCol = col + offset;
            break;
          }
        }
      }
      
      if (!personsLabel.includes('persona')) {
        // Buscar en columnas adyacentes
        for (let offset = 1; offset <= 4; offset++) {
          const testCell = sheet[XLSX.utils.encode_cell({r: 3, c: col + offset})];
          const testValue = testCell ? (testCell.v || testCell.w || '').toString().toLowerCase() : '';
          if (testValue.includes('persona')) {
            personsCol = col + offset;
            break;
          }
        }
      }
      
      const monthEnd = semester === '1' ? 6 : 12;
      const dayEnd = monthEnd === 6 ? 30 : 31;
      const date = `${year}-${String(monthEnd).padStart(2, '0')}-${String(dayEnd).padStart(2, '0')}`;
      
      periodColumns.push({
        period: {
          colIndex: col,
          year: year,
          semester: semester,
          period: `S${semester} ${year}`,
          date: date
        },
        householdsCol: householdsCol,
        personsCol: personsCol
      });
    }
  }
  
  console.info(`📅 Períodos con columnas mapeadas: ${periodColumns.length}`);
  
  // Extraer datos para cada región y período
  regions.forEach(region => {
    periodColumns.forEach(({period, householdsCol, personsCol}) => {
      // Obtener valores
      const householdsCell = sheet[XLSX.utils.encode_cell({r: region.row, c: householdsCol})];
      const personsCell = sheet[XLSX.utils.encode_cell({r: region.row, c: personsCol})];
      
      let householdsValue = householdsCell ? (householdsCell.v || householdsCell.w || '').toString() : '';
      let personsValue = personsCell ? (personsCell.v || personsCell.w || '').toString() : '';
      
      // Limpiar valores (remover comas decimales y convertir)
      householdsValue = householdsValue.replace(',', '.');
      personsValue = personsValue.replace(',', '.');
      
      const householdsNum = householdsValue ? parseFloat(householdsValue) : null;
      const personsNum = personsValue ? parseFloat(personsValue) : null;
      
      if ((householdsNum !== null && !isNaN(householdsNum)) || 
          (personsNum !== null && !isNaN(personsNum))) {
        const record: Partial<PovertyData> = {
          date: period.date,
          period: period.period,
          semester: parseInt(period.semester),
          year: parseInt(period.year),
          data_type: 'regional',
          region: region.name,
          cuadro_source: sheetName,
          source_file: 'cuadros_informe_pobreza',
          poverty_rate_persons: null,
          poverty_rate_households: null,
          indigence_rate_persons: null,
          indigence_rate_households: null,
          indigence_gap: null,
          poverty_gap: null,
          indigence_severity: null,
          poverty_severity: null,
          variable_name: null,
          variable_value: null
        };
        
        // Asignar valores según el tipo
        if (type === 'poverty') {
          record.poverty_rate_households = householdsNum;
          record.poverty_rate_persons = personsNum;
        } else {
          record.indigence_rate_households = householdsNum;
          record.indigence_rate_persons = personsNum;
        }
        
        data.push(record as Omit<PovertyData, "id">);
      }
    });
  });
  
  console.info(`✅ ${sheetName}: ${data.length} registros procesados`);
  return data;
}

/**
 * Extrae períodos semestrales de una hoja
 */
function extractSemesterPeriods(sheet: XLSX.WorkSheet): SemesterMapping[] {
  const ref = sheet['!ref'];
  if (!ref) return [];
  
  const range = XLSX.utils.decode_range(ref);
  const periods: SemesterMapping[] = [];
  
  // Los períodos están en la fila 2 (índice 2) según el archivo real
  for (let col = 1; col <= range.e.c; col++) {
    const cell = sheet[XLSX.utils.encode_cell({r: 2, c: col})];
    const value = cell ? (cell.v || cell.w || '').toString() : '';
    
    // Buscar patrones como "2do. semestre 2016", "1er. semestre 2017", "1er semestre 2020", etc.
    const semesterMatch = value.match(/([12])[°erdot]*\.?\s*semestre\s*(\d{4})/i);
    
    if (semesterMatch) {
      const semester = semesterMatch[1];
      const year = semesterMatch[2];
      
      const monthEnd = semester === '1' ? 6 : 12;
      const dayEnd = monthEnd === 6 ? 30 : 31;
      const date = `${year}-${String(monthEnd).padStart(2, '0')}-${String(dayEnd).padStart(2, '0')}`;
      
      periods.push({
        colIndex: col,
        year: year,
        semester: semester,
        period: `S${semester} ${year}`,
        date: date
      });
    }
  }
  
  // Eliminar duplicados y ordenar por fecha
  const uniquePeriods = periods.filter((period, index, self) =>
    index === self.findIndex(p => p.period === period.period)
  );
  
  return uniquePeriods.sort((a, b) => a.date.localeCompare(b.date));
}

/**
 * Busca filas de regiones específicas
 */
function findRegionalRows(sheet: XLSX.WorkSheet, targetRegions: string[]): Array<{name: string, row: number}> {
  const ref = sheet['!ref'];
  if (!ref) return [];
  
  const range = XLSX.utils.decode_range(ref);
  const regions: Array<{name: string, row: number}> = [];
  
  // Buscar en la columna A (índice 0)
  for (let row = 0; row <= range.e.r; row++) {
    const cell = sheet[XLSX.utils.encode_cell({r: row, c: 0})];
    const value = cell ? (cell.v || cell.w || '').toString().trim() : '';
    
    if (value) {
      // Buscar coincidencias con regiones objetivo
      const matchingRegion = targetRegions.find(target => {
        const cleanValue = value.replace(/\(\d+\)/, '').trim(); // Remover "(2)" etc.
        return cleanValue.toLowerCase().includes(target.toLowerCase()) ||
               target.toLowerCase().includes(cleanValue.toLowerCase());
      });
      
      if (matchingRegion) {
        regions.push({
          name: matchingRegion,
          row: row
        });
      }
    }
  }
  
  return regions;
}

/**
 * Extrae variables adicionales desde una fila específica
 */
function extractAdditionalVariables(
  sheet: XLSX.WorkSheet, 
  periods: SemesterMapping[], 
  cuadroSource: string, 
  startRow: number
): Omit<PovertyData, "id">[] {
  const ref = sheet['!ref'];
  if (!ref) return [];
  
  const range = XLSX.utils.decode_range(ref);
  const data: Omit<PovertyData, "id">[] = [];
  
  // Buscar variables desde startRow hasta el final
  for (let row = startRow; row <= range.e.r; row++) {
    const labelCell = sheet[XLSX.utils.encode_cell({r: row, c: 0})];
    const label = labelCell ? (labelCell.v || labelCell.w || '').toString().trim() : '';
    
    if (label && label.length > 2) { // Variables con nombre significativo
      periods.forEach(period => {
        const cell = sheet[XLSX.utils.encode_cell({r: row, c: period.colIndex})];
        const value = cell ? (cell.v || cell.w || '') : '';
        
        if (value && !isNaN(parseFloat(value.toString()))) {
          const record: Partial<PovertyData> = {
            date: period.date,
            period: period.period,
            semester: parseInt(period.semester),
            year: parseInt(period.year),
            data_type: 'national',
            region: 'Total 31 aglomerados',
            cuadro_source: cuadroSource,
            source_file: 'cuadros_informe_pobreza',
            poverty_rate_persons: null,
            poverty_rate_households: null,
            indigence_rate_persons: null,
            indigence_rate_households: null,
            indigence_gap: null,
            poverty_gap: null,
            indigence_severity: null,
            poverty_severity: null,
            variable_name: label,
            variable_value: parseFloat(value.toString())
          };
          
          data.push(record as Omit<PovertyData, "id">);
        }
      });
    }
  }
  
  return data;
}