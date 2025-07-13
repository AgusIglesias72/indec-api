// src/services/labor-market-fetcher.ts - Fetcher híbrido completo

import * as XLSX from 'xlsx';
import axios from 'axios';
import { LaborMarketData } from '@/types/labor-market';

interface PeriodMapping {
  colIndex: number;
  year: string;
  quarter: string;
  period: string;
  date: string;
}

/**
 * Fetcher híbrido que obtiene datos de 3 dimensiones:
 * 1. Total: datos consolidados del país (de Cuadro 1.1 y regionales combinados)
 * 2. Regional: archivo informe regional (Cuadros 1.6, 1.7, 1.8) - solo regiones específicas
 * 3. Demográfico: archivo tasas/indicadores (Cuadro 1.3)
 */
export async function fetchLaborMarketData(): Promise<Omit<LaborMarketData, "id">[]> {
  try {
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();
    
    // Determinar mes de publicación más probable
    const publicationMonths = [3, 6, 9, 12];
    const currentPubMonth = publicationMonths.find(month => month <= currentMonth) || 12;
    
    console.info('🚀 Iniciando fetcher híbrido de mercado laboral...');
    console.info(`📅 Mes de publicación actual estimado: ${String(currentPubMonth).padStart(2, '0')}_${String(currentYear).slice(-2)}`);
    console.info(`🎯 Buscando archivos desde ${String(currentPubMonth).padStart(2, '0')}_${String(currentYear).slice(-2)} hacia atrás...`);
    
    const allData: Omit<LaborMarketData, "id">[] = [];
    
    // 1. DATOS NACIONALES Y DEMOGRÁFICOS (archivo 1)
    console.info('📊 Obteniendo datos nacionales y demográficos...');
    const nationalAndDemoData = await fetchNationalAndDemographicData();
    allData.push(...nationalAndDemoData);
    
    // 2. DATOS REGIONALES (archivo 2)
    console.info('🗺️ Obteniendo datos regionales...');
    const regionalData = await fetchRegionalData();
    allData.push(...regionalData);
    
    // 3. COMBINAR Y DEDUPLICAR DATOS TOTALES
    console.info('🔄 Combinando y deduplicando datos totales...');
    const combinedData = combineAndDeduplicateTotals(allData);
    
    console.info(`✅ Total de registros procesados: ${combinedData.length}`);
    
    // Filtrar registros válidos
    const validData = combinedData.filter(record => 
      record.date && 
      record.period && 
      record.region &&
      record.data_type &&
      (record.unemployment_rate !== null || record.activity_rate !== null || record.employment_rate !== null)
    );
    
    console.info(`✅ Registros válidos después del filtrado: ${validData.length}`);
    
    return validData;
    
  } catch (error) {
    console.error('❌ Error en fetchLaborMarketData:', error);
    throw error;
  }
}

/**
 * Combina y deduplica datos totales manteniendo la información más completa
 */
function combineAndDeduplicateTotals(allData: Omit<LaborMarketData, "id">[]): Omit<LaborMarketData, "id">[] {
  const totalRecords = new Map<string, Omit<LaborMarketData, "id">>();
  const otherRecords: Omit<LaborMarketData, "id">[] = [];
  
  // Separar registros totales de otros
  allData.forEach(record => {
    if (record.data_type === 'national' && 
        record.region === 'Total 31 aglomerados' && 
        record.gender === 'Total' && 
        record.age_group === 'Total' && 
        record.demographic_segment === 'Total') {
      
      const key = `${record.date}-${record.period}`;
      const existing = totalRecords.get(key);
      
      if (!existing) {
        totalRecords.set(key, { ...record });
      } else {
        // Combinar datos, priorizando valores no nulos
        const combined = { ...existing };
        
        // Combinar indicadores (mantener valores no null, priorizar el nuevo si tiene más datos)
        if (record.activity_rate !== null && record.activity_rate !== undefined) {
          combined.activity_rate = record.activity_rate;
        }
        if (record.employment_rate !== null && record.employment_rate !== undefined) {
          combined.employment_rate = record.employment_rate;
        }
        if (record.unemployment_rate !== null && record.unemployment_rate !== undefined) {
          combined.unemployment_rate = record.unemployment_rate;
        }
        
        // Combinar poblaciones si existen
        if (record.total_population !== null && record.total_population !== undefined) {
          combined.total_population = record.total_population;
        }
        if (record.economically_active_population !== null && record.economically_active_population !== undefined) {
          combined.economically_active_population = record.economically_active_population;
        }
        if (record.employed_population !== null && record.employed_population !== undefined) {
          combined.employed_population = record.employed_population;
        }
        if (record.unemployed_population !== null && record.unemployed_population !== undefined) {
          combined.unemployed_population = record.unemployed_population;
        }
        if (record.inactive_population !== null && record.inactive_population !== undefined) {
          combined.inactive_population = record.inactive_population;
        }
        
        // Priorizar source_file más específico
        if (record.source_file && record.source_file !== 'unknown') {
          combined.source_file = record.source_file;
        }
        
        totalRecords.set(key, combined);
      }
    } else {
      // No es un registro total, mantener tal como está
      otherRecords.push(record);
    }
  });
  
  console.info(`🔍 Deduplicación de totales: ${totalRecords.size} registros únicos de total consolidados`);
  
  // Combinar todos los datos
  return [
    ...Array.from(totalRecords.values()),
    ...otherRecords
  ];
}

