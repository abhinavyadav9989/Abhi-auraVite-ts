import { db } from '@/api/supabaseClient';
import { VehicleDocument, VehicleDocumentInsert } from '@/types';

// OCR Service for document processing and auto-fill
// This service integrates with OCR APIs to extract text from vehicle documents

export interface OCRResult {
  success: boolean;
  confidence: number;
  extracted_data: {
    // RC (Registration Certificate) fields
    registration_number?: string;
    owner_name?: string;
    owner_address?: string;
    registration_date?: string;
    expiry_date?: string;
    vehicle_make?: string;
    vehicle_model?: string;
    vehicle_variant?: string;
    manufacturing_year?: string;
    chassis_number?: string;
    engine_number?: string;
    fuel_type?: string;
    vehicle_class?: string;
    seating_capacity?: string;
    unladen_weight?: string;
    laden_weight?: string;
    body_type?: string;
    color?: string;

    // Insurance fields
    policy_number?: string;
    insurance_provider?: string;
    policy_start_date?: string;
    policy_end_date?: string;
    insured_amount?: string;
    premium_amount?: string;
    nominee_name?: string;
    nominee_relation?: string;

    // PUC fields
    puc_number?: string;
    puc_valid_until?: string;
    puc_test_date?: string;

    // Service records
    service_dates?: string[];
    service_centers?: string[];
    service_types?: string[];
  };
  raw_text: string;
  processing_time: number;
  warnings: string[];
  errors: string[];
}

// Document type configuration
interface OCRDocumentTypeConfig {
  id: OCRDocumentType;
  name: string;
  description: string;
  expectedFields: string[];
}

export interface OCRProcessingOptions {
  documentType: OCRDocumentType;
  enhanceImage?: boolean;
  extractSignatures?: boolean;
  validateData?: boolean;
  language?: string;
}

export interface DocumentUploadResult {
  file_id: string;
  file_url: string;
  file_name: string;
  file_size: number;
  mime_type: string;
  upload_timestamp: string;
}

// Use database types for consistency
export type OCRDocumentType = 'rc' | 'insurance' | 'puc' | 'service_record';

class OCRService {
  private readonly OCR_ENDPOINT = '/api/ocr/process';
  private readonly DOCUMENT_STORAGE_BUCKET = 'vehicle_documents';

  // Document type configurations
  private readonly DOCUMENT_TYPES: Record<OCRDocumentType, OCRDocumentTypeConfig> = {
    rc: {
      id: 'rc',
      name: 'Registration Certificate (RC)',
      description: 'Vehicle registration certificate with owner and vehicle details',
      expectedFields: [
        'registration_number', 'owner_name', 'owner_address', 'registration_date',
        'expiry_date', 'vehicle_make', 'vehicle_model', 'vehicle_variant',
        'manufacturing_year', 'chassis_number', 'engine_number', 'fuel_type',
        'vehicle_class', 'seating_capacity', 'body_type', 'color'
      ]
    },
    insurance: {
      id: 'insurance',
      name: 'Insurance Policy',
      description: 'Vehicle insurance policy document',
      expectedFields: [
        'policy_number', 'insurance_provider', 'policy_start_date',
        'policy_end_date', 'insured_amount', 'premium_amount'
      ]
    },
    puc: {
      id: 'puc',
      name: 'PUC Certificate',
      description: 'Pollution Under Control certificate',
      expectedFields: [
        'puc_number', 'puc_valid_until', 'puc_test_date'
      ]
    },
    service_record: {
      id: 'service_record',
      name: 'Service Record',
      description: 'Vehicle service and maintenance records',
      expectedFields: [
        'service_dates', 'service_centers', 'service_types'
      ]
    }
  };

