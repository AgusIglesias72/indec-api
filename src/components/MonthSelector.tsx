import {ChevronLeftIcon, ChevronRightIcon} from 'lucide-react'
import { motion } from 'framer-motion';

const MONTHS = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

interface MonthSelectorProps {
  currentDate: Date;
  onPrevious: () => void;
  onNext: () => void;
}

export default function MonthSelector({ currentDate, onPrevious, onNext }: MonthSelectorProps) {
  const month = MONTHS[currentDate.getMonth()];
  const year = currentDate.getFullYear();
  
  return (
    <motion.div 
      className="flex items-center justify-center"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <motion.button 
        onClick={onPrevious}
        className="p-3 rounded-full bg-white  hover:bg-gray-50 text-indec-blue-dark"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        aria-label="Mes anterior"
      >
        <ChevronLeftIcon className="h-6 w-6" />
      </motion.button>
      
      <motion.h2 
        className="text-2xl font-bold mx-6 px-6 py-2 bg-white  text-indec-blue-dark"
        key={`${month}-${year}`}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        {month} {year}
      </motion.h2>
      
      <motion.button 
        onClick={onNext}
        className="p-3 rounded-full bg-white  hover:bg-gray-50 text-indec-blue-dark"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        aria-label="Mes siguiente"
      >
        <ChevronRightIcon className="h-6 w-6" />
      </motion.button>
    </motion.div>
  );
}