import React, { useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { IndianRupee, TrendingUp, Wallet, Percent, Sparkles } from 'lucide-react';

const formatCurrency = (amount) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 }).format(amount);

export default function PricingStep({ data, updateData }) {
    
    const landedCost = useMemo(() => {
        const { procurement = 0, refurbishment = 0, logistics = 0, other = 0 } = data.landed_cost_components || {};
        return parseFloat(procurement) + parseFloat(refurbishment) + parseFloat(logistics) + parseFloat(other);
    }, [data.landed_cost_components]);
    
    const profit = useMemo(() => {
        return (data.asking_price || 0) - landedCost;
    }, [data.asking_price, landedCost]);
    
    const profitMargin = useMemo(() => {
        if (!data.asking_price || data.asking_price === 0) return 0;
        return (profit / data.asking_price) * 100;
    }, [profit, data.asking_price]);

    const handleCostChange = (key, value) => {
        const numericValue = value === '' ? 0 : parseFloat(value);
        const currentComponents = data.landed_cost_components || {};
        updateData({ landed_cost_components: { ...currentComponents, [key]: numericValue }});
    };
    
    const handlePriceChange = (value) => {
        const numericValue = value === '' ? 0 : parseFloat(value);
        updateData({ asking_price: numericValue });
    };

    // LST-011: Mock AI Market Data
    const marketData = data.market_data || { min_price: 650000, max_price: 720000, avg_price: 685000, days_to_sell: 25 };

  return (
    <div className="space-y-6">
        <Card className="bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800">
            <CardHeader className="flex flex-row items-center gap-4">
                <Sparkles className="w-6 h-6 text-blue-600 dark:text-blue-300" />
                <CardTitle className="dark:text-white">AI Market Analysis</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div>
                    <p className="text-sm text-slate-600 dark:text-slate-300">Fair Market Range</p>
                    <p className="font-bold text-lg dark:text-white">{formatCurrency(marketData.min_price)} - {formatCurrency(marketData.max_price)}</p>
                </div>
                <div>
                    <p className="text-sm text-slate-600 dark:text-slate-300">Average Price</p>
                    <p className="font-bold text-lg dark:text-white">{formatCurrency(marketData.avg_price)}</p>
                </div>
                 <div>
                    <p className="text-sm text-slate-600 dark:text-slate-300">Avg. Days to Sell</p>
                    <p className="font-bold text-lg dark:text-white">{marketData.days_to_sell} days</p>
                </div>
                 <div>
                    <p className="text-sm text-slate-600 dark:text-slate-300">Your Ask</p>
                    <p className="font-bold text-lg text-blue-600">{formatCurrency(data.asking_price || 0)}</p>
                </div>
            </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="dark:bg-[#0d1a2b] dark:border-slate-700">
                <CardHeader><CardTitle className="flex items-center gap-2 dark:text-white"><Wallet className="w-5 h-5"/> Landed Cost Calculator</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                    {Object.entries({procurement: 'Procurement', refurbishment: 'Refurbishment', logistics: 'Logistics', other: 'Other Costs'}).map(([key, label]) => (
                         <div key={key} className="flex items-center gap-3">
                            <Label htmlFor={key} className="flex-1 dark:text-slate-200">{label}</Label>
                            <div className="relative w-full max-w-[160px]">
                                <IndianRupee className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <Input id={key} type="number" value={(data.landed_cost_components && data.landed_cost_components[key]) || ''} onChange={(e) => handleCostChange(key, e.target.value)} className="pl-7 dark:bg-[#0b1220] dark:border-slate-700 dark:text-slate-200" />
                            </div>
                        </div>
                    ))}
                    <div className="flex items-center font-bold border-t pt-3 mt-3 dark:border-slate-700">
                        <span className="flex-1 dark:text-white">Total Landed Cost</span>
                        <span className="dark:text-white">{formatCurrency(landedCost)}</span>
                    </div>
                </CardContent>
            </Card>
            <Card className="dark:bg-[#0d1a2b] dark:border-slate-700">
                <CardHeader><CardTitle className="flex items-center gap-2 dark:text-white"><IndianRupee className="w-5 h-5"/> Your Asking Price</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="asking_price" className="dark:text-slate-200">Set Your Listing Price</Label>
                        <div className="relative">
                            <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                            <Input id="asking_price" type="number" value={data.asking_price || ''} onChange={(e) => handlePriceChange(e.target.value)} className="pl-10 h-12 text-xl dark:bg-[#0b1220] dark:border-slate-700 dark:text-slate-200" />
                        </div>
                    </div>
                    <Alert variant={profit < 0 ? 'destructive' : 'default'} className={profit > 0 ? 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800' : ''}>
                        <TrendingUp className="h-4 w-4" />
                        <AlertTitle className="flex justify-between dark:text-white">
                            <span>Potential Profit</span>
                            <span className={profit < 0 ? 'text-red-700' : 'text-green-700'}>{formatCurrency(profit)}</span>
                        </AlertTitle>
                        <AlertDescription className="flex justify-between dark:text-slate-300">
                            <span>Profit Margin</span>
                            <span>{profitMargin.toFixed(2)}%</span>
                        </AlertDescription>
                    </Alert>
                </CardContent>
            </Card>
        </div>
    </div>
  );
}