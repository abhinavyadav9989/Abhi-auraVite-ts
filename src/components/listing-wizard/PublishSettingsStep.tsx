import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { 
  Globe, 
  Lock, 
  Users, 
  Calendar, 
  Info, 
  Shield, 
  Clock, 
  CheckCircle, 
  AlertTriangle,
  ChevronDown,
  Eye,
  EyeOff,
  Settings,
  Zap
} from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface PublishSettingsStepProps {
  data: any;
  updateData: (data: any) => void;
  dealer: any;
}

const EXPOSURE_MODES = [
  { 
    id: 'retail', 
    title: 'Retail (Public)', 
    description: 'Visible to all customers on the marketplace with shown price.',
    icon: Globe,
    badge: 'Most Popular',
    badgeColor: 'bg-green-100 text-green-800'
  },
  { 
    id: 'b2b', 
    title: 'B2B (Dealer-only)', 
    description: 'Visible only to verified dealers with dealer price.',
    icon: Users,
    badge: 'Dealer Network',
    badgeColor: 'bg-blue-100 text-blue-800'
  },
  { 
    id: 'masked', 
    title: 'Masked (Price on Request)', 
    description: 'Visible to all but price hidden. Leads are gated.',
    icon: Lock,
    badge: 'Lead Generation',
    badgeColor: 'bg-purple-100 text-purple-800'
  },
];

const PUBLISH_OPTIONS = [
  { id: 'branch', title: 'Publish to Branch', description: 'List only in your selected branch inventory' },
  { id: 'org', title: 'Publish to Organization', description: 'List across all your branches' },
  { id: 'marketplace', title: 'Publish to Marketplace', description: 'List publicly on the marketplace' },
];

