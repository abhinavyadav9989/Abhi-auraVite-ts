import React, { useState, useEffect } from 'react';
import { User } from '@/api/entities';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Download, RefreshCw, Filter } from 'lucide-react';

// Import Widgets
import DemandHeatmap from '@/components/market-trends/DemandHeatmap';
import PriceIndexChart from '@/components/market-trends/PriceIndexChart';
import DaysToSellChart from '@/components/market-trends/DaysToSellChart';
import TrendingKeywords from '@/components/market-trends/TrendingKeywords';
import SpecialisedSegment from '@/components/market-trends/SpecialisedSegment';
import AIForecastCard from '@/components/market-trends/AIForecastCard';

// --- MOCK DATA GENERATION ---
const getMockMarketTrendsData = () => {
  return {
    demandHeatmap: [
      { city: 'Mumbai', demand: 95, supply: 70 },
      { city: 'Delhi', demand: 90, supply: 85 },
      { city: 'Bangalore', demand: 85, supply: 80 },
      { city: 'Pune', demand: 110, supply: 60 },
      { city: 'Hyderabad', demand: 70, supply: 75 },
      { city: 'Chennai', demand: 60, supply: 65 },
    ],
    priceIndex: {
      'Maruti Swift': [
        { month: 'Jan', price: 550000 }, { month: 'Feb', price: 560000 }, { month: 'Mar', price: 555000 },
        { month: 'Apr', price: 570000 }, { month: 'May', price: 580000 }, { month: 'Jun', price: 575000 },
      ],
      'Hyundai Creta': [
        { month: 'Jan', price: 1200000 }, { month: 'Feb', price: 1210000 }, { month: 'Mar', price: 1230000 },
        { month: 'Apr', price: 1220000 }, { month: 'May', price: 1250000 }, { month: 'Jun', price: 1260000 },
      ],
       'Tata Nexon EV': [
        { month: 'Jan', price: 1400000 }, { month: 'Feb', price: 1420000 }, { month: 'Mar', price: 1450000 },
        { month: 'Apr', price: 1430000 }, { month: 'May', price: 1480000 }, { month: 'Jun', price: 1500000 },
      ]
    },
    daysToSell: [
      { class: 'Hatchback', days: 25 },
      { class: 'Sedan', days: 32 },
      { class: 'SUV', days: 28 },
      { class: 'Luxury', days: 45 },
      { class: 'MUV', days: 35 },
    ],
    trendingKeywords: [
      { keyword: 'Automatic SUV', count: 1200, change: 15.5 },
      { keyword: '7 seater', count: 950, change: 8.2 },
      { keyword: 'EV Bangalore', count: 800, change: 25.1 },
      { keyword: 'Under 5 lakh', count: 1500, change: -2.3 },
    ],
    specialisedSegment: {
      cranes: { gmv: 25000000, avgPrice: 5000000, activeDealers: 5, trend: -5 },
      tractors: { gmv: 15000000, avgPrice: 750000, activeDealers: 12, trend: 10 },
    }
  };
};
// --- END MOCK DATA ---

export default function MarketTrends() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [marketData, setMarketData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    initialize();
  }, []);

  const initialize = async () => {
    setIsLoading(true);
    try {
      const user = await User.me();
      // Add admin check: if (user.role !== 'admin') navigate('/');
      const data = getMockMarketTrendsData();
      setMarketData(data);
    } catch (error) {
      console.error("Initialization error:", error);
      toast({ title: "Error", description: "Could not load market data.", variant: "destructive" });
    }
    setIsLoading(false);
  };
  
  const handleExport = () => {
    toast({ title: "Export Started", description: "Generating PowerPoint snapshot..." });
  };

  if (isLoading || !marketData) {
    return (
      <div className="p-8 flex justify-center items-center h-screen">
        <RefreshCw className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 bg-slate-50 dark:bg-slate-900 min-h-screen">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">
              Market Intelligence
            </h1>
            <p className="text-slate-600 dark:text-slate-300">
              Macro-level analytics of the used car market
            </p>
          </div>
          <div className="flex items-center gap-3">
             <Select defaultValue="30d">
                <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Date Range" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="7d">Last 7 Days</SelectItem>
                    <SelectItem value="30d">Last 30 Days</SelectItem>
                    <SelectItem value="90d">Last 90 Days</SelectItem>
                </SelectContent>
            </Select>
            <Button variant="outline" onClick={handleExport} className="gap-2">
              <Download className="w-4 h-4" />
              Export PPT
            </Button>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
                <DemandHeatmap data={marketData.demandHeatmap} />
                <PriceIndexChart data={marketData.priceIndex} />
            </div>
            <div className="lg:col-span-1 space-y-6">
                <AIForecastCard />
                <DaysToSellChart data={marketData.daysToSell} />
                <TrendingKeywords data={marketData.trendingKeywords} />
            </div>
        </div>
        <div>
            <SpecialisedSegment data={marketData.specialisedSegment} />
        </div>
      </div>
    </div>
  );
}