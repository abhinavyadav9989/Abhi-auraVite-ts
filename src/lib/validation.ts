import { z } from 'zod';
import type { Database } from '@/types';

// Extract types from database for validation
type VehicleInsert = Database['public']['Tables']['vehicles']['Insert'];
type VehicleUpdate = Database['public']['Tables']['vehicles']['Update'];
type VehicleDocumentInsert = Database['public']['Tables']['vehicle_documents']['Insert'];
type VehicleDocumentUpdate = Database['public']['Tables']['vehicle_documents']['Update'];
type VehicleConditionInsert = Database['public']['Tables']['vehicle_condition']['Insert'];
type VehicleConditionUpdate = Database['public']['Tables']['vehicle_condition']['Update'];
type DealerInsert = Database['public']['Tables']['dealers']['Insert'];
type DealerUpdate = Database['public']['Tables']['dealers']['Update'];

// ===== VEHICLE VALIDATION SCHEMAS =====

export const VehicleInsertSchema = z.object({
  // Required fields
  dealer_id: z.string().uuid('Invalid dealer ID'),
  make: z.string().min(1, 'Make is required').max(100, 'Make too long'),
  model: z.string().min(1, 'Model is required').max(100, 'Model too long'),
  year: z.number().int().min(1900).max(new Date().getFullYear() + 1, 'Invalid year'),
  
  // Optional fields with validation
  asking_price: z.number().positive('Price must be positive').optional(),
  base_cost: z.number().positive('Base cost must be positive').optional(),
  shown_price: z.number().positive('Shown price must be positive').optional(),
  dealer_price: z.number().positive('Dealer price must be positive').optional(),
  dealer_net: z.number().positive('Dealer net must be positive').optional(),
  dealer_margin_target: z.number().min(0).max(100, 'Margin must be 0-100%').optional(),
  
  // String fields
  body_type: z.string().max(50).optional(),
  color: z.string().max(50).optional(),
  fuel_type: z.string().max(50).optional(),
  transmission: z.string().max(50).optional(),
  engine_size: z.string().max(50).optional(),
  variant: z.string().max(100).optional(),
  vehicle_type: z.string().max(50).optional(),
  
  // Location fields
  location_city: z.string().max(100).optional(),
  location_state: z.string().max(100).optional(),
  rto_location: z.string().max(100).optional(),
  
  // Numeric fields
  kilometers: z.number().positive('Kilometers must be positive').optional(),
  mileage: z.number().positive('Mileage must be positive').optional(),
  seating_capacity: z.number().int().min(1).max(50).optional(),
  condition_rating: z.number().min(1).max(10, 'Rating must be 1-10').optional(),
  
  // Boolean fields
  accident_history: z.boolean().optional(),
  emi_available: z.boolean().optional(),
  exchange_available: z.boolean().optional(),
  is_featured: z.boolean().optional(),
  is_negotiable: z.boolean().optional(),
  is_urgent: z.boolean().optional(),
  paint_ok: z.boolean().optional(),
  tyres_ok: z.boolean().optional(),
  test_drive_available: z.boolean().optional(),
  rc_available: z.boolean().optional(),
  service_history_available: z.boolean().optional(),
  service_records_uploaded: z.boolean().optional(),
  
  // Array fields
  features: z.array(z.string()).optional(),
  documents: z.array(z.string()).optional(),
  images: z.array(z.string().url('Invalid image URL')).optional(),
  videos: z.array(z.string().url('Invalid video URL')).optional(),
  tags: z.array(z.string()).optional(),
  suggested_categories: z.array(z.string()).optional(),
  vehicle_category: z.array(z.string()).optional(),
  
  // JSON fields
  auto_filled_fields: z.any().optional(),
  market_data: z.any().optional(),
  consignment_terms: z.any().optional(),
  custom_attributes: z.any().optional(),
  buyer_requirements: z.any().optional(),
  financing_options: z.any().optional(),
  landed_cost_components: z.any().optional(),
  service_history: z.any().optional(),
  viewing_schedule: z.any().optional(),
  warranty_info: z.any().optional(),
  ai_metadata: z.any().optional(),
  
  // String fields with specific validation
  registration_number: z.string().regex(/^[A-Z]{2}[0-9]{1,2}[A-Z]{1,2}[0-9]{4}$/, 'Invalid registration number format').optional(),
  description: z.string().max(2000, 'Description too long').optional(),
  condition_notes: z.string().max(1000, 'Condition notes too long').optional(),
  seller_notes: z.string().max(1000, 'Seller notes too long').optional(),
  exposure_mode: z.string().max(50).optional(),
  inventory_type: z.string().max(50).optional(),
  stock_type: z.string().max(50).optional(),
  ownership: z.string().max(50).optional(),
  identification_method: z.string().max(50).optional(),
  insurance_status: z.string().max(50).optional(),
  listing_fee_type: z.string().max(50).optional(),
  
  // Date fields
  insurance_valid_until: z.string().datetime('Invalid date format').optional(),
  puc_valid_until: z.string().datetime('Invalid date format').optional(),
  publish_at: z.string().datetime('Invalid date format').optional(),
  
  // Enum fields
  status: z.enum(['active', 'inactive', 'sold', 'draft', 'live']).optional(),
  
  // Numeric fields with validation
  listing_fee_value: z.number().positive('Listing fee must be positive').optional(),
  market_price_min: z.number().positive('Market price min must be positive').optional(),
  market_price_max: z.number().positive('Market price max must be positive').optional(),
  
  // String fields with URL validation
  hero_image_url: z.string().url('Invalid hero image URL').optional(),
  inspection_report_url: z.string().url('Invalid inspection report URL').optional(),
  
  // AI fields
  ai_confidence: z.string().max(50).optional(),
  ai_reasoning: z.string().max(1000, 'AI reasoning too long').optional(),
  
  // ID fields
  branch_id: z.string().uuid('Invalid branch ID').optional(),
  created_by: z.string().uuid('Invalid created by ID').optional(),
  
  // Timestamps (auto-generated, so optional)
  created_at: z.string().datetime().optional(),
  updated_at: z.string().datetime().optional(),
  id: z.string().uuid().optional(),
});

