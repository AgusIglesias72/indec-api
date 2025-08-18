// src/components/server/MetricCard.tsx (Server Component)
import { LucideIcon, ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';

interface MetricCardProps {
  title: string;
  mainValue: string | number;
  mainLabel?: string;
  items: Array<{
    label: string;
    value: string | number;
    trend?: 'up' | 'down' | 'neutral';
  }>;
  icon: LucideIcon;
  colorScheme?: 'green' | 'purple' | 'blue' | 'red';
  isLoading?: boolean;
}

function getTrendIcon(trend?: 'up' | 'down' | 'neutral') {
  switch (trend) {
    case 'up': return <ArrowUpRight className="h-4 w-4" />;
    case 'down': return <ArrowDownRight className="h-4 w-4" />;
    default: return <Minus className="h-2 w-2" />;
  }
}

function getTrendColor(trend?: 'up' | 'down' | 'neutral', context: 'variation' | 'general' = 'general') {
  if (context === 'variation') {
    // For variations, up is usually bad (red), down is good (green)
    switch (trend) {
      case 'up': return "text-red-600";
      case 'down': return "text-green-600";
      default: return "text-gray-600";
    }
  }
  
  // For general metrics, up is good (green), down is bad (red)
  switch (trend) {
    case 'up': return "text-green-600";
    case 'down': return "text-red-600";
    default: return "text-gray-600";
  }
}

function getColorClasses(colorScheme: string) {
  const colors = {
    green: {
      gradient: "from-green-600 to-green-400",
      bg: "bg-green-100",
      text: "text-green-600",
      border: "border-green-100",
      hover: "group-hover:text-green-600"
    },
    purple: {
      gradient: "from-purple-600 to-purple-400", 
      bg: "bg-purple-100",
      text: "text-purple-600",
      border: "border-purple-100",
      hover: "group-hover:text-purple-600"
    },
    blue: {
      gradient: "from-blue-600 to-blue-400",
      bg: "bg-blue-100", 
      text: "text-blue-600",
      border: "border-blue-100",
      hover: "group-hover:text-blue-600"
    },
    red: {
      gradient: "from-red-600 to-red-400",
      bg: "bg-red-100",
      text: "text-red-600", 
      border: "border-red-100",
      hover: "group-hover:text-red-600"
    }
  };
  
  return colors[colorScheme as keyof typeof colors] || colors.blue;
}

export default function MetricCard({
  title,
  mainValue,
  mainLabel,
  items,
  icon: Icon,
  colorScheme = 'blue',
  isLoading = false
}: MetricCardProps) {
  const colors = getColorClasses(colorScheme);

  if (isLoading) {
    return (
      <div className="group relative">
        <div className={`absolute -inset-1 bg-gradient-to-r ${colors.gradient} rounded-2xl blur opacity-25`}></div>
        <div className="relative bg-white rounded-2xl p-6 shadow-lg min-h-[320px] flex flex-col">
          <div className="animate-pulse">
            <div className={`h-12 w-12 ${colors.bg} rounded-full mb-4`}></div>
            <div className="h-6 bg-gray-200 rounded mb-4 w-3/4"></div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6"></div>
              <div className="h-4 bg-gray-200 rounded w-4/6"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="group relative">
      <div className={`absolute -inset-1 bg-gradient-to-r ${colors.gradient} rounded-2xl blur opacity-25 group-hover:opacity-75 transition duration-1000 group-hover:duration-200`}></div>
      <div className="relative bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 min-h-[320px] flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <div className={`h-12 w-12 ${colors.bg} rounded-full flex items-center justify-center`}>
            <Icon className={`h-6 w-6 ${colors.text}`} />
          </div>
          <div className="text-right">
            <div className={`text-4xl font-bold text-gray-900 ${colors.hover} transition-colors`}>
              {mainValue}
            </div>
            {mainLabel && (
              <div className="text-sm text-gray-500">{mainLabel}</div>
            )}
          </div>
        </div>
        
        <h3 className="text-lg font-semibold text-gray-800 mb-3">{title}</h3>
        <div className="text-sm text-gray-600 space-y-2 flex-grow">
          {items.map((item, index) => (
            <div key={index} className="flex justify-between items-center">
              <span>{item.label}:</span>
              <span className={`font-medium flex items-center ${getTrendColor(item.trend, item.label.toLowerCase().includes('variaci') ? 'variation' : 'general')}`}>
                {item.trend && getTrendIcon(item.trend)}
                {item.value}
              </span>
            </div>
          ))}
        </div>
        
        <div className={`mt-4 pt-3 border-t ${colors.border}`}>
          <div className={`flex items-center text-xs ${colors.text}`}>
            <div className={`h-2 w-2 rounded-full ${colors.text.replace('text-', 'bg-')} mr-2 animate-pulse`}></div>
            Datos actualizados
          </div>
        </div>
      </div>
    </div>
  );
}