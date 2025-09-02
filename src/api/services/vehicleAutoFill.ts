import { InvokeLLM } from '@/api/integrations';
import { rtoService, RTOResponse, RTOVehicleData } from './rtoService';
import { vinService, VINResponse, VINVehicleData } from './vinService';
import { ocrService, OCRResponse, OCRDocumentData } from './ocrService';

export interface AutoFillResult {
  success: boolean;
  data?: AutoFilledData;
  error?: string;
  source: 'rto' | 'vin' | 'ocr' | 'manual' | 'llm' | 'combined';
  confidence: number;
  fields: string[];
  processingTime?: number;
  sources?: string[];
}

export interface AutoFilledData {
  make?: string;
  model?: string;
  variant?: string;
  year?: number;
  fuel_type?: string;
  transmission?: string;
  body_type?: string;
  engine_capacity?: number;
  seating_capacity?: number;
  color?: string;
  registration_number?: string;
  vin?: string;
  owner_name?: string;
  registration_date?: string;
  expiry_date?: string;
  insurance_status?: string;
  insurance_valid_until?: string;
  puc_status?: string;
  puc_valid_until?: string;
  emission_norm?: string;
  rto_office?: string;
  state?: string;
  city?: string;
  chassis_number?: string;
  engine_number?: string;
  insurance_company?: string;
  insurance_policy_number?: string;
}

export interface AutoFillOptions {
  enableRTO?: boolean;
  enableVIN?: boolean;
  enableOCR?: boolean;
  enableLLM?: boolean;
  timeout?: number;
  retryAttempts?: number;
}

export class VehicleAutoFillService {
  private static instance: VehicleAutoFillService;
  private cache: Map<string, AutoFillResult> = new Map();
  private cacheExpiry: Map<string, number> = new Map();
  private readonly CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

  private constructor() {}

  static getInstance(): VehicleAutoFillService {
    if (!VehicleAutoFillService.instance) {
      VehicleAutoFillService.instance = new VehicleAutoFillService();
    }
    return VehicleAutoFillService.instance;
  }

  // Validation methods for compatibility
  async validateRegistrationNumber(registrationNumber: string): Promise<{ isValid: boolean; format: string }> {
    const pattern = /^[A-Z]{2}[0-9]{1,2}[A-Z]{1,2}[0-9]{4}$/;
    return {
      isValid: pattern.test(registrationNumber),
      format: pattern.test(registrationNumber) ? 'valid' : 'invalid'
    };
  }

  async validateVIN(vin: string): Promise<{ isValid: boolean; format: string; length?: number }> {
    const pattern = /^[A-HJ-NPR-Z0-9]{17}$/;
    return {
      isValid: pattern.test(vin),
      format: pattern.test(vin) ? 'valid' : 'invalid',
      length: vin.length
    };
  }

  async fetchRTOData(registrationNumber: string): Promise<RTOResponse> {
    return rtoService.fetchVehicleData(registrationNumber);
  }

  async decodeVIN(vin: string): Promise<VINResponse> {
    return vinService.decodeVIN(vin);
  }

  // Auto-fill from registration number using RTO service
  async fillFromRegistration(
    registrationNumber: string, 
    options: AutoFillOptions = {}
  ): Promise<AutoFillResult> {
    const startTime = Date.now();
    const cacheKey = `reg_${registrationNumber}`;
    
    // Check cache first
    const cached = this.getFromCache(cacheKey);
    if (cached) {
      return cached;
    }

    try {
      const results: AutoFillResult[] = [];
      const sources: string[] = [];

      // Try RTO service first
      if (options.enableRTO !== false) {
        try {
          const rtoResult = await rtoService.fetchVehicleData(registrationNumber);
          if (rtoResult.success && rtoResult.data) {
            const autoFillData = this.convertRTOToAutoFill(rtoResult.data);
            results.push({
              success: true,
              data: autoFillData,
              source: 'rto',
              confidence: rtoResult.confidence,
              fields: Object.keys(autoFillData).filter(key => autoFillData[key as keyof AutoFilledData] !== undefined),
              processingTime: Date.now() - startTime
            });
            sources.push('RTO API');
          }
        } catch (error) {
          console.warn('RTO service failed:', error);
        }
      }

      // Fallback to LLM if RTO failed or disabled
      if (results.length === 0 && options.enableLLM !== false) {
        try {
          const llmResult = await this.fillFromRegistrationLLM(registrationNumber);
          if (llmResult.success) {
            results.push(llmResult);
            sources.push('LLM');
          }
        } catch (error) {
          console.warn('LLM fallback failed:', error);
        }
      }

      if (results.length === 0) {
        const errorResult: AutoFillResult = {
          success: false,
          error: 'Failed to auto-fill from registration number',
          source: 'rto',
          confidence: 0,
          fields: [],
          processingTime: Date.now() - startTime
        };
        this.setCache(cacheKey, errorResult);
        return errorResult;
      }

      // Merge results if multiple sources
      const finalResult = results.length === 1 ? results[0] : this.mergeResults(results);
      finalResult.sources = sources;
      finalResult.processingTime = Date.now() - startTime;

      this.setCache(cacheKey, finalResult);
      return finalResult;

    } catch (error) {
      console.error('Auto-fill from registration error:', error);
      const errorResult: AutoFillResult = {
        success: false,
        error: 'Failed to auto-fill from registration number',
        source: 'rto',
        confidence: 0,
        fields: [],
        processingTime: Date.now() - startTime
      };
      this.setCache(cacheKey, errorResult);
      return errorResult;
    }
  }

