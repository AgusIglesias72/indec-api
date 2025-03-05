import EndpointCard from './EndpointCard';

interface Parameter {
  name: string;
  type: string;
  required: boolean;
  description: string;
}

interface Endpoint {
  method: string;
  path: string;
  description: string;
  parameters: Parameter[];
  responseExample: string;
}

interface ApiSectionProps {
  title: string;
  description: string;
  baseUrl: string;
  endpoints: Endpoint[];
}

export default function ApiSection({ title, description, baseUrl, endpoints }: ApiSectionProps) {
  return (
    <div className="space-y-8 py-4">
      <div>
        <h2 className="text-2xl font-bold">{title}</h2>
        <p className="text-gray-600 mt-2">{description}</p>
      </div>
      
      <div className="space-y-6">
        {endpoints.map((endpoint, index) => (
          <EndpointCard 
            key={index}
            endpoint={endpoint}
            baseUrl={baseUrl}
          />
        ))}
      </div>
    </div>
  );
}