export const VehicleUpdateSchema = VehicleInsertSchema.partial();

// ===== VEHICLE DOCUMENT VALIDATION SCHEMAS =====

export const VehicleDocumentInsertSchema = z.object({
  document_type: z.string().min(1, 'Document type is required'),
  file_url: z.string().url('Invalid file URL'),
  
  // Optional fields
  vehicle_id: z.string().uuid('Invalid vehicle ID').optional(),
  file_name: z.string().max(255, 'File name too long').optional(),
  file_size: z.number().positive('File size must be positive').optional(),
  file_type: z.string().max(100, 'File type too long').optional(),
  ocr_data: z.any().optional(),
  is_verified: z.boolean().optional(),
  verification_date: z.string().datetime().optional(),
  verification_notes: z.string().max(1000, 'Verification notes too long').optional(),
  uploaded_at: z.string().datetime().optional(),
  
  // Auto-generated fields
  created_at: z.string().datetime().optional(),
  updated_at: z.string().datetime().optional(),
  id: z.string().uuid().optional(),
});

export const VehicleDocumentUpdateSchema = VehicleDocumentInsertSchema.partial();

// ===== VEHICLE CONDITION VALIDATION SCHEMAS =====

export const VehicleConditionInsertSchema = z.object({
  vehicle_id: z.string().uuid('Invalid vehicle ID'),
  
  // Required fields
  overall_rating: z.number().min(1).max(10, 'Overall rating must be 1-10'),
  
  // Optional fields
  brake_pad_percentage: z.number().min(0).max(100, 'Brake pad percentage must be 0-100').optional(),
  tyre_tread_mm: z.number().positive('Tyre tread must be positive').optional(),
  
  // String fields
  interior_condition: z.string().max(50, 'Interior condition too long').optional(),
  mechanical_condition: z.string().max(50, 'Mechanical condition too long').optional(),
  paint_condition: z.string().max(50, 'Paint condition too long').optional(),
  tyre_condition: z.string().max(50, 'Tyre condition too long').optional(),
  notes: z.string().max(1000, 'Notes too long').optional(),
  
  // Date fields
  inspection_date: z.string().datetime('Invalid inspection date format').optional(),
  
  // URL fields
  inspection_report_url: z.string().url('Invalid inspection report URL').optional(),
  
  // Array fields
  odb_codes: z.array(z.string()).optional(),
  
  // JSON fields
  paint_meter_readings: z.any().optional(),
  
  // ID fields
  inspector_id: z.string().uuid('Invalid inspector ID').optional(),
  
  // Auto-generated fields
  created_at: z.string().datetime().optional(),
  updated_at: z.string().datetime().optional(),
  id: z.string().uuid().optional(),
});

export const VehicleConditionUpdateSchema = VehicleConditionInsertSchema.partial();

// ===== DEALER VALIDATION SCHEMAS =====

export const DealerInsertSchema = z.object({
  // Required fields
  email: z.string().email('Invalid email format'),
  
  // Optional fields
  name: z.string().max(200, 'Dealer name too long').optional(),
  phone: z.string().regex(/^[0-9]{10,15}$/, 'Invalid phone number format').optional(),
  business_name: z.string().max(200, 'Business name too long').optional(),
  address: z.string().max(500, 'Address too long').optional(),
  city: z.string().max(100, 'City too long').optional(),
  state: z.string().max(100, 'State too long').optional(),
  pincode: z.string().regex(/^[0-9]{6}$/, 'Invalid pincode format').optional(),
  
  // Business fields
  gstin: z.string().regex(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/, 'Invalid GSTIN format').optional(),
  pan_number: z.string().regex(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, 'Invalid PAN number format').optional(),
  
  // Status fields
  is_verified: z.boolean().optional(),
  verification_status: z.string().optional(),
  
  // Auto-generated fields
  created_at: z.string().datetime().optional(),
  updated_at: z.string().datetime().optional(),
  id: z.string().uuid().optional(),
});

