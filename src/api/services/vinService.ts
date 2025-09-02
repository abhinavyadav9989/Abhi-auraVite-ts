import { InvokeLLM } from '@/api/integrations';

export interface VINResponse {
  success: boolean;
  data?: VINVehicleData;
  error?: string;
  source: 'vin_api' | 'llm_fallback';
  confidence: number;
}

export interface VINVehicleData {
  vin: string;
  make: string;
  model: string;
  year: number;
  body_style?: string;
  engine_type?: string;
  transmission?: string;
  fuel_type?: string;
  country_of_origin?: string;
  manufacturer?: string;
  plant_code?: string;
  serial_number?: string;
  check_digit_valid?: boolean;
}

export interface VINValidationResult {
  isValid: boolean;
  format: 'valid' | 'invalid' | 'unknown';
  length: number;
  checkDigitValid?: boolean;
  country?: string;
  manufacturer?: string;
}

// VIN World Manufacturer Identifier (WMI) codes
export const VIN_WMI_CODES: Record<string, { manufacturer: string; country: string }> = {
  '1H': { manufacturer: 'Honda', country: 'USA' },
  '1N': { manufacturer: 'Nissan', country: 'USA' },
  '1V': { manufacturer: 'Volkswagen', country: 'USA' },
  '2T': { manufacturer: 'Toyota', country: 'Canada' },
  '3V': { manufacturer: 'Volkswagen', country: 'Mexico' },
  '4T': { manufacturer: 'Toyota', country: 'USA' },
  '5N': { manufacturer: 'Nissan', country: 'USA' },
  '6G': { manufacturer: 'General Motors', country: 'Australia' },
  '8X': { manufacturer: 'Volkswagen', country: 'Germany' },
  '9B': { manufacturer: 'Ford', country: 'Brazil' },
  'JN': { manufacturer: 'Nissan', country: 'Japan' },
  'JT': { manufacturer: 'Toyota', country: 'Japan' },
  'KM': { manufacturer: 'Hyundai', country: 'South Korea' },
  'MA': { manufacturer: 'Mahindra', country: 'India' },
  'MB': { manufacturer: 'Mercedes-Benz', country: 'Germany' },
  'MM': { manufacturer: 'Maruti Suzuki', country: 'India' },
  'MR': { manufacturer: 'Mercedes-Benz', country: 'Germany' },
  'MS': { manufacturer: 'Maruti Suzuki', country: 'India' },
  'MT': { manufacturer: 'Mercedes-Benz', country: 'Germany' },
  'MV': { manufacturer: 'Mercedes-Benz', country: 'Germany' },
  'MW': { manufacturer: 'Mercedes-Benz', country: 'Germany' },
  'MX': { manufacturer: 'Mercedes-Benz', country: 'Germany' },
  'MY': { manufacturer: 'Mercedes-Benz', country: 'Germany' },
  'MZ': { manufacturer: 'Mercedes-Benz', country: 'Germany' },
  'VF': { manufacturer: 'Renault', country: 'France' },
  'VW': { manufacturer: 'Volkswagen', country: 'Germany' },
  'WA': { manufacturer: 'Audi', country: 'Germany' },
  'WB': { manufacturer: 'BMW', country: 'Germany' },
  'WD': { manufacturer: 'Mercedes-Benz', country: 'Germany' },
  'WF': { manufacturer: 'Ford', country: 'Germany' },
  'WJ': { manufacturer: 'Jeep', country: 'Germany' },
  'WK': { manufacturer: 'BMW', country: 'Germany' },
  'WM': { manufacturer: 'BMW', country: 'Germany' },
  'WP': { manufacturer: 'BMW', country: 'Germany' },
  'WS': { manufacturer: 'BMW', country: 'Germany' },
  'WV': { manufacturer: 'Volkswagen', country: 'Germany' },
  'WX': { manufacturer: 'BMW', country: 'Germany' },
  'WY': { manufacturer: 'BMW', country: 'Germany' },
  'WZ': { manufacturer: 'BMW', country: 'Germany' },
  'X7': { manufacturer: 'BMW', country: 'Germany' },
  'YV': { manufacturer: 'Volvo', country: 'Sweden' },
  'ZA': { manufacturer: 'Alfa Romeo', country: 'Italy' },
  'ZB': { manufacturer: 'BMW', country: 'Germany' },
  'ZC': { manufacturer: 'Chrysler', country: 'USA' },
  'ZD': { manufacturer: 'Mercedes-Benz', country: 'Germany' },
  'ZF': { manufacturer: 'Ford', country: 'Germany' },
  'ZG': { manufacturer: 'BMW', country: 'Germany' },
  'ZH': { manufacturer: 'BMW', country: 'Germany' },
  'ZJ': { manufacturer: 'BMW', country: 'Germany' },
  'ZK': { manufacturer: 'BMW', country: 'Germany' },
  'ZL': { manufacturer: 'BMW', country: 'Germany' },
  'ZM': { manufacturer: 'BMW', country: 'Germany' },
  'ZN': { manufacturer: 'BMW', country: 'Germany' },
  'ZP': { manufacturer: 'BMW', country: 'Germany' },
  'ZR': { manufacturer: 'BMW', country: 'Germany' },
  'ZS': { manufacturer: 'BMW', country: 'Germany' },
  'ZT': { manufacturer: 'BMW', country: 'Germany' },
  'ZU': { manufacturer: 'BMW', country: 'Germany' },
  'ZV': { manufacturer: 'BMW', country: 'Germany' },
  'ZW': { manufacturer: 'BMW', country: 'Germany' },
  'ZX': { manufacturer: 'BMW', country: 'Germany' },
  'ZY': { manufacturer: 'BMW', country: 'Germany' },
  'ZZ': { manufacturer: 'BMW', country: 'Germany' }
};

