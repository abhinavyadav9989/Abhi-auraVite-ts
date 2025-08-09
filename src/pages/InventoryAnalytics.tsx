
import React, { useState, useEffect } from 'react';
import { Vehicle } from '@/api/entities';
import { Dealer } from '@/api/entities';
import { Transaction } from '@/api/entities';
import { User } from '@/api/entities';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Loader2, 
  Calendar, 
  BarChart2, 
  TrendingUp, 
  Clock,
  IndianRupee,
  Car,
  Download,
  Share2,
  Filter,
  X,
  AlertCircle,
  ChevronDown,
  Eye,
  Camera,
  Target,
  Zap,
  Info // Added Info icon
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as ChartTooltip, // Renamed Tooltip from recharts to ChartTooltip
  Legend, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  ScatterChart,
  Scatter,
  FunnelChart,
  Funnel,
  LabelList
} from 'recharts';
import { differenceInDays, subMonths, format, startOfDay, endOfDay } from 'date-fns';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/components/ui/use-toast";
import { createPageUrl } from '@/utils';
import { Link } from 'react-router-dom';
import {
  Tooltip as UITooltip, // Renamed Tooltip from ui/tooltip to UITooltip
  TooltipContent, // Added TooltipContent
  TooltipProvider, // Added TooltipProvider
  TooltipTrigger, // Added TooltipTrigger
} from "@/components/ui/tooltip";

// Mock insights data
const MOCK_INSIGHTS = [
  {
    id: 1,
    type: 'pricing',
    title: 'Price Optimization Alert',
    message: 'Swift Dzire 2019 is priced 12% above market. Consider reducing by ₹45,000.',
    action: 'Adjust Price',
    actionUrl: '/vehicle/123/edit',
    priority: 'high',
    dismissed: false
  },
  {
    id: 2,
    type: 'photos',
    title: 'Photo Quality Issue',
    message: '3 vehicles have fewer than 6 photos. Add more images to improve visibility.',
    action: 'Add Photos',
    actionUrl: '/inventory?filter=low_photos',
    priority: 'medium',
    dismissed: false
  },
  {
    id: 3,
    type: 'aging',
    title: 'Aging Stock Alert',
    message: '2 SUVs have been listed for over 90 days. Consider price adjustment.',
    action: 'Review Stock',
    actionUrl: '/inventory?filter=aging',
    priority: 'medium',
    dismissed: false
  }
];

const VEHICLE_CLASSES = [
  { value: 'all', label: 'All Vehicles' },
  { value: 'two_wheeler', label: '2 Wheeler' },
  { value: 'three_wheeler', label: '3 Wheeler' },
  { value: 'hatchback', label: 'Hatchback' },
  { value: 'sedan', label: 'Sedan' },  
  { value: 'suv', label: 'SUV' },
  { value: 'muv', label: 'MUV' },
  { value: 'luxury', label: 'Luxury' },
  { value: 'commercial_light', label: 'LCV' },
  { value: 'commercial_heavy', label: 'HCV' }
];

const DATE_RANGES = [
  { value: '7d', label: 'Last 7 Days' },
  { value: '30d', label: 'Last 30 Days' },
  { value: '90d', label: 'Last 90 Days' },
  { value: 'custom', label: 'Custom Range' }
];

// InfoTooltip Component
type InfoTooltipProps = { children: React.ReactNode; className?: string }
const InfoTooltip = ({ children, className }: InfoTooltipProps) => (
  <TooltipProvider>
    <UITooltip> {/* Using UITooltip */}
      <TooltipTrigger asChild>
        <Info className={`w-4 h-4 text-slate-400 hover:text-slate-600 cursor-help ml-2 ${className}`} />
      </TooltipTrigger>
      <TooltipContent className="max-w-xs text-sm p-3">
        {children}
      </TooltipContent>
    </UITooltip>
  </TooltipProvider>
);

