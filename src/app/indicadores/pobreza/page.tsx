import { Metadata } from 'next';
import { 
  povertyIndicatorsMetadata, 
  PovertyIndicatorsWebAppSchema, 
  PovertyIndicatorsDatasetSchema, 
  PovertyIndicatorsFAQSchema, 
  PovertyIndicatorsBreadcrumbSchema 
} from './metadata';
import StructuredData from '@/components/StructuredData';
import ModernPovertyPageClient from './components/ModernPovertyPageClient';

export const metadata: Metadata = povertyIndicatorsMetadata;

export default function PovertyIndicatorsPage() {
  return (
    <>
      {/* Enhanced structured data for poverty indicators dashboard */}
      <StructuredData data={PovertyIndicatorsWebAppSchema} id="poverty-indicators-webapp" />
      <StructuredData data={PovertyIndicatorsDatasetSchema} id="poverty-indicators-dataset" />
      <StructuredData data={PovertyIndicatorsFAQSchema} id="poverty-indicators-faq" />
      <StructuredData data={PovertyIndicatorsBreadcrumbSchema} id="poverty-indicators-breadcrumb" />
      
      <ModernPovertyPageClient />
    </>
  );
}
