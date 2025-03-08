import React, { useState } from 'react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend,
  ReferenceLine,
  Cell
} from 'recharts';
import { Download, Filter, ArrowUpDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

// Datos simulados para desarrollo
const mockData = [
  { sector_name: 'Agricultura, ganadería, caza y silvicultura', sector_code: 'A', year_over_year_change: 4.5 },
  { sector_name: 'Pesca', sector_code: 'B', year_over_year_change: -2.3 },
  { sector_name: 'Explotación de minas y canteras', sector_code: 'C', year_over_year_change: 6.2 },
  { sector_name: 'Industria manufacturera', sector_code: 'D', year_over_year_change: -1.5 },
  { sector_name: 'Electricidad, gas y agua', sector_code: 'E', year_over_year_change: 3.8 },
  { sector_name: 'Construcción', sector_code: 'F', year_over_year_change: -4.7 },
  { sector_name: 'Comercio', sector_code: 'G', year_over_year_change: 2.5 },
  { sector_name: 'Hoteles y restaurantes', sector_code: 'H', year_over_year_change: 8.9 },
  { sector_name: 'Transporte y comunicaciones', sector_code: 'I', year_over_year_change: 1.2 },
  { sector_name: 'Intermediación financiera', sector_code: 'J', year_over_year_change: -3.1 },
  { sector_name: 'Actividades inmobiliarias y empresariales', sector_code: 'K', year_over_year_change: 5.8 },
  { sector_name: 'Administración pública', sector_code: 'L', year_over_year_change: 0.9 },
  { sector_name: 'Enseñanza', sector_code: 'M', year_over_year_change: 2.1 },
  { sector_name: 'Servicios sociales y de salud', sector_code: 'N', year_over_year_change: 3.5 },
  { sector_name: 'Servicios comunitarios', sector_code: 'O', year_over_year_change: -1.8 },
];

export default function SectorActivityChart({ data = mockData, loading = false, error = null }) {
  const [sortOrder, setSortOrder] = useState('value'); // 'value' o 'alphabetical'
  const [showCount, setShowCount] = useState('all'); // 'all', '10', '5'

  // Función para ordenar los datos
  const getSortedData = () => {
    let sortedData = [...data];
    if (sortOrder === 'value') {
      sortedData.sort((a, b) => b.year_over_year_change - a.year_over_year_change);
    } else {
      sortedData.sort((a, b) => a.sector_name.localeCompare(b.sector_name));
    }

    // Limitar la cantidad de sectores mostrados
    if (showCount === '5') {
      return sortedData.slice(0, 5);
    } else if (showCount === '10') {
      return sortedData.slice(0, 10);
    }
    return sortedData;
  };

  const chartData = getSortedData();

  // Tooltip personalizado
  const CustomTooltip = ({ active, payload }: { active: boolean, payload: any }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-md shadow-md">
          <p className="font-medium">{data.sector_name}</p>
          <p className="text-sm flex items-center gap-1">
            <span>Var. interanual:</span>
            <span className={`font-mono font-medium ${data.year_over_year_change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {`${data.year_over_year_change >= 0 ? '+' : ''}${data.year_over_year_change.toFixed(1)}%`}
            </span>
          </p>
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Variación interanual por sector</CardTitle>
          <CardDescription>Cargando datos de sectores económicos...</CardDescription>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-96 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Variación interanual por sector</CardTitle>
          <CardDescription>Error al cargar los datos</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center items-center h-96 bg-gray-50 rounded-md border border-gray-200">
            <p className="text-gray-500">No se pudieron cargar los datos. Por favor, intenta nuevamente.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Variación interanual por sector</CardTitle>
            <CardDescription>Comparativa del desempeño sectorial respecto al mismo período del año anterior</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between items-center mb-6 gap-4 flex-wrap">
          <div className="flex gap-4 flex-wrap">
            <div>
              <Select value={sortOrder} onValueChange={setSortOrder}>
                <SelectTrigger className="w-36">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Ordenar por" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="value">Ordenar por valor</SelectItem>
                  <SelectItem value="alphabetical">Ordenar por nombre</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Select value={showCount} onValueChange={setShowCount}>
                <SelectTrigger className="w-36">
                  <ArrowUpDown className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Mostrar" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los sectores</SelectItem>
                  <SelectItem value="10">Top 10 sectores</SelectItem>
                  <SelectItem value="5">Top 5 sectores</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button variant="outline" size="sm" className="flex items-center">
            <Download className="h-4 w-4 mr-2" />
            Exportar datos
          </Button>
        </div>

        <div className="h-96">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              layout="vertical"
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
              <XAxis
                type="number"
                domain={['dataMin - 1', 'dataMax + 1']}
                tickFormatter={(value) => `${value}%`}
              />
              <YAxis 
                dataKey="sector_name" 
                type="category" 
                tick={{ fontSize: 12 }}
                width={170}
              />
              <Tooltip content={<CustomTooltip active={true} payload={[]} />} />
              <Legend />
              <ReferenceLine x={0} stroke="#000" />
              <Bar dataKey="year_over_year_change" name="Variación interanual (%)">
                {chartData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.year_over_year_change >= 0 ? '#10893E' : '#D10A10'} 
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        
        <div className="mt-4 text-xs text-gray-500 text-right">
          Fuente: Instituto Nacional de Estadística y Censos (INDEC)
        </div>
      </CardContent>
    </Card>
  );
}