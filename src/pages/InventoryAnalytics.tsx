import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BarChart2, TrendingUp, DollarSign, Target } from 'lucide-react';

export default function InventoryAnalytics() {
  return (
    <div className="p-4 md:p-8 bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900">
              Business Analytics
            </h1>
            <p className="text-slate-600 mt-1">
              Comprehensive analytics dashboard for your dealership
            </p>
          </div>

          <Button className="bg-blue-600 hover:bg-blue-700">
            <BarChart2 className="w-4 h-4 mr-2" />
            View Full Analytics
          </Button>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Total Revenue</p>
                  <p className="text-2xl font-bold text-slate-900">₹2.4Cr</p>
                  <p className="text-xs text-green-600 mt-1">+12.5% from last month</p>
                </div>
                <DollarSign className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Vehicles Sold</p>
                  <p className="text-2xl font-bold text-slate-900">45</p>
                  <p className="text-xs text-green-600 mt-1">+8.3% from last month</p>
                </div>
                <Target className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Avg Profit/Car</p>
                  <p className="text-2xl font-bold text-slate-900">₹85K</p>
                  <p className="text-xs text-red-600 mt-1">-2.1% from last month</p>
                </div>
                <TrendingUp className="w-8 h-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Conversion Rate</p>
                  <p className="text-2xl font-bold text-slate-900">68%</p>
                  <p className="text-xs text-green-600 mt-1">+5.2% from last month</p>
                </div>
                <BarChart2 className="w-8 h-8 text-emerald-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Feature Preview */}
        <Card>
          <CardHeader>
            <CardTitle>Advanced Analytics Available</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-2">Market Intelligence</h4>
                <p className="text-sm text-slate-600">
                  Competitor analysis, pricing trends, and market positioning insights
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Revenue Analytics</h4>
                <p className="text-sm text-slate-600">
                  P&L tracking, profit margins, and financial performance analysis
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Deal Performance</h4>
                <p className="text-sm text-slate-600">
                  Conversion rates, pipeline analysis, and sales optimization
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Custom Reports</h4>
                <p className="text-sm text-slate-600">
                  Flexible report builder with export capabilities
                </p>
              </div>
            </div>

            <div className="mt-6 text-center">
              <Button className="bg-blue-600 hover:bg-blue-700">
                Upgrade to Advanced Analytics
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}