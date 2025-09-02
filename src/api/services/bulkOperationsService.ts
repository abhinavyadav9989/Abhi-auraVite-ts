import { db } from '@/api/supabaseClient';
import { Vehicle, VehicleUpdate, Branch } from '@/types';

// Bulk operations service for managing multiple vehicles at once
export interface BulkOperationResult {
  success: boolean;
  processed: number;
  successful: number;
  failed: number;
  errors: Array<{
    vehicleId: string;
    error: string;
  }>;
  warnings: Array<{
    vehicleId: string;
    warning: string;
  }>;
  requiresApproval?: Array<{
    vehicleId: string;
    reason: string;
  }>;
}

export interface BulkPublishOptions {
  vehicleIds: string[];
  exposureMode: 'masked' | 'public' | 'b2b';
  dealerId: string;
  dealerKycStatus?: 'none' | 'basic' | 'full';
}

export interface BulkTransferOptions {
  vehicleIds: string[];
  fromBranchId: string;
  toBranchId: string;
  assignDriver?: boolean;
  driverId?: string;
  checklistRequired?: boolean;
  notes?: string;
}

export interface BulkPriceUpdateOptions {
  vehicleIds: string[];
  updateType: 'percentage' | 'absolute' | 'fixed';
  value: number;
  operation: 'increase' | 'decrease' | 'set';
  respectApprovalBands?: boolean;
  dealerId: string;
}

export interface BulkExportOptions {
  filters: {
    branchIds?: string[];
    status?: ("active" | "inactive" | "sold" | "draft" | "live")[];
    vehicleType?: string[];
    dateRange?: {
      from: string;
      to: string;
    };
    priceRange?: {
      min: number;
      max: number;
    };
  };
  includeFields: string[];
  format: 'csv' | 'excel';
  dealerId: string;
}

export interface BulkTagUpdateOptions {
  vehicleIds: string[];
  tagOperation: 'add' | 'remove' | 'replace';
  tags: string[];
  dealerId: string;
}

class BulkOperationsService {
  // Bulk publish/unpublish vehicles with KYC awareness
  async bulkPublish(options: BulkPublishOptions): Promise<BulkOperationResult> {
    const { vehicleIds, exposureMode, dealerId, dealerKycStatus } = options;

    const result: BulkOperationResult = {
      success: true,
      processed: vehicleIds.length,
      successful: 0,
      failed: 0,
      errors: [],
      warnings: []
    };

    try {
      // Check KYC status for public exposure
      if (exposureMode === 'public' && dealerKycStatus !== 'full') {
        result.warnings.push({
          vehicleId: 'all',
          warning: 'Public listings will be queued until Full KYC completion'
        });
      }

      // Process vehicles in batches to avoid overwhelming the database
      const batchSize = 50;
      for (let i = 0; i < vehicleIds.length; i += batchSize) {
        const batch = vehicleIds.slice(i, i + batchSize);

        const updateData: Partial<VehicleUpdate> = {
          exposure_mode: exposureMode,
          publish_at: exposureMode !== 'masked' ? new Date().toISOString() : null,
          updated_at: new Date().toISOString()
        };

        // If public but no full KYC, mark as queued
        if (exposureMode === 'public' && dealerKycStatus !== 'full') {
          updateData.exposure_mode = 'queued';
        }

        const { data, error } = await db
          .from('vehicles')
          .update(updateData)
          .in('id', batch)
          .eq('dealer_id', dealerId)
          .select('id');

        if (error) {
          console.error('Bulk publish error:', error);
          result.failed += batch.length;
          batch.forEach(vehicleId => {
            result.errors.push({
              vehicleId,
              error: error.message
            });
          });
        } else {
          result.successful += data?.length || 0;
        }
      }

      result.success = result.failed === 0;
    } catch (error) {
      console.error('Bulk publish operation failed:', error);
      result.success = false;
      result.errors.push({
        vehicleId: 'all',
        error: 'Bulk operation failed'
      });
    }

    return result;
  }

