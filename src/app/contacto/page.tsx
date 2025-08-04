'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Mail, 
  MessageSquare, 
  Bug, 
  Lightbulb, 
  Code, 
  Send, 
  CheckCircle, 
  AlertCircle,
  Loader2,
  ArrowRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Alert, AlertDescription } from '@/components/ui/alert';

// Tipos de contacto con iconos y descripciones
const contactTypes = [
  {
    id: 'general',
    label: 'Consulta General',
    icon: MessageSquare,
    description: 'Preguntas generales sobre ArgenStats',
    color: 'text-blue-600',
    bgColor: 'bg-blue-100'
  },
  {
    id: 'api',
    label: 'API / Integración',
    icon: Code,
    description: 'Dudas técnicas sobre nuestra API',
    color: 'text-green-600',
    bgColor: 'bg-green-100'
  },
  {
    id: 'bug',
    label: 'Reportar Bug',
    icon: Bug,
    description: 'Encontraste un error o problema',
    color: 'text-red-600',
    bgColor: 'bg-red-100'
  },
  {
    id: 'feature',
    label: 'Solicitar Feature',
    icon: Lightbulb,
    description: 'Ideas para nuevas funcionalidades',
    color: 'text-purple-600',
    bgColor: 'bg-purple-100'
  }
];

interface FormData {
  name: string;
  email: string;
  subject: string;
  message: string;
  contact_type: string;
}

interface FormErrors {
  [key: string]: string;
}

