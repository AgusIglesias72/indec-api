'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Code, Copy, ExternalLink, Book, Zap, Shield, Globe, CheckCircle, ArrowRight, Terminal, Database, Activity, Users, AlertTriangle, Clock, RefreshCw, BarChart3, TrendingUp, Calendar, DollarSign, Key } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

// Importar los endpoints actualizados
import { apiGroups as importedApiGroups } from '@/data/api-endpoints';

// Agregar colores e iconos a los grupos importados
const apiGroupsWithUI = importedApiGroups.map(group => {
  const uiConfig = {
    'calendar': { color: 'blue', icon: Calendar },
    'emae': { color: 'blue', icon: BarChart3 },
    'ipc': { color: 'purple', icon: TrendingUp },
    'dollar': { color: 'green', icon: DollarSign },
    'riesgo-pais': { color: 'red', icon: Globe },
    'labor-market': { color: 'orange', icon: Users },
    'poverty': { color: 'red', icon: Users }
  };
  
  const config = uiConfig[group.id as keyof typeof uiConfig];
  return {
    ...group,
    color: config?.color || 'blue',
    icon: config?.icon || BarChart3
  };
});

// Use the imported API groups with UI configuration
const apiGroups = apiGroupsWithUI;

export default function ApiDocsPage() {
  const [copiedExample, setCopiedExample] = useState<string | null>(null);

  const copyToClipboard = async (text: string, exampleId: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedExample(exampleId);
      setTimeout(() => setCopiedExample(null), 2000);
    } catch (err) {
      console.error('Error al copiar:', err);
    }
  };

  const quickStartExample = `// Ejemplo rápido - Obtener datos del EMAE
fetch('https://argenstats.com/api/emae?year=2024')
  .then(response => response.json())
  .then(data => {
    console.log('Datos del EMAE:', data);
  });`;

  // Función para obtener el color según la categoría
  const getColorClasses = (color: string) => {
    const colors = {
      blue: {
        bg: 'bg-blue-100',
        text: 'text-blue-600',
        border: 'border-blue-100',
        gradient: 'from-blue-600/20 to-blue-400/20'
      },
      purple: {
        bg: 'bg-purple-100',
        text: 'text-purple-600',
        border: 'border-purple-100',
        gradient: 'from-purple-600/20 to-purple-400/20'
      },
      red: {
        bg: 'bg-red-100',
        text: 'text-red-600',
        border: 'border-red-100',
        gradient: 'from-red-600/20 to-red-400/20'
      },
      orange: {
        bg: 'bg-orange-100',
        text: 'text-orange-600',
        border: 'border-orange-100',
        gradient: 'from-orange-600/20 to-orange-400/20'
      },
      green: {
        bg: 'bg-green-100',
        text: 'text-green-600',
        border: 'border-green-100',
        gradient: 'from-green-600/20 to-green-400/20'
      }
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  // Componente Hero Section siguiendo el patrón del dólar
  function HeroSection() {
    return (
      <div className="relative bg-gradient-to-br from-indec-blue/5 to-blue-100 py-20 mb-8 overflow-hidden">
        {/* Círculos decorativos */}
        <div className="absolute top-0 left-0 w-[400px] h-[400px] rounded-full bg-indec-blue/10 -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 right-0 w-[600px] h-[600px] rounded-full bg-indec-blue/5 translate-x-1/3 translate-y-1/3"></div>

        <div className="container mx-auto px-4 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-3 mb-4">
              <div className="h-12 w-12 bg-indec-blue rounded-xl flex items-center justify-center">
                <Code className="h-6 w-6 text-white" />
              </div>
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Documentación de API
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Accede programáticamente a indicadores económicos oficiales de Argentina.
              APIs RESTful modernas, bien documentadas y fáciles de integrar.
            </p>
          </motion.div>
        </div>
      </div>
    );
  }

  // Componente para headers de sección
  function SectionHeader({ title, icon: Icon }: { title: string; icon: any }) {
    return (
      <div className="flex items-center gap-3 mb-6">
        <div className="h-8 w-8 bg-indec-blue/10 rounded-lg flex items-center justify-center">
          <Icon className="h-4 w-4 text-indec-blue" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
      </div>
    );
  }

  // Componente de información de actualización
  function UpdateInfo() {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="group relative mb-8"
      >
        <div className="absolute -inset-1 bg-gradient-to-r from-indec-blue/10 to-indec-blue/5 rounded-xl blur opacity-30"></div>
        <div className="relative bg-white rounded-xl p-4 shadow-sm border border-indec-blue/20">
          <div className="flex items-center justify-center gap-4 text-sm text-gray-600 flex-wrap">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-indec-blue" />
              <span>APIs actualizadas automáticamente</span>
            </div>
            <div className="w-px h-4 bg-gray-300 hidden sm:block"></div>
            <div className="flex items-center gap-2">
              <RefreshCw className="h-4 w-4 text-indec-blue" />
              <span>Datos oficiales del INDEC</span>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="relative min-h-screen">
      <HeroSection />

      {/* Background pattern */}
      <div
        className="absolute inset-0 opacity-[0.85] pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(circle, #d0d0d0 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
      />

      <div className="container mx-auto px-4 py-8 relative z-10 max-w-7xl">
        <UpdateInfo />

        {/* Quick Start */}
        <div className="mb-12">
          <SectionHeader title="Inicio Rápido" icon={Terminal} />

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="group relative"
          >
            <div className="absolute -inset-1 bg-gradient-to-r from-indec-blue/20 to-indec-blue/10 rounded-2xl blur opacity-50"></div>
            <div className="relative bg-white rounded-2xl p-6 shadow-lg border border-indec-blue/20">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Ejemplo básico</h3>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => copyToClipboard(quickStartExample, 'quick-start')}
                >
                  {copiedExample === 'quick-start' ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>

              <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto text-sm">
                <code>{quickStartExample}</code>
              </pre>

              <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm text-blue-800">
                  <strong>URL Base:</strong> <code className="bg-blue-100 px-2 py-1 rounded">https://argenstats.com</code>
                </p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* General Information */}
        <div className="mb-12">
          <SectionHeader title="Información General" icon={Book} />

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="group relative"
          >
            <div className="absolute -inset-1 bg-gradient-to-r from-gray-200/30 to-gray-100/30 rounded-2xl blur opacity-50"></div>
            <div className="relative bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-4">
                  <div className="h-12 w-12 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <Shield className="h-6 w-6 text-green-600" />
                  </div>
                  <h3 className="font-semibold mb-2">Acceso Público + API Keys</h3>
                  <p className="text-sm text-gray-600">Acceso libre o con API key para usuarios registrados</p>
                </div>

                <div className="text-center p-4">
                  <div className="h-12 w-12 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <Database className="h-6 w-6 text-purple-600" />
                  </div>
                  <h3 className="font-semibold mb-2">Múltiples Formatos</h3>
                  <p className="text-sm text-gray-600">Respuestas en JSON y CSV</p>
                </div>

                <div className="text-center p-4">
                  <div className="h-12 w-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <Zap className="h-6 w-6 text-blue-600" />
                  </div>
                  <h3 className="font-semibold mb-2">Alta Performance</h3>
                  <p className="text-sm text-gray-600">Respuestas optimizadas y cache inteligente</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* API Authentication */}
        <div className="mb-12">
          <SectionHeader title="Autenticación con API Key" icon={Key} />

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="group relative"
          >
            <div className="absolute -inset-1 bg-gradient-to-r from-indec-blue/20 to-indec-blue/10 rounded-2xl blur opacity-50"></div>
            <div className="relative bg-white rounded-2xl p-6 shadow-lg border border-indec-blue/20">
              <div className="mb-6">
                <p className="text-gray-600 mb-4">
                  Aunque nuestras APIs son públicas, te recomendamos usar una API Key para obtener beneficios adicionales:
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div className="flex items-start gap-3 p-4 bg-green-50 rounded-lg border border-green-200">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="font-medium text-green-900">Tracking de Uso</h4>
                      <p className="text-sm text-green-700 mt-1">
                        Monitorea tus consultas y estadísticas desde tu perfil
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <Activity className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="font-medium text-blue-900">Soporte Técnico</h4>
                      <p className="text-sm text-blue-700 mt-1">
                        Acceso prioritario a soporte para usuarios registrados
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3 p-4 bg-purple-50 rounded-lg border border-purple-200">
                    <BarChart3 className="h-5 w-5 text-purple-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="font-medium text-purple-900">Analytics Avanzado</h4>
                      <p className="text-sm text-purple-700 mt-1">
                        Estadísticas detalladas de tu uso de la API
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3 p-4 bg-amber-50 rounded-lg border border-amber-200">
                    <Zap className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="font-medium text-amber-900">Sin Límites</h4>
                      <p className="text-sm text-amber-700 mt-1">
                        Acceso ilimitado sin restricciones de rate limiting
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-medium text-gray-900">Cómo usar tu API Key:</h4>
                
                <div>
                  <h5 className="font-medium mb-2 text-gray-800">1. Obtén tu API Key</h5>
                  <p className="text-sm text-gray-600 mb-2">
                    Regístrate gratis y genera una API Key desde tu <a href="/profile" className="text-indec-blue hover:underline">perfil de usuario</a>
                  </p>
                </div>

                <div>
                  <h5 className="font-medium mb-2 text-gray-800">2. Incluye el header en tus requests</h5>
                  <div className="bg-gray-900 text-green-400 p-4 rounded-lg">
                    <code className="text-sm">
                      curl -H &quot;x-api-key: tu-api-key-aqui&quot; \<br />
                      &nbsp;&nbsp;&nbsp;&nbsp;&quot;https://argenstats.com/api/dollar&quot;
                    </code>
                  </div>
                </div>

                <div>
                  <h5 className="font-medium mb-2 text-gray-800">3. JavaScript/Fetch Example</h5>
                  <div className="bg-gray-900 text-blue-400 p-4 rounded-lg">
                    <code className="text-sm">
                      fetch(&apos;https://argenstats.com/api/dollar&apos;, {`{`}<br />
                      &nbsp;&nbsp;headers: {`{`}<br />
                      &nbsp;&nbsp;&nbsp;&nbsp;&apos;x-api-key&apos;: &apos;tu-api-key-aqui&apos;<br />
                      &nbsp;&nbsp;{`}`}<br />
                      {`}`})
                    </code>
                  </div>
                </div>

                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-amber-900">Nota Importante</p>
                      <p className="text-sm text-amber-700 mt-1">
                        Las APIs funcionan perfectamente sin API Key, pero con ella obtienes beneficios adicionales y mejor soporte.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* APIs por Indicador */}
        <div className="mb-12">
          <SectionHeader title="APIs por Indicador" icon={BarChart3} />

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {apiGroups.map((group, index) => {
              const colorClasses = getColorClasses(group.color);
              const IconComponent = group.icon;

              return (
                <motion.div
                  key={group.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="group relative"
                >
                  <div className={`absolute -inset-1 bg-gradient-to-r ${colorClasses.gradient} rounded-2xl blur opacity-50 group-hover:opacity-75 transition duration-500`}></div>

                  <div className={`relative bg-white rounded-2xl p-6 shadow-lg border ${colorClasses.border} h-full`}>
                    <div className="flex items-center gap-3 mb-4">
                      <div className={`h-10 w-10 ${colorClasses.bg} rounded-xl flex items-center justify-center`}>
                        <IconComponent className={`h-5 w-5 ${colorClasses.text}`} />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900">{group.title}</h3>
                        <p className="text-xs text-gray-500">{group.endpoints.length} endpoint{group.endpoints.length > 1 ? 's' : ''}</p>
                      </div>
                    </div>

                    <p className="text-sm text-gray-600 mb-4 leading-relaxed">
                      {group.description}
                    </p>

                    <div className="space-y-2 mb-4">
                      {group.endpoints.slice(0, 2).map((endpoint, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-xs">
                          <Badge className="bg-green-100 text-green-800 font-mono text-xs">{endpoint.method}</Badge>
                          <code className="text-gray-600">{endpoint.path}</code>
                        </div>
                      ))}
                      {group.endpoints.length > 2 && (
                        <p className="text-xs text-gray-500">+{group.endpoints.length - 2} más...</p>
                      )}
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={() => {
                        // Cambiar a la tab correspondiente
                        const tabTrigger = document.querySelector(`[data-state="inactive"][value="${group.id}"]`) as HTMLElement;
                        if (tabTrigger) {
                          tabTrigger.click();
                        }
                        // Hacer scroll a la sección de documentación detallada
                        setTimeout(() => {
                          document.getElementById('documentacion-detallada')?.scrollIntoView({
                            behavior: 'smooth',
                            block: 'start'
                          });
                        }, 100);
                      }}
                    >
                      Ver Documentación
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Documentación Detallada */}
        <div className="mb-16" id="documentacion-detallada">
          <SectionHeader title="Documentación Detallada" icon={Database} />

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="group relative"
          >
            <div className="absolute -inset-1 bg-gradient-to-r from-gray-200/30 to-gray-100/30 rounded-2xl blur opacity-50"></div>
            <div className="relative bg-white rounded-2xl shadow-lg border border-gray-200">
              <Tabs defaultValue="calendar" className="w-full">
                <div className="px-6 pt-6">
                  <TabsList className="grid w-full grid-cols-7 h-12">
                    {apiGroups.map(group => (
                      <TabsTrigger
                        key={group.id}
                        value={group.id}
                        className="text-sm font-medium"
                      >
                        {group.title.replace('API de ', '')}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                </div>

                {apiGroups.map(group => (
                  <TabsContent key={group.id} value={group.id} className="m-0 p-6">
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">{group.title}</h3>
                        <p className="text-gray-600">{group.description}</p>
                      </div>

                      <div className="space-y-6">
                        {group.endpoints.map((endpoint, index) => {
                          const colorClasses = getColorClasses(group.color);

                          return (
                            <div key={index} className={`border ${colorClasses.border} rounded-lg p-6 bg-gray-50/50`}>
                              <div className="flex items-start gap-4 mb-4">
                                <Badge
                                  className={`${endpoint.method === 'GET'
                                      ? 'bg-green-100 text-green-800'
                                      : 'bg-blue-100 text-blue-800'
                                    } font-mono`}
                                >
                                  {endpoint.method}
                                </Badge>
                                <div className="flex-1">
                                  <code className="text-lg font-mono text-gray-900 bg-white px-3 py-2 rounded border">
                                    {endpoint.path}
                                  </code>
                                  <p className="text-gray-600 mt-2">{endpoint.description}</p>
                                </div>
                              </div>

                              {endpoint.parameters.length > 0 && (
                                <div className="mb-4">
                                  <h4 className="font-medium text-gray-900 mb-3">Parámetros</h4>
                                  <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                      <thead>
                                        <tr className="border-b border-gray-200">
                                          <th className="text-left py-2 font-medium text-gray-700">Nombre</th>
                                          <th className="text-left py-2 font-medium text-gray-700">Tipo</th>
                                          <th className="text-left py-2 font-medium text-gray-700">Requerido</th>
                                          <th className="text-left py-2 font-medium text-gray-700">Descripción</th>
                                        </tr>
                                      </thead>
                                      <tbody>
                                        {endpoint.parameters.map((param, paramIndex) => (
                                          <tr key={paramIndex} className="border-b border-gray-100">
                                            <td className="py-2">
                                              <code className="bg-gray-100 px-2 py-1 rounded text-xs">
                                                {param.name}
                                              </code>
                                            </td>
                                            <td className="py-2 text-gray-600">{param.type}</td>
                                            <td className="py-2">
                                              {param.required ? (
                                                <Badge className="bg-red-100 text-red-800 text-xs">Sí</Badge>
                                              ) : (
                                                <Badge variant="secondary" className="text-xs">No</Badge>
                                              )}
                                            </td>
                                            <td className="py-2 text-gray-600">{param.description}</td>
                                          </tr>
                                        ))}
                                      </tbody>
                                    </table>
                                  </div>
                                </div>
                              )}

                              {endpoint.notes && endpoint.notes.length > 0 && (
                                <div className="mb-4">
                                  <h4 className="font-medium text-gray-900 mb-2">Notas Importantes</h4>
                                  <ul className="space-y-1">
                                    {endpoint.notes.map((note, noteIndex) => (
                                      <li key={noteIndex} className="text-sm text-gray-600 flex items-start gap-2">
                                        <Activity className={`h-4 w-4 ${colorClasses.text} mt-0.5 flex-shrink-0`} />
                                        {note}
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}

                              <div>
                                <h4 className="font-medium text-gray-900 mb-2">Ejemplo de Respuesta</h4>
                                <div className="relative">
                                  <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-xs max-h-64 overflow-y-auto">
                                    <code>{endpoint.responseExample}</code>
                                  </pre>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="absolute top-2 right-2 bg-gray-800 border-gray-600 hover:bg-gray-700"
                                    onClick={() => copyToClipboard(endpoint.responseExample, `response-${index}`)}
                                  >
                                    {copiedExample === `response-${index}` ? (
                                      <CheckCircle className="h-4 w-4 text-green-400" />
                                    ) : (
                                      <Copy className="h-4 w-4 text-gray-300" />
                                    )}
                                  </Button>
                                </div>
                              </div>

                              <div className="mt-4 pt-4 border-t border-gray-200">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="w-full sm:w-auto"
                                  onClick={() => window.open(`https://argenstats.com${endpoint.path}`, '_blank')}
                                >
                                  Probar Endpoint
                                  <ArrowRight className="ml-2 h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </TabsContent>
                ))}
              </Tabs>
            </div>
          </motion.div>
        </div>

        {/* Footer CTA siguiendo el patrón del dólar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="group relative"
        >
          <div className="absolute -inset-1 bg-gradient-to-r from-indec-blue/20 to-indec-blue/10 rounded-2xl blur opacity-50"></div>
          <div className="relative bg-white rounded-2xl p-8 shadow-lg border border-indec-blue/20 text-center">
            <div className="inline-flex items-center gap-3 mb-4">
              <div className="h-12 w-12 bg-indec-blue/10 rounded-xl flex items-center justify-center">
                <ExternalLink className="h-6 w-6 text-indec-blue" />
              </div>
            </div>

            <h3 className="text-2xl font-bold text-gray-900 mb-4">¿Necesitas ayuda con la integración?</h3>
            <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
              Nuestro equipo está aquí para ayudarte a implementar la API en tu proyecto.
              Contáctanos si tienes dudas o necesitas soporte técnico.
            </p>

            <div className="flex flex-wrap gap-4 justify-center">
              <Button
                size="lg"
                className="bg-indec-blue text-white hover:bg-indec-blue-dark"
                onClick={() => window.open('/contacto', '_blank')}
              >
                Contactar Soporte
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}