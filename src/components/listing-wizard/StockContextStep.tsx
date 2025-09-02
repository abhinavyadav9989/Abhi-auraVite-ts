import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Calendar, Truck, Package, Clock, CheckCircle, AlertCircle, FileText, Building2 } from 'lucide-react';

interface StockContextStepProps {
  data: any;
  updateData: (data: any) => void;
  dealer: any;
}

const STOCK_TYPES = [
  {
    id: 'dealer_stock' as const,
    title: 'Dealer Stock',
    description: 'Vehicle is currently in your showroom or yard',
    icon: Building2,
    color: 'green'
  },
  {
    id: 'incoming_allocation' as const,
    title: 'Incoming Allocation',
    description: 'Vehicle is allocated but not yet delivered',
    icon: Truck,
    color: 'blue'
  }
];

export default function StockContextStep({ data, updateData, dealer }: StockContextStepProps) {
  const [stockType, setStockType] = useState<'dealer_stock' | 'incoming_allocation'>(
    data.stock_type || 'dealer_stock'
  );

  const handleStockTypeChange = (type: 'dealer_stock' | 'incoming_allocation') => {
    setStockType(type);
    updateData({
      stock_type: type,
      // Clear incoming-specific fields when switching to dealer stock
      ...(type === 'dealer_stock' && {
        allotment_id: null,
        eta: null,
        vin: null,
        allocation_status: null
      })
    });
  };

  const handleFieldChange = (field: string, value: any) => {
    updateData({ [field]: value });
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getAllocationStatus = () => {
    if (!data.eta) return null;

    const eta = new Date(data.eta);
    const today = new Date();
    const daysUntilETA = Math.ceil((eta.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    if (daysUntilETA < 0) {
      return { status: 'overdue', label: 'Overdue', color: 'red' };
    } else if (daysUntilETA === 0) {
      return { status: 'due_today', label: 'Due Today', color: 'orange' };
    } else if (daysUntilETA <= 7) {
      return { status: 'due_soon', label: `Due in ${daysUntilETA} days`, color: 'yellow' };
    } else {
      return { status: 'on_track', label: `Due in ${daysUntilETA} days`, color: 'green' };
    }
  };

  const allocationStatus = getAllocationStatus();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold mb-2">Stock Information</h2>
        <p className="text-gray-600">
          Tell us about the vehicle's current stock status and availability.
        </p>
      </div>

      {/* Stock Type Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="w-5 h-5" />
            Stock Type
          </CardTitle>
        </CardHeader>
        <CardContent>
          <RadioGroup
            value={stockType}
            onValueChange={handleStockTypeChange}
            className="space-y-4"
          >
            {STOCK_TYPES.map((type) => {
              const Icon = type.icon;
              return (
                <div key={type.id} className="flex items-center space-x-3">
                  <RadioGroupItem value={type.id} id={type.id} />
                  <Label
                    htmlFor={type.id}
                    className="flex-1 cursor-pointer"
                  >
                    <div className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50">
                      <div className={`p-2 rounded-lg bg-${type.color}-100`}>
                        <Icon className={`w-5 h-5 text-${type.color}-600`} />
                      </div>
                      <div className="flex-1">
                        <div className="font-medium">{type.title}</div>
                        <div className="text-sm text-gray-600">{type.description}</div>
                      </div>
                    </div>
                  </Label>
                </div>
              );
            })}
          </RadioGroup>
        </CardContent>
      </Card>

      {/* Dealer Stock Section */}
      {stockType === 'dealer_stock' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              Vehicle Available
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Alert>
              <CheckCircle className="w-4 h-4" />
              <AlertDescription>
                This vehicle is currently in your inventory and ready for sale.
                You can proceed to set pricing and publish immediately.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      )}

      {/* Incoming Allocation Section */}
      {stockType === 'incoming_allocation' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Truck className="w-5 h-5 text-blue-600" />
              Incoming Allocation Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Allocation Status */}
            {allocationStatus && (
              <Alert className={`border-${allocationStatus.color}-200 bg-${allocationStatus.color}-50`}>
                <Clock className="w-4 h-4" />
                <AlertDescription className={`text-${allocationStatus.color}-800`}>
                  <strong>{allocationStatus.label}</strong>
                  {allocationStatus.status === 'overdue' && ' - Please check with the manufacturer.'}
                  {allocationStatus.status === 'due_today' && ' - Expected delivery today.'}
                  {allocationStatus.status === 'due_soon' && ' - Monitor delivery closely.'}
                  {allocationStatus.status === 'on_track' && ' - On track for delivery.'}
                </AlertDescription>
              </Alert>
            )}

            {/* Allocation Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="allotment_id">Allotment ID *</Label>
                <Input
                  id="allotment_id"
                  value={data.allotment_id || ''}
                  onChange={(e) => handleFieldChange('allotment_id', e.target.value)}
                  placeholder="e.g., ALT2024001"
                  className="uppercase"
                />
                <p className="text-xs text-gray-500">
                  Manufacturer's allotment reference number
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="eta">Expected Delivery Date *</Label>
                <Input
                  id="eta"
                  type="date"
                  value={data.eta || ''}
                  onChange={(e) => handleFieldChange('eta', e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                />
                <p className="text-xs text-gray-500">
                  When do you expect to receive this vehicle?
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="vin">VIN (if available)</Label>
                <Input
                  id="vin"
                  value={data.vin || ''}
                  onChange={(e) => handleFieldChange('vin', e.target.value)}
                  placeholder="17-character VIN"
                  className="uppercase"
                  maxLength={17}
                />
                <p className="text-xs text-gray-500">
                  Vehicle Identification Number from manufacturer
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="allocation_status">Allocation Status</Label>
                <Select
                  value={data.allocation_status || 'allocated'}
                  onValueChange={(value) => handleFieldChange('allocation_status', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="allocated">Allocated</SelectItem>
                    <SelectItem value="confirmed">Confirmed</SelectItem>
                    <SelectItem value="in_production">In Production</SelectItem>
                    <SelectItem value="ready_for_dispatch">Ready for Dispatch</SelectItem>
                    <SelectItem value="in_transit">In Transit</SelectItem>
                    <SelectItem value="delayed">Delayed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Allocation Summary */}
            {(data.allotment_id || data.eta) && (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="font-medium text-blue-800 mb-2 flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Allocation Summary
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  {data.allotment_id && (
                    <div>
                      <span className="text-gray-600">Allotment ID:</span>
                      <span className="ml-2 font-medium">{data.allotment_id}</span>
                    </div>
                  )}
                  {data.eta && (
                    <div>
                      <span className="text-gray-600">ETA:</span>
                      <span className="ml-2 font-medium">{formatDate(data.eta)}</span>
                    </div>
                  )}
                  {data.allocation_status && (
                    <div>
                      <span className="text-gray-600">Status:</span>
                      <Badge
                        variant="secondary"
                        className="ml-2"
                      >
                        {data.allocation_status.replace('_', ' ')}
                      </Badge>
                    </div>
                  )}
                  {allocationStatus && (
                    <div>
                      <span className="text-gray-600">Timeline:</span>
                      <Badge
                        variant="outline"
                        className={`ml-2 border-${allocationStatus.color}-300 text-${allocationStatus.color}-700`}
                      >
                        {allocationStatus.label}
                      </Badge>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Publish Warning for Incoming */}
            <Alert>
              <AlertCircle className="w-4 h-4" />
              <AlertDescription>
                <strong>Note:</strong> You can publish this vehicle now with "Incoming" status and ETA badge.
                The listing will automatically update when the vehicle arrives and you provide photos.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
