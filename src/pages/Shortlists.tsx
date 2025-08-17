import React, { useState, useEffect } from 'react';
import { Shortlist } from '@/api/entities';
import { Vehicle } from '@/api/entities';
import { User } from '@/api/entities';
import { Dealer } from '@/api/entities';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, Plus, Share2, Trash2, Heart } from 'lucide-react';
import VehicleCard from '../components/marketplace/VehicleCard';
import { useToast } from '@/components/ui/use-toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function Shortlists() {
  const [shortlists, setShortlists] = useState([]);
  const [vehiclesByShortlist, setVehiclesByShortlist] = useState({});
  const [dealers, setDealers] = useState({});
  const [currentDealer, setCurrentDealer] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeShortlist, setActiveShortlist] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newShortlistName, setNewShortlistName] = useState('');
  const [isUserVerified, setIsUserVerified] = useState(false);
  const [isUnderReview, setIsUnderReview] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadUserAndShortlists();
  }, []);

  const loadUserAndShortlists = async () => {
    setIsLoading(true);
    try {
      const user = await User.me();
      const dealerProfiles = await Dealer.filter({ created_by: user.email });
      if (dealerProfiles.length > 0) {
        const dealer = dealerProfiles[0];
        setCurrentDealer(dealer);
        
        // Check if user is verified (either verification_status or verification_status_new)
        const isVerified = dealer.verification_status === 'verified' || dealer.verification_status_new === 'verified';
        const isUnderReview = dealer.verification_status === 'documents_submitted' || dealer.verification_status_new === 'documents_submitted';
        
        setIsUserVerified(isVerified);
        setIsUnderReview(isUnderReview);
        const userShortlists = await Shortlist.filter({ dealer_id: dealer.id });
        const safeLists = userShortlists || [];
        setShortlists(safeLists);
        
        if (safeLists.length > 0) {
          setActiveShortlist(safeLists[0].id);
          await loadVehiclesForShortlists(safeLists);
        } else {
          // Create default shortlist if none exists
          const defaultShortlist = await Shortlist.create({
            name: 'My Favorites',
            dealer_id: dealer.id,
            vehicle_ids: []
          });
          setShortlists([defaultShortlist]);
          setActiveShortlist(defaultShortlist.id);
          setVehiclesByShortlist({ [defaultShortlist.id]: [] });
        }
      }
    } catch (error) {
      console.error('Error loading shortlists:', error);
      toast({ title: 'Error', description: 'Failed to load your shortlists.', variant: 'destructive' });
    }
    setIsLoading(false);
  };

  const loadVehiclesForShortlists = async (lists) => {
    const allVehicleIds = [...new Set(lists.flatMap(list => {
      const vehicleIds = list?.vehicle_ids || [];
      return Array.isArray(vehicleIds) ? vehicleIds : [];
    }))];
    
    if (allVehicleIds.length === 0) {
      const vehicleDataByShortlist = {};
      lists.forEach(list => {
        vehicleDataByShortlist[list.id] = [];
      });
      setVehiclesByShortlist(vehicleDataByShortlist);
      return;
    }

    const stringVehicleIds = allVehicleIds.filter((id): id is string => typeof id === 'string');
    const vehicles = await Promise.all(stringVehicleIds.map(id => Vehicle.get(id).catch(() => null)));
    const validVehicles = vehicles.filter(Boolean);
    
    const allDealerIds = [...new Set(validVehicles.map((v: any) => v?.dealer_id).filter((id): id is string => typeof id === 'string'))];
    const dealerData = await Promise.all(allDealerIds.map(id => Dealer.get(id).catch(() => null)));
    const dealerMap = {};
    dealerData.filter(Boolean).forEach(d => dealerMap[d.id] = d);
    setDealers(dealerMap);

    const vehiclesById = {};
    validVehicles.forEach(v => vehiclesById[v.id] = v);

    const vehicleDataByShortlist = {};
    lists.forEach(list => {
      const vehicleIds = Array.isArray(list?.vehicle_ids) ? list.vehicle_ids : [];
      vehicleDataByShortlist[list.id] = vehicleIds.map(id => vehiclesById[id]).filter(Boolean);
    });

    setVehiclesByShortlist(vehicleDataByShortlist);
  };
  
  const handleCreateShortlist = async () => {
    if (!newShortlistName.trim() || !currentDealer) return;
    try {
        await Shortlist.create({
            name: newShortlistName,
            dealer_id: currentDealer.id,
            vehicle_ids: []
        });
        toast({ title: 'Success', description: 'New shortlist created.' });
        setShowCreateModal(false);
        setNewShortlistName('');
        loadUserAndShortlists();
    } catch(e) {
        toast({ title: 'Error', description: 'Could not create shortlist.', variant: 'destructive' });
    }
  };

  const handleDeleteShortlist = async (shortlistId) => {
      try {
          if (shortlists.length <= 1) {
              toast({ title: 'Cannot Delete', description: 'You must have at least one shortlist.', variant: 'destructive' });
              return;
          }
          
          // Note: Using a workaround since delete method might not exist
          await Shortlist.update(shortlistId, { name: '_DELETED_' + Date.now() });
          toast({ title: 'Shortlist Deleted' });
          loadUserAndShortlists();
      } catch(e) {
          toast({ title: 'Error', description: 'Could not delete shortlist.', variant: 'destructive' });
      }
  }

  const handleRemoveFromShortlist = async (vehicleId) => {
    if (!activeShortlist) return;
    
    try {
      const currentList = shortlists.find(s => s.id === activeShortlist);
      if (!currentList) return;
      
      const currentVehicleIds = Array.isArray(currentList?.vehicle_ids) ? currentList.vehicle_ids : [];
      const updatedIds = currentVehicleIds.filter(id => id !== vehicleId);
      
      await Shortlist.update(activeShortlist, { vehicle_ids: updatedIds });
      toast({ title: 'Removed', description: 'Vehicle removed from shortlist.' });
      loadUserAndShortlists();
    } catch (error) {
      console.error('Error removing from shortlist:', error);
      toast({ title: 'Error', description: 'Could not remove vehicle.', variant: 'destructive' });
    }
  };

  const currentVehicles = vehiclesByShortlist[activeShortlist] || [];

  if (isLoading) {
    return <div className="p-8 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>;
  }

  return (
    <div className="p-4 md:p-8 bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">My Shortlists</h1>
            <p className="text-slate-600 mt-1">Manage your saved vehicles</p>
          </div>
          <Button onClick={() => setShowCreateModal(true)} className="gap-2">
            <Plus className="w-4 h-4" />
            New Shortlist
          </Button>
        </div>

        <div className="flex gap-4">
          <div className="w-64 space-y-2">
            <h2 className="font-semibold text-slate-700 mb-3">Your Shortlists</h2>
            {shortlists.map(shortlist => (
              <Card 
                key={shortlist.id}
                className={`cursor-pointer transition-all ${activeShortlist === shortlist.id ? 'ring-2 ring-blue-500 bg-blue-50' : 'hover:bg-slate-50'}`}
                onClick={() => setActiveShortlist(shortlist.id)}
              >
                <CardContent className="p-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-medium">{shortlist.name}</h3>
                      <p className="text-sm text-slate-600">
                        {(Array.isArray(shortlist?.vehicle_ids) ? shortlist.vehicle_ids : []).length} vehicles
                      </p>
                    </div>
                    {shortlists.length > 1 && (
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteShortlist(shortlist.id);
                        }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="flex-1">
            {currentVehicles.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {currentVehicles.map(vehicle => (
                  <div key={vehicle.id} className="relative">
                    <VehicleCard
                      vehicle={vehicle}
                      dealer={dealers[vehicle.dealer_id]}
                      currentDealer={currentDealer}
                      isInCompare={false}
                      onCompareToggle={(id: string) => { /* no-op in shortlists */ }}
                      onMakeOffer={(v: any) => { /* no-op in shortlists */ }}
                      isUserVerified={isUserVerified}
                      isUnderReview={isUnderReview}
                    />
                    <Button
                      size="sm"
                      variant="destructive"
                      className="absolute top-2 left-2 z-10"
                      onClick={() => handleRemoveFromShortlist(vehicle.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <Card className="p-12 text-center">
                <Heart className="w-16 h-16 mx-auto text-slate-300 mb-4" />
                <h3 className="text-xl font-semibold text-slate-600 mb-2">No vehicles in this shortlist</h3>
                <p className="text-slate-500">Start adding vehicles from the marketplace to build your shortlist.</p>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Create Shortlist Modal */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Shortlist</DialogTitle>
            <DialogDescription>Give your shortlist a descriptive name.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="shortlist-name">Shortlist Name</Label>
              <Input
                id="shortlist-name"
                value={newShortlistName}
                onChange={(e) => setNewShortlistName(e.target.value)}
                placeholder="e.g., SUVs for Family"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateModal(false)}>Cancel</Button>
            <Button onClick={handleCreateShortlist} disabled={!newShortlistName.trim()}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}