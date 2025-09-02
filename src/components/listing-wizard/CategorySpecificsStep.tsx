import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Zap, Battery, Gauge, Zap as ChargingIcon, Cable } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

export interface EVFields {
  battery_capacity_kwh: number;
  range_km: number;
  charging_ac_kw: number;
  charging_dc_kw: number;
  connector_type: 'CCS2' | 'CHAdeMO' | 'Type2' | 'TeslaSC';
  motor_power_kw: number;
  motor_torque_nm: number;
  top_speed_kmh: number;
  acceleration_0_100: number;
  regenerative_braking: boolean;
  battery_warranty_years: number;
  battery_warranty_km: number;
  charging_time_ac: string; // e.g., "6-8 hours"
  charging_time_dc: string; // e.g., "30-45 minutes"
}

export interface BikeFields {
  engine_cc: number;
  cooling_system: 'Air' | 'Liquid' | 'Oil';
  abs_available: boolean;
  seat_height_mm: number;
  ground_clearance_mm: number;
  fuel_tank_capacity_liters: number;
  kerb_weight_kg: number;
  max_power_bhp: number;
  max_torque_nm: number;
  mileage_city_kmpl: number;
  mileage_highway_kmpl: number;
}

export interface CommercialFields {
  gvw_kg: number;
  wheelbase_mm: number;
  cargo_volume_liters: number;
  emission_norm: 'BS3' | 'BS4' | 'BS6' | 'BS6.2';
  payload_capacity_kg: number;
  axle_configuration: string; // e.g., "4x2", "6x2", "6x4"
  cabin_type: 'Day' | 'Sleeper' | 'Crew' | 'High Roof';
  fuel_tank_capacity_liters: number;
  gradeability_percent: number;
  turning_radius_m: number;
  max_speed_kmh: number;
}

interface CategorySpecificsStepProps {
  vehicleType: 'new' | 'used';
  category: string; // 'EV', 'Bike', 'Commercial', etc.
  data: EVFields | BikeFields | CommercialFields | null;
  onChange: (data: EVFields | BikeFields | CommercialFields) => void;
  onNext?: () => void;
  onPrevious?: () => void;
}

const EV_CONNECTOR_TYPES = [
  { value: 'CCS2', label: 'CCS2 (Combined Charging System)', description: 'Most common in Europe/India' },
  { value: 'CHAdeMO', label: 'CHAdeMO', description: 'Japanese standard, fast charging' },
  { value: 'Type2', label: 'Type 2 (Mennekes)', description: 'European AC charging' },
  { value: 'TeslaSC', label: 'Tesla Supercharger', description: 'Tesla proprietary' }
];

const COOLING_SYSTEMS = [
  { value: 'Air', label: 'Air Cooled', description: 'Natural air cooling' },
  { value: 'Liquid', label: 'Liquid Cooled', description: 'Water/liquid cooling system' },
  { value: 'Oil', label: 'Oil Cooled', description: 'Oil cooling system' }
];

const EMISSION_NORMS = [
  { value: 'BS3', label: 'BS3', description: 'Bharat Stage 3 (2005)' },
  { value: 'BS4', label: 'BS4', description: 'Bharat Stage 4 (2017)' },
  { value: 'BS6', label: 'BS6', description: 'Bharat Stage 6 (2020)' },
  { value: 'BS6.2', label: 'BS6.2', description: 'Bharat Stage 6 Phase 2 (2023)' }
];

const CABIN_TYPES = [
  { value: 'Day', label: 'Day Cabin', description: 'Basic cabin for day operations' },
  { value: 'Sleeper', label: 'Sleeper Cabin', description: 'With sleeping berth' },
  { value: 'Crew', label: 'Crew Cabin', description: 'Multi-passenger cabin' },
  { value: 'High Roof', label: 'High Roof', description: 'Extended height cabin' }
];

