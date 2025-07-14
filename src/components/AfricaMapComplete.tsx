import React, { useEffect, useState, useRef, useCallback } from 'react';
import { CountryData } from '../types';
import {
  processShapefileData,
  matchCountryData,
  coordinatesToPath,
  getCountryColor,
  createSimplifiedMapData,
  type ProcessedGeoData,
  type ShapefileFeature
} from '../utils/shapefileProcessor';

interface AfricaMapProps {
  data: CountryData[];
  onCountryHover: (country: CountryData | null) => void;
  hoveredCountry: CountryData | null;
  shapefilePath?: string;
  width?: number;
  height?: number;
}

// ✅ Inline validation for .geojson/.json paths
function validateShapefilePath(path: string): boolean {
  return path.endsWith('.geojson') || path.endsWith('.json');
}

export const AfricaMapComplete: React.FC<AfricaMapProps> = ({
  data,
  onCountryHover,
  hoveredCountry,
  shapefilePath,
  width = 1000,
  height = 800
}) => {
  const [geoData, setGeoData] = useState<ProcessedGeoData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [countryMap, setCountryMap] = useState<
    Map<string, { feature: ShapefileFeature; data: CountryData | null }>
  >(new Map());
  const svgRef = useRef<SVGSVGElement>(null);

  const loadShapefileData = useCallback(async () => {
    if (!shapefilePath) {
      const simplifiedData = createSimplifiedMapData();
      setGeoData(simplifiedData);
      const map = matchCountryData(simplifiedData.features, data);
      setCountryMap(map);
      return;
    }

    if (!validateShapefilePath(shapefilePath)) {
      setError('Invalid shapefile path');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log('Loading GeoJSON from:', shapefilePath);
      const processedData = await processShapefileData(shapefilePath);
      setGeoData(processedData);

      const map = matchCountryData(processedData.features, data);
      setCountryMap(map);

      setLoading(false);
    } catch (err) {
      setError('Failed to load shapefile data');
      setLoading(false);
      console.error('Error loading shapefile:', err);

      const simplifiedData = createSimplifiedMapData();
      setGeoData(simplifiedData);
      const map = matchCountryData(simplifiedData.features, data);
      setCountryMap(map);
    }
  }, [shapefilePath, data]);

  useEffect(() => {
    loadShapefileData();
  }, [loadShapefileData]);

  const handleCountryClick = useCallback(
    (isoCode: string) => {
      const countryInfo = countryMap.get(isoCode);
      if (countryInfo?.data) {
        onCountryHover(countryInfo.data);
      }
    },
    [countryMap, onCountryHover]
  );

  const handleCountryHover = useCallback(
    (isoCode: string) => {
      const countryInfo = countryMap.get(isoCode);
      onCountryHover(countryInfo?.data || null);
    },
    [countryMap, onCountryHover]
  );

  const renderCountryPath = (feature: ShapefileFeature, isoCode: string) => {
    const countryInfo = countryMap.get(isoCode);
    const color = getCountryColor(countryInfo?.data || null);

    let pathData = '';
    if (feature.geometry.type === 'Polygon') {
      pathData = coordinatesToPath(feature.geometry.coordinates as number[][][]);
    } else if (feature.geometry.type === 'MultiPolygon') {
      const multiCoords = feature.geometry.coordinates as number[][][][];
      pathData = multiCoords.map((polygon) => coordinatesToPath(polygon)).join(' ');
    }

    if (!pathData) return null;

    return (
      <path
        key={isoCode}
        d={pathData}
        fill={color}
        stroke="#fff"
        strokeWidth="1"
        className="cursor-pointer hover:opacity-80 transition-all duration-200"
        onClick={() => handleCountryClick(isoCode)}
        onMouseEnter={() => handleCountryHover(isoCode)}
        onMouseLeave={() => onCountryHover(null)}
      />
    );
  };

  const renderMap = () => {
    if (!geoData) return null;

    return (
      <svg
        ref={svgRef}
        viewBox={`0 0 ${width} ${height}`}
        className="w-full h-full border border-gray-100 rounded-lg"
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="2" dy="2" stdDeviation="3" floodColor="#00000020" />
          </filter>
        </defs>

        {geoData.features.map((feature) => {
          const isoCode = feature.properties.ISO_A2;
          return renderCountryPath(feature, isoCode);
        })}

        {geoData.features.map((feature) => {
          const isoCode = feature.properties.ISO_A2;
          const countryInfo = countryMap.get(isoCode);
          if (!countryInfo?.data) return null;

          const coords = feature.geometry.coordinates;
          let centerX = 0,
            centerY = 0;

          if (feature.geometry.type === 'Polygon' && coords[0]) {
            const points = coords[0] as number[][];
            centerX = points.reduce((sum, p) => sum + p[0], 0) / points.length;
            centerY = points.reduce((sum, p) => sum + p[1], 0) / points.length;
          }

          return (
            <text
              key={`label-${isoCode}`}
              x={centerX}
              y={centerY}
              textAnchor="middle"
              className="text-xs font-medium fill-white pointer-events-none"
            >
              {feature.properties.ADMIN}
            </text>
          );
        })}
      </svg>
    );
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 h-full flex flex-col">
      <div className="p-6 pb-4 flex-shrink-0">
        <h3 className="text-xl font-bold text-gray-900">Africa Fintech Index Map</h3>
        {shapefilePath && (
          <p className="text-sm text-gray-600 mt-1">
            Using shapefile: {shapefilePath}
            {loading && <span className="ml-2 text-blue-600">Loading...</span>}
          </p>
        )}
        {error && <p className="text-sm text-red-600 mt-1">Error: {error}</p>}
      </div>

      <div className="flex-1 px-6 flex flex-col min-h-0">
        <div className="flex-1 min-h-0 mb-4">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-gray-500">Loading map data...</div>
            </div>
          ) : (
            renderMap()
          )}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4 flex-shrink-0">
          <div className="flex items-center space-x-2 p-2 bg-green-50 rounded-lg">
            <div className="w-3 h-3 bg-green-500 rounded"></div>
            <span className="text-xs font-medium text-green-800">High (80+)</span>
          </div>
          <div className="flex items-center space-x-2 p-2 bg-yellow-50 rounded-lg">
            <div className="w-3 h-3 bg-yellow-500 rounded"></div>
            <span className="text-xs font-medium text-yellow-800">Medium (60-79)</span>
          </div>
          <div className="flex items-center space-x-2 p-2 bg-red-50 rounded-lg">
            <div className="w-3 h-3 bg-red-500 rounded"></div>
            <span className="text-xs font-medium text-red-800">Low (40-59)</span>
          </div>
          <div className="flex items-center space-x-2 p-2 bg-gray-50 rounded-lg">
            <div className="w-3 h-3 bg-gray-500 rounded"></div>
            <span className="text-xs font-medium text-gray-800">Very Low (&lt;40)</span>
          </div>
        </div>
      </div>

      {hoveredCountry && (
        <div className="p-6 pt-0 flex-shrink-0">
          <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-lg font-bold text-gray-900">{hoveredCountry.name}</h4>
              <div className="text-2xl font-bold text-blue-600">
                {hoveredCountry.finalScore.toFixed(1)}
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="bg-white p-2 rounded">
                <div className="text-gray-600">Literacy Rate</div>
                <div className="font-semibold text-blue-600">
                  {hoveredCountry.literacyRate.toFixed(1)}%
                </div>
              </div>
              <div className="bg-white p-2 rounded">
                <div className="text-gray-600">Digital Infra</div>
                <div className="font-semibold text-green-600">
                  {hoveredCountry.digitalInfrastructure.toFixed(1)}%
                </div>
              </div>
              <div className="bg-white p-2 rounded">
                <div className="text-gray-600">Investment</div>
                <div className="font-semibold text-purple-600">
                  {hoveredCountry.investment.toFixed(1)}%
                </div>
              </div>
              <div className="bg-white p-2 rounded">
                <div className="text-gray-600">Fintech Cos</div>
                <div className="font-semibold text-orange-600">
                  {hoveredCountry.fintechCompanies || 'N/A'}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
