import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  X, 
  TrendingUp, 
  Zap, 
  Target, 
  MapPin, 
  Calendar,
  IndianRupee,
  Truck,
  ExternalLink,
  Lightbulb
} from 'lucide-react';
import { InvokeLLM } from '@/api/integrations';

export default function InsightsSidebar({ isOpen, onClose, onApplyFilter }) {
  const [insights, setInsights] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadMarketInsights();
    }
  }, [isOpen]);

  const loadMarketInsights = async () => {
    setIsLoading(true);
    try {
      // Try to get AI insights, fallback to static data
      const result = await InvokeLLM({
        prompt: "Generate 5 actionable market insights for Indian car dealers focusing on trending models, price opportunities, and inventory recommendations. Include specific make/model suggestions.",
        response_json_schema: {
          type: "object",
          properties: {
            insights: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  description: { type: "string" },
                  action: { type: "string" },
                  filterKey: { type: "string" },
                  filterValue: { type: "string" },
                  urgency: { type: "string", enum: ["low", "medium", "high"] }
                }
              }
            }
          }
        }
      });

      if (result.insights) {
        setInsights(result.insights);
      } else {
        throw new Error('No AI insights received');
      }
    } catch (error) {
      console.error('Error loading AI insights:', error);
      // Fallback to static insights
      setInsights([
        {
          title: "Swift Dzire in High Demand",
          description: "Maruti Swift Dzire models are selling 40% faster than average. Great opportunity for quick inventory turnover.",
          action: "View Swift Dzire listings",
          filterKey: "model",
          filterValue: "Swift Dzire",
          urgency: "high"
        },
        {
          title: "SUV Market Trending Up",
          description: "SUV segment showing 25% price appreciation. Consider stocking compact SUVs for Q1.",
          action: "Browse SUV inventory",
          filterKey: "vehicle_category",
          filterValue: "suv",
          urgency: "medium"
        },
        {
          title: "Diesel Cars Undervalued",
          description: "Diesel vehicles trading 15% below market value. Potential arbitrage opportunity.",
          action: "Find diesel vehicles",
          filterKey: "fuel_type",
          filterValue: "diesel",
          urgency: "medium"
        },
        {
          title: "Verified Dealers Premium",
          description: "Verified dealers commanding 8% price premium. Complete KYB verification to boost margins.",
          action: "View verified inventory",
          filterKey: "verified_only",
          filterValue: true,
          urgency: "low"
        },
        {
          title: "Year-End Opportunity",
          description: "2019-2020 models showing strong demand as buyers seek value. Stock accordingly.",
          action: "Browse 2019-2020 vehicles",
          filterKey: "year_min",
          filterValue: "2019",
          urgency: "medium"
        }
      ]);
    }
    setIsLoading(false);
  };

  const handleInsightClick = (insight) => {
    if (insight.filterKey && insight.filterValue) {
      onApplyFilter(insight.filterKey, insight.filterValue);
    }
  };

  const getUrgencyColor = (urgency) => {
    switch (urgency) {
      case 'high': return 'bg-red-100 text-red-700';
      case 'medium': return 'bg-yellow-100 text-yellow-700';
      default: return 'bg-blue-100 text-blue-700';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 w-80 bg-white shadow-xl border-l border-slate-200 z-40 overflow-y-auto">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-yellow-500" />
            <h2 className="text-xl font-bold">Market Insights</h2>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* AI Insights */}
        <div className="space-y-4 mb-8">
          <h3 className="text-sm font-semibold text-slate-600 uppercase tracking-wide">AI Recommendations</h3>
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="animate-pulse">
                  <div className="h-4 bg-slate-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-slate-200 rounded w-full mb-1"></div>
                  <div className="h-3 bg-slate-200 rounded w-2/3"></div>
                </div>
              ))}
            </div>
          ) : (
            insights.map((insight, index) => (
              <Card key={index} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => handleInsightClick(insight)}>
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-semibold text-sm">{insight.title}</h4>
                    <Badge className={getUrgencyColor(insight.urgency)} variant="secondary">
                      {insight.urgency}
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-600 mb-3">{insight.description}</p>
                  <div className="flex items-center gap-1 text-blue-600 hover:text-blue-700">
                    <span className="text-xs font-medium">{insight.action}</span>
                    <ExternalLink className="w-3 h-3" />
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* MP-20: Sponsored Content */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-slate-600 uppercase tracking-wide">Sponsored</h3>
          
          {/* Logistics Partner Banner */}
          <Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Truck className="w-5 h-5" />
                <span className="font-semibold">FastMove Logistics</span>
              </div>
              <p className="text-sm opacity-90 mb-3">
                Get 20% off on vehicle transportation nationwide. Trusted by 1000+ dealers.
              </p>
              <Button size="sm" variant="secondary" className="w-full">
                Get Quote Now
              </Button>
            </CardContent>
          </Card>

          {/* Insurance Partner Banner */}
          <Card className="bg-gradient-to-r from-green-600 to-teal-600 text-white">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Target className="w-5 h-5" />
                <span className="font-semibold">SafeGuard Insurance</span>
              </div>
              <p className="text-sm opacity-90 mb-3">
                Instant vehicle insurance quotes. Special rates for dealers.
              </p>
              <Button size="sm" variant="secondary" className="w-full">
                Get Quote
              </Button>
            </CardContent>
          </Card>

          {/* Market Research Banner */}
          <Card className="bg-gradient-to-r from-orange-600 to-red-600 text-white">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-5 h-5" />
                <span className="font-semibold">Market Pro Reports</span>
              </div>
              <p className="text-sm opacity-90 mb-3">
                Weekly market analysis & price predictions. Stay ahead of trends.
              </p>
              <Button size="sm" variant="secondary" className="w-full">
                Subscribe
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Quick Stats */}
        <div className="mt-8 pt-6 border-t border-slate-200">
          <h3 className="text-sm font-semibold text-slate-600 uppercase tracking-wide mb-4">Market Pulse</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">↑ 12%</div>
              <div className="text-xs text-slate-600">Price Index</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">18 days</div>
              <div className="text-xs text-slate-600">Avg. Sale Time</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">2.3K</div>
              <div className="text-xs text-slate-600">New Listings</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">89%</div>
              <div className="text-xs text-slate-600">Market Health</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}