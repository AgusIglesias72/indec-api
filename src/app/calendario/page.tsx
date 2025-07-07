'use client';

import { useState, useEffect } from 'react';
import { Calendar, Clock, FileText, TrendingUp, BarChart3, Users, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import CalendarView from '@/components/CalendarView';
import { CalendarEvent } from '@/types/calendar';

// Componente Hero Section modernizado
function HeroSection({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="relative bg-gradient-to-br from-teal-50 to-teal-100 py-16 mb-8">
      <div className="container mx-auto px-4 text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="h-12 w-12 bg-teal-500 rounded-xl flex items-center justify-center">
              <Calendar className="h-6 w-6 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">{title}</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">{subtitle}</p>
        </motion.div>
      </div>
    </div>
  );
}

// Componente Month Selector modernizado
const MONTHS = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

interface ModernMonthSelectorProps {
  currentDate: Date;
  onPrevious: () => void;
  onNext: () => void;
}

function ModernMonthSelector({ currentDate, onPrevious, onNext }: ModernMonthSelectorProps) {
  const month = MONTHS[currentDate.getMonth()];
  const year = currentDate.getFullYear();
  
  return (
    <motion.div 
      className="group relative"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Gradient background effect */}
      <div className="absolute -inset-1 bg-gradient-to-r from-teal-600/20 to-teal-400/20 rounded-2xl blur opacity-50 group-hover:opacity-75 transition duration-500"></div>
      
      {/* Main selector */}
      <div className="relative bg-white rounded-2xl p-6 shadow-lg border border-teal-100 flex items-center justify-center gap-6">
        <motion.button 
          onClick={onPrevious}
          className="h-12 w-12 bg-teal-100 rounded-xl flex items-center justify-center text-teal-600 hover:bg-teal-200 transition-colors"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          aria-label="Mes anterior"
        >
          <ChevronLeft className="h-6 w-6" />
        </motion.button>
        
        <motion.div 
          className="text-center"
          key={`${month}-${year}`}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <h2 className="text-2xl font-bold text-gray-900">{month} {year}</h2>
          <p className="text-sm text-gray-600 mt-1">Publicaciones programadas</p>
        </motion.div>
        
        <motion.button 
          onClick={onNext}
          className="h-12 w-12 bg-teal-100 rounded-xl flex items-center justify-center text-teal-600 hover:bg-teal-200 transition-colors"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          aria-label="Mes siguiente"
        >
          <ChevronRight className="h-6 w-6" />
        </motion.button>
      </div>
    </motion.div>
  );
}

// Componente para los headers de sección
function SectionHeader({ title, icon: Icon }: { title: string; icon: any }) {
  return (
    <div className="flex items-center gap-3 mb-6">
      <div className="h-8 w-8 bg-teal-100 rounded-lg flex items-center justify-center">
        <Icon className="h-4 w-4 text-teal-600" />
      </div>
      <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
    </div>
  );
}

