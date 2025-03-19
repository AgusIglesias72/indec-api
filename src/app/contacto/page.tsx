'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Loader2 } from "lucide-react";
import HeroSection from '@/components/HeroSection';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Manejar cambios en los campos del formulario
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Manejar envío del formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    
    try {
      // Simulación de envío de formulario (reemplazar con API real)
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Simulamos éxito
      setSubmitSuccess(true);
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: ''
      });
    } catch (err) {
      setError('Hubo un problema al enviar tu mensaje. Por favor, intenta nuevamente.');
      console.error('Error al enviar formulario:', err);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="relative min-h-screen">
      <HeroSection 
        title="Contacto" 
        subtitle="Envíanos tus comentarios, sugerencias o consultas"
      />
      
      <div className="container mx-auto px-4 py-12 relative z-10 max-w-3xl">
        <Card className="border-indec-gray-medium/30 shadow-sm">
          <CardHeader>
            <CardTitle className="text-center text-indec-blue-dark">Formulario de contacto</CardTitle>
            <CardDescription className="text-center">
              Completa el formulario a continuación y nos pondremos en contacto contigo a la brevedad.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {submitSuccess ? (
              <div className="text-center py-8">
                <div className="mx-auto w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mb-4">
                  <CheckCircle2 className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-xl font-medium text-indec-blue-dark mb-2">¡Mensaje enviado con éxito!</h3>
                <p className="text-indec-gray-dark mb-6">
                  Gracias por contactarnos. Te responderemos a la brevedad.
                </p>
                <Button 
                  onClick={() => setSubmitSuccess(false)}
                  className="bg-indec-blue text-white hover:bg-indec-blue-dark"
                >
                  Enviar otro mensaje
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md mb-4">
                    {error}
                  </div>
                )}
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nombre</Label>
                    <Input
                      id="name"
                      name="name"
                      placeholder="Tu nombre"
                      value={formData.name}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email">Correo electrónico</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="tu@email.com"
                      value={formData.email}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="subject">Asunto</Label>
                  <Input
                    id="subject"
                    name="subject"
                    placeholder="¿Sobre qué quieres escribirnos?"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="message">Mensaje</Label>
                  <Textarea
                    id="message"
                    name="message"
                    placeholder="Escribe tu mensaje aquí..."
                    rows={6}
                    value={formData.message}
                    onChange={handleChange}
                    required
                  />
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full bg-indec-blue text-white hover:bg-indec-blue-dark"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    'Enviar mensaje'
                  )}
                </Button>
              </form>
            )}
          </CardContent>
          <CardFooter className="flex flex-col space-y-4 items-center justify-center border-t border-indec-gray-medium/20 pt-6">
            <div className="text-center text-sm text-indec-gray-dark">
              <p className="mb-2">También puedes contactarnos directamente:</p>
              <p className="font-medium">info@argenstats.com</p>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}