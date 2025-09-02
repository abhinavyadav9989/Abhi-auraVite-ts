import React, { useState, useEffect } from 'react';
import { Vehicle } from '@/api/entities';
import { Dealer } from '@/api/entities';
import { User } from '@/api/entities';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, CheckCircle, Eye, EyeOff } from 'lucide-react';

export default function BulkImportDebug() {
  const [allVehicles, setAllVehicles] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [currentDealer, setCurrentDealer] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const loadDebugData = async () => {
    setIsLoading(true);
    try {
      const user = await User.me();
      setCurrentUser(user);

      const dealerProfiles = await Dealer.filter({ created_by: user.email });
      if (dealerProfiles.length > 0) {
        setCurrentDealer(dealerProfiles[0]);
      }

      const allVehiclesData = await Vehicle.filter({});
      setAllVehicles(allVehiclesData);

      console.log('🔍 BULK IMPORT DEBUG - All Vehicles:', allVehiclesData);
      console.log('🔍 BULK IMPORT DEBUG - Current User:', user);
      console.log('🔍 BULK IMPORT DEBUG - Current Dealer:', dealerProfiles[0]);

    } catch (error) {
      console.error('Bulk import debug data load error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const variants = {
      'live': 'default',
      'draft': 'secondary',
      'sold': 'destructive'
    };
    return <Badge variant={variants[status] || 'outline'}>{status}</Badge>;
  };

  const getInventoryTypeBadge = (type) => {
    const variants = {
      'public': 'default',
      'private': 'secondary',
      'service': 'outline'
    };
    return <Badge variant={variants[type] || 'outline'}>{type}</Badge>;
  };

  const isMarketplaceVisible = (vehicle) => {
    return vehicle.status === 'live' && vehicle.inventory_type === 'public';
  };

  const isCurrentUserVehicle = (vehicle) => {
    return currentDealer && vehicle.dealer_id === currentDealer.id;
  };

  const getMarketplaceVisibilityIcon = (vehicle) => {
    if (isMarketplaceVisible(vehicle)) {
      return <Eye className="w-4 h-4 text-green-600" />;
    } else {
      return <EyeOff className="w-4 h-4 text-red-600" />;
    }
  };

  useEffect(() => {
    loadDebugData();
  }, []);

  const currentUserVehicles = allVehicles.filter(isCurrentUserVehicle);
  const marketplaceVisibleVehicles = currentUserVehicles.filter(isMarketplaceVisible);
  const marketplaceHiddenVehicles = currentUserVehicles.filter(v => !isMarketplaceVisible(v));

  const getVisibilityReason = (vehicle) => {
    if (vehicle.status !== 'live') {
      return `Status: ${vehicle.status} (needs to be 'live')`;
    }
    if (vehicle.inventory_type !== 'public') {
      return `Inventory Type: ${vehicle.inventory_type} (needs to be 'public')`;
    }
    return 'Visible in marketplace';
  };

  return (
    <div className="p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>🔍 Bulk Import Debug Tool</CardTitle>
        </CardHeader>
        <CardContent>
          <Button onClick={loadDebugData} disabled={isLoading}>
            {isLoading ? 'Loading...' : 'Refresh Debug Data'}
          </Button>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-4 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>📊 Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div>Your Vehicles: <strong>{currentUserVehicles.length}</strong></div>
            <div>Marketplace Visible: <strong className="text-green-600">{marketplaceVisibleVehicles.length}</strong></div>
            <div>Marketplace Hidden: <strong className="text-red-600">{marketplaceHiddenVehicles.length}</strong></div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>👤 Current User</CardTitle>
          </CardHeader>
          <CardContent>
            {currentUser && (
              <div className="space-y-1">
                <div><strong>Email:</strong> {currentUser.email}</div>
                {currentDealer && (
                  <div><strong>Dealer ID:</strong> {currentDealer.id}</div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>🎯 Marketplace Logic</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1 text-sm">
              <div>✅ Must have: status = 'live'</div>
              <div>✅ Must have: inventory_type = 'public'</div>
              <div>❌ Hidden if: status = 'draft'</div>
              <div>❌ Hidden if: inventory_type = 'private'/'service'</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>⚠️ Common Issues</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1 text-sm">
              <div>• "Import as Live" disabled</div>
              <div>• inventory_type set to 'private'</div>
              <div>• Wrong ownership values</div>
              <div>• Missing required fields</div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>🚗 Your Vehicles ({currentUserVehicles.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {currentUserVehicles.map((vehicle) => (
              <div key={vehicle.id} className={`p-3 border rounded ${isMarketplaceVisible(vehicle) ? 'bg-green-50 border-green-300' : 'bg-red-50 border-red-300'}`}>
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="font-medium">{vehicle.make} {vehicle.model}</div>
                    <div className="text-sm text-gray-600">
                      Reg: {vehicle.registration_number} | Price: ₹{vehicle.asking_price?.toLocaleString()}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {getVisibilityReason(vehicle)}
                    </div>
                  </div>
                  <div className="flex gap-2 items-center">
                    {getMarketplaceVisibilityIcon(vehicle)}
                    {getStatusBadge(vehicle.status)}
                    {getInventoryTypeBadge(vehicle.inventory_type)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {marketplaceHiddenVehicles.length > 0 && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>Found {marketplaceHiddenVehicles.length} vehicles that are not visible in marketplace.</strong>
            <br />
            To make them visible: 
            <ul className="list-disc list-inside mt-2">
              <li>Change status from 'draft' to 'live'</li>
              <li>Change inventory_type from 'private'/'service' to 'public'</li>
              <li>Or use the "Import as Live" option in bulk import</li>
            </ul>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
