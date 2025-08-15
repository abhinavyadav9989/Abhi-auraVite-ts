import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BarChart3, Car, Building2, Target } from 'lucide-react';

interface SegmentSectionProps {
  dealer: any;
}

const SegmentSection: React.FC<SegmentSectionProps> = ({ dealer }) => {
  const businessMode = dealer?.business_mode;
  
  // Debug logging
  console.log('SegmentSection - dealer:', dealer);
  console.log('SegmentSection - business_mode:', businessMode);
  console.log('SegmentSection - business_type:', dealer?.business_type);

  const businessModes = [
    { id: 'new_vehicles', label: 'New Vehicles', description: 'Selling brand new vehicles' },
    { id: 'used_vehicles', label: 'Used Vehicles', description: 'Selling pre-owned vehicles' },
    { id: 'both', label: 'Both New & Used', description: 'Selling both new and used vehicles' }
  ];

  const vehicleSegments = [
    { id: '2w', label: '2-Wheeler', icon: Car },
    { id: '3w', label: '3-Wheeler', icon: Car },
    { id: '4w', label: '4-Wheeler', icon: Car },
    { id: 'commercial', label: 'Commercial', icon: Building2 },
    { id: 'others', label: 'Others', icon: Car }
  ];

  const getSelectedSegments = () => {
    if (!businessMode?.segments) return [];
    return vehicleSegments.filter(segment => 
      businessMode.segments.includes(segment.id)
    );
  };

  const getBusinessMode = () => {
    if (!businessMode?.mode) return null;
    return businessModes.find(mode => mode.id === businessMode.mode);
  };

  const selectedSegments = getSelectedSegments();
  const selectedBusinessMode = getBusinessMode();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Business Segments</h2>
          <p className="text-slate-600 mt-1">Your business type and vehicle segments</p>
        </div>
      </div>

      {/* Business Mode */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="w-5 h-5" />
            Business Mode
          </CardTitle>
        </CardHeader>
        <CardContent>
          {selectedBusinessMode ? (
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Badge variant="secondary" className="text-sm">
                  {selectedBusinessMode.label}
                </Badge>
                <span className="text-slate-600 text-sm">
                  {selectedBusinessMode.description}
                </span>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-slate-500">
              <BarChart3 className="w-12 h-12 mx-auto mb-3 text-slate-300" />
              <p>No business mode selected</p>
              <p className="text-sm">Complete onboarding to select your business mode</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Vehicle Segments */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Car className="w-5 h-5" />
            Vehicle Segments
          </CardTitle>
        </CardHeader>
        <CardContent>
          {selectedSegments.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {selectedSegments.map((segment) => {
                const IconComponent = segment.icon;
                return (
                  <div key={segment.id} className="flex items-center gap-3 p-3 border border-slate-200 rounded-lg">
                    <IconComponent className="w-5 h-5 text-blue-600" />
                    <span className="font-medium text-slate-700">{segment.label}</span>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-slate-500">
              <Car className="w-12 h-12 mx-auto mb-3 text-slate-300" />
              <p>No vehicle segments selected</p>
              <p className="text-sm">Complete onboarding to select your vehicle segments</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Raw Data for Debug */}
      {process.env.NODE_ENV === 'development' && businessMode && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5" />
              Debug: Raw Business Mode Data
            </CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="text-xs bg-slate-100 p-3 rounded overflow-auto">
              {JSON.stringify(businessMode, null, 2)}
            </pre>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SegmentSection;
