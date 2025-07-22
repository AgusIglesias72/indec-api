import { dollarConverterMetadata } from '@/lib/metadata';
import DollarConverterLanding from './DollarConverterLanding';
import StructuredData from '@/components/StructuredData';
import { DollarConverterWebAppSchema, DollarConverterFAQSchema, BreadcrumbSchema } from '@/components/StructuredData';

export const metadata = dollarConverterMetadata;

export default function ConversorDolarPage() {
  // Breadcrumb for better SEO navigation
  const breadcrumbItems = [
    { name: 'Inicio', url: 'https://argenstats.com' },
    { name: 'Conversor USD/ARS', url: 'https://argenstats.com/conversor-dolar-peso-argentino' }
  ];

  return (
    <>
      {/* Enhanced structured data for dollar converter */}
      <StructuredData data={DollarConverterWebAppSchema} id="converter-webapp" />
      <StructuredData data={DollarConverterFAQSchema} id="converter-faq" />
      <StructuredData data={BreadcrumbSchema(breadcrumbItems)} id="converter-breadcrumb" />
      
      <DollarConverterLanding />
    </>
  );
}