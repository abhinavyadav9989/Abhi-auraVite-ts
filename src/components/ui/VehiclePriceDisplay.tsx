import React, { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Eye, 
  EyeOff, 
  Lock, 
  Shield, 
  DollarSign, 
  AlertTriangle,
  Info
} from 'lucide-react';
import { vehiclePriceService, VehiclePriceInfo } from '@/api/services/vehiclePriceService';
import { useAuth } from '@/hooks/useAuth';

interface VehiclePriceDisplayProps {
  vehicleId: string;
  dealerId: string;
  className?: string;
  showDetails?: boolean;
}

export default function VehiclePriceDisplay({ 
  vehicleId, 
  dealerId, 
  className = "",
  showDetails = false 
}: VehiclePriceDisplayProps) {
  const [priceInfo, setPriceInfo] = useState<VehiclePriceInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    loadPriceInfo();
  }, [vehicleId, dealerId]);

  const loadPriceInfo = async () => {
    if (!vehicleId || !dealerId) return;

    setLoading(true);
    setError(null);

    try {
      const info = await vehiclePriceService.getVehiclePriceInfo(vehicleId, dealerId);
      setPriceInfo(info);
    } catch (err) {
      console.error('Error loading price info:', err);
      setError('Failed to load price information');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className={`animate-pulse ${className}`}>
        <div className="h-6 bg-gray-200 rounded w-32"></div>
      </div>
    );
  }

  if (error || !priceInfo) {
    return (
      <div className={className}>
        <Badge variant="destructive">
          <AlertTriangle className="w-3 h-3 mr-1" />
          Price unavailable
        </Badge>
      </div>
    );
  }

  const getPriceIcon = () => {
    switch (priceInfo.priceType) {
      case 'owner_full':
        return <DollarSign className="w-4 h-4" />;
      case 'retail':
        return <Eye className="w-4 h-4" />;
      case 'b2b':
        return <Shield className="w-4 h-4" />;
      case 'masked':
        return <EyeOff className="w-4 h-4" />;
      case 'restricted':
        return <Lock className="w-4 h-4" />;
      default:
        return <Info className="w-4 h-4" />;
    }
  };

  const getPriceBadgeVariant = () => {
    return vehiclePriceService.getPriceBadgeVariant(priceInfo.priceType);
  };

  const getPriceDisplayText = () => {
    return vehiclePriceService.getPriceDisplayText(priceInfo);
  };

  return (
    <div className={className}>
      <div className="flex items-center gap-2">
        {getPriceIcon()}
        <span className="font-semibold text-lg">
          {getPriceDisplayText()}
        </span>
        <Badge variant={getPriceBadgeVariant()}>
          {priceInfo.priceType === 'owner_full' && 'Owner View'}
          {priceInfo.priceType === 'retail' && 'Retail'}
          {priceInfo.priceType === 'b2b' && 'B2B'}
          {priceInfo.priceType === 'masked' && 'Masked'}
          {priceInfo.priceType === 'restricted' && 'KYC Required'}
        </Badge>
      </div>

      {priceInfo.message && (
        <p className="text-sm text-gray-600 mt-1">
          {priceInfo.message}
        </p>
      )}

      {showDetails && priceInfo.priceType === 'owner_full' && (
        <Card className="mt-3">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Pricing Details</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Shown Price (Public):</span>
                <span className="font-medium">
                  {vehiclePriceService.formatPrice(priceInfo.displayPrice || 0)}
                </span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Exposure Mode:</span>
                <span className="capitalize">{priceInfo.exposureMode}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {priceInfo.priceType === 'restricted' && (
        <Alert className="mt-2">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Complete KYC verification to view pricing information for this vehicle.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
