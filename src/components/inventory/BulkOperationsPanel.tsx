import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import {
  Loader2,
  CheckCircle,
  AlertCircle,
  Download,
  Upload,
  DollarSign,
  Truck,
  Tag,
  Settings,
  Users,
  Eye,
  EyeOff,
  Car,
  Building2
} from 'lucide-react';
import { bulkOperationsService } from '@/api/services/bulkOperationsService';
import { useDealerActivationSettings } from '@/hooks/useDealerActivationSettings';
import { useToast } from '@/components/ui/use-toast';

interface BulkOperationsPanelProps {
  selectedVehicles: string[];
  onSelectionChange: (vehicleIds: string[]) => void;
  dealerId: string;
  dealerKycStatus?: 'none' | 'basic' | 'full';
  availableVehicles: Array<{
    id: string;
    registration_number: string;
    make: string;
    model: string;
    year: number;
    asking_price: number;
    status: string;
    branch_id: string;
    exposure_mode: string;
  }>;
  availableBranches: Array<{
    id: string;
    name: string;
    type: string;
  }>;
}

type BulkOperationType = 'publish' | 'transfer' | 'price_update' | 'export' | 'tag_update';

interface OperationState {
  type: BulkOperationType | null;
  isProcessing: boolean;
  progress: number;
  result: any;
}