export class VINService {
  private static instance: VINService;
  private cache: Map<string, VINResponse> = new Map();
  private cacheExpiry: Map<string, number> = new Map();
  private readonly CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

  private constructor() {}

  static getInstance(): VINService {
    if (!VINService.instance) {
      VINService.instance = new VINService();
    }
    return VINService.instance;
  }

  // Validate VIN format
  validateVIN(vin: string): VINValidationResult {
    const cleanVIN = vin.replace(/\s/g, '').toUpperCase();
    
    // Check length
    if (cleanVIN.length !== 17) {
      return {
        isValid: false,
        format: 'invalid',
        length: cleanVIN.length
      };
    }

    // Check for invalid characters (I, O, Q)
    if (/[IOQ]/.test(cleanVIN)) {
      return {
        isValid: false,
        format: 'invalid',
        length: 17
      };
    }

    // Extract WMI (first 3 characters)
    const wmi = cleanVIN.substring(0, 2);
    const manufacturer = VIN_WMI_CODES[wmi];

    // Validate check digit (9th position)
    const checkDigitValid = this.validateCheckDigit(cleanVIN);

    return {
      isValid: true,
      format: 'valid',
      length: 17,
      checkDigitValid,
      country: manufacturer?.country,
      manufacturer: manufacturer?.manufacturer
    };
  }

  // Validate VIN check digit
  private validateCheckDigit(vin: string): boolean {
    const weights = [8, 7, 6, 5, 4, 3, 2, 10, 0, 9, 8, 7, 6, 5, 4, 3, 2];
    const checkDigit = vin.charAt(8);
    
    let sum = 0;
    for (let i = 0; i < 17; i++) {
      if (i === 8) continue; // Skip check digit position
      
      const char = vin.charAt(i);
      let value: number;
      
      if (/[0-9]/.test(char)) {
        value = parseInt(char);
      } else if (/[A-Z]/.test(char)) {
        // A=1, B=2, ..., I=9, J=1, K=2, ..., R=9, S=2, T=3, ..., Z=9
        const charCode = char.charCodeAt(0);
        if (charCode <= 73) { // A-I
          value = charCode - 64;
        } else if (charCode <= 82) { // J-R
          value = charCode - 73;
        } else { // S-Z
          value = charCode - 81;
        }
      } else {
        return false;
      }
      
      sum += value * weights[i];
    }
    
    const expectedCheckDigit = sum % 11;
    const actualCheckDigit = checkDigit === 'X' ? 10 : parseInt(checkDigit);
    
    return expectedCheckDigit === actualCheckDigit;
  }

