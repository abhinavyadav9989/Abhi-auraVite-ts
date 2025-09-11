import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Users, Car, Building2, Plus, Star } from 'lucide-react';

interface Branch {
  id: string;
  name: string;
  latitude?: number;
  longitude?: number;
  city?: string;
  state?: string;
  address?: string;
  contact_number?: string;
  vehicle_count: number;
  team_member_count: number;
  is_default?: boolean;
}

interface GlobeViewProps {
  branches: Branch[];
  selectedBranch: Branch | null;
  onBranchSelect: (branch: Branch) => void;
  onAddBranch: () => void;
  onSetDefaultBranch?: (branchId: string) => void;
}

export default function GlobeView({ branches, selectedBranch, onBranchSelect, onAddBranch, onSetDefaultBranch }: GlobeViewProps) {
  const [hoveredBranch, setHoveredBranch] = useState<string | null>(null);

  return (
    <div className="relative w-full h-[600px] bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-950 dark:to-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 overflow-hidden">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-10 bg-white/80 dark:bg-slate-900/70 backdrop-blur-sm border-b border-gray-200 dark:border-slate-800 p-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Branch Locations</h3>
            <p className="text-sm text-gray-600 dark:text-slate-300">{branches.length} branch{branches.length !== 1 ? 'es' : ''} found</p>
          </div>
          <button
            onClick={onAddBranch}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add Branch</span>
          </button>
        </div>
      </div>

      {/* Map Container */}
      <div className="absolute inset-0 pt-20 p-6">
        {branches.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <Building2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Branches Yet</h3>
              <p className="text-gray-600 mb-6">Add your first branch to get started</p>
              <button
                onClick={onAddBranch}
                className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors mx-auto"
              >
                <Plus className="w-4 h-4" />
                <span>Add First Branch</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(360px,1fr))] gap-5 h-full overflow-y-auto">
            {branches.map((branch) => {
              const isSelected = selectedBranch?.id === branch.id;
              const isHovered = hoveredBranch === branch.id;
              
              return (
                <motion.div
                  key={branch.id}
                  className={`relative p-4 rounded-xl border cursor-pointer transition-all duration-200 min-w-[360px] ${
                    isSelected
                      ? 'border-blue-400/60 bg-white/70 backdrop-blur-md shadow-lg ring-1 ring-blue-300/50'
                      : 'border-white/40 bg-white/40 backdrop-blur-md hover:border-blue-300/60 hover:ring-1 hover:ring-blue-200/60 hover:shadow-md'
                  }`}
                  onClick={() => onBranchSelect(branch)}
                  onMouseEnter={() => setHoveredBranch(branch.id)}
                  onMouseLeave={() => setHoveredBranch(null)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {/* Branch Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <MapPin className={`w-4 h-4 ${isSelected ? 'text-blue-600' : 'text-gray-400'}`} />
                        <h4 className="font-semibold text-gray-900">{branch.name}</h4>
                        {branch.is_default && (
                          <span className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded-full">
                            Main
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600">
                        {branch.city && branch.state 
                          ? `${branch.city}, ${branch.state}`
                          : branch.latitude && branch.longitude 
                            ? `${branch.latitude.toFixed(4)}, ${branch.longitude.toFixed(4)}`
                            : 'Location not set'
                        }
                      </p>
                    </div>
                    {/* Set as Main Branch */}
                    {onSetDefaultBranch && (
                      <button
                        type="button"
                        title={branch.is_default ? 'Main branch' : 'Set as main branch'}
                        onClick={(e) => { e.stopPropagation(); onSetDefaultBranch(branch.id); }}
                        className={`p-1.5 rounded-md border transition-colors ${
                          branch.is_default
                            ? 'bg-yellow-100 border-yellow-300'
                            : 'bg-white border-gray-200 hover:bg-gray-50'
                        }`}
                      >
                        <Star className={`${branch.is_default ? 'text-yellow-500 fill-yellow-400' : 'text-gray-400'}`} size={16} />
                      </button>
                    )}
                  </div>

                  {/* Branch Stats */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className={`p-3 rounded-lg text-center transition-colors ${
                      isSelected ? 'bg-blue-50/80' : 'bg-white/50'
                    }`}>
                      <div className="flex items-center justify-center space-x-1 mb-1">
                        <Car className={`w-4 h-4 ${isSelected ? 'text-blue-600' : 'text-gray-500'}`} />
                        <span className="text-lg font-bold text-gray-900">{branch.vehicle_count}</span>
                      </div>
                      <span className="text-xs text-gray-600">Vehicles</span>
                    </div>
                    
                    <div className={`p-3 rounded-lg text-center transition-colors ${
                      isSelected ? 'bg-blue-50/80' : 'bg-white/50'
                    }`}>
                      <div className="flex items-center justify-center space-x-1 mb-1">
                        <Users className={`w-4 h-4 ${isSelected ? 'text-blue-600' : 'text-gray-500'}`} />
                        <span className="text-lg font-bold text-gray-900">{branch.team_member_count}</span>
                      </div>
                      <span className="text-xs text-gray-600">Team</span>
                    </div>
                  </div>

                  {/* Selection Indicator */}
                  {isSelected && (
                    <motion.div
                      className="absolute top-2 right-2 w-3 h-3 bg-blue-500 rounded-full"
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                  )}

                  {/* Hover Effect */}
                  <AnimatePresence>
                    {isHovered && !isSelected && (
                      <motion.div
                        className="absolute inset-0 bg-blue-500/5 rounded-xl border-2 border-blue-300"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                      />
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="absolute bottom-0 left-0 right-0 bg-white/80 backdrop-blur-sm border-t border-gray-200 p-3">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>Click on a branch to view details</span>
          <span>{branches.length} total branches</span>
        </div>
      </div>
    </div>
  );
}
