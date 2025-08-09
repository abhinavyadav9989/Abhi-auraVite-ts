import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Camera, FileText, AlertTriangle, CheckCircle, Star, Upload, X } from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";
import { VehicleInspection } from '@/api/entities';
import { User } from '@/api/entities';
import { Vehicle } from '@/api/entities';
import { formatCurrency } from '@/components/formatters';
import useAppConfig from '@/components/useAppConfig';

const CONDITION_RATINGS = [
  { value: 5, label: 'Excellent', color: 'text-green-600', bgColor: 'bg-green-100' },
  { value: 4, label: 'Good', color: 'text-green-500', bgColor: 'bg-green-50' },
  { value: 3, label: 'Average', color: 'text-yellow-600', bgColor: 'bg-yellow-100' },
  { value: 2, label: 'Below Average', color: 'text-orange-600', bgColor: 'bg-orange-100' },
  { value: 1, label: 'Poor', color: 'text-red-600', bgColor: 'bg-red-100' }
];

const DEFECT_SEVERITIES = [
  { value: 'minor', label: 'Minor', color: 'text-blue-600' },
  { value: 'moderate', label: 'Moderate', color: 'text-yellow-600' },
  { value: 'major', label: 'Major', color: 'text-orange-600' },
  { value: 'critical', label: 'Critical', color: 'text-red-600' }
];

