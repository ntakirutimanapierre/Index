import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { Footer } from './Footer';
import { StatsCards } from './StatsCards';
import { AfricaMap } from './AfricaMap';
import { AfricaMapComplete } from './AfricaMapComplete';
import { SubComponentCards } from './SubComponentCards';
import { CountryTable } from './CountryTable';
import { FileUpload } from './FileUpload';
import { DataManagement } from './DataManagement';
import { AuthModal } from './AuthModal';
import { FinanceNews } from './FinanceNews';
import { InteractiveChart } from './InteractiveChart';
import { FintechStartups } from './FintechStartups';
import { mockCountryData, calculateDashboardStats, availableYears } from '../data/mockData';
import { useDataPersistence } from '../hooks/useDataPersistence';
import type { CountryData } from '../types';
import { getLocalShapefilePath } from '../utils/shapefileProcessor';

const Dashboard = () => {
  const [selectedYear, setSelectedYear] = useState(availableYears[0]);
  const [hoveredCountry, setHoveredCountry] = useState<CountryData | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [useNewMap, setUseNewMap] = useState(true);

  const { data: countryData, isLoading, updateData, clearData, getDataInfo } = useDataPersistence(mockCountryData);
  const currentData = countryData.filter(country => country.year === selectedYear);
  const currentStats = calculateDashboardStats(currentData);

  const handleDataUpdate = (newData: CountryData[]) => {
    if (currentUser?.role !== 'admin') {
      alert('Admin authentication required to update data');
      return;
    }
    updateData(newData);
  };

  const handleAuthSuccess = (user: any) => setCurrentUser(user);
  const handleLogout = () => setCurrentUser(null);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading fintech data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex">
      <Sidebar
        currentUser={currentUser}
        onSignIn={() => setShowAuthModal(true)}
        onSignOut={handleLogout}
      />
      <div className="flex-1 ml-64 flex flex-col min-h-screen">
        <Header 
          selectedYear={selectedYear}
          onYearChange={setSelectedYear}
          availableYears={availableYears}
          currentUser={currentUser}
          onAuthClick={() => setShowAuthModal(true)}
          onLogout={handleLogout}
        />
        <main className="flex-1 px-4 sm:px-8 lg:px-16 py-10 space-y-10">
          {/* Stats Overview */}
          <StatsCards stats={currentStats} />
          {/* Map Type Toggle */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col md:flex-row md:items-center md:space-x-6 space-y-2 md:space-y-0">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={useNewMap}
                onChange={(e) => setUseNewMap(e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-gray-700">
                Use Enhanced Map (with shapefile support)
              </span>
            </label>
            {useNewMap && (
              <div className="text-sm text-gray-600">
                Shapefile: <code className="bg-gray-100 px-2 py-1 rounded">src/data/ne_110m_admin_0_countries.shp</code>
              </div>
            )}
            <div className="text-sm text-gray-600 md:ml-auto">
              <strong>Status:</strong> {useNewMap 
                ? 'Using enhanced map with shapefile data support' 
                : 'Using original simplified map'}
            </div>
          </div>
          {/* Admin Data Management */}
          {currentUser?.role === 'admin' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <DataManagement 
                getDataInfo={getDataInfo}
                clearData={clearData}
                isAuthenticated={true}
              />
              <FileUpload 
                onDataUpdate={handleDataUpdate}
                currentYear={selectedYear}
              />
            </div>
          )}
          {/* Sub-component Cards */}
          <SubComponentCards data={currentData} />
          {/* Interactive Analytics */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <InteractiveChart 
              data={currentData} 
              allYearsData={countryData} 
              selectedYear={selectedYear}
            />
          </div>
          {/* Main Content Grid - Map and News */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 h-[600px] bg-white rounded-xl shadow-sm border border-gray-200 p-4">
              {useNewMap ? (
                <AfricaMapComplete 
                  data={currentData}
                  onCountryHover={setHoveredCountry}
                  hoveredCountry={hoveredCountry}
                  shapefilePath={getLocalShapefilePath()}
                  width={800}
                  height={600}
                />
              ) : (
                <AfricaMap 
                  data={currentData}
                  onCountryHover={setHoveredCountry}
                  hoveredCountry={hoveredCountry}
                />
              )}
            </div>
            <div className="lg:col-span-1 h-[600px] bg-white rounded-xl shadow-sm border border-gray-200 p-4">
              <FinanceNews />
            </div>
          </div>
          {/* Fintech Startups */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <FintechStartups currentUser={currentUser} />
          </div>
          {/* Country Rankings Table */}
          {currentData.length > 0 ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <CountryTable data={currentData} />
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
              <div className="text-gray-400 mb-4">
                <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Data Available</h3>
              <p className="text-gray-600 mb-4">
                {currentUser?.role === 'admin' 
                  ? `Upload a CSV or Excel file to see country rankings for ${selectedYear}`
                  : `Admin login required to upload data for ${selectedYear}`}
              </p>
              <p className="text-sm text-gray-500">Make sure to include year and fintech companies data in your file</p>
            </div>
          )}
        </main>
        <Footer />
        <AuthModal
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          onAuthSuccess={handleAuthSuccess}
          currentUser={currentUser}
        />
      </div>
    </div>
  );
};

export default Dashboard; 