export const DealerUpdateSchema = DealerInsertSchema.partial();

// ===== BUSINESS RULE VALIDATION =====

export const BusinessRules = {
  // Vehicle pricing rules
  validatePricing: (data: VehicleInsert | VehicleUpdate) => {
    const errors: string[] = [];
    
    if (data.asking_price && data.base_cost) {
      if (data.asking_price < data.base_cost) {
        errors.push('Asking price cannot be less than base cost');
      }
    }
    
    if (data.asking_price && data.shown_price) {
      if (data.asking_price < data.shown_price) {
        errors.push('Asking price cannot be less than shown price');
      }
    }
    
    if (data.market_price_min && data.market_price_max) {
      if (data.market_price_min > data.market_price_max) {
        errors.push('Market price minimum cannot be greater than maximum');
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  },
  
  // Vehicle year validation
  validateYear: (year: number) => {
    const currentYear = new Date().getFullYear();
    if (year < 1900 || year > currentYear + 1) {
      return {
        isValid: false,
        error: `Year must be between 1900 and ${currentYear + 1}`
      };
    }
    return { isValid: true };
  },
  
  // Registration number validation
  validateRegistrationNumber: (regNumber: string) => {
    const pattern = /^[A-Z]{2}[0-9]{1,2}[A-Z]{1,2}[0-9]{4}$/;
    if (!pattern.test(regNumber)) {
      return {
        isValid: false,
        error: 'Invalid registration number format (e.g., MH12AB1234)'
      };
    }
    return { isValid: true };
  },
  
  // File validation
  validateFile: (file: File) => {
    const errors: string[] = [];
    
    // File size validation (10MB limit)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      errors.push('File size must be less than 10MB');
    }
    
    // File type validation
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      errors.push('File type must be JPEG, PNG, WebP, or PDF');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }
};

// ===== VALIDATION FUNCTIONS =====

export const validateVehicleInsert = (data: unknown): VehicleInsert => {
  const validated = VehicleInsertSchema.parse(data);
  const businessValidation = BusinessRules.validatePricing(validated as any);
  
  if (!businessValidation.isValid) {
    throw new Error(`Business validation failed: ${businessValidation.errors.join(', ')}`);
  }
  
  return validated as VehicleInsert;
};

export const validateVehicleUpdate = (data: unknown): VehicleUpdate => {
  const validated = VehicleUpdateSchema.parse(data);
  const businessValidation = BusinessRules.validatePricing(validated as any);
  
  if (!businessValidation.isValid) {
    throw new Error(`Business validation failed: ${businessValidation.errors.join(', ')}`);
  }
  
  return validated as VehicleUpdate;
};

export const validateVehicleDocumentInsert = (data: unknown): VehicleDocumentInsert => {
  return VehicleDocumentInsertSchema.parse(data) as VehicleDocumentInsert;
};

export const validateVehicleDocumentUpdate = (data: unknown): VehicleDocumentUpdate => {
  return VehicleDocumentUpdateSchema.parse(data) as VehicleDocumentUpdate;
};

export const validateVehicleConditionInsert = (data: unknown): VehicleConditionInsert => {
  return VehicleConditionInsertSchema.parse(data) as VehicleConditionInsert;
};

export const validateVehicleConditionUpdate = (data: unknown): VehicleConditionUpdate => {
  return VehicleConditionUpdateSchema.parse(data) as VehicleConditionUpdate;
};

export const validateDealerInsert = (data: unknown): DealerInsert => {
  return DealerInsertSchema.parse(data) as DealerInsert;
};

export const validateDealerUpdate = (data: unknown): DealerUpdate => {
  return DealerUpdateSchema.parse(data) as DealerUpdate;
};

// ===== TYPE EXPORTS =====

export type ValidatedVehicleInsert = z.infer<typeof VehicleInsertSchema>;
export type ValidatedVehicleUpdate = z.infer<typeof VehicleUpdateSchema>;
export type ValidatedVehicleDocumentInsert = z.infer<typeof VehicleDocumentInsertSchema>;
export type ValidatedVehicleDocumentUpdate = z.infer<typeof VehicleDocumentUpdateSchema>;
export type ValidatedVehicleConditionInsert = z.infer<typeof VehicleConditionInsertSchema>;
export type ValidatedVehicleConditionUpdate = z.infer<typeof VehicleConditionUpdateSchema>;
export type ValidatedDealerInsert = z.infer<typeof DealerInsertSchema>;
export type ValidatedDealerUpdate = z.infer<typeof DealerUpdateSchema>;
