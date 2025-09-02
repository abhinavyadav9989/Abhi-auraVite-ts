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
  PieChart,
  Pie,
  Cell,
  Area,
  AreaChart
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Target,
  AlertTriangle,
  CheckCircle2,
  Info,
  BarChart2,
  PieChart as PieChartIcon,
  Calendar,
  Download,
  Share2
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface RevenueAnalyticsProps {
  selectedBranchId: string;
  dealerId: string;
}

interface RevenueData {
  date: string;
  revenue: number;
  cost: number;
  profit: number;
  margin: number;
  transactions: number;
}

interface ExpenseBreakdown {
  category: string;
  amount: number;
  percentage: number;
  trend: 'up' | 'down' | 'stable';
}

interface ProfitMargin {
  month: string;
  grossMargin: number;
  netMargin: number;
  targetMargin: number;
}

export default function RevenueAnalytics({ selectedBranchId, dealerId }: RevenueAnalyticsProps) {
  const [revenueData, setRevenueData] = useState<RevenueData[]>([]);
  const [expenseBreakdown, setExpenseBreakdown] = useState<ExpenseBreakdown[]>([]);
  const [profitMargins, setProfitMargins] = useState<ProfitMargin[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState('6months');
  const [selectedView, setSelectedView] = useState('revenue');
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadRevenueData();
  }, [selectedPeriod]);

  const loadRevenueData = async () => {
    setIsLoading(true);
    try {
      // Mock revenue data for 6 months
      const mockRevenueData: RevenueData[] = Array.from({ length: 6 }, (_, i) => {
        const date = new Date();
        date.setMonth(date.getMonth() - (5 - i));

        const revenue = 2500000 + Math.sin(i * 0.8) * 500000 + Math.random() * 200000;
        const cost = revenue * (0.75 + Math.random() * 0.1); // 75-85% of revenue
        const profit = revenue - cost;
        const margin = (profit / revenue) * 100;

        return {
          date: date.toLocaleDateString('en-IN', { month: 'short', year: 'numeric' }),
          revenue: Math.round(revenue),
          cost: Math.round(cost),
          profit: Math.round(profit),
          margin: Math.round(margin * 100) / 100,
          transactions: Math.floor(15 + Math.random() * 10)
        };
      });

      // Mock expense breakdown
      const mockExpenses: ExpenseBreakdown[] = [
        { category: 'Vehicle Acquisition', amount: 1850000, percentage: 68.5, trend: 'up' },
        { category: 'Marketing & Advertising', amount: 280000, percentage: 10.4, trend: 'stable' },
        { category: 'Operations & Staff', amount: 220000, percentage: 8.2, trend: 'up' },
        { category: 'Facility & Equipment', amount: 180000, percentage: 6.7, trend: 'stable' },
        { category: 'Platform Fees', amount: 150000, percentage: 5.6, trend: 'down' },
        { category: 'Miscellaneous', amount: 25000, percentage: 0.9, trend: 'stable' }
      ];

      // Mock profit margins
      const mockMargins: ProfitMargin[] = Array.from({ length: 6 }, (_, i) => {
        const date = new Date();
        date.setMonth(date.getMonth() - (5 - i));

        return {
          month: date.toLocaleDateString('en-IN', { month: 'short' }),
          grossMargin: 18 + Math.sin(i * 0.7) * 5 + Math.random() * 3,
          netMargin: 12 + Math.sin(i * 0.6) * 4 + Math.random() * 2,
          targetMargin: 15
        };
      });

      setRevenueData(mockRevenueData);
      setExpenseBreakdown(mockExpenses);
      setProfitMargins(mockMargins);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load revenue analytics",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const currentMetrics = {
    totalRevenue: revenueData.reduce((sum, item) => sum + item.revenue, 0),
    totalProfit: revenueData.reduce((sum, item) => sum + item.profit, 0),
    avgMargin: revenueData.reduce((sum, item) => sum + item.margin, 0) / revenueData.length,
    totalTransactions: revenueData.reduce((sum, item) => sum + item.transactions, 0)
  };

  const profitMarginData = profitMargins.map(margin => ({
    month: margin.month,
    'Gross Margin': Math.round(margin.grossMargin * 100) / 100,
    'Net Margin': Math.round(margin.netMargin * 100) / 100,
    'Target': margin.targetMargin
  }));

  const revenueChartData = revenueData.map(item => ({
    month: item.date,
    Revenue: Math.round(item.revenue / 100000), // Convert to lakhs for better display
    'Cost of Goods': Math.round(item.cost / 100000),
    Profit: Math.round(item.profit / 100000)
  }));

  const expenseChartData = expenseBreakdown.map(expense => ({
    name: expense.category.split(' ')[0], // Short name
    value: expense.percentage,
    amount: expense.amount
  }));

  const COLORS = ['#2563eb', '#dc2626', '#16a34a', '#ca8a04', '#7c3aed', '#0891b2'];

  const handleExport = (type: 'revenue' | 'expenses' | 'margins') => {
    toast({
      title: "Export Started",
      description: `Generating ${type} report...`,
    });
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
            Revenue Analytics
          </h2>
          <p className="text-slate-600 dark:text-slate-400">
            Track your financial performance and profit margins
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-36">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="3months">Last 3 Months</SelectItem>
              <SelectItem value="6months">Last 6 Months</SelectItem>
              <SelectItem value="12months">Last 12 Months</SelectItem>
              <SelectItem value="custom">Custom Period</SelectItem>
            </SelectContent>
          </Select>

          <Select value={selectedView} onValueChange={setSelectedView}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="revenue">Revenue</SelectItem>
              <SelectItem value="profit">Profit</SelectItem>
              <SelectItem value="margins">Margins</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline" onClick={() => handleExport('revenue')}>
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Total Revenue</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                  ₹{(currentMetrics.totalRevenue / 10000000).toFixed(1)}Cr
                </p>
                <p className="text-xs text-green-600 flex items-center gap-1 mt-1">
                  <TrendingUp className="w-3 h-3" />
                  +12.5% from last period
                </p>
              </div>
              <DollarSign className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Total Profit</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                  ₹{(currentMetrics.totalProfit / 10000000).toFixed(1)}Cr
                </p>
                <p className="text-xs text-green-600 flex items-center gap-1 mt-1">
                  <TrendingUp className="w-3 h-3" />
                  +8.3% from last period
                </p>
              </div>
              <Target className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Average Margin</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                  {currentMetrics.avgMargin.toFixed(1)}%
                </p>
                <div className="mt-2">
                  <Progress value={currentMetrics.avgMargin} className="h-2" />
                  <p className="text-xs text-slate-500 mt-1">Target: 15%</p>
                </div>
              </div>
              <BarChart2 className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Total Transactions</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                  {currentMetrics.totalTransactions}
                </p>
                <p className="text-xs text-blue-600 flex items-center gap-1 mt-1">
                  <TrendingUp className="w-3 h-3" />
                  {Math.round(currentMetrics.totalTransactions / revenueData.length)} per month
                </p>
              </div>
              <CheckCircle2 className="w-8 h-8 text-emerald-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Revenue vs Cost Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart2 className="w-5 h-5" />
            Revenue vs Cost Analysis
          </CardTitle>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Monthly breakdown of revenue, costs, and profit margins
          </p>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={revenueChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => `₹${value}L`}
              />
              <ChartTooltip
                formatter={(value: any, name: any) => [`₹${value}L`, name]}
                labelFormatter={(month) => `Month: ${month}`}
              />
              <Legend />
              <Bar dataKey="Revenue" fill="#22c55e" radius={[2, 2, 0, 0]} />
              <Bar dataKey="Cost of Goods" fill="#ef4444" radius={[2, 2, 0, 0]} />
              <Bar dataKey="Profit" fill="#2563eb" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Profit Margins & Expenses */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Profit Margins Trend */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Profit Margin Trends
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={profitMarginData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => `${value}%`}
                />
                <ChartTooltip
                  formatter={(value: any, name: any) => [`${value}%`, name]}
                  labelFormatter={(month) => `Month: ${month}`}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="Gross Margin"
                  stroke="#22c55e"
                  strokeWidth={3}
                  dot={{ fill: '#22c55e', strokeWidth: 2, r: 4 }}
                />
                <Line
                  type="monotone"
                  dataKey="Net Margin"
                  stroke="#2563eb"
                  strokeWidth={2}
                  dot={{ fill: '#2563eb', strokeWidth: 2, r: 4 }}
                />
                <Line
                  type="monotone"
                  dataKey="Target"
                  stroke="#94a3b8"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Expense Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChartIcon className="w-5 h-5" />
              Expense Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={expenseChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {expenseChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <ChartTooltip
                    formatter={(value: any, name: any) => [`${value}%`, name]}
                  />
                </PieChart>
              </ResponsiveContainer>

              <div className="space-y-2">
                {expenseBreakdown.map((expense, index) => (
                  <div key={expense.category} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                      />
                      <span className="text-slate-600 dark:text-slate-400">{expense.category}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">₹{(expense.amount / 100000).toFixed(1)}L</span>
                      <span className="text-slate-500">({expense.percentage}%)</span>
                      {expense.trend === 'up' && <TrendingUp className="w-3 h-3 text-red-500" />}
                      {expense.trend === 'down' && <TrendingDown className="w-3 h-3 text-green-500" />}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Financial Health Indicators */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5" />
            Financial Health Indicators
          </CardTitle>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Key metrics to monitor your business financial performance
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Profitability Score */}
            <div className="text-center">
              <div className="relative w-24 h-24 mx-auto mb-4">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    stroke="#e2e8f0"
                    strokeWidth="8"
                    fill="none"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    stroke="#22c55e"
                    strokeWidth="8"
                    fill="none"
                    strokeDasharray={`${currentMetrics.avgMargin * 2.51} 251`}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-lg font-bold text-slate-900 dark:text-white">
                      {currentMetrics.avgMargin.toFixed(0)}%
                    </div>
                    <div className="text-xs text-slate-600">Profit Margin</div>
                  </div>
                </div>
              </div>
              <Badge variant={currentMetrics.avgMargin >= 15 ? "default" : "secondary"}>
                {currentMetrics.avgMargin >= 15 ? "Healthy" : "Needs Attention"}
              </Badge>
            </div>

            {/* Revenue Growth */}
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="font-semibold text-slate-900 dark:text-white mb-1">Revenue Growth</h3>
              <p className="text-2xl font-bold text-green-600">+12.5%</p>
              <p className="text-sm text-slate-600 dark:text-slate-400">vs last period</p>
            </div>

            {/* Cost Efficiency */}
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Target className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="font-semibold text-slate-900 dark:text-white mb-1">Cost Efficiency</h3>
              <p className="text-2xl font-bold text-blue-600">78%</p>
              <p className="text-sm text-slate-600 dark:text-slate-400">Industry average</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Monthly Performance Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Monthly Performance Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-700">
                  <th className="text-left py-3 px-4 font-medium text-slate-900 dark:text-white">Month</th>
                  <th className="text-right py-3 px-4 font-medium text-slate-600 dark:text-slate-400">Revenue</th>
                  <th className="text-right py-3 px-4 font-medium text-slate-600 dark:text-slate-400">Cost</th>
                  <th className="text-right py-3 px-4 font-medium text-slate-600 dark:text-slate-400">Profit</th>
                  <th className="text-right py-3 px-4 font-medium text-slate-600 dark:text-slate-400">Margin</th>
                  <th className="text-right py-3 px-4 font-medium text-slate-600 dark:text-slate-400">Transactions</th>
                </tr>
              </thead>
              <tbody>
                {revenueData.map((item, index) => (
                  <tr key={index} className="border-b border-slate-100 dark:border-slate-800">
                    <td className="py-3 px-4 font-medium text-slate-900 dark:text-white">{item.date}</td>
                    <td className="py-3 px-4 text-right">₹{(item.revenue / 10000000).toFixed(2)}Cr</td>
                    <td className="py-3 px-4 text-right">₹{(item.cost / 10000000).toFixed(2)}Cr</td>
                    <td className="py-3 px-4 text-right text-green-600 font-medium">₹{(item.profit / 10000000).toFixed(2)}Cr</td>
                    <td className="py-3 px-4 text-right">{item.margin.toFixed(1)}%</td>
                    <td className="py-3 px-4 text-right">{item.transactions}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