// Componente de información sobre el calendario INDEC
function CalendarInfo() {
  const calendarInfo = [
    {
      category: "Indicadores Principales",
      items: [
        {
          name: "Índice de Precios al Consumidor (IPC)",
          description: "Publicación mensual que mide la evolución de los precios de bienes y servicios consumidos por los hogares. Se publica generalmente en la segunda quincena del mes siguiente.",
          icon: TrendingUp,
          frequency: "Mensual"
        },
        {
          name: "Estimador Mensual de Actividad Económica (EMAE)", 
          description: "Indicador que anticipa la evolución del PIB trimestral, reflejando la actividad económica mensual de todos los sectores productivos.",
          icon: BarChart3,
          frequency: "Mensual"
        },
        {
          name: "Encuesta Permanente de Hogares (EPH)",
          description: "Relevamiento continuo que mide las características sociodemográficas y socioeconómicas de la población, especialmente del mercado de trabajo.",
          icon: Users,
          frequency: "Trimestral"
        },
        {
          name: "Cuentas Nacionales",
          description: "Sistema integrado que describe la estructura y evolución de los principales agregados económicos del país, incluyendo el PIB trimestral.",
          icon: FileText,
          frequency: "Trimestral"
        }
      ]
    },
    {
      category: "Información del Calendario",
      items: [
        {
          name: "Programación oficial",
          description: "Todas las fechas están basadas en el calendario oficial de difusión del INDEC, sujeto a modificaciones según la disponibilidad de los datos.",
          icon: Calendar,
          frequency: "Actualización continua"
        },
        {
          name: "Horarios de publicación",
          description: "Las publicaciones se realizan generalmente a las 16:00 horas (GMT-3) en días hábiles, salvo indicación contraria.",
          icon: Clock,
          frequency: "16:00 hs"
        }
      ]
    }
  ];

  return (
    <div className="mb-16">
      <SectionHeader title="Información sobre las publicaciones del INDEC" icon={FileText} />
      
      <div className="grid md:grid-cols-2 gap-8">
        {calendarInfo.map((section, sectionIndex) => (
          <motion.div
            key={section.category}
            initial={{ opacity: 0, x: sectionIndex === 0 ? -20 : 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="group relative"
          >
            <div className="absolute -inset-1 bg-gradient-to-r from-teal-600/10 to-teal-400/10 rounded-2xl blur opacity-30 group-hover:opacity-50 transition duration-300"></div>
            <div className="relative bg-white rounded-2xl p-6 shadow-md border border-teal-100">
              <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <div className="h-6 w-6 bg-teal-100 rounded-lg flex items-center justify-center">
                  <Calendar className="h-3 w-3 text-teal-600" />
                </div>
                {section.category}
              </h3>
              
              <div className="space-y-6">
                {section.items.map((item, itemIndex) => (
                  <div key={itemIndex} className="border-l-4 border-teal-200 pl-4">
                    <div className="flex items-start gap-3 mb-2">
                      <div className="h-6 w-6 bg-teal-50 rounded-lg flex items-center justify-center mt-0.5">
                        <item.icon className="h-3 w-3 text-teal-600" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900">{item.name}</h4>
                        <span className="text-xs text-teal-600 font-medium bg-teal-50 px-2 py-1 rounded-lg inline-block mt-1">
                          {item.frequency}
                        </span>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 leading-relaxed ml-9">{item.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// Componente de loading modernizado
function ModernLoadingState() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col items-center justify-center py-20"
    >
      <div className="relative">
        <div className="h-16 w-16 border-4 border-teal-200 rounded-full"></div>
        <div className="absolute top-0 left-0 h-16 w-16 border-4 border-teal-500 rounded-full border-t-transparent animate-spin"></div>
      </div>
      <p className="mt-6 text-gray-600 font-medium">Cargando calendario...</p>
      <p className="text-sm text-gray-500 mt-2">Obteniendo las últimas publicaciones programadas</p>
    </motion.div>
  );
}

// Componente de información de actualización
function UpdateInfo() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.4 }}
      className="group relative"
    >
      <div className="absolute -inset-1 bg-gradient-to-r from-teal-600/10 to-teal-400/10 rounded-xl blur opacity-30"></div>
      <div className="relative bg-white rounded-xl p-4 shadow-sm border border-teal-100">
        <div className="flex items-center justify-center gap-4 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-teal-600" />
            <span>Actualizado según calendario oficial del INDEC</span>
          </div>
          <div className="w-px h-4 bg-gray-300"></div>
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-teal-600" />
            <span>Fuente: Instituto Nacional de Estadística y Censos</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// Componente principal
export default function ModernCalendarPage() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  
  useEffect(() => {
    const fetchCalendarData = async () => {
      setLoading(true);
      const month = currentDate.getMonth() + 1;
      const year = currentDate.getFullYear();
      
      try {
        const response = await fetch(`/api/calendar?month=${month}&year=${year}&limit=100`);
        const { data } = await response.json();
        setEvents(data);
      } catch (error) {
        console.error('Error fetching calendar data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCalendarData();
  }, [currentDate]);
  
  const handlePreviousMonth = () => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() - 1);
      return newDate;
    });
  };
  
  const handleNextMonth = () => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + 1);
      return newDate;
    });
  };
  
  return (
    <div className="relative min-h-screen">
      <HeroSection 
        title="Calendario INDEC" 
        subtitle="Mantente al día con los principales indicadores y publicaciones económicas"
      />

      {/* Background pattern */}
      <div 
        className="absolute inset-0 opacity-[0.85] pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(circle, #d0d0d0 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
      ></div>
      
      <div className="container mx-auto px-4 py-8 relative z-10 max-w-7xl">
        {/* Month Selector Section */}
        <div className="mb-12">
          <SectionHeader title="Navegación del calendario" icon={Calendar} />
          <ModernMonthSelector 
            currentDate={currentDate}
            onPrevious={handlePreviousMonth}
            onNext={handleNextMonth}
          />
        </div>
        
        {/* Calendar View Section */}
        <div className="mb-16">
          <SectionHeader title="Eventos programados" icon={FileText} />
          {loading ? (
            <ModernLoadingState />
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="group relative"
            >
              <div className="absolute -inset-1 bg-gradient-to-r from-teal-600/10 to-teal-400/10 rounded-2xl blur opacity-30 group-hover:opacity-50 transition duration-300"></div>
              <div className="relative bg-white rounded-2xl p-6 shadow-md border border-teal-100">
                <CalendarView events={events} />
              </div>
            </motion.div>
          )}
        </div>
        
        {/* Information Section */}
        <CalendarInfo />
        
        {/* Update Information */}
        <UpdateInfo />
        
        {/* Footer info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="text-center text-sm text-gray-600 mt-8"
        >
          <p className="mb-1">Las fechas pueden estar sujetas a modificaciones según la disponibilidad de datos</p>
        </motion.div>
      </div>
    </div>
  );
}