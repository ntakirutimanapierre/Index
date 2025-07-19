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

  return (
    <div className="w-full h-full flex items-center justify-center relative" style={{ minHeight: 400 }}>
      {loading ? (
        <div className="flex items-center justify-center h-full w-full">
          <span className="text-gray-500">Loading map...</span>
        </div>
      ) : (
        <svg
          ref={svgRef}
          viewBox="0 0 1000 900"
          width="100%"
          height="100%"
          className="w-full h-full"
          preserveAspectRatio="xMidYMid meet"
          style={{ background: 'none' }}
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
          {/* No SVG text labels rendered */}
        </svg>
      )}
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
      {/* Floating details card for hovered country */}
      {hoveredCountry && (
        <div className="absolute bottom-8 right-8 z-50 w-80 max-w-full bg-white rounded-xl shadow-lg border border-gray-200 p-5 flex flex-col gap-2 animate-fade-in">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-lg font-bold text-gray-900">{hoveredCountry.name}</h4>
            <span className="text-2xl font-bold text-blue-600">{hoveredCountry.finalScore?.toFixed(1)}</span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="bg-blue-50 p-2 rounded">
              <div className="text-gray-600">Literacy Rate</div>
              <div className="font-semibold text-blue-700">{hoveredCountry.literacyRate?.toFixed(1)}%</div>
            </div>
            <div className="bg-green-50 p-2 rounded">
              <div className="text-gray-600">Digital Infra</div>
              <div className="font-semibold text-green-700">{hoveredCountry.digitalInfrastructure?.toFixed(1)}%</div>
            </div>
            <div className="bg-purple-50 p-2 rounded">
              <div className="text-gray-600">Investment</div>
              <div className="font-semibold text-purple-700">{hoveredCountry.investment?.toFixed(1)}%</div>
            </div>
            <div className="bg-orange-50 p-2 rounded">
              <div className="text-gray-600">Fintech Cos</div>
              <div className="font-semibold text-orange-700">{hoveredCountry.fintechCompanies ?? 'N/A'}</div>
            </div>
          </div>
        </div>
      )}
      {/* Floating country list card on the right side */}
      <div className="absolute top-8 right-8 z-40 w-64 max-h-[70vh] overflow-y-auto bg-white rounded-xl shadow-lg border border-gray-200 p-4 flex flex-col gap-2">
        <h4 className="text-base font-bold mb-2">Countries</h4>
        <ul className="space-y-1">
          {Array.from(countryMap.values()).filter(c => c.data).map(({ data }) => (
            <li key={data!.id} className="text-sm text-gray-800 truncate">{data!.name}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};
