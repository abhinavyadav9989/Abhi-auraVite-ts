import React, { useMemo, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { 
  IndianRupee, 
  TrendingUp, 
  Wallet, 
  Percent, 
  Sparkles, 
  Eye, 
  EyeOff, 
  Shield, 
  Users, 
  Store,
  Calculator,
  Info,
  ChevronDown
} from 'lucide-react';

interface PricingStepProps {
  data: any;
  updateData: (data: any) => void;
  dealer: any;
}

const formatCurrency = (amount: number) => new Intl.NumberFormat('en-IN', { 
  style: 'currency', 
  currency: 'INR', 
  minimumFractionDigits: 0 
}).format(amount);

export default function PricingStep({ data, updateData, dealer }: PricingStepProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showInternalCosts, setShowInternalCosts] = useState(false);

  // Calculate dealer net based on stock type and pricing
  const dealerNet = useMemo(() => {
    if (data.stock_type === 'owned') {
      const baseCost = data.base_cost || 0;
      const shownPrice = data.shown_price || 0;
      const platformFees = shownPrice * 0.02; // 2% platform fee
      return shownPrice - baseCost - platformFees;
    } else {
      // Consignment: dealer gets commission
      const shownPrice = data.shown_price || 0;
      const commissionRate = data.consignment_terms?.commission_rate || 0.05; // 5% default
      return shownPrice * commissionRate;
    }
  }, [data.stock_type, data.base_cost, data.shown_price, data.consignment_terms]);

  // Market price suggestions
  const marketData = useMemo(() => {
    const basePrice = 650000; // Mock base price
    const variation = 0.15; // 15% variation
    
    return {
      min_price: Math.round(basePrice * (1 - variation)),
      max_price: Math.round(basePrice * (1 + variation)),
      avg_price: basePrice,
      days_to_sell: 25,
      confidence: 85
    };
  }, []);

  // Price band analysis
  const getPriceBand = (price: number) => {
    if (price < marketData.min_price) return { band: 'Below Market', color: 'text-green-600', bg: 'bg-green-50' };
    if (price > marketData.max_price) return { band: 'Above Market', color: 'text-orange-600', bg: 'bg-orange-50' };
    return { band: 'Fair Market', color: 'text-blue-600', bg: 'bg-blue-50' };
  };

  const priceBand = getPriceBand(data.shown_price || 0);

  const handleFieldChange = (field: string, value: any) => {
    updateData({ [field]: value });
  };

  const handleCostChange = (key: string, value: string) => {
    const numericValue = value === '' ? 0 : parseFloat(value);
    updateData({ 
      landed_cost_components: { 
        ...data.landed_cost_components, 
        [key]: numericValue 
      }
    });
  };

  const calculateSuggestedPrice = () => {
    const baseCost = data.base_cost || 0;
    const targetMargin = data.dealer_margin_target || 0.15; // 15% default margin
    return Math.round(baseCost / (1 - targetMargin));
  };

  return (
    <div className="space-y-4 md:space-y-6 px-4 md:px-0">
      <div>
        <h2 className="text-xl md:text-2xl font-bold mb-2">Pricing & Exposure</h2>
        <p className="text-gray-600 text-sm md:text-base">
          Set your pricing strategy and control how your vehicle appears to different audiences.
        </p>
      </div>

      {/* Market Analysis */}
      <Card className="bg-blue-50 border-blue-200 mx-4 md:mx-0">
        <CardHeader className="flex flex-row items-center gap-3 md:gap-4 pb-3 md:pb-6">
          <Sparkles className="w-5 h-5 md:w-6 md:h-6 text-blue-600 flex-shrink-0" />
          <CardTitle className="text-lg md:text-xl">Market Analysis</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 text-center px-4 md:px-6">
          <div className="p-2">
            <p className="text-xs md:text-sm text-slate-600 mb-1">Fair Market Range</p>
            <p className="font-bold text-sm md:text-lg leading-tight">
              {formatCurrency(marketData.min_price)} - {formatCurrency(marketData.max_price)}
            </p>
          </div>
          <div className="p-2">
            <p className="text-xs md:text-sm text-slate-600 mb-1">Average Price</p>
            <p className="font-bold text-sm md:text-lg">{formatCurrency(marketData.avg_price)}</p>
          </div>
          <div className="p-2">
            <p className="text-xs md:text-sm text-slate-600 mb-1">Avg. Days to Sell</p>
            <p className="font-bold text-sm md:text-lg">{marketData.days_to_sell} days</p>
          </div>
          <div className="p-2">
            <p className="text-xs md:text-sm text-slate-600 mb-1">Your Price</p>
            <p className={`font-bold text-sm md:text-lg ${priceBand.color}`}>
              {formatCurrency(data.shown_price || 0)}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Stock Type Selection */}
      <Card className="mx-4 md:mx-0">
        <CardHeader className="pb-3 md:pb-6">
          <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
            <Store className="w-4 h-4 md:w-5 md:h-5" />
            Stock Type
          </CardTitle>
        </CardHeader>
        <CardContent className="px-4 md:px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
            <div
              className={`p-3 md:p-4 border rounded-lg cursor-pointer transition-colors touch-manipulation ${
                data.stock_type === 'owned' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
              }`}
              onClick={() => handleFieldChange('stock_type', 'owned')}
            >
              <div className="flex items-center gap-2 mb-2">
                <input
                  type="radio"
                  checked={data.stock_type === 'owned'}
                  onChange={() => handleFieldChange('stock_type', 'owned')}
                  className="w-4 h-4"
                />
                <span className="font-medium text-sm md:text-base">Owned Stock</span>
              </div>
              <p className="text-xs md:text-sm text-gray-600 leading-relaxed">
                You own this vehicle. Set your asking price and keep the profit.
              </p>
            </div>

            <div
              className={`p-3 md:p-4 border rounded-lg cursor-pointer transition-colors touch-manipulation ${
                data.stock_type === 'consignment' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
              }`}
              onClick={() => handleFieldChange('stock_type', 'consignment')}
            >
              <div className="flex items-center gap-2 mb-2">
                <input
                  type="radio"
                  checked={data.stock_type === 'consignment'}
                  onChange={() => handleFieldChange('stock_type', 'consignment')}
                  className="w-4 h-4"
                />
                <span className="font-medium text-sm md:text-base">Consignment</span>
              </div>
              <p className="text-xs md:text-sm text-gray-600 leading-relaxed">
                Selling on behalf of owner. You earn commission on sale.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Internal Costs (Collapsible) */}
      <Card className="mx-4 md:mx-0">
        <CardHeader
          className="cursor-pointer touch-manipulation pb-3 md:pb-6"
          onClick={() => setShowInternalCosts(!showInternalCosts)}
        >
          <CardTitle className="flex items-center justify-between text-lg md:text-xl">
            <div className="flex items-center gap-2">
              <Wallet className="w-4 h-4 md:w-5 md:h-5" />
              <span>Internal Costs</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">Internal Only</Badge>
              <ChevronDown className={`w-4 h-4 transition-transform flex-shrink-0 ${showInternalCosts ? 'rotate-180' : ''}`} />
            </div>
          </CardTitle>
        </CardHeader>
        {showInternalCosts && (
          <CardContent className="space-y-3 md:space-y-4 px-4 md:px-6">
            <Alert className="py-3">
              <Shield className="w-4 h-4" />
              <AlertDescription className="text-sm">
                These costs are only visible to you and your team. Customers cannot see this information.
              </AlertDescription>
            </Alert>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
              <div className="space-y-3">
                <Label htmlFor="base_cost" className="text-sm md:text-base">Base Cost (₹)</Label>
                <div className="relative">
                  <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    id="base_cost"
                    type="number"
                    value={data.base_cost || ''}
                    onChange={(e) => handleFieldChange('base_cost', parseFloat(e.target.value) || 0)}
                    className="pl-8 text-base md:text-sm h-11 md:h-10"
                    placeholder="Enter base cost"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <Label htmlFor="dealer_margin_target" className="text-sm md:text-base">Target Margin (%)</Label>
                <div className="relative">
                  <Percent className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    id="dealer_margin_target"
                    type="number"
                    value={data.dealer_margin_target || ''}
                    onChange={(e) => handleFieldChange('dealer_margin_target', parseFloat(e.target.value) || 0)}
                    className="pl-8 text-base md:text-sm h-11 md:h-10"
                    placeholder="15"
                  />
                </div>
              </div>
            </div>

            {data.base_cost && data.dealer_margin_target && (
              <Alert className="bg-green-50 border-green-200 py-3">
                <Calculator className="w-4 h-4" />
                <AlertDescription className="text-sm">
                  <strong>Suggested Price:</strong> {formatCurrency(calculateSuggestedPrice())}
                  (based on {data.dealer_margin_target}% margin)
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        )}
      </Card>

      {/* Customer-Facing Pricing */}
      <Card className="mx-4 md:mx-0">
        <CardHeader className="pb-3 md:pb-6">
          <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
            <Eye className="w-4 h-4 md:w-5 md:h-5" />
            Customer-Facing Pricing
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 md:space-y-4 px-4 md:px-6">
          <div className="space-y-3">
            <Label htmlFor="shown_price" className="text-sm md:text-base">Shown Price (Retail)</Label>
            <div className="relative">
              <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-gray-400" />
              <Input
                id="shown_price"
                type="number"
                value={data.shown_price || ''}
                onChange={(e) => handleFieldChange('shown_price', parseFloat(e.target.value) || 0)}
                className="pl-8 text-base md:text-sm h-11 md:h-10"
                placeholder="Enter price customers will see"
              />
            </div>
            <p className="text-xs md:text-sm text-gray-600 leading-relaxed">
              This is the price that retail customers will see on the marketplace.
            </p>
          </div>

          {data.shown_price && (
            <div className={`p-3 rounded-lg ${priceBand.bg}`}>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Price Analysis</span>
                <Badge variant="outline" className={priceBand.color}>
                  {priceBand.band}
                </Badge>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* B2B Pricing */}
      <Card className="mx-4 md:mx-0">
        <CardHeader className="pb-3 md:pb-6">
          <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
            <Users className="w-4 h-4 md:w-5 md:h-5" />
            <span className="hidden sm:inline">B2B Pricing (Dealer-to-Dealer)</span>
            <span className="sm:hidden">B2B Pricing</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 md:space-y-4 px-4 md:px-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex-1">
              <Label htmlFor="dealer_price" className="text-sm md:text-base">Dealer Price</Label>
              <p className="text-xs md:text-sm text-gray-600 leading-relaxed">
                Price visible to verified dealers only
              </p>
            </div>
            <Switch
              checked={!!data.dealer_price}
              onCheckedChange={(checked) => {
                if (!checked) {
                  handleFieldChange('dealer_price', null);
                } else {
                  handleFieldChange('dealer_price', data.shown_price * 0.9); // 10% discount
                }
              }}
              className="self-start sm:self-center"
            />
          </div>

          {data.dealer_price && (
            <div className="space-y-3">
              <div className="relative">
                <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  type="number"
                  value={data.dealer_price || ''}
                  onChange={(e) => handleFieldChange('dealer_price', parseFloat(e.target.value) || 0)}
                  className="pl-8 text-base md:text-sm h-11 md:h-10"
                  placeholder="Enter dealer price"
                />
              </div>
              <p className="text-xs md:text-sm text-gray-600 leading-relaxed">
                This price is only visible to verified dealers in B2B mode.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Exposure Mode */}
      <Card className="mx-4 md:mx-0">
        <CardHeader className="pb-3 md:pb-6">
          <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
            <Eye className="w-4 h-4 md:w-5 md:h-5" />
            Exposure Mode
          </CardTitle>
        </CardHeader>
        <CardContent className="px-4 md:px-6">
          <div className="space-y-3">
            <Select value={data.exposure_mode || 'masked'} onValueChange={(value) => handleFieldChange('exposure_mode', value)}>
              <SelectTrigger className="h-11 md:h-10 text-base md:text-sm">
                <SelectValue placeholder="Select exposure mode" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="retail">Retail (Public)</SelectItem>
                <SelectItem value="b2b">B2B (Dealer-only)</SelectItem>
                <SelectItem value="masked">Masked (Price on Request)</SelectItem>
              </SelectContent>
            </Select>

            <div className="text-xs md:text-sm text-gray-600 space-y-1">
              <p><strong>Retail:</strong> Customers see the shown price</p>
              <p><strong>B2B:</strong> Only verified dealers see dealer price</p>
              <p><strong>Masked:</strong> No price shown, leads are gated</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Dealer Net Summary */}
      <Card className="mx-4 md:mx-0">
        <CardHeader className="pb-3 md:pb-6">
          <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
            <Calculator className="w-4 h-4 md:w-5 md:h-5" />
            Dealer Net Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="px-4 md:px-6">
          <div className="space-y-3">
            <div className="flex justify-between items-center py-2">
              <span className="text-sm md:text-base">Shown Price:</span>
              <span className="font-medium text-sm md:text-base">{formatCurrency(data.shown_price || 0)}</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-sm md:text-base">Base Cost:</span>
              <span className="font-medium text-sm md:text-base">{formatCurrency(data.base_cost || 0)}</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-sm md:text-base">Platform Fees (2%):</span>
              <span className="font-medium text-sm md:text-base">{formatCurrency((data.shown_price || 0) * 0.02)}</span>
            </div>
            <div className="border-t pt-3 mt-3 flex justify-between items-center font-bold">
              <span className="text-sm md:text-base">Dealer Net:</span>
              <span className={`text-sm md:text-base ${dealerNet >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(dealerNet)}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Advanced Features */}
      <Collapsible open={showAdvanced} onOpenChange={() => setShowAdvanced(!showAdvanced)}>
        <Card className="mx-4 md:mx-0">
          <CollapsibleTrigger className="w-full">
            <CardHeader className="cursor-pointer pb-3 md:pb-6">
              <CardTitle className="flex items-center justify-between text-lg md:text-xl">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 md:w-5 md:h-5" />
                  <span className="hidden sm:inline">Advanced Pricing Features</span>
                  <span className="sm:hidden">Advanced Features</span>
                </div>
                <ChevronDown className={`w-4 h-4 transition-transform flex-shrink-0 ${showAdvanced ? 'rotate-180' : ''}`} />
              </CardTitle>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-3 md:space-y-4">
            <CardContent className="space-y-3 md:space-y-4 px-4 md:px-6">
              <Alert className="py-3">
                <Info className="w-4 h-4" />
                <AlertDescription className="text-sm">
                  Advanced features include dynamic pricing, bulk pricing, and automated market adjustments.
                </AlertDescription>
              </Alert>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                <div className="p-3 md:p-4 border rounded-lg">
                  <h4 className="font-medium mb-2 text-sm md:text-base">Dynamic Pricing</h4>
                  <p className="text-xs md:text-sm text-gray-600 mb-3 leading-relaxed">
                    Automatically adjust prices based on market conditions.
                  </p>
                  <Button variant="outline" size="sm" disabled className="text-sm py-2 px-3">
                    Enable Dynamic Pricing
                  </Button>
                </div>

                <div className="p-3 md:p-4 border rounded-lg">
                  <h4 className="font-medium mb-2 text-sm md:text-base">Bulk Pricing</h4>
                  <p className="text-xs md:text-sm text-gray-600 mb-3 leading-relaxed">
                    Set different prices for bulk purchases.
                  </p>
                  <Button variant="outline" size="sm" disabled className="text-sm py-2 px-3">
                    Configure Bulk Pricing
                  </Button>
                </div>
              </div>
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>
    </div>
  );
}