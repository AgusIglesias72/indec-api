import { useMemo } from 'react';

interface CalendarEvent {
  date: string;
  day_week: string;
  indicator: string;
  period: string;
}

interface CalendarViewProps {
  events: CalendarEvent[];
}

export default function CalendarView({ events }: CalendarViewProps) {
  // Agrupar eventos por fecha
  const groupedEvents = useMemo(() => {
    const grouped: Record<string, CalendarEvent[]> = {};
    
    events.forEach(event => {
      const dateKey = event.date;
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(event);
    });
    
    return grouped;
  }, [events]);
  
  // Ordenar las fechas
  const sortedDates = useMemo(() => {
    return Object.keys(groupedEvents).sort();
  }, [groupedEvents]);
  
  // Función para formatear la fecha
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const day = date.getDate();
    const month = date.toLocaleString('es', { month: 'long' });
    const year = date.getFullYear();
    
    return `${day} ${month} ${year}`;
  };
  
  if (sortedDates.length === 0) {
    return <div className="text-center py-12 min-h-[400px] flex items-center justify-center">No hay eventos para este mes</div>;
  }
  
  return (
    <div className="relative w-full lg:w-1/2 mx-auto px-2 min-h-[400px]">
      {/* Línea vertical */}
      <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-gray-200 transform -translate-x-1/2"></div>
      
      <div className="space-y-8">
        {sortedDates.map((dateKey, index) => {
          const formattedDate = formatDate(dateKey);
          const dateEvents = groupedEvents[dateKey];
          const day_week = dateEvents[0].day_week; // Tomamos el día de la semana del primer evento
          const isEven = index % 2 === 0;
          
          return (
            <div key={dateKey} className="relative">
              {/* Punto en la línea de tiempo */}
              <div className="absolute left-1/2 top-6 w-4 h-4 bg-gray-300 rounded-full transform -translate-x-1/2 z-10"></div>
              
              <div className="grid grid-cols-2 gap-8">
                {isEven ? (
                  <>
                    {/* Contenido a la derecha */}
                    <div className="col-start-1 col-end-2 text-right pr-8">
                      <div className="pt-4">
                        <p className="text-gray-600 italic">{day_week}</p>
                        <p className="font-semibold mb-4">{formattedDate}</p>
                        
                        <div className="space-y-3">
                          {dateEvents.map((event, idx) => (
                            <div key={idx} className="text-right">
                              <p className="font-medium text-blue-800">{event.indicator}</p>
                              <p className="text-sm text-gray-600">{event.period}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                    
                    {/* Espacio vacío a la izquierda */}
                    <div className="col-start-2 col-end-3"></div>
                  </>
                ) : (
                  <>
                    {/* Espacio vacío a la derecha */}
                    <div className="col-start-1 col-end-2"></div>
                    
                    {/* Contenido a la izquierda */}
                    <div className="col-start-2 col-end-3 pl-8">
                      <div className="pt-4">
                        <p className="text-gray-600 italic">{day_week}</p>
                        <p className="font-semibold mb-4">{formattedDate}</p>
                        
                        <div className="space-y-3">
                          {dateEvents.map((event, idx) => (
                            <div key={idx} className="text-left">
                              <p className="font-medium text-blue-800">{event.indicator}</p>
                              <p className="text-sm text-gray-600">{event.period}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}