import React, { useState, useEffect } from "react";
import { Vehicle } from "@/api/entities";
import { Dealer } from "@/api/entities";
import { User } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { ArrowLeft, ShieldAlert, Loader2 } from "lucide-react";

export default function EditVehicle() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [vehicle, setVehicle] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [currentDealer, setCurrentDealer] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hasPermission, setHasPermission] = useState(false);

  const vehicleId = searchParams.get('id');

  useEffect(() => {
    if (!vehicleId) {
      setError("No vehicle ID provided");
      setIsLoading(false);
      return;
    }
    
    checkPermissionsAndLoadVehicle();
  }, [vehicleId]);

  const checkPermissionsAndLoadVehicle = async () => {
    try {
      // Load current user
      const user = await User.me();
      setCurrentUser(user);

      // Load vehicle data
      const vehicleData = await Vehicle.get(vehicleId);
      if (!vehicleData) {
        setError("Vehicle not found");
        setIsLoading(false);
        return;
      }
      setVehicle(vehicleData);

      // SECURITY CHECK: Verify permissions
      if (user.role === 'admin') {
        // Admin can edit any vehicle
        setHasPermission(true);
      } else {
        // Regular users can only edit their own vehicles
        const dealerProfile = await Dealer.filter({ created_by: user.email });
        if (dealerProfile.length > 0) {
          setCurrentDealer(dealerProfile[0]);
          
          // Check if vehicle belongs to current dealer
          if (vehicleData.dealer_id === dealerProfile[0].id) {
            setHasPermission(true);
          } else {
            setError("You don't have permission to edit this vehicle");
          }
        } else {
          setError("Dealer profile not found");
        }
      }
    } catch (error) {
      console.error("Error checking permissions:", error);
      setError("Failed to load vehicle data");
    }
    
    setIsLoading(false);
  };

  if (isLoading) {
    return (
      <div className="p-8 flex justify-center items-center h-screen">
        <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error || !hasPermission) {
    return (
      <div className="p-4 md:p-8 bg-slate-50 min-h-screen">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center gap-4 mb-6">
            <Link to={createPageUrl("Inventory")}>
              <Button variant="outline" size="icon">
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </Link>
            <h1 className="text-2xl font-bold text-slate-900">Edit Vehicle</h1>
          </div>

          <Card>
            <CardContent className="p-8 text-center">
              <ShieldAlert className="w-16 h-16 mx-auto text-red-500 mb-4" />
              <h2 className="text-xl font-semibold text-red-700 mb-2">Access Denied</h2>
              <p className="text-slate-600 mb-6">
                {error || "You don't have permission to edit this vehicle."}
              </p>
              <div className="flex gap-3 justify-center">
                <Link to={createPageUrl("Inventory")}>
                  <Button variant="outline">Back to Inventory</Button>
                </Link>
                <Link to={createPageUrl("Marketplace")}>
                  <Button>Browse Marketplace</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // If we reach here, user has permission - redirect to AddVehicle with edit mode
  window.location.href = createPageUrl("AddVehicle") + `?id=${vehicleId}&mode=edit`;
  
  return (
    <div className="p-8 flex justify-center items-center h-screen">
      <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
    </div>
  );
}