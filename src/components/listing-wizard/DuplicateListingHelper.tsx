
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Copy, Car } from "lucide-react";

export default function DuplicateListingHelper({ vehicles, onDuplicate }) {
  const [recentVehicles] = useState((vehicles || []).slice(0, 5)); // Show last 5 vehicles
  
  const handleDuplicate = (vehicle) => {
    const duplicateData = {
      make: vehicle.make,
      model: vehicle.model,
      variant: vehicle.variant,
      year: vehicle.year,
      fuel_type: vehicle.fuel_type,
      transmission: vehicle.transmission,
      vehicle_category: vehicle.vehicle_category,
      inventory_type: vehicle.inventory_type,
      // Clear unique fields
      registration_number: "",
      kilometers: "",
      color: "",
      asking_price: "",
      images: [],
      documents: [],
      description: ""
    };
    onDuplicate(duplicateData);
  };

  if (recentVehicles.length === 0) return null;

  return (
    <Card className="border-dashed border-2 border-blue-200 bg-blue-50">
      <CardContent className="p-4">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Copy className="w-4 h-4 text-blue-600" />
            <span className="font-medium text-blue-900">Quick Add Similar Vehicle</span>
          </div>
          <p className="text-sm text-blue-700">
            Duplicate specs from your recent listings to save time
          </p>
          
          <div className="space-y-2">
            {recentVehicles.map((vehicle) => (
              <div key={vehicle.id} className="flex items-center justify-between bg-white p-3 rounded-lg">
                <div className="flex items-center gap-3">
                  <Car className="w-4 h-4 text-slate-400" />
                  <div>
                    <div className="font-medium text-sm">
                      {vehicle.year} {vehicle.make} {vehicle.model}
                    </div>
                    <div className="text-xs text-slate-500">
                      {vehicle.variant} • {vehicle.fuel_type} • {vehicle.transmission}
                    </div>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {vehicle.vehicle_category}
                  </Badge>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleDuplicate(vehicle)}
                  className="gap-1 text-xs"
                >
                  <Copy className="w-3 h-3" />
                  Duplicate
                </Button>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