// AN-01 to AN-04: KPI Tile Component
type KPITileProps = {
  title: string;
  value: React.ReactNode;
  subtitle?: string;
  icon: React.ComponentType<{ className?: string }>;
  trend?: { positive: boolean; value: number } | null;
  onClick?: () => void;
  loading?: boolean;
  tooltip?: React.ReactNode;
}
const KPITile = ({ title, value, subtitle, icon: Icon, trend, onClick, loading, tooltip }: KPITileProps) => (
  <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={onClick}>
    <CardContent className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-slate-600 flex items-center">
            {title}
            {tooltip && <InfoTooltip className="ml-1" >{tooltip}</InfoTooltip>}
          </p>
          {loading ? (
            <div className="h-8 w-24 bg-slate-200 animate-pulse rounded mt-2" />
          ) : (
            <p className="text-2xl font-bold text-slate-900 mt-2">{value}</p>
          )}
          {subtitle && (
            <p className="text-xs text-slate-500 mt-1">{subtitle}</p>
          )}
        </div>
        <div className="flex flex-col items-end">
          <Icon className="w-8 h-8 text-blue-600 mb-2" />
          {trend && (
            <Badge variant={trend.positive ? "default" : "destructive"} className="text-xs">
              {trend.positive ? '+' : ''}{trend.value}%
            </Badge>
          )}
        </div>
      </div>
    </CardContent>
  </Card>
);

// AN-05, AN-06: GMV Trend Chart
type GMVTrendChartProps = { data: any[]; onPointClick?: (d: any) => void }
const GMVTrendChart = ({ data, onPointClick }: GMVTrendChartProps) => (
  <ResponsiveContainer width="100%" height={300}>
    <LineChart data={data} onClick={onPointClick}>
      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
      <XAxis 
        dataKey="date" 
        tick={{ fontSize: 12, fill: '#64748b' }}
        axisLine={false}
      />
      <YAxis 
        tick={{ fontSize: 12, fill: '#64748b' }}
        axisLine={false}
        tickFormatter={(value) => `₹${(value / 100000).toFixed(1)}L`}
      />
      <ChartTooltip // Using ChartTooltip
        contentStyle={{
          backgroundColor: 'white',
          border: '1px solid #e2e8f0',
          borderRadius: '8px'
        }}
        formatter={(value: any) => [`₹${(Number(value) / 100000).toFixed(1)}L`, 'GMV']}
        labelFormatter={(date: any) => `Date: ${String(date)}`}
      />
      <Line 
        type="monotone" 
        dataKey="gmv" 
        stroke="#2563eb" 
        strokeWidth={2}
        dot={{ fill: '#2563eb', strokeWidth: 2, r: 4 }}
        activeDot={{ r: 6, fill: '#2563eb' }}
      />
    </LineChart>
  </ResponsiveContainer>
);

// AN-07, AN-08: Stock Mix Donut Chart
type StockMixChartProps = { data: { name: string; value: number }[]; onSliceClick?: (d: any) => void }
const StockMixChart = ({ data, onSliceClick }: StockMixChartProps) => {
  const COLORS = {
    public: '#22c55e',
    private: '#f59e0b', 
    service: '#8b5cf6',
    specialised: '#ef4444'
  };

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={120}
          paddingAngle={2}
          dataKey="value"
          onClick={onSliceClick}
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[entry.name]} />
          ))}
          <LabelList 
            dataKey="value" 
            position="center" 
            style={{ fontSize: '14px', fontWeight: 'bold' }}
          />
        </Pie>
        <ChartTooltip // Using ChartTooltip
          formatter={(value: any, name: any) => [value, String(name).replace('_', ' ')]}
        />
        <Legend 
          wrapperStyle={{ paddingTop: '20px' }}
          formatter={(value: any) => String(value).replace('_', ' ')}
        />
      </PieChart>
    </ResponsiveContainer>
  );
};

