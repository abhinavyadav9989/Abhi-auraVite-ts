import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/components/ui/use-toast';
import {
  Calculator,
  TrendingUp,
  TrendingDown,
  Percent,
  IndianRupee,
  Settings,
  Save,
  RefreshCw
} from 'lucide-react';

import { Database } from '@/types';

type Vehicle = Database['public']['Tables']['vehicles']['Row'];
type Dealer = Database['public']['Tables']['dealers']['Row'];
type User = Database['public']['Tables']['users']['Row'];

interface DealerPricingSystemProps {
  vehicle: Vehicle;
  dealer: Dealer;
  currentUser: User;
  onPriceCalculated: (pricing: PricingConfig) => void;
}

interface PricingConfig {
  basePrice: number;
  markupPercentage: number;
  markupAmount: number;
  finalPrice: number;
  dealerMargin: number;
  marketComparison: {
    below: number;
    fair: number;
    above: number;
  };
  recommendations: {
    competitive: number;
    premium: number;
    discount: number;
  };
}

const DealerPricingSystem: React.FC<DealerPricingSystemProps> = ({
  vehicle,
  dealer,
  currentUser,
  onPriceCalculated
}) => {
  const [pricingConfig, setPricingConfig] = useState<PricingConfig>({
    basePrice: vehicle?.asking_price || 0,
    markupPercentage: 10,
    markupAmount: 0,
    finalPrice: 0,
    dealerMargin: 0,
    marketComparison: {
      below: 0,
      fair: 0,
      above: 0
    },
    recommendations: {
      competitive: 0,
      premium: 0,
      discount: 0
    }
  });

  const [isAutoPricing, setIsAutoPricing] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  // Calculate pricing when inputs change
  useEffect(() => {
    calculatePricing();
  }, [pricingConfig.basePrice, pricingConfig.markupPercentage]);

  const calculatePricing = () => {
    const basePrice = pricingConfig.basePrice;
    const markupAmount = (basePrice * pricingConfig.markupPercentage) / 100;
    const finalPrice = basePrice + markupAmount;
    const dealerMargin = markupAmount;

    // Market comparison (simplified - would use real market data)
    const marketFair = basePrice * 1.05; // 5% above base
    const marketBelow = basePrice * 0.95; // 5% below base
    const marketAbove = basePrice * 1.15; // 15% above base

    // Recommendations
    const competitivePrice = basePrice * 0.98; // 2% discount for quick sale
    const premiumPrice = basePrice * 1.08; // 8% premium for luxury positioning
    const discountPrice = basePrice * 0.92; // 8% discount for volume sales

    const newConfig = {
      ...pricingConfig,
      markupAmount,
      finalPrice,
      dealerMargin,
      marketComparison: {
        below: marketBelow,
        fair: marketFair,
        above: marketAbove
      },
      recommendations: {
        competitive: competitivePrice,
        premium: premiumPrice,
        discount: discountPrice
      }
    };

    setPricingConfig(newConfig);
    onPriceCalculated?.(newConfig);
  };

  const handleMarkupChange = (value: number[]) => {
    setPricingConfig(prev => ({
      ...prev,
      markupPercentage: value[0]
    }));
  };

  const handleBasePriceChange = (value: string) => {
    const price = parseFloat(value) || 0;
    setPricingConfig(prev => ({
      ...prev,
      basePrice: price
    }));
  };

  const applyRecommendation = (type: 'competitive' | 'premium' | 'discount') => {
    const newBasePrice = pricingConfig.recommendations[type];
    setPricingConfig(prev => ({
      ...prev,
      basePrice: newBasePrice
    }));
  };

  const savePricingConfig = async () => {
    setIsSaving(true);
    try {
      // Here you would save the pricing configuration to the database
      // For now, we'll simulate the save
      await new Promise(resolve => setTimeout(resolve, 1000));

      toast({
        title: 'Pricing Configuration Saved',
        description: 'Your dealer pricing settings have been updated.',
      });
    } catch (error) {
      toast({
        title: 'Save Failed',
        description: 'Failed to save pricing configuration.',
        variant: 'destructive'
      });
    } finally {
      setIsSaving(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getPricePosition = () => {
    const { finalPrice, marketComparison } = pricingConfig;
    if (finalPrice < marketComparison.below) return { label: 'Below Market', color: 'text-red-600', bg: 'bg-red-50' };
    if (finalPrice > marketComparison.above) return { label: 'Above Market', color: 'text-orange-600', bg: 'bg-orange-50' };
    return { label: 'Fair Market', color: 'text-green-600', bg: 'bg-green-50' };
  };

  const pricePosition = getPricePosition();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">Dealer Pricing System</h3>
          <p className="text-sm text-slate-600">Set competitive pricing with automated markup controls</p>
        </div>
        <div className="flex items-center gap-2">
          <Switch
            id="auto-pricing"
            checked={isAutoPricing}
            onCheckedChange={setIsAutoPricing}
          />
          <Label htmlFor="auto-pricing" className="text-sm">Auto Pricing</Label>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Price Configuration */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="w-5 h-5" />
              Price Configuration
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Base Price */}
            <div className="space-y-2">
              <Label htmlFor="base-price">Base Price (₹)</Label>
              <Input
                id="base-price"
                type="number"
                value={pricingConfig.basePrice}
                onChange={(e) => handleBasePriceChange(e.target.value)}
                placeholder="Enter base price"
                className="text-lg"
              />
            </div>

            {/* Markup Percentage */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Markup Percentage</Label>
                <Badge variant="outline">{pricingConfig.markupPercentage}%</Badge>
              </div>
              <Slider
                value={[pricingConfig.markupPercentage]}
                onValueChange={handleMarkupChange}
                max={50}
                min={0}
                step={1}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-slate-500">
                <span>0%</span>
                <span>25%</span>
                <span>50%</span>
              </div>
            </div>

            {/* Quick Markup Buttons */}
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPricingConfig(prev => ({ ...prev, markupPercentage: 5 }))}
              >
                5%
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPricingConfig(prev => ({ ...prev, markupPercentage: 10 }))}
              >
                10%
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPricingConfig(prev => ({ ...prev, markupPercentage: 15 }))}
              >
                15%
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPricingConfig(prev => ({ ...prev, markupPercentage: 20 }))}
              >
                20%
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Price Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <IndianRupee className="w-5 h-5" />
              Price Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-slate-600">Base Price:</span>
                <span className="font-medium">{formatCurrency(pricingConfig.basePrice)}</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-slate-600">Markup ({pricingConfig.markupPercentage}%):</span>
                <span className="font-medium text-green-600">+{formatCurrency(pricingConfig.markupAmount)}</span>
              </div>

              <div className="border-t pt-3">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-lg">Final Price:</span>
                  <span className="font-bold text-lg text-blue-600">{formatCurrency(pricingConfig.finalPrice)}</span>
                </div>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-slate-600">Your Margin:</span>
                <span className="font-medium text-green-600">{formatCurrency(pricingConfig.dealerMargin)}</span>
              </div>
            </div>

            {/* Market Position */}
            <div className={`p-3 rounded-lg ${pricePosition.bg}`}>
              <div className="flex items-center gap-2">
                <TrendingUp className={`w-4 h-4 ${pricePosition.color}`} />
                <span className={`text-sm font-medium ${pricePosition.color}`}>
                  {pricePosition.label}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Market Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Market Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <TrendingDown className="w-4 h-4 text-green-600" />
                <span className="font-medium text-green-600">Competitive</span>
              </div>
              <p className="text-2xl font-bold text-green-600 mb-2">
                {formatCurrency(pricingConfig.recommendations.competitive)}
              </p>
              <p className="text-sm text-slate-600 mb-3">Quick sale pricing</p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => applyRecommendation('competitive')}
                className="w-full"
              >
                Apply
              </Button>
            </div>

            <div className="p-4 border rounded-lg border-blue-200 bg-blue-50">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-4 h-4 text-blue-600" />
                <span className="font-medium text-blue-600">Premium</span>
              </div>
              <p className="text-2xl font-bold text-blue-600 mb-2">
                {formatCurrency(pricingConfig.recommendations.premium)}
              </p>
              <p className="text-sm text-slate-600 mb-3">Luxury positioning</p>
              <Button
                size="sm"
                onClick={() => applyRecommendation('premium')}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                Apply
              </Button>
            </div>

            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Percent className="w-4 h-4 text-orange-600" />
                <span className="font-medium text-orange-600">Discount</span>
              </div>
              <p className="text-2xl font-bold text-orange-600 mb-2">
                {formatCurrency(pricingConfig.recommendations.discount)}
              </p>
              <p className="text-sm text-slate-600 mb-3">Volume sales</p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => applyRecommendation('discount')}
                className="w-full"
              >
                Apply
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Market Comparison */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Market Comparison
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 border rounded-lg">
              <p className="text-sm text-slate-600 mb-1">Below Market</p>
              <p className="text-lg font-bold text-red-600">
                {formatCurrency(pricingConfig.marketComparison.below)}
              </p>
            </div>
            <div className="text-center p-4 border rounded-lg border-green-200 bg-green-50">
              <p className="text-sm text-slate-600 mb-1">Fair Market</p>
              <p className="text-lg font-bold text-green-600">
                {formatCurrency(pricingConfig.marketComparison.fair)}
              </p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <p className="text-sm text-slate-600 mb-1">Above Market</p>
              <p className="text-lg font-bold text-orange-600">
                {formatCurrency(pricingConfig.marketComparison.above)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Save Configuration */}
      <div className="flex justify-end">
        <Button
          onClick={savePricingConfig}
          disabled={isSaving}
          className="gap-2"
        >
          {isSaving ? (
            <RefreshCw className="w-4 h-4 animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          {isSaving ? 'Saving...' : 'Save Configuration'}
        </Button>
      </div>
    </div>
  );
};

export default DealerPricingSystem;
