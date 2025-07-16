import React, { useState } from 'react';
import { CountryTable } from '../components/CountryTable';
import { AfricaMapComplete } from '../components/AfricaMapComplete';
import { mockCountryData, availableYears } from '../data/mockData';
import { getLocalShapefilePath } from '../utils/shapefileProcessor';
import type { CountryData } from '../types';

const CountriesPage: React.FC<{ selectedYear: number; onYearChange: (year: number) => void }> = ({ selectedYear, onYearChange }) => {
  const [hoveredCountry, setHoveredCountry] = useState<CountryData | null>(null);
  const currentData = mockCountryData.filter(country => country.year === selectedYear);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex flex-col">
      <main className="flex-1 px-4 sm:px-8 lg:px-16 py-10 space-y-10">
        <h1 className="text-2xl font-bold mb-4">Countries</h1>
        <div className="mb-4">
          <label className="mr-2 font-medium">Year:</label>
          <select
            value={selectedYear}
            onChange={e => onYearChange(Number(e.target.value))}
            className="border rounded px-2 py-1"
          >
            {availableYears.map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>
        {/* Responsive flex row for map and table */}
        <div className="mb-8 w-full flex flex-col lg:flex-row gap-8 px-2 sm:px-4 lg:px-8">
          <div className="w-full lg:w-1/2">
            <AfricaMapComplete
              data={currentData}
              shapefilePath={getLocalShapefilePath()}
              width={800}
              height={600}
              hoveredCountry={hoveredCountry}
              onCountryHover={setHoveredCountry}
            />
          </div>
          <div className="w-full lg:w-1/2">
            <CountryTable data={currentData} />
          </div>
        </div>
      </main>
    </div>
  );
};

export default CountriesPage; 