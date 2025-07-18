import React from 'react';
import { TrendingUp, Globe, Award, Activity, Building2, BarChart3 } from 'lucide-react';
import type { DashboardStats } from '../types';

interface StatsCardsProps {
  stats: DashboardStats;
}

export const StatsCards: React.FC<StatsCardsProps> = ({ stats }) => {
  const cards = [
    {
      title: 'Total Countries',
      value: stats.totalCountries.toString(),
      icon: Globe,
      color: 'bg-blue-500',
      change: null
    },
    {
      title: 'Average Index Score',
      value: stats.averageScore.toFixed(1),
      icon: Activity,
      color: 'bg-green-500',
      change: stats.yearOverYearChange
    },
    {
      title: 'Top Performer',
      value: stats.topPerformer,
      icon: Award,
      color: 'bg-yellow-500',
      change: null
    },
    {
      title: 'Total Fintech Companies',
      value: stats.totalFintechCompanies.toString(),
      icon: Building2,
      color: 'bg-purple-500',
      change: null
    },
    {
      title: 'Avg Companies/Country',
      value: stats.averageFintechCompanies.toFixed(0),
      icon: BarChart3,
      color: 'bg-indigo-500',
      change: null
    },
    {
      title: 'YoY Change',
      value: `+${stats.yearOverYearChange}%`,
      icon: TrendingUp,
      color: 'bg-emerald-500',
      change: stats.yearOverYearChange
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4 sm:gap-6 mb-8 mt-8">
      {cards.map((card, index) => (
        <div key={index} className="group bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-lg border border-gray-100 p-4 sm:p-6 hover:shadow-2xl hover:scale-105 transition-all duration-300 text-left flex flex-col justify-between items-start backdrop-blur-sm relative overflow-hidden">
          {/* Background gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 via-transparent to-purple-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          
          {/* Animated border */}
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-500 opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
          
          <div className="flex items-center justify-between w-full relative z-10">
            <div className="flex-1 min-w-0">
              <p className="text-xs sm:text-sm font-semibold text-gray-600 group-hover:text-gray-800 transition-colors truncate">{card.title}</p>
              <p className="text-2xl sm:text-3xl font-black text-gray-900 mt-1 group-hover:text-blue-600 transition-colors bg-gradient-to-r from-gray-900 to-blue-600 bg-clip-text text-transparent">{card.value}</p>
              {card.change && (
                <p className={`text-xs sm:text-sm mt-1 font-medium ${card.change > 0 ? 'text-green-600' : 'text-red-600'} group-hover:scale-105 transition-transform`}>
                  {card.change > 0 ? '+' : ''}{card.change}% from last year
                </p>
              )}
            </div>
            <div className={`w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 ${card.color} rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all duration-300 relative overflow-hidden flex-shrink-0 ml-3`}>
              <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent"></div>
              <card.icon className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 text-white relative z-10 group-hover:rotate-12 transition-transform duration-300" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};