import { inflationCalculatorMetadata } from '@/lib/metadata';
import InflationCalculatorLanding from './InflationCalculatorLanding';
import StructuredData from '@/components/StructuredData';
import { InflationCalculatorWebAppSchema, InflationCalculatorFAQSchema, BreadcrumbSchema } from '@/components/StructuredData';

export const metadata = inflationCalculatorMetadata;

export default function CalculadoraInflacionPage() {
  // Breadcrumb for better SEO navigation
  const breadcrumbItems = [
    { name: 'Inicio', url: 'https://argenstats.com' },
    { name: 'Calculadora de Inflación', url: 'https://argenstats.com/calculadora-inflacion' }
  ];

  return (
    <>
      {/* Enhanced structured data for inflation calculator */}
      <StructuredData data={InflationCalculatorWebAppSchema} id="inflation-calculator-webapp" />
      <StructuredData data={InflationCalculatorFAQSchema} id="inflation-calculator-faq" />
      <StructuredData data={BreadcrumbSchema(breadcrumbItems)} id="inflation-calculator-breadcrumb" />
      
      <InflationCalculatorLanding />
    </>
  );
}