export default function ContactPage() {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    subject: '',
    message: '',
    contact_type: 'general'
  });
  
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [submitMessage, setSubmitMessage] = useState('');

  // Validación del formulario
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'El nombre es requerido';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'El nombre debe tener al menos 2 caracteres';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'El email es requerido';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email inválido';
    }

    if (!formData.message.trim()) {
      newErrors.message = 'El mensaje es requerido';
    } else if (formData.message.trim().length < 10) {
      newErrors.message = 'El mensaje debe tener al menos 10 caracteres';
    }

    if (!formData.contact_type) {
      newErrors.contact_type = 'Selecciona un tipo de consulta';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Manejar cambios en inputs
  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Limpiar error específico cuando el usuario empiece a escribir
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  // Enviar formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (result.success) {
        setSubmitStatus('success');
        setSubmitMessage(result.message);
        
        // Limpiar formulario
        setFormData({
          name: '',
          email: '',
          subject: '',
          message: '',
          contact_type: 'general'
        });
      } else {
        setSubmitStatus('error');
        setSubmitMessage(result.error || 'Error al enviar el mensaje');
      }
    } catch (error) {
      setSubmitStatus('error');
      setSubmitMessage('Error de conexión. Inténtalo nuevamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Hero Section */}
      <section className="relative py-20">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center justify-center w-16 h-16 bg-indec-blue rounded-full mb-6">
              <Mail className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Contacto
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              ¿Tienes preguntas, sugerencias o necesitas ayuda? Estamos aquí para ayudarte.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Mensaje Personal */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4 max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="text-center"
          >
            <div className="bg-gradient-to-br from-indec-blue/5 to-purple-50 rounded-2xl p-8 md:p-12 border border-indec-blue/10">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-indec-blue to-purple-600 rounded-full mb-6">
                <MessageSquare className="w-8 h-8 text-white" />
              </div>
              
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
                Tu opinión nos importa muchísimo
              </h2>
              
              <div className="max-w-3xl mx-auto space-y-4 text-gray-700 leading-relaxed">
                <p className="text-lg">
                  ArgenStats está en constante evolución y <strong>tu feedback es fundamental</strong> para 
                  que podamos mejorar y crear exactamente lo que necesitas.
                </p>
                
                <p>
                  Ya sea que tengas una consulta técnica, hayas encontrado un bug, tengas una idea 
                  brillante para una nueva funcionalidad, o simplemente quieras saludarnos y contarnos 
                  cómo usas nuestros datos, <strong>¡queremos escucharte!</strong>
                </p>
                
                <p>
                  No importa si es una pregunta “tonta”;, una crítica constructiva, o una sugerencia 
                  que puede parecer descabellada. Cada mensaje que recibimos nos ayuda a entender 
                  mejor las necesidades de nuestra comunidad.
                </p>
              </div>

              <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
                <div className="flex items-center gap-2 text-indec-blue font-medium">
                  <CheckCircle className="w-5 h-5" />
                  <span>Respuesta en el día</span>
                </div>
                <div className="hidden sm:block w-1 h-1 bg-gray-400 rounded-full"></div>
                <div className="flex items-center gap-2 text-indec-blue font-medium">
                  <Mail className="w-5 h-5" />
                  <span>Respuesta personalizada</span>
                </div>
                <div className="hidden sm:block w-1 h-1 bg-gray-400 rounded-full"></div>
                <div className="flex items-center gap-2 text-indec-blue font-medium">
                  <Lightbulb className="w-5 h-5" />
                  <span>Todas las ideas son bienvenidas</span>
                </div>
              </div>

              <div className="mt-6 p-4 bg-white/80 rounded-lg border border-indec-blue/20">
                <p className="text-sm text-gray-600 italic">
                  💡 <strong>Tip:</strong> Si tienes una idea para un nuevo indicador económico o 
                  una funcionalidad que te gustaría ver, ¡compártela! Muchas de nuestras mejores 
                  características surgieron de sugerencias de usuarios como vos.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Formulario de Contacto */}
      <section className="py-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="grid md:grid-cols-2 gap-12">
            
            {/* Información de Contacto */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                ¿Cómo podemos ayudarte?
              </h2>
              
              <div className="space-y-6">
                {contactTypes.map((type) => {
                  const IconComponent = type.icon;
                  return (
                    <div key={type.id} className="flex items-start gap-4 p-4 rounded-lg bg-white shadow-sm">
                      <div className={`w-12 h-12 ${type.bgColor} rounded-lg flex items-center justify-center flex-shrink-0`}>
                        <IconComponent className={`w-6 h-6 ${type.color}`} />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-1">
                          {type.label}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {type.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Información adicional */}
              <div className="mt-8 p-6 bg-white rounded-lg shadow-sm border border-indec-blue/20">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-indec-blue/10 rounded-full flex items-center justify-center">
                    <Mail className="w-5 h-5 text-indec-blue" />
                  </div>
                  <h3 className="font-semibold text-gray-900">
                    Compromiso de Respuesta
                  </h3>
                </div>
                <p className="text-gray-700 leading-relaxed">
                  Nos comprometemos a responder a tu mensaje <strong>dentro de las próximas 12 horas</strong> al 
                  email que nos proporciones en el formulario. Creemos en la comunicación rápida y efectiva, 
                  por eso revisamos constantemente nuestra bandeja de entrada para poder ayudarte lo antes posible.
                </p>
                <div className="mt-4 flex items-center gap-2 text-sm text-indec-blue font-medium">
                  <CheckCircle className="w-4 h-4" />
                  <span>Respuesta garantizada en 12 horas</span>
                </div>
              </div>
            </motion.div>

            {/* Formulario */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="bg-white rounded-2xl shadow-lg p-8"
            >
              <form onSubmit={handleSubmit} className="space-y-6">
                
                {/* Tipo de Consulta */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium text-gray-700">
                    Tipo de Consulta *
                  </Label>
                  <RadioGroup
                    value={formData.contact_type}
                    onValueChange={(value) => handleInputChange('contact_type', value)}
                    className="grid grid-cols-2 gap-3"
                  >
                    {contactTypes.map((type) => {
                      const IconComponent = type.icon;
                      return (
                        <div key={type.id} className="flex items-center space-x-2">
                          <RadioGroupItem value={type.id} id={type.id} />
                          <Label 
                            htmlFor={type.id} 
                            className="flex items-center gap-2 cursor-pointer text-sm"
                          >
                            <IconComponent className={`w-4 h-4 ${type.color}`} />
                            {type.label}
                          </Label>
                        </div>
                      );
                    })}
                  </RadioGroup>
                  {errors.contact_type && (
                    <p className="text-sm text-red-600">{errors.contact_type}</p>
                  )}
                </div>

                {/* Nombre */}
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm font-medium text-gray-700">
                    Nombre *
                  </Label>
                  <Input
                    id="name"
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="Tu nombre completo"
                    className={errors.name ? 'border-red-500' : ''}
                  />
                  {errors.name && (
                    <p className="text-sm text-red-600">{errors.name}</p>
                  )}
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                    Email *
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="tu@email.com"
                    className={errors.email ? 'border-red-500' : ''}
                  />
                  {errors.email && (
                    <p className="text-sm text-red-600">{errors.email}</p>
                  )}
                </div>

                {/* Asunto */}
                <div className="space-y-2">
                  <Label htmlFor="subject" className="text-sm font-medium text-gray-700">
                    Asunto
                  </Label>
                  <Input
                    id="subject"
                    type="text"
                    value={formData.subject}
                    onChange={(e) => handleInputChange('subject', e.target.value)}
                    placeholder="Resumen de tu consulta"
                  />
                </div>

                {/* Mensaje */}
                <div className="space-y-2">
                  <Label htmlFor="message" className="text-sm font-medium text-gray-700">
                    Mensaje *
                  </Label>
                  <Textarea
                    id="message"
                    value={formData.message}
                    onChange={(e) => handleInputChange('message', e.target.value)}
                    placeholder="Describe tu consulta en detalle..."
                    rows={5}
                    className={errors.message ? 'border-red-500' : ''}
                  />
                  {errors.message && (
                    <p className="text-sm text-red-600">{errors.message}</p>
                  )}
                </div>

                {/* Estado del envío */}
                {submitStatus !== 'idle' && (
                  <Alert className={submitStatus === 'success' ? 'border-green-500' : 'border-red-500'}>
                    {submitStatus === 'success' ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-red-600" />
                    )}
                    <AlertDescription className={submitStatus === 'success' ? 'text-green-700' : 'text-red-700'}>
                      {submitMessage}
                    </AlertDescription>
                  </Alert>
                )}

                {/* Botón de envío */}
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-indec-blue hover:bg-indec-blue-dark text-white"
                  size="lg"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Enviar Mensaje
                    </>
                  )}
                </Button>

                <p className="text-xs text-gray-500 text-center">
                  Al enviar este formulario, aceptas que procesemos tu información para responder a tu consulta.
                </p>
              </form>
            </motion.div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Preguntas Frecuentes
            </h2>
            <p className="text-gray-600">
              Antes de contactarnos, revisa si tu pregunta ya tiene respuesta.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8">
            {[
              {
                question: "¿La API es gratuita?",
                answer: "Sí, nuestra API es completamente gratuita para uso personal y comercial. No requiere autenticación."
              },
              {
                question: "¿Con qué frecuencia se actualizan los datos?",
                answer: "Los datos se actualizan en tiempo real cuando están disponibles, siguiendo el calendario oficial del INDEC."
              },
              {
                question: "¿Puedo usar los datos en mi aplicación?",
                answer: "Absolutamente. Todos nuestros datos son públicos y pueden ser utilizados libremente en cualquier proyecto."
              },
              {
                question: "¿Hay límites de uso en la API?",
                answer: "No, nuestra API es completamente ilimitada. Solo requieres un Access Token para peticiones externas, pero puedes hacer todas las requests que necesites."
              }
            ].map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="bg-gray-50 rounded-lg p-6"
              >
                <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                  <ArrowRight className="w-4 h-4 text-indec-blue" />
                  {faq.question}
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {faq.answer}
                </p>
              </motion.div>
            ))}
          </div>

          <div className="text-center mt-8">
            <p className="text-gray-600 mb-4">
              ¿No encontraste lo que buscas?
            </p>
            <Button variant="outline" asChild>
              <a href="#formulario" className="inline-flex items-center gap-2">
                <MessageSquare className="w-4 h-4" />
                Contáctanos
              </a>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}