import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Car, IndianRupee, Calendar, Eye, Edit, ArrowRight } from "lucide-react";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";

const statusColors = {
  draft: "bg-slate-100 text-slate-700",
  live: "bg-emerald-100 text-emerald-700",
  in_deal: "bg-blue-100 text-blue-700",
  sold: "bg-green-100 text-green-700",
  removed: "bg-red-100 text-red-700"
};

export default function RecentListings({ vehicles, isLoading }) {
  if (isLoading) {
    return (
      <Card className="shadow-sm border-0">
        <CardHeader>
          <CardTitle className="text-xl font-bold">Recent Listings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {Array(3).fill(0).map((_, i) => (
            <div key={i} className="flex items-center gap-4 p-4 border border-slate-100 rounded-lg">
              <Skeleton className="w-16 h-16 rounded-lg" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-5 w-48" />
                <Skeleton className="h-4 w-32" />
              </div>
              <Skeleton className="h-6 w-16 rounded-full" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-sm border-0">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-xl font-bold">Recent Listings</CardTitle>
        <Link to={createPageUrl("Inventory")}>
          <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700">
            View All <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        </Link>
      </CardHeader>
      <CardContent className="space-y-4">
        {vehicles.length === 0 ? (
          <div className="text-center py-8">
            <Car className="w-12 h-12 mx-auto text-slate-300 mb-4" />
            <p className="text-slate-500">No vehicles listed yet</p>
            <Link to={createPageUrl("AddVehicle")}>
              <Button className="mt-4 bg-blue-600 hover:bg-blue-700">
                List Your First Vehicle
              </Button>
            </Link>
          </div>
        ) : (
          vehicles.map((vehicle) => (
            <div key={vehicle.id} className="flex items-center gap-4 p-4 border border-slate-100 rounded-lg hover:border-slate-200 transition-colors">
              <div className="w-16 h-16 bg-slate-100 rounded-lg flex items-center justify-center">
                {vehicle.images && vehicle.images.length > 0 ? (
                  <img 
                    src={vehicle.images[0]} 
                    alt={`${vehicle.make} ${vehicle.model}`}
                    className="w-full h-full object-cover rounded-lg"
                  />
                ) : (
                  <Car className="w-8 h-8 text-slate-400" />
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-slate-900 truncate">
                  {vehicle.year} {vehicle.make} {vehicle.model}
                </h3>
                <div className="flex items-center gap-3 mt-1 text-sm text-slate-500">
                  <span className="flex items-center gap-1">
                    <IndianRupee className="w-3 h-3" />
                    {(vehicle.asking_price / 100000).toFixed(1)}L
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {format(new Date(vehicle.created_date), "MMM d")}
                  </span>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Badge 
                  variant="secondary" 
                  className={statusColors[vehicle.status]}
                >
                  {vehicle.status}
                </Badge>
                <Button variant="ghost" size="icon" className="text-slate-400 hover:text-slate-600">
                  <Eye className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}