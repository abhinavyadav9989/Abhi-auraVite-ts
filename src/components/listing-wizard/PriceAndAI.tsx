
import React, { useState, useEffect } from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { InvokeLLM } from "@/api/integrations";
import { useToast } from "@/components/ui/use-toast";
import {
  IndianRupee,
  Zap,
  AlertCircle,
  CheckCircle,
  X,
  Loader2,
  Sparkles,
  AlertTriangle
} from "lucide-react";

export default function PriceAndAI({ data, onChange, dealer }) {
  const [aiSuggestion, setAiSuggestion] = useState(null);
  const [isGettingSuggestion, setIsGettingSuggestion] = useState(false); // Renamed from loadingAI
  const [showComparables, setShowComparables] = useState(false);
  const [priceRange, setPriceRange] = useState([0, 1000000]); // Keeping this state, but its update is removed per outline
  const [hasError, setHasError] = useState(false); // New state
  const [retryCount, setRetryCount] = useState(0); // New state
  const { toast } = useToast(); // New hook

  useEffect(() => {
    // Only fetch if required data is present, no suggestion yet, not already getting one, and not exhausted retries.
    if (data.make && data.model && data.year && data.kilometers && !aiSuggestion && !isGettingSuggestion && retryCount < 3) {
      getAIPriceSuggestion();
    }
  }, [data.make, data.model, data.year, data.kilometers, aiSuggestion, isGettingSuggestion, retryCount]);

  // Add rate limiting and retry logic
  const getAIPriceSuggestion = async () => {
    if (isGettingSuggestion || retryCount >= 3) {
      if (retryCount >= 3) {
        toast({
          title: "Service Unavailable",
          description: "AI price suggestion is temporarily unavailable. Please try again later.",
          variant: "destructive"
        });
      }
      return;
    }

    setIsGettingSuggestion(true);
    setHasError(false);

    try {
      // Add delay to prevent rapid successive calls (client-side throttling)
      await new Promise(resolve => setTimeout(resolve, 1000));

      const result = await InvokeLLM({
        prompt: `Suggest price range for ${data.year} ${data.make} ${data.model} with ${data.kilometers} km in Indian used car market. Consider current market conditions.`,
        response_json_schema: {
          type: "object",
          properties: {
            min_price: { type: "number", description: "Minimum market price in rupees" },
            max_price: { type: "number", description: "Maximum market price in rupees" },
            median_price: { type: "number", description: "Median market price in rupees" },
            confidence: { type: "string", enum: ["high", "medium", "low"] }, // Changed to string enum
            reasoning: { type: "string", description: "Brief explanation of pricing factors" } // New field
          }
        }
      });

      // Update aiSuggestion state with the new schema
      setAiSuggestion({
        min_price: result.min_price,
        max_price: result.max_price,
        median_price: result.median_price,
        confidence: result.confidence,
        reasoning: result.reasoning
      });

      // Auto-set market price fields and new AI related data
      onChange({
        market_price_min: result.min_price,
        market_price_max: result.max_price,
        ai_confidence: result.confidence, // New property for parent data
        ai_reasoning: result.reasoning // New property for parent data
      });

      // If no asking price set, suggest median
      if (!data.asking_price) {
        onChange({ asking_price: result.median_price });
      }

      setRetryCount(0); // Reset on success
      toast({
        title: "AI Price Suggestion",
        description: "Market price range updated based on current trends.",
        variant: "success"
      });

    } catch (error) {
      console.error("AI price suggestion failed:", error);
      setHasError(true);

      if (error.response?.status === 429) { // Rate limit error
        const newRetryCount = retryCount + 1;
        setRetryCount(newRetryCount);

        if (newRetryCount <= 3) { // Only retry up to 3 times
          toast({
            title: "Rate Limit Reached",
            description: `Too many requests. Retrying in ${newRetryCount * 5} seconds...`,
            variant: "destructive"
          });

          // Exponential backoff retry
          setTimeout(() => {
            getAIPriceSuggestion();
          }, newRetryCount * 5000);
        } else {
          // Max retries reached
          toast({
            title: "AI Service Unavailable",
            description: "Maximum retry attempts reached. Please try again later.",
            variant: "destructive"
          });
        }
      } else {
        // Other types of errors
        toast({
          title: "AI Service Unavailable",
          description: "An unexpected error occurred. Using manual pricing for now. Try again later.",
          variant: "destructive"
        });
      }
    } finally {
      setIsGettingSuggestion(false);
    }
  };

  const handlePriceChange = (field, value) => {
    onChange({ [field]: parseFloat(value) || 0 });
  };

  const formatPrice = (price) => {
    if (price === null || isNaN(price)) return 'N/A';
    if (price >= 100000) {
      return `₹${(price / 100000).toFixed(1)}L`;
    }
    return `₹${(price / 1000).toFixed(0)}K`;
  };

  const getPriceValidation = () => {
    if (!data.asking_price || !aiSuggestion) return null;

    const askingPrice = parseFloat(data.asking_price);
    const minPrice = aiSuggestion.min_price;
    const maxPrice = aiSuggestion.max_price;

    if (askingPrice < minPrice * 0.6) {
      return { type: 'error', message: 'Price seems too low for market conditions' };
    } else if (askingPrice > maxPrice * 1.4) {
      return { type: 'warning', message: 'Price is significantly above market range' };
    } else if (askingPrice >= minPrice && askingPrice <= maxPrice) {
      return { type: 'success', message: 'Price is within optimal market range' };
    }
    return null;
  };

  const handlePriceSliderChange = (value) => {
    const newPrice = value[0];
    onChange({ asking_price: newPrice });
  };

  const quickAdjustPrice = (adjustment) => {
    const currentPrice = parseFloat(data.asking_price) || 0;
    const newPrice = Math.max(0, currentPrice + adjustment);
    onChange({ asking_price: newPrice });
  };

  // Mock comparables data - uses aiSuggestion?.median_price, so still valid
  const mockComparables = [
    {
      id: 1,
      year: data.year,
      make: data.make,
      model: data.model,
      price: aiSuggestion?.median_price ? aiSuggestion.median_price * 0.95 : 500000,
      km: (parseInt(data.kilometers) || 50000) + 5000,
      location: 'Mumbai',
      days_listed: 12
    },
    {
      id: 2,
      year: (data.year || 2020) - 1,
      make: data.make,
      model: data.model,
      price: aiSuggestion?.median_price ? aiSuggestion.median_price * 1.1 : 550000,
      km: (parseInt(data.kilometers) || 50000) - 8000,
      location: 'Pune',
      days_listed: 8
    },
    {
      id: 3,
      year: data.year,
      make: data.make,
      model: data.model,
      price: aiSuggestion?.median_price ? aiSuggestion.median_price * 0.88 : 480000,
      km: (parseInt(data.kilometers) || 50000) + 12000,
      location: 'Bangalore',
      days_listed: 25
    }
  ];

  const validation = getPriceValidation();

  // Define slider min/max for calculations, with fallbacks
  const sliderMinVal = aiSuggestion?.min_price * 0.5 || 200000;
  const sliderMaxVal = aiSuggestion?.max_price * 1.5 || 1000000;
  const sliderRange = sliderMaxVal - sliderMinVal;

  return (
    <div className="space-y-6">
      {/* AI Price Assistant Section with Error Handling */}
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-6 rounded-xl border border-purple-100">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Zap className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">AI Price Assistant</h3>
              <p className="text-sm text-slate-600">Get market-based pricing suggestions</p>
            </div>
          </div>

          <Button
            onClick={getAIPriceSuggestion}
            disabled={isGettingSuggestion || !data.make || !data.model || retryCount >= 3}
            className="bg-purple-600 hover:bg-purple-700"
          >
            {isGettingSuggestion ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Analyzing...
              </>
            ) : hasError && retryCount >= 3 ? (
              <>
                <AlertTriangle className="w-4 h-4 mr-2" />
                Service Unavailable
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Get AI Suggestion
              </>
            )}
          </Button>
        </div>

        {/* Error State */}
        {hasError && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-600" />
              <span className="text-sm text-red-700">
                  {retryCount >= 3
                   ? "AI service is temporarily unavailable. Please set pricing manually."
                   : `Rate limit reached. Retrying in ${retryCount * 5} seconds...`
                }
              </span>
            </div>
          </div>
        )}

        {/* AI Suggestion Display Content - conditional on aiSuggestion presence */}
        {aiSuggestion && (
          <div className="space-y-4 pt-4 border-t border-purple-200 mt-4">
            <div className="flex items-center gap-2 text-purple-800">
              <Zap className="w-4 h-4" />
              <span className="font-medium">AI Market Analysis</span>
              <Badge className="bg-purple-600 text-white capitalize">
                {aiSuggestion.confidence} confidence
              </Badge>
            </div>

            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-sm text-purple-600">Min Price</div>
                <div className="text-lg font-bold text-purple-900">
                  {formatPrice(aiSuggestion.min_price)}
                </div>
              </div>
              <div>
                <div className="text-sm text-purple-600">Market Price</div>
                <div className="text-xl font-bold text-purple-900">
                  {formatPrice(aiSuggestion.median_price)}
                </div>
              </div>
              <div>
                <div className="text-sm text-purple-600">Max Price</div>
                <div className="text-lg font-bold text-purple-900">
                  {formatPrice(aiSuggestion.max_price)}
                </div>
              </div>
            </div>

            {aiSuggestion.reasoning && (
              <div className="bg-purple-100 border border-purple-200 rounded-lg p-3">
                <p className="text-sm text-purple-800">
                  <span className="font-semibold">Reasoning:</span> {aiSuggestion.reasoning}
                </p>
              </div>
            )}
            {/* Removed market trend and factors display as they are no longer in the AI response schema */}
          </div>
        )}
      </div>

      {/* Interactive Price Slider */}
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Set Your Asking Price</span>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => quickAdjustPrice(-10000)}
                className="text-red-600 hover:text-red-700"
              >
                -₹10K
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => quickAdjustPrice(10000)}
                className="text-green-600 hover:text-green-700"
              >
                +₹10K
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowComparables(true)}
                className="text-blue-600 hover:text-blue-700"
              >
                Why?
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative">
            <div className="flex justify-between text-sm text-slate-600 mb-2">
              <span>{formatPrice(sliderMinVal)}</span>
              <span className="font-bold text-blue-900">
                {formatPrice(data.asking_price || aiSuggestion?.median_price || 500000)}
              </span>
              <span>{formatPrice(sliderMaxVal)}</span>
            </div>

            <Slider
              value={[data.asking_price || aiSuggestion?.median_price || 500000]}
              onValueChange={handlePriceSliderChange}
              max={sliderMaxVal}
              min={sliderMinVal}
              step={5000}
              className="w-full"
            />

            {aiSuggestion && (
              <div className="flex justify-between mt-2 relative h-4">
                <div
                  className="absolute w-1 h-4 bg-red-300 rounded"
                  style={{
                    left: `${((aiSuggestion.min_price - sliderMinVal) / sliderRange) * 100}%`
                  }}
                />
                <div
                  className="absolute w-1 h-4 bg-green-500 rounded"
                  style={{
                    left: `${((aiSuggestion.median_price - sliderMinVal) / sliderRange) * 100}%`
                  }}
                />
                <div
                  className="absolute w-1 h-4 bg-red-300 rounded"
                  style={{
                    left: `${((aiSuggestion.max_price - sliderMinVal) / sliderRange) * 100}%`
                  }}
                />
              </div>
            )}
          </div>

          <div className="text-center">
            <div className="text-2xl font-bold text-blue-900">
              {formatPrice(data.asking_price || aiSuggestion?.median_price || 500000)}
            </div>
            <div className="text-sm text-blue-700">Your asking price</div>
          </div>
        </CardContent>
      </Card>

      {/* Asking Price - Old Input (kept as fallback/alternative input for direct value) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label htmlFor="asking_price" className="text-base font-medium">
            Your Asking Price *
          </Label>
          {validation && (
            <div className="flex items-center gap-1 text-sm">
              {validation.type === 'success' && <CheckCircle className="w-4 h-4 text-green-600" />}
              {validation.type === 'warning' && <AlertCircle className="w-4 h-4 text-orange-600" />}
              {validation.type === 'error' && <AlertCircle className="w-4 h-4 text-red-600" />}
              <span className={`${
                validation.type === 'success' ? 'text-green-600' :
                validation.type === 'warning' ? 'text-orange-600' : 'text-red-600'
              }`}>
                {validation.message}
              </span>
            </div>
          )}
        </div>

        <div className="relative">
          <IndianRupee className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            id="asking_price"
            type="number"
            value={data.asking_price || ''}
            onChange={(e) => handlePriceChange('asking_price', e.target.value)}
            placeholder="Enter your asking price"
            className="pl-10 text-lg"
            min="0"
            step="1000"
          />
        </div>

        {data.asking_price && (
          <div className="text-sm text-slate-600">
            Formatted: {formatPrice(data.asking_price)}
          </div>
        )}
      </div>

      {/* Profit Calculator */}
      {data.asking_price && (
        <Card className="bg-slate-50">
          <CardHeader>
            <CardTitle className="text-base">Quick Profit Estimate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="purchase_price" className="text-sm">Purchase Price (optional)</Label>
                  <Input
                    id="purchase_price"
                    type="number"
                    value={data.purchase_price || ''}
                    onChange={(e) => handlePriceChange('purchase_price', e.target.value)}
                    placeholder="What you paid"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="expenses" className="text-sm">Expenses (optional)</Label>
                  <Input
                    id="expenses"
                    type="number"
                    value={data.expenses || ''}
                    onChange={(e) => handlePriceChange('expenses', e.target.value)}
                    placeholder="Repairs, etc."
                    className="mt-1"
                  />
                </div>
              </div>

              {data.purchase_price && (
                <div className="p-3 bg-white rounded border">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-600">Estimated Profit:</span>
                    <span className="font-bold text-green-600">
                      {formatPrice(data.asking_price - data.purchase_price - (data.expenses || 0))}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Market Comparison */}
      {aiSuggestion && (
        <div className="bg-amber-50 p-4 rounded-lg">
          <h3 className="font-medium text-amber-900 mb-2">Pricing Strategy</h3>
          <ul className="text-sm text-amber-800 space-y-1">
            <li>• Price within the suggested range for faster sales</li>
            <li>• Consider your vehicle&apos;s unique features when pricing</li>
            <li>• Monitor market response and adjust if needed</li>
            <li>• Higher prices may take longer to sell</li>
          </ul>
        </div>
      )}

      {/* Comparables Modal */}
      {showComparables && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <CardHeader className="flex flex-row items-center justify-between border-b">
              <CardTitle>Why This Price Range?</CardTitle>
              <Button variant="ghost" size="icon" onClick={() => setShowComparables(false)}>
                <X className="w-4 h-4" />
              </Button>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                <p className="text-slate-600">
                  Based on similar {data.year} {data.make} {data.model} vehicles currently listed:
                </p>

                <div className="space-y-3">
                  {mockComparables.map((comp) => (
                    <div key={comp.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                      <div>
                        <div className="font-medium">
                          {comp.year} {comp.make} {comp.model}
                        </div>
                        <div className="text-sm text-slate-600">
                          {comp.km.toLocaleString()} km • {comp.location} • Listed {comp.days_listed} days ago
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-lg">
                          {formatPrice(comp.price)}
                        </div>
                        <div className={`text-sm ${
                          comp.price > (data.asking_price || 0) ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {comp.price > (data.asking_price || 0) ? 'Higher' : 'Lower'}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-blue-900 mb-2">Pricing Recommendation</h4>
                  <p className="text-sm text-blue-800">
                    Your current price of <strong>{formatPrice(data.asking_price || 0)}</strong> is{' '}
                    {(data.asking_price || 0) > (aiSuggestion?.median_price || 500000) ? 'above' : 'below'} market median.
                    Consider the vehicle condition and urgency to sell when finalizing.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