/**
 * Genera URLs dinámicas para el archivo nacional basado en meses de publicación
 */
function generateNationalDataUrls(): string[] {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1; // getMonth() es 0-based
  
  // Meses de publicación por trimestre: marzo, junio, septiembre, diciembre
  const publicationMonths = [3, 6, 9, 12]; // 03, 06, 09, 12
  
  const urls: string[] = [];
  
  // Determinar qué trimestre estaría disponible ahora - buscar el ÚLTIMO mes <= currentMonth
  let availableMonths: Array<{month: number, year: number}> = [];
  
  // Encontrar el índice del último mes de publicación que es <= currentMonth
  let latestAvailableIndex = -1;
  for (let i = publicationMonths.length - 1; i >= 0; i--) {
    if (publicationMonths[i] <= currentMonth) {
      latestAvailableIndex = i;
      break;
    }
  }
  
  // Si no hay ningún mes disponible este año, usar diciembre del año anterior
  if (latestAvailableIndex === -1) {
    latestAvailableIndex = publicationMonths.length - 1; // Diciembre
    availableMonths.push({
      month: publicationMonths[latestAvailableIndex],
      year: currentYear - 1
    });
  } else {
    // Agregar el mes más reciente del año actual
    availableMonths.push({
      month: publicationMonths[latestAvailableIndex],
      year: currentYear
    });
  }
  
  // Generar los siguientes 5 meses hacia atrás
  let workingYear = availableMonths[0].year;
  let workingIndex = latestAvailableIndex === -1 ? publicationMonths.length - 1 : latestAvailableIndex;
  
  for (let i = 1; i < 6; i++) {
    workingIndex--;
    if (workingIndex < 0) {
      workingIndex = publicationMonths.length - 1;
      workingYear--;
    }
    
    availableMonths.push({
      month: publicationMonths[workingIndex],
      year: workingYear
    });
  }
  
  // Construir URLs
  availableMonths.forEach(({month, year}) => {
    const monthStr = String(month).padStart(2, '0');
    const yearStr = String(year).slice(-2);
    
    // URL corregida según estructura del usuario
    const url = `https://www.indec.gob.ar/ftp/cuadros/sociedad/cuadros_tasas_indicadores_eph_${monthStr}_${yearStr}.xls`;
    urls.push(url);
  });
  
  console.info(`🗓️ URLs generadas para datos nacionales: ${urls.length} opciones`);
  urls.forEach((url, index) => {
    console.info(`  ${index + 1}. ${url}`);
  });
  
  return urls;
}

/**
 * Genera URLs dinámicas para el archivo regional basado en meses de publicación  
 */
function generateRegionalDataUrls(): string[] {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;
  
  const publicationMonths = [3, 6, 9, 12];
  const urls: string[] = [];
  
  // Usar la misma lógica que en generateNationalDataUrls()
  let availableMonths: Array<{month: number, year: number}> = [];
  
  // Encontrar el índice del último mes de publicación que es <= currentMonth
  let latestAvailableIndex = -1;
  for (let i = publicationMonths.length - 1; i >= 0; i--) {
    if (publicationMonths[i] <= currentMonth) {
      latestAvailableIndex = i;
      break;
    }
  }
  
  // Si no hay ningún mes disponible este año, usar diciembre del año anterior
  if (latestAvailableIndex === -1) {
    latestAvailableIndex = publicationMonths.length - 1; // Diciembre
    availableMonths.push({
      month: publicationMonths[latestAvailableIndex],
      year: currentYear - 1
    });
  } else {
    // Agregar el mes más reciente del año actual
    availableMonths.push({
      month: publicationMonths[latestAvailableIndex],
      year: currentYear
    });
  }
  
  // Generar los siguientes 5 meses hacia atrás
  let workingYear = availableMonths[0].year;
  let workingIndex = latestAvailableIndex === -1 ? publicationMonths.length - 1 : latestAvailableIndex;
  
  for (let i = 1; i < 6; i++) {
    workingIndex--;
    if (workingIndex < 0) {
      workingIndex = publicationMonths.length - 1;
      workingYear--;
    }
    
    availableMonths.push({
      month: publicationMonths[workingIndex],
      year: workingYear
    });
  }
  
  availableMonths.forEach(({month, year}) => {
    const monthStr = String(month).padStart(2, '0');
    const yearStr = String(year).slice(-2);
    
    const url = `https://www.indec.gob.ar/ftp/cuadros/sociedad/cuadros_eph_informe_${monthStr}_${yearStr}.xls`;
    urls.push(url);
  });
  
  console.info(`🗓️ URLs generadas para datos regionales: ${urls.length} opciones`);
  urls.forEach((url, index) => {
    console.info(`  ${index + 1}. ${url}`);
  });
  
  return urls;
}

