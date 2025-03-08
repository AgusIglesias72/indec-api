import { motion } from 'framer-motion';

interface HeroSectionProps {
    title: string;
    subtitle: string;
  }
  
  export default function HeroSection({ title, subtitle }: HeroSectionProps) {
    return (
        <section className="relative bg-white text-indec-blue-dark 
        pt-20 pb-0 md:pt-24 md:pb-0 overflow-y-visible overflow-x-clip">
       
         {/* Patrón de puntos sutiles */}
         <div 
          className="absolute inset-0 opacity-[0.85] pointer-events-none"
          style={{
            backgroundImage: 'radial-gradient(circle, #d0d0d0 1px, transparent 1px)',
            backgroundSize: '24px 24px',
          }}
        ></div>
        
        <div className="container mx-auto px-4 relative z-10">
          {/* Título principal con estilo de dos líneas */}
          <div className="text-center mb-8">
            <motion.h1 
              className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.1]"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              {title}
            </motion.h1>
          </div>
          
          <div className="max-w-3xl mx-auto text-center">
            <motion.p 
              className="text-lg md:text-xl text-indec-gray-dark mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              {subtitle}
            </motion.p>
            
        
          </div>
        </div>
        
       
      </section>
    );
  }