import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Lightbulb, ArrowRight, ArrowUp } from 'lucide-react';

const mockForecast = {
    segment: 'Compact SUV',
    demand_increase_percent: 15,
    required_stock: 5
};

export default function AIForecastCard() {
  return (
    <Card className="bg-blue-600 text-white">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
            <Lightbulb />
            AI Stock Forecast
        </CardTitle>
        <CardDescription className="text-blue-200">Next 30-day demand projection.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <p>
            Demand for <span className="font-bold bg-blue-700 px-2 py-1 rounded">{mockForecast.segment}s</span> is projected to increase by 
            <span className="font-bold text-lg"> {mockForecast.demand_increase_percent}%</span>.
        </p>
        <div className="p-3 bg-white/20 rounded-lg flex items-center justify-between">
            <p className="font-semibold">Recommended additional stock:</p>
            <p className="text-2xl font-bold">{mockForecast.required_stock} units</p>
        </div>
      </CardContent>
    </Card>
  );
}