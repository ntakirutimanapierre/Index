import React, { useRef, useState } from 'react';
import { Upload, FileSpreadsheet, AlertCircle, CheckCircle, X, RefreshCw } from 'lucide-react';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import { CountryData } from '../types';

interface FileUploadProps {
  onDataUpdate: (data: CountryData[]) => void;
  currentYear: number;
}

interface UploadStatus {
  type: 'idle' | 'processing' | 'success' | 'error';
  message: string;
  details?: string[];
}

export const FileUpload: React.FC<FileUploadProps> = ({ onDataUpdate, currentYear }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<UploadStatus>({ type: 'idle', message: '' });

  const validateData = (data: any[]): { isValid: boolean; errors: string[]; validData: CountryData[] } => {
    const errors: string[] = [];
    const validData: CountryData[] = [];
    const requiredFields = ['name', 'literacyRate', 'digitalInfrastructure', 'investment'];

    if (data.length === 0) {
      errors.push('File is empty or has no valid data rows');
      return { isValid: false, errors, validData };
    }

    data.forEach((row, index) => {
      const rowNumber = index + 1;
      const missingFields: string[] = [];

      // Check for required fields
      requiredFields.forEach(field => {
        if (!row[field] && row[field] !== 0) {
          missingFields.push(field);
        }
      });

      if (missingFields.length > 0) {
        errors.push(`Row ${rowNumber}: Missing required fields: ${missingFields.join(', ')}`);
        return;
      }

      // Validate numeric fields
      const numericFields = ['literacyRate', 'digitalInfrastructure', 'investment'];
      const invalidNumeric: string[] = [];

      numericFields.forEach(field => {
        const value = parseFloat(row[field]);
        if (isNaN(value) || value < 0 || value > 100) {
          invalidNumeric.push(field);
        }
      });

      if (invalidNumeric.length > 0) {
        errors.push(`Row ${rowNumber}: Invalid numeric values (must be 0-100): ${invalidNumeric.join(', ')}`);
        return;
      }

      // Validate year if provided
      const dataYear = row.year ? parseInt(row.year) : currentYear;
      if (row.year && (isNaN(dataYear) || dataYear < 2000 || dataYear > 2030)) {
        errors.push(`Row ${rowNumber}: Invalid year (must be between 2000-2030)`);
        return;
      }

      // Validate fintech companies if provided
      if (row.fintechCompanies && (isNaN(parseInt(row.fintechCompanies)) || parseInt(row.fintechCompanies) < 0)) {
        errors.push(`Row ${rowNumber}: Invalid fintech companies count (must be a positive number)`);
        return;
      }

      // Create country data object
      const countryData: CountryData = {
        id: row.id || row.name.substring(0, 2).toUpperCase(),
        name: row.name.trim(),
        literacyRate: parseFloat(row.literacyRate),
        digitalInfrastructure: parseFloat(row.digitalInfrastructure),
        investment: parseFloat(row.investment),
        finalScore: 0, // Will be calculated
        year: dataYear,
        population: row.population ? parseInt(row.population) : undefined,
        gdp: row.gdp ? parseFloat(row.gdp) : undefined,
        fintechCompanies: row.fintechCompanies ? parseInt(row.fintechCompanies) : undefined
      };

      // Calculate final score (average of the three components)
      countryData.finalScore = (
        countryData.literacyRate + 
        countryData.digitalInfrastructure + 
        countryData.investment
      ) / 3;

      validData.push(countryData);
    });

    return { isValid: errors.length === 0, errors, validData };
  };

  const processFile = async (file: File) => {
    setUploadStatus({ type: 'processing', message: 'Processing file...' });

    try {
      const fileExtension = file.name.split('.').pop()?.toLowerCase();
      let parsedData: any[] = [];

      if (fileExtension === 'csv') {
        // Parse CSV file
        Papa.parse(file, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => {
            parsedData = results.data;
            handleParsedData(parsedData);
          },
          error: (error) => {
            setUploadStatus({
              type: 'error',
              message: 'Failed to parse CSV file',
              details: [error.message]
            });
          }
        });
      } else if (fileExtension === 'xlsx' || fileExtension === 'xls') {
        // Parse Excel file
        const arrayBuffer = await file.arrayBuffer();
        const workbook = XLSX.read(arrayBuffer, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        parsedData = XLSX.utils.sheet_to_json(worksheet);
        handleParsedData(parsedData);
      } else {
        setUploadStatus({
          type: 'error',
          message: 'Unsupported file format',
          details: ['Please upload a CSV or Excel (.xlsx, .xls) file']
        });
      }
    } catch (error) {
      setUploadStatus({
        type: 'error',
        message: 'Failed to process file',
        details: [error instanceof Error ? error.message : 'Unknown error occurred']
      });
    }
  };

  const handleParsedData = (data: any[]) => {
    const validation = validateData(data);

    if (validation.isValid) {
      onDataUpdate(validation.validData);
      const totalCompanies = validation.validData.reduce((sum, country) => sum + (country.fintechCompanies || 0), 0);
      const years = [...new Set(validation.validData.map(country => country.year))].sort((a, b) => b - a);
      
      setUploadStatus({
        type: 'success',
        message: `Successfully imported ${validation.validData.length} countries`,
        details: [
          `Dataset completely overwritten with new data`,
          `Years included: ${years.join(', ')}`,
          `Total fintech companies: ${totalCompanies}`,
          `All previous data has been replaced`
        ]
      });
    } else {
      setUploadStatus({
        type: 'error',
        message: 'Data validation failed',
        details: validation.errors
      });
    }
  };

  const handleFileSelect = (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const file = files[0];
    const maxSize = 10 * 1024 * 1024; // 10MB

    if (file.size > maxSize) {
      setUploadStatus({
        type: 'error',
        message: 'File too large',
        details: ['Please upload a file smaller than 10MB']
      });
      return;
    }

    processFile(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const resetUploadStatus = () => {
    setUploadStatus({ type: 'idle', message: '' });
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Upload Data</h3>
        <div className="flex items-center space-x-2">
          <RefreshCw className="w-4 h-4 text-orange-500" />
          <span className="text-sm text-orange-600 font-medium">Overwrites Existing Data</span>
        </div>
      </div>

      <div className="mb-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
        <div className="flex items-start space-x-2">
          <AlertCircle className="w-4 h-4 text-orange-600 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-orange-700">
            <p className="font-medium">Important: Dataset Overwrite</p>
            <p>Uploading a new file will completely replace all existing data. This action cannot be undone.</p>
          </div>
        </div>
      </div>

      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          isDragOver
            ? 'border-blue-400 bg-blue-50'
            : 'border-gray-300 hover:border-gray-400'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p className="text-lg font-medium text-gray-900 mb-2">
          Upload your fintech data
        </p>
        <p className="text-sm text-gray-600 mb-4">
          Drag and drop your CSV or Excel file here, or click to browse
        </p>
        
        <button
          onClick={() => fileInputRef.current?.click()}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          disabled={uploadStatus.type === 'processing'}
        >
          {uploadStatus.type === 'processing' ? 'Processing...' : 'Choose File'}
        </button>

        <input
          ref={fileInputRef}
          type="file"
          accept=".csv,.xlsx,.xls"
          onChange={(e) => handleFileSelect(e.target.files)}
          className="hidden"
        />
      </div>

      {/* File Format Requirements */}
      <div className="mt-4 p-4 bg-gray-50 rounded-lg">
        <h4 className="text-sm font-medium text-gray-900 mb-2">Required Format:</h4>
        <div className="text-xs text-gray-600 space-y-1">
          <p>• <strong>name</strong>: Country name (required)</p>
          <p>• <strong>literacyRate</strong>: Financial literacy rate 0-100 (required)</p>
          <p>• <strong>digitalInfrastructure</strong>: Digital infrastructure score 0-100 (required)</p>
          <p>• <strong>investment</strong>: Investment score 0-100 (required)</p>
          <p>• <strong>year</strong>: Year of data (optional, defaults to current selected year)</p>
          <p>• <strong>fintechCompanies</strong>: Number of fintech companies (optional)</p>
          <p>• <strong>id</strong>: Country code (optional, will auto-generate)</p>
          <p>• <strong>population</strong>: Population count (optional)</p>
          <p>• <strong>gdp</strong>: GDP in billions USD (optional)</p>
        </div>
      </div>

      {/* Upload Status */}
      {uploadStatus.type !== 'idle' && (
        <div className={`mt-4 p-4 rounded-lg ${
          uploadStatus.type === 'success' ? 'bg-green-50 border border-green-200' :
          uploadStatus.type === 'error' ? 'bg-red-50 border border-red-200' :
          'bg-blue-50 border border-blue-200'
        }`}>
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-3">
              {uploadStatus.type === 'success' && <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />}
              {uploadStatus.type === 'error' && <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />}
              {uploadStatus.type === 'processing' && (
                <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mt-0.5"></div>
              )}
              
              <div>
                <p className={`text-sm font-medium ${
                  uploadStatus.type === 'success' ? 'text-green-800' :
                  uploadStatus.type === 'error' ? 'text-red-800' :
                  'text-blue-800'
                }`}>
                  {uploadStatus.message}
                </p>
                
                {uploadStatus.details && uploadStatus.details.length > 0 && (
                  <ul className={`mt-2 text-xs space-y-1 ${
                    uploadStatus.type === 'success' ? 'text-green-700' :
                    uploadStatus.type === 'error' ? 'text-red-700' :
                    'text-blue-700'
                  }`}>
                    {uploadStatus.details.map((detail, index) => (
                      <li key={index}>• {detail}</li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
            
            <button
              onClick={resetUploadStatus}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};