/**
 * Obtiene datos totales y demográficos del archivo de tasas/indicadores
 */
async function fetchNationalAndDemographicData(): Promise<Omit<LaborMarketData, "id">[]> {
  // Generar URLs dinámicamente basado en meses de publicación
  const nationalUrls = generateNationalDataUrls();
  const workbook = await downloadWorkbook(nationalUrls, 'tasas/indicadores');
  
  const data: Omit<LaborMarketData, "id">[] = [];
  
  // Extraer períodos del Cuadro 1.1 para datos totales
  const nationalPeriods = extractNationalPeriods(workbook);
  console.info(`📅 Períodos totales encontrados: ${nationalPeriods.length}`);
  
  // 1. DATOS TOTALES (Cuadro 1.1)
  const nationalData = extractNationalData(workbook, nationalPeriods);
  data.push(...nationalData);
  console.info(`📊 Datos totales: ${nationalData.length} registros`);
  
  // 2. DATOS DEMOGRÁFICOS (Cuadro 1.3) - usando su propia función de períodos
  const demographicData = extractDemographicData(workbook);
  data.push(...demographicData);
  console.info(`👥 Datos demográficos: ${demographicData.length} registros`);
  
  return data;
}

/**
 * Obtiene datos regionales del archivo informe EPH
 */
async function fetchRegionalData(): Promise<Omit<LaborMarketData, "id">[]> {
  // Generar URLs dinámicamente basado en meses de publicación
  const regionalUrls = generateRegionalDataUrls();
  const workbook = await downloadWorkbook(regionalUrls, 'informe regional');
  
  // Verificar cuadros necesarios
  const requiredSheets = ['Cuadro 1.6', 'Cuadro 1.7', 'Cuadro 1.8'];
  const missingSheets = requiredSheets.filter(sheet => !workbook.SheetNames.includes(sheet));
  if (missingSheets.length > 0) {
    throw new Error(`Cuadros faltantes: ${missingSheets.join(', ')}`);
  }
  
  // Extraer períodos y regiones
  const periods = extractRegionalPeriods(workbook);
  const regions = extractTargetRegions(workbook);
  console.info(`📅 Períodos regionales: ${periods.length}, 🗺️ Regiones: ${regions.length}`);
  
  const data: Omit<LaborMarketData, "id">[] = [];
  
  // Extraer datos de cada cuadro y combinar
  const activityData = extractRegionalIndicatorData(workbook, 'Cuadro 1.6', periods, regions, 'activity_rate');
  const employmentData = extractRegionalIndicatorData(workbook, 'Cuadro 1.7', periods, regions, 'employment_rate');
  const unemploymentData = extractRegionalIndicatorData(workbook, 'Cuadro 1.8', periods, regions, 'unemployment_rate');
  
  // Combinar los 3 indicadores por período y región
  const combinedData = combineRegionalIndicators(activityData, employmentData, unemploymentData);
  data.push(...combinedData);
  
  console.info(`🗺️ Datos regionales: ${data.length} registros`);
  return data;
}

/**
 * Descarga un workbook desde múltiples URLs generadas dinámicamente
 */
async function downloadWorkbook(urls: string[], description: string): Promise<XLSX.WorkBook> {
  console.info(`📥 Intentando descargar ${description} desde ${urls.length} URLs posibles...`);
  
  for (let i = 0; i < urls.length; i++) {
    const url = urls[i];
    try {
      console.info(`📥 Intento ${i + 1}/${urls.length} - Descargando ${description} desde: ${url}`);
      const response = await axios.get(url, {
        responseType: 'arraybuffer',
        timeout: 30000
      });
      
      const workbook = XLSX.read(response.data, {
        cellStyles: false,
        cellDates: true,
        sheetStubs: false
      });
      
      console.info(`✅ Descarga exitosa de ${description} desde: ${url}`);
      return workbook;
      
    } catch (error) {
      console.warn(`⚠️ Intento ${i + 1} falló para ${description} desde ${url}:`, (error as Error).message);
      
      // Si es el último intento, mostrar que seguimos con el siguiente
      if (i < urls.length - 1) {
        console.info(`🔄 Intentando con la siguiente URL...`);
      }
      continue;
    }
  }
  
  throw new Error(`❌ No se pudo descargar ${description} desde ninguna de las ${urls.length} URLs generadas`);
}

