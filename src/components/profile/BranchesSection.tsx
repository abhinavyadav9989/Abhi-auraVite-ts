import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, Clock, Phone, Building2, Plus } from 'lucide-react';
import { supabase } from '@/api/supabaseClient';

interface BranchesSectionProps {
  dealer: any;
}

const DAYS_OF_WEEK = [
  'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'
];

const BranchesSection: React.FC<BranchesSectionProps> = ({ dealer }) => {
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBranches();
  }, [dealer?.id]);

  const loadBranches = async () => {
    if (!dealer?.id) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('branches')
        .select('*')
        .eq('dealer_id', dealer.id)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error loading branches:', error);
      } else {
        setBranches(data || []);
      }
    } catch (error) {
      console.error('Error loading branches:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatWorkingHours = (workingHours: any) => {
    if (!workingHours || typeof workingHours !== 'object') {
      return 'Working hours not set';
    }

    const days = Object.keys(workingHours).map(Number).sort();
    if (days.length === 0) return 'Working hours not set';

    return days.map(dayIndex => {
      const dayHours = workingHours[dayIndex];
      const dayName = DAYS_OF_WEEK[dayIndex];
      
      if (!dayHours || !dayHours.isOpen) {
        return `${dayName}: Closed`;
      }
      
      return `${dayName}: ${dayHours.openTime} - ${dayHours.closeTime}`;
    }).join(', ');
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse">
          <div className="h-6 bg-slate-200 rounded w-48 mb-4" />
          <div className="space-y-3">
            <div className="h-32 bg-slate-200 rounded" />
            <div className="h-32 bg-slate-200 rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (!branches || branches.length === 0) {
    return (
      <div className="text-center py-8">
        <Building2 className="w-12 h-12 text-slate-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-slate-900 mb-2">No Branches Added</h3>
        <p className="text-slate-600 mb-4">You haven't added any branch locations yet.</p>
        <Button variant="outline" className="gap-2">
          <Plus className="w-4 h-4" />
          Add Branch
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Business Branches</h2>
          <p className="text-slate-600">Your business locations and working hours</p>
        </div>
        <Button variant="outline" className="gap-2">
          <Plus className="w-4 h-4" />
          Add Branch
        </Button>
      </div>

      <div className="grid gap-6">
        {branches.map((branch: any, index: number) => (
          <Card key={branch.id} className="overflow-hidden">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Building2 className="w-5 h-5 text-slate-600" />
                  <CardTitle className="text-lg">
                    {branch.name || `Branch ${index + 1}`}
                  </CardTitle>
                  {branch.is_default && (
                    <Badge variant="secondary" className="text-xs">
                      Default
                    </Badge>
                  )}
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {/* Address Information */}
              <div className="space-y-3">
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-slate-500 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm text-slate-900">
                      {branch.address || 'Address not provided'}
                    </p>
                    <p className="text-sm text-slate-600">
                      {branch.city && branch.state ? `${branch.city}, ${branch.state}` : 'Location not specified'}
                    </p>
                  </div>
                </div>

                {branch.contact_number && (
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-slate-500" />
                    <span className="text-sm text-slate-900">{branch.contact_number}</span>
                  </div>
                )}
              </div>

              {/* Working Hours */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-slate-500" />
                  <span className="text-sm font-medium text-slate-900">Working Hours</span>
                </div>
                <div className="pl-6">
                  <p className="text-sm text-slate-600 leading-relaxed">
                    {formatWorkingHours(branch.working_hours)}
                  </p>
                </div>
              </div>

              {/* Detailed Working Hours */}
              {branch.working_hours && typeof branch.working_hours === 'object' && (
                <div className="mt-4 p-3 bg-slate-50 rounded-lg">
                  <h4 className="text-sm font-medium text-slate-900 mb-2">Detailed Schedule</h4>
                  <div className="space-y-1">
                    {DAYS_OF_WEEK.map((dayName, dayIndex) => {
                      const dayHours = branch.working_hours[dayIndex];
                      if (!dayHours) return null;
                      
                      return (
                        <div key={dayIndex} className="flex justify-between text-xs">
                          <span className="text-slate-600 font-medium">{dayName}</span>
                          <span className="text-slate-900">
                            {dayHours.isOpen ? `${dayHours.openTime} - ${dayHours.closeTime}` : 'Closed'}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default BranchesSection;
