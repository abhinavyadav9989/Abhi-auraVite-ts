import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
// Note: Using standard radio inputs instead of RadioGroup for compatibility
import { Label } from '@/components/ui/label';
import { MapPin, Plus, Building2, Clock, ArrowRight, ArrowLeft } from 'lucide-react';
import { Dealer } from '@/api/entities';
import { useToast } from '@/components/ui/use-toast';
import BranchSetupModal from '@/components/modals/BranchSetupModal';
import { supabase } from '@/api/supabaseClient';

interface BranchSelectionStepProps {
  selectedBranch: string | null;
  onBranchSelect: (branchId: string) => void;
  onNext: () => void;
  onBack: () => void;
  dealer: any;
  onDealerUpdate: () => void;
}

interface Branch {
  id: string;
  name: string;
  city: string;
  state: string;
  address: string;
  is_default: boolean;
  is_active: boolean;
}

export default function BranchSelectionStep({
  selectedBranch,
  onBranchSelect,
  onNext,
  onBack,
  dealer,
  onDealerUpdate
}: BranchSelectionStepProps) {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showBranchModal, setShowBranchModal] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadBranches();
  }, [dealer]);

  const loadBranches = async () => {
    if (!dealer?.id) return;
    
    setIsLoading(true);
    try {
      console.log('BranchSelectionStep - Loading real branches for dealer:', dealer.id);
      
      // Load real branches from database (like in BranchesSection)
      const { data, error } = await supabase
        .from('branches')
        .select('*')
        .eq('dealer_id', dealer.id)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error loading branches:', error);
        toast({
          title: "Error",
          description: "Failed to load branches",
          variant: "destructive"
        });
        setBranches([]);
      } else {
        console.log('BranchSelectionStep - Loaded branches:', data);
        // Map database branches to our interface
        const mappedBranches: Branch[] = (data || []).map(branch => ({
          id: branch.id,
          name: branch.name,
          city: branch.city,
          state: branch.state,
          address: branch.address,
          is_default: branch.is_default,
          is_active: true // Assume active since there's no active field in schema
        }));
        setBranches(mappedBranches);
      }
    } catch (error) {
      console.error('Error loading branches:', error);
      toast({
        title: "Error",
        description: "Failed to load branches",
        variant: "destructive"
      });
      setBranches([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBranchAdded = async () => {
    setShowBranchModal(false);
    await onDealerUpdate(); // Refresh dealer data
    await loadBranches(); // Reload branches
    toast({
      title: "Branch Added",
      description: "Your branch has been added successfully!",
      variant: "default"
    });
  };

  const handleContinue = () => {
    if (!selectedBranch) {
      toast({
        title: "Select Branch",
        description: "Please select a branch to continue",
        variant: "destructive"
      });
      return;
    }
    onNext();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading branches...</p>
        </div>
      </div>
    );
  }

  // No branches scenario
  if (branches.length === 0) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card className="border-0 shadow-lg">
          <CardHeader className="text-center pb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Building2 className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-2xl text-gray-900">Branch Required</CardTitle>
            <p className="text-gray-600 mt-2">
              To add vehicles, you need at least one branch location
            </p>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6">
              <h3 className="font-semibold text-gray-900 mb-3">Benefits of adding a branch:</h3>
              <ul className="space-y-2">
                <li className="flex items-center gap-3">
                  <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs">✓</span>
                  </div>
                  <span className="text-gray-700">Organize inventory by location</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs">✓</span>
                  </div>
                  <span className="text-gray-700">Location-based search for customers</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs">✓</span>
                  </div>
                  <span className="text-gray-700">Better customer experience</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs">✓</span>
                  </div>
                  <span className="text-gray-700">Professional business presence</span>
                </li>
              </ul>
            </div>

            <div className="flex gap-3">
              <Button 
                variant="outline" 
                onClick={onBack}
                className="flex-1"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
              <Button 
                onClick={() => setShowBranchModal(true)}
                className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Your First Branch
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Branch Setup Modal */}
        {showBranchModal && (
          <BranchSetupModal
            isOpen={showBranchModal}
            onClose={() => setShowBranchModal(false)}
            dealerId={dealer?.id}
            onBranchAdded={handleBranchAdded}
          />
        )}
      </div>
    );
  }

  // Has branches scenario
  return (
    <div className="max-w-2xl mx-auto">
      <Card className="border-0 shadow-lg">
        <CardHeader className="text-center pb-6">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <MapPin className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-2xl text-gray-900">Select Branch Location</CardTitle>
          <p className="text-gray-600 mt-2">
            Choose which branch to add this vehicle to
          </p>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="space-y-3">
            {branches.map((branch) => (
              <div key={branch.id} className="relative">
                <Label 
                  htmlFor={`branch-${branch.id}`}
                  className={`flex items-center space-x-3 p-4 border-2 rounded-xl cursor-pointer transition-colors ${
                    selectedBranch === branch.id 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-200 hover:border-blue-300'
                  }`}
                >
                  <input
                    type="radio"
                    id={`branch-${branch.id}`}
                    name="branch"
                    value={branch.id}
                    checked={selectedBranch === branch.id}
                    onChange={() => onBranchSelect(branch.id)}
                    className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-gray-900">{branch.name}</span>
                      {branch.is_default && (
                        <Badge variant="secondary" className="text-xs">Default</Badge>
                      )}
                      {!branch.is_active && (
                        <Badge variant="destructive" className="text-xs">Inactive</Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <MapPin className="w-4 h-4" />
                      <span>{branch.city}, {branch.state}</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{branch.address}</p>
                  </div>
                </Label>
              </div>
            ))}
          </div>

          <div className="border-t pt-4">
            <Button 
              variant="outline" 
              onClick={() => setShowBranchModal(true)}
              className="w-full"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add New Branch
            </Button>
          </div>

          <div className="flex gap-3 pt-4">
            <Button 
              variant="outline" 
              onClick={onBack}
              className="flex-1"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <Button 
              onClick={handleContinue}
              disabled={!selectedBranch}
              className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
            >
              Continue
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Branch Setup Modal */}
      {showBranchModal && (
        <BranchSetupModal
          isOpen={showBranchModal}
          onClose={() => setShowBranchModal(false)}
          dealerId={dealer?.id}
          onBranchAdded={handleBranchAdded}
        />
      )}
    </div>
  );
}
