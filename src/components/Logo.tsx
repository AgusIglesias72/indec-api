// src/components/Logo.tsx
import React from 'react';

interface LogoProps {
  className?: string;
  textSize?: string;
  textColor?: string;
}

export default function Logo({ 
  className = "", 
  textSize = "text-2xl md:text-3xl lg:text-4xl", 
  textColor = "text-indec-blue" 
}: LogoProps) {
  return (
      <div className={`font-righteous ${textSize} ${textColor} ${className}`}>
        ArgenStats
      </div>
  );
}