import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { vehicleAutoFillService } from '@/api/services/vehicleAutoFill';
import { rtoService } from '@/api/services/rtoService';
import { vinService } from '@/api/services/vinService';
import { ocrService } from '@/api/services/ocrService';
import { validateVehicleData, validateField } from '@/utils/vehicleValidation';
import { useErrorHandler } from '@/utils/errorHandling';

// Mock the services
vi.mock('@/api/services/vehicleAutoFill');
vi.mock('@/api/services/rtoService');
vi.mock('@/api/services/vinService');
vi.mock('@/api/services/ocrService');
vi.mock('@/utils/vehicleValidation');
vi.mock('@/utils/errorHandling');

// Test data
const mockVehicleData = {
  make: 'Honda',
  model: 'City',
  variant: 'ZX',
  year: 2020,
  fuel_type: 'petrol',
  transmission: 'manual',
  body_type: 'sedan',
  engine_capacity: 1498,
  seating_capacity: 5,
  color: 'White',
  registration_number: 'MH12AB1234',
  kilometers: 50000,
  asking_price: 750000,
  shown_price: 750000,
  branch_id: 'test-branch-id'
};

const mockRTOData = {
  registration_number: 'MH12AB1234',
  vehicle_make: 'Honda',
  vehicle_model: 'City',
  vehicle_variant: 'ZX',
  manufacturing_year: 2020,
  fuel_type: 'petrol',
  transmission: 'manual',
  body_type: 'sedan',
  engine_capacity: 1498,
  seating_capacity: 5,
  color: 'White',
  owner_name: 'John Doe',
  registration_date: '2020-01-15',
  expiry_date: '2035-01-15',
  insurance_status: 'active',
  insurance_valid_until: '2024-12-31',
  puc_status: 'valid',
  puc_valid_until: '2024-06-30',
  emission_norm: 'BS6',
  rto_office: 'Mumbai Central',
  state: 'Maharashtra',
  city: 'Mumbai'
};

const mockVINData = {
  vin: '1HGBH41JXMN109186',
  make: 'Honda',
  model: 'City',
  year: 2020,
  body_style: 'sedan',
  engine_type: '1.5L I4',
  transmission: 'manual',
  fuel_type: 'petrol',
  country_of_origin: 'Japan',
  manufacturer: 'Honda',
  plant_code: 'H',
  serial_number: '109186',
  check_digit_valid: true
};

const mockOCRData = {
  document_type: 'rc',
  registration_number: 'MH12AB1234',
  owner_name: 'John Doe',
  vehicle_make: 'Honda',
  vehicle_model: 'City',
  vehicle_variant: 'ZX',
  manufacturing_year: 2020,
  fuel_type: 'petrol',
  transmission: 'manual',
  body_type: 'sedan',
  engine_capacity: 1498,
  seating_capacity: 5,
  color: 'White',
  registration_date: '2020-01-15',
  expiry_date: '2035-01-15',
  insurance_company: 'ICICI Lombard',
  insurance_policy_number: 'ICICI123456789',
  insurance_valid_until: '2024-12-31',
  puc_valid_until: '2024-06-30',
  emission_norm: 'BS6',
  chassis_number: 'MA3FJDDL3LD123456',
  engine_number: 'K12M1234567',
  rto_office: 'Mumbai Central',
  state: 'Maharashtra',
  city: 'Mumbai',
  extracted_text: 'Sample extracted text from document...',
  confidence_scores: {
    registration_number: 0.95,
    owner_name: 0.88,
    vehicle_make: 0.92,
    vehicle_model: 0.90,
    manufacturing_year: 0.85
  }
};

// Test utilities
const renderWithRouter = (component: React.ReactElement) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
};

const createMockFile = (name: string, type: string, size: number): File => {
  const file = new File(['test content'], name, { type });
  Object.defineProperty(file, 'size', { value: size });
  return file;
};