export default function BulkOperationsPanel({
  selectedVehicles,
  onSelectionChange,
  dealerId,
  dealerKycStatus = 'none',
  availableVehicles,
  availableBranches
}: BulkOperationsPanelProps) {
  const [operationState, setOperationState] = useState<OperationState>({
    type: null,
    isProcessing: false,
    progress: 0,
    result: null
  });

  const [publishOptions, setPublishOptions] = useState({
    exposureMode: 'masked' as 'masked' | 'public' | 'b2b'
  });

  const [transferOptions, setTransferOptions] = useState({
    toBranchId: '',
    assignDriver: false,
    driverId: '',
    checklistRequired: false,
    notes: ''
  });

  const [priceOptions, setPriceOptions] = useState({
    updateType: 'percentage' as 'percentage' | 'absolute' | 'fixed',
    value: 0,
    operation: 'increase' as 'increase' | 'decrease' | 'set',
    respectApprovalBands: true
  });

  const [exportOptions, setExportOptions] = useState({
    format: 'csv' as 'csv' | 'excel',
    includeFields: [
      'registration_number', 'make', 'model', 'year', 'asking_price',
      'status', 'branch_id', 'exposure_mode'
    ]
  });

  const [tagOptions, setTagOptions] = useState({
    operation: 'add' as 'add' | 'remove' | 'replace',
    tags: [] as string[]
  });

  const { checkFeatureAccess } = useDealerActivationSettings();
  const { toast } = useToast();

  // Check if advanced bulk features are available
  const hasAdvancedBulk = checkFeatureAccess('bulk_operations');
  const hasDriverAssignment = checkFeatureAccess('logistics');
  const hasApprovalBands = checkFeatureAccess('approval_workflows');

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      onSelectionChange(availableVehicles.map(v => v.id));
    } else {
      onSelectionChange([]);
    }
  };

  const handleVehicleToggle = (vehicleId: string, checked: boolean) => {
    if (checked) {
      onSelectionChange([...selectedVehicles, vehicleId]);
    } else {
      onSelectionChange(selectedVehicles.filter(id => id !== vehicleId));
    }
  };

  const executeBulkOperation = async (operationType: BulkOperationType) => {
    setOperationState({
      type: operationType,
      isProcessing: true,
      progress: 0,
      result: null
    });

    try {
      let result;

      switch (operationType) {
        case 'publish':
          result = await bulkOperationsService.bulkPublish({
            vehicleIds: selectedVehicles,
            exposureMode: publishOptions.exposureMode,
            dealerId,
            dealerKycStatus
          });
          break;

        case 'transfer':
          result = await bulkOperationsService.bulkTransfer({
            vehicleIds: selectedVehicles,
            fromBranchId: availableVehicles.find(v => selectedVehicles.includes(v.id))?.branch_id || '',
            toBranchId: transferOptions.toBranchId,
            assignDriver: transferOptions.assignDriver,
            driverId: transferOptions.driverId,
            checklistRequired: transferOptions.checklistRequired,
            notes: transferOptions.notes
          });
          break;

        case 'price_update':
          result = await bulkOperationsService.bulkPriceUpdate({
            vehicleIds: selectedVehicles,
            updateType: priceOptions.updateType,
            value: priceOptions.value,
            operation: priceOptions.operation,
            respectApprovalBands: priceOptions.respectApprovalBands,
            dealerId
          });
          break;

        case 'export':
          result = await bulkOperationsService.bulkExport({
            filters: {},
            includeFields: exportOptions.includeFields,
            format: exportOptions.format,
            dealerId
          });
          break;

        case 'tag_update':
          result = await bulkOperationsService.bulkTagUpdate({
            vehicleIds: selectedVehicles,
            tagOperation: tagOptions.operation,
            tags: tagOptions.tags,
            dealerId
          });
          break;
      }

      setOperationState(prev => ({
        ...prev,
        isProcessing: false,
        progress: 100,
        result
      }));

      // Show success/error message
      if (result.success) {
        toast({
          title: 'Bulk Operation Completed',
          description: `Successfully processed ${result.successful} of ${result.processed} vehicles`,
        });
      } else {
        toast({
          title: 'Bulk Operation Partially Failed',
          description: `${result.successful} successful, ${result.failed} failed`,
          variant: 'destructive'
        });
      }

    } catch (error) {
      console.error('Bulk operation failed:', error);
      setOperationState(prev => ({
        ...prev,
        isProcessing: false,
        result: { success: false, error: error.message }
      }));

      toast({
        title: 'Bulk Operation Failed',
        description: error.message,
        variant: 'destructive'
      });
    }
  };

  const getOperationIcon = (type: BulkOperationType) => {
    switch (type) {
      case 'publish': return publishOptions.exposureMode === 'public' ? <Eye /> : <EyeOff />;
      case 'transfer': return <Truck />;
      case 'price_update': return <DollarSign />;
      case 'export': return <Download />;
      case 'tag_update': return <Tag />;
      default: return <Settings />;
    }
  };

  const getOperationTitle = (type: BulkOperationType) => {
    switch (type) {
      case 'publish': return 'Bulk Publish';
      case 'transfer': return 'Bulk Transfer';
      case 'price_update': return 'Bulk Price Update';
      case 'export': return 'Bulk Export';
      case 'tag_update': return 'Bulk Tag Update';
      default: return 'Bulk Operation';
    }
  };

  if (selectedVehicles.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <Car className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Vehicles Selected</h3>
          <p className="text-gray-600">
            Select vehicles from the list above to perform bulk operations
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Selection Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            {selectedVehicles.length} Vehicle{selectedVehicles.length !== 1 ? 's' : ''} Selected
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-4">
            <Checkbox
              checked={selectedVehicles.length === availableVehicles.length}
              onCheckedChange={handleSelectAll}
            />
            <Label>Select All ({availableVehicles.length})</Label>
          </div>

          {/* Selected Vehicles List */}
          <div className="max-h-32 overflow-y-auto space-y-2">
            {availableVehicles
              .filter(vehicle => selectedVehicles.includes(vehicle.id))
              .map(vehicle => (
                <div key={vehicle.id} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                  <Checkbox
                    checked={true}
                    onCheckedChange={(checked) => handleVehicleToggle(vehicle.id, checked as boolean)}
                  />
                  <div className="flex-1">
                    <div className="font-medium">
                      {vehicle.registration_number} - {vehicle.make} {vehicle.model} ({vehicle.year})
                    </div>
                    <div className="text-sm text-gray-600">
                      ₹{vehicle.asking_price?.toLocaleString()} • {vehicle.status}
                    </div>
                  </div>
                  <Badge variant="outline">{vehicle.exposure_mode}</Badge>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>

      {/* Bulk Operations */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Publish/Unpublish */}
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2">
              {getOperationIcon('publish')}
              <span className="font-medium">Publish</span>
              <span className="text-xs text-gray-500">Change visibility</span>
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Bulk Publish Vehicles</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="exposure_mode">Exposure Mode</Label>
                <Select
                  value={publishOptions.exposureMode}
                  onValueChange={(value: any) => setPublishOptions(prev => ({ ...prev, exposureMode: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="masked">Masked (Price on Request)</SelectItem>
                    <SelectItem value="public">Public (Full Details)</SelectItem>
                    <SelectItem value="b2b">B2B (Dealer Only)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {publishOptions.exposureMode === 'public' && dealerKycStatus !== 'full' && (
                <Alert>
                  <AlertCircle className="w-4 h-4" />
                  <AlertDescription>
                    Public listings will be queued until Full KYC completion.
                  </AlertDescription>
                </Alert>
              )}

              <Button
                onClick={() => executeBulkOperation('publish')}
                disabled={operationState.isProcessing}
                className="w-full"
              >
                {operationState.isProcessing ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <Upload className="w-4 h-4 mr-2" />
                )}
                Publish {selectedVehicles.length} Vehicles
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Transfer */}
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2">
              {getOperationIcon('transfer')}
              <span className="font-medium">Transfer</span>
              <span className="text-xs text-gray-500">Move between branches</span>
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Bulk Transfer Vehicles</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="to_branch">Destination Branch</Label>
                <Select
                  value={transferOptions.toBranchId}
                  onValueChange={(value) => setTransferOptions(prev => ({ ...prev, toBranchId: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select destination branch" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableBranches.map(branch => (
                      <SelectItem key={branch.id} value={branch.id}>
                        {branch.name} ({branch.type})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {hasDriverAssignment && (
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="assign_driver"
                      checked={transferOptions.assignDriver}
                      onCheckedChange={(checked) =>
                        setTransferOptions(prev => ({ ...prev, assignDriver: checked as boolean }))
                      }
                    />
                    <Label htmlFor="assign_driver">Assign Driver</Label>
                  </div>

                  {transferOptions.assignDriver && (
                    <div className="space-y-2">
                      <Label htmlFor="driver_id">Driver ID</Label>
                      <Input
                        id="driver_id"
                        value={transferOptions.driverId}
                        onChange={(e) => setTransferOptions(prev => ({ ...prev, driverId: e.target.value }))}
                        placeholder="Enter driver ID"
                      />
                    </div>
                  )}

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="checklist_required"
                      checked={transferOptions.checklistRequired}
                      onCheckedChange={(checked) =>
                        setTransferOptions(prev => ({ ...prev, checklistRequired: checked as boolean }))
                      }
                    />
                    <Label htmlFor="checklist_required">Require Photo Checklist</Label>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="transfer_notes">Notes (Optional)</Label>
                <Input
                  id="transfer_notes"
                  value={transferOptions.notes}
                  onChange={(e) => setTransferOptions(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Transfer notes..."
                />
              </div>

              <Button
                onClick={() => executeBulkOperation('transfer')}
                disabled={operationState.isProcessing || !transferOptions.toBranchId}
                className="w-full"
              >
                {operationState.isProcessing ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <Truck className="w-4 h-4 mr-2" />
                )}
                Transfer {selectedVehicles.length} Vehicles
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Price Update */}
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2">
              {getOperationIcon('price_update')}
              <span className="font-medium">Price Update</span>
              <span className="text-xs text-gray-500">Change pricing</span>
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Bulk Price Update</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="update_type">Update Type</Label>
                  <Select
                    value={priceOptions.updateType}
                    onValueChange={(value: any) => setPriceOptions(prev => ({ ...prev, updateType: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="percentage">Percentage</SelectItem>
                      <SelectItem value="absolute">Absolute Amount</SelectItem>
                      <SelectItem value="fixed">Fixed Price</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="operation">Operation</Label>
                  <Select
                    value={priceOptions.operation}
                    onValueChange={(value: any) => setPriceOptions(prev => ({ ...prev, operation: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="increase">Increase</SelectItem>
                      <SelectItem value="decrease">Decrease</SelectItem>
                      <SelectItem value="set">Set To</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="value">
                  {priceOptions.updateType === 'percentage' ? 'Percentage (%)' :
                   priceOptions.updateType === 'absolute' ? 'Amount (₹)' : 'New Price (₹)'}
                </Label>
                <Input
                  id="value"
                  type="number"
                  value={priceOptions.value}
                  onChange={(e) => setPriceOptions(prev => ({ ...prev, value: parseFloat(e.target.value) || 0 }))}
                  placeholder={priceOptions.updateType === 'percentage' ? '10' : '50000'}
                />
              </div>

              {hasApprovalBands && (
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="respect_bands"
                    checked={priceOptions.respectApprovalBands}
                    onCheckedChange={(checked) =>
                      setPriceOptions(prev => ({ ...prev, respectApprovalBands: checked as boolean }))
                    }
                  />
                  <Label htmlFor="respect_bands">Require approval for price changes outside bands</Label>
                </div>
              )}

              <Button
                onClick={() => executeBulkOperation('price_update')}
                disabled={operationState.isProcessing || priceOptions.value <= 0}
                className="w-full"
              >
                {operationState.isProcessing ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <DollarSign className="w-4 h-4 mr-2" />
                )}
                Update Prices for {selectedVehicles.length} Vehicles
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Export */}
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2">
              {getOperationIcon('export')}
              <span className="font-medium">Export</span>
              <span className="text-xs text-gray-500">Download data</span>
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Export Vehicles</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="export_format">Export Format</Label>
                <Select
                  value={exportOptions.format}
                  onValueChange={(value: any) => setExportOptions(prev => ({ ...prev, format: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="csv">CSV</SelectItem>
                    <SelectItem value="excel">Excel</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button
                onClick={() => executeBulkOperation('export')}
                disabled={operationState.isProcessing}
                className="w-full"
              >
                {operationState.isProcessing ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <Download className="w-4 h-4 mr-2" />
                )}
                Export {selectedVehicles.length} Vehicles
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Tag Management */}
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2">
              {getOperationIcon('tag_update')}
              <span className="font-medium">Tags</span>
              <span className="text-xs text-gray-500">Manage tags</span>
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Bulk Tag Management</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="tag_operation">Operation</Label>
                <Select
                  value={tagOptions.operation}
                  onValueChange={(value: any) => setTagOptions(prev => ({ ...prev, operation: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="add">Add Tags</SelectItem>
                    <SelectItem value="remove">Remove Tags</SelectItem>
                    <SelectItem value="replace">Replace All Tags</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="tags">Tags (comma-separated)</Label>
                <Input
                  id="tags"
                  value={tagOptions.tags.join(', ')}
                  onChange={(e) => setTagOptions(prev => ({
                    ...prev,
                    tags: e.target.value.split(',').map(tag => tag.trim()).filter(tag => tag)
                  }))}
                  placeholder="urgent, featured, low_mileage"
                />
              </div>

              <Button
                onClick={() => executeBulkOperation('tag_update')}
                disabled={operationState.isProcessing || tagOptions.tags.length === 0}
                className="w-full"
              >
                {operationState.isProcessing ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <Tag className="w-4 h-4 mr-2" />
                )}
                Update Tags for {selectedVehicles.length} Vehicles
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Operation Progress */}
      {operationState.isProcessing && (
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4 mb-4">
              <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
              <div className="flex-1">
                <h3 className="font-medium">
                  Processing {getOperationTitle(operationState.type!)}
                </h3>
                <p className="text-sm text-gray-600">
                  {operationState.progress}% complete
                </p>
              </div>
            </div>
            <Progress value={operationState.progress} className="w-full" />
          </CardContent>
        </Card>
      )}

      {/* Operation Results */}
      {operationState.result && !operationState.isProcessing && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {operationState.result.success ? (
                <CheckCircle className="w-5 h-5 text-green-600" />
              ) : (
                <AlertCircle className="w-5 h-5 text-red-600" />
              )}
              Operation Results
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{operationState.result.successful}</div>
                <div className="text-sm text-gray-600">Successful</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">{operationState.result.failed}</div>
                <div className="text-sm text-gray-600">Failed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{operationState.result.processed}</div>
                <div className="text-sm text-gray-600">Total</div>
              </div>
            </div>

            {/* Warnings */}
            {operationState.result.warnings?.length > 0 && (
              <Alert className="mb-4">
                <AlertCircle className="w-4 h-4" />
                <AlertDescription>
                  <strong>Warnings:</strong>
                  <ul className="mt-2 list-disc list-inside">
                    {operationState.result.warnings.map((warning: any, index: number) => (
                      <li key={index}>{warning.warning}</li>
                    ))}
                  </ul>
                </AlertDescription>
              </Alert>
            )}

            {/* Errors */}
            {operationState.result.errors?.length > 0 && (
              <Alert variant="destructive">
                <AlertCircle className="w-4 h-4" />
                <AlertDescription>
                  <strong>Errors:</strong>
                  <ul className="mt-2 list-disc list-inside">
                    {operationState.result.errors.map((error: any, index: number) => (
                      <li key={index}>{error.error}</li>
                    ))}
                  </ul>
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}