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
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 mb-8">
      {components.map((component) => {
        const average = calculateAverage(component.key);
        const topCountry = getTopCountry(component.key);
        
        return (
          <div key={component.title} className="group bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-lg border border-gray-100 p-4 sm:p-6 hover:shadow-2xl hover:scale-105 transition-all duration-300 backdrop-blur-sm relative overflow-hidden">
            {/* Background gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50/30 via-transparent to-purple-50/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            
            {/* Animated border */}
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-500 opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
            
            <div className="flex items-center justify-between mb-4 relative z-10">
              <div className={`w-10 h-10 sm:w-12 sm:h-12 ${component.color} rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all duration-300 relative overflow-hidden flex-shrink-0`}>
                <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent"></div>
                <component.icon className="w-5 h-5 sm:w-6 sm:h-6 text-white relative z-10 group-hover:rotate-12 transition-transform duration-300" />
              </div>
              <div className="text-right flex-1 min-w-0 ml-3">
                <p className="text-xl sm:text-2xl font-black text-gray-900 group-hover:text-blue-600 transition-colors bg-gradient-to-r from-gray-900 to-blue-600 bg-clip-text text-transparent">{average.toFixed(1)}</p>
                <p className="text-xs sm:text-sm text-gray-500 font-medium">Average Score</p>
              </div>
            </div>
            
            <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-2 group-hover:text-blue-700 transition-colors">{component.title}</h3>
            <p className="text-xs sm:text-sm text-gray-600 mb-4 leading-relaxed">{component.description}</p>
            
            <div className="space-y-3 relative z-10">
              <div className="flex justify-between items-center">
                <span className="text-xs sm:text-sm text-gray-600 font-medium">Top Performer:</span>
                <span className="text-xs sm:text-sm font-bold text-gray-900 group-hover:text-blue-600 transition-colors truncate ml-2">{topCountry.name}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs sm:text-sm text-gray-600 font-medium">Score:</span>
                <span className="text-xs sm:text-sm font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                  {(topCountry[component.key] as number).toFixed(1)}
                </span>
              </div>
              
              {/* Enhanced Progress bar */}
              <div className="w-full bg-gray-200 rounded-full h-2 sm:h-3 overflow-hidden">
                <div
                  className={`h-2 sm:h-3 rounded-full ${component.color} bg-gradient-to-r from-${component.color.replace('bg-', '')} to-${component.color.replace('bg-', '')}-600 shadow-lg group-hover:shadow-xl transition-all duration-300`}
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