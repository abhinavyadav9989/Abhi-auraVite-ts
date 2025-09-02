import { InvokeLLM } from '@/api/integrations';

export interface RTOResponse {
  success: boolean;
  data?: RTOVehicleData;
  error?: string;
  source: 'rto_api' | 'llm_fallback';
  confidence: number;
}

export interface RTOVehicleData {
  registration_number: string;
  owner_name?: string;
  vehicle_make: string;
  vehicle_model: string;
  vehicle_variant?: string;
  manufacturing_year: number;
  fuel_type: 'petrol' | 'diesel' | 'cng' | 'lpg' | 'electric' | 'hybrid';
  transmission: 'manual' | 'automatic' | 'amt' | 'cvt';
  body_type?: string;
  engine_capacity?: number;
  seating_capacity?: number;
  color?: string;
  registration_date?: string;
  expiry_date?: string;
  insurance_status?: 'active' | 'expired' | 'unknown';
  insurance_valid_until?: string;
  puc_status?: 'valid' | 'expired' | 'unknown';
  puc_valid_until?: string;
  emission_norm?: 'BS4' | 'BS6' | 'BS3' | 'unknown';
  vehicle_category?: string;
  rto_office?: string;
  state?: string;
  city?: string;
}

export interface RTOValidationResult {
  isValid: boolean;
  format: 'valid' | 'invalid' | 'unknown';
  state?: string;
  rto_office?: string;
  checksum?: boolean;
}

// RTO state codes mapping
export const RTO_STATE_CODES: Record<string, { name: string; cities: string[] }> = {
  'AN': { name: 'Andaman and Nicobar Islands', cities: ['Port Blair'] },
  'AP': { name: 'Andhra Pradesh', cities: ['Amaravati', 'Visakhapatnam', 'Vijayawada', 'Guntur'] },
  'AR': { name: 'Arunachal Pradesh', cities: ['Itanagar'] },
  'AS': { name: 'Assam', cities: ['Dispur', 'Guwahati'] },
  'BR': { name: 'Bihar', cities: ['Patna'] },
  'CH': { name: 'Chandigarh', cities: ['Chandigarh'] },
  'CT': { name: 'Chhattisgarh', cities: ['Raipur'] },
  'DL': { name: 'Delhi', cities: ['New Delhi'] },
  'GA': { name: 'Goa', cities: ['Panaji'] },
  'GJ': { name: 'Gujarat', cities: ['Gandhinagar', 'Ahmedabad', 'Surat', 'Vadodara'] },
  'HR': { name: 'Haryana', cities: ['Chandigarh', 'Gurugram', 'Faridabad'] },
  'HP': { name: 'Himachal Pradesh', cities: ['Shimla'] },
  'JK': { name: 'Jammu and Kashmir', cities: ['Srinagar', 'Jammu'] },
  'JH': { name: 'Jharkhand', cities: ['Ranchi'] },
  'KA': { name: 'Karnataka', cities: ['Bengaluru', 'Mysuru'] },
  'KL': { name: 'Kerala', cities: ['Thiruvananthapuram', 'Kochi'] },
  'MP': { name: 'Madhya Pradesh', cities: ['Bhopal', 'Indore'] },
  'MH': { name: 'Maharashtra', cities: ['Mumbai', 'Pune', 'Nagpur', 'Thane'] },
  'MN': { name: 'Manipur', cities: ['Imphal'] },
  'ML': { name: 'Meghalaya', cities: ['Shillong'] },
  'MZ': { name: 'Mizoram', cities: ['Aizawl'] },
  'NL': { name: 'Nagaland', cities: ['Kohima'] },
  'OR': { name: 'Odisha', cities: ['Bhubaneswar'] },
  'PY': { name: 'Puducherry', cities: ['Puducherry'] },
  'PB': { name: 'Punjab', cities: ['Chandigarh', 'Amritsar', 'Ludhiana'] },
  'RJ': { name: 'Rajasthan', cities: ['Jaipur', 'Jodhpur'] },
  'SK': { name: 'Sikkim', cities: ['Gangtok'] },
  'TN': { name: 'Tamil Nadu', cities: ['Chennai', 'Coimbatore', 'Madurai'] },
  'TS': { name: 'Telangana', cities: ['Hyderabad'] },
  'TR': { name: 'Tripura', cities: ['Agartala'] },
  'UP': { name: 'Uttar Pradesh', cities: ['Lucknow', 'Kanpur', 'Varanasi'] },
  'UT': { name: 'Uttarakhand', cities: ['Dehradun'] },
  'WB': { name: 'West Bengal', cities: ['Kolkata', 'Howrah'] }
};

