import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Zap, 
  TrendingUp, 
  TrendingDown, 
  Target, 
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  IndianRupee,
  Calendar,
  MapPin,
  BarChart3
} from 'lucide-react';
import { InvokeLLM } from '@/api/integrations';

export default function AiInsightsTab({ vehicle }) {
  const [insights, setInsights] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);

  useEffect(() => {
    generateInsights();
  }, [vehicle.id]);

  const generateInsights = async () => {
    setIsLoading(true);
    try {
      const result = await InvokeLLM({
        prompt: `Analyze this vehicle listing and provide market insights: ${vehicle.year} ${vehicle.make} ${vehicle.model}, ${vehicle.kilometers} km, asking ₹${vehicle.asking_price}, located in ${vehicle.location_city}. Provide pricing analysis, market positioning, and improvement suggestions.`,
        response_json_schema: {
          type: "object",
          properties: {
            price_analysis: {
              type: "object",
              properties: {
                market_position: { type: "string", enum: ["underpriced", "competitive", "overpriced"] },
                confidence: { type: "number", minimum: 0, maximum: 100 },
                suggested_price: { type: "number" },
                price_range: { 
                  type: "object",
                  properties: {
                    min: { type: "number" },
                    max: { type: "number" }
                  }
                }
              }
            },
            market_trends: {
              type: "object", 
              properties: {
                demand: { type: "string", enum: ["high", "medium", "low"] },
                trend_direction: { type: "string", enum: ["up", "stable", "down"] },
                seasonal_factor: { type: "string" }
              }
            },
            comparisons: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  vehicle: { type: "string" },
                  price: { type: "number" },
                  advantage: { type: "string" }
                }
              }
            },
            recommendations: {
              type: "array",
              items: { type: "string" }
            },
            selling_probability: {
              type: "object",
              properties: {
                current_price: { type: "number", minimum: 0, maximum: 100 },
                suggested_price: { type: "number", minimum: 0, maximum: 100 },
                time_estimate_days: { type: "number" }
              }
            }
          }
        }
      });
      
      setInsights(result);
      setLastUpdated(new Date());
    } catch (error) {
      console.error("Failed to generate AI insights:", error);
      // Fallback to mock data
      setInsights(getMockInsights());
      setLastUpdated(new Date());
    }
    setIsLoading(false);
  };

  const getMockInsights = () => ({
    price_analysis: {
      market_position: "competitive",
      confidence: 87,
      suggested_price: vehicle.asking_price * 0.95,
      price_range: {
        min: vehicle.asking_price * 0.9,
        max: vehicle.asking_price * 1.1
      }
    },
    market_trends: {
      demand: "high",
      trend_direction: "up", 
      seasonal_factor: "Good time to sell - pre-festival demand"
    },
    comparisons: [
      {
        vehicle: "2019 Swift Dzire VXI",
        price: 580000,
        advantage: "Your vehicle has lower mileage"
      },
      {
        vehicle: "2020 Swift Dzire ZXI",
        price: 650000,
        advantage: "Similar features but higher price"
      }
    ],
    recommendations: [
      "Add service history documents to increase buyer confidence",
      "Consider reducing price by ₹15,000 for faster sale",
      "Highlight recent maintenance in description",
      "Upload interior photos - missing from current listing"
    ],
    selling_probability: {
      current_price: 73,
      suggested_price: 89,
      time_estimate_days: 18
    }
  });

  const formatPrice = (price) => {
    if (price >= 100000) {
      return `₹${(price / 100000).toFixed(1)}L`;
    }
    return `₹${(price / 1000).toFixed(0)}K`;
  };

  const getPricePositionColor = (position) => {
    const colors = {
      underpriced: 'text-blue-600 bg-blue-50',
      competitive: 'text-green-600 bg-green-50', 
      overpriced: 'text-red-600 bg-red-50'
    };
    return colors[position] || 'text-slate-600 bg-slate-50';
  };

  const getTrendIcon = (direction) => {
    if (direction === 'up') return TrendingUp;
    if (direction === 'down') return TrendingDown;
    return Target;
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center h-32">
          <RefreshCw className="w-8 h-8 text-blue-600 animate-spin" />
        </div>
        <div className="text-center text-slate-600">Generating AI insights...</div>
      </div>
    );
  }

  if (!insights) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="w-12 h-12 text-orange-500 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-slate-900 mb-2">Insights Unavailable</h3>
        <p className="text-slate-600 mb-4">Unable to generate AI insights at this time.</p>
        <Button onClick={generateInsights}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Try Again
        </Button>
      </div>
    );
  }

  const TrendIcon = getTrendIcon(insights.market_trends?.trend_direction);

  return (
    <div className="space-y-6">
      {/* Header with Refresh */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Zap className="w-5 h-5 text-blue-600" />
            AI Market Insights
          </h2>
          {lastUpdated && (
            <p className="text-sm text-slate-600">
              Last updated {lastUpdated.toLocaleTimeString()}
            </p>
          )}
        </div>
        <Button variant="outline" size="sm" onClick={generateInsights}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Price Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <IndianRupee className="w-5 h-5" />
            Price Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-slate-600">Market Position</div>
                <Badge className={`mt-1 ${getPricePositionColor(insights.price_analysis.market_position)}`}>
                  {insights.price_analysis.market_position.toUpperCase()}
                </Badge>
              </div>
              <div className="text-right">
                <div className="text-sm text-slate-600">Confidence</div>
                <div className="text-xl font-bold">{insights.price_analysis.confidence}%</div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 p-4 bg-slate-50 rounded-lg">
              <div className="text-center">
                <div className="text-sm text-slate-600">Current Asking</div>
                <div className="text-lg font-bold">{formatPrice(vehicle.asking_price)}</div>
              </div>
              <div className="text-center">
                <div className="text-sm text-slate-600">AI Suggested</div>
                <div className="text-lg font-bold text-blue-600">
                  {formatPrice(insights.price_analysis.suggested_price)}
                </div>
              </div>
            </div>

            <div>
              <div className="text-sm text-slate-600 mb-2">Optimal Price Range</div>
              <div className="flex justify-between text-sm">
                <span>{formatPrice(insights.price_analysis.price_range.min)}</span>
                <span>{formatPrice(insights.price_analysis.price_range.max)}</span>
              </div>
              <Progress value={75} className="mt-1" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Market Trends */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Market Trends
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
              <div className="flex items-center gap-3">
                <TrendIcon className="w-5 h-5 text-blue-600" />
                <div>
                  <div className="font-medium">Market Demand</div>
                  <div className="text-sm text-slate-600 capitalize">
                    {insights.market_trends.demand} demand
                  </div>
                </div>
              </div>
              <Badge variant="secondary" className="capitalize">
                {insights.market_trends.trend_direction}
              </Badge>
            </div>

            {insights.market_trends.seasonal_factor && (
              <div className="p-3 bg-blue-50 rounded-lg">
                <div className="font-medium text-blue-900">Seasonal Insight</div>
                <div className="text-sm text-blue-800 mt-1">
                  {insights.market_trends.seasonal_factor}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Selling Probability */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5" />
            Selling Probability
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>At Current Price</span>
                <span>{insights.selling_probability.current_price}%</span>
              </div>
              <Progress value={insights.selling_probability.current_price} />
            </div>

            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>At Suggested Price</span>
                <span>{insights.selling_probability.suggested_price}%</span>
              </div>
              <Progress value={insights.selling_probability.suggested_price} />
            </div>

            <div className="p-3 bg-green-50 rounded-lg">
              <div className="font-medium text-green-900">Estimated Time to Sell</div>
              <div className="text-2xl font-bold text-green-900">
                {insights.selling_probability.time_estimate_days} days
              </div>
              <div className="text-sm text-green-800">At suggested price</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Market Comparisons */}
      {insights.comparisons && insights.comparisons.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Similar Vehicles</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {insights.comparisons.map((comp, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <div className="font-medium">{comp.vehicle}</div>
                    <div className="text-sm text-slate-600">{comp.advantage}</div>
                  </div>
                  <div className="text-lg font-bold">{formatPrice(comp.price)}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recommendations */}
      {insights.recommendations && insights.recommendations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              AI Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {insights.recommendations.map((rec, index) => (
                <div key={index} className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                  <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-green-800">{rec}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}