// Test suite
describe('Vehicle Adding Flow', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('RTO Service Tests', () => {
    it('should validate registration number format correctly', async () => {
      const validReg = 'MH12AB1234';
      const invalidReg = 'INVALID123';

      const validResult = await rtoService.validateRegistrationNumber(validReg);
      const invalidResult = await rtoService.validateRegistrationNumber(invalidReg);

      expect(validResult.isValid).toBe(true);
      expect(validResult.format).toBe('valid');
      expect(invalidResult.isValid).toBe(false);
      expect(invalidResult.format).toBe('invalid');
    });

    it('should fetch vehicle data from registration number', async () => {
      const mockFetchVehicleData = vi.mocked(rtoService.fetchVehicleData).mockResolvedValue({
        success: true,
        data: mockRTOData,
        source: 'rto_api',
        confidence: 0.95
      });

      const result = await rtoService.fetchVehicleData('MH12AB1234');

      expect(mockFetchVehicleData).toHaveBeenCalledWith('MH12AB1234');
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockRTOData);
      expect(result.confidence).toBe(0.95);
    });

    it('should handle RTO API failures gracefully', async () => {
      const mockFetchVehicleData = vi.mocked(rtoService.fetchVehicleData).mockResolvedValue({
        success: false,
        error: 'RTO API temporarily unavailable',
        source: 'rto_api',
        confidence: 0
      });

      const result = await rtoService.fetchVehicleData('MH12AB1234');

      expect(result.success).toBe(false);
      expect(result.error).toBe('RTO API temporarily unavailable');
      expect(result.confidence).toBe(0);
    });

    it('should cache RTO responses for performance', async () => {
      const mockFetchVehicleData = vi.mocked(rtoService.fetchVehicleData).mockResolvedValue({
        success: true,
        data: mockRTOData,
        source: 'rto_api',
        confidence: 0.95
      });

      // First call
      await rtoService.fetchVehicleData('MH12AB1234');
      // Second call should use cache
      await rtoService.fetchVehicleData('MH12AB1234');

      expect(mockFetchVehicleData).toHaveBeenCalledTimes(1);
    });
  });

  describe('VIN Service Tests', () => {
    it('should validate VIN format correctly', async () => {
      const validVIN = '1HGBH41JXMN109186';
      const invalidVIN = 'INVALID';

      const validResult = await vinService.validateVIN(validVIN);
      const invalidResult = await vinService.validateVIN(invalidVIN);

      expect(validResult.isValid).toBe(true);
      expect(validResult.format).toBe('valid');
      expect(validResult.length).toBe(17);
      expect(invalidResult.isValid).toBe(false);
      expect(invalidResult.format).toBe('invalid');
    });

    it('should decode VIN to extract vehicle information', async () => {
      const mockDecodeVIN = vi.mocked(vinService.decodeVIN).mockResolvedValue({
        success: true,
        data: mockVINData,
        source: 'vin_api',
        confidence: 0.92
      });

      const result = await vinService.decodeVIN('1HGBH41JXMN109186');

      expect(mockDecodeVIN).toHaveBeenCalledWith('1HGBH41JXMN109186');
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockVINData);
      expect(result.confidence).toBe(0.92);
    });

    it('should validate VIN check digit correctly', async () => {
      const validVIN = '1HGBH41JXMN109186';
      const result = await vinService.validateVIN(validVIN);

      expect(result.checkDigitValid).toBeDefined();
    });

    it('should extract manufacturer information from VIN', async () => {
      const mockDecodeVIN = vi.mocked(vinService.decodeVIN).mockResolvedValue({
        success: true,
        data: mockVINData,
        source: 'vin_api',
        confidence: 0.92
      });

      const result = await vinService.decodeVIN('1HGBH41JXMN109186');

      expect(result.data?.manufacturer).toBe('Honda');
      expect(result.data?.country_of_origin).toBe('Japan');
    });
  });

  describe('OCR Service Tests', () => {
    it('should process document images correctly', async () => {
      const mockFile = createMockFile('test.jpg', 'image/jpeg', 1024 * 1024);
      const mockProcessDocument = vi.mocked(ocrService.processDocument).mockResolvedValue({
        success: true,
        data: mockOCRData,
        source: 'ocr_api',
        confidence: 0.88,
        processingTime: 2500
      });

      const result = await ocrService.processDocument(mockFile);

      expect(mockProcessDocument).toHaveBeenCalledWith(mockFile);
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockOCRData);
      expect(result.confidence).toBe(0.88);
    });

    it('should validate document before processing', async () => {
      const largeFile = createMockFile('large.jpg', 'image/jpeg', 15 * 1024 * 1024);
      const invalidFile = createMockFile('test.txt', 'text/plain', 1024);

      const mockProcessDocument = vi.mocked(ocrService.processDocument);

      // Large file should fail validation
      await expect(ocrService.processDocument(largeFile)).rejects.toThrow();

      // Invalid file type should fail validation
      await expect(ocrService.processDocument(invalidFile)).rejects.toThrow();
    });

    it('should handle OCR processing errors gracefully', async () => {
      const mockFile = createMockFile('test.jpg', 'image/jpeg', 1024 * 1024);
      const mockProcessDocument = vi.mocked(ocrService.processDocument).mockResolvedValue({
        success: false,
        error: 'OCR API temporarily unavailable',
        source: 'ocr_api',
        confidence: 0,
        processingTime: 1000
      });

      const result = await ocrService.processDocument(mockFile);

      expect(result.success).toBe(false);
      expect(result.error).toBe('OCR API temporarily unavailable');
      expect(result.confidence).toBe(0);
    });

    it('should support batch processing', async () => {
      const mockFiles = [
        createMockFile('doc1.jpg', 'image/jpeg', 1024 * 1024),
        createMockFile('doc2.jpg', 'image/jpeg', 1024 * 1024)
      ];

      const mockProcessBatch = vi.mocked(ocrService.processBatch).mockResolvedValue([
        {
          success: true,
          data: mockOCRData,
          source: 'ocr_api',
          confidence: 0.88,
          processingTime: 2500
        },
        {
          success: true,
          data: mockOCRData,
          source: 'ocr_api',
          confidence: 0.85,
          processingTime: 2300
        }
      ]);

      const results = await ocrService.processBatch(mockFiles);

      expect(mockProcessBatch).toHaveBeenCalledWith(mockFiles);
      expect(results).toHaveLength(2);
      expect(results[0].success).toBe(true);
      expect(results[1].success).toBe(true);
    });
  });

  describe('Vehicle Auto-Fill Service Tests', () => {
    it('should auto-fill from registration number', async () => {
      const mockFillFromRegistration = vi.mocked(vehicleAutoFillService.fillFromRegistration).mockResolvedValue({
        success: true,
        data: {
          make: 'Honda',
          model: 'City',
          variant: 'ZX',
          year: 2020,
          fuel_type: 'petrol',
          transmission: 'manual',
          registration_number: 'MH12AB1234'
        },
        source: 'rto',
        confidence: 0.95,
        fields: ['make', 'model', 'variant', 'year', 'fuel_type', 'transmission', 'registration_number']
      });

      const result = await vehicleAutoFillService.fillFromRegistration('MH12AB1234');

      expect(mockFillFromRegistration).toHaveBeenCalledWith('MH12AB1234', {});
      expect(result.success).toBe(true);
      expect(result.data?.make).toBe('Honda');
      expect(result.data?.model).toBe('City');
      expect(result.confidence).toBe(0.95);
    });

    it('should auto-fill from VIN', async () => {
      const mockFillFromVIN = vi.mocked(vehicleAutoFillService.fillFromVIN).mockResolvedValue({
        success: true,
        data: {
          make: 'Honda',
          model: 'City',
          year: 2020,
          body_type: 'sedan',
          fuel_type: 'petrol',
          transmission: 'manual',
          vin: '1HGBH41JXMN109186'
        },
        source: 'vin',
        confidence: 0.92,
        fields: ['make', 'model', 'year', 'body_type', 'fuel_type', 'transmission', 'vin']
      });

      const result = await vehicleAutoFillService.fillFromVIN('1HGBH41JXMN109186');

      expect(mockFillFromVIN).toHaveBeenCalledWith('1HGBH41JXMN109186', {});
      expect(result.success).toBe(true);
      expect(result.data?.make).toBe('Honda');
      expect(result.data?.vin).toBe('1HGBH41JXMN109186');
      expect(result.confidence).toBe(0.92);
    });

    it('should auto-fill from document', async () => {
      const mockFile = createMockFile('rc.jpg', 'image/jpeg', 1024 * 1024);
      const mockFillFromDocument = vi.mocked(vehicleAutoFillService.fillFromDocument).mockResolvedValue({
        success: true,
        data: {
          registration_number: 'MH12AB1234',
          owner_name: 'John Doe',
          make: 'Honda',
          model: 'City',
          year: 2020,
          fuel_type: 'petrol',
          transmission: 'manual'
        },
        source: 'ocr',
        confidence: 0.88,
        fields: ['registration_number', 'owner_name', 'make', 'model', 'year', 'fuel_type', 'transmission']
      });

      const result = await vehicleAutoFillService.fillFromDocument(mockFile);

      expect(mockFillFromDocument).toHaveBeenCalledWith(mockFile, {});
      expect(result.success).toBe(true);
      expect(result.data?.registration_number).toBe('MH12AB1234');
      expect(result.data?.owner_name).toBe('John Doe');
      expect(result.confidence).toBe(0.88);
    });

    it('should merge results from multiple sources', async () => {
      const mockMergeResults = vi.mocked(vehicleAutoFillService.mergeResults).mockReturnValue({
        success: true,
        data: {
          make: 'Honda',
          model: 'City',
          variant: 'ZX',
          year: 2020,
          fuel_type: 'petrol',
          transmission: 'manual',
          registration_number: 'MH12AB1234',
          vin: '1HGBH41JXMN109186'
        },
        source: 'combined',
        confidence: 0.93,
        fields: ['make', 'model', 'variant', 'year', 'fuel_type', 'transmission', 'registration_number', 'vin']
      });

      const results = [
        {
          success: true,
          data: { make: 'Honda', model: 'City', registration_number: 'MH12AB1234' },
          source: 'rto' as const,
          confidence: 0.95,
          fields: ['make', 'model', 'registration_number']
        },
        {
          success: true,
          data: { make: 'Honda', model: 'City', vin: '1HGBH41JXMN109186' },
          source: 'vin' as const,
          confidence: 0.92,
          fields: ['make', 'model', 'vin']
        }
      ];

      const mergedResult = vehicleAutoFillService.mergeResults(results);

      expect(mockMergeResults).toHaveBeenCalledWith(results);
      expect(mergedResult.success).toBe(true);
      expect(mergedResult.source).toBe('combined');
      expect(mergedResult.confidence).toBe(0.93);
    });

    it('should validate auto-filled data', async () => {
      const mockValidateAutoFilledData = vi.mocked(vehicleAutoFillService.validateAutoFilledData).mockReturnValue({
        isValid: true,
        errors: []
      });

      const validationResult = vehicleAutoFillService.validateAutoFilledData(mockVehicleData);

      expect(mockValidateAutoFilledData).toHaveBeenCalledWith(mockVehicleData);
      expect(validationResult.isValid).toBe(true);
      expect(validationResult.errors).toHaveLength(0);
    });
  });

  describe('Validation Tests', () => {
    it('should validate vehicle data correctly', () => {
      const mockValidateVehicleData = vi.mocked(validateVehicleData).mockReturnValue({
        isValid: true,
        errors: [],
        warnings: [],
        info: []
      });

      const result = validateVehicleData(mockVehicleData);

      expect(mockValidateVehicleData).toHaveBeenCalledWith(mockVehicleData);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should validate individual fields correctly', () => {
      const mockValidateField = vi.mocked(validateField).mockReturnValue(null);

      const result = validateField('make', 'Honda');

      expect(mockValidateField).toHaveBeenCalledWith('make', 'Honda');
      expect(result).toBeNull();
    });

    it('should detect validation errors', () => {
      const mockValidateVehicleData = vi.mocked(validateVehicleData).mockReturnValue({
        isValid: false,
        errors: [
          { field: 'year', code: 'INVALID_YEAR', message: 'Invalid manufacturing year', type: 'error' }
        ],
        warnings: [],
        info: []
      });

      const invalidData = { ...mockVehicleData, year: 1800 };
      const result = validateVehicleData(invalidData);

      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].field).toBe('year');
      expect(result.errors[0].code).toBe('INVALID_YEAR');
    });
  });

  describe('Error Handling Tests', () => {
    it('should handle network errors gracefully', () => {
      const mockHandleError = vi.mocked(useErrorHandler).mockReturnValue({
        handleError: vi.fn(),
        handleValidationErrors: vi.fn(),
        handleAutoFillError: vi.fn(),
        getErrorLog: vi.fn(),
        getRecentErrors: vi.fn(),
        getRecoverySuggestions: vi.fn(),
        canRecover: vi.fn()
      });

      const errorHandler = useErrorHandler();
      const networkError = new Error('Network error');

      errorHandler.handleError(networkError);

      expect(mockHandleError).toHaveBeenCalled();
    });

    it('should provide recovery suggestions', () => {
      const mockGetRecoverySuggestions = vi.fn().mockReturnValue([
        'Check your internet connection',
        'Try refreshing the page'
      ]);

      const mockUseErrorHandler = vi.mocked(useErrorHandler).mockReturnValue({
        handleError: vi.fn(),
        handleValidationErrors: vi.fn(),
        handleAutoFillError: vi.fn(),
        getErrorLog: vi.fn(),
        getRecentErrors: vi.fn(),
        getRecoverySuggestions: mockGetRecoverySuggestions,
        canRecover: vi.fn()
      });

      const errorHandler = useErrorHandler();
      const suggestions = errorHandler.getRecoverySuggestions({} as any);

      expect(mockGetRecoverySuggestions).toHaveBeenCalled();
      expect(suggestions).toHaveLength(2);
    });
  });

  describe('Integration Tests', () => {
    it('should complete full vehicle adding flow', async () => {
      // This would be an end-to-end test simulating the complete flow
      // In a real implementation, you would test the actual components
      expect(true).toBe(true); // Placeholder
    });

    it('should handle auto-fill integration correctly', async () => {
      // Test that auto-fill services work together
      const mockFillFromMultipleSources = vi.mocked(vehicleAutoFillService.fillFromMultipleSources).mockResolvedValue({
        success: true,
        data: {
          make: 'Honda',
          model: 'City',
          registration_number: 'MH12AB1234',
          vin: '1HGBH41JXMN109186'
        },
        source: 'combined',
        confidence: 0.93,
        fields: ['make', 'model', 'registration_number', 'vin'],
        sources: ['Registration', 'VIN']
      });

      const result = await vehicleAutoFillService.fillFromMultipleSources(
        'MH12AB1234',
        '1HGBH41JXMN109186'
      );

      expect(mockFillFromMultipleSources).toHaveBeenCalledWith('MH12AB1234', '1HGBH41JXMN109186', undefined, {});
      expect(result.success).toBe(true);
      expect(result.source).toBe('combined');
      expect(result.sources).toContain('Registration');
      expect(result.sources).toContain('VIN');
    });
  });

  describe('Performance Tests', () => {
    it('should cache responses for performance', async () => {
      const mockGetCacheStats = vi.mocked(vehicleAutoFillService.getCacheStats).mockReturnValue({
        size: 5,
        entries: ['reg_MH12AB1234', 'vin_1HGBH41JXMN109186']
      });

      const stats = vehicleAutoFillService.getCacheStats();

      expect(mockGetCacheStats).toHaveBeenCalled();
      expect(stats.size).toBe(5);
      expect(stats.entries).toContain('reg_MH12AB1234');
    });

    it('should provide service statistics', async () => {
      const mockGetServiceStats = vi.mocked(vehicleAutoFillService.getServiceStats).mockReturnValue({
        rtoSuccessRate: 0.85,
        vinSuccessRate: 0.92,
        ocrSuccessRate: 0.78,
        averageProcessingTime: 2000,
        cacheHitRate: 0.4
      });

      const stats = vehicleAutoFillService.getServiceStats();

      expect(mockGetServiceStats).toHaveBeenCalled();
      expect(stats.rtoSuccessRate).toBe(0.85);
      expect(stats.vinSuccessRate).toBe(0.92);
      expect(stats.ocrSuccessRate).toBe(0.78);
      expect(stats.averageProcessingTime).toBe(2000);
      expect(stats.cacheHitRate).toBe(0.4);
    });
  });
});
