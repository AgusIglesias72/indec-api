"use client"

import React from 'react';
import DollarRateCard from '../DollarRateCard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function DollarPanel() {
  return (
    <div className="space-y-4">
      <Tabs defaultValue="main" className="w-full">
        <TabsList className="grid grid-cols-2 w-full">
          <TabsTrigger value="main">Principales</TabsTrigger>
          <TabsTrigger value="all">Todos</TabsTrigger>
        </TabsList>
        
        <TabsContent value="main" className="space-y-4 pt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <DollarRateCard 
              dollarType="BLUE" 
              compactMode={true} 
            />
            <DollarRateCard 
              dollarType="OFICIAL" 
              compactMode={true} 
            />
          </div>
        </TabsContent>
        
        <TabsContent value="all" className="pt-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <DollarRateCard
              dollarType="BLUE"
              compactMode={true}
            />
            <DollarRateCard
              dollarType="OFICIAL"
              compactMode={true}
            />
            <DollarRateCard
              dollarType="MEP"
              compactMode={true}
            />
            <DollarRateCard
              dollarType="CCL"
              compactMode={true}
            />
            <DollarRateCard
              dollarType="MAYORISTA"
              compactMode={true}
            />
            <DollarRateCard
              dollarType="TARJETA"
              compactMode={true}
            />
          </div>
        </TabsContent>
      </Tabs>
      
      <div className="text-xs text-indec-gray-dark text-center pt-2">
        <p>Los datos se actualizan en días hábiles</p>
      </div>
    </div>
  );
}