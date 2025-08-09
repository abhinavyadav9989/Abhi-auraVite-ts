import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SearchX, FilterX } from "lucide-react";

export default function NoResultsState({ searchQuery, onClearSearch, setFilters }) {
  const handleClearFilters = () => {
    if (setFilters) {
        setFilters({
            vehicle_category: [],
            fuel_type: [],
            make: [],
            transmission: [],
            ownership: [],
            verified_only: false,
            specialised_only: false,
            price_drops_only: false,
            financing_available: false,
            price_min: "",
            price_max: "",
            year_min: "",
            year_max: "",
            kms_min: "",
            kms_max: ""
        });
    }
    if (searchQuery) {
        onClearSearch();
    }
  };

  return (
    <Card className="col-span-1 md:col-span-2 lg:col-span-3 xl:col-span-4 border-dashed border-2">
      <CardContent className="p-12 text-center">
        <div className="w-16 h-16 mx-auto mb-6 bg-slate-100 rounded-full flex items-center justify-center">
          <SearchX className="w-8 h-8 text-slate-400" />
        </div>
        
        <h3 className="text-xl font-semibold text-slate-900 mb-2">
          No Vehicles Found
        </h3>
        
        <p className="text-slate-600 mb-6 max-w-md mx-auto">
          We couldn&apos;t find any vehicles matching your current search and filters. Try adjusting your criteria.
        </p>
        
        <Button onClick={handleClearFilters} variant="outline" className="gap-2">
          <FilterX className="w-4 h-4"/>
          Reset All Filters
        </Button>
      </CardContent>
    </Card>
  );
}