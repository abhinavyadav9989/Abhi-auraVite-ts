import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Users, 
  Car, 
  Plus, 
  MapPin, 
  Phone, 
  Mail, 
  Building2, 
  Settings,
  Eye,
  Edit,
  Trash2
} from 'lucide-react';

interface TeamMember {
  id: string;
  full_name: string;
  email: string;
  mobile_number: string;
  role: string;
  status: string;
  permissions: any;
}

interface Vehicle {
  id: string;
  make: string;
  model: string;
  year: number;
  registration_number: string;
  status: string;
  asking_price: number;
  hero_image_url?: string;
}

type BranchInfo = {
  id: string;
  name: string;
  address?: string;
  city?: string;
  state?: string;
  contact_number?: string;
  is_default?: boolean;
  vehicle_count?: number;
  team_member_count?: number;
} & Record<string, any>;

interface Branch {
  id: string;
  name: string;
  address: string;
  phone: string;
  email: string;
  is_default: boolean;
  vehicle_count: number;
  team_member_count: number;
}

interface BranchDetailsPanelProps {
  branch: Branch | null;
  teamMembers: TeamMember[];
  vehicles: Vehicle[];
  onAddTeamMember: () => void;
  onAddBranch: () => void;
  onEditBranch: (branchId: string) => void;
  onViewVehicle: (vehicleId: string) => void;
  onEditVehicle: (vehicleId: string) => void;
}

