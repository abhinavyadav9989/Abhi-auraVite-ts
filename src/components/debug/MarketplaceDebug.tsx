import React, { useState, useEffect } from 'react';
import { Vehicle } from '@/api/entities';
import { Dealer } from '@/api/entities';
import { User } from '@/api/entities';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function MarketplaceDebug() {
  const [allVehicles, setAllVehicles] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [currentDealer, setCurrentDealer] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const loadDebugData = async () => {
    setIsLoading(true);
    try {
      // Get current user
      const user = await User.me();
      setCurrentUser(user);

      // Get current dealer
      const dealerProfiles = await Dealer.filter({ created_by: user.email });
      if (dealerProfiles.length > 0) {
        setCurrentDealer(dealerProfiles[0]);
      }

      // Get ALL vehicles (no filters)
      const allVehiclesData = await Vehicle.filter({});
      setAllVehicles(allVehiclesData);

      console.log('🔍 DEBUG - All Vehicles:', allVehiclesData);
      console.log('🔍 DEBUG - Current User:', user);
      console.log('🔍 DEBUG - Current Dealer:', dealerProfiles[0]);

    } catch (error) {
      console.error('Debug data load error:', error);
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

  const shouldBeInMarketplace = (vehicle) => {
    return vehicle.status === 'live' && vehicle.inventory_type === 'public';
  };

  const isCurrentUserVehicle = (vehicle) => {
    return currentDealer && vehicle.dealer_id === currentDealer.id;
  };

  useEffect(() => {
    loadDebugData();
  }, []);

  const marketplaceVehicles = allVehicles.filter(shouldBeInMarketplace);
  const currentUserVehicles = allVehicles.filter(isCurrentUserVehicle);
  const otherUserVehicles = marketplaceVehicles.filter(v => !isCurrentUserVehicle(v));

  return (
    <div className="p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>🔍 Marketplace Debug Tool</CardTitle>
        </CardHeader>
        <CardContent>
          <Button onClick={loadDebugData} disabled={isLoading}>
            {isLoading ? 'Loading...' : 'Refresh Debug Data'}
          </Button>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>📊 Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div>Total Vehicles: <strong>{allVehicles.length}</strong></div>
            <div>Live + Public: <strong>{marketplaceVehicles.length}</strong></div>
            <div>Your Vehicles: <strong>{currentUserVehicles.length}</strong></div>
            <div>Other Users' Vehicles: <strong>{otherUserVehicles.length}</strong></div>
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
              <div>✅ Should show: Live + Public vehicles</div>
              <div>❌ Should hide: Your own vehicles</div>
              <div>✅ Should show: Other users' vehicles</div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>🚗 All Vehicles ({allVehicles.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {allVehicles.map((vehicle) => (
              <div key={vehicle.id} className={`p-3 border rounded ${shouldBeInMarketplace(vehicle) ? 'bg-green-50' : 'bg-gray-50'} ${isCurrentUserVehicle(vehicle) ? 'border-blue-300' : 'border-gray-300'}`}>
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="font-medium">{vehicle.make} {vehicle.model}</div>
                    <div className="text-sm text-gray-600">
                      Reg: {vehicle.registration_number} | Dealer: {vehicle.dealer_id}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {getStatusBadge(vehicle.status)}
                    {getInventoryTypeBadge(vehicle.inventory_type)}
                    {isCurrentUserVehicle(vehicle) && <Badge variant="outline">Yours</Badge>}
                    {shouldBeInMarketplace(vehicle) && <Badge variant="default">Marketplace</Badge>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