// RTO office codes for major cities
export const RTO_OFFICE_CODES: Record<string, Record<string, string>> = {
  'MH': { // Maharashtra
    '01': 'Mumbai Central',
    '02': 'Mumbai West',
    '03': 'Mumbai East',
    '04': 'Mumbai North',
    '05': 'Mumbai South',
    '12': 'Pune',
    '13': 'Pune Rural',
    '14': 'Nagpur',
    '15': 'Thane',
    '16': 'Nashik',
    '17': 'Aurangabad',
    '18': 'Solapur',
    '19': 'Kolhapur',
    '20': 'Amravati',
    '21': 'Latur',
    '22': 'Nanded',
    '23': 'Jalgaon',
    '24': 'Akola',
    '25': 'Sangli',
    '26': 'Dhule',
    '27': 'Ahmednagar',
    '28': 'Chandrapur',
    '29': 'Beed',
    '30': 'Gondia',
    '31': 'Parbhani',
    '32': 'Bhandara',
    '33': 'Wardha',
    '34': 'Gadchiroli',
    '35': 'Washim',
    '36': 'Hingoli',
    '37': 'Yavatmal',
    '38': 'Buldhana',
    '39': 'Ratnagiri',
    '40': 'Sindhudurg',
    '41': 'Satara',
    '42': 'Raigad',
    '43': 'Jalna',
    '44': 'Osmanabad',
    '45': 'Nandurbar',
    '46': 'Palghar',
    '47': 'Mumbai Harbour',
    '48': 'Mumbai Andheri',
    '49': 'Mumbai Borivali',
    '50': 'Mumbai Chembur'
  },
  'DL': { // Delhi
    '01': 'Central',
    '02': 'West',
    '03': 'East',
    '04': 'North',
    '05': 'South',
    '06': 'New Delhi',
    '07': 'Dwarka',
    '08': 'Rohini',
    '09': 'Pitampura',
    '10': 'Janakpuri',
    '11': 'Lajpat Nagar',
    '12': 'Saket',
    '13': 'Vasant Vihar'
  },
  'KA': { // Karnataka
    '01': 'Bangalore Central',
    '02': 'Bangalore North',
    '03': 'Bangalore South',
    '04': 'Bangalore East',
    '05': 'Bangalore West',
    '06': 'Mysore',
    '07': 'Mangalore',
    '08': 'Hubli',
    '09': 'Belgaum',
    '10': 'Gulbarga'
  }
};

export class RTOService {
  private static instance: RTOService;
  private cache: Map<string, RTOResponse> = new Map();
  private cacheExpiry: Map<string, number> = new Map();
  private readonly CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

  private constructor() {}

  static getInstance(): RTOService {
    if (!RTOService.instance) {
      RTOService.instance = new RTOService();
    }
    return RTOService.instance;
  }

  // Validate registration number format
  validateRegistrationNumber(regNumber: string): RTOValidationResult {
    const cleanReg = regNumber.replace(/\s/g, '').toUpperCase();
    
    // Basic format check: XX00XX0000 or XX0XX0000
    const formatRegex = /^[A-Z]{2}[0-9]{1,2}[A-Z]{1,2}[0-9]{4}$/;
    if (!formatRegex.test(cleanReg)) {
      return {
        isValid: false,
        format: 'invalid'
      };
    }

    // Extract components
    const stateCode = cleanReg.substring(0, 2);
    const districtCode = cleanReg.substring(2, 4);
    const series = cleanReg.substring(4, 6);
    const number = cleanReg.substring(6);

    // Check if state code exists
    if (!RTO_STATE_CODES[stateCode]) {
      return {
        isValid: false,
        format: 'invalid',
        state: 'unknown'
      };
    }

    // Check if district code exists for the state
    const rtoOffices = RTO_OFFICE_CODES[stateCode];
    const districtExists = rtoOffices && rtoOffices[districtCode];

    return {
      isValid: true,
      format: 'valid',
      state: RTO_STATE_CODES[stateCode].name,
      rto_office: districtExists ? rtoOffices[districtCode] : undefined,
      checksum: this.validateChecksum(cleanReg)
    };
  }