  // Upload document to storage
  async uploadDocument(
    file: File,
    documentType: OCRDocumentType,
    vehicleId?: string
  ): Promise<DocumentUploadResult> {
    try {
      // Generate unique file name
      const timestamp = Date.now();
      const randomId = Math.random().toString(36).substring(2, 15);
      const fileExtension = file.name.split('.').pop();
      const fileName = `${documentType}_${timestamp}_${randomId}.${fileExtension}`;

      // Upload to Supabase storage
      const { data, error } = await db.storage
        .from(this.DOCUMENT_STORAGE_BUCKET)
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        throw new Error(`Upload failed: ${error.message}`);
      }

      // Get public URL
      const { data: { publicUrl } } = db.storage
        .from(this.DOCUMENT_STORAGE_BUCKET)
        .getPublicUrl(fileName);

      return {
        file_id: data.path,
        file_url: publicUrl,
        file_name: file.name,
        file_size: file.size,
        mime_type: file.type,
        upload_timestamp: new Date().toISOString()
      };

    } catch (error) {
      console.error('Document upload error:', error);
      throw new Error('Failed to upload document');
    }
  }

  // Process document with OCR
  async processDocument(
    file: File,
    options: OCRProcessingOptions
  ): Promise<OCRResult> {
    try {
      const startTime = Date.now();

      // First upload the document
      const uploadResult = await this.uploadDocument(file, options.documentType);

      // Prepare form data for OCR processing
      const formData = new FormData();
      formData.append('file', file);
      formData.append('document_type', options.documentType);
      formData.append('file_url', uploadResult.file_url);
      formData.append('options', JSON.stringify(options));

      // In production, this would call your OCR API
      // For now, we'll simulate OCR processing with mock data
      const ocrResult = await this.mockOCRProcessing(options.documentType, uploadResult.file_name);

      const processingTime = Date.now() - startTime;

      return {
        ...ocrResult,
        processing_time: processingTime
      };

    } catch (error) {
      console.error('OCR processing error:', error);
      throw new Error('Failed to process document with OCR');
    }
  }

  // Mock OCR processing for demonstration
  private async mockOCRProcessing(
    documentType: OCRDocumentType,
    fileName: string
  ): Promise<Omit<OCRResult, 'processing_time'>> {
    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 3000));

    const mockData: Record<OCRDocumentType, Partial<OCRResult['extracted_data']>> = {
      rc: {
        registration_number: 'MH12AB1234',
        owner_name: 'John Doe',
        owner_address: '123 Main Street, Mumbai, Maharashtra 400001',
        registration_date: '2020-01-15',
        expiry_date: '2030-01-15',
        vehicle_make: 'Maruti Suzuki',
        vehicle_model: 'Swift',
        vehicle_variant: 'VXI',
        manufacturing_year: '2020',
        chassis_number: 'MAT12345678901234',
        engine_number: 'K12M1234567',
        fuel_type: 'petrol',
        vehicle_class: 'Motor Car',
        seating_capacity: '5',
        body_type: 'Hatchback',
        color: 'Pearl White'
      },
      insurance: {
        policy_number: 'POL123456789',
        insurance_provider: 'Bajaj Allianz',
        policy_start_date: '2024-01-15',
        policy_end_date: '2025-01-15',
        insured_amount: '500000',
        premium_amount: '8500'
      },
      puc: {
        puc_number: 'PUC123456789',
        puc_valid_until: '2024-07-15',
        puc_test_date: '2024-01-15'
      },
      service_record: {
        service_dates: ['2024-01-15', '2023-07-15', '2023-01-15'],
        service_centers: ['Maruti Suzuki Authorised Service Center', 'Maruti Suzuki Authorised Service Center', 'Maruti Suzuki Authorised Service Center'],
        service_types: ['Regular Service', 'Major Service', 'Regular Service']
      }
    };

    const confidence = 0.85 + Math.random() * 0.10; // 85-95% confidence
    const shouldHaveErrors = Math.random() < 0.2; // 20% chance of some issues

    return {
      success: true,
      confidence,
      extracted_data: mockData[documentType] || {},
      raw_text: `Mock OCR text extracted from ${fileName}`,
      warnings: shouldHaveErrors ? ['Some text was unclear and may need verification'] : [],
      errors: []
    };
  }

  // Validate extracted data against expected patterns
  validateExtractedData(
    data: OCRResult['extracted_data'],
    documentType: OCRDocumentType
  ): { isValid: boolean; issues: string[] } {
    const issues: string[] = [];
    const docType = this.DOCUMENT_TYPES[documentType];

    // Check for required fields
    docType.expectedFields.forEach(field => {
      if (!data[field as keyof typeof data]) {
        issues.push(`Missing required field: ${field}`);
      }
    });

    // Validate specific field formats
    if (data.registration_number && !/^[A-Z]{2}\d{2}[A-Z]{1,2}\d{4}$/.test(data.registration_number)) {
      issues.push('Registration number format appears invalid');
    }

    if (data.policy_number && data.policy_number.length < 5) {
      issues.push('Policy number appears too short');
    }

    return {
      isValid: issues.length === 0,
      issues
    };
  }

  // Get supported document types
  getDocumentTypes(): OCRDocumentTypeConfig[] {
    return Object.values(this.DOCUMENT_TYPES);
  }

  // Get document type by ID
  getDocumentType(typeId: OCRDocumentType): OCRDocumentTypeConfig | null {
    return this.DOCUMENT_TYPES[typeId] || null;
  }

  // Batch process multiple documents
  async batchProcessDocuments(
    files: File[],
    options: OCRProcessingOptions
  ): Promise<OCRResult[]> {
    const results: OCRResult[] = [];

    for (const file of files) {
      try {
        const result = await this.processDocument(file, options);
        results.push(result);
      } catch (error) {
        // Add failed result
        results.push({
          success: false,
          confidence: 0,
          extracted_data: {},
          raw_text: '',
          processing_time: 0,
          warnings: [],
          errors: [`Processing failed: ${error.message}`]
        });
      }
    }

    return results;
  }
}

// Export singleton instance
export const ocrService = new OCRService();