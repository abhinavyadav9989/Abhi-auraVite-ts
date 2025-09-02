import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Vehicle } from '@/api/entities';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, Globe, EyeOff, Building2, AlertTriangle } from 'lucide-react';
import {
  getDealerTier,
  getTenantStage,
  getAvailableExposureModes,
  canPublishExposureMode,
  VehicleExposureMode,
  TenantStage
} from '@/lib/tierConfig';

interface ExposureModeOption {
  value: VehicleExposureMode;
  label: string;
  description: string;
  icon: React.ReactNode;
  requiresKyc?: boolean;
  requiresAdvanced?: boolean;
}

type InventoryTypeSwitcherProps = {
  vehicles: any[];
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  dealer?: any;
}

export default function InventoryTypeSwitcher({ vehicles, isOpen, onClose, onSuccess, dealer }: InventoryTypeSwitcherProps) {
  const [targetMode, setTargetMode] = useState<VehicleExposureMode>('public');
  const [isUpdating, setIsUpdating] = useState(false);
  const { toast } = useToast();

  // Get tenant information
  const tier = getDealerTier(dealer);
  const tenantStage = getTenantStage(dealer);
  const availableModes = getAvailableExposureModes(tier);

  // Define exposure mode options
  const EXPOSURE_MODES: ExposureModeOption[] = [
    {
      value: 'public',
      label: 'Public',
      description: 'Visible in marketplace with full details',
      icon: <Globe className="w-4 h-4" />,
      requiresKyc: true
    },
    {
      value: 'masked',
      label: 'Masked',
      description: 'Price on request - appears in marketplace',
      icon: <EyeOff className="w-4 h-4" />
    },
    {
      value: 'b2b',
      label: 'B2B',
      description: 'Dealer-to-dealer marketplace',
      icon: <Building2 className="w-4 h-4" />,
      requiresAdvanced: true
    }
  ];

  const handleUpdate = async () => {
    // Validate that the selected mode is allowed
    if (!canPublishExposureMode(targetMode, tier, tenantStage)) {
      toast({
        title: 'Cannot Publish',
        description: targetMode === 'public'
          ? 'Public listings require KYC completion. Complete your verification first.'
          : 'B2B listings require Advanced tier.',
        variant: 'destructive',
      });
      return;
    }

    setIsUpdating(true);
    try {
      // Update vehicles with new exposure mode
      const updates = vehicles.map(v =>
        Vehicle.update(v.id, {
          inventory_type: targetMode,
          market_status: targetMode === 'masked' ? 'live' :
                        targetMode === 'public' && tenantStage === 'kyc_complete' ? 'live' :
                        targetMode === 'public' ? 'queued_kyc' : 'live'
        })
      );
      await Promise.all(updates);

      toast({
        title: 'Update Successful',
        description: `${vehicles.length} vehicle(s) set to ${targetMode} exposure.`,
      });
      onSuccess();
    } catch (error) {
      console.error('Failed to update exposure modes:', error);
      toast({
        title: 'Update Failed',
        description: 'An error occurred while updating the vehicles. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsUpdating(false);
      onClose();
    }
  };

  const getModeStatus = (mode: ExposureModeOption) => {
    if (!availableModes.includes(mode.value)) {
      return { disabled: true, reason: mode.requiresAdvanced ? 'Requires Advanced tier' : 'Not available' };
    }

    if (mode.requiresKyc && tenantStage !== 'kyc_complete') {
      return { disabled: true, reason: 'Requires KYC completion' };
    }

    return { disabled: false, reason: '' };
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Set Exposure Mode</DialogTitle>
          <DialogDescription>
            Choose how {vehicles.length} selected vehicle(s) will appear in the marketplace.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          {EXPOSURE_MODES.map((mode) => {
            const status = getModeStatus(mode);
            return (
              <div
                key={mode.value}
                className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                  targetMode === mode.value
                    ? 'border-blue-500 bg-blue-50'
                    : status.disabled
                    ? 'border-gray-200 bg-gray-50 cursor-not-allowed opacity-60'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => !status.disabled && setTargetMode(mode.value)}
              >
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-full ${
                    targetMode === mode.value ? 'bg-blue-100 text-blue-600' :
                    status.disabled ? 'bg-gray-100 text-gray-400' : 'bg-gray-100 text-gray-600'
                  }`}>
                    {mode.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={`font-medium ${status.disabled ? 'text-gray-400' : 'text-gray-900'}`}>
                        {mode.label}
                      </span>
                      {status.disabled && (
                        <Badge variant="secondary" className="text-xs">
                          {status.reason}
                        </Badge>
                      )}
                    </div>
                    <p className={`text-sm ${status.disabled ? 'text-gray-400' : 'text-gray-600'}`}>
                      {mode.description}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* KYC Status Warning */}
        {targetMode === 'public' && tenantStage !== 'kyc_complete' && (
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5" />
              <div className="text-sm text-amber-800">
                <p className="font-medium">KYC Required</p>
                <p>Public listings will show as "Not Live" until you complete KYC verification.</p>
              </div>
            </div>
          </div>
        )}

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose} disabled={isUpdating}>
            Cancel
          </Button>
          <Button
            onClick={handleUpdate}
            disabled={isUpdating || getModeStatus(EXPOSURE_MODES.find(m => m.value === targetMode)!).disabled}
          >
            {isUpdating ? (
              <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Updating...</>
            ) : (
              'Set Exposure Mode'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}