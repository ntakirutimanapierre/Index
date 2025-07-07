import React from 'react';
import { Database, Trash2, Info, Calendar, User, Hash } from 'lucide-react';

interface DataManagementProps {
  getDataInfo: () => any;
  clearData: () => void;
  isAuthenticated: boolean;
}

export const DataManagement: React.FC<DataManagementProps> = ({ 
  getDataInfo, 
  clearData, 
  isAuthenticated 
}) => {
  const dataInfo = getDataInfo();

  if (!isAuthenticated) {
    return null;
  }

  const handleClearData = () => {
    if (window.confirm('Are you sure you want to clear all stored data? This action cannot be undone.')) {
      clearData();
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <Database className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">Data Management</h3>
        </div>
        <button
          onClick={handleClearData}
          className="flex items-center space-x-2 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
        >
          <Trash2 className="w-4 h-4" />
          <span>Clear All Data</span>
        </button>
      </div>

      {dataInfo ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <Calendar className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-800">Last Updated</span>
            </div>
            <p className="text-sm text-blue-700">
              {dataInfo.lastUpdated.toLocaleDateString()} at {dataInfo.lastUpdated.toLocaleTimeString()}
            </p>
          </div>

          <div className="bg-green-50 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <User className="w-4 h-4 text-green-600" />
              <span className="text-sm font-medium text-green-800">Updated By</span>
            </div>
            <p className="text-sm text-green-700">{dataInfo.updatedBy || 'Unknown'}</p>
          </div>

          <div className="bg-purple-50 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <Hash className="w-4 h-4 text-purple-600" />
              <span className="text-sm font-medium text-purple-800">Total Records</span>
            </div>
            <p className="text-sm text-purple-700">{dataInfo.recordCount}</p>
          </div>

          <div className="bg-yellow-50 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <Info className="w-4 h-4 text-yellow-600" />
              <span className="text-sm font-medium text-yellow-800">Available Years</span>
            </div>
            <p className="text-sm text-yellow-700">{dataInfo.years.join(', ')}</p>
          </div>
        </div>
      ) : (
        <div className="text-center py-8">
          <Database className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No stored data information available</p>
        </div>
      )}

      <div className="mt-4 p-4 bg-gray-50 rounded-lg">
        <h4 className="text-sm font-medium text-gray-900 mb-2">Data Persistence Info:</h4>
        <div className="text-xs text-gray-600 space-y-1">
          <p>• Data is automatically saved to browser storage when uploaded</p>
          <p>• Data persists across browser sessions for up to 30 days</p>
          <p>• Only authenticated admins can modify data</p>
          <p>• All data changes are tracked with timestamps and user info</p>
        </div>
      </div>
    </div>
  );
};