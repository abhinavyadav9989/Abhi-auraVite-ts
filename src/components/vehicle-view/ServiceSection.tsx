import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Clock, Shield, Wrench } from 'lucide-react';

export default function ServiceSection() {
  const serviceHistory = [
    {
      date: '2024-01-15',
      type: 'Paid Service',
      kilometers: '45,000 km',
      location: 'Authorized Service Center',
      status: 'completed'
    },
    {
      date: '2023-07-20',
      type: 'Free Service',
      kilometers: '35,000 km',
      location: 'Authorized Service Center',
      status: 'completed'
    },
    {
      date: '2023-01-10',
      type: 'Free Service',
      kilometers: '25,000 km',
      location: 'Authorized Service Center',
      status: 'completed'
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wrench className="w-5 h-5 text-orange-600" />
          Service & Maintenance
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Service Contracts */}
        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="w-4 h-4 text-green-600" />
              <span className="font-medium text-green-800">AMC Coverage</span>
            </div>
            <div className="text-sm text-green-700">
              <div>Valid until: <span className="font-medium">March 2025</span></div>
              <div>Remaining: <span className="font-medium">8 months</span></div>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="w-4 h-4 text-blue-600" />
              <span className="font-medium text-blue-800">RSA Coverage</span>
            </div>
            <div className="text-sm text-blue-700">
              <div>Valid until: <span className="font-medium">June 2025</span></div>
              <div>24/7 Roadside Assistance</div>
            </div>
          </div>
        </div>

        {/* Service History */}
        <div>
          <h4 className="font-medium mb-3 flex items-center gap-2">
            <Clock className="w-4 h-4 text-slate-600" />
            Recent Service History
          </h4>
          <div className="space-y-3">
            {serviceHistory.map((service, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <div>
                    <div className="font-medium text-sm">{service.type}</div>
                    <div className="text-xs text-slate-600">
                      {new Date(service.date).toLocaleDateString()} • {service.kilometers}
                    </div>
                  </div>
                </div>
                <Badge className="bg-green-100 text-green-700 text-xs">
                  Completed
                </Badge>
              </div>
            ))}
          </div>
        </div>

        {/* Next Service Due */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-4 h-4 text-yellow-600" />
            <span className="font-medium text-yellow-800">Next Service Due</span>
          </div>
          <div className="text-sm text-yellow-700">
            <div>Expected: <span className="font-medium">July 2024</span></div>
            <div>At: <span className="font-medium">55,000 km</span></div>
            <div className="text-xs mt-1">or 6 months from last service</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}