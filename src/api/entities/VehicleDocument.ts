import { db } from '../supabaseClient';
import type { VehicleDocument as VehicleDocumentRow, VehicleDocumentInsert, VehicleDocumentUpdate } from '@/types';
import { validateVehicleDocumentInsert, validateVehicleDocumentUpdate, BusinessRules } from '@/lib/validation';

type FilterObject = Record<string, string | number | boolean | null>;

export class VehicleDocumentEntity {
  private tableName = 'vehicle_documents';

  async list(filters?: FilterObject): Promise<VehicleDocumentRow[]> {
    let query = (db as any).from(this.tableName).select('*');
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        query = query.eq(key, value);
      });
    }
    const { data, error } = await query;
    if (error) throw error;
    return (data || []) as VehicleDocumentRow[];
  }

  async get(id: string): Promise<VehicleDocumentRow | null> {
    const { data, error } = await (db as any)
      .from(this.tableName)
      .select('*')
      .eq('id', id)
      .single();
    if (error) throw error;
    return data as VehicleDocumentRow | null;
  }

  async create(data: unknown): Promise<VehicleDocumentRow> {
    const validatedData = validateVehicleDocumentInsert(data);
    const { data: result, error } = await (db as any)
      .from(this.tableName)
      .insert(validatedData)
      .select()
      .single();
    if (error) throw error;
    return result as VehicleDocumentRow;
  }

  async update(id: string, data: unknown): Promise<VehicleDocumentRow> {
    const validatedData = validateVehicleDocumentUpdate(data);
    const { data: result, error } = await (db as any)
      .from(this.tableName)
      .update(validatedData)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return result as VehicleDocumentRow;
  }

  async delete(id: string): Promise<{ success: boolean }> {
    const { error } = await (db as any)
      .from(this.tableName)
      .delete()
      .eq('id', id);
    if (error) throw error;
    return { success: true };
  }

  async filter(filters: FilterObject): Promise<VehicleDocumentRow[]> {
    let query = (db as any).from(this.tableName).select('*');
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        query = query.eq(key, value);
      });
    }
    const { data, error } = await query;
    if (error) throw error;
    return (data || []) as VehicleDocumentRow[];
  }

  /**
   * Get documents by vehicle ID
   */
  async getByVehicle(vehicleId: string): Promise<VehicleDocumentRow[]> {
    const { data, error } = await (db as any)
      .from(this.tableName)
      .select('*')
      .eq('vehicle_id', vehicleId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return (data || []) as VehicleDocumentRow[];
  }

  /**
   * Get documents by type for a vehicle
   */
  async getByType(vehicleId: string, documentType: VehicleDocumentRow['document_type']): Promise<VehicleDocumentRow[]> {
    const { data, error } = await (db as any)
      .from(this.tableName)
      .select('*')
      .eq('vehicle_id', vehicleId)
      .eq('document_type', documentType)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return (data || []) as VehicleDocumentRow[];
  }

  /**
   * Get verified documents for a vehicle
   */
  async getVerified(vehicleId: string): Promise<VehicleDocumentRow[]> {
    const { data, error } = await (db as any)
      .from(this.tableName)
      .select('*')
      .eq('vehicle_id', vehicleId)
      .eq('is_verified', true)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return (data || []) as VehicleDocumentRow[];
  }

  /**
   * Mark document as verified
   */
  async markAsVerified(id: string, verificationNotes?: string): Promise<VehicleDocumentRow> {
    const updateData = {
      is_verified: true,
      verification_date: new Date().toISOString(),
      ...(verificationNotes && { verification_notes: verificationNotes })
    };

    const { data, error } = await (db as any)
      .from(this.tableName)
      .update(updateData)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data as VehicleDocumentRow;
  }

  /**
   * Validate document
   */
  async validateDocument(file: File, documentType: string) {
    // Validate file using business rules
    const fileValidation = BusinessRules.validateFile(file);
    if (!fileValidation.isValid) {
      return {
        isValid: false,
        errors: fileValidation.errors
      };
    }

    // Additional document type specific validation
    const errors: string[] = [];
    
    if (documentType === 'rc') {
      // RC specific validation
      if (file.size > 5 * 1024 * 1024) { // 5MB limit for RC
        errors.push('RC document must be under 5MB');
      }
    }

    if (documentType === 'insurance') {
      // Insurance specific validation
      const currentDate = new Date();
      // Add insurance expiry validation logic here
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Get document statistics
   */
  async getStatistics(vehicleId?: string): Promise<{
    totalDocuments: number;
    verifiedDocuments: number;
    pendingDocuments: number;
    documentsByType: Record<string, number>;
  }> {
    let query = (db as any).from(this.tableName).select('*');
    
    if (vehicleId) {
      query = query.eq('vehicle_id', vehicleId);
    }

    const { data: documents, error } = await query;
    if (error) throw error;

    const documentList = (documents || []) as VehicleDocumentRow[];
    const totalDocuments = documentList.length;
    const verifiedDocuments = documentList.filter(d => d.is_verified).length;
    const pendingDocuments = totalDocuments - verifiedDocuments;

    const documentsByType = documentList.reduce((acc, doc) => {
      acc[doc.document_type] = (acc[doc.document_type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalDocuments,
      verifiedDocuments,
      pendingDocuments,
      documentsByType
    };
  }
}

export const vehicleDocument = new VehicleDocumentEntity();
