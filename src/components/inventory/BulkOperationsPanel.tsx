import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Package,
  ArrowUpDown,
  Edit3,
  Archive,
  Tag,
  DollarSign,
  Calendar,
  AlertTriangle,
  CheckCircle,
  Loader2
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { Vehicle } from '@/api/entities';

type BulkOperationId =
  | 'change_status'
  | 'change_inventory_type'
  | 'adjust_pricing'
  | 'add_tags'
  | 'schedule_actions'
  | 'archive_old';

type OperationConfig = {
  new_status?: string;
  new_inventory_type?: string;
  adjustment_type?: 'percentage' | 'fixed';
  adjustment_direction?: 'increase' | 'decrease';
  adjustment_value?: number;
  tags?: string;
  action?: 'schedule_publish' | 'schedule_archive';
  schedule_date?: string; // ISO datetime-local string
  days_threshold?: number;
};

type BulkOperationDef = {
  id: BulkOperationId;
  label: string;
  icon: any;
  description: string;
  options: string[];
};

const BULK_OPERATIONS: BulkOperationDef[] = [
  {
    id: 'change_status',
    label: 'Change Status',
    icon: ArrowUpDown,
    description: 'Update status for multiple vehicles',
    options: ['draft', 'live', 'archived', 'under_service']
  },
  {
    id: 'change_inventory_type',
    label: 'Change Inventory Type',
    icon: Package,
    description: 'Move vehicles between inventory types',
    options: ['public', 'private', 'service', 'specialised']
  },
  {
    id: 'adjust_pricing',
    label: 'Bulk Price Adjustment',
    icon: DollarSign,
    description: 'Apply percentage increase/decrease to prices',
    options: []
  },
  {
    id: 'add_tags',
    label: 'Add Tags',
    icon: Tag,
    description: 'Add tags to multiple vehicles',
    options: []
  },
  {
    id: 'schedule_actions',
    label: 'Schedule Actions',
    icon: Calendar,
    description: 'Schedule future actions on vehicles',
    options: []
  },
  {
    id: 'archive_old',
    label: 'Archive Old Listings',
    icon: Archive,
    description: 'Archive vehicles older than specified days',
    options: []
  }
];

