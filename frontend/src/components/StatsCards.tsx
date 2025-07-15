import React from 'react';
import { TrendingUp, Globe, Award, Activity, Building2, BarChart3 } from 'lucide-react';
import { DashboardStats } from '../types';

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
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-8">
      {cards.map((card, index) => (
        <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">{card.title}</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{card.value}</p>
              {card.change && (
                <p className={`text-sm mt-1 ${card.change > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {card.change > 0 ? '+' : ''}{card.change}% from last year
                </p>
              )}
            </div>
            <div className={`w-12 h-12 ${card.color} rounded-lg flex items-center justify-center`}>
              <card.icon className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};