export default function BranchDetailsPanel({
  branch,
  teamMembers,
  vehicles,
  onAddTeamMember,
  onAddBranch,
  onEditBranch,
  onViewVehicle,
  onEditVehicle
}: BranchDetailsPanelProps) {
  const [activeTab, setActiveTab] = useState('overview');

  if (!branch) {
    return (
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="w-full max-w-md bg-white/95 dark:bg-slate-900/90 backdrop-blur-sm rounded-xl shadow-xl border border-blue-200 dark:border-slate-700 p-6"
      >
        <div className="text-center">
          <Building2 className="w-16 h-16 text-gray-300 dark:text-slate-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Select a Branch</h3>
          <p className="text-gray-600 dark:text-slate-300 mb-6">
            Click on a branch location on the globe to view its details, team members, and vehicles.
          </p>
          <Button onClick={onAddBranch} className="w-full">
            <Plus className="w-4 h-4 mr-2" />
            Add New Branch
          </Button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="w-full max-w-md bg-white/95 dark:bg-slate-900/90 backdrop-blur-sm rounded-xl shadow-xl border border-blue-200 dark:border-slate-700 overflow-hidden"
    >
      {/* Branch Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold mb-1">{branch.name}</h2>
            {branch.is_default && (
              <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                Main Branch
              </Badge>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEditBranch(branch.id)}
            className="text-white hover:bg-white/20"
          >
            <Settings className="w-4 h-4" />
          </Button>
        </div>
        
        <div className="space-y-2 text-sm">
          {(branch.address || (branch as any).city || (branch as any).state) && (
            <div className="flex items-center space-x-2">
              <MapPin className="w-4 h-4" />
              <span>
                {branch.address || [(branch as any).city, (branch as any).state].filter(Boolean).join(', ') || '—'}
              </span>
            </div>
          )}
          {((branch as any).contact_number) && (
            <div className="flex items-center space-x-2">
              <Phone className="w-4 h-4" />
              <span>{(branch as any).contact_number}</span>
            </div>
          )}
          {((branch as any).email || (branch as any).contact_email) && (
            <div className="flex items-center space-x-2">
              <Mail className="w-4 h-4" />
              <span>{(branch as any).email || (branch as any).contact_email}</span>
            </div>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="p-6 pb-4">
        <div className="grid grid-cols-2 gap-4 mb-6">
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="bg-blue-50 dark:bg-slate-800 rounded-lg p-4 text-center"
          >
            <Car className="w-6 h-6 text-blue-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-blue-900 dark:text-white">{branch.vehicle_count}</div>
            <div className="text-sm text-blue-600 dark:text-blue-300">Vehicles</div>
          </motion.div>
          
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="bg-indigo-50 dark:bg-slate-800 rounded-lg p-4 text-center"
          >
            <Users className="w-6 h-6 text-indigo-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-indigo-900 dark:text-white">{branch.team_member_count}</div>
            <div className="text-sm text-indigo-600 dark:text-indigo-300">Team Members</div>
          </motion.div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="team">Team</TabsTrigger>
            <TabsTrigger value="vehicles">Vehicles</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-4">
            <div className="space-y-4">
              <Button onClick={onAddTeamMember} className="w-full">
                <Plus className="w-4 h-4 mr-2" />
                Add Team Member
              </Button>
              
              <div className="space-y-3">
                <h4 className="font-semibold text-gray-900 dark:text-white">Recent Activity</h4>
                <div className="space-y-2">
                  <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-slate-800 rounded-lg">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <div className="flex-1">
                      <div className="text-sm font-medium dark:text-white">New vehicle added</div>
                      <div className="text-xs text-gray-500 dark:text-slate-400">2 hours ago</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-slate-800 rounded-lg">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <div className="flex-1">
                      <div className="text-sm font-medium dark:text-white">Team member assigned</div>
                      <div className="text-xs text-gray-500 dark:text-slate-400">1 day ago</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="team" className="mt-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold text-gray-900 dark:text-white">Team Members</h4>
                <Button size="sm" onClick={onAddTeamMember}>
                  <Plus className="w-4 h-4 mr-1" />
                  Add
                </Button>
              </div>
              
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {teamMembers.map((member) => (
                  <motion.div
                    key={member.id}
                    whileHover={{ scale: 1.02 }}
                    className="p-3 bg-gray-50 dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white">{member.full_name}</div>
                        <div className="text-sm text-gray-600 dark:text-slate-300">{member.email}</div>
                        <div className="flex items-center space-x-2 mt-1">
                          <Badge variant={member.status === 'active' ? 'default' : 'secondary'}>
                            {member.role}
                          </Badge>
                          <Badge variant={member.status === 'active' ? 'default' : 'outline'}>
                            {member.status}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex space-x-1">
                        <Button size="sm" variant="ghost">
                          <Edit className="w-3 h-3" />
                        </Button>
                        <Button size="sm" variant="ghost" className="text-red-600">
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="vehicles" className="mt-4">
            <div className="space-y-4">
              <h4 className="font-semibold text-gray-900 dark:text-white">Vehicles</h4>
              
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {vehicles.map((vehicle) => (
                  <motion.div
                    key={vehicle.id}
                    whileHover={{ scale: 1.02 }}
                    className="p-3 bg-gray-50 dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700"
                  >
                    <div className="flex items-center space-x-3">
                      {vehicle.hero_image_url ? (
                        <img 
                          src={vehicle.hero_image_url} 
                          alt={vehicle.make}
                          className="w-12 h-12 rounded-lg object-cover"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-gray-200 dark:bg-slate-700 rounded-lg flex items-center justify-center">
                          <Car className="w-6 h-6 text-gray-400" />
                        </div>
                      )}
                      
                      <div className="flex-1">
                        <div className="font-medium text-gray-900 dark:text-white">
                          {vehicle.year} {vehicle.make} {vehicle.model}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-slate-300">
                          {vehicle.registration_number}
                        </div>
                        <div className="flex items-center space-x-2 mt-1">
                          <Badge variant={vehicle.status === 'live' ? 'default' : 'secondary'}>
                            {vehicle.status}
                          </Badge>
                          <span className="text-sm font-medium text-green-600">
                            ₹{(vehicle.asking_price / 100000).toFixed(1)}L
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex space-x-1">
                        <Button size="sm" variant="ghost" onClick={() => onViewVehicle(vehicle.id)}>
                          <Eye className="w-3 h-3" />
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => onEditVehicle(vehicle.id)}>
                          <Edit className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </motion.div>
  );
}