export default function BulkOperationsPanel({ selectedVehicles, vehicles, onComplete }) {
  const initialConfig: OperationConfig = {};
  const [selectedOperation, setSelectedOperation] = useState<BulkOperationId | ''>('');
  const [operationConfig, setOperationConfig] = useState<OperationConfig>(initialConfig);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState(null);
  const { toast } = useToast();

  const selectedVehicleData = vehicles.filter((v: any) => selectedVehicles.has(v.id));

  const handleOperationChange = (operationId: BulkOperationId) => {
    setSelectedOperation(operationId);
    setOperationConfig(initialConfig);
    setResults(null);
  };

  const handleConfigChange = (key: keyof OperationConfig, value: OperationConfig[typeof key]) => {
    setOperationConfig((prev) => ({ ...prev, [key]: value }));
  };

  const executeOperation = async () => {
    if (!selectedOperation || selectedVehicles.size === 0) return;

    setIsProcessing(true);
    setProgress(0);
    const results = { success: [], failed: [] };

    try {
      const totalVehicles = selectedVehicles.size;
      let processed = 0;

      for (const vehicleId of selectedVehicles) {
        try {
          await executeSingleOperation(vehicleId, selectedOperation, operationConfig);
          results.success.push(vehicleId);
        } catch (error) {
          console.error(`Failed to process vehicle ${vehicleId}:`, error);
          results.failed.push({ vehicleId, error: error.message });
        }
        
        processed++;
        setProgress(Math.round((processed / totalVehicles) * 100));
      }

      setResults(results);
      
      toast({
        title: "Bulk Operation Completed",
        description: `Successfully processed ${results.success.length}/${totalVehicles} vehicles.`,
        variant: results.failed.length > 0 ? "destructive" : "default"
      });

      onComplete?.();

    } catch (error) {
      toast({
        title: "Bulk Operation Failed",
        description: "An unexpected error occurred during processing.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const executeSingleOperation = async (vehicleId: string, operation: BulkOperationId, config: OperationConfig) => {
    switch (operation) {
      case 'change_status':
        await Vehicle.update(vehicleId, { status: config.new_status });
        break;
        
      case 'change_inventory_type':
        await Vehicle.update(vehicleId, { inventory_type: config.new_inventory_type });
        break;
        
      case 'adjust_pricing': {
        const vehicle = vehicles.find((v: any) => v.id === vehicleId);
        const currentAsking: number = Number(vehicle?.asking_price ?? 0);
        const baseAdjustment: number = Number(config.adjustment_value ?? 0);
        const adjustment = config.adjustment_type === 'percentage'
          ? (currentAsking * baseAdjustment) / 100
          : baseAdjustment;
        const newPrice = (config.adjustment_direction ?? 'increase') === 'increase'
          ? currentAsking + adjustment
          : Math.max(0, currentAsking - adjustment);
        await Vehicle.update(vehicleId, { asking_price: Math.round(newPrice) });
        break;
      }
        
      case 'add_tags': {
        const currentTags = vehicles.find(v => v.id === vehicleId)?.tags || [];
        const newTags = [...new Set([...currentTags, ...config.tags.split(',').map(t => t.trim())])];
        await Vehicle.update(vehicleId, { tags: newTags });
        break;
      }
        
      case 'schedule_actions': {
        // For now, just update the publish_at field
        if (config.action === 'schedule_publish') {
          await Vehicle.update(vehicleId, { 
            publish_at: config.schedule_date,
            status: 'draft' // Keep as draft until scheduled time
          });
        }
        break;
      }
        
      case 'archive_old': {
        const created = vehicles.find((v: any) => v.id === vehicleId)?.created_date;
        const createdMs = created ? new Date(created).getTime() : Date.now();
        const nowMs = Date.now();
        const daysOld = Math.floor((nowMs - createdMs) / (1000 * 60 * 60 * 24));
        if (daysOld >= (config.days_threshold ?? Number.POSITIVE_INFINITY)) {
          await Vehicle.update(vehicleId, { status: 'archived' });
        }
        break;
      }
        
      default:
        throw new Error(`Unknown operation: ${operation}`);
    }
  };

  const renderOperationConfig = () => {
    const operation = BULK_OPERATIONS.find(op => op.id === selectedOperation);
    if (!operation) return null;

    switch (selectedOperation) {
      case 'change_status':
        return (
          <div className="space-y-3">
            <Label>New Status</Label>
            <Select 
              value={operationConfig.new_status || ''} 
              onValueChange={(value) => handleConfigChange('new_status', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                {operation.options.map(option => (
                  <SelectItem key={option} value={option}>
                    {option.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        );
        
      case 'change_inventory_type':
        return (
          <div className="space-y-3">
            <Label>New Inventory Type</Label>
            <Select 
              value={operationConfig.new_inventory_type || ''} 
              onValueChange={(value) => handleConfigChange('new_inventory_type', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select inventory type" />
              </SelectTrigger>
              <SelectContent>
                {operation.options.map(option => (
                  <SelectItem key={option} value={option}>
                    {option.replace(/\b\w/g, l => l.toUpperCase())}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        );
        
      case 'adjust_pricing':
        return (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Adjustment Type</Label>
                <Select 
                  value={operationConfig.adjustment_type || 'percentage'} 
                  onValueChange={(value) => handleConfigChange('adjustment_type', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percentage">Percentage</SelectItem>
                    <SelectItem value="fixed">Fixed Amount</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Direction</Label>
                <Select 
                  value={operationConfig.adjustment_direction || 'increase'} 
                  onValueChange={(value) => handleConfigChange('adjustment_direction', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="increase">Increase</SelectItem>
                    <SelectItem value="decrease">Decrease</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label>
                Adjustment Value ({operationConfig.adjustment_type === 'percentage' ? '%' : '₹'})
              </Label>
              <Input
                type="number"
                placeholder={operationConfig.adjustment_type === 'percentage' ? 'e.g., 5' : 'e.g., 50000'}
                value={operationConfig.adjustment_value || ''}
                onChange={(e) => handleConfigChange('adjustment_value', parseFloat(e.target.value))}
              />
            </div>
          </div>
        );
        
      case 'add_tags':
        return (
          <div className="space-y-3">
            <Label>Tags to Add</Label>
            <Input
              placeholder="Enter tags separated by commas"
              value={operationConfig.tags || ''}
              onChange={(e) => handleConfigChange('tags', e.target.value)}
            />
            <p className="text-sm text-slate-500">
              Example: premium, certified, warranty-available
            </p>
          </div>
        );
        
      case 'schedule_actions':
        return (
          <div className="space-y-3">
            <Label>Action to Schedule</Label>
            <Select 
              value={operationConfig.action || ''} 
              onValueChange={(value) => handleConfigChange('action', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select action" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="schedule_publish">Schedule Publish</SelectItem>
                <SelectItem value="schedule_archive">Schedule Archive</SelectItem>
              </SelectContent>
            </Select>
            {operationConfig.action && (
              <>
                <Label>Schedule Date & Time</Label>
                <Input
                  type="datetime-local"
                  value={operationConfig.schedule_date || ''}
                  onChange={(e) => handleConfigChange('schedule_date', e.target.value)}
                />
              </>
            )}
          </div>
        );
        
      case 'archive_old':
        return (
          <div className="space-y-3">
            <Label>Archive vehicles older than (days)</Label>
            <Input
              type="number"
              placeholder="e.g., 60"
              value={operationConfig.days_threshold || ''}
              onChange={(e) => handleConfigChange('days_threshold', parseInt(e.target.value))}
            />
            <p className="text-sm text-slate-500">
              Vehicles older than this number of days will be archived
            </p>
          </div>
        );
        
      default:
        return null;
    }
  };

  const canExecute = () => {
    if (!selectedOperation || selectedVehicles.size === 0) return false;
    
    switch (selectedOperation) {
      case 'change_status':
        return !!operationConfig.new_status;
      case 'change_inventory_type':
        return !!operationConfig.new_inventory_type;
      case 'adjust_pricing':
        return operationConfig.adjustment_value > 0;
      case 'add_tags':
        return !!operationConfig.tags?.trim();
      case 'schedule_actions':
        return !!operationConfig.action && !!operationConfig.schedule_date;
      case 'archive_old':
        return operationConfig.days_threshold > 0;
      default:
        return false;
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Edit3 className="w-5 h-5" />
          Bulk Operations
          <Badge variant="secondary">{selectedVehicles.size} selected</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Operation Selection */}
        <div>
          <Label className="text-base font-medium">Choose Operation</Label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
            {BULK_OPERATIONS.map(operation => {
              const Icon = operation.icon;
              return (
                <button
                  key={operation.id}
                  type="button"
                  onClick={() => handleOperationChange(operation.id as BulkOperationId)}
                  className={`p-3 text-left border rounded-lg transition-all hover:border-blue-300 ${
                    selectedOperation === operation.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Icon className="w-4 h-4" />
                    <span className="font-medium">{operation.label}</span>
                  </div>
                  <p className="text-sm text-slate-500">{operation.description}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Operation Configuration */}
        {selectedOperation && (
          <div className="border-t pt-6">
            <Label className="text-base font-medium">Configure Operation</Label>
            <div className="mt-3">
              {renderOperationConfig()}
            </div>
          </div>
        )}

        {/* Progress */}
        {isProcessing && (
          <div className="border-t pt-6">
            <div className="flex justify-between text-sm mb-2">
              <span>Processing vehicles...</span>
              <span>{progress}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        )}

        {/* Results */}
        {results && (
          <div className="border-t pt-6 space-y-3">
            <Label className="text-base font-medium">Operation Results</Label>
            
            {results.success.length > 0 && (
              <Alert className="border-green-200 bg-green-50">
                <CheckCircle className="w-4 h-4" />
                <AlertDescription className="text-green-700">
                  Successfully processed {results.success.length} vehicle(s)
                </AlertDescription>
              </Alert>
            )}

            {results.failed.length > 0 && (
              <Alert className="border-red-200 bg-red-50">
                <AlertTriangle className="w-4 h-4" />
                <AlertDescription className="text-red-700">
                  Failed to process {results.failed.length} vehicle(s):
                  <ul className="mt-2 list-disc list-inside text-sm">
                    {results.failed.slice(0, 5).map((failure, index) => (
                      <li key={index}>{failure.error}</li>
                    ))}
                    {results.failed.length > 5 && (
                      <li>...and {results.failed.length - 5} more</li>
                    )}
                  </ul>
                </AlertDescription>
              </Alert>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-between pt-4 border-t">
          <div className="text-sm text-slate-500">
            {selectedVehicleData.length > 0 && (
              <span>
                Selected: {selectedVehicleData.map(v => `${v.make} ${v.model}`).join(', ').slice(0, 50)}
                {selectedVehicleData.length > 2 ? '...' : ''}
              </span>
            )}
          </div>
          <Button
            onClick={executeOperation}
            disabled={!canExecute() || isProcessing}
            className="min-w-[120px]"
          >
            {isProcessing ? (
              <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Processing</>
            ) : (
              'Execute Operation'
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}