  // Auto-fill from VIN using VIN service
  async fillFromVIN(vin: string, options: AutoFillOptions = {}): Promise<AutoFillResult> {
    const startTime = Date.now();
    const cacheKey = `vin_${vin}`;
    
    // Check cache first
    const cached = this.getFromCache(cacheKey);
    if (cached) {
      return cached;
    }

    try {
      const results: AutoFillResult[] = [];
      const sources: string[] = [];

      // Try VIN service first
      if (options.enableVIN !== false) {
        try {
          const vinResult = await vinService.decodeVIN(vin);
          if (vinResult.success && vinResult.data) {
            const autoFillData = this.convertVINToAutoFill(vinResult.data);
            results.push({
              success: true,
              data: autoFillData,
              source: 'vin',
              confidence: vinResult.confidence,
              fields: Object.keys(autoFillData).filter(key => autoFillData[key as keyof AutoFilledData] !== undefined),
              processingTime: Date.now() - startTime
            });
            sources.push('VIN API');
          }
        } catch (error) {
          console.warn('VIN service failed:', error);
        }
      }

      // Fallback to LLM if VIN service failed or disabled
      if (results.length === 0 && options.enableLLM !== false) {
        try {
          const llmResult = await this.fillFromVINLLM(vin);
          if (llmResult.success) {
            results.push(llmResult);
            sources.push('LLM');
          }
        } catch (error) {
          console.warn('LLM fallback failed:', error);
        }
      }

      if (results.length === 0) {
        const errorResult: AutoFillResult = {
          success: false,
          error: 'Failed to auto-fill from VIN',
          source: 'vin',
          confidence: 0,
          fields: [],
          processingTime: Date.now() - startTime
        };
        this.setCache(cacheKey, errorResult);
        return errorResult;
      }

      // Merge results if multiple sources
      const finalResult = results.length === 1 ? results[0] : this.mergeResults(results);
      finalResult.sources = sources;
      finalResult.processingTime = Date.now() - startTime;

      this.setCache(cacheKey, finalResult);
      return finalResult;

    } catch (error) {
      console.error('Auto-fill from VIN error:', error);
      const errorResult: AutoFillResult = {
        success: false,
        error: 'Failed to auto-fill from VIN',
        source: 'vin',
        confidence: 0,
        fields: [],
        processingTime: Date.now() - startTime
      };
      this.setCache(cacheKey, errorResult);
      return errorResult;
    }
  }

  // Auto-fill from document using OCR service
  async fillFromDocument(
    file: File, 
    options: AutoFillOptions = {}
  ): Promise<AutoFillResult> {
    const startTime = Date.now();
    const cacheKey = `doc_${file.name}_${file.size}`;
    
    // Check cache first
    const cached = this.getFromCache(cacheKey);
    if (cached) {
      return cached;
    }

    try {
      const results: AutoFillResult[] = [];
      const sources: string[] = [];

      // Try OCR service first
      if (options.enableOCR !== false) {
        try {
          const ocrResult = await ocrService.processDocument(file);
          if (ocrResult.success && ocrResult.data) {
            const autoFillData = this.convertOCRToAutoFill(ocrResult.data);
            results.push({
              success: true,
              data: autoFillData,
              source: 'ocr',
              confidence: ocrResult.confidence,
              fields: Object.keys(autoFillData).filter(key => autoFillData[key as keyof AutoFilledData] !== undefined),
              processingTime: Date.now() - startTime
            });
            sources.push('OCR API');
          }
        } catch (error) {
          console.warn('OCR service failed:', error);
        }
      }

      // Fallback to LLM if OCR failed or disabled
      if (results.length === 0 && options.enableLLM !== false) {
        try {
          const llmResult = await this.fillFromDocumentLLM(file);
          if (llmResult.success) {
            results.push(llmResult);
            sources.push('LLM');
          }
        } catch (error) {
          console.warn('LLM fallback failed:', error);
        }

      }

      if (results.length === 0) {
        const errorResult: AutoFillResult = {
          success: false,
          error: 'Failed to auto-fill from document',
          source: 'ocr',
          confidence: 0,
          fields: [],
          processingTime: Date.now() - startTime
        };
        this.setCache(cacheKey, errorResult);
        return errorResult;
      }

      // Merge results if multiple sources
      const finalResult = results.length === 1 ? results[0] : this.mergeResults(results);
      finalResult.sources = sources;
      finalResult.processingTime = Date.now() - startTime;

      this.setCache(cacheKey, finalResult);
      return finalResult;

    } catch (error) {
      console.error('Auto-fill from document error:', error);
      const errorResult: AutoFillResult = {
        success: false,
        error: 'Failed to auto-fill from document',
        source: 'ocr',
        confidence: 0,
        fields: [],
        processingTime: Date.now() - startTime
      };
      this.setCache(cacheKey, errorResult);
      return errorResult;
    }
  }

