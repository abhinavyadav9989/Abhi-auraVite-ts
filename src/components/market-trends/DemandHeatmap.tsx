import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import CityDetailModal from './CityDetailModal';

export default function DemandHeatmap({ data = [] }) {
  const [selectedCity, setSelectedCity] = useState(null);

  const getCellColor = (demand, supply) => {
    const gap = demand - supply;
    if (gap > 20) return 'bg-red-500 hover:bg-red-600'; // High demand, low supply
    if (gap > 5) return 'bg-orange-400 hover:bg-orange-500'; // Moderate demand gap
    if (gap < -20) return 'bg-blue-500 hover:bg-blue-600'; // High supply, low demand
    if (gap < -5) return 'bg-sky-400 hover:bg-sky-500'; // Moderate supply surplus
    return 'bg-green-500 hover:bg-green-600'; // Balanced market
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Regional Demand Heatmap</CardTitle>
          <CardDescription>Circles represent market size. Color indicates demand vs. supply.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap justify-center gap-4 p-4 bg-slate-50 rounded-lg">
            {data.map((city) => {
              const marketSize = (city.demand + city.supply) / 2;
              return (
                <div
                  key={city.city}
                  className="flex flex-col items-center cursor-pointer group"
                  onClick={() => setSelectedCity(city)}
                >
                  <div
                    className={`rounded-full flex items-center justify-center text-white font-bold transition-all duration-300 ${getCellColor(city.demand, city.supply)}`}
                    style={{
                      width: `${Math.max(60, marketSize)}px`,
                      height: `${Math.max(60, marketSize)}px`,
                    }}
                  >
                    <span className="text-xs drop-shadow-md">{city.demand - city.supply}</span>
                  </div>
                  <p className="mt-2 text-sm font-medium text-slate-700 group-hover:text-blue-600">{city.city}</p>
                </div>
              );
            })}
          </div>
          <div className="flex justify-center gap-4 mt-4 text-xs text-slate-500">
            <span className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-red-500"/>High Demand</span>
            <span className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-green-500"/>Balanced</span>
            <span className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-blue-500"/>High Supply</span>
          </div>
        </CardContent>
      </Card>
      {selectedCity && <CityDetailModal city={selectedCity} onClose={() => setSelectedCity(null)} />}
    </>
  );
}