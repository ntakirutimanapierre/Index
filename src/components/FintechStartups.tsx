import React, { useState } from 'react';
import { Plus, Building2, Globe, Calendar, User, Search, Filter } from 'lucide-react';
import { FintechStartup } from '../types';

interface FintechStartupsProps {
  currentUser: any;
}

export const FintechStartups: React.FC<FintechStartupsProps> = ({ currentUser }) => {
  const [startups, setStartups] = useState<FintechStartup[]>([
    {
      id: '1',
      name: 'Flutterwave',
      country: 'Nigeria',
      sector: 'Payments',
      foundedYear: 2016,
      description: 'Payment infrastructure for global merchants and payment service providers',
      website: 'https://flutterwave.com',
      addedBy: 'admin',
      addedAt: Date.now() - 86400000
    },
    {
      id: '2',
      name: 'M-Pesa',
      country: 'Kenya',
      sector: 'Mobile Money',
      foundedYear: 2007,
      description: 'Mobile phone-based money transfer, financing and microfinancing service',
      addedBy: 'user1',
      addedAt: Date.now() - 172800000
    }
  ]);

  const [showAddForm, setShowAddForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('');
  const [selectedSector, setSelectedSector] = useState('');
  
  const [newStartup, setNewStartup] = useState({
    name: '',
    country: '',
    sector: '',
    foundedYear: new Date().getFullYear(),
    description: '',
    website: ''
  });

  const countries = ['Nigeria', 'Kenya', 'South Africa', 'Egypt', 'Ghana', 'Morocco', 'Ethiopia', 'Tanzania'];
  const sectors = ['Payments', 'Mobile Money', 'Lending', 'Insurance', 'Investment', 'Banking', 'Blockchain', 'RegTech'];

  const handleAddStartup = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentUser) {
      alert('Please sign in to add startups');
      return;
    }

    const startup: FintechStartup = {
      id: Date.now().toString(),
      ...newStartup,
      addedBy: currentUser.email,
      addedAt: Date.now()
    };

    setStartups([startup, ...startups]);
    setNewStartup({
      name: '',
      country: '',
      sector: '',
      foundedYear: new Date().getFullYear(),
      description: '',
      website: ''
    });
    setShowAddForm(false);
  };

  const filteredStartups = startups.filter(startup => {
    const matchesSearch = startup.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         startup.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCountry = !selectedCountry || startup.country === selectedCountry;
    const matchesSector = !selectedSector || startup.sector === selectedSector;
    
    return matchesSearch && matchesCountry && matchesSector;
  });

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
            <Building2 className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Fintech Startups</h2>
            <p className="text-sm text-gray-600">Discover and add fintech companies across Africa</p>
          </div>
        </div>

        {currentUser && (
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add Startup</span>
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search startups..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        </div>

        <select
          value={selectedCountry}
          onChange={(e) => setSelectedCountry(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
        >
          <option value="">All Countries</option>
          {countries.map(country => (
            <option key={country} value={country}>{country}</option>
          ))}
        </select>

        <select
          value={selectedSector}
          onChange={(e) => setSelectedSector(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
        >
          <option value="">All Sectors</option>
          {sectors.map(sector => (
            <option key={sector} value={sector}>{sector}</option>
          ))}
        </select>
      </div>

      {/* Add Startup Form */}
      {showAddForm && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Add New Fintech Startup</h3>
          <form onSubmit={handleAddStartup} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Startup Name"
              value={newStartup.name}
              onChange={(e) => setNewStartup({ ...newStartup, name: e.target.value })}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              required
            />

            <select
              value={newStartup.country}
              onChange={(e) => setNewStartup({ ...newStartup, country: e.target.value })}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              required
            >
              <option value="">Select Country</option>
              {countries.map(country => (
                <option key={country} value={country}>{country}</option>
              ))}
            </select>

            <select
              value={newStartup.sector}
              onChange={(e) => setNewStartup({ ...newStartup, sector: e.target.value })}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              required
            >
              <option value="">Select Sector</option>
              {sectors.map(sector => (
                <option key={sector} value={sector}>{sector}</option>
              ))}
            </select>

            <input
              type="number"
              placeholder="Founded Year"
              value={newStartup.foundedYear}
              onChange={(e) => setNewStartup({ ...newStartup, foundedYear: parseInt(e.target.value) })}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              min="1990"
              max={new Date().getFullYear()}
              required
            />

            <input
              type="url"
              placeholder="Website (optional)"
              value={newStartup.website}
              onChange={(e) => setNewStartup({ ...newStartup, website: e.target.value })}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent md:col-span-2"
            />

            <textarea
              placeholder="Description"
              value={newStartup.description}
              onChange={(e) => setNewStartup({ ...newStartup, description: e.target.value })}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent md:col-span-2"
              rows={3}
              required
            />

            <div className="md:col-span-2 flex space-x-3">
              <button
                type="submit"
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Add Startup
              </button>
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Startups Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredStartups.map((startup) => (
          <div key={startup.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-3">
              <h3 className="text-lg font-semibold text-gray-900">{startup.name}</h3>
              <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                {startup.sector}
              </span>
            </div>

            <p className="text-sm text-gray-600 mb-3 line-clamp-2">{startup.description}</p>

            <div className="space-y-2 text-sm text-gray-500">
              <div className="flex items-center space-x-2">
                <Globe className="w-4 h-4" />
                <span>{startup.country}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4" />
                <span>Founded {startup.foundedYear}</span>
              </div>
              <div className="flex items-center space-x-2">
                <User className="w-4 h-4" />
                <span>Added by {startup.addedBy}</span>
              </div>
            </div>

            {startup.website && (
              <a
                href={startup.website}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block mt-3 text-green-600 hover:text-green-700 text-sm font-medium"
              >
                Visit Website →
              </a>
            )}
          </div>
        ))}
      </div>

      {filteredStartups.length === 0 && (
        <div className="text-center py-12">
          <Building2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No startups found matching your criteria</p>
          {currentUser && (
            <button
              onClick={() => setShowAddForm(true)}
              className="mt-2 text-green-600 hover:text-green-700 font-medium"
            >
              Add the first startup
            </button>
          )}
        </div>
      )}
    </div>
  );
};