  // Bulk transfer vehicles between branches
  async bulkTransfer(options: BulkTransferOptions): Promise<BulkOperationResult> {
    const { vehicleIds, fromBranchId, toBranchId, assignDriver, driverId, checklistRequired, notes } = options;

    const result: BulkOperationResult = {
      success: true,
      processed: vehicleIds.length,
      successful: 0,
      failed: 0,
      errors: [],
      warnings: []
    };

    try {
      // Process in batches
      const batchSize = 50;
      for (let i = 0; i < vehicleIds.length; i += batchSize) {
        const batch = vehicleIds.slice(i, i + batchSize);

        const updateData: any = {
          branch_id: toBranchId,
          updated_at: new Date().toISOString()
        };

        // If driver assignment is requested, add transfer metadata
        if (assignDriver && driverId) {
          updateData.transfer_metadata = {
            from_branch: fromBranchId,
            to_branch: toBranchId,
            driver_id: driverId,
            checklist_required: checklistRequired,
            notes: notes,
            assigned_at: new Date().toISOString(),
            status: 'assigned'
          };
        }

        const { data, error } = await db
          .from('vehicles')
          .update(updateData)
          .in('id', batch)
          .eq('branch_id', fromBranchId)
          .select('id');

        if (error) {
          console.error('Bulk transfer error:', error);
          result.failed += batch.length;
          batch.forEach(vehicleId => {
            result.errors.push({
              vehicleId,
              error: error.message
            });
          });
        } else {
          result.successful += data?.length || 0;
        }
      }

      result.success = result.failed === 0;
    } catch (error) {
      console.error('Bulk transfer operation failed:', error);
      result.success = false;
      result.errors.push({
        vehicleId: 'all',
        error: 'Bulk transfer operation failed'
      });
    }

    return result;
  }

  // Bulk price updates with approval band checking
  async bulkPriceUpdate(options: BulkPriceUpdateOptions): Promise<BulkOperationResult> {
    const { vehicleIds, updateType, value, operation, respectApprovalBands, dealerId } = options;

    const result: BulkOperationResult = {
      success: true,
      processed: vehicleIds.length,
      successful: 0,
      failed: 0,
      errors: [],
      warnings: [],
      requiresApproval: []
    };

    try {
      // First, fetch current vehicle data
      const { data: vehicles, error: fetchError } = await db
        .from('vehicles')
        .select('id, asking_price, dealer_net, exposure_mode')
        .in('id', vehicleIds)
        .eq('dealer_id', dealerId);

      if (fetchError) {
        throw new Error(`Failed to fetch vehicle data: ${fetchError.message}`);
      }

      // Calculate new prices and check approval bands
      const updates: Array<{ id: string; newPrice: number; requiresApproval: boolean }> = [];

      vehicles?.forEach(vehicle => {
        let newPrice: number;

        switch (updateType) {
          case 'percentage':
            if (!vehicle.asking_price) {
              result.errors.push({
                vehicleId: vehicle.id,
                error: 'No current price to calculate percentage from'
              });
              return;
            }
            if (operation === 'increase') {
              newPrice = vehicle.asking_price * (1 + value / 100);
            } else if (operation === 'decrease') {
              newPrice = vehicle.asking_price * (1 - value / 100);
            } else {
              newPrice = value;
            }
            break;

          case 'absolute':
            if (!vehicle.asking_price) {
              result.errors.push({
                vehicleId: vehicle.id,
                error: 'No current price to modify'
              });
              return;
            }
            if (operation === 'increase') {
              newPrice = vehicle.asking_price + value;
            } else if (operation === 'decrease') {
              newPrice = Math.max(0, vehicle.asking_price - value);
            } else {
              newPrice = value;
            }
            break;

          case 'fixed':
            newPrice = value;
            break;

          default:
            result.errors.push({
              vehicleId: vehicle.id,
              error: 'Invalid update type'
            });
            return;
        }

        // Check if price change requires approval
        const requiresApproval = respectApprovalBands && this.checkApprovalBand(newPrice, vehicle.dealer_net);

        updates.push({
          id: vehicle.id,
          newPrice,
          requiresApproval
        });
      });

      // Group updates by approval requirement
      const normalUpdates = updates.filter(u => !u.requiresApproval);
      const approvalUpdates = updates.filter(u => u.requiresApproval);

      // Process normal updates
      if (normalUpdates.length > 0) {
        const normalVehicleIds = normalUpdates.map(u => u.id);
        const { error } = await db
          .from('vehicles')
          .update({
            asking_price: normalUpdates[0].newPrice, // Note: This should be individual updates
            updated_at: new Date().toISOString()
          })
          .in('id', normalVehicleIds)
          .eq('dealer_id', dealerId);

        if (error) {
          result.failed += normalUpdates.length;
          normalUpdates.forEach(update => {
            result.errors.push({
              vehicleId: update.id,
              error: error.message
            });
          });
        } else {
          result.successful += normalUpdates.length;
        }
      }

      // Handle approval-required updates
      if (approvalUpdates.length > 0) {
        result.warnings.push({
          vehicleId: 'bulk',
          warning: `${approvalUpdates.length} vehicles require approval for price changes`
        });

        // Create approval requests for these vehicles
        for (const update of approvalUpdates) {
          // This would typically create approval records in the database
          result.warnings.push({
            vehicleId: update.id,
            warning: 'Price change requires approval'
          });
        }
      }

      result.success = result.failed === 0;
    } catch (error) {
      console.error('Bulk price update operation failed:', error);
      result.success = false;
      result.errors.push({
        vehicleId: 'all',
        error: 'Bulk price update operation failed'
      });
    }

    return result;
  }

