import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Vehicle } from '@/api/entities';
import { useToast } from '@/components/ui/use-toast';
import { Loader2 } from 'lucide-react';

const INVENTORY_TYPES = [
  { value: 'public', label: 'Public - Visible in Marketplace' },
  { value: 'private', label: 'Private - For internal use only' },
  { value: 'service', label: 'Service - For workshop tracking' },
  { value: 'specialised', label: 'Specialised - For heavy equipment' },
];

type InventoryTypeSwitcherProps = {
  vehicles: any[];
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function InventoryTypeSwitcher({ vehicles, isOpen, onClose, onSuccess }: InventoryTypeSwitcherProps) {
  const [targetType, setTargetType] = useState('public');
  const [isUpdating, setIsUpdating] = useState(false);
  const { toast } = useToast();

  const handleUpdate = async () => {
    setIsUpdating(true);
    try {
      const updates = vehicles.map(v => Vehicle.update(v.id, { inventory_type: targetType }));
      await Promise.all(updates);

      toast({
        title: 'Update Successful',
        description: `${vehicles.length} vehicle(s) moved to "${targetType}" inventory.`,
      });
      onSuccess();
    } catch (error) {
      console.error('Failed to update inventory types:', error);
      toast({
        title: 'Update Failed',
        description: 'An error occurred while updating the vehicles. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsUpdating(false);
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Change Inventory Type</DialogTitle>
          <DialogDescription>
            Move {vehicles.length} selected vehicle(s) to a different inventory type. This will affect their visibility in the marketplace.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <Label htmlFor="inventory-type-select">New Inventory Type</Label>
          <Select value={targetType} onValueChange={(v) => setTargetType(v)}>
            <SelectTrigger id="inventory-type-select">
              <SelectValue placeholder="Select a type" />
            </SelectTrigger>
            <SelectContent>
              {INVENTORY_TYPES.map(type => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isUpdating}>
            Cancel
          </Button>
          <Button onClick={handleUpdate} disabled={isUpdating}>
            {isUpdating ? (
              <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Updating...</>
            ) : (
              'Confirm Change'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}