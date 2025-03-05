'use client';

import { useState, useEffect } from 'react';
import CalendarView from '@/components/CalendarView';
import MonthSelector from '@/components/MonthSelector';
import HeroSection from '@/components/HeroSection';
import { CalendarEvent } from '@/types/calendar';

export default function CalendarPage() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  
  const fetchCalendarData = async () => {
    setLoading(true);
    const month = currentDate.getMonth() + 1;
    const year = currentDate.getFullYear();
    
    try {
      const response = await fetch(`/api/calendar?month=${month}&year=${year}`);
      const { data } = await response.json();
      setEvents(data);
    } catch (error) {
      console.error('Error fetching calendar data:', error);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
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
    <div className="relative min-h-screen bg-gradient-to-b from-white to-gray-100">
      {/* Fondo con puntitos */}
      <div className="absolute inset-0 z-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(#3b82f6 1px, transparent 1px)',
          backgroundSize: '30px 30px'
        }}></div>
      </div>
      
      <HeroSection 
        title="Calendario Económico" 
        subtitle="Mantente al día con los principales indicadores y publicaciones económicas"
      />
      
      <div className="container relative z-10 mx-auto ">
        {/* Month Selector fijo con margen superior para el NavBar */}
        <div className="sticky top-16 bg-white bg-opacity-95 py-4 z-20 
        border-b border-indec-gray-medium">
          <MonthSelector 
            currentDate={currentDate}
            onPrevious={handlePreviousMonth}
            onNext={handleNextMonth}
          />
        </div>
        
        {/* Contenedor scrolleable para el calendario */}
        <div className="py-8">
          {loading ? (
            <div className="flex justify-center my-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            <CalendarView events={events} />
          )}
        </div>
      </div>
    </div>
  );
}