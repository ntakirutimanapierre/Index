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
        stroke={isHovered ? '#2563eb' : '#222'}
        strokeWidth={isHovered ? 3 : 1.5}
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
      <>
        <svg
          ref={svgRef}
          viewBox="250 100 600 700"
          width="90%"
          height="90%"
          className="w-full h-full border border-gray-200 rounded-lg bg-white"
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
                className="text-xs font-medium fill-black pointer-events-none"
              >
                {feature.properties.ADMIN}
              </text>
            );
          })}
        </svg>
        {/* Tooltip */}
        {tooltip && (
          <div
            className="pointer-events-auto absolute z-50 px-3 py-2 rounded-lg shadow-lg bg-white border border-gray-200 text-sm text-gray-900"
            style={{ left: tooltip?.x ? tooltip.x + 12 : 0, top: tooltip?.y ? tooltip.y + 12 : 0 }}
          >
            <div className="font-semibold">{tooltip?.name ?? ''}</div>
            {tooltip?.score !== null && tooltip?.score !== undefined && (
              <div>Score: <span className="font-bold">{tooltip.score.toFixed(1)}</span></div>
            )}
          </div>
        )}
        {/* TODO: Style the map and card to match the GSMA Mobile Connectivity Index look (dark background, centered, legend, zoom controls) */}
      </>
    );
  };

  return (
    <div className="bg-gray-50 rounded-2xl border border-gray-200 shadow-xl flex flex-col p-6" style={{ aspectRatio: '1 / 1', width: '100%', maxWidth: 900 }}>
      <div className="p-6 pb-4 flex-shrink-0">
        <h3 className="text-xl font-bold text-gray-900">Africa Fintech Index Map</h3>
        {loading && <p className="text-sm text-blue-300 mt-1">Loading map...</p>}
        {error && <p className="text-sm text-red-400 mt-1">Error: {error}</p>}
      </div>
      <div className="flex-1 px-6 flex flex-col min-h-0">
        <div className="flex-1 min-h-0 mb-4 flex items-center justify-center" style={{ background: '#fff', borderRadius: '1rem', boxShadow: '0 2px 8px 0 rgba(0,0,0,0.04)', width: '100%', height: '100%' }}>
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <span className="text-gray-500">Loading map...</span>
            </div>
          ) : (
            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg
                ref={svgRef}
                viewBox="250 100 600 700"
                width="98%"
                height="98%"
                className="w-full h-full border border-gray-200 rounded-lg bg-white"
                preserveAspectRatio="xMidYMid meet"
              >
                <defs>
                  <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
                    <feDropShadow dx="2" dy="2" stdDeviation="3" floodColor="#00000040" />
                  </filter>
                </defs>
                {geoData && geoData.features.map((feature) => {
                  const isoCode = feature.properties.ISO_A2;
                  return renderCountryPath(feature, isoCode);
                })}
                {geoData && geoData.features.map((feature) => {
                  const isoCode = feature.properties.ISO_A2;
                  const countryInfo = countryMap.get(isoCode);
                  if (!countryInfo?.data) return null;
                  const coords = feature.geometry.coordinates;
                  let centerX = 0, centerY = 0;
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
                      className="text-xs font-medium fill-black pointer-events-none"
                    >
                      {feature.properties.ADMIN}
                    </text>
                  );
                })}
              </svg>
              {/* Tooltip */}
              {tooltip && (
                <div
                  className="pointer-events-none absolute z-50 px-3 py-2 rounded-lg shadow-lg bg-white border border-gray-200 text-sm text-gray-900 transition-all duration-75"
                  style={{
                    left: Math.min(Math.max(tooltip.x + 16, 8), 520),
                    top: Math.min(Math.max(tooltip.y + 16, 8), 520),
                    maxWidth: 200,
                    whiteSpace: 'nowrap',
                  }}
                >
                  <div className="font-semibold">{tooltip?.name ?? ''}</div>
                  {tooltip?.score !== null && tooltip?.score !== undefined && (
                    <div>Score: <span className="font-bold">{tooltip.score.toFixed(1)}</span></div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
        {/* Color Legend */}
        <div className="flex items-center justify-center gap-6 py-2">
          <div className="flex items-center gap-2">
            <span className="inline-block w-5 h-5 rounded bg-emerald-500 border border-gray-700"></span>
            <span className="text-xs text-gray-200">High (80+)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-block w-5 h-5 rounded bg-yellow-400 border border-gray-700"></span>
            <span className="text-xs text-gray-200">Medium (60-79)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-block w-5 h-5 rounded bg-red-400 border border-gray-700"></span>
            <span className="text-xs text-gray-200">Low (40-59)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-block w-5 h-5 rounded bg-gray-400 border border-gray-700"></span>
            <span className="text-xs text-gray-200">Very Low (&lt;40)</span>
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
