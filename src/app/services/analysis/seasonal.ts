import { EconomicTimeSeriesPoint, SeasonalAdjustmentOptions } from '../../../types';

/**
 * Servicio para desestacionalizar series temporales
 */
export async function desestacionalizar(
  data: { date: string; value: number }[],
  options: SeasonalAdjustmentOptions = { method: 'moving-average' }
): Promise<EconomicTimeSeriesPoint[]> {
  if (!data || data.length === 0) {
    return [];
  }

  // Ordenar por fecha
  const sortedData = [...data].sort((a, b) => 
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  // Extraer valores
  const values = sortedData.map(d => d.value);

  // Aplicar el método seleccionado
  switch (options.method) {
    case 'moving-average':
      return applyMovingAverage(sortedData, values, options.windowSize || 12);
    case 'ratio-to-moving-average':
      return applyRatioToMovingAverage(sortedData, values, options.windowSize || 12);
    case 'x13-arima-seats':
      // En un caso real, aquí se llamaría a una implementación de X13-ARIMA-SEATS
      // Para este ejemplo, usamos un método más simple
      return applyMovingAverage(sortedData, values, options.windowSize || 12);
    default:
      return sortedData.map(d => ({
        date: d.date,
        value: d.value,
        original_value: d.value,
        is_seasonally_adjusted: false
      }));
  }
}

/**
 * Aplica un promedio móvil centrado a la serie
 */
function applyMovingAverage(
  data: { date: string; value: number }[],
  values: number[],
  window: number
): EconomicTimeSeriesPoint[] {
  const result: EconomicTimeSeriesPoint[] = [];
  const halfWindow = Math.floor(window / 2);

  for (let i = 0; i < data.length; i++) {
    let sum = 0;
    let count = 0;

    // Calcular promedio centrado
    for (let j = Math.max(0, i - halfWindow); j <= Math.min(values.length - 1, i + halfWindow); j++) {
      sum += values[j];
      count++;
    }

    const adjustedValue = count > 0 ? sum / count : values[i];
    
    result.push({
      date: data[i].date,
      value: parseFloat(adjustedValue.toFixed(1)),
      original_value: values[i],
      is_seasonally_adjusted: true
    });
  }

  return result;
}

/**
 * Aplica el método ratio-to-moving-average para desestacionalización
 * Este es un enfoque clásico para extraer factores estacionales
 */
function applyRatioToMovingAverage(
  data: { date: string; value: number }[],
  values: number[],
  window: number
): EconomicTimeSeriesPoint[] {
  const result: EconomicTimeSeriesPoint[] = [];
  const halfWindow = Math.floor(window / 2);
  
  // Paso 1: Calcular promedios móviles centrados
  const movingAverages: number[] = [];
  
  for (let i = 0; i < values.length; i++) {
    if (i < halfWindow || i >= values.length - halfWindow) {
      // No podemos calcular un promedio centrado completo
      movingAverages.push(NaN);
      continue;
    }
    
    let sum = 0;
    for (let j = i - halfWindow; j <= i + halfWindow; j++) {
      sum += values[j];
    }
    movingAverages.push(sum / window);
  }
  
  // Paso 2: Calcular ratios
  const ratios: number[] = [];
  for (let i = 0; i < values.length; i++) {
    if (isNaN(movingAverages[i]) || movingAverages[i] === 0) {
      ratios.push(NaN);
    } else {
      ratios.push(values[i] / movingAverages[i]);
    }
  }
  
  // Paso 3: Calcular factores estacionales
  // Agrupamos ratios por mes/trimestre y calculamos promedios
  const seasonalFactors: Record<number, number[]> = {};
  const getMonth = (dateStr: string) => new Date(dateStr).getMonth();
  
  for (let i = 0; i < data.length; i++) {
    if (isNaN(ratios[i])) continue;
    
    const month = getMonth(data[i].date);
    if (!seasonalFactors[month]) {
      seasonalFactors[month] = [];
    }
    seasonalFactors[month].push(ratios[i]);
  }
  
  // Calcular promedios por mes
  const avgSeasonalFactors: Record<number, number> = {};
  for (const month in seasonalFactors) {
    const factors = seasonalFactors[month];
    avgSeasonalFactors[month] = factors.reduce((sum, val) => sum + val, 0) / factors.length;
  }
  
  // Normalizar factores estacionales para que sumen 12 (o 4 para datos trimestrales)
  const factorSum = Object.values(avgSeasonalFactors).reduce((sum, val) => sum + val, 0);
  for (const month in avgSeasonalFactors) {
    avgSeasonalFactors[month] = (avgSeasonalFactors[month] * window) / factorSum;
  }
  
  // Paso 4: Aplicar desestacionalización
  for (let i = 0; i < data.length; i++) {
    const month = getMonth(data[i].date);
    const seasonalFactor = avgSeasonalFactors[month] || 1;
    const adjustedValue = values[i] / seasonalFactor;
    
    result.push({
      date: data[i].date,
      value: parseFloat(adjustedValue.toFixed(1)),
      original_value: values[i],
      is_seasonally_adjusted: true,
      cycle_trend_value: movingAverages[i] || undefined
    });
  }
  
  return result;
}

/**
 * Calcula la tendencia-ciclo usando el filtro Hodrick-Prescott
 */
export function calculateTrendCycle(values: number[], lambda = 1600): number[] {
  // Implementación del filtro Hodrick-Prescott
  const n = values.length;
  if (n <= 2) return [...values];
  
  // Creamos matrices para el sistema lineal
  const y = values;
  const I = Array(n).fill(0).map((_, i) => Array(n).fill(0).map((_, j) => i === j ? 1 : 0));
  
  // Matriz de diferencias de segundo orden
  const D = Array(n-2).fill(0).map((_, i) => {
    const row = Array(n).fill(0);
    row[i] = 1;
    row[i+1] = -2;
    row[i+2] = 1;
    return row;
  });
  
  // Calculamos D'D
  const DTD = Array(n).fill(0).map(() => Array(n).fill(0));
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      for (let k = 0; k < n-2; k++) {
        DTD[i][j] += (D[k][i] || 0) * (D[k][j] || 0);
      }
    }
  }
  
  // Calculamos (I + λD'D)
  const A = I.map((row, i) => row.map((val, j) => val + lambda * DTD[i][j]));
  
  // Resolver el sistema Ax = y usando un método iterativo simple
  // Para un proyecto real, se debería usar una biblioteca de álgebra lineal
  const x = Array(n).fill(0);
  const iterations = 100;
  
  for (let iter = 0; iter < iterations; iter++) {
    for (let i = 0; i < n; i++) {
      let sum = 0;
      for (let j = 0; j < n; j++) {
        if (j !== i) {
          sum += A[i][j] * x[j];
        }
      }
      x[i] = (y[i] - sum) / A[i][i];
    }
  }
  
  return x.map(v => parseFloat(v.toFixed(1)));
}