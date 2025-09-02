import { db } from '@/api/supabaseClient';
import type { VehicleDocument } from '@/types';
import { validateVehicleDocumentInsert } from '@/lib/validation';
import { Json } from '@/types';

export interface DocumentUploadResult {
  success: boolean;
  fileUrl?: string;
  documentId?: string;
  error?: string;
  ocrData?: Record<string, unknown>;
}

export class DocumentUploadService {
  private static instance: DocumentUploadService;

  private constructor() {}

  static getInstance(): DocumentUploadService {
    if (!DocumentUploadService.instance) {
      DocumentUploadService.instance = new DocumentUploadService();
    }
    return DocumentUploadService.instance;
  }

  async uploadVehicleDocument(
    vehicleId: string,
    file: File,
    documentType: VehicleDocument['document_type'],
    onProgress?: (progress: number) => void
  ): Promise<DocumentUploadResult> {
    try {
      // Validate file
      if (!this.validateFile(file)) {
        return {
          success: false,
          error: 'Invalid file. Please upload PDF, JPG, PNG files under 10MB.'
        };
      }

      // Generate unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${vehicleId}/${documentType}_${Date.now()}.${fileExt}`;

      // Upload to Supabase Storage
      const { data: uploadData, error: uploadError } = await db.storage
        .from('vehicle-documents')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        return {
          success: false,
          error: 'Failed to upload file to storage.'
        };
      }

      // Get public URL
      const { data: urlData } = db.storage
        .from('vehicle-documents')
        .getPublicUrl(fileName);

      // Process OCR (simulated for now)
      const ocrData = await this.processOCR(file, documentType);

      // Validate document data before database insert
      const documentData = {
        vehicle_id: vehicleId,
        document_type: documentType,
        file_name: file.name,
        file_size: file.size,
        file_type: file.type,
        file_url: urlData.publicUrl,
        ocr_data: ocrData as Json,
        uploaded_at: new Date().toISOString()
      };

      const validatedData = validateVehicleDocumentInsert(documentData);

      // Save document record to database
      const { data, error } = await (db as any)
        .from('vehicle_documents')
        .insert(validatedData)
        .select()
        .single();

      if (error) {
        console.error('Database error:', error);
        // Clean up uploaded file if database insert fails
        await db.storage
          .from('vehicle-documents')
          .remove([fileName]);

        return {
          success: false,
          error: 'Failed to save document record.'
        };
      }

      return {
        success: true,
        fileUrl: urlData.publicUrl,
        documentId: data.id,
        ocrData
      };
    } catch (error) {
      console.error('Document upload error:', error);
      return {
        success: false,
        error: 'Upload failed due to an unexpected error.'
      };
    }
  }

  async getVehicleDocuments(vehicleId: string): Promise<VehicleDocument[]> {
    try {
      const { data, error } = await db
        .from('vehicle_documents')
        .select('*')
        .eq('vehicle_id', vehicleId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching documents:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Error in getVehicleDocuments:', error);
      throw error;
    }
  }

  async deleteVehicleDocument(documentId: string): Promise<boolean> {
    try {
      // Get document info first
      const { data: document, error: fetchError } = await db
        .from('vehicle_documents')
        .select('file_url')
        .eq('id', documentId)
        .single();

      if (fetchError) {
        console.error('Error fetching document:', fetchError);
        throw fetchError;
      }

      // Delete from storage
      if (document.file_url) {
        const fileName = document.file_url.split('/').pop();
        if (fileName) {
          await db.storage
            .from('vehicle-documents')
            .remove([fileName]);
        }
      }

      // Delete from database
      const { error: deleteError } = await db
        .from('vehicle_documents')
        .delete()
        .eq('id', documentId);

      if (deleteError) {
        console.error('Error deleting document:', deleteError);
        throw deleteError;
      }

      return true;
    } catch (error) {
      console.error('Error in deleteVehicleDocument:', error);
      throw error;
    }
  }

  private validateFile(file: File): boolean {
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
    const maxSize = 10 * 1024 * 1024; // 10MB

    return allowedTypes.includes(file.type) && file.size <= maxSize;
  }

  private async processOCR(file: File, documentType: string): Promise<any> {
    // Simulate OCR processing
    // In a real implementation, you would call an OCR service
    console.log(`Processing OCR for ${documentType} document:`, file.name);

    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Return mock OCR data based on document type
    const mockOcrData = {
      processed_at: new Date().toISOString(),
      confidence: 0.85,
      extracted_fields: {},
      raw_text: `Mock OCR text for ${documentType} document`,
      status: 'completed'
    };

    switch (documentType) {
      case 'rc':
        mockOcrData.extracted_fields = {
          registration_number: 'MH12AB1234',
          vin: '1HGBH41JXMN109186',
          owner_name: 'John Doe',
          vehicle_details: {
            make: 'Honda',
            model: 'City',
            year: 2020
          }
        };
        break;
      case 'insurance':
        mockOcrData.extracted_fields = {
          insurance_company: 'ICICI Lombard',
          policy_number: 'ICICI123456',
          valid_until: '2024-12-31'
        };
        break;
      case 'puc':
        mockOcrData.extracted_fields = {
          valid_until: '2024-06-30',
          emission_norm: 'BS6'
        };
        break;
    }

    return mockOcrData;
  }
}

// Export singleton instance
export const documentUploadService = DocumentUploadService.getInstance();
