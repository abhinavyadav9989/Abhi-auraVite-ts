import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Vehicle } from '@/api/entities';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Loader2, ArrowLeft, ShieldAlert, Check, X, Star } from 'lucide-react';
import { createPageUrl } from '@/utils';

const SPECS_TO_COMPARE = [
  { key: 'asking_price', label: 'Asking Price', format: (val) => val ? `₹${(val / 100000).toFixed(1)}L` : 'N/A' },
  { key: 'year', label: 'Year' },
  { key: 'kilometers', label: 'Kilometers', format: (val) => val ? val.toLocaleString() : 'N/A' },
  { key: 'fuel_type', label: 'Fuel' },
  { key: 'transmission', label: 'Transmission' },
  { key: 'ownership', label: 'Ownership' },
  { key: 'color', label: 'Color' },
  { key: 'location_city', label: 'City' },
  { key: 'airbags_count', label: 'Airbags' },
  { key: 'seating_capacity', label: 'Seats' },
  { key: 'engine_cc', label: 'Engine (CC)' },
];

export default function Compare() {
  const [searchParams] = useSearchParams();
  const [vehicles, setVehicles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchVehicles = async () => {
      const idsParam = searchParams.get('ids');
      if (!idsParam) {
        setError('No vehicles selected for comparison.');
        setIsLoading(false);
        return;
      }
      
      const vehicleIds = idsParam.split(',');
      if (vehicleIds.length === 0) {
        setError('No vehicles selected for comparison.');
        setIsLoading(false);
        return;
      }

      try {
        const vehiclePromises = vehicleIds.map(id => Vehicle.get(id));
        const fetchedVehicles = await Promise.all(vehiclePromises);
        setVehicles(fetchedVehicles.filter(Boolean)); // Filter out any nulls if an ID was not found
      } catch (err) {
        setError('Failed to load vehicle data.');
        console.error('Comparison fetch error:', err);
      }
      setIsLoading(false);
    };

    fetchVehicles();
  }, [searchParams]);
  
  const getBestValue = (key) => {
    if (vehicles.length < 2) return null;

    let bestValue = vehicles[0][key];
    if (key === 'asking_price' || key === 'kilometers') { // Lower is better
      bestValue = Math.min(...vehicles.map(v => v[key]).filter(v => v !== null && v !== undefined));
    } else if (key === 'year' || key === 'airbags_count' || key === 'seating_capacity') { // Higher is better
      bestValue = Math.max(...vehicles.map(v => v[key]).filter(v => v !== null && v !== undefined));
    } else {
      return null; // Not applicable for comparison
    }
    return bestValue;
  }

  if (isLoading) {
    return (
      <div className="p-8 flex justify-center items-center h-screen">
        <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center">
        <ShieldAlert className="w-16 h-16 mx-auto text-red-500 mb-4" />
        <h2 className="text-2xl font-bold text-red-700">{error}</h2>
        <Link to={createPageUrl('Marketplace')}>
          <Button className="mt-4">Back to Marketplace</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link to={createPageUrl("Marketplace")}>
            <Button variant="outline" size="icon">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900">
              Vehicle Comparison
            </h1>
            <p className="text-slate-600">
              Comparing {vehicles.length} vehicle{vehicles.length !== 1 && 's'} side-by-side.
            </p>
          </div>
        </div>

        {/* Comparison Table */}
        <div className="overflow-x-auto">
          <div className={`grid gap-4`} style={{ gridTemplateColumns: `1fr repeat(${vehicles.length}, 1.5fr)` }}>
            {/* Header Row: Placeholder */}
            <div className="font-semibold text-lg p-4">Feature</div>
            
            {/* Header Row: Vehicle Cards */}
            {vehicles.map(vehicle => (
              <Card key={vehicle.id} className="border-2 border-slate-200">
                <CardContent className="p-4">
                  <div className="aspect-[16/10] bg-slate-100 rounded-lg mb-3 overflow-hidden">
                    <img src={vehicle.images?.[0]} alt={`${vehicle.make} ${vehicle.model}`} className="w-full h-full object-cover"/>
                  </div>
                  <h3 className="font-bold text-base">{vehicle.year} {vehicle.make} {vehicle.model}</h3>
                  <p className="text-sm text-slate-500">{vehicle.variant}</p>
                   <Link to={createPageUrl("VehicleDetail") + `?id=${vehicle.id}`}>
                      <Button variant="outline" size="sm" className="w-full mt-3">View Details</Button>
                   </Link>
                </CardContent>
              </Card>
            ))}

            {/* Spec Rows */}
            {SPECS_TO_COMPARE.map(spec => {
              const bestValue = getBestValue(spec.key);
              return (
                <React.Fragment key={spec.key}>
                  <div className="col-span-1 font-semibold p-4 flex items-center bg-white rounded-l-lg">{spec.label}</div>
                  {vehicles.map(vehicle => {
                    const value = vehicle[spec.key];
                    const isBest = bestValue !== null && value === bestValue;
                    return (
                      <div key={`${vehicle.id}-${spec.key}`} 
                        className={`p-4 flex items-center justify-center text-center bg-white ${isBest ? 'ring-2 ring-green-400 font-bold text-green-700' : ''}`}
                      >
                       {isBest && <Star className="w-4 h-4 mr-2 fill-current text-yellow-400" />}
                        <span className="capitalize">{spec.format ? spec.format(value) : (value || 'N/A')}</span>
                      </div>
                    )
                  })}
                </React.Fragment>
              )
            })}
             <div className="col-span-1 font-semibold p-4 bg-white rounded-l-lg"></div>
              {vehicles.map(v => <div key={v.id} className="p-4 bg-white rounded-r-lg"></div>)}
          </div>
        </div>
      </div>
    </div>
  );
}