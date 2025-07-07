import { CountryData } from '../types';

// Types for shapefile processing
export interface ShapefileFeature {
  type: string;
  properties: {
    ADMIN: string;
    ISO_A2: string;
    ISO_A3: string;
    CONTINENT: string;
    [key: string]: any;
  };
  geometry: {
    type: string;
    coordinates: number[][][] | number[][][][];
  };
}

export interface ProcessedGeoData {
  type: string;
  features: ShapefileFeature[];
}

// African country ISO codes
const AFRICAN_COUNTRIES = new Set([
  'DZ', 'AO', 'BJ', 'BW', 'BF', 'BI', 'CM', 'CV', 'CF', 'TD', 'KM', 'CG', 'CD', 'DJ', 'EG', 'GQ', 'ER', 'ET', 'GA', 'GM', 'GH', 'GN', 'GW', 'CI', 'KE', 'LS', 'LR', 'LY', 'MG', 'MW', 'ML', 'MR', 'MU', 'MA', 'MZ', 'NA', 'NE', 'NG', 'RW', 'ST', 'SN', 'SC', 'SL', 'SO', 'ZA', 'SS', 'SD', 'SZ', 'TZ', 'TG', 'TN', 'UG', 'ZM', 'ZW'
]);

// Simplified GeoJSON data for African countries (fallback when shapefile library is not available)
const SIMPLIFIED_AFRICAN_GEOJSON: ProcessedGeoData = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      properties: {
        ADMIN: 'Nigeria',
        ISO_A2: 'NG',
        ISO_A3: 'NGA',
        CONTINENT: 'Africa'
      },
      geometry: {
        type: 'Polygon',
        coordinates: [[[420, 380], [480, 380], [490, 420], [470, 450], [420, 450], [420, 380]]]
      }
    },
    {
      type: 'Feature',
      properties: {
        ADMIN: 'South Africa',
        ISO_A2: 'ZA',
        ISO_A3: 'ZAF',
        CONTINENT: 'Africa'
      },
      geometry: {
        type: 'Polygon',
        coordinates: [[[480, 650], [580, 650], [600, 690], [560, 720], [480, 720], [480, 650]]]
      }
    },
    {
      type: 'Feature',
      properties: {
        ADMIN: 'Kenya',
        ISO_A2: 'KE',
        ISO_A3: 'KEN',
        CONTINENT: 'Africa'
      },
      geometry: {
        type: 'Polygon',
        coordinates: [[[620, 450], [670, 450], [680, 490], [660, 520], [620, 520], [620, 450]]]
      }
    },
    {
      type: 'Feature',
      properties: {
        ADMIN: 'Egypt',
        ISO_A2: 'EG',
        ISO_A3: 'EGY',
        CONTINENT: 'Africa'
      },
      geometry: {
        type: 'Polygon',
        coordinates: [[[520, 200], [600, 200], [620, 240], [580, 280], [520, 280], [520, 200]]]
      }
    },
    {
      type: 'Feature',
      properties: {
        ADMIN: 'Ghana',
        ISO_A2: 'GH',
        ISO_A3: 'GHA',
        CONTINENT: 'Africa'
      },
      geometry: {
        type: 'Polygon',
        coordinates: [[[360, 420], [400, 420], [410, 460], [390, 490], [360, 490], [360, 420]]]
      }
    },
    {
      type: 'Feature',
      properties: {
        ADMIN: 'Morocco',
        ISO_A2: 'MA',
        ISO_A3: 'MAR',
        CONTINENT: 'Africa'
      },
      geometry: {
        type: 'Polygon',
        coordinates: [[[380, 250], [450, 250], [470, 290], [430, 330], [380, 330], [380, 250]]]
      }
    },
    {
      type: 'Feature',
      properties: {
        ADMIN: 'Ethiopia',
        ISO_A2: 'ET',
        ISO_A3: 'ETH',
        CONTINENT: 'Africa'
      },
      geometry: {
        type: 'Polygon',
        coordinates: [[[680, 380], [740, 380], [750, 420], [720, 450], [680, 450], [680, 380]]]
      }
    },
    {
      type: 'Feature',
      properties: {
        ADMIN: 'Tanzania',
        ISO_A2: 'TZ',
        ISO_A3: 'TZA',
        CONTINENT: 'Africa'
      },
      geometry: {
        type: 'Polygon',
        coordinates: [[[620, 540], [680, 540], [690, 580], [660, 610], [620, 610], [620, 540]]]
      }
    }
  ]
};

