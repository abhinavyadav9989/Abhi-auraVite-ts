import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { Building2, MapPin, Phone, Mail, Clock, CheckCircle2, ArrowRight } from 'lucide-react';
import { Dealer } from '@/api/entities';

export default function BranchFirst() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    contact_number: '',
    email: '',
    business_hours: '',
    brands_handled: '',
    is_default: true
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // Create branch logic here
      const { data, error } = await Dealer.createBranch(formData);
      
      if (error) throw error;
      
      toast({
        title: "Branch Created!",
        description: "Your first branch has been set up successfully.",
      });
      
      // Redirect back to inventory or original intent
      const returnTo = searchParams.get('returnTo') || '/inventory';
      navigate(returnTo);
      
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create branch. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-black dark:to-slate-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
            <Building2 className="w-8 h-8 text-blue-600 dark:text-blue-400" />
          </div>
          <CardTitle className="text-2xl font-bold text-slate-900 dark:text-white">
            Set Up Your First Branch
          </CardTitle>
          <p className="text-slate-600 dark:text-slate-400">
            Before you can add vehicles, you need to create your first branch. 
            This helps organize your inventory and manage your business locations.
          </p>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                <Building2 className="w-5 h-5" />
                Branch Information
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Branch Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g., Main Showroom"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="contact_number">Contact Number *</Label>
                  <Input
                    id="contact_number"
                    value={formData.contact_number}
                    onChange={(e) => setFormData(prev => ({ ...prev, contact_number: e.target.value }))}
                    placeholder="+91 98765 43210"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Address */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                Address
              </h3>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="address">Full Address *</Label>
                  <Textarea
                    id="address"
                    value={formData.address}
                    onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                    placeholder="Enter complete address"
                    required
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city">City *</Label>
                    <Input
                      id="city"
                      value={formData.city}
                      onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                      placeholder="Mumbai"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="state">State *</Label>
                    <Input
                      id="state"
                      value={formData.state}
                      onChange={(e) => setFormData(prev => ({ ...prev, state: e.target.value }))}
                      placeholder="Maharashtra"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="pincode">Pincode *</Label>
                    <Input
                      id="pincode"
                      value={formData.pincode}
                      onChange={(e) => setFormData(prev => ({ ...prev, pincode: e.target.value }))}
                      placeholder="400001"
                      required
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Business Details */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Business Details
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="business_hours">Business Hours</Label>
                  <Input
                    id="business_hours"
                    value={formData.business_hours}
                    onChange={(e) => setFormData(prev => ({ ...prev, business_hours: e.target.value }))}
                    placeholder="9:00 AM - 7:00 PM"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="brands_handled">Brands Handled</Label>
                  <Input
                    id="brands_handled"
                    value={formData.brands_handled}
                    onChange={(e) => setFormData(prev => ({ ...prev, brands_handled: e.target.value }))}
                    placeholder="Maruti, Hyundai, Honda"
                  />
                </div>
              </div>
            </div>

            {/* Default Branch Toggle */}
            <div className="flex items-center space-x-2 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <CheckCircle2 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <div>
                <p className="text-sm font-medium text-slate-900 dark:text-white">
                  Set as Default Branch
                </p>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  This branch will be selected by default when adding vehicles
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-6">
              <Button
                type="submit"
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Creating Branch...
                  </>
                ) : (
                  <>
                    Create Branch
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
