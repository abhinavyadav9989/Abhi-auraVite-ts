import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function ComparePanel({ vehicleIds = [], vehicles = [], dealers = {}, onRemove, onClear }) {
  // Ensure vehicleIds is always an array
  const safeVehicleIds = Array.isArray(vehicleIds) ? vehicleIds : [];
  
  // Ensure vehicles is always an array
  const safeVehicles = Array.isArray(vehicles) ? vehicles : [];
  
  const compareVehicles = safeVehicles.filter(v => v && safeVehicleIds.includes(v.id));

  if (safeVehicleIds.length === 0) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-slate-200 shadow-lg">
      <div className="max-w-7xl mx-auto p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Badge className="bg-blue-600">
                {safeVehicleIds.length} Selected
              </Badge>
              <span className="text-sm text-slate-600">Compare vehicles</span>
            </div>
            
            <div className="flex gap-2">
              {compareVehicles.map((vehicle) => (
                <div key={vehicle.id} className="flex items-center gap-2 bg-slate-100 rounded-lg p-2">
                  <div className="w-8 h-8 bg-slate-200 rounded overflow-hidden">
                    {vehicle.images?.[0] && (
                      <img 
                        src={vehicle.images[0]} 
                        alt={`${vehicle.make} ${vehicle.model}`}
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                  <span className="text-sm font-medium">
                    {vehicle.year} {vehicle.make} {vehicle.model}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="w-5 h-5 text-slate-400 hover:text-slate-600"
                    onClick={() => onRemove && onRemove(vehicle.id)}
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link to={createPageUrl("Compare") + `?ids=${safeVehicleIds.join(',')}`}>
              <Button className="bg-blue-600 hover:bg-blue-700 gap-2">
                Compare Now
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            
            <Button variant="outline" onClick={onClear}>
              Clear All
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}