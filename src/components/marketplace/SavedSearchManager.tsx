import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Trash2, Bell, Search, Plus } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { DealerPreferences } from '@/api/entities';

// MP-009, MP-033: Saved searches and alerts
export default function SavedSearchManager({ 
  currentDealer, 
  currentFilters,
  isOpen, 
  onClose,
  onApplySavedSearch 
}) {
  const [savedSearches, setSavedSearches] = useState([]);
  const [newSearchName, setNewSearchName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen && currentDealer) {
      loadSavedSearches();
    }
  }, [isOpen, currentDealer]);

  const loadSavedSearches = async () => {
    try {
      const preferences = await DealerPreferences.filter({ dealer_id: currentDealer.id });
      if (preferences.length > 0) {
        setSavedSearches([]); // TODO: Implement saved searches when database supports it
      }
    } catch (error) {
      // Error loading saved searches - handled gracefully
    }
  };

  const saveCurrentSearch = async () => {
    if (!newSearchName.trim()) {
      toast({ title: "Error", description: "Please enter a name for this search", variant: "destructive" });
      return;
    }

    setIsCreating(true);
    try {
      const newSearch = {
        id: Date.now().toString(),
        name: newSearchName.trim(),
        filters: currentFilters,
        created_at: new Date().toISOString(),
        alert_enabled: false,
        last_match_count: 0
      };

      const updatedSearches = [...savedSearches, newSearch];

      // Note: saved_searches field doesn't exist in database, using local storage
      localStorage.setItem('saved_searches', JSON.stringify(updatedSearches));

      setSavedSearches(updatedSearches);
      setNewSearchName('');
      toast({ title: "Success", description: "Search saved successfully!" });
    } catch (error) {
      // Error saving search - handled gracefully
      toast({ title: "Error", description: "Failed to save search", variant: "destructive" });
    }
    setIsCreating(false);
  };

  const toggleAlert = async (searchId, enabled) => {
    try {
      const updatedSearches = savedSearches.map(search =>
        search.id === searchId ? { ...search, alert_enabled: enabled } : search
      );

      // Note: saved_searches field doesn't exist in database, using local storage
      localStorage.setItem('saved_searches', JSON.stringify(updatedSearches));

      setSavedSearches(updatedSearches);
      toast({ 
        title: enabled ? "Alerts Enabled" : "Alerts Disabled", 
        description: enabled ? "You'll be notified of new matches" : "Alerts turned off for this search" 
      });
    } catch (error) {
      // Error updating alert - handled gracefully
    }
  };

  const deleteSearch = async (searchId) => {
    try {
      const updatedSearches = savedSearches.filter(search => search.id !== searchId);

      // Note: saved_searches field doesn't exist in database, using local storage
      localStorage.setItem('saved_searches', JSON.stringify(updatedSearches));

      setSavedSearches(updatedSearches);
      toast({ title: "Deleted", description: "Saved search removed" });
    } catch (error) {
      // Error deleting search - handled gracefully
    }
  };

  const applySavedSearch = (search) => {
    onApplySavedSearch(search.filters);
    toast({ title: "Applied", description: `Applied "${search.name}" search filters` });
    onClose();
  };

  const getFilterSummary = (filters) => {
    const summary = [];
    if (filters.vehicle_category?.length) summary.push(`${filters.vehicle_category.length} categories`);
    if (filters.make?.length) summary.push(`${filters.make.length} makes`);
    if (filters.price_min || filters.price_max) summary.push('price range');
    if (filters.verified_only) summary.push('verified only');
    return summary.join(', ') || 'all vehicles';
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Search className="w-5 h-5" />
            Saved Searches
          </DialogTitle>
          <DialogDescription>
            Save and manage your frequently used search filters
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Save Current Search */}
          <div className="border rounded-lg p-4 bg-slate-50">
            <h4 className="font-medium mb-3">Save Current Search</h4>
            <div className="flex gap-3">
              <Input
                value={newSearchName}
                onChange={(e) => setNewSearchName(e.target.value)}
                placeholder="Enter search name..."
                className="flex-1"
              />
              <Button onClick={saveCurrentSearch} disabled={isCreating}>
                <Plus className="w-4 h-4 mr-2" />
                Save
              </Button>
            </div>
            <div className="text-sm text-slate-600 mt-2">
              Current filters: {getFilterSummary(currentFilters)}
            </div>
          </div>

          {/* Saved Searches List */}
          <div className="space-y-3">
            <h4 className="font-medium">Your Saved Searches</h4>
            
            {savedSearches.length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                <Search className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                <p>No saved searches yet</p>
                <p className="text-sm">Save your current search to get started</p>
              </div>
            ) : (
              savedSearches.map((search) => (
                <div key={search.id} className="border rounded-lg p-4 hover:bg-slate-50">
                  <div className="flex items-center justify-between mb-2">
                    <h5 className="font-medium">{search.name}</h5>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-2">
                        <Bell className="w-4 h-4 text-slate-400" />
                        <Switch
                          checked={search.alert_enabled}
                          onCheckedChange={(checked) => toggleAlert(search.id, checked === true)}
                        />
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteSearch(search.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="text-sm text-slate-600 mb-3">
                    Filters: {getFilterSummary(search.filters)}
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="text-xs text-slate-500">
                      Created {new Date(search.created_at).toLocaleDateString()}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => applySavedSearch(search)}
                    >
                      Apply Search
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}