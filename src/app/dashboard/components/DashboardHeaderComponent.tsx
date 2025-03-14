import React from 'react';
import { LineChart } from "lucide-react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";

interface DashboardHeaderProps {
  title: string;
  description: string;
}

/**
 * Componente para el encabezado del Dashboard
 */
export default function DashboardHeader({ title, description }: DashboardHeaderProps) {
  return (
    <Card className="bg-white border border-indec-gray-medium/30 rounded-xl shadow-md">
      <CardContent className="p-6">
        <div className="flex items-center gap-4">
          <motion.div
            className="h-12 w-12 rounded-full bg-indec-blue/10 flex items-center justify-center"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <LineChart className="h-6 w-6 text-indec-blue" />
          </motion.div>
          
          <div>
            <motion.h1 
              className="text-2xl md:text-3xl font-bold text-indec-blue-dark"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              {title}
            </motion.h1>
            
            <motion.p
              className="text-indec-gray-dark mt-1"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              {description}
            </motion.p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}