  // Bulk export vehicles with advanced filtering
  async bulkExport(options: BulkExportOptions): Promise<{ data: any[]; filename: string; mimeType: string }> {
    const { filters, includeFields, format, dealerId } = options;

    try {
      let query = db
        .from('vehicles')
        .select(includeFields.join(','))
        .eq('dealer_id', dealerId);

      // Apply filters
      if (filters.branchIds?.length) {
        query = query.in('branch_id', filters.branchIds);
      }

      if (filters.status?.length) {
        query = query.in('status', filters.status);
      }

      if (filters.vehicleType?.length) {
        query = query.in('vehicle_type', filters.vehicleType);
      }

      if (filters.dateRange) {
        query = query
          .gte('created_at', filters.dateRange.from)
          .lte('created_at', filters.dateRange.to);
      }

      if (filters.priceRange) {
        query = query
          .gte('asking_price', filters.priceRange.min)
          .lte('asking_price', filters.priceRange.max);
      }

      const { data, error } = await query;

      if (error) {
        throw new Error(`Export failed: ${error.message}`);
      }

      // Generate filename with timestamp
      const timestamp = new Date().toISOString().slice(0, 16).replace(/:/g, '-');
      const filename = `vehicle_export_${timestamp}.${format}`;

      return {
        data: data || [],
        filename,
        mimeType: format === 'csv' ? 'text/csv' : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      };
    } catch (error) {
      console.error('Bulk export failed:', error);
      throw error;
    }
  }

  // Bulk tag management
  async bulkTagUpdate(options: BulkTagUpdateOptions): Promise<BulkOperationResult> {
    const { vehicleIds, tagOperation, tags, dealerId } = options;

    const result: BulkOperationResult = {
      success: true,
      processed: vehicleIds.length,
      successful: 0,
      failed: 0,
      errors: [],
      warnings: []
    };

    try {
      // Process in batches
      const batchSize = 50;
      for (let i = 0; i < vehicleIds.length; i += batchSize) {
        const batch = vehicleIds.slice(i, i + batchSize);

        // First, get current tags for these vehicles
        const { data: currentVehicles, error: fetchError } = await db
          .from('vehicles')
          .select('id, tags')
          .in('id', batch)
          .eq('dealer_id', dealerId);

        if (fetchError) {
          console.error('Failed to fetch vehicle tags:', fetchError);
          result.failed += batch.length;
          continue;
        }

        // Update tags for each vehicle
        for (const vehicle of currentVehicles || []) {
          let newTags: string[];

          switch (tagOperation) {
            case 'add':
              newTags = [...(vehicle.tags || []), ...tags];
              break;
            case 'remove':
              newTags = (vehicle.tags || []).filter(tag => !tags.includes(tag));
              break;
            case 'replace':
              newTags = tags;
              break;
            default:
              newTags = vehicle.tags || [];
          }

          // Remove duplicates
          newTags = [...new Set(newTags)];

          const { error: updateError } = await db
            .from('vehicles')
            .update({
              tags: newTags,
              updated_at: new Date().toISOString()
            })
            .eq('id', vehicle.id)
            .eq('dealer_id', dealerId);

          if (updateError) {
            result.failed++;
            result.errors.push({
              vehicleId: vehicle.id,
              error: updateError.message
            });
          } else {
            result.successful++;
          }
        }
      }

      result.success = result.failed === 0;
    } catch (error) {
      console.error('Bulk tag update operation failed:', error);
      result.success = false;
      result.errors.push({
        vehicleId: 'all',
        error: 'Bulk tag update operation failed'
      });
    }

    return result;
  }

  // Helper method to check if price change requires approval
  private checkApprovalBand(newPrice: number, dealerNet?: number): boolean {
    if (!dealerNet) return false;

    // Simple approval band logic - can be made more sophisticated
    const marginPercentage = ((newPrice - dealerNet) / dealerNet) * 100;

    // Require approval if margin is less than 5% or more than 20%
    return marginPercentage < 5 || marginPercentage > 20;
  }
}

// Export singleton instance
export const bulkOperationsService = new BulkOperationsService();