export default function InspectorPanel({ vehicle, onInspectionComplete, existingInspection = null }) {
  const { getConfig, isLoading: configLoading } = useAppConfig();
  const [inspectionData, setInspectionData] = useState({
    overall_rating: 0,
    category_ratings: {},
    defects: [],
    recommendations: '',
    estimated_refurbishment_cost: 0,
    photos: [],
    status: 'draft'
  });
  const [currentUser, setCurrentUser] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newDefect, setNewDefect] = useState({
    category: '',
    severity: 'minor',
    description: '',
    estimated_cost: 0
  });
  const { toast } = useToast();

  const inspectionCategories = getConfig('inspection_categories', []);

  useEffect(() => {
    loadCurrentUser();
    if (existingInspection) {
      setInspectionData(existingInspection);
    }
  }, [existingInspection]);

  const loadCurrentUser = async () => {
    try {
      const user = await User.me();
      setCurrentUser(user);
    } catch (error) {
      console.error('Error loading current user:', error);
    }
  };

  const handleCategoryRating = (categoryId, rating) => {
    setInspectionData(prev => ({
      ...prev,
      category_ratings: {
        ...prev.category_ratings,
        [categoryId]: rating
      }
    }));
  };

  const addDefect = () => {
    if (!newDefect.category || !newDefect.description) {
      toast({
        title: "Incomplete Defect",
        description: "Please fill in category and description for the defect.",
        variant: "destructive"
      });
      return;
    }

    const defect = {
      id: Date.now(),
      ...newDefect,
      estimated_cost: Number(newDefect.estimated_cost) || 0
    };

    setInspectionData(prev => ({
      ...prev,
      defects: [...prev.defects, defect]
    }));

    // Reset form
    setNewDefect({
      category: '',
      severity: 'minor',
      description: '',
      estimated_cost: 0
    });
  };

  const removeDefect = (defectId) => {
    setInspectionData(prev => ({
      ...prev,
      defects: prev.defects.filter(d => d.id !== defectId)
    }));
  };

  const calculateOverallRating = () => {
    const ratings = Object.values(inspectionData.category_ratings).filter(r => r > 0);
    if (ratings.length === 0) return 0;
    return Math.round(ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length);
  };

  const calculateTotalRefurbishmentCost = () => {
    const defectsCost = inspectionData.defects.reduce((sum, defect) => sum + (defect.estimated_cost || 0), 0);
    const manualCost = Number(inspectionData.estimated_refurbishment_cost) || 0;
    return defectsCost + manualCost;
  };

  const handleSubmitInspection = async () => {
    if (!currentUser) {
      toast({
        title: "Authentication Error",
        description: "Please log in to submit inspection.",
        variant: "destructive"
      });
      return;
    }

    if (Object.keys(inspectionData.category_ratings).length === 0) {
      toast({
        title: "Incomplete Inspection",
        description: "Please rate at least one category before submitting.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const finalData = {
        ...inspectionData,
        vehicle_id: vehicle.id,
        inspector_id: currentUser.email,
        inspection_date: new Date().toISOString(),
        overall_rating: calculateOverallRating(),
        estimated_refurbishment_cost: calculateTotalRefurbishmentCost(),
        status: 'completed',
        vehicle_status_at_inspection: vehicle.status,
        is_latest: true
      };

      let savedInspection;
      if (existingInspection?.id) {
        // Update existing inspection
        savedInspection = await VehicleInspection.update(existingInspection.id, finalData);
      } else {
        // Mark previous inspections as not latest
        const previousInspections = await VehicleInspection.filter({ 
          vehicle_id: vehicle.id, 
          is_latest: true 
        });
        
        await Promise.all(
          previousInspections.map(inspection => 
            VehicleInspection.update(inspection.id, { is_latest: false })
          )
        );

        // Create new inspection
        savedInspection = await VehicleInspection.create(finalData);
      }

      // Update vehicle with latest inspection reference
      await Vehicle.update(vehicle.id, {
        inspection_report_url: savedInspection.id,
        last_inspection_date: finalData.inspection_date,
        inspection_status: 'completed'
      });

      toast({
        title: "Inspection Completed",
        description: "Vehicle inspection has been recorded successfully.",
      });

      onInspectionComplete?.(savedInspection);
    } catch (error) {
      console.error('Error submitting inspection:', error);
      toast({
        title: "Error",
        description: "Failed to submit inspection. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveDraft = async () => {
    if (!currentUser) return;

    try {
      const draftData = {
        ...inspectionData,
        vehicle_id: vehicle.id,
        inspector_id: currentUser.email,
        inspection_date: new Date().toISOString(),
        status: 'draft'
      };

      if (existingInspection?.id) {
        await VehicleInspection.update(existingInspection.id, draftData);
      } else {
        await VehicleInspection.create(draftData);
      }

      toast({
        title: "Draft Saved",
        description: "Inspection draft has been saved.",
      });
    } catch (error) {
      console.error('Error saving draft:', error);
      toast({
        title: "Error",
        description: "Failed to save draft.",
        variant: "destructive"
      });
    }
  };

  if (configLoading) {
    return <div className="p-4">Loading inspection form...</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Vehicle Inspection - {vehicle.make} {vehicle.model} ({vehicle.registration_number})
            {existingInspection && (
              <Badge variant={existingInspection.status === 'completed' ? 'default' : 'secondary'}>
                {existingInspection.status}
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6">
            {/* Category Ratings */}
            <div className="space-y-4">
              <h4 className="font-medium text-lg">Inspection Categories</h4>
              {inspectionCategories.map(category => (
                <div key={category.id} className="space-y-3 p-4 border rounded-lg">
                  <h5 className="font-medium">{category.name}</h5>
                  <div className="text-sm text-slate-600 mb-2">
                    Check: {category.points.join(', ')}
                  </div>
                  <div className="grid grid-cols-5 gap-2">
                    {CONDITION_RATINGS.map(rating => (
                      <button
                        key={rating.value}
                        type="button"
                        onClick={() => handleCategoryRating(category.id, rating.value)}
                        className={`p-3 text-sm rounded border transition-all ${
                          inspectionData.category_ratings[category.id] === rating.value
                            ? `border-blue-500 ${rating.bgColor} ${rating.color}`
                            : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex flex-col items-center gap-1">
                          <div className="flex">
                            {[...Array(rating.value)].map((_, i) => (
                              <Star key={i} className="w-3 h-3 fill-current" />
                            ))}
                          </div>
                          <span className="font-medium">{rating.label}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Overall Rating Display */}
            <div className="p-4 bg-blue-50 rounded-lg">
              <Label className="text-sm font-medium text-blue-700">Overall Rating</Label>
              <div className="text-2xl font-bold text-blue-900 mt-1 flex items-center gap-2">
                {calculateOverallRating()}/5
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star 
                      key={i} 
                      className={`w-5 h-5 ${
                        i < calculateOverallRating() 
                          ? 'text-yellow-400 fill-current' 
                          : 'text-slate-300'
                      }`} 
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Defects Section */}
            <div className="space-y-4">
              <h4 className="font-medium text-lg">Identified Defects</h4>
              
              {/* Add New Defect */}
              <div className="p-4 border-2 border-dashed border-slate-200 rounded-lg">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                  <div>
                    <Label>Category</Label>
                    <Select value={newDefect.category} onValueChange={(value) => setNewDefect(prev => ({...prev, category: value}))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {inspectionCategories.map(cat => (
                          <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Severity</Label>
                    <Select value={newDefect.severity} onValueChange={(value) => setNewDefect(prev => ({...prev, severity: value}))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {DEFECT_SEVERITIES.map(severity => (
                          <SelectItem key={severity.value} value={severity.value}>
                            <span className={severity.color}>{severity.label}</span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Estimated Cost (₹)</Label>
                    <Input
                      type="number"
                      value={newDefect.estimated_cost}
                      onChange={(e) => setNewDefect(prev => ({...prev, estimated_cost: e.target.value}))}
                      placeholder="0"
                    />
                  </div>
                  <div className="flex items-end">
                    <Button onClick={addDefect} className="w-full">
                      Add Defect
                    </Button>
                  </div>
                </div>
                <div>
                  <Label>Description</Label>
                  <Textarea
                    value={newDefect.description}
                    onChange={(e) => setNewDefect(prev => ({...prev, description: e.target.value}))}
                    placeholder="Describe the defect in detail..."
                    rows={2}
                  />
                </div>
              </div>

              {/* Existing Defects */}
              {inspectionData.defects.length > 0 && (
                <div className="space-y-2">
                  {inspectionData.defects.map((defect) => (
                    <div key={defect.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary">{defect.category}</Badge>
                          <Badge 
                            variant="secondary" 
                            className={
                              defect.severity === 'critical' ? 'bg-red-100 text-red-700' :
                              defect.severity === 'major' ? 'bg-orange-100 text-orange-700' :
                              defect.severity === 'moderate' ? 'bg-yellow-100 text-yellow-700' :
                              'bg-blue-100 text-blue-700'
                            }
                          >
                            {defect.severity}
                          </Badge>
                          {defect.estimated_cost > 0 && (
                            <span className="text-sm text-slate-600">
                              {formatCurrency(defect.estimated_cost)}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-slate-700 mt-1">{defect.description}</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeDefect(defect.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Additional Refurbishment Cost */}
            <div>
              <Label>Additional Refurbishment Cost (₹)</Label>
              <Input
                type="number"
                value={inspectionData.estimated_refurbishment_cost}
                onChange={(e) => setInspectionData(prev => ({...prev, estimated_refurbishment_cost: e.target.value}))}
                placeholder="0"
              />
              <p className="text-xs text-slate-500 mt-1">
                Any additional costs not covered by specific defects
              </p>
            </div>

            {/* Total Cost Display */}
            <div className="p-4 bg-orange-50 rounded-lg">
              <Label className="text-sm font-medium text-orange-700">Total Estimated Refurbishment Cost</Label>
              <div className="text-xl font-bold text-orange-900 mt-1">
                {formatCurrency(calculateTotalRefurbishmentCost())}
              </div>
            </div>

            {/* Inspector Recommendations */}
            <div>
              <Label>Inspector Recommendations</Label>
              <Textarea
                value={inspectionData.recommendations}
                onChange={(e) => setInspectionData(prev => ({...prev, recommendations: e.target.value}))}
                placeholder="Any recommendations for the vehicle owner..."
                rows={4}
              />
            </div>

            {/* Action Buttons */}
            <div className="flex justify-between items-center pt-4 border-t">
              <Button
                variant="outline"
                onClick={handleSaveDraft}
                disabled={isSubmitting}
              >
                Save Draft
              </Button>
              <Button
                onClick={handleSubmitInspection}
                disabled={isSubmitting || Object.keys(inspectionData.category_ratings).length === 0}
                className="gap-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    Complete Inspection
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}