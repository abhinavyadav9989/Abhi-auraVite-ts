import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { 
  Shield, 
  Eye, 
  EyeOff, 
  Lock, 
  Users, 
  Globe, 
  Info, 
  Calculator,
  ChevronDown,
  AlertTriangle
} from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { cn } from '@/lib/utils';

interface MarginPrivacyProps {
  dealerNet?: number;
  baseCost?: number;
  shownPrice?: number;
  dealerPrice?: number;
  stockType?: 'owned' | 'consignment';
  exposureMode?: 'retail' | 'b2b' | 'masked';
  onToggleVisibility?: (field: string, visible: boolean) => void;
  className?: string;
}

const formatCurrency = (amount: number) => new Intl.NumberFormat('en-IN', { 
  style: 'currency', 
  currency: 'INR', 
  minimumFractionDigits: 0 
}).format(amount);

export function MarginPrivacy({
  dealerNet = 0,
  baseCost = 0,
  shownPrice = 0,
  dealerPrice = 0,
  stockType = 'owned',
  exposureMode = 'masked',
  onToggleVisibility,
  className
}: MarginPrivacyProps) {
  const [showPrivateInfo, setShowPrivateInfo] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const getExposureModeInfo = () => {
    switch (exposureMode) {
      case 'retail':
        return { icon: Globe, label: 'Retail (Public)', color: 'text-green-600', bg: 'bg-green-50' };
      case 'b2b':
        return { icon: Users, label: 'B2B (Dealer-only)', color: 'text-blue-600', bg: 'bg-blue-50' };
      case 'masked':
        return { icon: Lock, label: 'Masked (Price on Request)', color: 'text-purple-600', bg: 'bg-purple-50' };
      default:
        return { icon: Lock, label: 'Masked', color: 'text-purple-600', bg: 'bg-purple-50' };
    }
  };

  const exposureModeInfo = getExposureModeInfo();

  const calculateMargin = () => {
    if (stockType === 'owned' && baseCost > 0 && shownPrice > 0) {
      return ((shownPrice - baseCost) / shownPrice) * 100;
    }
    return 0;
  };

  const margin = calculateMargin();

  return (
    <div className={cn('space-y-4', className)}>
      {/* Privacy Overview */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-800">
            <Shield className="w-5 h-5" />
            Margin Privacy Protection
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <p className="text-sm text-blue-700">
              Your margin and internal costs are protected by default. Only you and your team can see this information.
            </p>
            
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Show Private Information</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowPrivateInfo(!showPrivateInfo)}
              >
                {showPrivateInfo ? (
                  <>
                    <EyeOff className="w-4 h-4 mr-2" />
                    Hide
                  </>
                ) : (
                  <>
                    <Eye className="w-4 h-4 mr-2" />
                    Show
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Exposure Mode */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <exposureModeInfo.icon className="w-5 h-5" />
            Exposure Mode
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className={`p-3 rounded-lg ${exposureModeInfo.bg}`}>
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Current Mode</h4>
                <p className={`text-sm ${exposureModeInfo.color}`}>{exposureModeInfo.label}</p>
              </div>
              <Badge variant="outline" className={exposureModeInfo.color}>
                Active
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Private Information */}
      {showPrivateInfo && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="w-5 h-5" />
              Private Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Alert className="mb-4">
              <Shield className="w-4 h-4" />
              <AlertDescription>
                This information is only visible to you and your team. Customers cannot see these details.
              </AlertDescription>
            </Alert>

            <div className="space-y-4">
              {/* Stock Type */}
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <h4 className="font-medium text-sm">Stock Type</h4>
                  <p className="text-sm text-gray-600 capitalize">{stockType}</p>
                </div>
                <Badge variant="outline">Internal</Badge>
              </div>

              {/* Base Cost */}
              {baseCost > 0 && (
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <h4 className="font-medium text-sm">Base Cost</h4>
                    <p className="text-sm text-gray-600">{formatCurrency(baseCost)}</p>
                  </div>
                  <Badge variant="outline">Private</Badge>
                </div>
              )}

              {/* Dealer Net */}
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <h4 className="font-medium text-sm">Dealer Net</h4>
                  <p className={`text-sm font-medium ${dealerNet >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatCurrency(dealerNet)}
                  </p>
                </div>
                <Badge variant="outline">Private</Badge>
              </div>

              {/* Margin */}
              {margin > 0 && (
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <h4 className="font-medium text-sm">Margin</h4>
                    <p className="text-sm text-gray-600">{margin.toFixed(1)}%</p>
                  </div>
                  <Badge variant="outline">Private</Badge>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Customer View Preview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="w-5 h-5" />
            Customer View Preview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="p-3 bg-white border rounded-lg">
              <h4 className="font-medium text-sm mb-2">What customers will see:</h4>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Price:</span>
                  <span className="font-medium">
                    {exposureMode === 'masked' ? 'Price on Request' : formatCurrency(shownPrice)}
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span>Stock Type:</span>
                  <span className="text-gray-500">Not visible</span>
                </div>
                
                <div className="flex justify-between">
                  <span>Base Cost:</span>
                  <span className="text-gray-500">Not visible</span>
                </div>
                
                <div className="flex justify-between">
                  <span>Dealer Net:</span>
                  <span className="text-gray-500">Not visible</span>
                </div>
              </div>
            </div>

            <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
              <Info className="w-3 h-3 inline mr-1" />
              This preview shows exactly what customers will see on the marketplace.
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Advanced Privacy Settings */}
      <Collapsible open={showAdvanced} onOpenChange={() => setShowAdvanced(!showAdvanced)}>
        <Card>
          <CollapsibleTrigger className="w-full">
            <CardHeader className="cursor-pointer">
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Advanced Privacy Settings
                </div>
                <ChevronDown className={`w-4 h-4 transition-transform ${showAdvanced ? 'rotate-180' : ''}`} />
              </CardTitle>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent className="">
            <CardContent className="space-y-4">
              <Alert>
                <Info className="w-4 h-4" />
                <AlertDescription>
                  These settings control granular privacy options for your listing.
                </AlertDescription>
              </Alert>

              <div className="space-y-3">
                {/* Show dealer price to other dealers */}
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-sm">Show Dealer Price to Other Dealers</h4>
                    <p className="text-xs text-gray-600">Allow verified dealers to see your B2B price</p>
                  </div>
                  <Switch
                    checked={exposureMode === 'b2b'}
                    onCheckedChange={(checked) => {
                      // This would be handled by the parent component
                      console.log('Toggle dealer price visibility:', checked);
                    }}
                  />
                </div>

                {/* Show margin to team members */}
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-sm">Show Margin to Team Members</h4>
                    <p className="text-xs text-gray-600">Allow your team to see margin calculations</p>
                  </div>
                  <Switch
                    checked={true}
                    onCheckedChange={(checked) => {
                      console.log('Toggle team margin visibility:', checked);
                    }}
                  />
                </div>

                {/* Show base cost to team members */}
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-sm">Show Base Cost to Team Members</h4>
                    <p className="text-xs text-gray-600">Allow your team to see base cost information</p>
                  </div>
                  <Switch
                    checked={true}
                    onCheckedChange={(checked) => {
                      console.log('Toggle team base cost visibility:', checked);
                    }}
                  />
                </div>
              </div>
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      {/* Privacy Tips */}
      <Card className="bg-green-50 border-green-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-800">
            <Info className="w-5 h-5" />
            Privacy Tips
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm text-green-700">
            <div className="flex items-start gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
              <span>Your margin and costs are automatically hidden from customers</span>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
              <span>B2B pricing is only visible to verified dealers</span>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
              <span>Masked mode generates leads without showing prices</span>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
              <span>You can always edit privacy settings later</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
