
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Eye, 
  EyeOff, 
  Globe, 
  Lock, 
  Users, 
  Wrench,
  CheckCircle,
  AlertTriangle,
  IndianRupee
} from "lucide-react";
import FeeAndNetCard from './FeeAndNetCard'; // NEW: Import the Fee Card

// F-P1: Mock Fee Rule Engine
const getFeeRule = (city) => {
  if (city === "Pune") {
    return { type: 'percentage', value: 1, reason: "Promotional rate for Pune" };
  }
  return { type: 'percentage', value: 2, reason: "Standard rate" };
};

const VISIBILITY_OPTIONS = [
  {
    value: "live",
    icon: Globe,
    title: "Publish Live",
    description: "Visible to all dealers immediately",
    color: "bg-green-50 border-green-200 text-green-900"
  },
  {
    value: "draft",
    icon: EyeOff,
    title: "Save as Draft",
    description: "Not visible to others, continue editing later",
    color: "bg-slate-50 border-slate-200 text-slate-900"
  }
];

export default function PublishSettings({ data, onChange, dealer }) {
  const [feeRule, setFeeRule] = useState({ type: 'percentage', value: 2 });
  const [rememberFee, setRememberFee] = useState(false);

  useEffect(() => {
    if (dealer?.city) {
      setFeeRule(getFeeRule(dealer.city));
    }
  }, [dealer]);

  useEffect(() => {
    // F-A1: On change, save fee rule to vehicle data
    onChange({
      listing_fee_type: feeRule.type,
      listing_fee_value: feeRule.value,
    });
  }, [feeRule, onChange]);
  
  const handleFeePreferenceChange = (isChecked) => {
      setRememberFee(isChecked);
      // In a real app, this would trigger a call to update DealerPreferences
  };

  const handleInputChange = (field, value) => {
    onChange({ [field]: value });
  };

  const getListingSummary = () => {
    const summary = {
      completeness: 0,
      issues: [],
      warnings: []
    };

    // Check basic info
    if (data.registration_number && data.make && data.model && data.year) {
      summary.completeness += 25;
    } else {
      summary.issues.push("Missing basic vehicle information");
    }

    // Check specs
    if (data.kilometers && data.fuel_type && data.transmission) {
      summary.completeness += 25;
    } else {
      summary.issues.push("Incomplete vehicle specifications");
    }

    // Check photos
    if (data.images && data.images.length >= 6) {
      summary.completeness += 25;
    } else {
      summary.issues.push("Need at least 6 high-quality photos");
    }

    // Check price
    if (data.asking_price) {
      summary.completeness += 25;
    } else {
      summary.issues.push("Missing asking price");
    }

    // Warnings
    if (!data.description || data.description.length < 50) {
      summary.warnings.push("Add detailed description for better response");
    }

    if (!data.color) {
      summary.warnings.push("Vehicle color helps buyers find your listing");
    }

    return summary;
  };

  const summary = getListingSummary();
  const canPublish = summary.completeness === 100;

  const formatPrice = (price) => {
    if (!price) return 'N/A';
    if (price >= 100000) {
      return `₹${(price / 100000).toFixed(1)}L`;
    }
    return `₹${(price / 1000).toFixed(0)}K`;
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-lg font-semibold">Publish Your Listing</h2>
        <p className="text-sm text-slate-600">Review and publish your vehicle listing</p>
      </div>

      {/* Listing Summary Card */}
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            {data.images && data.images.length > 0 ? (
              <img 
                src={data.images[0].url} 
                alt="Vehicle" 
                className="w-20 h-16 object-cover rounded-lg"
              />
            ) : (
              <div className="w-20 h-16 bg-slate-200 rounded-lg flex items-center justify-center">
                <Eye className="w-6 h-6 text-slate-400" />
              </div>
            )}
            
            <div className="flex-1">
              <h3 className="font-bold text-blue-900">
                {data.year} {data.make} {data.model}
                {data.variant && ` ${data.variant}`}
              </h3>
              <p className="text-sm text-blue-700 mb-2">
                {data.registration_number} • {data.kilometers ? `${data.kilometers} km` : 'KM not specified'}
              </p>
              
              <div className="flex items-center gap-4">
                {data.asking_price && (
                  <div className="flex items-center gap-1">
                    <IndianRupee className="w-4 h-4 text-blue-600" />
                    <span className="font-bold text-blue-900">
                      {formatPrice(data.asking_price)}
                    </span>
                  </div>
                )}
                <Badge className="bg-blue-600 text-white">
                  {data.inventory_type || 'public'}
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Completeness Check */}
      <Card className={`${summary.completeness === 100 ? 'border-green-200 bg-green-50' : 'border-orange-200 bg-orange-50'}`}>
        <CardContent className="p-4">
          <div className="flex items-center gap-3 mb-3">
            {summary.completeness === 100 ? (
              <CheckCircle className="w-5 h-5 text-green-600" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-orange-600" />
            )}
            <div>
              <h3 className="font-medium">
                Listing Completeness: {summary.completeness}%
              </h3>
              <p className="text-sm text-slate-600">
                {summary.completeness === 100 ? 'Ready to publish!' : 'Complete missing items to publish'}
              </p>
            </div>
          </div>

          {summary.issues.length > 0 && (
            <div className="space-y-1 mb-3">
              <h4 className="text-sm font-medium text-red-700">Issues to fix:</h4>
              {summary.issues.map((issue, index) => (
                <div key={index} className="text-sm text-red-600 flex items-center gap-2">
                  <div className="w-1 h-1 bg-red-500 rounded-full"></div>
                  {issue}
                </div>
              ))}
            </div>
          )}

          {summary.warnings.length > 0 && (
            <div className="space-y-1">
              <h4 className="text-sm font-medium text-orange-700">Recommendations:</h4>
              {summary.warnings.map((warning, index) => (
                <div key={index} className="text-sm text-orange-600 flex items-center gap-2">
                  <div className="w-1 h-1 bg-orange-500 rounded-full"></div>
                  {warning}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor="description" className="text-base font-medium">
          Vehicle Description
        </Label>
        <Textarea
          id="description"
          value={data.description || ''}
          onChange={(e) => handleInputChange('description', e.target.value)}
          placeholder="Describe the vehicle condition, features, service history, etc. A detailed description helps buyers make decisions faster."
          rows={4}
          className="resize-none"
        />
        <div className="flex justify-between text-xs text-slate-500">
          <span>
            {(data.description || '').length < 50 ? 'Add more details for better response' : 'Good description length'}
          </span>
          <span>{(data.description || '').length}/500</span>
        </div>
      </div>
      
      {/* NEW: Fee & Net Card */}
      <FeeAndNetCard
        askingPrice={data.asking_price}
        feeRule={feeRule}
        onFeePreferenceChange={handleFeePreferenceChange}
      />

      {/* Publish Options */}
      <div className="space-y-3">
        <Label className="text-base font-medium">Publishing Option</Label>
        <div className="grid gap-3">
          {VISIBILITY_OPTIONS.map(option => {
            const Icon = option.icon;
            return (
              <Card
                key={option.value}
                className={`cursor-pointer transition-all ${
                  data.status === option.value
                    ? option.color
                    : 'hover:shadow-md border-slate-200'
                } ${!canPublish && option.value === 'live' ? 'opacity-50 cursor-not-allowed' : ''}`}
                onClick={() => {
                  if (canPublish || option.value === 'draft') {
                    handleInputChange('status', option.value);
                  }
                }}
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Icon className="w-5 h-5" />
                    <div className="flex-1">
                      <h3 className="font-medium">{option.title}</h3>
                      <p className="text-sm text-slate-600">{option.description}</p>
                    </div>
                    {data.status === option.value && (
                      <CheckCircle className="w-5 h-5 text-current" />
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Publishing Guidelines */}
      <Card className="bg-slate-50">
        <CardContent className="p-4">
          <h3 className="font-medium mb-3">Publishing Guidelines</h3>
          <div className="space-y-2 text-sm text-slate-600">
            <div className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
              <span>All information will be verified before going live</span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
              <span>You can edit your listing anytime from inventory</span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
              <span>Drafts are auto-saved every 30 seconds</span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
              <span>High-quality listings get 3x more inquiries</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Final Validation */}
      {!canPublish && (
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
            <div>
              <h3 className="font-medium text-yellow-800">Almost Ready!</h3>
              <p className="text-sm text-yellow-700">
                Complete the missing items above to publish your listing live. 
                You can save as draft and continue later.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