  // Multi-source auto-fill (combine registration, VIN, and document)
  async fillFromMultipleSources(
    registrationNumber?: string,
    vin?: string,
    document?: File,
    options: AutoFillOptions = {}
  ): Promise<AutoFillResult> {
    const startTime = Date.now();
    const results: AutoFillResult[] = [];
    const sources: string[] = [];

    // Process registration number
    if (registrationNumber) {
      try {
        const regResult = await this.fillFromRegistration(registrationNumber, options);
        if (regResult.success) {
          results.push(regResult);
          sources.push('Registration');
        }
      } catch (error) {
        console.warn('Registration auto-fill failed:', error);
      }
    }

    // Process VIN
    if (vin) {
      try {
        const vinResult = await this.fillFromVIN(vin, options);
        if (vinResult.success) {
          results.push(vinResult);
          sources.push('VIN');
        }
      } catch (error) {
        console.warn('VIN auto-fill failed:', error);
      }
    }

    // Process document
    if (document) {
      try {
        const docResult = await this.fillFromDocument(document, options);
        if (docResult.success) {
          results.push(docResult);
          sources.push('Document');
        }
      } catch (error) {
        console.warn('Document auto-fill failed:', error);
      }
    }

    if (results.length === 0) {
      return {
        success: false,
        error: 'No valid sources provided for auto-fill',
        source: 'combined',
        confidence: 0,
        fields: [],
        processingTime: Date.now() - startTime
      };
    }

    // Merge all results
    const finalResult = this.mergeResults(results);
    finalResult.source = 'combined';
    finalResult.sources = sources;
    finalResult.processingTime = Date.now() - startTime;

    return finalResult;
  }

