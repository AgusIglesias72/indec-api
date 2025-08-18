// src/components/server/PageHero.tsx (Server Component)
import { LucideIcon } from 'lucide-react';

interface PageHeroProps {
  title: string;
  subtitle: string;
  icon: LucideIcon;
  bgColor?: string;
  iconColor?: string;
}

export default function PageHero({ 
  title, 
  subtitle, 
  icon: Icon, 
  bgColor = "from-blue-50 to-blue-100",
  iconColor = "bg-blue-500"
}: PageHeroProps) {
  return (
    <div className={`relative bg-gradient-to-br ${bgColor} py-16 mb-8`}>
      <div className="container mx-auto px-4 text-center relative z-10">
        <div className="inline-flex items-center gap-3 mb-4">
          <div className={`h-12 w-12 ${iconColor} rounded-xl flex items-center justify-center`}>
            <Icon className="h-6 w-6 text-white" />
          </div>
        </div>
        <h1 className="text-4xl font-bold text-gray-900 mb-4">{title}</h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">{subtitle}</p>
      </div>
    </div>
  );
}