export default function CategorySpecificsStep({
  vehicleType,
  category,
  data,
  onChange,
  onNext,
  onPrevious
}: CategorySpecificsStepProps) {
  const { toast } = useToast();

  // Initialize data based on category
  const [evData, setEvData] = useState<EVFields>({
    battery_capacity_kwh: 0,
    range_km: 0,
    charging_ac_kw: 0,
    charging_dc_kw: 0,
    connector_type: 'CCS2',
    motor_power_kw: 0,
    motor_torque_nm: 0,
    top_speed_kmh: 0,
    acceleration_0_100: 0,
    regenerative_braking: true,
    battery_warranty_years: 0,
    battery_warranty_km: 0,
    charging_time_ac: '',
    charging_time_dc: ''
  });

  const [bikeData, setBikeData] = useState<BikeFields>({
    engine_cc: 0,
    cooling_system: 'Air',
    abs_available: false,
    seat_height_mm: 0,
    ground_clearance_mm: 0,
    fuel_tank_capacity_liters: 0,
    kerb_weight_kg: 0,
    max_power_bhp: 0,
    max_torque_nm: 0,
    mileage_city_kmpl: 0,
    mileage_highway_kmpl: 0
  });

  const [commercialData, setCommercialData] = useState<CommercialFields>({
    gvw_kg: 0,
    wheelbase_mm: 0,
    cargo_volume_liters: 0,
    emission_norm: 'BS6',
    payload_capacity_kg: 0,
    axle_configuration: '',
    cabin_type: 'Day',
    fuel_tank_capacity_liters: 0,
    gradeability_percent: 0,
    turning_radius_m: 0,
    max_speed_kmh: 0
  });

  // Load existing data
  useEffect(() => {
    if (data) {
      if (category === 'EV') {
        setEvData(data as EVFields);
      } else if (category === 'Bike') {
        setBikeData(data as BikeFields);
      } else if (category === 'Commercial') {
        setCommercialData(data as CommercialFields);
      }
    }
  }, [data, category]);

  // Update parent when data changes
  useEffect(() => {
    if (category === 'EV') {
      onChange(evData);
    } else if (category === 'Bike') {
      onChange(bikeData);
    } else if (category === 'Commercial') {
      onChange(commercialData);
    }
  }, [evData, bikeData, commercialData, category, onChange]);

  const updateEvData = (updates: Partial<EVFields>) => {
    setEvData(prev => ({ ...prev, ...updates }));
  };

  const updateBikeData = (updates: Partial<BikeFields>) => {
    setBikeData(prev => ({ ...prev, ...updates }));
  };

  const updateCommercialData = (updates: Partial<CommercialFields>) => {
    setCommercialData(prev => ({ ...prev, ...updates }));
  };

  const validateEVData = (): boolean => {
    if (evData.battery_capacity_kwh <= 0) {
      toast({ title: "Error", description: "Battery capacity must be greater than 0", variant: "destructive" });
      return false;
    }
    if (evData.range_km <= 0) {
      toast({ title: "Error", description: "Range must be greater than 0", variant: "destructive" });
      return false;
    }
    return true;
  };

  const validateBikeData = (): boolean => {
    if (bikeData.engine_cc <= 0) {
      toast({ title: "Error", description: "Engine CC must be greater than 0", variant: "destructive" });
      return false;
    }
    return true;
  };

  const validateCommercialData = (): boolean => {
    if (commercialData.gvw_kg <= 0) {
      toast({ title: "Error", description: "GVW must be greater than 0", variant: "destructive" });
      return false;
    }
    return true;
  };

  const handleNext = () => {
    let isValid = false;

    if (category === 'EV') {
      isValid = validateEVData();
    } else if (category === 'Bike') {
      isValid = validateBikeData();
    } else if (category === 'Commercial') {
      isValid = validateCommercialData();
    } else {
      isValid = true; // No specific validation for other categories
    }

    if (isValid && onNext) {
      onNext();
    }
  };

  if (category === 'EV') {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Battery className="w-5 h-5 text-blue-600" />
            Electric Vehicle Specifications
            <Badge variant="secondary" className="bg-blue-100 text-blue-800">
              EV
            </Badge>
          </CardTitle>
          <p className="text-sm text-slate-600">
            Add specific details for this electric vehicle
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Battery & Range */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="battery_capacity">Battery Capacity (kWh)</Label>
              <Input
                id="battery_capacity"
                type="number"
                placeholder="e.g., 40.5"
                value={evData.battery_capacity_kwh || ''}
                onChange={(e) => updateEvData({ battery_capacity_kwh: parseFloat(e.target.value) || 0 })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="range">Range (km)</Label>
              <Input
                id="range"
                type="number"
                placeholder="e.g., 350"
                value={evData.range_km || ''}
                onChange={(e) => updateEvData({ range_km: parseFloat(e.target.value) || 0 })}
              />
            </div>
          </div>

          {/* Charging Specifications */}
          <div className="space-y-4">
            <h4 className="font-medium text-slate-900 flex items-center gap-2">
              <ChargingIcon className="w-4 h-4" />
              Charging Specifications
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="charging_ac">AC Charging (kW)</Label>
                <Input
                  id="charging_ac"
                  type="number"
                  placeholder="e.g., 7.4"
                  value={evData.charging_ac_kw || ''}
                  onChange={(e) => updateEvData({ charging_ac_kw: parseFloat(e.target.value) || 0 })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="charging_dc">DC Fast Charging (kW)</Label>
          <Input
                  id="charging_dc"
            type="number"
                  placeholder="e.g., 50"
                  value={evData.charging_dc_kw || ''}
                  onChange={(e) => updateEvData({ charging_dc_kw: parseFloat(e.target.value) || 0 })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="connector_type">Charging Connector Type</Label>
              <Select
                value={evData.connector_type}
                onValueChange={(value: EVFields['connector_type']) => updateEvData({ connector_type: value })}
              >
                <SelectTrigger>
                  <SelectValue />
            </SelectTrigger>
            <SelectContent>
                  {EV_CONNECTOR_TYPES.map((connector) => (
                    <SelectItem key={connector.value} value={connector.value}>
                      <div>
                        <div className="font-medium">{connector.label}</div>
                        <div className="text-xs text-slate-500">{connector.description}</div>
                      </div>
                    </SelectItem>
              ))}
            </SelectContent>
          </Select>
            </div>
          </div>

          {/* Performance */}
          <div className="space-y-4">
            <h4 className="font-medium text-slate-900 flex items-center gap-2">
              <Gauge className="w-4 h-4" />
              Performance
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label htmlFor="motor_power">Motor Power (kW)</Label>
                <Input
                  id="motor_power"
                  type="number"
                  placeholder="e.g., 100"
                  value={evData.motor_power_kw || ''}
                  onChange={(e) => updateEvData({ motor_power_kw: parseFloat(e.target.value) || 0 })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="motor_torque">Motor Torque (Nm)</Label>
                <Input
                  id="motor_torque"
                  type="number"
                  placeholder="e.g., 250"
                  value={evData.motor_torque_nm || ''}
                  onChange={(e) => updateEvData({ motor_torque_nm: parseFloat(e.target.value) || 0 })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="top_speed">Top Speed (km/h)</Label>
                <Input
                  id="top_speed"
                  type="number"
                  placeholder="e.g., 140"
                  value={evData.top_speed_kmh || ''}
                  onChange={(e) => updateEvData({ top_speed_kmh: parseFloat(e.target.value) || 0 })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="acceleration">0-100 km/h (seconds)</Label>
          <Input
                  id="acceleration"
                  type="number"
                  step="0.1"
                  placeholder="e.g., 8.5"
                  value={evData.acceleration_0_100 || ''}
                  onChange={(e) => updateEvData({ acceleration_0_100: parseFloat(e.target.value) || 0 })}
                />
              </div>
            </div>
          </div>

          {/* Warranty */}
          <div className="space-y-4">
            <h4 className="font-medium text-slate-900">Battery Warranty</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="battery_warranty_years">Warranty Years</Label>
                <Input
                  id="battery_warranty_years"
                  type="number"
                  placeholder="e.g., 8"
                  value={evData.battery_warranty_years || ''}
                  onChange={(e) => updateEvData({ battery_warranty_years: parseInt(e.target.value) || 0 })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="battery_warranty_km">Warranty km</Label>
          <Input
                  id="battery_warranty_km"
                  type="number"
                  placeholder="e.g., 160000"
                  value={evData.battery_warranty_km || ''}
                  onChange={(e) => updateEvData({ battery_warranty_km: parseInt(e.target.value) || 0 })}
                />
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex justify-between pt-6">
            {onPrevious && (
              <Button variant="outline" onClick={onPrevious}>
                Previous
              </Button>
            )}
            <div className="flex gap-2 ml-auto">
              <Button variant="outline">
                Save as Draft
              </Button>
              {onNext && (
                <Button onClick={handleNext}>
                  Next
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (category === 'Bike') {
  return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-green-600" />
            Motorcycle Specifications
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              Bike
            </Badge>
          </CardTitle>
          <p className="text-sm text-slate-600">
            Add specific details for this motorcycle
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Basic Specs */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="engine_cc">Engine CC</Label>
              <Input
                id="engine_cc"
                type="number"
                placeholder="e.g., 150"
                value={bikeData.engine_cc || ''}
                onChange={(e) => updateBikeData({ engine_cc: parseInt(e.target.value) || 0 })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cooling_system">Cooling System</Label>
              <Select
                value={bikeData.cooling_system}
                onValueChange={(value: BikeFields['cooling_system']) => updateBikeData({ cooling_system: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {COOLING_SYSTEMS.map((system) => (
                    <SelectItem key={system.value} value={system.value}>
                      <div>
                        <div className="font-medium">{system.label}</div>
                        <div className="text-xs text-slate-500">{system.description}</div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Dimensions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="seat_height">Seat Height (mm)</Label>
              <Input
                id="seat_height"
                type="number"
                placeholder="e.g., 800"
                value={bikeData.seat_height_mm || ''}
                onChange={(e) => updateBikeData({ seat_height_mm: parseInt(e.target.value) || 0 })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ground_clearance">Ground Clearance (mm)</Label>
              <Input
                id="ground_clearance"
                type="number"
                placeholder="e.g., 160"
                value={bikeData.ground_clearance_mm || ''}
                onChange={(e) => updateBikeData({ ground_clearance_mm: parseInt(e.target.value) || 0 })}
              />
            </div>
          </div>

          {/* Capacities */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fuel_tank">Fuel Tank Capacity (Liters)</Label>
              <Input
                id="fuel_tank"
                type="number"
                step="0.1"
                placeholder="e.g., 12.5"
                value={bikeData.fuel_tank_capacity_liters || ''}
                onChange={(e) => updateBikeData({ fuel_tank_capacity_liters: parseFloat(e.target.value) || 0 })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="kerb_weight">Kerb Weight (kg)</Label>
              <Input
                id="kerb_weight"
                type="number"
                placeholder="e.g., 135"
                value={bikeData.kerb_weight_kg || ''}
                onChange={(e) => updateBikeData({ kerb_weight_kg: parseInt(e.target.value) || 0 })}
              />
            </div>
          </div>

          {/* Performance */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="max_power">Max Power (BHP)</Label>
              <Input
                id="max_power"
                type="number"
                step="0.1"
                placeholder="e.g., 15.5"
                value={bikeData.max_power_bhp || ''}
                onChange={(e) => updateBikeData({ max_power_bhp: parseFloat(e.target.value) || 0 })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="max_torque">Max Torque (Nm)</Label>
              <Input
                id="max_torque"
                type="number"
                placeholder="e.g., 13.5"
                value={bikeData.max_torque_nm || ''}
                onChange={(e) => updateBikeData({ max_torque_nm: parseFloat(e.target.value) || 0 })}
              />
            </div>
          </div>

          {/* Mileage */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="mileage_city">Mileage City (kmpl)</Label>
              <Input
                id="mileage_city"
                type="number"
                step="0.1"
                placeholder="e.g., 55.5"
                value={bikeData.mileage_city_kmpl || ''}
                onChange={(e) => updateBikeData({ mileage_city_kmpl: parseFloat(e.target.value) || 0 })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="mileage_highway">Mileage Highway (kmpl)</Label>
              <Input
                id="mileage_highway"
                type="number"
                step="0.1"
                placeholder="e.g., 65.2"
                value={bikeData.mileage_highway_kmpl || ''}
                onChange={(e) => updateBikeData({ mileage_highway_kmpl: parseFloat(e.target.value) || 0 })}
              />
            </div>
          </div>

          {/* Safety */}
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="abs_available"
              checked={bikeData.abs_available}
              onChange={(e) => updateBikeData({ abs_available: e.target.checked })}
              className="rounded border-slate-300"
            />
            <Label htmlFor="abs_available">ABS Available</Label>
        </div>
        
          {/* Navigation */}
          <div className="flex justify-between pt-6">
            {onPrevious && (
              <Button variant="outline" onClick={onPrevious}>
                Previous
              </Button>
            )}
            <div className="flex gap-2 ml-auto">
              <Button variant="outline">
                Save as Draft
              </Button>
              {onNext && (
                <Button onClick={handleNext}>
                  Next
                </Button>
        )}
      </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (category === 'Commercial') {
    return (
      <Card className="w-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
            <Cable className="w-5 h-5 text-orange-600" />
            Commercial Vehicle Specifications
            <Badge variant="secondary" className="bg-orange-100 text-orange-800">
              Commercial
            </Badge>
            </CardTitle>
          <p className="text-sm text-slate-600">
            Add specific details for this commercial vehicle
          </p>
          </CardHeader>
        <CardContent className="space-y-6">
          {/* Weight & Capacity */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="gvw">Gross Vehicle Weight (kg)</Label>
              <Input
                id="gvw"
                type="number"
                placeholder="e.g., 16000"
                value={commercialData.gvw_kg || ''}
                onChange={(e) => updateCommercialData({ gvw_kg: parseInt(e.target.value) || 0 })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="payload">Payload Capacity (kg)</Label>
              <Input
                id="payload"
                type="number"
                placeholder="e.g., 8000"
                value={commercialData.payload_capacity_kg || ''}
                onChange={(e) => updateCommercialData({ payload_capacity_kg: parseInt(e.target.value) || 0 })}
              />
            </div>
          </div>

          {/* Dimensions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="wheelbase">Wheelbase (mm)</Label>
              <Input
                id="wheelbase"
                type="number"
                placeholder="e.g., 3600"
                value={commercialData.wheelbase_mm || ''}
                onChange={(e) => updateCommercialData({ wheelbase_mm: parseInt(e.target.value) || 0 })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cargo_volume">Cargo Volume (Liters)</Label>
              <Input
                id="cargo_volume"
                type="number"
                placeholder="e.g., 15000"
                value={commercialData.cargo_volume_liters || ''}
                onChange={(e) => updateCommercialData({ cargo_volume_liters: parseInt(e.target.value) || 0 })}
              />
            </div>
          </div>

          {/* Configuration */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="axle_config">Axle Configuration</Label>
              <Input
                id="axle_config"
                placeholder="e.g., 4x2, 6x2, 6x4"
                value={commercialData.axle_configuration}
                onChange={(e) => updateCommercialData({ axle_configuration: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cabin_type">Cabin Type</Label>
              <Select
                value={commercialData.cabin_type}
                onValueChange={(value: CommercialFields['cabin_type']) => updateCommercialData({ cabin_type: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CABIN_TYPES.map((cabin) => (
                    <SelectItem key={cabin.value} value={cabin.value}>
                      <div>
                        <div className="font-medium">{cabin.label}</div>
                        <div className="text-xs text-slate-500">{cabin.description}</div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Performance */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fuel_tank">Fuel Tank (Liters)</Label>
              <Input
                id="fuel_tank"
                type="number"
                placeholder="e.g., 200"
                value={commercialData.fuel_tank_capacity_liters || ''}
                onChange={(e) => updateCommercialData({ fuel_tank_capacity_liters: parseInt(e.target.value) || 0 })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="gradeability">Gradeability (%)</Label>
              <Input
                id="gradeability"
                type="number"
                step="0.1"
                placeholder="e.g., 25.5"
                value={commercialData.gradeability_percent || ''}
                onChange={(e) => updateCommercialData({ gradeability_percent: parseFloat(e.target.value) || 0 })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="turning_radius">Turning Radius (m)</Label>
              <Input
                id="turning_radius"
                type="number"
                step="0.1"
                placeholder="e.g., 8.5"
                value={commercialData.turning_radius_m || ''}
                onChange={(e) => updateCommercialData({ turning_radius_m: parseFloat(e.target.value) || 0 })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="max_speed">Max Speed (km/h)</Label>
              <Input
                id="max_speed"
                type="number"
                placeholder="e.g., 80"
                value={commercialData.max_speed_kmh || ''}
                onChange={(e) => updateCommercialData({ max_speed_kmh: parseInt(e.target.value) || 0 })}
              />
            </div>
          </div>

          {/* Emission Norm */}
          <div className="space-y-2">
            <Label htmlFor="emission_norm">Emission Norm</Label>
            <Select
              value={commercialData.emission_norm}
              onValueChange={(value: CommercialFields['emission_norm']) => updateCommercialData({ emission_norm: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {EMISSION_NORMS.map((norm) => (
                  <SelectItem key={norm.value} value={norm.value}>
                    <div>
                      <div className="font-medium">{norm.label}</div>
                      <div className="text-xs text-slate-500">{norm.description}</div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Navigation */}
          <div className="flex justify-between pt-6">
            {onPrevious && (
              <Button variant="outline" onClick={onPrevious}>
                Previous
              </Button>
            )}
            <div className="flex gap-2 ml-auto">
              <Button variant="outline">
                Save as Draft
              </Button>
              {onNext && (
                <Button onClick={handleNext}>
                  Next
                </Button>
                )}
              </div>
          </div>
          </CardContent>
        </Card>
    );
  }

  // Default case for other categories
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Additional Specifications</CardTitle>
        <p className="text-sm text-slate-600">
          No specific fields required for this vehicle category
        </p>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between pt-6">
          {onPrevious && (
            <Button variant="outline" onClick={onPrevious}>
              Previous
            </Button>
          )}
          <div className="flex gap-2 ml-auto">
            <Button variant="outline">
              Save as Draft
            </Button>
            {onNext && (
              <Button onClick={handleNext}>
                Next
              </Button>
      )}
    </div>
        </div>
      </CardContent>
    </Card>
  );
}