/**
 * Extrae períodos del archivo nacional (Cuadro 1.1)
 */
function extractNationalPeriods(workbook: XLSX.WorkBook): PeriodMapping[] {
  const sheet = workbook.Sheets['Cuadro 1.1'];
  if (!sheet) throw new Error('No se encontró Cuadro 1.1');
  
  const ref = sheet['!ref'];
  if (!ref) throw new Error('No se encontró el rango de la hoja (\'!ref\') en Cuadro 1.1');
  const range = XLSX.utils.decode_range(ref);
  const periods: PeriodMapping[] = [];
  
  for (let col = 3; col <= range.e.c; col++) {
    const yearCell = sheet[XLSX.utils.encode_cell({r: 3, c: col})];
    const quarterCell = sheet[XLSX.utils.encode_cell({r: 4, c: col})];
    
    const yearValue = yearCell ? (yearCell.v || yearCell.w || '') : '';
    const quarterValue = quarterCell ? (quarterCell.v || quarterCell.w || '') : '';
    
    if (quarterValue && quarterValue.toString().includes('trimestre')) {
      let year = '';
      
      if (yearValue && yearValue.toString().includes('Año')) {
        year = yearValue.toString().replace('Año ', '');
      } else {
        // Buscar año hacia atrás
        for (let prevCol = col - 1; prevCol >= 3; prevCol--) {
          const prevYearCell = sheet[XLSX.utils.encode_cell({r: 3, c: prevCol})];
          const prevYearValue = prevYearCell ? (prevYearCell.v || prevYearCell.w || '') : '';
          if (prevYearValue && prevYearValue.toString().includes('Año')) {
            year = prevYearValue.toString().replace('Año ', '');
            break;
          }
        }
      }
      
      const quarterMatch = quarterValue.toString().match(/(\d+)[°º]/);
      const quarter = quarterMatch ? quarterMatch[1] : '';
      
      if (year && quarter) {
        const monthEnd = parseInt(quarter) * 3;
        const dayEnd = monthEnd === 3 ? 31 : monthEnd === 6 ? 30 : monthEnd === 9 ? 30 : 31;
        const date = `${year}-${String(monthEnd).padStart(2, '0')}-${String(dayEnd).padStart(2, '0')}`;
        
        periods.push({
          colIndex: col,
          year,
          quarter,
          period: `T${quarter} ${year}`,
          date
        });
      }
    }
  }
  
  return periods;
}

/**
 * Extrae datos nacionales del Cuadro 1.1
 */
function extractNationalData(workbook: XLSX.WorkBook, periods: PeriodMapping[]): Omit<LaborMarketData, "id">[] {
  const sheet = workbook.Sheets['Cuadro 1.1'];
  if (!sheet) {
    console.warn('No se encontró Cuadro 1.1, saltando datos nacionales');
    return [];
  }
  
  const ref = sheet['!ref'];
  if (!ref) {
    console.warn('No se encontró el rango de la hoja (!ref) en Cuadro 1.1, saltando datos nacionales');
    return [];
  }
  
  const data: Omit<LaborMarketData, "id">[] = [];
  
  const indicators = [
    { name: 'Actividad', row: 6, field: 'activity_rate' as const },
    { name: 'Empleo', row: 7, field: 'employment_rate' as const },
    { name: 'Desocupación abierta', row: 8, field: 'unemployment_rate' as const }
  ];
  
  periods.forEach(period => {
    const record: Partial<LaborMarketData> = {
      date: period.date,
      period: period.period,
      data_type: 'national', // Cambio de 'national' a 'total'
      region: 'Total 31 aglomerados',
      gender: 'Total',
      age_group: 'Total',
      demographic_segment: 'Total',
      source_file: 'cuadros_tasas_indicadores_eph',
      // Inicializar campos numéricos
      activity_rate: null,
      employment_rate: null,
      unemployment_rate: null,
      total_population: null,
      economically_active_population: null,
      employed_population: null,
      unemployed_population: null,
      inactive_population: null
    };
    
    // Extraer valores
    indicators.forEach(indicator => {
      const cell = sheet[XLSX.utils.encode_cell({r: indicator.row, c: period.colIndex})];
      const value = cell ? (cell.v || cell.w || '') : '';
      
      if (value && !isNaN(parseFloat(value.toString()))) {
        (record as any)[indicator.field] = parseFloat(value.toString());
      }
    });
    
    data.push(record as Omit<LaborMarketData, "id">);
  });
  
  return data;
}