export default function PublishSettingsStep({ data, updateData, dealer }: PublishSettingsStepProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleFieldChange = (field: string, value: any) => {
    updateData({ [field]: value });
  };

  const getPriceBandStatus = () => {
    const price = data.shown_price || 0;
    const marketData = {
      min_price: 550000,
      max_price: 750000
    };

    if (price < marketData.min_price) return { status: 'Below Market', color: 'text-green-600', bg: 'bg-green-50' };
    if (price > marketData.max_price) return { status: 'Above Market', color: 'text-orange-600', bg: 'bg-orange-50' };
    return { status: 'Fair Market', color: 'text-blue-600', bg: 'bg-blue-50' };
  };

  const priceBand = getPriceBandStatus();
  const requiresApproval = priceBand.status === 'Above Market' || priceBand.status === 'Below Market';

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Publish Settings</h2>
        <p className="text-gray-600">
          Configure how your vehicle will appear and who can see it.
        </p>
      </div>

      {/* Exposure Mode Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="w-5 h-5" />
            Exposure Mode
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-gray-600 mb-4">
              Choose how your vehicle will appear to different audiences:
            </p>
            
            <RadioGroup
              value={data.exposure_mode || 'masked'}
              onValueChange={(value) => handleFieldChange('exposure_mode', value)}
              className="grid grid-cols-1 md:grid-cols-3 gap-4"
            >
              {EXPOSURE_MODES.map((mode) => (
                <Label 
                  key={mode.id} 
                  htmlFor={mode.id} 
                  className={`flex flex-col items-center justify-center rounded-lg border-2 p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                    data.exposure_mode === mode.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                  }`}
                >
                  <RadioGroupItem value={mode.id} id={mode.id} className="sr-only" />
                  <div className="flex items-center gap-2 mb-2">
                    <mode.icon className="w-6 h-6" />
                    <Badge variant="outline" className={mode.badgeColor}>
                      {mode.badge}
                    </Badge>
                  </div>
                  <span className="font-bold text-center">{mode.title}</span>
                  <span className="text-xs text-center text-gray-500 mt-1">{mode.description}</span>
                </Label>
              ))}
            </RadioGroup>
          </div>
        </CardContent>
      </Card>

      {/* Publish Scope */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="w-5 h-5" />
            Publish Scope
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-gray-600 mb-4">
              Choose where to publish your vehicle:
            </p>
            
            <RadioGroup
              value={data.publish_scope || 'marketplace'}
              onValueChange={(value) => handleFieldChange('publish_scope', value)}
              className="space-y-3"
            >
              {PUBLISH_OPTIONS.map((option) => (
                <Label 
                  key={option.id} 
                  htmlFor={option.id} 
                  className={`flex items-center space-x-3 p-3 rounded-lg border cursor-pointer hover:bg-gray-50 ${
                    data.publish_scope === option.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                  }`}
                >
                  <RadioGroupItem value={option.id} id={option.id} />
                  <div>
                    <div className="font-medium">{option.title}</div>
                    <div className="text-sm text-gray-500">{option.description}</div>
                  </div>
                </Label>
              ))}
            </RadioGroup>
          </div>
        </CardContent>
      </Card>

      {/* Price Validation */}
      {data.shown_price && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Price Validation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`p-4 rounded-lg ${priceBand.bg}`}>
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">Price Analysis</span>
                <Badge variant="outline" className={priceBand.color}>
                  {priceBand.status}
                </Badge>
              </div>
              
              {requiresApproval ? (
                <Alert variant="destructive" className="mt-3">
                  <AlertTriangle className="w-4 h-4" />
                  <AlertDescription>
                    Your price is outside the recommended market range. This listing will require approval before publishing.
                  </AlertDescription>
                </Alert>
              ) : (
                <Alert className="mt-3 bg-green-50 border-green-200">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <AlertDescription className="text-green-800">
                    Your price is within the recommended market range. Ready to publish!
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Scheduling */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Schedule Publishing
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="scheduled_publish">Schedule for later</Label>
                <p className="text-sm text-gray-600">
                  Publish at a specific date and time
                </p>
              </div>
              <Switch
                checked={!!data.scheduled_publish}
                onCheckedChange={(checked) => {
                  if (!checked) {
                    handleFieldChange('scheduled_publish', null);
                  } else {
                    // Set default to tomorrow
                    const tomorrow = new Date();
                    tomorrow.setDate(tomorrow.getDate() + 1);
                    tomorrow.setHours(9, 0, 0, 0);
                    handleFieldChange('scheduled_publish', tomorrow.toISOString().slice(0, 16));
                  }
                }}
              />
            </div>

            {data.scheduled_publish && (
              <div className="space-y-3">
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    type="datetime-local"
                    value={data.scheduled_publish}
                    onChange={(e) => handleFieldChange('scheduled_publish', e.target.value)}
                    className="pl-10"
                    min={new Date().toISOString().slice(0, 16)}
                  />
                </div>
                <p className="text-sm text-gray-600">
                  Your listing will be published automatically at the scheduled time.
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Advanced Settings */}
      <Collapsible open={showAdvanced} onOpenChange={() => setShowAdvanced(!showAdvanced)}>
        <Card>
          <CollapsibleTrigger className="w-full">
            <CardHeader className="cursor-pointer">
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  Advanced Settings
                </div>
                <ChevronDown className={`w-4 h-4 transition-transform ${showAdvanced ? 'rotate-180' : ''}`} />
              </CardTitle>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-4">
            <CardContent className="space-y-4">
              <Alert>
                <Info className="w-4 h-4" />
                <AlertDescription>
                  These settings control advanced publishing behavior and automation.
                </AlertDescription>
              </Alert>

              <div className="space-y-4">
                {/* Auto-refresh */}
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="auto_refresh">Auto-refresh listing</Label>
                    <p className="text-sm text-gray-600">
                      Automatically update listing every 7 days
                    </p>
                  </div>
                  <Switch
                    checked={data.auto_refresh || false}
                    onCheckedChange={(checked) => handleFieldChange('auto_refresh', checked)}
                  />
                </div>

                {/* Lead notifications */}
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="lead_notifications">Lead notifications</Label>
                    <p className="text-sm text-gray-600">
                      Get notified when someone shows interest
                    </p>
                  </div>
                  <Switch
                    checked={data.lead_notifications !== false}
                    onCheckedChange={(checked) => handleFieldChange('lead_notifications', checked)}
                  />
                </div>

                {/* Market alerts */}
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="market_alerts">Market alerts</Label>
                    <p className="text-sm text-gray-600">
                      Get notified about market price changes
                    </p>
                  </div>
                  <Switch
                    checked={data.market_alerts || false}
                    onCheckedChange={(checked) => handleFieldChange('market_alerts', checked)}
                  />
                </div>
              </div>
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      {/* Publishing Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5" />
            Publishing Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span>Exposure Mode:</span>
              <span className="font-medium">
                {EXPOSURE_MODES.find(m => m.id === data.exposure_mode)?.title || 'Masked'}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Publish Scope:</span>
              <span className="font-medium">
                {PUBLISH_OPTIONS.find(o => o.id === data.publish_scope)?.title || 'Marketplace'}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Price Status:</span>
              <Badge variant="outline" className={priceBand.color}>
                {priceBand.status}
              </Badge>
            </div>
            <div className="flex justify-between">
              <span>Publishing:</span>
              <span className="font-medium">
                {data.scheduled_publish ? 'Scheduled' : 'Immediate'}
              </span>
            </div>
            
            {requiresApproval && (
              <Alert className="mt-3">
                <Clock className="w-4 h-4" />
                <AlertDescription>
                  This listing will be reviewed by our team before publishing. 
                  Typical approval time: 2-4 hours.
                </AlertDescription>
              </Alert>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}