"use client"

import { motion } from "framer-motion"
import Counter from "../ui/counter";

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
  return (
    <section className="py-16 bg-white border-y border-indec-gray-medium">
      <div className="container mx-auto px-4">
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
            <span className="text-4xl md:text-5xl font-mono font-semibold text-indec-blue mb-2">
              <Counter end={10} decimals={0} suffix="M" prefix="+" duration={.5} 
            /></span>
            <span className="text-sm text-indec-gray-dark">Datapoints procesados</span>
          </motion.div>
          
          <motion.div className="flex flex-col" variants={fadeInUpItem}>

            <span className="text-4xl md:text-5xl font-mono font-semibold text-indec-blue mb-2">
              <Counter end={99.5} decimals={1} suffix="%" duration={.5} 
            /></span>
            <span className="text-sm text-indec-gray-dark">Uptime de la API</span>
          </motion.div>
          
          <motion.div className="flex flex-col" variants={fadeInUpItem}>
            <span className="text-4xl md:text-5xl font-mono font-semibold text-indec-blue mb-2">11</span>
            <span className="text-sm text-indec-gray-dark">Indicadores económicos</span>
          </motion.div>
          
          <motion.div className="flex flex-col" variants={fadeInUpItem}>
            <span className="text-4xl md:text-5xl font-mono font-semibold text-indec-blue mb-2">5min</span>
            <span className="text-sm text-indec-gray-dark">Tiempo de actualización</span>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}