  // Simple checksum validation (basic implementation)
  private validateChecksum(regNumber: string): boolean {
    // This is a simplified checksum validation
    // In reality, RTO checksums are more complex
    const numbers = regNumber.match(/\d/g);
    if (!numbers) return false;
    
    const sum = numbers.reduce((acc, num) => acc + parseInt(num), 0);
    return sum > 0; // Basic validation
  }

  // Fetch vehicle data from RTO
  async fetchVehicleData(registrationNumber: string): Promise<RTOResponse> {
    const cleanReg = registrationNumber.replace(/\s/g, '').toUpperCase();
    
    // Check cache first
    const cached = this.getFromCache(cleanReg);
    if (cached) {
      return cached;
    }

    // Validate registration number
    const validation = this.validateRegistrationNumber(cleanReg);
    if (!validation.isValid) {
      return {
        success: false,
        error: 'Invalid registration number format',
        source: 'rto_api',
        confidence: 0
      };
    }

    try {
      // Try RTO API first (mock implementation)
      const rtoData = await this.callRTOAPI(cleanReg);
      if (rtoData.success) {
        this.setCache(cleanReg, rtoData);
        return rtoData;
      }

      // Fallback to LLM-based extraction
      const llmData = await this.extractFromLLM(cleanReg);
      this.setCache(cleanReg, llmData);
      return llmData;

    } catch (error) {
      console.error('RTO service error:', error);
      return {
        success: false,
        error: 'Failed to fetch vehicle data',
        source: 'rto_api',
        confidence: 0
      };
    }
  }

