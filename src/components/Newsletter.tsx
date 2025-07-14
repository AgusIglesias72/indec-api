'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  DollarSign, 
  BarChart3, 
  Globe, 
  Bell, 
  Mail,
  ArrowRight,
  Sparkles,
  Calendar,
  FileText,
  Zap
} from 'lucide-react';

interface NetworkGraphProps {
  className?: string;
}

function EconomicNetworkGraph({ className }: NetworkGraphProps) {
  const [hoveredNode, setHoveredNode] = useState<number | null>(null);

  const nodes = [
    { id: 1, cx: 150, cy: 120, icon: Bell, size: 28, color: 'blue', label: 'Alertas' },
    { id: 2, cx: 80, cy: 60, icon: DollarSign, size: 20, color: 'green', label: 'Dólar' },
    { id: 3, cx: 220, cy: 60, icon: TrendingUp, size: 20, color: 'blue', label: 'Inflación' },
    { id: 4, cx: 50, cy: 150, icon: BarChart3, size: 20, color: 'indigo', label: 'EMAE' },
    { id: 5, cx: 250, cy: 150, icon: Globe, size: 20, color: 'blue', label: 'Riesgo País' },
    { id: 6, cx: 80, cy: 210, icon: FileText, size: 20, color: 'slate', label: 'Reportes' },
    { id: 7, cx: 220, cy: 210, icon: Calendar, size: 20, color: 'cyan', label: 'Calendario' },
    { id: 8, cx: 150, cy: 40, icon: Zap, size: 18, color: 'sky', label: 'APIs' },
  ];

  const connections = [
    [1, 2], [1, 3], [1, 4], [1, 5], [1, 6], [1, 7], [1, 8],
    [2, 4], [3, 5], [6, 7], [2, 8], [3, 8]
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const nodeVariants = {
    hidden: { opacity: 0, scale: 0.5 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        type: 'spring',
        stiffness: 300,
        damping: 20,
      },
    },
  };

  const lineVariants = {
    hidden: { pathLength: 0, opacity: 0 },
    visible: {
      pathLength: 1,
      opacity: 1,
      transition: {
        duration: 1.2,
        ease: 'easeInOut',
      },
    },
  };

  const getColorClasses = (color: string) => {
    const colors: { [key: string]: string } = {
      blue: 'fill-blue-500/20 stroke-blue-300 text-blue-400',
      indigo: 'fill-indigo-500/20 stroke-indigo-300 text-indigo-400',
      green: 'fill-green-500/20 stroke-green-300 text-green-400',
      slate: 'fill-slate-500/20 stroke-slate-300 text-slate-400',
      cyan: 'fill-cyan-500/20 stroke-cyan-300 text-cyan-400',
      sky: 'fill-sky-500/20 stroke-sky-300 text-sky-400',
    };
    return colors[color] || colors.blue;
  };

  return (
    <motion.div
      className={className}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <svg viewBox="0 0 300 250" className="w-full h-auto">
        <defs>
          <linearGradient id="connectionGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.4" />
            <stop offset="50%" stopColor="#2563eb" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#1d4ed8" stopOpacity="0.4" />
          </linearGradient>
        </defs>

        <g>
          {connections.map(([fromId, toId], index) => {
            const fromNode = nodes.find(n => n.id === fromId);
            const toNode = nodes.find(n => n.id === toId);
            if (!fromNode || !toNode) return null;

            return (
              <motion.line
                key={`line-${index}`}
                x1={fromNode.cx}
                y1={fromNode.cy}
                x2={toNode.cx}
                y2={toNode.cy}
                stroke="url(#connectionGradient)"
                strokeWidth="1.5"
                variants={lineVariants}
              />
            );
          })}
        </g>

        <g>
          {nodes.map((node) => {
            const Icon = node.icon;
            const colorClasses = getColorClasses(node.color);
            const isCentral = node.id === 1;
            const isHovered = hoveredNode === node.id;

            return (
              <motion.g 
                key={`node-${node.id}`} 
                variants={nodeVariants}
                onMouseEnter={() => setHoveredNode(node.id)}
                onMouseLeave={() => setHoveredNode(null)}
                style={{ cursor: 'pointer' }}
              >
                <motion.circle
                  cx={node.cx}
                  cy={node.cy}
                  r={isCentral ? 32 : 24}
                  className={colorClasses}
                  strokeWidth="2"
                  animate={isCentral ? {
                    scale: [1, 1.1, 1],
                  } : isHovered ? {
                    scale: 1.2
                  } : {
                    scale: 1
                  }}
                  transition={{
                    duration: isCentral ? 2 : 0.2,
                    repeat: isCentral ? Infinity : 0,
                    ease: "easeInOut"
                  }}
                />
                
                <foreignObject
                  x={node.cx - node.size / 2}
                  y={node.cy - node.size / 2}
                  width={node.size}
                  height={node.size}
                  style={{ pointerEvents: 'none' }}
                >
                  <Icon 
                    size={node.size} 
                    className={colorClasses.split(' ')[2]}
                  />
                </foreignObject>

                {/* Tooltip mejorado */}
                {isHovered && (
                  <motion.g
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.2 }}
                  >
                    {/* Sombra del tooltip */}
                    <rect
                      x={node.cx - 35}
                      y={node.cy - 55}
                      width={70}
                      height={28}
                      rx={14}
                      className="fill-black/20"
                      transform="translate(2, 2)"
                    />
                    {/* Fondo del tooltip */}
                    <rect
                      x={node.cx - 35}
                      y={node.cy - 55}
                      width={70}
                      height={28}
                      rx={14}
                      className="fill-gray-800 stroke-blue-400/50"
                      strokeWidth="1"
                    />
                    {/* Texto del tooltip */}
                    <text
                      x={node.cx}
                      y={node.cy - 37}
                      textAnchor="middle"
                      className="fill-white text-xs font-medium"
                      style={{ fontSize: '12px' }}
                    >
                      {node.label}
                    </text>
                    {/* Pequeña flecha */}
                    <polygon
                      points={`${node.cx},${node.cy - 27} ${node.cx - 4},${node.cy - 19} ${node.cx + 4},${node.cy - 19}`}
                      className="fill-gray-800"
                    />
                  </motion.g>
                )}
              </motion.g>
            );
          })}
        </g>
      </svg>
    </motion.div>
  );
}