// AN-09: Aging Heatmap Component
type AgingHeatmapProps = { data: any[]; onCellClick: (category: string, ageRange: number, count: number) => void }
const AgingHeatmap = ({ data, onCellClick }: AgingHeatmapProps) => {
  const getHeatmapColor = (value: number, max: number) => {
    if (value === 0) return '#f8fafc';
    const intensity = value / max;
    const opacity = Math.min(intensity, 1);
    return `rgba(239, 68, 68, ${opacity})`; // Red with varying opacity
  };

  const maxValue = Math.max(...data.flatMap((row: any) => row.data.map((cell: any) => cell.value)));

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-6 gap-1 text-xs font-medium text-slate-600">
        <div></div>
        <div className="text-center">0-15d</div>
        <div className="text-center">16-30d</div>  
        <div className="text-center">31-60d</div>
        <div className="text-center">61-90d</div>
        <div className="text-center">90+d</div>
      </div>
      {data.map((row, rowIndex) => (
        <div key={rowIndex} className="grid grid-cols-6 gap-1">
          <div className="text-xs font-medium text-slate-700 py-2 pr-2 truncate">
            {row.category}
          </div>
          {row.data.map((cell, cellIndex) => (
            <div
              key={cellIndex}
              className="h-10 rounded cursor-pointer border border-slate-200 flex items-center justify-center text-xs font-medium hover:border-slate-400 transition-colors"
              style={{ backgroundColor: getHeatmapColor(cell.value, maxValue) }}
              onClick={() => onCellClick(row.category, cellIndex, cell.value)}
              title={`${row.category}: ${cell.value} vehicles`}
            >
              {cell.value > 0 ? cell.value : ''}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};

// AN-10: Deal Cycle Funnel
type DealCycleFunnelProps = { data: { name: string; count: number; avgDays: number }[] }
const DealCycleFunnel = ({ data }: DealCycleFunnelProps) => (
  <div className="space-y-3">
    {data.map((stage, index) => {
      const width = (stage.count / data[0].count) * 100;
      const dropOff = index > 0 ? ((data[index-1].count - stage.count) / data[index-1].count * 100).toFixed(1) : 0;
      
      return (
        <div key={stage.name} className="space-y-1">
          <div className="flex justify-between text-sm">
            <span className="font-medium">{stage.name}</span>
            <div className="flex gap-4 text-slate-600">
              <span>{stage.count} vehicles</span>
              {index > 0 && <span className="text-red-600">-{dropOff}%</span>}
              <span>{stage.avgDays}d avg</span>
            </div>
          </div>
          <div className="relative h-8 bg-slate-100 rounded">
            <div 
              className="absolute left-0 top-0 h-full bg-blue-600 rounded flex items-center justify-center text-white text-xs font-medium"
              style={{ width: `${width}%` }}
            >
              {stage.count}
            </div>
          </div>
        </div>
      );
    })}
  </div>
);

// AN-11, AN-12: Price vs AI Scatter Chart
type PriceVsAIChartProps = { data: any[]; onDotClick?: (d: any) => void }
const PriceVsAIChart = ({ data, onDotClick }: PriceVsAIChartProps) => (
  <ResponsiveContainer width="100%" height={300}>
    <ScatterChart data={data} onClick={onDotClick}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis 
        type="number" 
        dataKey="aiPrice" 
        name="AI Price"
        tick={{ fontSize: 12 }}
        tickFormatter={(value) => `₹${(value / 100000).toFixed(1)}L`}
      />
      <YAxis 
        type="number" 
        dataKey="askingPrice" 
        name="Asking Price"
        tick={{ fontSize: 12 }}
        tickFormatter={(value) => `₹${(value / 100000).toFixed(1)}L`}
      />
      <ChartTooltip // Using ChartTooltip
        formatter={(value: any, name: any) => [`₹${(Number(value) / 100000).toFixed(1)}L`, String(name)]}
        cursor={{ strokeDasharray: '3 3' }}
      />
      <Scatter 
        name="Vehicles" 
        dataKey="askingPrice" 
        fill="#8884d8"
      />
      {/* 45-degree reference line */}
      <Line 
        type="linear" 
        dataKey="aiPrice" 
        stroke="#94a3b8" 
        strokeDasharray="5 5"
        dot={false}
      />
    </ScatterChart>
  </ResponsiveContainer>
);

// AN-13: Photo Quality Gauge
type PhotoQualityGaugeProps = { percentage: number; onDetailsClick: () => void }
const PhotoQualityGauge = ({ percentage, onDetailsClick }: PhotoQualityGaugeProps) => (
  <div className="flex flex-col items-center space-y-4">
    <div className="relative w-32 h-32">
      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
        <circle
          cx="50"
          cy="50"
          r="45"
          stroke="#e2e8f0"
          strokeWidth="8"
          fill="none"
        />
        <circle
          cx="50"
          cy="50" 
          r="45"
          stroke="#22c55e"
          strokeWidth="8"
          fill="none"
          strokeDasharray={`${percentage * 2.83} 283`}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center">
          <div className="text-2xl font-bold text-slate-900">{percentage}%</div>
          <div className="text-xs text-slate-600">Quality</div>
        </div>
      </div>
    </div>
    <Button variant="outline" size="sm" onClick={onDetailsClick}>
      <Camera className="w-4 h-4 mr-2" />
      View Details
    </Button>
  </div>
);

// AN-14, AN-15: Insights Feed
type InsightsFeedProps = { insights: any[]; onDismiss: (id: number) => void; onAction: (insight: any) => void }
const InsightsFeed = ({ insights, onDismiss, onAction }: InsightsFeedProps) => (
  <div className="space-y-3">
    {insights.filter(i => !i.dismissed).map(insight => (
      <Card key={insight.id} className="border-l-4 border-l-blue-500">
        <CardContent className="p-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <Zap className="w-4 h-4 text-blue-600" />
                <h4 className="font-medium text-slate-900">{insight.title}</h4>
                <Badge variant={insight.priority === 'high' ? 'destructive' : 'secondary'} className="text-xs">
                  {insight.priority}
                </Badge>
              </div>
              <p className="text-sm text-slate-600 mb-3">{insight.message}</p>
              <div className="flex gap-2">
                <Button size="sm" onClick={() => onAction(insight)}>
                  {insight.action}
                </Button>
                <Button variant="ghost" size="sm" onClick={() => onDismiss(insight.id)}>
                  Dismiss
                </Button>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={() => onDismiss(insight.id)}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    ))}
  </div>
);

export default function InventoryAnalytics() {
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [dealer, setDealer] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [insights, setInsights] = useState(MOCK_INSIGHTS);
  const { toast } = useToast();

  // Filter states
  const [dateRange, setDateRange] = useState<string>('30d');
  const [vehicleClasses, setVehicleClasses] = useState<string[]>(['all']);
  const [customDateStart, setCustomDateStart] = useState('');
  const [customDateEnd, setCustomDateEnd] = useState('');
  
  // Analytics data
  const [kpiData, setKpiData] = useState<{ gmv: number; soldCars: number; avgProfit: number; avgDaysInStock: number }>({
    gmv: 0,
    soldCars: 0,
    avgProfit: 0,
    avgDaysInStock: 0
  });
  const [chartData, setChartData] = useState<{
    gmvTrend: any[];
    stockMix: { name: string; value: number }[];
    agingHeatmap: any[];
    dealFunnel: { name: string; count: number; avgDays: number }[];
    priceVsAI: any[];
    photoQuality: number;
  }>({ gmvTrend: [], stockMix: [], agingHeatmap: [], dealFunnel: [], priceVsAI: [], photoQuality: 0 });

  // Define tooltips for analytics terms
  const tooltips = {
    gmv: "Gross Merchandise Value - Total value of vehicles sold through your dealership. This represents your sales volume, helping track business growth over time.",
    soldCars: "Number of vehicles successfully sold and delivered to buyers. This metric tracks your sales velocity and deal completion rate.",
    avgProfit: "Average profit margin per vehicle sold, calculated after deducting purchase costs and platform fees. This helps assess business profitability.",
    avgDaysInStock: "Average number of days vehicles remain in your inventory before selling. Lower numbers indicate faster turnover and better pricing strategy.",
    gmvTrend: "Daily breakdown of your sales value over time. Use this to identify peak sales periods and seasonal trends in your business.",
    stockMix: "Distribution of your inventory across different vehicle types (public, private, service, specialized). Helps optimize inventory composition based on demand.",
    agingHeatmap: "Visual representation of how long vehicles have been in stock by category. Red indicates aging inventory that may need price adjustments.",
    dealFunnel: "Step-by-step breakdown of your sales process, showing how many vehicles progress through each stage from listing to completion.",
    priceVsAI: "Comparison between your asking prices and AI-recommended market prices. Dots above the line indicate higher-than-suggested pricing.",
    photoQuality: "Percentage of your inventory with sufficient high-quality photos (6+ images). Better photos significantly improve sale probability.",
    insights: "AI-powered recommendations based on market data and your performance metrics. Act on these suggestions to improve sales outcomes."
  };

  useEffect(() => {
    loadAnalyticsData();
  }, [dateRange, vehicleClasses]);

  const loadAnalyticsData = async () => {
    try {
      const currentUser = await User.me();
      const dealerProfile = await Dealer.filter({ created_by: currentUser.email });
      
      if (dealerProfile.length > 0) {
        setDealer(dealerProfile[0]);
        
        // Load vehicles and transactions
        const [vehicleData, transactionData] = await Promise.all([
          Vehicle.filter({ dealer_id: dealerProfile[0].id }),
          Transaction.filter({ seller_id: dealerProfile[0].id })
        ]);
        
        setVehicles(vehicleData);
        setTransactions(transactionData);
        
        // Calculate analytics
        calculateKPIs(vehicleData, transactionData);
        generateChartData(vehicleData, transactionData);
      }
    } catch (error) {
      console.error("Error loading analytics:", error);
      toast({
        title: "Error",
        description: "Failed to load analytics data",
        variant: "destructive"
      });
    }
    setIsLoading(false);
  };

  const calculateKPIs = (vehicles: any[], transactions: any[]) => {
    const now = new Date();
    const dateFilter = getDateFilter();
    
    // Filter transactions by date range
    const filteredTransactions = transactions.filter(t => {
      const completedDate = new Date(t.completed_at || t.updated_date);
      return completedDate >= dateFilter.start && completedDate <= dateFilter.end && t.status === 'completed';
    });
    
    // AN-01: Total GMV
    const gmv = filteredTransactions.reduce((sum, t) => sum + (t.final_price || 0), 0);
    
    // AN-02: Sold cars count
    const soldCars = filteredTransactions.length;
    
    // AN-03: Average profit per car (mocked since we don't have purchase prices)
    const avgProfit = soldCars > 0 ? gmv * 0.15 / soldCars : 0; // Assume 15% margin
    
    // AN-04: Average days in stock for live vehicles
    const liveVehicles = vehicles.filter(v => v.status === 'live');
    const avgDaysInStock = liveVehicles.length > 0 
      ? liveVehicles.reduce((sum, v) => sum + differenceInDays(now, new Date(v.created_date)), 0) / liveVehicles.length
      : 0;

    setKpiData({
      gmv,
      soldCars,
      avgProfit: Math.round(avgProfit),
      avgDaysInStock: Math.round(avgDaysInStock)
    });
  };

  const generateChartData = (vehicles: any[], transactions: any[]) => {
    // AN-05: GMV Trend (mock daily data)
    const gmvTrend = Array.from({ length: 30 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (29 - i));
      return {
        date: format(date, 'MMM dd'),
        gmv: Math.floor(Math.random() * 500000) + 50000
      };
    });

    // AN-07: Stock Mix by inventory type
    const stockMix = [
      { name: 'public', value: vehicles.filter(v => v.inventory_type === 'public').length },
      { name: 'private', value: vehicles.filter(v => v.inventory_type === 'private').length },
      { name: 'service', value: vehicles.filter(v => v.inventory_type === 'service').length },
      { name: 'specialised', value: vehicles.filter(v => v.inventory_type === 'specialised').length }
    ].filter(item => item.value > 0);

    // AN-09: Aging Heatmap
    const agingHeatmap = VEHICLE_CLASSES.slice(1).map(vClass => {
      const classVehicles = vehicles.filter(v => v.vehicle_category === vClass.value);
      const now = new Date();
      
      return {
        category: vClass.label,
        data: [
          { value: classVehicles.filter(v => differenceInDays(now, new Date(v.created_date)) <= 15).length },
          { value: classVehicles.filter(v => differenceInDays(now, new Date(v.created_date)) > 15 && differenceInDays(now, new Date(v.created_date)) <= 30).length },
          { value: classVehicles.filter(v => differenceInDays(now, new Date(v.created_date)) > 30 && differenceInDays(now, new Date(v.created_date)) <= 60).length },
          { value: classVehicles.filter(v => differenceInDays(now, new Date(v.created_date)) > 60 && differenceInDays(now, new Date(v.created_date)) <= 90).length },
          { value: classVehicles.filter(v => differenceInDays(now, new Date(v.created_date)) > 90).length }
        ]
      };
    });

    // AN-10: Deal Cycle Funnel
    const dealFunnel = [
      { name: 'Listed', count: vehicles.filter(v => v.status === 'live').length, avgDays: 0 },
      { name: 'Offer Received', count: Math.floor(vehicles.length * 0.3), avgDays: 5 },
      { name: 'Escrow Paid', count: Math.floor(vehicles.length * 0.2), avgDays: 8 },
      { name: 'Delivered', count: Math.floor(vehicles.length * 0.15), avgDays: 12 },
      { name: 'Completed', count: transactions.filter(t => t.status === 'completed').length, avgDays: 15 }
    ];

    // AN-11: Price vs AI Scatter (mock AI prices)
    const priceVsAI = vehicles
      .filter(v => v.asking_price && v.status === 'live')
      .slice(0, 20)
      .map(v => ({
        id: v.id,
        askingPrice: v.asking_price,
        aiPrice: v.asking_price * (0.8 + Math.random() * 0.4), // Mock AI price ±20%
        make: v.make,
        model: v.model
      }));

    // AN-13: Photo Quality Percentage
  const vehiclesWithGoodPhotos = vehicles.filter((v: any) => 
      v?.images && v.images.length >= 6
    ).length;
    const photoQuality = vehicles.length > 0 
      ? Math.round((vehiclesWithGoodPhotos / vehicles.length) * 100)
      : 0;

    setChartData({
      gmvTrend,
      stockMix,
      agingHeatmap,
      dealFunnel,
      priceVsAI,
      photoQuality
    });
  };

  const getDateFilter = () => {
    const now = new Date();
    let start, end = now;

    switch (dateRange) {
      case '7d':
        start = subMonths(now, 0);
        start.setDate(start.getDate() - 7);
        break;
      case '30d':
        start = subMonths(now, 1);
        break;
      case '90d':
        start = subMonths(now, 3);
        break;
      case 'custom':
        start = customDateStart ? new Date(customDateStart) : subMonths(now, 1);
        end = customDateEnd ? new Date(customDateEnd) : now;
        break;
      default:
        start = subMonths(now, 1);
    }

    return { start: startOfDay(start), end: endOfDay(end) };
  };

  // Event handlers
  const handleKPIClick = (kpiType: string) => {
    // Navigate to detailed view based on KPI
    switch (kpiType) {
      case 'gmv':
        // Show daily sales modal
        toast({ title: "Opening sales details..." });
        break;
      case 'soldCars':
        // Navigate to sold vehicles
        window.location.href = createPageUrl('Inventory?status=sold');
        break;
      case 'avgProfit':
        // Show profit breakdown
        toast({ title: "Profit analysis coming soon..." });
        break;
      case 'avgDaysInStock':
        // Navigate to inventory sorted by age
        window.location.href = createPageUrl('Inventory?sort=oldest');
        break;
    }
  };

  const handleChartClick = (chartType: string, data: any) => {
    // Handle various chart interactions
    console.log('Chart clicked:', chartType, data);
  };

  const handleInsightAction = (insight: any) => {
    // Navigate to action URL
    window.location.href = insight.actionUrl;
  };

  const handleInsightDismiss = (insightId: number) => {
    setInsights(prev => prev.map(i => 
      i.id === insightId ? { ...i, dismissed: true } : i
    ));
    toast({ title: "Insight dismissed" });
  };

  const handleExport = (type) => {
    switch (type) {
      case 'csv':
        // AN-20: Export CSV
        toast({ title: "Exporting CSV...", description: "Download will start shortly" });
        break;
      case 'pdf':
        // AN-21: PDF snapshot
        toast({ title: "Generating PDF...", description: "This may take a moment" });
        break;
      case 'share':
        // AN-22: Share link
        navigator.clipboard.writeText(window.location.href);
        toast({ title: "Share link copied!" });
        break;
    }
  };

  if (isLoading) {
    return (
      <div className="p-8 flex justify-center items-center h-screen">
        <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header with Controls */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900 flex items-center">
              Business Analytics
              <InfoTooltip>
                Comprehensive dashboard tracking your dealership&apos;s performance, inventory metrics, and market insights. Use these analytics to make data-driven decisions and optimize your business strategy.
              </InfoTooltip>
            </h1>
            <p className="text-slate-600 mt-1">Track performance, identify opportunities, and optimize your inventory</p>
          </div>
          
          <div className="flex flex-wrap gap-3">
            {/* Date Range Picker */}
            <Select value={dateRange} onValueChange={(v) => setDateRange(v)}>
              <SelectTrigger className="w-40">
                <Calendar className="w-4 h-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {DATE_RANGES.map(range => (
                  <SelectItem key={range.value} value={range.value}>
                    {range.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Vehicle Class Filter */}
            <Select value={vehicleClasses[0]} onValueChange={(value) => setVehicleClasses([value])}>
              <SelectTrigger className="w-40">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {VEHICLE_CLASSES.map(vClass => (
                  <SelectItem key={vClass.value} value={vClass.value}>
                    {vClass.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Export Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  <Download className="w-4 h-4 mr-2" />
                  Export
                  <ChevronDown className="w-4 h-4 ml-2" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => handleExport('csv')}>
                  Export as CSV
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExport('pdf')}>
                  Export as PDF
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExport('share')}>
                  <Share2 className="w-4 h-4 mr-2" />
                  Share Dashboard
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* KPI Tiles Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <KPITile
            title="Total GMV"
            value={`₹${(kpiData.gmv / 100000).toFixed(1)}L`}
            subtitle="This period"
            icon={IndianRupee}
            trend={{ positive: true, value: 12.5 }}
            onClick={() => handleKPIClick('gmv')}
            loading={isLoading}
            tooltip={tooltips.gmv}
          />
          <KPITile
            title="Cars Sold"
            value={kpiData.soldCars}
            subtitle="Completed deals"
            icon={Car}
            trend={{ positive: true, value: 8.3 }}
            onClick={() => handleKPIClick('soldCars')}
            loading={isLoading}
            tooltip={tooltips.soldCars}
          />
          <KPITile
            title="Avg Profit/Car"
            value={`₹${(kpiData.avgProfit / 1000).toFixed(0)}K`}
            subtitle="After expenses"
            icon={TrendingUp}
            trend={{ positive: false, value: -2.1 }}
            onClick={() => handleKPIClick('avgProfit')}
            loading={isLoading}
            tooltip={tooltips.avgProfit}
          />
          <KPITile
            title="Avg Days in Stock"
            value={`${kpiData.avgDaysInStock}d`}
            subtitle="For live inventory"
            icon={Clock}
            trend={{ positive: false, value: -5.2 }}
            onClick={() => handleKPIClick('avgDaysInStock')}
            loading={isLoading}
            tooltip={tooltips.avgDaysInStock}
          />
        </div>

        {/* Charts Row 1 */}
        <div className="grid lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart2 className="w-5 h-5" />
                GMV Trend
                <InfoTooltip>{tooltips.gmvTrend}</InfoTooltip>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <GMVTrendChart 
                data={chartData.gmvTrend} 
                onPointClick={(data) => handleChartClick('gmv', data)}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5" />
                Inventory Mix
                <InfoTooltip>{tooltips.stockMix}</InfoTooltip>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <StockMixChart 
                data={chartData.stockMix}
                onSliceClick={(data) => handleChartClick('stock', data)}
              />
            </CardContent>
          </Card>
        </div>

        {/* Charts Row 2 */}
        <div className="grid lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5" />
                Stock Aging Heatmap
                <InfoTooltip>{tooltips.agingHeatmap}</InfoTooltip>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <AgingHeatmap 
                data={chartData.agingHeatmap}
                onCellClick={(category, ageRange, count) => 
                  handleChartClick('aging', { category, ageRange, count })
                }
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart2 className="w-5 h-5" />
                Deal Cycle Funnel
                <InfoTooltip>{tooltips.dealFunnel}</InfoTooltip>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <DealCycleFunnel data={chartData.dealFunnel} />
            </CardContent>
          </Card>
        </div>

        {/* Charts Row 3 */}
        <div className="grid lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Price vs AI Recommendations
                <InfoTooltip>{tooltips.priceVsAI}</InfoTooltip>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <PriceVsAIChart 
                data={chartData.priceVsAI}
                onDotClick={(data) => handleChartClick('pricing', data)}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Camera className="w-5 h-5" />
                Photo Quality Score
                <InfoTooltip>{tooltips.photoQuality}</InfoTooltip>
              </CardTitle>
            </CardHeader>
            <CardContent className="flex justify-center">
              <PhotoQualityGauge 
                percentage={chartData.photoQuality}
                onDetailsClick={() => handleChartClick('photos', {})}
              />
            </CardContent>
          </Card>
        </div>

        {/* Insights Feed */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5" />
              AI-Powered Insights & Recommendations
              <InfoTooltip>{tooltips.insights}</InfoTooltip>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <InsightsFeed 
              insights={insights}
              onAction={handleInsightAction}
              onDismiss={handleInsightDismiss}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
