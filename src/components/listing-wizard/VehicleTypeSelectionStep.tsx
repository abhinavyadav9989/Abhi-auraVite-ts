import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Car, Sparkles, ArrowRight, CheckCircle, Info, Clock } from 'lucide-react';

interface VehicleTypeSelectionStepProps {
  data: any;
  updateData: (data: any) => void;
  dealer: any;
  onNext?: () => void;
}

const VEHICLE_TYPES = [
  {
    id: 'used' as const,
    title: 'Used Vehicle',
    subtitle: 'Pre-owned',
    description: 'List a pre-owned vehicle with condition details, service history, and competitive pricing.',
    icon: Car,
    features: [
      'VIN/Registration auto-fill',
      'Condition assessment',
      'Service history tracking',
      'Market price analysis',
      'Owner information'
    ],
    color: 'blue',
    popular: true
  },
  {
    id: 'new' as const,
    title: 'New Vehicle',
    subtitle: 'Brand new',
    description: 'List a brand new vehicle with OEM specifications, pricing calculator, and delivery tracking.',
    icon: Sparkles,
    features: [
      'OEM catalog integration',
      'Stock allocation tracking',
      'Price builder with RTO',
      'PDI workflow',
      'Delivery scheduling'
    ],
    color: 'green',
    advanced: true
  }
];

export default function VehicleTypeSelectionStep({
  data,
  updateData,
  dealer,
  onNext
}: VehicleTypeSelectionStepProps) {
  const handleVehicleTypeSelect = (vehicleType: 'used' | 'new') => {
    updateData({ vehicleType });
    if (onNext) {
      onNext();
    }
  };

  const selectedType = data.vehicleType;

  return (
    <div className="space-y-4 md:space-y-6 px-4 md:px-0">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl md:text-3xl font-bold mb-2">What type of vehicle are you adding?</h2>
        <p className="text-gray-600 text-base md:text-lg px-4 md:px-0">
          Choose the vehicle type to customize your listing experience
        </p>
      </div>

      {/* KYC Status Alert */}
      <Alert>
        <Info className="w-4 h-4" />
        <AlertTitle>Publishing Status</AlertTitle>
        <AlertDescription>
          You can publish to <strong>Masked</strong> exposure immediately.
          <strong>Public</strong> listings will go live automatically after Full KYC completion.
        </AlertDescription>
      </Alert>

      {/* Vehicle Type Selection */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 max-w-4xl mx-auto">
        {VEHICLE_TYPES.map((type) => {
          const Icon = type.icon;
          const isSelected = selectedType === type.id;
          const isAdvanced = type.advanced;

          return (
            <Card
              key={type.id}
              className={`relative cursor-pointer transition-all duration-200 hover:shadow-lg ${
                isSelected
                  ? `ring-2 ring-${type.color}-500 shadow-lg border-${type.color}-200`
                  : 'hover:ring-1 hover:ring-gray-300'
              } ${isAdvanced ? 'border-amber-200 bg-amber-50/30' : ''}`}
              onClick={() => handleVehicleTypeSelect(type.id)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start md:items-center justify-between">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className={`p-2 md:p-3 rounded-xl bg-${type.color}-100 flex-shrink-0`}>
                      <Icon className={`w-5 h-5 md:w-6 md:h-6 text-${type.color}-600`} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <CardTitle className="text-lg md:text-xl truncate">{type.title}</CardTitle>
                      <p className="text-sm text-gray-500">{type.subtitle}</p>
                    </div>
                  </div>
                  {isSelected && (
                    <CheckCircle className={`w-5 h-5 md:w-6 md:h-6 text-${type.color}-600 flex-shrink-0 ml-2`} />
                  )}
                </div>

                {/* Badges */}
                <div className="flex gap-2">
                  {type.popular && (
                    <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                      Most Popular
                    </Badge>
                  )}
                  {isAdvanced && (
                    <Badge variant="secondary" className="bg-amber-100 text-amber-800">
                      <Sparkles className="w-3 h-3 mr-1" />
                      Advanced
                    </Badge>
                  )}
                </div>
              </CardHeader>

              <CardContent className="space-y-3 md:space-y-4">
                <p className="text-gray-700 text-sm md:text-base">{type.description}</p>

                {/* Feature List */}
                <div className="space-y-2">
                  <h4 className="font-medium text-sm text-gray-900">Key Features:</h4>
                  <ul className="space-y-1.5">
                    {type.features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm text-gray-600">
                        <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                        <span className="leading-relaxed">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Selection Button */}
                <Button
                  className={`w-full mt-4 text-sm md:text-base py-3 md:py-2 ${
                    isSelected
                      ? `bg-${type.color}-600 hover:bg-${type.color}-700`
                      : `bg-${type.color}-500 hover:bg-${type.color}-600`
                  }`}
                  size="lg"
                >
                  {isSelected ? 'Selected' : 'Choose'} {type.title}
                  <ArrowRight className="w-4 h-4 ml-2 flex-shrink-0" />
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Advanced Feature Notice */}
      {selectedType === 'new' && (
        <Alert className="border-amber-200 bg-amber-50 mx-4 md:mx-0">
          <Clock className="w-4 h-4" />
          <AlertTitle className="text-sm md:text-base">New Vehicle Features</AlertTitle>
          <AlertDescription className="text-sm">
            New vehicle listings include advanced features like OEM catalog integration,
            incoming allocation tracking, and PDI workflows. Some features may require
            Advanced activation.
          </AlertDescription>
        </Alert>
      )}

      {/* Continue Button (if not using onNext) */}
      {selectedType && !onNext && (
        <div className="flex justify-center pt-4 md:pt-6 px-4 md:px-0">
          <Button
            size="lg"
            className="px-6 md:px-8 w-full md:w-auto text-sm md:text-base py-3 md:py-2"
            onClick={() => handleVehicleTypeSelect(selectedType)}
          >
            Continue with {selectedType === 'used' ? 'Used' : 'New'} Vehicle
            <ArrowRight className="w-4 h-4 ml-2 flex-shrink-0" />
          </Button>
        </div>
      )}
    </div>
  );
}
