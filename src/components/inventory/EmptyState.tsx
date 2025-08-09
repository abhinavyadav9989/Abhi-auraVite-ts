import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Car, Plus, Upload, BarChart3 } from "lucide-react";

type EmptyStateProps = { dealer: any }

export default function EmptyState({ dealer }: EmptyStateProps) {
  return (
    <div className="text-center py-16">
      <div className="max-w-md mx-auto">
        {/* Illustration */}
        <div className="w-32 h-32 mx-auto mb-8 bg-blue-50 rounded-full flex items-center justify-center">
          <Car className="w-16 h-16 text-blue-300" />
        </div>
        
        {/* Content */}
        <h2 className="text-2xl font-bold text-slate-900 mb-4">
          Your Digital Godown is Empty
        </h2>
        <p className="text-slate-600 mb-8 leading-relaxed">
          Start building your inventory by adding your first vehicle. You can add them one by one 
          or import multiple vehicles at once using our CSV upload feature.
        </p>
        
        {/* Action Buttons */}
        <div className="space-y-4">
          <Link to={createPageUrl("AddVehicle")}>
            <Button size="lg" className="bg-blue-600 hover:bg-blue-700 gap-2">
              <Plus className="w-5 h-5" />
              Add Your First Vehicle
            </Button>
          </Link>
          
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to={createPageUrl("BulkImport")}>
              <Button variant="outline" className="gap-2">
                <Upload className="w-4 h-4" />
                Bulk Import CSV
              </Button>
            </Link>
            
            <Link to={createPageUrl("InventoryAnalytics")}>
              <Button variant="outline" className="gap-2">
                <BarChart3 className="w-4 h-4" />
                View Analytics
              </Button>
            </Link>
          </div>
        </div>
        
        {/* Tips */}
        <div className="mt-12 p-6 bg-slate-50 rounded-lg text-left">
          <h3 className="font-semibold text-slate-900 mb-3">Quick Tips:</h3>
          <ul className="space-y-2 text-sm text-slate-600">
            <li>• Take high-quality photos from multiple angles</li>
            <li>• Use our AI pricing suggestions for competitive rates</li>
            <li>• Keep your vehicle documents handy for faster listing</li>
            <li>• Regular updates help maintain visibility in marketplace</li>
          </ul>
        </div>
      </div>
    </div>
  );
}