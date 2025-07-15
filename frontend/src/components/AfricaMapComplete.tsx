import React, { useEffect, useState, useRef, useCallback } from 'react';
import type { CountryData } from '../types';
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
  const [tooltip, setTooltip] = useState<{ x: number; y: number; name: string; score: number | null } | null>(null);

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
    (isoCode: string, evt?: React.MouseEvent) => {
      const countryInfo = countryMap.get(isoCode);
      onCountryHover(countryInfo?.data || null);
      if (countryInfo?.data && evt) {
        setTooltip({
          x: evt.clientX,
          y: evt.clientY,
          name: countryInfo.data.name,
          score: countryInfo.data.finalScore
        });
      } else {
        setTooltip(null);
      }
    },
    [countryMap, onCountryHover]
  );

  const renderCountryPath = (feature: ShapefileFeature, isoCode: string) => {
    const countryInfo = countryMap.get(isoCode);
    const color = getCountryColor(countryInfo?.data || null);
    const isHovered = hoveredCountry && countryInfo?.data && hoveredCountry.id === countryInfo.data.id;

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
        stroke={isHovered ? '#2563eb' : '#fff'}
        strokeWidth={isHovered ? 3 : 1}
        filter={isHovered ? 'url(#shadow)' : undefined}
        className="cursor-pointer hover:opacity-80 transition-all duration-200"
        onClick={() => handleCountryClick(isoCode)}
        onMouseEnter={(evt) => handleCountryHover(isoCode, evt)}
        onMouseMove={(evt) => handleCountryHover(isoCode, evt)}
        onMouseLeave={() => { onCountryHover(null); setTooltip(null); }}
      />
    );
  };

  const renderMap = () => {
    if (!geoData) return null;

    return (
      <div className="relative w-full h-full flex items-center justify-center">
        <svg
          ref={svgRef}
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto max-h-[600px] border border-gray-100 rounded-lg bg-white"
          preserveAspectRatio="xMidYMid meet"
        >
          <defs>
            <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="2" dy="2" stdDeviation="3" floodColor="#00000040" />
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
        {/* Tooltip */}
        {tooltip && (
          <div
            className="pointer-events-none fixed z-50 px-3 py-2 rounded-lg shadow-lg bg-white border border-gray-200 text-sm text-gray-900"
            style={{ left: tooltip.x + 12, top: tooltip.y + 12 }}
          >
            <div className="font-semibold">{tooltip.name}</div>
            {tooltip.score !== null && (
              <div>Score: <span className="font-bold">{tooltip.score.toFixed(1)}</span></div>
            )}
          </div>
        )}
      </div>
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
              <span className="text-gray-500">Loading map...</span>
            </div>
          ) : (
            renderMap()
          )}
        </div>
        {/* Color Legend */}
        <div className="flex items-center justify-center gap-6 py-2">
          <div className="flex items-center gap-2">
            <span className="inline-block w-5 h-5 rounded bg-emerald-500 border border-gray-300"></span>
            <span className="text-xs text-gray-700">High (80+)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-block w-5 h-5 rounded bg-yellow-400 border border-gray-300"></span>
            <span className="text-xs text-gray-700">Medium (60-79)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-block w-5 h-5 rounded bg-red-400 border border-gray-300"></span>
            <span className="text-xs text-gray-700">Low (40-59)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-block w-5 h-5 rounded bg-gray-400 border border-gray-300"></span>
            <span className="text-xs text-gray-700">Very Low (&lt;40)</span>
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