export default function NewsletterSignupSection() {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!email) return;
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      const response = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          email,
          source: 'website'
        }),
      });

      const data = await response.json();

      if (data.success) {
        setSubmitted(true);
        setEmail('');
      } else {
        setError(data.error || 'Error al suscribirse');
      }
    } catch (err) {
      console.error('Error subscribing to newsletter:', err);
      setError('Error de conexión. Intentá de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="relative bg-gradient-to-br from-slate-900 via-blue-900 to-blue-800 py-24 overflow-hidden">
      <div 
        className="absolute inset-0 opacity-15"
        style={{
          backgroundImage: 'radial-gradient(circle at 25% 25%, #2563eb 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="text-white"
          >
            <motion.div 
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/20 rounded-full border border-blue-400/30 mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Sparkles className="h-4 w-4 text-blue-400" />
              <span className="text-sm font-medium text-blue-200">Newsletter Exclusivo</span>
            </motion.div>

            <motion.h2 
              className="text-4xl md:text-5xl lg:text-6xl font-bold leading-[1.15] mb-6"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              Mantenete al día con
              <span className="block bg-gradient-to-r from-blue-400 via-blue-300 to-cyan-400 bg-clip-text text-transparent leading-[1.15]">
                la economía argentina.
              </span>
            </motion.h2>

            <motion.p 
              className="text-lg md:text-xl text-gray-300 mb-8 leading-relaxed"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              Recibí análisis exclusivos, alertas de indicadores clave y acceso temprano a nuevas funcionalidades. Todo en un resumen semanal directo a tu email.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              {!submitted ? (
                <>
                  <div className="flex flex-col sm:flex-row gap-4 mb-4">
                    <div className="flex-1 relative">
                      <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value);
                          if (error) setError(null); // Limpiar error al escribir
                        }}
                        onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                        placeholder="tu@email.com"
                        className="w-full pl-12 pr-4 py-4 bg-white/10  border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                      />
                    </div>
                    <motion.button
                      onClick={handleSubmit}
                      disabled={isSubmitting || !email}
                      className="px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900 transition-all duration-300 disabled:opacity-70 flex items-center justify-center gap-2 min-w-[140px] cursor-pointer disabled:cursor-not-allowed"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {isSubmitting ? (
                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                      ) : (
                        <>
                          Suscribirme
                          <ArrowRight className="h-5 w-5" />
                        </>
                      )}
                    </motion.button>
                  </div>

                  {/* Error message */}
                  {error && (
                    <motion.div 
                      className="flex items-center gap-3 p-3 bg-red-500/20 border border-red-400/30 rounded-xl mb-4"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                    >
                      <div className="h-6 w-6 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-white text-sm">!</span>
                      </div>
                      <p className="text-sm text-red-300">{error}</p>
                    </motion.div>
                  )}
                </>
              ) : (
                <motion.div 
                  className="flex items-center gap-3 p-4 bg-green-500/20 border border-green-400/30 rounded-xl mb-6"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                >
                  <div className="h-8 w-8 bg-green-500 rounded-full flex items-center justify-center">
                    <ArrowRight className="h-4 w-4 text-white rotate-45" />
                  </div>
                  <div>
                    <p className="font-semibold text-green-400">¡Listo!</p>
                    <p className="text-sm text-green-300">Te has suscripto exitosamente al newsletter.</p>
                  </div>
                </motion.div>
              )}

              <p className="text-sm text-gray-400">
                Sin spam. Cancelá cuando quieras.
              </p>
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-blue-600/20 rounded-3xl blur-3xl" />
            
            <div className="relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-8">
              <EconomicNetworkGraph className="w-full max-w-md mx-auto" />
              
              <div className="absolute top-4 right-4 px-3 py-1 bg-blue-500/30 border border-blue-400/30 rounded-full">
                <span className="text-xs text-blue-200 font-medium">Datos en tiempo real</span>
              </div>
              
              <div className="absolute bottom-4 left-4 px-3 py-1 bg-blue-600/30 border border-blue-500/30 rounded-full">
                <span className="text-xs text-blue-200 font-medium">APIs disponibles</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}