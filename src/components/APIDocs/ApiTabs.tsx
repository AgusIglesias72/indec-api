// src/components/APIDocs/ApiTabs.tsx
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ApiSection from '@/components/APIDocs/ApiSection';
import { ApiGroup } from '@/data/api-endpoints';

interface ApiTabsProps {
  baseUrl: string;
  apiGroups: ApiGroup[];
  defaultTab?: string;
}

export default function ApiTabs({ baseUrl, apiGroups, defaultTab }: ApiTabsProps) {
  // Usar el primer grupo como predeterminado si no se especifica
  const effectiveDefaultTab = defaultTab || (apiGroups.length > 0 ? apiGroups[0].id : '');

  return (
    <Tabs defaultValue={effectiveDefaultTab} className="bg-transparent relative">
      <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 lg:grid-cols-6">
        {apiGroups.map(group => (
          <TabsTrigger key={group.id} value={group.id}>
            {group.title.replace('API de ', '')}
          </TabsTrigger>
        ))}
      </TabsList>

      {apiGroups.map(group => (
        <TabsContent key={group.id} value={group.id}>
          <ApiSection 
            title={group.title}
            description={group.description}
            baseUrl={baseUrl}
            endpoints={group.endpoints}
          />
        </TabsContent>
      ))}
    </Tabs>
  );
}