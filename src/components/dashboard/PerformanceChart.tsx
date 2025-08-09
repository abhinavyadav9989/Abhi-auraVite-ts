import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TrendingUp, ArrowRight } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';

// Mock 30-day performance data
const mockData = [
  { day: 1, gmv: 125000, deals: 2 },
  { day: 3, gmv: 89000, deals: 1 },
  { day: 5, gmv: 156000, deals: 3 },
  { day: 8, gmv: 203000, deals: 4 },
  { day: 12, gmv: 145000, deals: 2 },
  { day: 15, gmv: 187000, deals: 3 },
  { day: 18, gmv: 234000, deals: 5 },
  { day: 22, gmv: 198000, deals: 3 },
  { day: 25, gmv: 267000, deals: 4 },
  { day: 28, gmv: 189000, deals: 2 },
  { day: 30, gmv: 223000, deals: 3 }
];

export default function PerformanceChart({ dealer }) {
  const totalGMV = mockData.reduce((sum, day) => sum + day.gmv, 0);
  const avgDailyGMV = Math.round(totalGMV / 30);

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-lg font-bold">30-Day Performance</CardTitle>
          <div className="flex items-center gap-4 mt-2 text-sm text-slate-600">
            <span>Total GMV: ₹{(totalGMV / 100000).toFixed(1)}L</span>
            <span>Avg Daily: ₹{(avgDailyGMV / 1000).toFixed(0)}K</span>
          </div>
        </div>
        <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700">
          <TrendingUp className="w-4 h-4 mr-1" />
          Deep Dive
          <ArrowRight className="w-4 h-4 ml-1" />
        </Button>
      </CardHeader>
      
      <CardContent>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={mockData}>
              <XAxis 
                dataKey="day" 
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: '#64748b' }}
              />
              <YAxis 
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: '#64748b' }}
                tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}K`}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  fontSize: '12px'
                }}
                formatter={(value, name) => [
                  name === 'gmv' ? `₹${(value / 1000).toFixed(0)}K` : value,
                  name === 'gmv' ? 'GMV' : 'Deals'
                ]}
                labelFormatter={(day) => `Day ${day}`}
              />
              <Line 
                type="monotone" 
                dataKey="gmv" 
                stroke="#2563eb"
                strokeWidth={2}
                dot={{ fill: '#2563eb', strokeWidth: 0, r: 3 }}
                activeDot={{ r: 5, fill: '#2563eb' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        
        <div className="flex items-center justify-center mt-4">
          <Button variant="outline" size="sm" className="text-blue-600 border-blue-200 hover:bg-blue-50">
            View Analytics Dashboard
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}