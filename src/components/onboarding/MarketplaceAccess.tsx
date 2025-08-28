import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Car, Truck, Wrench, Globe, Shield, Info } from 'lucide-react';

const MARKETPLACE_TYPES = [
  {
    id: 'new_vehicles',
    title: 'New Vehicles Marketplace',
    description: 'Access to new vehicle inventory from OEMs and authorized dealers',
    icon: Car,
    features: ['Direct OEM partnerships', 'Bulk ordering discounts', 'Latest model availability'],
    requiredPlan: 'pro',
    color: 'blue'
  },
  {
    id: 'used_vehicles',
    title: 'Used Vehicles Marketplace',
    description: 'Trade pre-owned vehicles with verified dealers across India',
    icon: Truck,
    features: ['Quality assured inventory', 'Inspection reports', 'Flexible pricing'],
    requiredPlan: 'standard',
    color: 'green'
  },
  {
    id: 'specialised',
    title: 'Specialised Vehicles',
    description: 'Access to specialized vehicles like cranes, ambulances, modified vehicles',
    icon: Wrench,
    features: ['Custom modifications', 'Industrial equipment', 'Special purpose vehicles'],
    requiredPlan: 'pro',
    color: 'purple',
    optIn: true
  }
];

type MarketplaceAccessProps = {
  data: any;
  updateData: (updates: any) => void;
};

export default function MarketplaceAccess({ data, updateData }: MarketplaceAccessProps) {
  const handleAccessToggle = (type: string, enabled: boolean) => {
    const updates: any = {};
    
    switch (type) {
      case 'new_vehicles':
        updates.newVehicleAccess = enabled;
        break;
      case 'used_vehicles':
        updates.usedVehicleAccess = enabled;
        break;
      case 'specialised':
        updates.specialisedAccess = enabled;
        break;
    }
    
    updateData(updates);
  };

  const isAccessEnabled = (type: string) => {
    const d: any = data || {};
    switch (type) {
      case 'new_vehicles':
        return Boolean(d.newVehicleAccess);
      case 'used_vehicles':
        return Boolean(d.usedVehicleAccess);
      case 'specialised':
        return Boolean(d.specialisedAccess);
      default:
        return false;
    }
  };

  const canAccess = (marketplace: any) => {
    // Check if user's selected plan allows access
    const planHierarchy = { standard: 1, pro: 2, enterprise: 3 };
    const userPlanLevel = planHierarchy[data.selectedPlan] || 1;
    const requiredPlanLevel = planHierarchy[marketplace.requiredPlan] || 1;
    
    return userPlanLevel >= requiredPlanLevel;
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Marketplace Access</h2>
        <p className="text-slate-600">
          Choose which marketplaces you want to access based on your business needs
        </p>
      </div>

      <Alert>
        <Globe className="h-4 w-4" />
        <AlertDescription>
          Marketplace access can be modified later from your dashboard settings. 
          Some marketplaces require plan upgrades and additional verification.
        </AlertDescription>
      </Alert>

      <div className="grid gap-6">
        {MARKETPLACE_TYPES.map((marketplace) => {
          const Icon = marketplace.icon;
          const hasAccess = canAccess(marketplace);
          const isEnabled = isAccessEnabled(marketplace.id);
          
          return (
            <Card 
              key={marketplace.id} 
              className={`transition-all ${
                isEnabled && hasAccess 
                  ? `ring-2 ring-${marketplace.color}-500 shadow-lg` 
                  : hasAccess 
                    ? 'hover:shadow-md' 
                    : 'opacity-60'
              }`}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 bg-${marketplace.color}-100 rounded-lg flex items-center justify-center`}>
                      <Icon className={`w-6 h-6 text-${marketplace.color}-600`} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <CardTitle className="text-lg">{marketplace.title}</CardTitle>
                        {!hasAccess && (
                          <Badge variant="secondary" className="text-xs">
                            Requires {marketplace.requiredPlan} plan
                          </Badge>
                        )}
                        {marketplace.optIn && (
                          <Badge variant="outline" className="text-xs">
                            Opt-in
                          </Badge>
                        )}
                      </div>
                      <p className="text-slate-600 text-sm mb-3">{marketplace.description}</p>
                      
                      <div className="space-y-2">
                        <Label className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                          Key Features
                        </Label>
                        <div className="flex flex-wrap gap-2">
                          {marketplace.features.map((feature, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {feature}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-end gap-2">
                    <Switch
                      checked={isEnabled}
                      onCheckedChange={(checked) => handleAccessToggle(marketplace.id, checked === true)}
                      disabled={!hasAccess}
                    />
                    {hasAccess && (
                      <span className="text-xs text-slate-500">
                        {isEnabled ? 'Enabled' : 'Disabled'}
                      </span>
                    )}
                  </div>
                </div>
              </CardHeader>
              
              {!hasAccess && (
                <CardContent className="pt-0">
                  <Alert variant="destructive">
                    <Shield className="h-4 w-4" />
                    <AlertDescription>
                      Upgrade to {marketplace.requiredPlan} plan to access this marketplace. 
                      You can upgrade during or after onboarding.
                    </AlertDescription>
                  </Alert>
                </CardContent>
              )}
            </Card>
          );
        })}
      </div>

      {/* Access Summary */}
      <Card className="bg-slate-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="w-5 h-5 text-blue-600" />
            Access Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="flex items-center justify-between">
                <span>New Vehicles:</span>
                <Badge variant={isAccessEnabled('new_vehicles') ? 'default' : 'secondary'}>
                  {isAccessEnabled('new_vehicles') ? 'Enabled' : 'Disabled'}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span>Used Vehicles:</span>
                <Badge variant={isAccessEnabled('used_vehicles') ? 'default' : 'secondary'}>
                  {isAccessEnabled('used_vehicles') ? 'Enabled' : 'Disabled'}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span>Specialised:</span>
                <Badge variant={isAccessEnabled('specialised') ? 'default' : 'secondary'}>
                  {isAccessEnabled('specialised') ? 'Enabled' : 'Disabled'}
                </Badge>
              </div>
            </div>
            
            <div className="pt-3 border-t">
              <p className="text-xs text-slate-600">
                <strong>Note:</strong> Marketplace access determines which inventory and deals you can see. 
                You can always modify these settings later from your account preferences.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}