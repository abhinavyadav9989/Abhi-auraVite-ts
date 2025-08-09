import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp, Car, Zap, Wrench } from 'lucide-react';

export default function AccessoriesSection() {
  const [expandedSection, setExpandedSection] = useState(null);

  const accessoryCategories = [
    {
      id: 'exterior',
      title: 'Exterior',
      icon: Car,
      count: 8,
      items: [
        'Body Cladding',
        'Roof Rails',
        'Chrome Door Handles',
        'LED DRL',
        'Fog Lamps',
        'Alloy Wheels',
        'Side Steps',
        'Mud Flaps'
      ]
    },
    {
      id: 'interior',
      title: 'Interior',
      icon: Wrench,
      count: 6,
      items: [
        'Premium Seat Covers',
        'Dashboard Camera',
        'Floor Mats',
        'Armrest Console',
        '7D Floor Mats',
        'Steering Cover'
      ]
    },
    {
      id: 'electronics',
      title: 'Electronics',
      icon: Zap,
      count: 4,
      items: [
        'Android Infotainment',
        'Reverse Camera',
        'USB Charger',
        'Ambient Lighting'
      ]
    }
  ];

  const toggleSection = (sectionId) => {
    setExpandedSection(expandedSection === sectionId ? null : sectionId);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wrench className="w-5 h-5 text-purple-600" />
          Accessories & Add-ons
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {accessoryCategories.map((category) => {
          const Icon = category.icon;
          const isExpanded = expandedSection === category.id;
          
          return (
            <div key={category.id} className="border border-slate-200 rounded-lg">
              <button
                className="w-full flex items-center justify-between p-4 hover:bg-slate-50 transition-colors"
                onClick={() => toggleSection(category.id)}
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-5 h-5 text-slate-600" />
                  <span className="font-medium">{category.title}</span>
                  <Badge variant="secondary" className="text-xs">
                    {category.count} items
                  </Badge>
                </div>
                {isExpanded ? (
                  <ChevronUp className="w-4 h-4 text-slate-400" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-slate-400" />
                )}
              </button>
              
              {isExpanded && (
                <div className="border-t border-slate-200 p-4 pt-3">
                  <div className="grid grid-cols-2 gap-2">
                    {category.items.map((item, index) => (
                      <div 
                        key={index}
                        className="flex items-center gap-2 text-sm text-slate-600 py-1"
                      >
                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
        
        <div className="mt-4 p-3 bg-blue-50 rounded-lg text-sm text-blue-800">
          <p className="font-medium">Total Accessories Value: ₹45,000</p>
          <p className="text-xs mt-1">All accessories are dealer-fitted and include installation</p>
        </div>
      </CardContent>
    </Card>
  );
}