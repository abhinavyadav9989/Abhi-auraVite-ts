import React from 'react';
import FeatureGate from '@/components/FeatureGate';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Car, Eye, Handshake } from 'lucide-react';

// Example of how to use FeatureGate in your components

interface ExampleUser {
  id: string;
  email: string;
  branches_added: boolean;
  kyc_completed: boolean;
  bank_details_added: boolean;
  kyb_completed: boolean;
}

interface FeatureGateExampleProps {
  user: ExampleUser;
}

export default function FeatureGateExample({ user }: FeatureGateExampleProps) {
  const handleAddVehicle = () => {
    console.log('Adding vehicle...');
    // This will only execute if user has required branch
  };

  const handleViewPrices = () => {
    console.log('Viewing marketplace prices...');
    // This will only execute if user has completed KYC
  };

  const handleMakeDeal = () => {
    console.log('Making a deal...');
    // This will only execute if user has added bank details
  };

  return (
    <div className="space-y-6 p-6">
      <h2 className="text-2xl font-bold">Feature Gate Examples</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Add Vehicle Feature */}
        <FeatureGate feature="add_vehicle" user={user}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Car className="w-5 h-5" />
                Add Vehicle
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">
                Add a new vehicle to your inventory
              </p>
              <Button onClick={handleAddVehicle} className="w-full">
                Add Vehicle
              </Button>
            </CardContent>
          </Card>
        </FeatureGate>

        {/* View Marketplace Prices Feature */}
        <FeatureGate feature="view_prices" user={user}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="w-5 h-5" />
                View Prices
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">
                View dealer prices in marketplace
              </p>
              <Button onClick={handleViewPrices} className="w-full">
                View Marketplace
              </Button>
            </CardContent>
          </Card>
        </FeatureGate>

        {/* Make Deal Feature */}
        <FeatureGate feature="make_deal" user={user}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Handshake className="w-5 h-5" />
                Make Deal
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">
                Participate in vehicle transactions
              </p>
              <Button onClick={handleMakeDeal} className="w-full">
                Start Deal
              </Button>
            </CardContent>
          </Card>
        </FeatureGate>
      </div>

      {/* Example with custom fallback */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Custom Fallback Example</h3>
        <FeatureGate 
          feature="add_vehicle" 
          user={user}
          fallback={
            <Card className="border-dashed border-2 border-gray-300">
              <CardContent className="p-6 text-center">
                <h4 className="text-lg font-medium text-gray-700 mb-2">
                  Custom Message: Add Branch First
                </h4>
                <p className="text-gray-600">
                  You need to add at least one branch location before you can add vehicles.
                </p>
              </CardContent>
            </Card>
          }
        >
          <Card className="border-green-300 bg-green-50">
            <CardContent className="p-6 text-center">
              <h4 className="text-lg font-medium text-green-700 mb-2">
                ✅ Ready to Add Vehicles!
              </h4>
              <p className="text-green-600">
                You have all requirements to add vehicles to your inventory.
              </p>
            </CardContent>
          </Card>
        </FeatureGate>
      </div>
    </div>
  );
}

// Example usage in your components:
// 
// import FeatureGate from '@/components/FeatureGate';
// 
// function AddVehicleButton({ user }) {
//   return (
//     <FeatureGate feature="add_vehicle" user={user}>
//       <Button onClick={() => navigate('/add-vehicle')}>
//         Add Vehicle
//       </Button>
//     </FeatureGate>
//   );
// }
//
// function MarketplacePrices({ user, vehicles }) {
//   return (
//     <FeatureGate feature="view_prices" user={user}>
//       <div className="space-y-4">
//         {vehicles.map(vehicle => (
//           <VehicleCard key={vehicle.id} vehicle={vehicle} showPrice />
//         ))}
//       </div>
//     </FeatureGate>
//   );
// }
//
// function MakeOfferButton({ user, vehicle }) {
//   return (
//     <FeatureGate feature="make_deal" user={user}>
//       <Button onClick={() => handleMakeOffer(vehicle)}>
//         Make Offer
//       </Button>
//     </FeatureGate>
//   );
// }
