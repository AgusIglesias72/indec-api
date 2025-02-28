"use client"

import { motion } from "framer-motion"
import { Skeleton } from "@/components/ui/skeleton"
import Counter from "../ui/counter"
import { useApiStats } from "@/hooks/useApiData"

const fadeInUpItem = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { 
      duration: 0.5,
      ease: "easeOut"
    }
  }
};

export default function Stats() {
  const { data, loading, error } = useApiStats();

  return (
    <section className="py-16 bg-white border-y border-indec-gray-medium relative z-10">
      {/* Esta div con fondo blanco sólido y z-index superior bloquea los puntos del fondo */}
      <div className="absolute inset-0 bg-white" />
      
      <div className="container mx-auto px-4 relative z-10">
        <motion.div 
          className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: {
                staggerChildren: 0.1
              }
            }
          }}
        >
          <motion.div className="flex flex-col" variants={fadeInUpItem}>
            {loading ? (
              <>
                <Skeleton className="h-12 w-3/4 mx-auto mb-2" />
                <Skeleton className="h-4 w-1/2 mx-auto" />
              </>
            ) : (
              <>
                <span className="text-4xl md:text-5xl font-mono font-semibold text-indec-blue mb-2">
                  <Counter 
                    end={error ? 0 : (data?.dataPoints || 0) / 1000000}
                    decimals={1} 
                    suffix="M" 
                    prefix="+" 
                    separator="."
                    duration={0.5} 
                  />
                </span>
                <span className="text-sm text-indec-gray-dark">Datapoints procesados</span>
              </>
            )}
          </motion.div>
          
          <motion.div className="flex flex-col" variants={fadeInUpItem}>
            {loading ? (
              <>
                <Skeleton className="h-12 w-3/4 mx-auto mb-2" />
                <Skeleton className="h-4 w-1/2 mx-auto" />
              </>
            ) : (
              <>
                <span className="text-4xl md:text-5xl font-mono font-semibold text-indec-blue mb-2">
                  <Counter 
                    end={error ? 0 : data?.apiUptime || 0} 
                    decimals={1} 
                    suffix="%" 
                    duration={0.5} 
                  />
                </span>
                <span className="text-sm text-indec-gray-dark">Uptime de la API</span>
              </>
            )}
          </motion.div>
          
          <motion.div className="flex flex-col" variants={fadeInUpItem}>
            {loading ? (
              <>
                <Skeleton className="h-12 w-3/4 mx-auto mb-2" />
                <Skeleton className="h-4 w-1/2 mx-auto" />
              </>
            ) : (
              <>
                <span className="text-4xl md:text-5xl font-mono font-semibold text-indec-blue mb-2">
                  {error ? "0" : data?.indicatorsCount || 0}
                </span>
                <span className="text-sm text-indec-gray-dark">Indicadores económicos</span>
              </>
            )}
          </motion.div>
          
          <motion.div className="flex flex-col" variants={fadeInUpItem}>
            {loading ? (
              <>
                <Skeleton className="h-12 w-3/4 mx-auto mb-2" />
                <Skeleton className="h-4 w-1/2 mx-auto" />
              </>
            ) : (
              <>
                <span className="text-4xl md:text-5xl font-mono font-semibold text-indec-blue mb-2">
                  {error ? "0" : `${data?.updateTime || 0}min`}
                </span>
                <span className="text-sm text-indec-gray-dark">Tiempo de actualización</span>
              </>
            )}
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}