  // LLM fallback methods
  private async fillFromRegistrationLLM(registrationNumber: string): Promise<AutoFillResult> {
    const response = await InvokeLLM({
      prompt: `Extract vehicle information from the Indian registration number "${registrationNumber}". 
      Provide details like make, model, year, fuel type, transmission, etc. 
      If you cannot determine certain details, use reasonable defaults based on common Indian vehicles.`,
      response_json_schema: {
        type: "object",
        properties: {
          make: { type: "string" },
          model: { type: "string" },
          variant: { type: "string" },
          year: { type: "number" },
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

    const data = this.convertLLMToAutoFill(response);
    const fields = Object.keys(data).filter(key => data[key as keyof AutoFilledData] !== undefined);

    return {
      success: true,
      data,
      source: 'llm',
      confidence: response.confidence || 0.7,
      fields
    };
  }

  private async fillFromVINLLM(vin: string): Promise<AutoFillResult> {
    const response = await InvokeLLM({
      prompt: `Decode the VIN "${vin}" and extract vehicle information. 
      Provide details like make, model, year, body style, engine type, etc. 
      Use the VIN structure to determine manufacturer and other details.`,
      response_json_schema: {
        type: "object",
        properties: {
          make: { type: "string" },
          model: { type: "string" },
          variant: { type: "string" },
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

    const data = this.convertLLMToAutoFill(response);
    const fields = Object.keys(data).filter(key => data[key as keyof AutoFilledData] !== undefined);

    return {
      success: true,
      data,
      source: 'llm',
      confidence: response.confidence || 0.75,
      fields
    };
  }

  private async fillFromDocumentLLM(file: File): Promise<AutoFillResult> {
    const base64Data = await this.fileToBase64(file);
    
    const response = await InvokeLLM({
      prompt: `Extract vehicle information from this document image (base64 encoded). 
      Extract all relevant vehicle details like registration number, owner name, make, model, etc.
      Focus on accuracy and provide confidence scores for each field.`,
      response_json_schema: {
        type: "object",
        properties: {
          registration_number: { type: "string" },
          owner_name: { type: "string" },
          make: { type: "string" },
          model: { type: "string" },
          variant: { type: "string" },
          year: { type: "number" },
          fuel_type: { type: "string" },
          transmission: { type: "string" },
          engine_capacity: { type: "number" },
          seating_capacity: { type: "number" },
          color: { type: "string" },
          registration_date: { type: "string" },
          expiry_date: { type: "string" },
          insurance_company: { type: "string" },
          insurance_policy_number: { type: "string" },
          insurance_valid_until: { type: "string" },
          puc_valid_until: { type: "string" },
          emission_norm: { type: "string" },
          chassis_number: { type: "string" },
          engine_number: { type: "string" },
          rto_office: { type: "string" },
          state: { type: "string" },
          city: { type: "string" },
          confidence: { type: "number" }
        }
      }
    });

    const data = this.convertLLMToAutoFill(response);
    const fields = Object.keys(data).filter(key => data[key as keyof AutoFilledData] !== undefined);

    return {
      success: true,
      data,
      source: 'llm',
      confidence: response.confidence || 0.7,
      fields
    };
  }

  // Data conversion methods
  // Convert RTO data to AutoFilledData format
  private convertRTOToAutoFill(rtoData: RTOVehicleData): AutoFilledData {
    return {
      make: rtoData.vehicle_make,
      model: rtoData.vehicle_model,
      variant: rtoData.vehicle_variant,
      year: rtoData.manufacturing_year,
      fuel_type: rtoData.fuel_type,
      transmission: rtoData.transmission,
      body_type: rtoData.body_type,
      engine_capacity: rtoData.engine_capacity,
      seating_capacity: rtoData.seating_capacity,
      color: rtoData.color,
      registration_number: rtoData.registration_number,
      owner_name: rtoData.owner_name,
      registration_date: rtoData.registration_date,
      expiry_date: rtoData.expiry_date,
      insurance_status: rtoData.insurance_status,
      insurance_valid_until: rtoData.insurance_valid_until,
      puc_status: rtoData.puc_status,
      puc_valid_until: rtoData.puc_valid_until,
      emission_norm: rtoData.emission_norm,
      rto_office: rtoData.rto_office,
      state: rtoData.state,
      city: rtoData.city
    };
  }

  // Convert VIN data to AutoFilledData format
  private convertVINToAutoFill(vinData: VINVehicleData): AutoFilledData {
    return {
      make: vinData.make,
      model: vinData.model,
      variant: vinData.body_style,
      year: vinData.year,
      fuel_type: vinData.fuel_type,
      transmission: vinData.transmission,
      body_type: vinData.body_style,
      engine_capacity: undefined, // VIN doesn't provide engine capacity
      seating_capacity: undefined, // VIN doesn't provide seating capacity
      color: undefined, // VIN doesn't provide color
      vin: vinData.vin,
      chassis_number: undefined, // VIN doesn't provide chassis number separately
      engine_number: undefined // VIN doesn't provide engine number separately
    };
  }

  // Convert OCR data to AutoFilledData format
  private convertOCRToAutoFill(ocrData: OCRDocumentData): AutoFilledData {
    return {
      registration_number: ocrData.registration_number,
      vin: undefined, // OCR doesn't typically provide VIN
      owner_name: ocrData.owner_name,
      registration_date: ocrData.registration_date,
      expiry_date: ocrData.expiry_date,
      insurance_status: undefined, // OCR doesn't provide insurance status
      insurance_valid_until: ocrData.insurance_valid_until,
      puc_status: undefined, // OCR doesn't provide PUC status
      puc_valid_until: ocrData.puc_valid_until,
      emission_norm: ocrData.emission_norm,
      rto_office: ocrData.rto_office,
      state: ocrData.state,
      city: ocrData.city,
      chassis_number: ocrData.chassis_number,
      engine_number: ocrData.engine_number,
      insurance_company: ocrData.insurance_company,
      insurance_policy_number: ocrData.insurance_policy_number,
      make: ocrData.vehicle_make,
      model: ocrData.vehicle_model,
      variant: ocrData.vehicle_variant,
      year: ocrData.manufacturing_year,
      fuel_type: ocrData.fuel_type,
      transmission: ocrData.transmission,
      body_type: undefined, // OCR doesn't typically provide body type
      engine_capacity: ocrData.engine_capacity,
      seating_capacity: ocrData.seating_capacity,
      color: ocrData.color
    };
  }

  // Convert LLM response to AutoFilledData format
  private convertLLMToAutoFill(llmData: Record<string, unknown>): AutoFilledData {
    return {
      make: llmData.make as string,
      model: llmData.model as string,
      variant: llmData.variant as string,
      year: llmData.year as number,
      fuel_type: llmData.fuel_type as string,
      transmission: llmData.transmission as string,
      body_type: llmData.body_type as string,
      engine_capacity: llmData.engine_capacity as number,
      seating_capacity: llmData.seating_capacity as number,
      color: llmData.color as string,
      registration_number: llmData.registration_number as string,
      vin: llmData.vin as string,
      owner_name: llmData.owner_name as string,
      registration_date: llmData.registration_date as string,
      expiry_date: llmData.expiry_date as string,
      insurance_status: llmData.insurance_status as string,
      insurance_valid_until: llmData.insurance_valid_until as string,
      puc_status: llmData.puc_status as string,
      puc_valid_until: llmData.puc_valid_until as string,
      emission_norm: llmData.emission_norm as string,
      rto_office: llmData.rto_office as string,
      state: llmData.state as string,
      city: llmData.city as string,
      chassis_number: llmData.chassis_number as string,
      engine_number: llmData.engine_number as string,
      insurance_company: llmData.insurance_company as string,
      insurance_policy_number: llmData.insurance_policy_number as string
    };
  }

  // Convert file to base64
  private async fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        // Remove data URL prefix
        const base64 = result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  // Merge multiple auto-fill results
  mergeResults(results: AutoFillResult[]): AutoFillResult {
    if (results.length === 0) {
      return {
        success: false,
        error: 'No results to merge',
        source: 'manual',
        confidence: 0,
        fields: []
      };
    }

    if (results.length === 1) {
      return results[0];
    }

    // Merge data from multiple sources, preferring higher confidence
    const mergedData: Partial<AutoFilledData> = {};
    const allFields: string[] = [];
    let totalConfidence = 0;

    // Sort by confidence (highest first)
    const sortedResults = [...results].sort((a, b) => b.confidence - a.confidence);

    sortedResults.forEach(result => {
      if (result.success && result.data) {
        Object.entries(result.data).forEach(([key, value]) => {
          if (value !== undefined && !mergedData[key as keyof AutoFilledData]) {
            (mergedData as any)[key] = value;
            allFields.push(key);
          }
        });
        totalConfidence += result.confidence;
      }
    });

    const averageConfidence = totalConfidence / results.length;

    return {
      success: true,
      data: mergedData as AutoFilledData, // Cast back to AutoFilledData
      source: 'combined',
      confidence: averageConfidence,
      fields: [...new Set(allFields)]
    };
  }

  // Cache management
  private getFromCache(key: string): AutoFillResult | null {
    const expiry = this.cacheExpiry.get(key);
    if (expiry && Date.now() < expiry) {
      return this.cache.get(key) || null;
    }
    
    this.cache.delete(key);
    this.cacheExpiry.delete(key);
    return null;
  }

  private setCache(key: string, data: AutoFillResult): void {
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

  // Validate auto-filled data
  validateAutoFilledData(data: AutoFilledData): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Basic validation rules
    if (data.year && (data.year < 1900 || data.year > new Date().getFullYear() + 1)) {
      errors.push('Invalid manufacturing year');
    }

    if (data.engine_capacity && (data.engine_capacity < 500 || data.engine_capacity > 8000)) {
      errors.push('Invalid engine capacity');
    }

    if (data.seating_capacity && (data.seating_capacity < 2 || data.seating_capacity > 15)) {
      errors.push('Invalid seating capacity');
    }

    if (data.registration_number && !/^[A-Z]{2}[0-9]{1,2}[A-Z]{1,2}[0-9]{4}$/.test(data.registration_number.replace(/\s/g, ''))) {
      errors.push('Invalid registration number format');
    }

    if (data.vin && data.vin.length !== 17) {
      errors.push('Invalid VIN length');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Get service statistics
  getServiceStats(): {
    rtoSuccessRate: number;
    vinSuccessRate: number;
    ocrSuccessRate: number;
    averageProcessingTime: number;
    cacheHitRate: number;
  } {
    // This would track real statistics in a production environment
    return {
      rtoSuccessRate: 0.85,
      vinSuccessRate: 0.92,
      ocrSuccessRate: 0.78,
      averageProcessingTime: 2000,
      cacheHitRate: 0.4
    };
  }
}

// Export singleton instance
export const vehicleAutoFillService = VehicleAutoFillService.getInstance();
