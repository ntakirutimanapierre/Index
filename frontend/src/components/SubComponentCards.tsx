import React from 'react';
import { BookOpen, Wifi, DollarSign } from 'lucide-react';
import type { CountryData } from '../types';

interface SubComponentCardsProps {
  data: CountryData[];
}

export const SubComponentCards: React.FC<SubComponentCardsProps> = ({ data }) => {
  const calculateAverage = (key: keyof CountryData) => {
    return data.reduce((sum, country) => sum + (country[key] as number), 0) / data.length;
  };

  const getTopCountry = (key: keyof CountryData) => {
    return data.reduce((prev, current) => 
      (prev[key] as number) > (current[key] as number) ? prev : current
    );
  };

  const components = [
    {
      title: 'Literacy Rate',
      key: 'literacyRate' as keyof CountryData,
      icon: BookOpen,
      color: 'bg-blue-500',
      description: 'Financial literacy and education levels across African countries'
    },
    {
      title: 'Digital Infrastructure',
      key: 'digitalInfrastructure' as keyof CountryData,
      icon: Wifi,
      color: 'bg-green-500',
      description: 'Internet connectivity, mobile penetration, and digital infrastructure'
    },
    {
      title: 'Investment',
      key: 'investment' as keyof CountryData,
      icon: DollarSign,
      color: 'bg-purple-500',
      description: 'Foreign and domestic investment in fintech sector'
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
      {components.map((component) => {
        const average = calculateAverage(component.key);
        const topCountry = getTopCountry(component.key);
        
        return (
          <div key={component.title} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 min-w-[220px] max-w-md hover:shadow-md transition">
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 ${component.color} rounded-lg flex items-center justify-center`}>
                <component.icon className="w-6 h-6 text-white" />
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-gray-900">{average.toFixed(1)}</p>
                <p className="text-sm text-gray-500">Average Score</p>
              </div>
            </div>
            
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{component.title}</h3>
            <p className="text-sm text-gray-600 mb-4">{component.description}</p>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Top Performer:</span>
                <span className="text-sm font-medium text-gray-900">{topCountry.name}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Score:</span>
                <span className="text-sm font-medium text-gray-900">
                  {(topCountry[component.key] as number).toFixed(1)}
                </span>
              </div>
              
              {/* Progress bar */}
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${component.color}`}
                  style={{ width: `${average}%` }}
                ></div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};