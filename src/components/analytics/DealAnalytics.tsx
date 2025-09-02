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
  FunnelChart,
  Funnel,
  LabelList,
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as ChartTooltip,
  Legend,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import {
  TrendingUp,
  Users,
  Target,
  Clock,
  CheckCircle2,
  AlertTriangle,
  DollarSign,
  BarChart2,
  PieChart as PieChartIcon,
  Calendar
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface DealAnalyticsProps {
  selectedBranchId: string;
  dealerId: string;
}

interface DealStage {
  name: string;
  count: number;
  value: number;
  conversionRate: number;
  avgDays: number;
}

interface ConversionTrend {
  date: string;
  leads: number;
  offers: number;
  escrows: number;
  deliveries: number;
  conversion: number;
}

interface DealSource {
  source: string;
  leads: number;
  conversions: number;
  conversionRate: number;
  avgDealValue: number;
}

export default function DealAnalytics({ selectedBranchId, dealerId }: DealAnalyticsProps) {
  const [dealStages, setDealStages] = useState<DealStage[]>([]);
  const [conversionTrends, setConversionTrends] = useState<ConversionTrend[]>([]);
  const [dealSources, setDealSources] = useState<DealSource[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState('30d');
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadDealData();
  }, [selectedPeriod]);

  const loadDealData = async () => {
    setIsLoading(true);
    try {
      // Mock deal funnel data
      const mockStages: DealStage[] = [
        {
          name: 'Leads',
          count: 150,
          value: 45000000,
          conversionRate: 100,
          avgDays: 0
        },
        {
          name: 'Offers Made',
          count: 95,
          value: 38000000,
          conversionRate: 63.3,
          avgDays: 3
        },
        {
          name: 'Escrow Paid',
          count: 68,
          value: 29000000,
          conversionRate: 45.3,
          avgDays: 7
        },
        {
          name: 'Delivered',
          count: 52,
          value: 24000000,
          conversionRate: 34.7,
          avgDays: 14
        }
      ];

      // Mock conversion trends over time
      const mockTrends: ConversionTrend[] = Array.from({ length: 30 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (29 - i));

        const leads = 4 + Math.floor(Math.random() * 6);
        const offers = Math.floor(leads * (0.6 + Math.random() * 0.2));
        const escrows = Math.floor(offers * (0.7 + Math.random() * 0.2));
        const deliveries = Math.floor(escrows * (0.8 + Math.random() * 0.15));
        const conversion = leads > 0 ? (deliveries / leads) * 100 : 0;

        return {
          date: date.toISOString().split('T')[0],
          leads,
          offers,
          escrows,
          deliveries,
          conversion: Math.round(conversion * 100) / 100
        };
      });

      // Mock deal sources
      const mockSources: DealSource[] = [
        {
          source: 'Marketplace',
          leads: 75,
          conversions: 28,
          conversionRate: 37.3,
          avgDealValue: 850000
        },
        {
          source: 'Direct Walk-in',
          leads: 45,
          conversions: 16,
          conversionRate: 35.6,
          avgDealValue: 720000
        },
        {
          source: 'Referral',
          leads: 20,
          conversions: 6,
          conversionRate: 30.0,
          avgDealValue: 950000
        },
        {
          source: 'Online Ads',
          leads: 10,
          conversions: 2,
          conversionRate: 20.0,
          avgDealValue: 680000
        }
      ];

      setDealStages(mockStages);
      setConversionTrends(mockTrends);
      setDealSources(mockSources);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load deal analytics",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const funnelData = dealStages.map(stage => ({
    name: stage.name,
    value: stage.count,
    fill: stage.name === 'Leads' ? '#94a3b8' :
          stage.name === 'Offers Made' ? '#fbbf24' :
          stage.name === 'Escrow Paid' ? '#3b82f6' : '#22c55e'
  }));

  const conversionChartData = conversionTrends.map(trend => ({
    date: new Date(trend.date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }),
    'Conversion Rate': trend.conversion,
    Leads: trend.leads,
    Deliveries: trend.deliveries
  }));

  const sourceChartData = dealSources.map(source => ({
    name: source.source.split(' ')[0],
    'Conversion Rate': source.conversionRate,
    Leads: source.leads,
    Conversions: source.conversions
  }));

  const COLORS = ['#94a3b8', '#fbbf24', '#3b82f6', '#22c55e'];

  const currentMetrics = {
    totalLeads: dealStages[0]?.count || 0,
    totalConversions: dealStages[dealStages.length - 1]?.count || 0,
    conversionRate: dealStages[0]?.count > 0
      ? ((dealStages[dealStages.length - 1]?.count || 0) / dealStages[0].count * 100)
      : 0,
    avgDealValue: dealStages[dealStages.length - 1]?.count > 0
      ? ((dealStages[dealStages.length - 1]?.value || 0) / dealStages[dealStages.length - 1].count)
      : 0,
    avgDaysToClose: dealStages[dealStages.length - 1]?.avgDays || 0
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-slate-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
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
            Deal Analytics
          </h2>
          <p className="text-slate-600 dark:text-slate-400">
            Track conversion rates and optimize your sales funnel
          </p>
        </div>

        <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
          <SelectTrigger className="w-36">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7d">Last 7 Days</SelectItem>
            <SelectItem value="30d">Last 30 Days</SelectItem>
            <SelectItem value="90d">Last 90 Days</SelectItem>
            <SelectItem value="custom">Custom Period</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Total Leads</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                  {currentMetrics.totalLeads}
                </p>
                <p className="text-xs text-green-600 flex items-center gap-1 mt-1">
                  <TrendingUp className="w-3 h-3" />
                  +15.2% from last period
                </p>
              </div>
              <Users className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Conversion Rate</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                  {currentMetrics.conversionRate.toFixed(1)}%
                </p>
                <div className="mt-2">
                  <Progress value={currentMetrics.conversionRate} className="h-2" />
                  <p className="text-xs text-slate-500 mt-1">Industry avg: 28%</p>
                </div>
              </div>
              <Target className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Avg Deal Value</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                  ₹{(currentMetrics.avgDealValue / 100000).toFixed(1)}L
                </p>
                <p className="text-xs text-blue-600 flex items-center gap-1 mt-1">
                  <TrendingUp className="w-3 h-3" />
                  +8.5% from last period
                </p>
              </div>
              <DollarSign className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Avg Days to Close</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                  {currentMetrics.avgDaysToClose}d
                </p>
                <p className="text-xs text-orange-600 flex items-center gap-1 mt-1">
                  <Clock className="w-3 h-3" />
                  Target: 12 days
                </p>
              </div>
              <Clock className="w-8 h-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Deal Funnel */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Funnel className="w-5 h-5" />
            Sales Funnel Performance
          </CardTitle>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Track how leads progress through your sales stages
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <ResponsiveContainer width="100%" height={300}>
                <FunnelChart>
                  <Funnel
                    dataKey="value"
                    data={funnelData}
                    isAnimationActive
                    trapezoids={funnelData.map((item, index) => ({
                      name: item.name,
                      value: item.value,
                      fill: item.fill,
                      isActive: true
                    }))}
                  />
                </FunnelChart>
              </ResponsiveContainer>
            </div>

            <div className="space-y-4">
              {dealStages.map((stage, index) => (
                <div key={stage.name} className="flex items-center justify-between p-3 border border-slate-200 dark:border-slate-700 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${
                      stage.name === 'Leads' ? 'bg-slate-400' :
                      stage.name === 'Offers Made' ? 'bg-yellow-500' :
                      stage.name === 'Escrow Paid' ? 'bg-blue-500' : 'bg-green-500'
                    }`} />
                    <div>
                      <p className="font-medium text-slate-900 dark:text-white">{stage.name}</p>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        ₹{(stage.value / 10000000).toFixed(2)}Cr total value
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="font-semibold text-slate-900 dark:text-white">{stage.count}</p>
                    <p className="text-xs text-slate-500">
                      {stage.conversionRate.toFixed(1)}% conversion
                    </p>
                    {stage.avgDays > 0 && (
                      <p className="text-xs text-slate-500">{stage.avgDays}d avg</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Conversion Trends & Lead Sources */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Conversion Trends */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Conversion Rate Trends
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={conversionChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                <YAxis
                  yAxisId="left"
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => `${value}%`}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  tick={{ fontSize: 12 }}
                />
                <ChartTooltip
                  formatter={(value: any, name: any) => [
                    name === 'Conversion Rate' ? `${value}%` : value,
                    name
                  ]}
                  labelFormatter={(date) => `Date: ${date}`}
                />
                <Legend />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="Conversion Rate"
                  stroke="#22c55e"
                  strokeWidth={3}
                  dot={{ fill: '#22c55e', strokeWidth: 2, r: 4 }}
                />
                <Bar
                  yAxisId="right"
                  dataKey="Leads"
                  fill="#94a3b8"
                  opacity={0.6}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Lead Sources */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChartIcon className="w-5 h-5" />
              Lead Source Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={sourceChartData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="Conversion Rate"
                  nameKey="name"
                  label={({ name, value }) => `${name}: ${value}%`}
                >
                  {sourceChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <ChartTooltip
                  formatter={(value: any, name: any) => [`${value}%`, 'Conversion Rate']}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Lead Source Performance Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart2 className="w-5 h-5" />
            Lead Source Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {dealSources.map((source, index) => (
              <div
                key={source.source}
                className="flex items-center justify-between p-4 border border-slate-200 dark:border-slate-700 rounded-lg"
              >
                <div className="flex items-center gap-4">
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  />
                  <div>
                    <p className="font-medium text-slate-900 dark:text-white">{source.source}</p>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      {source.leads} leads • {source.conversions} conversions
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <p className="font-medium text-slate-900 dark:text-white">
                      {source.conversionRate.toFixed(1)}%
                    </p>
                    <p className="text-xs text-slate-500">Conversion</p>
                  </div>

                  <div className="text-center">
                    <p className="font-medium text-slate-900 dark:text-white">
                      ₹{(source.avgDealValue / 100000).toFixed(1)}L
                    </p>
                    <p className="text-xs text-slate-500">Avg Deal</p>
                  </div>

                  <Badge
                    variant={
                      source.conversionRate >= 35 ? "default" :
                      source.conversionRate >= 25 ? "secondary" : "destructive"
                    }
                  >
                    {source.conversionRate >= 35 ? "Excellent" :
                     source.conversionRate >= 25 ? "Good" : "Needs Attention"}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Deal Performance Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5" />
            Deal Performance Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="font-medium text-slate-900 dark:text-white">Strengths</h4>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-green-600">
                  <CheckCircle2 className="w-4 h-4" />
                  <span className="text-sm">Above industry average conversion rate</span>
                </div>
                <div className="flex items-center gap-2 text-green-600">
                  <CheckCircle2 className="w-4 h-4" />
                  <span className="text-sm">Strong marketplace performance</span>
                </div>
                <div className="flex items-center gap-2 text-green-600">
                  <CheckCircle2 className="w-4 h-4" />
                  <span className="text-sm">Consistent deal velocity</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-medium text-slate-900 dark:text-white">Opportunities</h4>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-orange-600">
                  <AlertTriangle className="w-4 h-4" />
                  <span className="text-sm">Improve online ads conversion</span>
                </div>
                <div className="flex items-center gap-2 text-orange-600">
                  <AlertTriangle className="w-4 h-4" />
                  <span className="text-sm">Reduce time from offer to escrow</span>
                </div>
                <div className="flex items-center gap-2 text-orange-600">
                  <AlertTriangle className="w-4 h-4" />
                  <span className="text-sm">Focus on high-value referral leads</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