/**
 * Extrae períodos específicos del Cuadro 1.3 (datos demográficos)
 * El Cuadro 1.3 tiene una estructura diferente que comienza desde T1 2017
 */
function extractDemographicPeriods(workbook: XLSX.WorkBook): PeriodMapping[] {
  const sheet = workbook.Sheets['Cuadro 1.3'];
  if (!sheet) throw new Error('No se encontró Cuadro 1.3');
  
  const ref = sheet['!ref'];
  if (!ref) throw new Error('No se encontró el rango de la hoja (\'!ref\') en Cuadro 1.3');
  const range = XLSX.utils.decode_range(ref);
  const periods: PeriodMapping[] = [];
  
  // En el Cuadro 1.3, buscar en las filas 4 y 5 para los encabezados de períodos
  // Fila 4: años (ej: "2017", "2018", etc.)
  // Fila 5: trimestres (ej: "1° trimestre", "2°", "3°", "4°")
  
  let currentYear = '';
  
  for (let col = 1; col <= range.e.c; col++) { // Comenzar desde columna B (índice 1)
    // Buscar año en la fila 4 (puede estar en columnas específicas)
    const yearCell = sheet[XLSX.utils.encode_cell({r: 3, c: col})]; // Fila 4 (índice 3)
    const quarterCell = sheet[XLSX.utils.encode_cell({r: 4, c: col})]; // Fila 5 (índice 4)
    
    const yearValue = yearCell ? (yearCell.v || yearCell.w || '') : '';
    const quarterValue = quarterCell ? (quarterCell.v || quarterCell.w || '') : '';
    
    // Detectar año
    if (yearValue && yearValue.toString().match(/^\d{4}$/)) {
      currentYear = yearValue.toString();
    }
    
    // Si no hay año explícito, inferir desde 2017 (año base del Cuadro 1.3)
    if (!currentYear && col === 1) {
      currentYear = '2017';
    }
    
    // Detectar trimestre
    if (quarterValue) {
      const quarterStr = quarterValue.toString().toLowerCase();
      let quarter = '';
      
      // Mapear diferentes formatos de trimestre
      if (quarterStr.includes('1°') || quarterStr.includes('primer') || quarterStr === '1') {
        quarter = '1';
      } else if (quarterStr.includes('2°') || quarterStr.includes('segundo') || quarterStr === '2') {
        quarter = '2';
      } else if (quarterStr.includes('3°') || quarterStr.includes('tercer') || quarterStr === '3') {
        quarter = '3';
      } else if (quarterStr.includes('4°') || quarterStr.includes('cuarto') || quarterStr === '4') {
        quarter = '4';
      }
      
      if (quarter && currentYear) {
        const monthEnd = parseInt(quarter) * 3;
        const dayEnd = monthEnd === 3 ? 31 : monthEnd === 6 ? 30 : monthEnd === 9 ? 30 : 31;
        const date = `${currentYear}-${String(monthEnd).padStart(2, '0')}-${String(dayEnd).padStart(2, '0')}`;
        
        periods.push({
          colIndex: col,
          year: currentYear,
          quarter,
          period: `T${quarter} ${currentYear}`,
          date
        });
        
        // Avanzar al siguiente trimestre/año automáticamente
        const currentQuarter = parseInt(quarter);
        if (currentQuarter === 4) {
          // Si es T4, el siguiente será T1 del año siguiente
          currentYear = (parseInt(currentYear) + 1).toString();
        }
      }
    }
  }
  
  // Si no se encontraron períodos con la lógica anterior, usar un enfoque más simple
  // basado en la posición de las columnas (comenzando desde T1 2017)
  if (periods.length === 0) {
    console.warn('No se encontraron períodos en Cuadro 1.3, generando automáticamente desde T1 2017');
    
    const startYear = 2017;
    const startQuarter = 1;
    
    for (let col = 1; col <= Math.min(50, range.e.c); col++) { // Máximo 50 columnas
      // Calcular año y trimestre basado en la posición
      const totalQuarters = col - 1; // col 1 = T1 2017 (totalQuarters = 0)
      const year = startYear + Math.floor(totalQuarters / 4);
      const quarter = ((totalQuarters % 4) + startQuarter - 1) % 4 + 1;
      
      const monthEnd = quarter * 3;
      const dayEnd = monthEnd === 3 ? 31 : monthEnd === 6 ? 30 : monthEnd === 9 ? 30 : 31;
      const date = `${year}-${String(monthEnd).padStart(2, '0')}-${String(dayEnd).padStart(2, '0')}`;
      
      periods.push({
        colIndex: col,
        year: year.toString(),
        quarter: quarter.toString(),
        period: `T${quarter} ${year}`,
        date
      });
      
      // Verificar si hay datos en esta columna antes de continuar
      const testCell = sheet[XLSX.utils.encode_cell({r: 25, c: col})]; // Probar en una fila con datos
      if (!testCell || testCell.v === null || testCell.v === undefined) {
        break; // No hay más datos, terminar
      }
    }
  }
  
  console.info(`📅 Períodos demográficos encontrados: ${periods.length}`);
  if (periods.length > 0) {
    console.info(`📅 Primer período demográfico: ${periods[0].period} (${periods[0].date})`);
    console.info(`📅 Último período demográfico: ${periods[periods.length - 1].period} (${periods[periods.length - 1].date})`);
  }
  
  return periods;
}

