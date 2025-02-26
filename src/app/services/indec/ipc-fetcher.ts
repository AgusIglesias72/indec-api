import axios from "axios";
import * as XLSX from "xlsx";
import { IpcRow, IpcInsert } from "../../../types";

/**
 * Genera un código a partir del nombre de un componente
 * @param name Nombre del componente
 * @returns Código simplificado (solo letras y números, sin espacios, en mayúsculas)
 */
function generateCodeFromName(name: string): string {
  // Remover acentos y caracteres especiales
  const normalized = name.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

  // Convertir a mayúsculas, reemplazar espacios y caracteres especiales con guiones bajos
  // y luego eliminar cualquier carácter que no sea letra, número o guion bajo
  const code = normalized
    .toUpperCase()
    .replace(/\s+/g, "_")
    .replace(/[^A-Z0-9_]/g, "")
    .replace(/_+/g, "_"); // Reemplazar múltiples guiones bajos con uno solo

  // Tomar solo la primera palabra si es muy largo
  if (code.length > 20) {
    const parts = code.split("_");
    if (parts.length > 1) {
      // Usar la primera palabra o las primeras letras de cada palabra
      if (parts[0].length >= 8) {
        return parts[0]; // Primera palabra si es suficientemente distintiva
      } else {
        // Tomar las primeras letras de cada palabra
        return parts.map((part) => part.substring(0, 3)).join("_");
      }
    }
    return code.substring(0, 20); // Truncar si sigue siendo muy largo
  }

  return code;
} // src/app/services/indec/ipc-fetcher.ts

/**
 * Extrae una fecha en formato ISO (YYYY-MM-DD) de un valor que puede estar en varios formatos
 * @param value Valor del que extraer la fecha (puede ser número, string, o fecha)
 * @returns Fecha en formato ISO o null si no se pudo extraer
 */