/**
 * Process shapefile data and filter for African countries
 */
export const processShapefileData = async (shapefilePath: string): Promise<ProcessedGeoData> => {
  try {
    console.log('Processing shapefile:', shapefilePath);
    
    // For now, we'll use the simplified data since the shapefile library isn't installed
    // In a production environment, you would:
    // 1. Import the shapefile library
    // 2. Load and parse the .shp file
    // 3. Load and parse the .dbf file for attributes
    // 4. Combine them into GeoJSON format
    // 5. Filter for African countries
    
    // Check if we're trying to load the local shapefile
    if (shapefilePath.includes('ne_110m_admin_0_countries')) {
      console.log('Using simplified African countries data as fallback');
      return SIMPLIFIED_AFRICAN_GEOJSON;
    }
    
    return {
      type: 'FeatureCollection',
      features: []
    };
  } catch (error) {
    console.error('Error processing shapefile:', error);
    throw new Error('Failed to process shapefile data');
  }
};

/**
 * Filter features for African countries only
 */
export const filterAfricanCountries = (features: ShapefileFeature[]): ShapefileFeature[] => {
  return features.filter(feature => {
    const isoCode = feature.properties.ISO_A2;
    return AFRICAN_COUNTRIES.has(isoCode);
  });
};

/**
 * Match country data with shapefile features
 */
export const matchCountryData = (
  geoFeatures: ShapefileFeature[], 
  countryData: CountryData[]
): Map<string, { feature: ShapefileFeature; data: CountryData | null }> => {
  const countryMap = new Map();
  
  geoFeatures.forEach(feature => {
    const isoCode = feature.properties.ISO_A2;
    const countryDataItem = countryData.find(c => c.id === isoCode);
    
    countryMap.set(isoCode, {
      feature,
      data: countryDataItem || null
    });
  });
  
  return countryMap;
};

/**
 * Convert coordinates to SVG path
 */
export const coordinatesToPath = (coordinates: number[][][]): string => {
  if (!coordinates || coordinates.length === 0) return '';
  
  const paths: string[] = [];
  
  coordinates.forEach(polygon => {
    if (polygon.length === 0) return;
    
    const path = polygon.map((point, index) => {
      const [x, y] = point;
      return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
    }).join(' ') + ' Z';
    
    paths.push(path);
  });
  
  return paths.join(' ');
};

/**
 * Get country color based on fintech index score
 */
export const getCountryColor = (countryData: CountryData | null): string => {
  if (!countryData) return '#E5E7EB';
  
  const score = countryData.finalScore;
  if (score >= 80) return '#10B981';
  if (score >= 60) return '#F59E0B';
  if (score >= 40) return '#EF4444';
  return '#6B7280';
};

/**
 * Create a simplified map data structure for fallback
 */
export const createSimplifiedMapData = (): ProcessedGeoData => {
  return SIMPLIFIED_AFRICAN_GEOJSON;
};

/**
 * Validate shapefile path and format
 */
export const validateShapefilePath = (path: string): boolean => {
  // Basic validation - check if path ends with .shp or contains shapefile name
  return (path.endsWith('.shp') || path.includes('ne_110m_admin_0_countries')) && path.length > 0;
};

/**
 * Get associated shapefile files
 */
export const getShapefileFiles = (basePath: string): string[] => {
  const extensions = ['.shp', '.dbf', '.shx', '.prj'];
  return extensions.map(ext => basePath.replace('.shp', ext));
};

/**
 * Get the local shapefile path
 */
export const getLocalShapefilePath = (): string => {
  return '/src/data/ne_110m_admin_0_countries.shp';
}; 