/**
 * Extrae datos demográficos del Cuadro 1.3 usando períodos específicos del cuadro
 */
function extractDemographicData(workbook: XLSX.WorkBook): Omit<LaborMarketData, "id">[] {
  const sheet = workbook.Sheets['Cuadro 1.3'];
  if (!sheet) {
    console.warn('No se encontró Cuadro 1.3, saltando datos demográficos');
    return [];
  }
  
  const ref = sheet['!ref'];
  if (!ref) {
    console.warn('No se encontró el rango de la hoja (!ref) en Cuadro 1.3, saltando datos demográficos');
    return [];
  }
  
  // Usar períodos específicos del Cuadro 1.3
  const periods = extractDemographicPeriods(workbook);
  
  if (periods.length === 0) {
    console.warn('No se encontraron períodos válidos en Cuadro 1.3');
    return [];
  }
  
  const data: Omit<LaborMarketData, "id">[] = [];
  
  // Mapeo de segmentos demográficos (sin el total para evitar duplicados)
  const demographicSegments = [
    // Población activa general
    { row: 24, gender: 'Total', age_group: '14+ años', segment: 'Total', indicator: 'activity_rate' },
    { row: 25, gender: 'Mujeres', age_group: 'Total', segment: 'Total', indicator: 'activity_rate' },
    { row: 26, gender: 'Varones', age_group: 'Total', segment: 'Total', indicator: 'activity_rate' },
    { row: 27, gender: 'Total', age_group: 'Total', segment: 'Jefes de hogar', indicator: 'activity_rate' },
    { row: 28, gender: 'Mujeres', age_group: '14-29 años', segment: 'Total', indicator: 'activity_rate' },
    { row: 29, gender: 'Mujeres', age_group: '30-64 años', segment: 'Total', indicator: 'activity_rate' },
    { row: 30, gender: 'Varones', age_group: '14-29 años', segment: 'Total', indicator: 'activity_rate' },
    { row: 31, gender: 'Varones', age_group: '30-64 años', segment: 'Total', indicator: 'activity_rate' },
    
    // Empleo
    { row: 36, gender: 'Total', age_group: '14+ años', segment: 'Total', indicator: 'employment_rate' },
    { row: 37, gender: 'Mujeres', age_group: 'Total', segment: 'Total', indicator: 'employment_rate' },
    { row: 38, gender: 'Varones', age_group: 'Total', segment: 'Total', indicator: 'employment_rate' },
    { row: 39, gender: 'Total', age_group: 'Total', segment: 'Jefes de hogar', indicator: 'employment_rate' },
    { row: 40, gender: 'Mujeres', age_group: '14-29 años', segment: 'Total', indicator: 'employment_rate' },
    { row: 41, gender: 'Mujeres', age_group: '30-64 años', segment: 'Total', indicator: 'employment_rate' },
    { row: 42, gender: 'Varones', age_group: '14-29 años', segment: 'Total', indicator: 'employment_rate' },
    { row: 43, gender: 'Varones', age_group: '30-64 años', segment: 'Total', indicator: 'employment_rate' },
    
    // Desocupación
    { row: 48, gender: 'Total', age_group: '14+ años', segment: 'Total', indicator: 'unemployment_rate' },
    { row: 49, gender: 'Mujeres', age_group: 'Total', segment: 'Total', indicator: 'unemployment_rate' },
    { row: 50, gender: 'Varones', age_group: 'Total', segment: 'Total', indicator: 'unemployment_rate' },
    { row: 51, gender: 'Total', age_group: 'Total', segment: 'Jefes de hogar', indicator: 'unemployment_rate' },
    { row: 52, gender: 'Mujeres', age_group: '14-29 años', segment: 'Total', indicator: 'unemployment_rate' },
    { row: 53, gender: 'Mujeres', age_group: '30-64 años', segment: 'Total', indicator: 'unemployment_rate' },
    { row: 54, gender: 'Varones', age_group: '14-29 años', segment: 'Total', indicator: 'unemployment_rate' },
    { row: 55, gender: 'Varones', age_group: '30-64 años', segment: 'Total', indicator: 'unemployment_rate' }
  ];
  
  // Agrupar por combinación única de demografía
  const uniqueSegments = new Map<string, any>();
  
  demographicSegments.forEach(seg => {
    const key = `${seg.gender}-${seg.age_group}-${seg.segment}`;
    if (!uniqueSegments.has(key)) {
      uniqueSegments.set(key, {
        gender: seg.gender,
        age_group: seg.age_group,
        segment: seg.segment,
        rows: {}
      });
    }
    uniqueSegments.get(key)!.rows[seg.indicator] = seg.row;
  });
  
  // Crear registros por período y segmento
  periods.forEach(period => {
    uniqueSegments.forEach(segmentInfo => {
      const record: Partial<LaborMarketData> = {
        date: period.date,
        period: period.period,
        data_type: 'demographic',
        region: 'Total 31 aglomerados',
        gender: segmentInfo.gender,
        age_group: segmentInfo.age_group,
        demographic_segment: segmentInfo.segment,
        source_file: 'cuadros_tasas_indicadores_eph',
        activity_rate: null,
        employment_rate: null,
        unemployment_rate: null,
        total_population: null,
        economically_active_population: null,
        employed_population: null,
        unemployed_population: null,
        inactive_population: null
      };
      
      // Extraer valores para cada indicador
      Object.entries(segmentInfo.rows).forEach(([indicator, row]) => {
        const cell = sheet[XLSX.utils.encode_cell({r: row as number, c: period.colIndex})];
        const value = cell ? (cell.v || cell.w || '') : '';
        
        if (value && !isNaN(parseFloat(value.toString()))) {
          (record as any)[indicator] = parseFloat(value.toString());
        }
      });
      
      data.push(record as Omit<LaborMarketData, "id">);
    });
  });
  
  return data;
}