function extractDateFromValue(value: any): string | null {
  // Caso 1: Es un objeto Date
  if (value instanceof Date) {
    return `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(
      2,
      "0"
    )}-01`;
  }

  // Caso 2: Es un número (posiblemente número de serie de Excel)
  if (typeof value === "number") {
    try {
      // Intentar convertir número a fecha según el formato de Excel
      const dateObj = XLSX.SSF.parse_date_code(value);
      if (dateObj && dateObj.y && dateObj.m) {
        return `${dateObj.y}-${String(dateObj.m).padStart(2, "0")}-01`;
      }

      // Si no funciona, podría ser una fecha en formato timestamp
      if (value > 10000) {
        // Evitar confundir con otros números pequeños
        const date = new Date(value);
        if (!isNaN(date.getTime())) {
          return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
            2,
            "0"
          )}-01`;
        }
      }
    } catch (e) {
      console.warn(
        `No se pudo convertir el valor numérico ${value} a fecha:`,
        e
      );
    }
    return null;
  }

  // Caso 3: Es una cadena de texto
  if (typeof value === "string") {
    const dateStr = value.trim();

    // Intentar varios formatos comunes

    // Formato YYYY-MM o YYYY-MM-DD
    if (dateStr.match(/^\d{4}-\d{2}(?:-\d{2})?$/)) {
      // Si ya tiene formato YYYY-MM, añadir día
      if (dateStr.length === 7) {
        return `${dateStr}-01`;
      }
      // Si ya es YYYY-MM-DD, devolver directamente
      return dateStr;
    }

    // Formato MM/YYYY o MM/YY
    if (dateStr.includes("/")) {
      const parts = dateStr.split("/");
      if (parts.length === 2) {
        // Asumimos que el primer número es el mes y el segundo el año
        const month = parts[0].padStart(2, "0");
        let year = parts[1];

        // Si el año tiene 2 dígitos, asumir 2000+
        if (year.length === 2) {
          year = `20${year}`;
        }

        return `${year}-${month}-01`;
      }
    }

    // Formato DD/MM/YYYY o DD-MM-YYYY
    const ddmmyyyyRegex = /^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/;
    const ddmmyyyyMatch = dateStr.match(ddmmyyyyRegex);
    if (ddmmyyyyMatch) {
      const day = ddmmyyyyMatch[1].padStart(2, "0");
      const month = ddmmyyyyMatch[2].padStart(2, "0");
      const year = ddmmyyyyMatch[3];
      return `${year}-${month}-01`; // Usamos siempre día 1 para consistencia
    }

    // Formato MM.YYYY o MM.YY
    if (dateStr.includes(".")) {
      const parts = dateStr.split(".");
      if (parts.length === 2) {
        const month = parts[0].padStart(2, "0");
        let year = parts[1];

        // Si el año tiene 2 dígitos, asumir 2000+
        if (year.length === 2) {
          year = `20${year}`;
        }

        return `${year}-${month}-01`;
      }
    }

    // Si tiene nombre del mes, intentar parsearlo
    const monthNames = [
      "enero",
      "febrero",
      "marzo",
      "abril",
      "mayo",
      "junio",
      "julio",
      "agosto",
      "septiembre",
      "octubre",
      "noviembre",
      "diciembre",
      "ene",
      "feb",
      "mar",
      "abr",
      "may",
      "jun",
      "jul",
      "ago",
      "sep",
      "oct",
      "nov",
      "dic",
    ];

    const lowerDateStr = dateStr.toLowerCase();
    let foundMonth = -1;
    let foundYear = null;

    // Buscar nombre de mes
    for (let i = 0; i < monthNames.length; i++) {
      if (lowerDateStr.includes(monthNames[i])) {
        // Calcular el índice del mes (0-11)
        foundMonth = i % 12;
        break;
      }
    }

    // Buscar año en el texto
    const yearMatch = lowerDateStr.match(/\b(20\d{2})\b/);
    if (yearMatch) {
      foundYear = yearMatch[1];
    }

    if (foundMonth !== -1 && foundYear) {
      return `${foundYear}-${String(foundMonth + 1).padStart(2, "0")}-01`;
    }

    // Último intento: usar Date.parse
    try {
      const parsedDate = new Date(dateStr);
      if (!isNaN(parsedDate.getTime())) {
        return `${parsedDate.getFullYear()}-${String(
          parsedDate.getMonth() + 1
        ).padStart(2, "0")}-01`;
      }
    } catch (e) {
      // Ignorar errores de parseo
    }
  }

  // No se pudo extraer una fecha válida
  return null;
}

/**
 * Obtiene los datos del IPC desde el archivo Excel del INDEC
 * @returns Array de datos del IPC procesados
 */
export async function fetchIPCData(): Promise<Omit<IpcRow, "id">[]> {
  try {
    // Obtener el mes y año actual para construir la URL
    const now = new Date();
    const month = String(now.getMonth() + 1).padStart(2, "0");

    // URL del archivo Excel del INDEC
    const url = `https://www.indec.gob.ar/ftp/cuadros/economia/sh_ipc_${month}_25.xls`;

    console.log(`Descargando Excel del IPC desde: ${url}`);

    // Descargar archivo
    let response;
    try {
      response = await axios.get(url, {
        responseType: "arraybuffer",
      });
    } catch (error) {
      console.warn(
        `Error descargando el archivo del mes actual. Intentando con el mes anterior...`
      );
      // Si falla, intentar con el mes anterior (común al inicio de un nuevo mes)
      const prevMonth = String(((now.getMonth() + 11) % 12) + 1).padStart(
        2,
        "0"
      );
      const prevUrl = `https://www.indec.gob.ar/ftp/cuadros/economia/sh_ipc_${prevMonth}_25.xls`;
      response = await axios.get(prevUrl, {
        responseType: "arraybuffer",
      });
    }

    // Procesar el archivo Excel
    console.log("Archivo descargado, procesando Excel del IPC...");
    const workbook = XLSX.read(response.data, {
      type: "buffer",
      cellDates: true,
    });

    console.log("Hojas disponibles en el Excel:", workbook.SheetNames);

    // Encontrar la hoja "Índices IPC Cobertura Nacional"
    const targetSheetName = workbook.SheetNames.find(
      (name) =>
        name.includes("ndices IPC Cobertura Nacional") ||
        name.includes("Indices IPC Cobertura Nacional")
    );

    if (!targetSheetName) {
      throw new Error(
        'No se encontró la hoja "Índices IPC Cobertura Nacional" en el Excel'
      );
    }

    const worksheet = workbook.Sheets[targetSheetName];

    // Convertir a matriz para procesamiento
    const data = XLSX.utils.sheet_to_json(worksheet, {
      header: 1,
      defval: null,
      blankrows: false,
    }) as any[][];

    console.log(`Filas totales en el Excel del IPC: ${data.length}`);

    // Procesar los datos
    const processedData: Omit<IpcRow, "id">[] = [];

    // Definir los nombres de las regiones que buscamos
    const regionNames = [
      "Total nacional",
      "Región GBA",
      "Región Pampeana",
      "Región Noroeste",
      "Región Noreste",
      "Región Cuyo",
      "Región Patagonia",
    ];

    // Mapeo de nombres completos a nombres cortos para la base de datos
    const regionNameMapping: Record<string, string> = {
      "Total nacional": "Nacional",
      "Región GBA": "GBA",
      "Región Pampeana": "Pampeana",
      "Región Noroeste": "Noroeste",
      "Región Noreste": "Noreste",
      "Región Cuyo": "Cuyo",
      "Región Patagonia": "Patagonia",
    };

    // Definir los nombres de los rubros que esperamos encontrar
    const expectedRubros = [
      "Alimentos y bebidas no alcohólicas",
      "Bebidas alcohólicas y tabaco",
      "Prendas de vestir y calzado",
      "Vivienda, agua, electricidad, gas y otros combustibles",
      "Equipamiento y mantenimiento del hogar",
      "Salud",
      "Transporte",
      "Comunicación",
      "Recreación y cultura",
      "Educación",
      "Restaurantes y hoteles",
      "Bienes y servicios varios",
    ];

    // Definir los nombres de las categorías que esperamos encontrar
    const expectedCategorias = ["Estacional", "Núcleo", "Regulados"];

    // Definir los nombres de bienes y servicios que esperamos encontrar
    const expectedBienesPlusServicios = ["Bienes", "Servicios"];

    // Identificar las regiones buscando sus nombres específicos
    const regions: Array<{
      name: string;
      shortName: string;
      startRow: number;
    }> = [];

    for (let i = 0; i < data.length; i++) {
      if (data[i] && data[i][0]) {
        const cellValue = String(data[i][0]).trim();

        // Verificar si este valor coincide con alguno de nuestros nombres de región
        const regionIdx = regionNames.findIndex(
          (name) =>
            cellValue === name ||
            cellValue.includes(name) ||
            name.includes(cellValue)
        );

        if (regionIdx !== -1) {
          // Es una región - verificar que la fila tiene algún valor en la columna B (no importa si es fecha o número)
          if (data[i][1] !== null && data[i][1] !== undefined) {
            const regionName = regionNames[regionIdx];
            const shortName = regionNameMapping[regionName] || regionName;

            regions.push({
              name: regionName,
              shortName: shortName,
              startRow: i,
            });

            console.log(`Región encontrada: ${regionName} (fila ${i + 1})`);

            // Imprimir información sobre lo que hay en las columnas para depuración
            console.log(
              `  - Valor en columna B: ${data[i][1]}, tipo: ${typeof data[
                i
              ][1]}`
            );
            if (data[i][2] !== null && data[i][2] !== undefined) {
              console.log(
                `  - Valor en columna C: ${data[i][2]}, tipo: ${typeof data[
                  i
                ][2]}`
              );
            }
          }
        }
      }
    }

    console.log("Regiones identificadas:", regions.length);
    regions.forEach((region) => {
      console.log(
        `- ${region.name} (${region.shortName}): fila ${region.startRow + 1}`
      );
    });

    if (regions.length === 0) {
      // Si no encontramos regiones, vamos a imprimir algunos valores para depuración
      console.log(
        "No se encontraron regiones. Mostrando primeras filas para depuración:"
      );
      for (let i = 0; i < Math.min(20, data.length); i++) {
        console.log(`Fila ${i + 1}:`, data[i] ? data[i].slice(0, 3) : null);
      }
      throw new Error(
        "No se pudieron identificar regiones en el Excel del IPC"
      );
    }

    // Procesar las fechas del encabezado (tomar del primer bloque de región)
    const headerRow = data[regions[0].startRow];
    const dates: string[] = [];

    console.log(
      "Intentando extraer fechas de la fila:",
      regions[0].startRow + 1
    );
    console.log("Contenido de headerRow:", headerRow);

    // Buscar el primer valor para entender mejor el formato
    for (let i = 1; i < headerRow.length; i++) {
      if (headerRow[i] !== null && headerRow[i] !== undefined) {
        console.log(
          `Valor en columna ${i + 1} (índice ${i}):`,
          headerRow[i],
          "tipo:",
          typeof headerRow[i]
        );

        // Si encontramos 5 elementos, es suficiente para depuración
        if (i >= 5) break;
      }
    }

    // Intentar dos estrategias: procesar encabezados y buscar en filas siguientes
    // Estrategia 1: Procesar directamente de la fila de encabezado
    for (let i = 1; i < headerRow.length; i++) {
      if (headerRow[i] !== null && headerRow[i] !== undefined) {
        // Intentar obtener una fecha de este valor
        let date = extractDateFromValue(headerRow[i]);

        if (date) {
          dates.push(date);
        }
      }
    }

    // Si no encontramos fechas, intentar buscar en la siguiente fila (a veces las fechas están una fila más abajo)
    if (dates.length === 0 && regions[0].startRow + 1 < data.length) {
      console.log(
        "No se encontraron fechas en la fila de encabezado. Intentando con la siguiente fila."
      );
      const nextRow = data[regions[0].startRow + 1];

      if (nextRow) {
        console.log("Contenido de la siguiente fila:", nextRow);

        for (let i = 1; i < nextRow.length; i++) {
          if (nextRow[i] !== null && nextRow[i] !== undefined) {
            let date = extractDateFromValue(nextRow[i]);

            if (date) {
              dates.push(date);
            }
          }
        }
      }
    }

    // Última alternativa: generar fechas manualmente basadas en la cantidad de columnas
    if (dates.length === 0) {
      console.log(
        "No se encontraron fechas en las primeras filas. Intentando generar fechas automáticamente."
      );

      // Contar columnas con datos y generar fechas
      const columnCount =
        headerRow.filter((x) => x !== null && x !== undefined).length - 1; // -1 por la columna A

      if (columnCount > 0) {
        // Generar fechas de los últimos 'columnCount' meses desde hoy
        const today = new Date();
        const currentYear = today.getFullYear();
        const currentMonth = today.getMonth(); // 0-11

        for (let i = 0; i < columnCount; i++) {
          // Calcular año y mes (retrocediendo desde el actual)
          let targetMonth = currentMonth - i;
          let targetYear = currentYear;

          // Ajustar para meses negativos
          while (targetMonth < 0) {
            targetMonth += 12;
            targetYear -= 1;
          }

          // Crear fecha ISO
          const date = `${targetYear}-${String(targetMonth + 1).padStart(
            2,
            "0"
          )}-01`;
          dates.unshift(date); // Añadir al inicio para mantener orden cronológico
        }
      }
    }

    console.log(`Fechas encontradas: ${dates.length}`);
    if (dates.length > 0) {
      console.log("Primera fecha:", dates[0]);
      console.log("Última fecha:", dates[dates.length - 1]);
      console.log("Todas las fechas:", dates);
    } else {
      throw new Error("No se pudieron identificar fechas en el encabezado");
    }

    // Procesar cada región
    for (const region of regions) {
      console.log(`Procesando región: ${region.name}`);

      // Buscar "Nivel general" después del encabezado de la región
      let foundNivelGeneral = false;
      let nivelGeneralRow = -1;

      // Buscar hasta 10 filas después del encabezado de la región
      for (
        let i = region.startRow + 1;
        i < region.startRow + 10 && i < data.length;
        i++
      ) {
        if (data[i] && data[i][0] === "Nivel general") {
          nivelGeneralRow = i;
          foundNivelGeneral = true;
          break;
        }
      }

      if (!foundNivelGeneral) {
        console.warn(
          `No se encontró "Nivel general" para la región ${region.name}`
        );
        continue; // Pasar a la siguiente región
      }

      // Procesar Nivel general
      for (let j = 0; j < dates.length; j++) {
        const colIndex = j + 1; // Las fechas comienzan en la columna B (índice 1)

        if (
          colIndex < data[nivelGeneralRow].length &&
          data[nivelGeneralRow][colIndex] !== null &&
          data[nivelGeneralRow][colIndex] !== undefined
        ) {
          let value =
            typeof data[nivelGeneralRow][colIndex] === "number"
              ? data[nivelGeneralRow][colIndex]
              : typeof data[nivelGeneralRow][colIndex] === "string" &&
                !isNaN(parseFloat(data[nivelGeneralRow][colIndex]))
              ? parseFloat(data[nivelGeneralRow][colIndex])
              : null;

          if (value !== null) {
            processedData.push({
              date: dates[j],
              component: "Nivel general",
              component_code: "GENERAL",
              component_type: "GENERAL",
              index_value: value,
              created_at: new Date().toISOString(),
              region: region.shortName,
            });
          }
        }
      }

      // Procesar Rubros (se espera que estén en las filas siguientes a Nivel general)
      let currentRow = nivelGeneralRow + 1;
      let rubroCount = 0;

      // Buscar hasta 15 filas para encontrar todos los rubros (debería haber 12)
      for (let i = 0; i < 15 && currentRow + i < data.length; i++) {
        const rubroRow = currentRow + i;

        if (!data[rubroRow] || !data[rubroRow][0]) continue;

        const cellValue = String(data[rubroRow][0]).trim();

        // Verificar si coincide con alguno de los rubros esperados
        const matchedRubroIndex = expectedRubros.findIndex(
          (rubro) =>
            cellValue === rubro ||
            cellValue.includes(rubro) ||
            rubro.includes(cellValue)
        );

        if (matchedRubroIndex !== -1) {
          const rubro = expectedRubros[matchedRubroIndex];
          rubroCount++;

          // Crear un código más descriptivo basado en el nombre del rubro
          const componentCode = `RUBRO_${generateCodeFromName(rubro)}`;

          // Procesar valores para cada fecha
          for (let j = 0; j < dates.length; j++) {
            const colIndex = j + 1;

            if (
              colIndex < data[rubroRow].length &&
              data[rubroRow][colIndex] !== null &&
              data[rubroRow][colIndex] !== undefined
            ) {
              let value =
                typeof data[rubroRow][colIndex] === "number"
                  ? data[rubroRow][colIndex]
                  : typeof data[rubroRow][colIndex] === "string" &&
                    !isNaN(parseFloat(data[rubroRow][colIndex]))
                  ? parseFloat(data[rubroRow][colIndex])
                  : null;

              if (value !== null) {
                processedData.push({
                  date: dates[j],
                  component: rubro,
                  component_code: componentCode,
                  component_type: "RUBRO",
                  index_value: value,
                  created_at: new Date().toISOString(),
                  region: region.shortName,
                });
              }
            }
          }
        } else if (cellValue === "Categorías") {
          // Encontramos la fila de "Categorías"
          break;
        }
      }

      console.log(
        `Procesados ${rubroCount} rubros para la región ${region.name}`
      );

      // Buscar la sección de "Categorías"
      let categoriasHeaderRow = -1;

      // Buscar hasta 15 filas después del último rubro
      for (
        let i = nivelGeneralRow + rubroCount + 1;
        i < nivelGeneralRow + rubroCount + 15 && i < data.length;
        i++
      ) {
        if (data[i] && data[i][0]) {
          const cellValue = String(data[i][0]).trim().toLowerCase();
          if (cellValue === "categorías" || cellValue.includes("categorias")) {
            categoriasHeaderRow = i;
            console.log(
              `Fila de categorías encontrada en índice ${i}: ${data[i][0]}`
            );
            break;
          }
        }
      }

      if (categoriasHeaderRow !== -1) {
        // Procesar las categorías
        let categoriaCount = 0;

        // Verificar hasta 7 filas después del encabezado de categorías (ampliamos el rango)
        for (
          let i = 0;
          i < 7 && categoriasHeaderRow + 1 + i < data.length;
          i++
        ) {
          const categoriaRow = categoriasHeaderRow + 1 + i;

          if (!data[categoriaRow] || !data[categoriaRow][0]) continue;

          const cellValue = String(data[categoriaRow][0]).trim();

          // Log para depuración
          console.log(
            `Valor de celda en fila de categoría ${i}: "${cellValue}"`
          );

          // Verificar si coincide con alguna de las categorías esperadas
          const matchedCategoriaIndex = expectedCategorias.findIndex((cat) => {
            const matchCondition =
              cellValue.toLowerCase() === cat.toLowerCase() ||
              cellValue.toLowerCase().includes(cat.toLowerCase()) ||
              cat.toLowerCase().includes(cellValue.toLowerCase());

            if (matchCondition) {
              console.log(`Categoría coincidente encontrada: ${cat}`);
            }

            return matchCondition;
          });

          if (matchedCategoriaIndex !== -1) {
            const categoria = expectedCategorias[matchedCategoriaIndex];
            categoriaCount++;
            console.log(`Procesando categoría: ${categoria}`);

            // Procesar valores para cada fecha
            for (let j = 0; j < dates.length; j++) {
              const colIndex = j + 1;

              if (
                colIndex < data[categoriaRow].length &&
                data[categoriaRow][colIndex] !== null &&
                data[categoriaRow][colIndex] !== undefined
              ) {
                let value =
                  typeof data[categoriaRow][colIndex] === "number"
                    ? data[categoriaRow][colIndex]
                    : typeof data[categoriaRow][colIndex] === "string" &&
                      !isNaN(parseFloat(data[categoriaRow][colIndex]))
                    ? parseFloat(data[categoriaRow][colIndex])
                    : null;

                if (value !== null) {
                  console.log(
                    `Añadiendo dato de categoría: ${categoria}, valor: ${value}, fecha: ${dates[j]}`
                  );
                  processedData.push({
                    date: dates[j],
                    component: categoria,
                    component_code: `CAT_${generateCodeFromName(categoria)}`,
                    component_type: "CATEGORIA",
                    index_value: value,
                    created_at: new Date().toISOString(),
                    region: region.shortName,
                  });
                }
              }
            }
          } else if (cellValue === "Bienes y servicios") {
            // Encontramos la fila de "Bienes y servicios"
            break;
          }
        }

        console.log(
          `Procesadas ${categoriaCount} categorías para la región ${region.name}`
        );

        // Si no se procesó ninguna categoría, imprimir información de depuración
        if (categoriaCount === 0) {
          console.warn(
            `Advertencia: No se procesaron categorías para la región ${region.name}`
          );
          console.warn("Filas revisadas:");
          for (
            let i = 0;
            i < 7 && categoriasHeaderRow + 1 + i < data.length;
            i++
          ) {
            const categoriaRow = categoriasHeaderRow + 1 + i;
            console.warn(
              `Fila ${i}: ${
                data[categoriaRow] ? data[categoriaRow][0] : "vacía"
              }`
            );
          }
        }
      }

      // Buscar la sección de "Bienes y servicios"
      let bienesYServiciosHeaderRow = -1;

      // Buscar hasta 10 filas después de la última categoría o del último rubro
      const startSearchRow =
        categoriasHeaderRow !== -1
          ? categoriasHeaderRow + 5
          : nivelGeneralRow + rubroCount + 5;

      for (
        let i = startSearchRow;
        i < startSearchRow + 10 && i < data.length;
        i++
      ) {
        if (
          data[i] &&
          (data[i][0] === "Bienes y servicios" ||
            (typeof data[i][0] === "string" &&
              data[i][0].includes("Bienes y servicios")))
        ) {
          bienesYServiciosHeaderRow = i;
          break;
        }
      }

      if (bienesYServiciosHeaderRow !== -1) {
        // Procesar "Bienes" y "Servicios"
        let bysCount = 0;

        // Verificar hasta 3 filas después del encabezado de bienes y servicios
        for (
          let i = 0;
          i < 3 && bienesYServiciosHeaderRow + 1 + i < data.length;
          i++
        ) {
          const bysRow = bienesYServiciosHeaderRow + 1 + i;

          if (!data[bysRow] || !data[bysRow][0]) continue;

          const cellValue = String(data[bysRow][0]).trim();

          // Verificar si coincide con "Bienes" o "Servicios"
          const matchedBYSIndex = expectedBienesPlusServicios.findIndex(
            (item) =>
              cellValue === item ||
              cellValue.includes(item) ||
              item.includes(cellValue)
          );

          if (matchedBYSIndex !== -1) {
            const bysComponent = expectedBienesPlusServicios[matchedBYSIndex];
            bysCount++;

            // Procesar valores para cada fecha
            for (let j = 0; j < dates.length; j++) {
              const colIndex = j + 1;

              if (
                colIndex < data[bysRow].length &&
                data[bysRow][colIndex] !== null &&
                data[bysRow][colIndex] !== undefined
              ) {
                let value =
                  typeof data[bysRow][colIndex] === "number"
                    ? data[bysRow][colIndex]
                    : typeof data[bysRow][colIndex] === "string" &&
                      !isNaN(parseFloat(data[bysRow][colIndex]))
                    ? parseFloat(data[bysRow][colIndex])
                    : null;

                if (value !== null) {
                  processedData.push({
                    date: dates[j],
                    component: bysComponent,
                    component_code: `BYS_${bysComponent.toUpperCase()}`,
                    component_type: "BYS",
                    index_value: value,
                    created_at: new Date().toISOString(),
                    region: region.shortName,
                  });
                }
              }
            }
          }
        }

        console.log(
          `Procesados ${bysCount} componentes de bienes y servicios para la región ${region.name}`
        );
      }
    }

    console.log(
      `Datos IPC procesados: ${processedData.length} registros totales`
    );
    console.log(
      `Regiones procesadas: ${[
        ...new Set(processedData.map((item) => item.region)),
      ].join(", ")}`
    );

    if (processedData.length === 0) {
      throw new Error("No se pudieron obtener datos del IPC");
    }

    return processedData;
  } catch (error) {
    console.error("Error al obtener datos del IPC:", error);
    throw new Error(
      `Error al obtener datos del IPC: ${(error as Error).message}`
    );
  }
}
