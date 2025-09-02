import React, { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/components/ui/use-toast';
import { 
  Car, 
  Eye, 
  Edit, 
  MoreHorizontal, 
  Share2, 
  Trash2, 
  Copy,
  Calendar,
  MapPin,
  IndianRupee,
  Clock,
  AlertTriangle,
  CheckCircle2,
  XCircle
} from 'lucide-react';


interface VehicleCardEnhancedProps {
  vehicle: {
    id: string;
    make: string;
    model: string;
    variant?: string;
    year: number;
    registration_number: string;
    vin?: string;
    price?: number;
    asking_price?: number;
    inventory_type: 'public' | 'private' | 'service';
    status: 'active' | 'draft' | 'sold' | 'reserved';
    branch_name?: string;
    created_at: string;
    photos_count?: number;
    documents_count?: number;
    condition_grade?: 'A' | 'B' | 'C' | 'D';
    is_aging?: boolean;
    days_in_inventory?: number;
  };
  isSelected?: boolean;
  onSelect?: (vehicleId: string) => void;
  onEdit?: (vehicleId: string) => void;
  onView?: (vehicleId: string) => void;
  onDelete?: (vehicleId: string) => void;
  onShare?: (vehicleId: string) => void;
  viewMode?: 'grid' | 'list';
}

export default function VehicleCardEnhanced({
  vehicle,
  isSelected = false,
  onSelect,
  onEdit,
  onView,
  onDelete,
  onShare,
  viewMode = 'grid'
}: VehicleCardEnhancedProps) {
  const { toast } = useToast();

  const [isLoading, setIsLoading] = useState(false);


  const price = vehicle.price || vehicle.asking_price || 0;
  const isAging = vehicle.is_aging || (vehicle.days_in_inventory && vehicle.days_in_inventory > 60);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'draft': return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
      case 'sold': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'reserved': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'public': return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200';
      case 'private': return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200';
      case 'service': return 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getConditionColor = (grade: string) => {
    switch (grade) {
      case 'A': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'B': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'C': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      case 'D': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const handleCopyVIN = () => {
    if (vehicle.vin) {
      navigator.clipboard.writeText(vehicle.vin);
      toast({
        title: "VIN Copied",
        description: "Vehicle identification number copied to clipboard",
      });
    }
  };

  const handleCopyReg = () => {
    navigator.clipboard.writeText(vehicle.registration_number);
    toast({
      title: "Registration Copied",
      description: "Registration number copied to clipboard",
    });
  };

  if (viewMode === 'list') {
    return (
      <div className="flex items-center justify-between p-4 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
        <div className="flex items-center gap-4">
          {onSelect && (
            <Checkbox
              checked={isSelected}
              onCheckedChange={() => onSelect(vehicle.id)}
            />
          )}
          
          <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
            <Car className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
          
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-medium text-slate-900 dark:text-white">
                {vehicle.make} {vehicle.model}
                {vehicle.variant && <span className="text-slate-500"> {vehicle.variant}</span>}
              </h3>
              <Badge className={getStatusColor(vehicle.status)}>
                {vehicle.status}
              </Badge>
              <Badge className={getTypeColor(vehicle.inventory_type)}>
                {vehicle.inventory_type}
              </Badge>
              {isAging && (
                <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                  <Clock className="w-3 h-3 mr-1" />
                  Aging
                </Badge>
              )}
            </div>
            
            <div className="flex items-center gap-4 text-sm text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {vehicle.year}
              </span>
              <span className="flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                {vehicle.registration_number}
              </span>
              {vehicle.branch_name && (
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {vehicle.branch_name}
                </span>
              )}
              {vehicle.condition_grade && (
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  Grade {vehicle.condition_grade}
                </span>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="font-medium text-slate-900 dark:text-white">
              ₹{price.toLocaleString()}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {vehicle.photos_count || 0} photos
            </p>
          </div>
          
          <div className="flex items-center gap-1">
            {onView && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onView(vehicle.id)}
                className="h-8 w-8 p-0"
              >
                <Eye className="w-4 h-4" />
              </Button>
            )}
            
            {onEdit && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onEdit(vehicle.id)}
                className="h-8 w-8 p-0"
              >
                <Edit className="w-4 h-4" />
              </Button>
            )}
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {onShare && (
                  <DropdownMenuItem onClick={() => onShare(vehicle.id)}>
                    <Share2 className="w-4 h-4 mr-2" />
                    Share
                  </DropdownMenuItem>
                )}
                
                {vehicle.vin && (
                  <DropdownMenuItem onClick={handleCopyVIN}>
                    <Copy className="w-4 h-4 mr-2" />
                    Copy VIN
                  </DropdownMenuItem>
                )}
                
                <DropdownMenuItem onClick={handleCopyReg}>
                  <Copy className="w-4 h-4 mr-2" />
                  Copy Registration
                </DropdownMenuItem>
                
                {onDelete && (
                  <DropdownMenuItem 
                    onClick={() => onDelete(vehicle.id)}
                    className="text-red-600 dark:text-red-400"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    );
  }

  // Grid view
  return (
    <Card className={`bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:shadow-md transition-all duration-200 ${
      isSelected ? 'ring-2 ring-blue-500' : ''
    }`}>
      <CardHeader className="p-4 pb-2">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            {onSelect && (
              <Checkbox
                checked={isSelected}
                onCheckedChange={() => onSelect(vehicle.id)}
              />
            )}
            
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
              <Car className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {onView && (
                <DropdownMenuItem onClick={() => onView(vehicle.id)}>
                  <Eye className="w-4 h-4 mr-2" />
                  View Details
                </DropdownMenuItem>
              )}
              
              {onEdit && (
                <DropdownMenuItem onClick={() => onEdit(vehicle.id)}>
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </DropdownMenuItem>
              )}
              
              {onShare && (
                <DropdownMenuItem onClick={() => onShare(vehicle.id)}>
                  <Share2 className="w-4 h-4 mr-2" />
                  Share
                </DropdownMenuItem>
              )}
              
              {vehicle.vin && (
                <DropdownMenuItem onClick={handleCopyVIN}>
                  <Copy className="w-4 h-4 mr-2" />
                  Copy VIN
                </DropdownMenuItem>
              )}
              
              <DropdownMenuItem onClick={handleCopyReg}>
                <Copy className="w-4 h-4 mr-2" />
                Copy Registration
              </DropdownMenuItem>
              
              {onDelete && (
                <DropdownMenuItem 
                  onClick={() => onDelete(vehicle.id)}
                  className="text-red-600 dark:text-red-400"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      
      <CardContent className="p-4 pt-0">
        <div className="space-y-3">
          {/* Vehicle Info */}
          <div>
            <h3 className="font-semibold text-slate-900 dark:text-white text-lg">
              {vehicle.make} {vehicle.model}
            </h3>
            {vehicle.variant && (
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {vehicle.variant}
              </p>
            )}
          </div>
          
          {/* Badges */}
          <div className="flex flex-wrap gap-1">
            <Badge className={getStatusColor(vehicle.status)}>
              {vehicle.status}
            </Badge>
            <Badge className={getTypeColor(vehicle.inventory_type)}>
              {vehicle.inventory_type}
            </Badge>
            {vehicle.condition_grade && (
              <Badge className={getConditionColor(vehicle.condition_grade)}>
                Grade {vehicle.condition_grade}
              </Badge>
            )}
            {isAging && (
              <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                <Clock className="w-3 h-3 mr-1" />
                Aging
              </Badge>
            )}
          </div>
          
          {/* Details */}
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-slate-500 dark:text-slate-400">Year</span>
              <span className="font-medium text-slate-900 dark:text-white">
                {vehicle.year}
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-slate-500 dark:text-slate-400">Registration</span>
              <span className="font-medium text-slate-900 dark:text-white font-mono">
                {vehicle.registration_number}
              </span>
            </div>
            
            {vehicle.vin && (
              <div className="flex items-center justify-between">
                <span className="text-slate-500 dark:text-slate-400">VIN</span>
                <span className="font-medium text-slate-900 dark:text-white font-mono text-xs">
                  {vehicle.vin.substring(0, 8)}...
                </span>
              </div>
            )}
            
            {vehicle.branch_name && (
              <div className="flex items-center justify-between">
                <span className="text-slate-500 dark:text-slate-400">Branch</span>
                <span className="font-medium text-slate-900 dark:text-white">
                  {vehicle.branch_name}
                </span>
              </div>
            )}
          </div>
          
          {/* Price */}
          <div className="pt-2 border-t border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-500 dark:text-slate-400">Price</span>
              <span className="text-lg font-bold text-slate-900 dark:text-white">
                ₹{price.toLocaleString()}
              </span>
            </div>
          </div>
          
          {/* Media Count */}
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>{vehicle.photos_count || 0} photos</span>
            <span>{vehicle.documents_count || 0} documents</span>
          </div>
          
          {/* Action Buttons */}
          <div className="flex items-center gap-2 pt-2">
            {onView && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onView(vehicle.id)}
                className="flex-1"
              >
                <Eye className="w-4 h-4 mr-1" />
                View
              </Button>
            )}
            
            {onEdit && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onEdit(vehicle.id)}
                className="flex-1"
              >
                <Edit className="w-4 h-4 mr-1" />
                Edit
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