/**
 * Extrae períodos del archivo regional
 */
function extractRegionalPeriods(workbook: XLSX.WorkBook): PeriodMapping[] {
  const sheet = workbook.Sheets['Cuadro 1.8'];
  if (!sheet) throw new Error('No se encontró Cuadro 1.8');
  
  const ref = sheet['!ref'];
  if (!ref) throw new Error('No se encontró el rango de la hoja (\'!ref\') en Cuadro 1.8');
  const range = XLSX.utils.decode_range(ref);
  const periods: PeriodMapping[] = [];
  let currentYear = '';
  
  for (let col = 1; col <= range.e.c; col++) {
    const yearCell = sheet[XLSX.utils.encode_cell({r: 2, c: col})];
    const quarterCell = sheet[XLSX.utils.encode_cell({r: 4, c: col})];
    
    const yearValue = yearCell ? (yearCell.v || yearCell.w || '') : '';
    const quarterValue = quarterCell ? (quarterCell.v || quarterCell.w || '') : '';
    
    if (yearValue && yearValue.toString().includes('Año')) {
      currentYear = yearValue.toString().replace('Año ', '');
    }
    
    if (quarterValue && quarterValue.toString().includes('°') && currentYear) {
      const quarterMatch = quarterValue.toString().match(/(\d+)°/);
      const quarter = quarterMatch ? quarterMatch[1] : '';
      
      if (quarter && parseInt(quarter) >= 1 && parseInt(quarter) <= 4) {
        const monthEnd = parseInt(quarter) * 3;
        const dayEnd = monthEnd === 3 ? 31 : monthEnd === 6 ? 30 : monthEnd === 9 ? 30 : 31;
        const date = `${currentYear}-${String(monthEnd).padStart(2, '0')}-${String(dayEnd).padStart(2, '0')}`;
        
        periods.push({
          colIndex: col,
          year: currentYear,
          quarter,
          period: `T${quarter} ${currentYear}`,
          date
        });
      }
    }
  }
  
  return periods;
}

/**
 * Extrae regiones objetivo del archivo regional
 */
