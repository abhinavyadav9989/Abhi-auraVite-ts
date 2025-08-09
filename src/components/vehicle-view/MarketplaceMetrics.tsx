import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Eye, Heart, MessageCircle, TrendingUp, Users, Clock } from 'lucide-react';

export default function MarketplaceMetrics({ 
  viewCount = 0, 
  saveCount = 0, 
  inquiryCount = 0, 
  isOwner = false 
}) {
  const metrics = [
    {
      label: 'Views',
      value: viewCount,
      icon: Eye,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      label: 'Saved',
      value: saveCount,
      icon: Heart,
      color: 'text-red-600',
      bgColor: 'bg-red-50'
    },
    {
      label: 'Inquiries',
      value: inquiryCount,
      icon: MessageCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <TrendingUp className="w-5 h-5 text-slate-600" />
          {isOwner ? 'Listing Performance' : 'Vehicle Interest'}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Metrics Grid */}
        <div className="grid grid-cols-3 gap-3">
          {metrics.map((metric) => {
            const Icon = metric.icon;
            return (
              <div 
                key={metric.label}
                className={`${metric.bgColor} rounded-lg p-3 text-center`}
              >
                <Icon className={`w-5 h-5 ${metric.color} mx-auto mb-1`} />
                <div className="text-2xl font-bold text-slate-900">{metric.value}</div>
                <div className="text-xs text-slate-600">{metric.label}</div>
              </div>
            );
          })}
        </div>

        {/* Additional Owner Metrics */}
        {isOwner && (
          <>
            <div className="border-t pt-4">
              <h4 className="font-medium text-sm mb-3 flex items-center gap-2">
                <Users className="w-4 h-4 text-slate-600" />
                Viewer Demographics
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-600">Mumbai dealers</span>
                  <span className="font-medium">45%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Delhi dealers</span>
                  <span className="font-medium">30%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Other cities</span>
                  <span className="font-medium">25%</span>
                </div>
              </div>
            </div>

            <div className="border-t pt-4">
              <h4 className="font-medium text-sm mb-3 flex items-center gap-2">
                <Clock className="w-4 h-4 text-slate-600" />
                Recent Activity
              </h4>
              <div className="space-y-2 text-xs text-slate-600">
                <div>• 3 views in last 24 hours</div>
                <div>• 1 inquiry yesterday</div>
                <div>• Saved by 2 dealers this week</div>
                <div>• Listed 5 days ago</div>
              </div>
            </div>
          </>
        )}

        {/* Interest Level Indicator */}
        <div className="bg-slate-50 rounded-lg p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Interest Level</span>
            <span className="text-xs text-slate-600">
              {viewCount > 20 ? 'High' : viewCount > 10 ? 'Medium' : 'Low'}
            </span>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-2">
            <div 
              className={`h-2 rounded-full ${
                viewCount > 20 ? 'bg-green-500' : 
                viewCount > 10 ? 'bg-yellow-500' : 'bg-red-500'
              }`}
              style={{ width: `${Math.min((viewCount / 30) * 100, 100)}%` }}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}