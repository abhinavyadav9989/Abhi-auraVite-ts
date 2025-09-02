import React, { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { 
  IndianRupee, 
  Car, 
  Gauge, 
  Wrench, 
  Shield, 
  Check, 
  Eye, 
  EyeOff, 
  Users, 
  Globe,
  Lock,
  AlertTriangle,
  CheckCircle,
  Clock,
  Image as ImageIcon,
  FileText,
  Calendar,
  Settings
} from 'lucide-react';

interface FinalReviewStepProps {
  data: any;
  updateData: (data: any) => void;
  dealer: any;
  onPublish: () => void;
  onSaveDraft: () => void;
  isEditMode?: boolean; // Add edit mode flag
}

const formatCurrency = (amount: number) => new Intl.NumberFormat('en-IN', { 
  style: 'currency', 
  currency: 'INR', 
  minimumFractionDigits: 0 
}).format(amount);

export default function FinalReviewStep({ data, updateData, dealer, onPublish, onSaveDraft, isEditMode = false }: FinalReviewStepProps) {
  const [showPrivateInfo, setShowPrivateInfo] = useState(false);

  // Validation checks
  const validationChecks = useMemo(() => {
    const checks = {
      required: {
        make: !!data.make,
        model: !!data.model,
        year: !!data.year,
        shown_price: !!data.shown_price,
        branch_id: !!data.branch_id,
        images: data.images && data.images.length > 0
      },
      recommended: {
        description: !!data.description,
        condition_notes: !!data.condition_notes,
        documents: data.rc_available || data.insurance_status || data.puc_valid_until
      }
    };

    const requiredPassed = Object.values(checks.required).every(Boolean);
    const recommendedPassed = Object.values(checks.recommended).some(Boolean);

    return {
      checks,
      requiredPassed,
      recommendedPassed,
      canPublish: requiredPassed
    };
  }, [data]);

  // Calculate dealer net
  const dealerNet = useMemo(() => {
    if (data.stock_type === 'owned') {
      const baseCost = data.base_cost || 0;
      const shownPrice = data.shown_price || 0;
      const platformFees = shownPrice * 0.02; // 2% platform fee
      return shownPrice - baseCost - platformFees;
    } else {
      const shownPrice = data.shown_price || 0;
      const commissionRate = data.consignment_terms?.commission_rate || 0.05;
      return shownPrice * commissionRate;
    }
  }, [data.stock_type, data.base_cost, data.shown_price, data.consignment_terms]);

  // Get exposure mode info
  const getExposureModeInfo = () => {
    switch (data.exposure_mode) {
      case 'retail':
        return { icon: Globe, label: 'Retail (Public)', color: 'text-green-600' };
      case 'b2b':
        return { icon: Users, label: 'B2B (Dealer-only)', color: 'text-blue-600' };
      case 'masked':
        return { icon: Lock, label: 'Masked (Price on Request)', color: 'text-purple-600' };
      default:
        return { icon: Lock, label: 'Masked', color: 'text-purple-600' };
    }
  };

  const exposureMode = getExposureModeInfo();

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Review & Publish</h2>
        <p className="text-gray-600">
          Review all details before publishing your vehicle listing.
        </p>
      </div>

      {/* Validation Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5" />
            Validation Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Required Fields */}
            <div>
              <h4 className="font-medium mb-2">Required Fields</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {Object.entries(validationChecks.checks.required).map(([field, passed]) => (
                  <div key={field} className="flex items-center gap-2">
                    {passed ? (
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-red-600" />
                    )}
                    <span className="text-sm capitalize">{field.replace('_', ' ')}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Recommended Fields */}
            <div>
              <h4 className="font-medium mb-2">Recommended Fields</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {Object.entries(validationChecks.checks.recommended).map(([field, passed]) => (
                  <div key={field} className="flex items-center gap-2">
                    {passed ? (
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-orange-600" />
                    )}
                    <span className="text-sm capitalize">{field.replace('_', ' ')}</span>
                  </div>
                ))}
              </div>
            </div>

            {!validationChecks.canPublish && (
              <Alert variant="destructive">
                <AlertTriangle className="w-4 h-4" />
                <AlertDescription>
                  Please complete all required fields before publishing.
                </AlertDescription>
              </Alert>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Vehicle Summary */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-xl">{data.year} {data.make} {data.model}</CardTitle>
            <p className="text-gray-500">{data.variant}</p>
          </div>
          <Badge variant="secondary" className="text-lg">
            {formatCurrency(data.shown_price || 0)}
          </Badge>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Key Specs */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Car className="w-4 h-4 text-gray-500"/>
              <span>{data.fuel_type || 'N/A'}</span>
            </div>
            <div className="flex items-center gap-2">
              <Gauge className="w-4 h-4 text-gray-500"/>
              <span>{data.kilometers ? `${data.kilometers} kms` : 'N/A'}</span>
            </div>
            <div className="flex items-center gap-2">
              <Wrench className="w-4 h-4 text-gray-500"/>
              <span>{data.transmission || 'N/A'}</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-gray-500"/>
              <span>{data.ownership ? `${data.ownership} Owner` : 'N/A'}</span>
            </div>
          </div>

          {/* Description */}
          {data.description && (
            <div className="border-t pt-4">
              <h4 className="font-semibold mb-2">Description</h4>
              <p className="text-sm text-gray-600">{data.description}</p>
            </div>
          )}

          {/* Photos */}
          {data.images && data.images.length > 0 && (
            <div className="border-t pt-4">
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <ImageIcon className="w-4 h-4" />
                Photos ({data.images.length})
              </h4>
              <div className="flex flex-wrap gap-2">
                {data.images.slice(0, 5).map((img: string, i: number) => (
                  <img key={i} src={img} className="w-20 h-20 object-cover rounded-md border" alt={`Photo ${i + 1}`} />
                ))}
                {data.images.length > 5 && (
                  <div className="w-20 h-20 rounded-md border bg-gray-100 flex items-center justify-center text-sm">
                    +{data.images.length - 5} more
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Documents */}
          <div className="border-t pt-4">
            <h4 className="font-semibold mb-2 flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Documents
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
              <div className="flex items-center gap-2">
                {data.rc_available ? (
                  <CheckCircle className="w-4 h-4 text-green-600" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-orange-600" />
                )}
                <span>RC Available</span>
              </div>
              <div className="flex items-center gap-2">
                {data.insurance_status ? (
                  <CheckCircle className="w-4 h-4 text-green-600" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-orange-600" />
                )}
                <span>Insurance</span>
              </div>
              <div className="flex items-center gap-2">
                {data.puc_valid_until ? (
                  <CheckCircle className="w-4 h-4 text-green-600" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-orange-600" />
                )}
                <span>PUC</span>
              </div>
              <div className="flex items-center gap-2">
                {data.service_records_uploaded ? (
                  <CheckCircle className="w-4 h-4 text-green-600" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-orange-600" />
                )}
                <span>Service Records</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Publishing Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Publishing Settings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium mb-2">Exposure Mode</h4>
              <div className="flex items-center gap-2">
                <exposureMode.icon className="w-4 h-4" />
                <span className={exposureMode.color}>{exposureMode.label}</span>
              </div>
            </div>
            
            <div>
              <h4 className="font-medium mb-2">Publish Scope</h4>
              <span className="text-sm text-gray-600">
                {data.publish_scope === 'branch' ? 'Branch Only' :
                 data.publish_scope === 'org' ? 'Organization' : 'Marketplace'}
              </span>
            </div>

            <div>
              <h4 className="font-medium mb-2">Publishing</h4>
              <div className="flex items-center gap-2">
                {data.scheduled_publish ? (
                  <>
                    <Clock className="w-4 h-4 text-blue-600" />
                    <span className="text-sm text-gray-600">
                      Scheduled for {new Date(data.scheduled_publish).toLocaleString()}
                    </span>
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-sm text-gray-600">Publish Immediately</span>
                  </>
                )}
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-2">Branch</h4>
              <span className="text-sm text-gray-600">
                {data.branch_name || 'Selected Branch'}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Private Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Private Information
            </div>
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
          </CardTitle>
        </CardHeader>
        {showPrivateInfo && (
          <CardContent>
            <Alert className="mb-4">
              <Shield className="w-4 h-4" />
              <AlertDescription>
                This information is only visible to you and your team. Customers cannot see these details.
              </AlertDescription>
            </Alert>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium mb-2">Stock Type</h4>
                <span className="text-sm text-gray-600 capitalize">
                  {data.stock_type || 'Owned'}
                </span>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">Base Cost</h4>
                <span className="text-sm text-gray-600">
                  {data.base_cost ? formatCurrency(data.base_cost) : 'Not set'}
                </span>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">Target Margin</h4>
                <span className="text-sm text-gray-600">
                  {data.dealer_margin_target ? `${data.dealer_margin_target}%` : 'Not set'}
                </span>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">Dealer Net</h4>
                <span className={`text-sm font-medium ${dealerNet >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(dealerNet)}
                </span>
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Action Buttons - Only show when not in edit mode to avoid duplication */}
      {!isEditMode && (
        <div className="flex flex-col sm:flex-row gap-4">
          <Button
            variant="outline"
            onClick={onSaveDraft}
            className="flex-1"
          >
            Save as Draft
          </Button>
          
          <Button
            onClick={onPublish}
            disabled={!validationChecks.canPublish}
            className="flex-1"
          >
            {data.scheduled_publish ? 'Schedule for Later' : 'Publish Now'}
          </Button>
        </div>
      )}

      {/* Publishing Info */}
      {data.scheduled_publish && (
        <Alert>
          <Clock className="w-4 h-4" />
          <AlertDescription>
            Your listing will be published automatically on {new Date(data.scheduled_publish).toLocaleString()}.
            You can edit it anytime before then.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}