function extractTargetRegions(workbook: XLSX.WorkBook): Array<{name: string, row: number}> {
  const sheet = workbook.Sheets['Cuadro 1.8'];
  if (!sheet) throw new Error('No se encontró Cuadro 1.8');
  
  const targetRegionNames = [
    'Total 31 aglomerados urbanos',
    'Gran Buenos Aires',
    'Cuyo',
    'Noreste', 
    'Noroeste',
    'Pampeana',
    'Patagonia'
  ];
  
  const regions: Array<{name: string, row: number}> = [];
  const ref = sheet['!ref'];
  if (!ref) throw new Error('No se encontró el rango de la hoja (\'!ref\') en Cuadro 1.8');
  const range = XLSX.utils.decode_range(ref);
  
  for (let row = 6; row <= Math.min(50, range.e.r); row++) {
    const cellA = sheet[XLSX.utils.encode_cell({r: row, c: 0})];
    const valueA = cellA ? (cellA.v || cellA.w || '').toString().trim() : '';
    
    if (valueA) {
      const matchingRegion = targetRegionNames.find(target => 
        valueA.toLowerCase().includes(target.toLowerCase()) ||
        target.toLowerCase().includes(valueA.toLowerCase())
      );
      
      if (matchingRegion) {
        regions.push({
          name: normalizeRegionName(valueA),
          row: row
        });
      }
    }
  }
  
  return regions;
}

/**
 * Extrae datos de un indicador específico del archivo regional
 */
function extractRegionalIndicatorData(
  workbook: XLSX.WorkBook, 
  sheetName: string, 
  periods: PeriodMapping[], 
  regions: any[], 
  fieldName: 'activity_rate' | 'employment_rate' | 'unemployment_rate'
): Omit<LaborMarketData, "id">[] {
  const sheet = workbook.Sheets[sheetName];
  if (!sheet) {
    console.warn(`No se encontró la hoja ${sheetName}`);
    return [];
  }
  
  const ref = sheet['!ref'];
  if (!ref) {
    console.warn(`No se encontró el rango de la hoja (!ref) en ${sheetName}`);
    return [];
  }
  
  const data: Omit<LaborMarketData, "id">[] = [];
  
  regions.forEach(region => {
    periods.forEach(period => {
      const cell = sheet[XLSX.utils.encode_cell({r: region.row, c: period.colIndex})];
      const value = cell ? (cell.v || cell.w || '') : '';
      
      if (value && !isNaN(parseFloat(value.toString()))) {
        // Determinar el data_type basado en la región
        const dataType = region.name === 'Total 31 aglomerados' ? 'national' : 'regional';
        
        const record: Omit<LaborMarketData, "id"> = {
          date: period.date,
          period: period.period,
          data_type: dataType,
          region: region.name,
          gender: 'Total',
          age_group: 'Total',
          demographic_segment: 'Total',
          source_file: 'cuadros_eph_informe',
          activity_rate: null,
          employment_rate: null,
          unemployment_rate: null,
          total_population: null,
          economically_active_population: null,
          employed_population: null,
          unemployed_population: null,
          inactive_population: null,
          [fieldName]: parseFloat(value.toString())
        };
        
        data.push(record);
      }
    });
  });
  
  return data;
}

/**
 * Combina datos de los 3 indicadores regionales
 */
function combineRegionalIndicators(
  activityData: Omit<LaborMarketData, "id">[],
  employmentData: Omit<LaborMarketData, "id">[],
  unemploymentData: Omit<LaborMarketData, "id">[]
): Omit<LaborMarketData, "id">[] {
  const combinedMap = new Map<string, Omit<LaborMarketData, "id">>();
  
  // Usar actividad como base
  activityData.forEach(record => {
    const key = `${record.date}-${record.region}`;
    combinedMap.set(key, { ...record });
  });
  
  // Agregar empleo
  employmentData.forEach(record => {
    const key = `${record.date}-${record.region}`;
    const existing = combinedMap.get(key);
    if (existing) {
      existing.employment_rate = record.employment_rate;
    } else {
      combinedMap.set(key, { ...record });
    }
  });
  
  // Agregar desocupación
  unemploymentData.forEach(record => {
    const key = `${record.date}-${record.region}`;
    const existing = combinedMap.get(key);
    if (existing) {
      existing.unemployment_rate = record.unemployment_rate;
    } else {
      combinedMap.set(key, { ...record });
    }
  });
  
  return Array.from(combinedMap.values());
}

/**
 * Normaliza nombres de regiones
 */
function normalizeRegionName(regionName: string): string {
  const normalizations: Record<string, string> = {
    'Total 31 aglomerados urbanos': 'Total 31 aglomerados',
    'Gran Buenos Aires': 'GBA',
    'Cuyo': 'Región Cuyo',
    'Noreste': 'Región NEA',
    'Noroeste': 'Región NOA', 
    'Pampeana': 'Región Pampeana',
    'Patagonia': 'Región Patagónica'
  };
  
  return normalizations[regionName] || regionName;
}