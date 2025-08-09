import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X, Car, IndianRupee, Users } from 'lucide-react';

const mockCityData = {
    topModels: ['Maruti Swift', 'Hyundai Creta', 'Tata Nexon'],
    avgOffer: 650000,
    topDealers: ['Reliable Motors', 'Speedy Wheels', 'Metro Cars']
};

export default function CityDetailModal({ city, onClose }) {
  if (!city) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4">
      <Card className="w-full max-w-lg relative">
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-4 right-4"
          onClick={onClose}
        >
          <X className="w-5 h-5" />
        </Button>
        <CardHeader>
          <CardTitle>Market Snapshot: {city.city}</CardTitle>
          <CardDescription>Key metrics and trends for this region.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-around text-center">
            <div>
              <p className="text-sm text-slate-500">Demand Score</p>
              <p className="text-2xl font-bold text-blue-600">{city.demand}</p>
            </div>
            <div>
              <p className="text-sm text-slate-500">Supply Score</p>
              <p className="text-2xl font-bold text-green-600">{city.supply}</p>
            </div>
            <div>
              <p className="text-sm text-slate-500">Market Gap</p>
              <p className={`text-2xl font-bold ${city.demand > city.supply ? 'text-red-600' : 'text-slate-600'}`}>
                {city.demand - city.supply}
              </p>
            </div>
          </div>
          <div className="space-y-3 pt-4">
            <div>
              <h4 className="font-semibold flex items-center gap-2 mb-2"><Car className="w-4 h-4"/>Top Models</h4>
              <div className="flex flex-wrap gap-2">
                {mockCityData.topModels.map(model => <Badge key={model} variant="secondary">{model}</Badge>)}
              </div>
            </div>
            <div>
              <h4 className="font-semibold flex items-center gap-2 mb-2"><IndianRupee className="w-4 h-4"/>Average Offer Value</h4>
              <p className="text-lg font-medium">₹{(mockCityData.avgOffer / 100000).toFixed(1)}L</p>
            </div>
            <div>
              <h4 className="font-semibold flex items-center gap-2 mb-2"><Users className="w-4 h-4"/>Top Performing Dealers</h4>
              <ul className="list-disc list-inside text-sm text-slate-700">
                {mockCityData.topDealers.map(dealer => <li key={dealer}>{dealer}</li>)}
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}