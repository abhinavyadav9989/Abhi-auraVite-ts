import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TrendingUp, ArrowRight } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';

export default function PerformanceChart({ dealer }) {
  // Real data will be fetched from transactions
  const [performanceData, setPerformanceData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadPerformanceData();
  }, [dealer]);

  const loadPerformanceData = async () => {
    try {
      // TODO: Fetch real performance data from transactions
      // For now, show empty state
      setPerformanceData([]);
    } catch (error) {
      console.error('Error loading performance data:', error);
      setPerformanceData([]);
    } finally {
      setIsLoading(false);
    }
  };

  const totalGMV = performanceData.reduce((sum, day) => sum + day.gmv, 0);
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
        {isLoading ? (
          <div className="h-48 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
              <p className="text-sm text-slate-600">Loading performance data...</p>
            </div>
          </div>
        ) : performanceData.length > 0 ? (
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={performanceData}>
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
                    name === 'gmv' ? `₹${(Number(value) / 1000).toFixed(0)}K` : value,
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
        ) : (
          <div className="h-48 flex items-center justify-center">
            <div className="text-center">
              <TrendingUp className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-sm text-slate-600">No performance data available</p>
              <p className="text-xs text-slate-500 mt-1">Start making deals to see your performance metrics</p>
            </div>
          </div>
        )}
        
        <div className="flex items-center justify-center mt-4">
          <Button variant="outline" size="sm" className="text-blue-600 border-blue-200 hover:bg-blue-50">
            View Analytics Dashboard
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}