  // Mock RTO API call
  private async callRTOAPI(registrationNumber: string): Promise<RTOResponse> {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));

    // Simulate API failure rate (70% success rate)
    if (Math.random() < 0.3) {
      return {
        success: false,
        error: 'RTO API temporarily unavailable',
        source: 'rto_api',
        confidence: 0
      };
    }

    // Mock successful response
    const stateCode = registrationNumber.substring(0, 2);
    const year = 2020 + Math.floor(Math.random() * 4);
    
    const mockData: RTOVehicleData = {
      registration_number: registrationNumber,
      owner_name: 'John Doe',
      vehicle_make: this.getRandomMake(),
      vehicle_model: this.getRandomModel(),
      vehicle_variant: this.getRandomVariant(),
      manufacturing_year: year,
      fuel_type: this.getRandomFuelType(),
      transmission: this.getRandomTransmission(),
      body_type: this.getRandomBodyType(),
      engine_capacity: 1000 + Math.floor(Math.random() * 2000),
      seating_capacity: 5 + Math.floor(Math.random() * 3),
      color: this.getRandomColor(),
      registration_date: `${year}-01-15`,
      expiry_date: `${year + 15}-01-15`,
      insurance_status: 'active',
      insurance_valid_until: `${year + 1}-01-15`,
      puc_status: 'valid',
      puc_valid_until: `${year + 1}-06-15`,
      emission_norm: year >= 2020 ? 'BS6' : 'BS4',
      vehicle_category: 'Personal',
      rto_office: RTO_OFFICE_CODES[stateCode]?.[registrationNumber.substring(2, 4)] || 'Unknown',
      state: RTO_STATE_CODES[stateCode]?.name || 'Unknown',
      city: RTO_STATE_CODES[stateCode]?.cities[0] || 'Unknown'
    };

    return {
      success: true,
      data: mockData,
      source: 'rto_api',
      confidence: 0.95
    };
  }

  // LLM-based extraction as fallback
  private async extractFromLLM(registrationNumber: string): Promise<RTOResponse> {
    try {
      const response = await InvokeLLM({
        prompt: `Extract vehicle information from the Indian registration number "${registrationNumber}". 
        Provide details like make, model, year, fuel type, transmission, etc. 
        If you cannot determine certain details, use reasonable defaults based on common Indian vehicles.`,
        response_json_schema: {
          type: "object",
          properties: {
            vehicle_make: { type: "string" },
            vehicle_model: { type: "string" },
            vehicle_variant: { type: "string" },
            manufacturing_year: { type: "number" },
            fuel_type: { type: "string", enum: ["petrol", "diesel", "cng", "lpg", "electric", "hybrid"] },
            transmission: { type: "string", enum: ["manual", "automatic", "amt", "cvt"] },
            body_type: { type: "string" },
            engine_capacity: { type: "number" },
            seating_capacity: { type: "number" },
            color: { type: "string" },
            emission_norm: { type: "string", enum: ["BS4", "BS6", "BS3", "unknown"] },
            confidence: { type: "number" }
          }
        }
      });

      const data: RTOVehicleData = {
        registration_number: registrationNumber,
        vehicle_make: response.vehicle_make || 'Unknown',
        vehicle_model: response.vehicle_model || 'Unknown',
        vehicle_variant: response.vehicle_variant,
        manufacturing_year: response.manufacturing_year || 2020,
        fuel_type: response.fuel_type || 'petrol',
        transmission: response.transmission || 'manual',
        body_type: response.body_type,
        engine_capacity: response.engine_capacity,
        seating_capacity: response.seating_capacity || 5,
        color: response.color,
        emission_norm: response.emission_norm || 'unknown',
        vehicle_category: 'Personal'
      };

      return {
        success: true,
        data,
        source: 'llm_fallback',
        confidence: response.confidence || 0.7
      };

    } catch (error) {
      console.error('LLM extraction error:', error);
      return {
        success: false,
        error: 'Failed to extract vehicle data',
        source: 'llm_fallback',
        confidence: 0
      };
    }
  }

  // Cache management
  private getFromCache(key: string): RTOResponse | null {
    const expiry = this.cacheExpiry.get(key);
    if (expiry && Date.now() < expiry) {
      return this.cache.get(key) || null;
    }
    
    // Remove expired cache
    this.cache.delete(key);
    this.cacheExpiry.delete(key);
    return null;
  }

  private setCache(key: string, data: RTOResponse): void {
    this.cache.set(key, data);
    this.cacheExpiry.set(key, Date.now() + this.CACHE_DURATION);
  }

  // Clear cache
  clearCache(): void {
    this.cache.clear();
    this.cacheExpiry.clear();
  }

  // Get cache statistics
  getCacheStats(): { size: number; entries: string[] } {
    return {
      size: this.cache.size,
      entries: Array.from(this.cache.keys())
    };
  }

  // Helper methods for mock data
  private getRandomMake(): string {
    const makes = ['Maruti Suzuki', 'Hyundai', 'Honda', 'Tata', 'Mahindra', 'Toyota', 'Ford', 'Renault'];
    return makes[Math.floor(Math.random() * makes.length)];
  }

  private getRandomModel(): string {
    const models = ['Swift', 'i20', 'City', 'Nexon', 'XUV500', 'Innova', 'EcoSport', 'Kwid'];
    return models[Math.floor(Math.random() * models.length)];
  }

  private getRandomVariant(): string {
    const variants = ['VXI', 'ZXI', 'S', 'VX', 'ZX', 'G', 'GL', 'GT'];
    return variants[Math.floor(Math.random() * variants.length)];
  }

  private getRandomFuelType(): 'petrol' | 'diesel' | 'cng' | 'lpg' | 'electric' | 'hybrid' {
    const types: Array<'petrol' | 'diesel' | 'cng' | 'lpg' | 'electric' | 'hybrid'> = ['petrol', 'diesel', 'cng', 'lpg', 'electric', 'hybrid'];
    return types[Math.floor(Math.random() * types.length)];
  }

  private getRandomTransmission(): 'manual' | 'automatic' | 'amt' | 'cvt' {
    const types: Array<'manual' | 'automatic' | 'amt' | 'cvt'> = ['manual', 'automatic', 'amt', 'cvt'];
    return types[Math.floor(Math.random() * types.length)];
  }

  private getRandomBodyType(): string {
    const types = ['Hatchback', 'Sedan', 'SUV', 'MUV', 'Wagon', 'Coupe'];
    return types[Math.floor(Math.random() * types.length)];
  }

  private getRandomColor(): string {
    const colors = ['White', 'Silver', 'Black', 'Red', 'Blue', 'Grey', 'Orange'];
    return colors[Math.floor(Math.random() * colors.length)];
  }
}

// Export singleton instance
export const rtoService = RTOService.getInstance();