  // Decode VIN
  async decodeVIN(vin: string): Promise<VINResponse> {
    const cleanVIN = vin.replace(/\s/g, '').toUpperCase();
    
    // Check cache first
    const cached = this.getFromCache(cleanVIN);
    if (cached) {
      return cached;
    }

    // Validate VIN
    const validation = this.validateVIN(cleanVIN);
    if (!validation.isValid) {
      return {
        success: false,
        error: 'Invalid VIN format',
        source: 'vin_api',
        confidence: 0
      };
    }

    try {
      // Try VIN API first (mock implementation)
      const vinData = await this.callVINAPI(cleanVIN);
      if (vinData.success) {
        this.setCache(cleanVIN, vinData);
        return vinData;
      }

      // Fallback to LLM-based extraction
      const llmData = await this.extractFromLLM(cleanVIN);
      this.setCache(cleanVIN, llmData);
      return llmData;

    } catch (error) {
      console.error('VIN service error:', error);
      return {
        success: false,
        error: 'Failed to decode VIN',
        source: 'vin_api',
        confidence: 0
      };
    }
  }

  // Mock VIN API call
  private async callVINAPI(vin: string): Promise<VINResponse> {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 1500));

    // Simulate API failure rate (80% success rate)
    if (Math.random() < 0.2) {
      return {
        success: false,
        error: 'VIN API temporarily unavailable',
        source: 'vin_api',
        confidence: 0
      };
    }

    // Extract information from VIN
    const wmi = vin.substring(0, 2);
    const manufacturer = VIN_WMI_CODES[wmi];
    const year = this.decodeYear(vin.charAt(6));
    const bodyStyle = this.decodeBodyStyle(vin.charAt(3));
    const engineType = this.decodeEngineType(vin.charAt(4));

    const mockData: VINVehicleData = {
      vin: vin,
      make: manufacturer?.manufacturer || 'Unknown',
      model: this.getModelFromVIN(vin),
      year: year,
      body_style: bodyStyle,
      engine_type: engineType,
      transmission: this.getRandomTransmission(),
      fuel_type: this.getRandomFuelType(),
      country_of_origin: manufacturer?.country || 'Unknown',
      manufacturer: manufacturer?.manufacturer || 'Unknown',
      plant_code: vin.charAt(10),
      serial_number: vin.substring(12),
      check_digit_valid: this.validateCheckDigit(vin)
    };

    return {
      success: true,
      data: mockData,
      source: 'vin_api',
      confidence: 0.92
    };
  }

  // LLM-based extraction as fallback
  private async extractFromLLM(vin: string): Promise<VINResponse> {
    try {
      const response = await InvokeLLM({
        prompt: `Decode the VIN "${vin}" and extract vehicle information. 
        Provide details like make, model, year, body style, engine type, etc. 
        Use the VIN structure to determine manufacturer and other details.`,
        response_json_schema: {
          type: "object",
          properties: {
            make: { type: "string" },
            model: { type: "string" },
            year: { type: "number" },
            body_style: { type: "string" },
            engine_type: { type: "string" },
            transmission: { type: "string" },
            fuel_type: { type: "string" },
            country_of_origin: { type: "string" },
            confidence: { type: "number" }
          }
        }
      });

      const data: VINVehicleData = {
        vin: vin,
        make: response.make || 'Unknown',
        model: response.model || 'Unknown',
        year: response.year || 2020,
        body_style: response.body_style,
        engine_type: response.engine_type,
        transmission: response.transmission,
        fuel_type: response.fuel_type,
        country_of_origin: response.country_of_origin,
        manufacturer: response.make || 'Unknown',
        check_digit_valid: this.validateCheckDigit(vin)
      };

      return {
        success: true,
        data,
        source: 'llm_fallback',
        confidence: response.confidence || 0.75
      };

    } catch (error) {
      console.error('LLM VIN extraction error:', error);
      return {
        success: false,
        error: 'Failed to decode VIN',
        source: 'llm_fallback',
        confidence: 0
      };
    }
  }

  // Decode year from VIN
  private decodeYear(yearChar: string): number {
    const yearMap: Record<string, number> = {
      'A': 2010, 'B': 2011, 'C': 2012, 'D': 2013, 'E': 2014,
      'F': 2015, 'G': 2016, 'H': 2017, 'J': 2018, 'K': 2019,
      'L': 2020, 'M': 2021, 'N': 2022, 'P': 2023, 'R': 2024,
      'S': 2025, 'T': 2026, 'U': 2027, 'V': 2028, 'W': 2029,
      'X': 2030, 'Y': 2031, 'Z': 2032
    };
    
    return yearMap[yearChar] || 2020;
  }

  // Decode body style
  private decodeBodyStyle(styleChar: string): string {
    const styleMap: Record<string, string> = {
      'A': 'Sedan', 'B': 'Hatchback', 'C': 'SUV', 'D': 'Wagon',
      'E': 'Coupe', 'F': 'Convertible', 'G': 'Van', 'H': 'Truck',
      'J': 'Pickup', 'K': 'Minivan', 'L': 'Limousine', 'M': 'MPV'
    };
    
    return styleMap[styleChar] || 'Unknown';
  }

  // Decode engine type
  private decodeEngineType(engineChar: string): string {
    const engineMap: Record<string, string> = {
      'A': '1.0L I3', 'B': '1.2L I4', 'C': '1.4L I4', 'D': '1.6L I4',
      'E': '1.8L I4', 'F': '2.0L I4', 'G': '2.5L I4', 'H': '3.0L V6',
      'J': '3.5L V6', 'K': '4.0L V6', 'L': '4.5L V8', 'M': '5.0L V8'
    };
    
    return engineMap[engineChar] || 'Unknown';
  }

  // Get model from VIN (simplified)
  private getModelFromVIN(vin: string): string {
    const wmi = vin.substring(0, 2);
    const manufacturer = VIN_WMI_CODES[wmi];
    
    if (manufacturer?.manufacturer === 'Honda') return 'City';
    if (manufacturer?.manufacturer === 'Toyota') return 'Innova';
    if (manufacturer?.manufacturer === 'Maruti Suzuki') return 'Swift';
    if (manufacturer?.manufacturer === 'Hyundai') return 'i20';
    if (manufacturer?.manufacturer === 'Tata') return 'Nexon';
    if (manufacturer?.manufacturer === 'Mahindra') return 'XUV500';
    
    return 'Unknown';
  }

  // Helper methods
  private getRandomTransmission(): string {
    const types = ['Manual', 'Automatic', 'CVT', 'AMT'];
    return types[Math.floor(Math.random() * types.length)];
  }

  private getRandomFuelType(): string {
    const types = ['Petrol', 'Diesel', 'CNG', 'Electric', 'Hybrid'];
    return types[Math.floor(Math.random() * types.length)];
  }

  // Cache management
  private getFromCache(key: string): VINResponse | null {
    const expiry = this.cacheExpiry.get(key);
    if (expiry && Date.now() < expiry) {
      return this.cache.get(key) || null;
    }
    
    this.cache.delete(key);
    this.cacheExpiry.delete(key);
    return null;
  }

  private setCache(key: string, data: VINResponse): void {
    this.cache.set(key, data);
    this.cacheExpiry.set(key, Date.now() + this.CACHE_DURATION);
  }

  clearCache(): void {
    this.cache.clear();
    this.cacheExpiry.clear();
  }

  getCacheStats(): { size: number; entries: string[] } {
    return {
      size: this.cache.size,
      entries: Array.from(this.cache.keys())
    };
  }
}

// Export singleton instance
export const vinService = VINService.getInstance();
