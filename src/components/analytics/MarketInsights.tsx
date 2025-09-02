import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as ChartTooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  ScatterChart,
  Scatter,
  Area,
  AreaChart
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  Target,
  Users,
  MapPin,
  AlertTriangle,
  CheckCircle2,
  Info,
  DollarSign,
  BarChart2,
  Activity
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface MarketInsightsProps {
  selectedBranchId: string;
  dealerId: string;
}

interface CompetitorData {
  name: string;
  distance: number;
  avgPrice: number;
  inventory: number;
  sales: number;
  marketShare: number;
}

interface MarketTrend {
  date: string;
  localPrice: number;
  marketPrice: number;
  demand: number;
  supply: number;
}

interface PricingOpportunity {
  vehicle: {
    make: string;
    model: string;
    year: number;
    registration: string;
  };
  currentPrice: number;
  recommendedPrice: number;
  priceGap: number;
  confidence: number;
  reason: string;
}

export default function MarketInsights({ selectedBranchId, dealerId }: MarketInsightsProps) {
  const [competitors, setCompetitors] = useState<CompetitorData[]>([]);
  const [marketTrends, setMarketTrends] = useState<MarketTrend[]>([]);
  const [pricingOpportunities, setPricingOpportunities] = useState<PricingOpportunity[]>([]);
  const [selectedTimeframe, setSelectedTimeframe] = useState('30d');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadMarketData();
  }, [selectedTimeframe, selectedCategory]);

  const loadMarketData = async () => {
    setIsLoading(true);
    try {
      // Mock competitor data
      const mockCompetitors: CompetitorData[] = [
        {
          name: "Premium Auto Mall",
          distance: 2.5,
          avgPrice: 850000,
          inventory: 45,
          sales: 12,
          marketShare: 18.5
        },
        {
          name: "City Motors",
          distance: 5.1,
          avgPrice: 720000,
          inventory: 32,
          sales: 8,
          marketShare: 12.8
        },
        {
          name: "Metro Cars",
          distance: 8.3,
          avgPrice: 680000,
          inventory: 28,
          sales: 6,
          marketShare: 9.7
        },
        {
          name: "Budget Auto Hub",
          distance: 12.0,
          avgPrice: 550000,
          inventory: 52,
          sales: 15,
          marketShare: 24.2
        }
      ];

      // Mock market trends
      const mockTrends: MarketTrend[] = Array.from({ length: 30 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (29 - i));
        return {
          date: date.toISOString().split('T')[0],
          localPrice: 650000 + Math.sin(i * 0.3) * 50000 + Math.random() * 20000,
          marketPrice: 680000 + Math.sin(i * 0.25) * 45000 + Math.random() * 15000,
          demand: 75 + Math.sin(i * 0.4) * 15 + Math.random() * 10,
          supply: 85 + Math.sin(i * 0.35) * 12 + Math.random() * 8
        };
      });

      // Mock pricing opportunities
      const mockOpportunities: PricingOpportunity[] = [
        {
          vehicle: {
            make: "Honda",
            model: "City",
            year: 2020,
            registration: "MH 12 AB 1234"
          },
          currentPrice: 850000,
          recommendedPrice: 720000,
          priceGap: -130000,
          confidence: 85,
          reason: "Overpriced by 15% compared to similar vehicles in your area"
        },
        {
          vehicle: {
            make: "Maruti",
            model: "Swift",
            year: 2019,
            registration: "MH 14 CD 5678"
          },
          currentPrice: 620000,
          recommendedPrice: 680000,
          priceGap: 60000,
          confidence: 78,
          reason: "Underpriced by 10% - could increase price for better margins"
        },
        {
          vehicle: {
            make: "Hyundai",
            model: "i20",
            year: 2021,
            registration: "MH 15 EF 9012"
          },
          currentPrice: 750000,
          recommendedPrice: 730000,
          priceGap: -20000,
          confidence: 92,
          reason: "Slightly overpriced - adjust down by ₹20K for faster sale"
        }
      ];

      setCompetitors(mockCompetitors);
      setMarketTrends(mockTrends);
      setPricingOpportunities(mockOpportunities);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load market insights",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const marketPosition = {
    avgPrice: 720000,
    marketAvg: 685000,
    position: 'above_average', // above_average, average, below_average
    competitiveness: 78
  };

  const priceChartData = marketTrends.map(trend => ({
    date: new Date(trend.date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }),
    'Your Price': Math.round(trend.localPrice / 1000),
    'Market Average': Math.round(trend.marketPrice / 1000)
  }));

  const demandSupplyData = marketTrends.map(trend => ({
    date: new Date(trend.date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }),
    demand: trend.demand,
    supply: trend.supply
  }));

  const competitorChartData = competitors.map(comp => ({
    name: comp.name.split(' ')[0], // Short name
    'Market Share': comp.marketShare,
    'Avg Price (₹L)': Math.round(comp.avgPrice / 100000)
  }));

  const handlePricingAction = (opportunity: PricingOpportunity, action: 'adjust' | 'dismiss') => {
    if (action === 'adjust') {
      toast({
        title: "Price Adjustment Recommended",
        description: `Consider adjusting price to ₹${(opportunity.recommendedPrice / 100000).toFixed(1)}L`,
      });
    } else {
      setPricingOpportunities(prev => prev.filter(o => o.vehicle.registration !== opportunity.vehicle.registration));
      toast({
        title: "Opportunity Dismissed",
        description: "Pricing recommendation has been dismissed",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-slate-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-32 bg-slate-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
            Market Insights
          </h2>
          <p className="text-slate-600 dark:text-slate-400">
            Understand your market position and pricing strategy
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Select value={selectedTimeframe} onValueChange={setSelectedTimeframe}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
            </SelectContent>
          </Select>

          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="hatchback">Hatchback</SelectItem>
              <SelectItem value="sedan">Sedan</SelectItem>
              <SelectItem value="suv">SUV</SelectItem>
              <SelectItem value="luxury">Luxury</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Market Position Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Your Position</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                  {marketPosition.position === 'above_average' ? 'Premium' :
                   marketPosition.position === 'below_average' ? 'Budget' : 'Market Average'}
                </p>
              </div>
              <Target className="w-8 h-8 text-blue-600" />
            </div>
            <div className="mt-4">
              <div className="flex items-center justify-between text-sm mb-2">
                <span>Competitiveness</span>
                <span>{marketPosition.competitiveness}%</span>
              </div>
              <Progress value={marketPosition.competitiveness} className="h-2" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Average Price</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                  ₹{(marketPosition.avgPrice / 100000).toFixed(1)}L
                </p>
                <p className="text-xs text-slate-500">
                  Market: ₹{(marketPosition.marketAvg / 100000).toFixed(1)}L
                </p>
              </div>
              <DollarSign className="w-8 h-8 text-green-600" />
            </div>
            <div className="mt-4">
              <Badge variant={marketPosition.avgPrice > marketPosition.marketAvg ? "default" : "secondary"} className="text-xs">
                {marketPosition.avgPrice > marketPosition.marketAvg ? 'Above Market' : 'Below Market'}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Competitor Count</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                  {competitors.length}
                </p>
                <p className="text-xs text-slate-500">Within 15km radius</p>
              </div>
              <Users className="w-8 h-8 text-purple-600" />
            </div>
            <div className="mt-4">
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Closest: {Math.min(...competitors.map(c => c.distance)).toFixed(1)}km away
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Price Trends Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Price Trends Comparison
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={priceChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} />
              <YAxis
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => `₹${value}K`}
              />
              <ChartTooltip
                formatter={(value: any) => [`₹${value}K`, '']}
                labelFormatter={(date) => `Date: ${date}`}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="Your Price"
                stroke="#2563eb"
                strokeWidth={3}
                dot={{ fill: '#2563eb', strokeWidth: 2, r: 4 }}
              />
              <Line
                type="monotone"
                dataKey="Market Average"
                stroke="#94a3b8"
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={{ fill: '#94a3b8', strokeWidth: 2, r: 3 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Demand & Supply + Competitor Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Demand vs Supply */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Demand vs Supply Trends
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={demandSupplyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <ChartTooltip
                  formatter={(value: any, name: any) => [value, name]}
                  labelFormatter={(date) => `Date: ${date}`}
                />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="demand"
                  stackId="1"
                  stroke="#22c55e"
                  fill="#22c55e"
                  fillOpacity={0.6}
                />
                <Area
                  type="monotone"
                  dataKey="supply"
                  stackId="2"
                  stroke="#ef4444"
                  fill="#ef4444"
                  fillOpacity={0.6}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Competitor Analysis */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Competitor Analysis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={competitorChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis yAxisId="left" tick={{ fontSize: 12 }} />
                <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12 }} />
                <ChartTooltip
                  formatter={(value: any, name: any) => [value, name]}
                />
                <Legend />
                <Bar yAxisId="left" dataKey="Market Share" fill="#2563eb" />
                <Bar yAxisId="right" dataKey="Avg Price (₹L)" fill="#94a3b8" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Pricing Opportunities */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5" />
            AI-Powered Pricing Opportunities
          </CardTitle>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Smart recommendations to optimize your pricing strategy
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {pricingOpportunities.map((opportunity, index) => (
              <div
                key={index}
                className={`p-4 rounded-lg border ${
                  opportunity.priceGap > 0
                    ? 'border-green-200 bg-green-50 dark:bg-green-900/20'
                    : 'border-orange-200 bg-orange-50 dark:bg-orange-900/20'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="font-medium text-slate-900 dark:text-white">
                        {opportunity.vehicle.make} {opportunity.vehicle.model} {opportunity.vehicle.year}
                      </h4>
                      <Badge variant="outline" className="text-xs">
                        {opportunity.vehicle.registration}
                      </Badge>
                      <Badge
                        variant={opportunity.confidence > 80 ? "default" : "secondary"}
                        className="text-xs"
                      >
                        {opportunity.confidence}% confidence
                      </Badge>
                    </div>

                    <div className="flex items-center gap-6 text-sm">
                      <div>
                        <span className="text-slate-600 dark:text-slate-400">Current: </span>
                        <span className="font-medium">₹{(opportunity.currentPrice / 100000).toFixed(1)}L</span>
                      </div>
                      <div>
                        <span className="text-slate-600 dark:text-slate-400">Recommended: </span>
                        <span className="font-medium">₹{(opportunity.recommendedPrice / 100000).toFixed(1)}L</span>
                      </div>
                      <div>
                        <span className={`font-medium ${
                          opportunity.priceGap > 0 ? 'text-green-600' : 'text-orange-600'
                        }`}>
                          {opportunity.priceGap > 0 ? '+' : ''}₹{(Math.abs(opportunity.priceGap) / 1000).toFixed(0)}K
                        </span>
                      </div>
                    </div>

                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
                      {opportunity.reason}
                    </p>
                  </div>

                  <div className="flex gap-2 ml-4">
                    <Button
                      size="sm"
                      onClick={() => handlePricingAction(opportunity, 'adjust')}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      <TrendingUp className="w-4 h-4 mr-1" />
                      Adjust
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handlePricingAction(opportunity, 'dismiss')}
                    >
                      Dismiss
                    </Button>
                  </div>
                </div>
              </div>
            ))}

            {pricingOpportunities.length === 0 && (
              <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                <CheckCircle2 className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>All vehicles are optimally priced!</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Competitor Details Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            Nearby Competitors
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {competitors.map((competitor, index) => (
              <div key={index} className="flex items-center justify-between p-4 border border-slate-200 dark:border-slate-700 rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-slate-100 dark:bg-slate-700 rounded-lg flex items-center justify-center">
                    <Users className="w-5 h-5 text-slate-600" />
                  </div>
                  <div>
                    <p className="font-medium text-slate-900 dark:text-white">{competitor.name}</p>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      {competitor.distance}km away • {competitor.inventory} vehicles
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-6 text-sm">
                  <div className="text-center">
                    <p className="font-medium">₹{(competitor.avgPrice / 100000).toFixed(1)}L</p>
                    <p className="text-slate-600 dark:text-slate-400">Avg Price</p>
                  </div>
                  <div className="text-center">
                    <p className="font-medium">{competitor.sales}</p>
                    <p className="text-slate-600 dark:text-slate-400">Sales/Month</p>
                  </div>
                  <div className="text-center">
                    <p className="font-medium">{competitor.marketShare}%</p>
                    <p className="text-slate-600 dark:text-slate-400">Market Share</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
