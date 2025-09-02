import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Car, FileText, Search, CheckCircle, AlertCircle, Edit, Sparkles } from 'lucide-react';
import { vehicleAutoFillService } from '@/api/services/vehicleAutoFill';
import OEMCatalogSearch from './OEMCatalogSearch';
import { OEMVehicleAPI } from '@/api/services/oemCatalogService';

interface IdentifyStepProps {
  data: any;
  updateData: (data: any) => void;
  dealer: any;
  vehicleType?: 'new' | 'used';
}

export default function IdentifyStep({ data, updateData, dealer, vehicleType = 'used' }: IdentifyStepProps) {
  const [identificationMethod, setIdentificationMethod] = useState<'reg_number' | 'vin' | 'manual' | 'oem_catalog'>('manual');
  const [isLoading, setIsLoading] = useState(false);
  const [autoFilledData, setAutoFilledData] = useState<any>(null);
  const [autoFilledFields, setAutoFilledFields] = useState<any>({});
  const [error, setError] = useState<string | null>(null);

  // Initialize identification method from data
  useEffect(() => {
    if (data.identification_method) {
      setIdentificationMethod(data.identification_method);
    }
  }, [data.identification_method]);

  // Handle identification method change
  const handleMethodChange = (method: 'reg_number' | 'vin' | 'manual' | 'oem_catalog') => {
    setIdentificationMethod(method);
    updateData({ identification_method: method });
    setAutoFilledData(null);
    setAutoFilledFields({});
    setError(null);
  };

  // Handle OEM vehicle selection
  const handleOEMVehicleSelect = (vehicle: OEMVehicleAPI) => {
    // Auto-fill vehicle data from OEM catalog
    const autoFilledData = {
      make: vehicle.make,
      model: vehicle.model,
      variant: vehicle.variant,
      year: vehicle.year,
      fuel_type: vehicle.fuel_type,
      transmission: vehicle.transmission,
      engine_capacity: vehicle.engine_capacity,
      power: vehicle.power,
      torque: vehicle.torque,
      seating_capacity: vehicle.seating_capacity,
      // Store OEM data for reference
      oem_data: vehicle,
      // Auto-fill flags
      auto_filled_fields: {
        make: { source: 'oem_catalog', confidence: 95 },
        model: { source: 'oem_catalog', confidence: 95 },
        variant: { source: 'oem_catalog', confidence: 95 },
        year: { source: 'oem_catalog', confidence: 95 },
        fuel_type: { source: 'oem_catalog', confidence: 95 },
        transmission: { source: 'oem_catalog', confidence: 95 },
        engine_capacity: { source: 'oem_catalog', confidence: 95 },
        power: { source: 'oem_catalog', confidence: 95 },
        torque: { source: 'oem_catalog', confidence: 95 },
        seating_capacity: { source: 'oem_catalog', confidence: 95 }
      }
    };

    updateData(autoFilledData);
    setAutoFilledData(vehicle);
    setAutoFilledFields(autoFilledData.auto_filled_fields);
  };

  // Handle registration number input
  const handleRegistrationNumberChange = async (value: string) => {
    updateData({ registration_number: value });
    
    if (value.length >= 10) {
      const validation = await vehicleAutoFillService.validateRegistrationNumber(value);
      if (validation.isValid) {
        await fetchRTOData(value);
      }
    }
  };

  // Handle VIN input
  const handleVINChange = async (value: string) => {
    updateData({ vin: value });
    
    if (value.length === 17) {
      const validation = await vehicleAutoFillService.validateVIN(value);
      if (validation.isValid) {
        await decodeVIN(value);
      }
    }
  };

  // Fetch RTO data
  const fetchRTOData = async (registrationNumber: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await vehicleAutoFillService.fetchRTOData(registrationNumber);
      
      if (result.success) {
        setAutoFilledData(result.data);
        setAutoFilledFields({
          make: { source: 'rto_api', confidence: result.confidence },
          model: { source: 'rto_api', confidence: result.confidence },
          variant: { source: 'rto_api', confidence: result.confidence },
          year: { source: 'rto_api', confidence: result.confidence },
          fuel_type: { source: 'rto_api', confidence: result.confidence },
          transmission: { source: 'rto_api', confidence: result.confidence },
          body_type: { source: 'rto_api', confidence: result.confidence },
          engine_size: { source: 'rto_api', confidence: result.confidence },
          seating_capacity: { source: 'rto_api', confidence: result.confidence },
          rto_location: { source: 'rto_api', confidence: result.confidence },
          emission_norm: { source: 'rto_api', confidence: result.confidence },
          insurance_valid_until: { source: 'rto_api', confidence: result.confidence },
          puc_valid_until: { source: 'rto_api', confidence: result.confidence }
        });
        
        // Auto-fill the data
        updateData({
          ...result.data,
          auto_filled_fields: {
            ...data.auto_filled_fields,
            ...Object.keys(result.data).reduce((acc, key) => {
              acc[key] = { source: 'rto_api', confidence: result.confidence };
              return acc;
            }, {} as any)
          }
        });
      } else {
        setError(result.error || 'Failed to fetch RTO data');
      }
    } catch (error) {
      setError('Failed to fetch RTO data');
      console.error('RTO data fetch error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Decode VIN
  const decodeVIN = async (vin: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await vehicleAutoFillService.decodeVIN(vin);
      
      if (result.success) {
        setAutoFilledData(result.data);
        setAutoFilledFields({
          make: { source: 'vin_decoder', confidence: result.confidence },
          model: { source: 'vin_decoder', confidence: result.confidence },
          variant: { source: 'vin_decoder', confidence: result.confidence },
          year: { source: 'vin_decoder', confidence: result.confidence },
          fuel_type: { source: 'vin_decoder', confidence: result.confidence },
          transmission: { source: 'vin_decoder', confidence: result.confidence },
          body_type: { source: 'vin_decoder', confidence: result.confidence },
          engine_size: { source: 'vin_decoder', confidence: result.confidence },
          seating_capacity: { source: 'vin_decoder', confidence: result.confidence }
        });
        
        // Auto-fill the data
        updateData({
          ...result.data,
          auto_filled_fields: {
            ...data.auto_filled_fields,
            ...Object.keys(result.data).reduce((acc, key) => {
              acc[key] = { source: 'vin_decoder', confidence: result.confidence };
              return acc;
            }, {} as any)
          }
        });
      } else {
        setError(result.error || 'Failed to decode VIN');
      }
    } catch (error) {
      setError('Failed to decode VIN');
      console.error('VIN decode error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle manual field change
  const handleManualFieldChange = (field: string, value: any) => {
    updateData({ [field]: value });
    
    // Remove from auto-filled fields if manually edited
    if (autoFilledFields[field]) {
      const newAutoFilledFields = { ...autoFilledFields };
      delete newAutoFilledFields[field];
      setAutoFilledFields(newAutoFilledFields);
      
      updateData({
        auto_filled_fields: {
          ...data.auto_filled_fields,
          [field]: { source: 'manual', confidence: 1 }
        }
      });
    }
  };

  // Render auto-filled field with edit option
  const renderAutoFilledField = (field: string, label: string, value: any) => {
    const isAutoFilled = autoFilledFields[field];

    return (
      <div key={field} className="space-y-2">
        <Label htmlFor={field} className="flex items-center gap-2 text-sm md:text-base">
          <span className="truncate">{label}</span>
          {isAutoFilled && (
            <Badge variant="secondary" className="text-xs flex-shrink-0">
              <CheckCircle className="w-3 h-3 mr-1" />
              Auto-filled
            </Badge>
          )}
        </Label>

        {isAutoFilled ? (
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <Input
              id={field}
              value={value || ''}
              onChange={(e) => handleManualFieldChange(field, e.target.value)}
              className="flex-1 text-base md:text-sm h-11 md:h-10"
            />
            <Badge variant="outline" className="text-xs self-start sm:self-center flex-shrink-0">
              {isAutoFilled.source}
            </Badge>
          </div>
        ) : (
          <Input
            id={field}
            value={value || ''}
            onChange={(e) => handleManualFieldChange(field, e.target.value)}
            placeholder={`Enter ${label.toLowerCase()}`}
            className="text-base md:text-sm h-11 md:h-10"
          />
        )}
      </div>
    );
  };

  return (
    <div className="space-y-4 md:space-y-6 px-4 md:px-0">
      <div>
        <h2 className="text-xl md:text-2xl font-bold mb-2">Identify Your Vehicle</h2>
        <p className="text-gray-600 text-sm md:text-base">
          Choose how you want to identify your vehicle. We can auto-fill details from registration number or VIN.
        </p>
      </div>

      {/* Identification Method Selection */}
      <Card className="mx-4 md:mx-0">
        <CardHeader className="pb-3 md:pb-6">
          <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
            <Search className="w-4 h-4 md:w-5 md:h-5" />
            How do you want to start?
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 md:space-y-4 px-4 md:px-6">
          <div className={`grid gap-3 md:gap-4 ${vehicleType === 'new' ? 'grid-cols-2 md:grid-cols-2 lg:grid-cols-4' : 'grid-cols-2 md:grid-cols-3'}`}>
            {vehicleType === 'new' && (
              <Button
                variant={identificationMethod === 'oem_catalog' ? 'default' : 'outline'}
                onClick={() => handleMethodChange('oem_catalog')}
                className="h-auto p-3 md:p-4 flex flex-col items-center gap-1 md:gap-2 text-xs md:text-sm"
              >
                <Sparkles className="w-5 h-5 md:w-6 md:h-6" />
                <span className="font-medium text-center leading-tight">OEM Catalog</span>
                <span className="text-xs text-gray-500 text-center leading-tight">Search from manufacturer</span>
              </Button>
            )}

            <Button
              variant={identificationMethod === 'reg_number' ? 'default' : 'outline'}
              onClick={() => handleMethodChange('reg_number')}
              className="h-auto p-3 md:p-4 flex flex-col items-center gap-1 md:gap-2 text-xs md:text-sm"
            >
              <FileText className="w-5 h-5 md:w-6 md:h-6" />
              <span className="font-medium text-center leading-tight">Registration Number</span>
              <span className="text-xs text-gray-500 text-center leading-tight">Auto-fill from RTO data</span>
            </Button>

            <Button
              variant={identificationMethod === 'vin' ? 'default' : 'outline'}
              onClick={() => handleMethodChange('vin')}
              className="h-auto p-3 md:p-4 flex flex-col items-center gap-1 md:gap-2 text-xs md:text-sm"
            >
              <Car className="w-5 h-5 md:w-6 md:h-6" />
              <span className="font-medium text-center leading-tight">VIN</span>
              <span className="text-xs text-gray-500 text-center leading-tight">Decode vehicle specifications</span>
            </Button>

            <Button
              variant={identificationMethod === 'manual' ? 'default' : 'outline'}
              onClick={() => handleMethodChange('manual')}
              className="h-auto p-3 md:p-4 flex flex-col items-center gap-1 md:gap-2 text-xs md:text-sm"
            >
              <Edit className="w-5 h-5 md:w-6 md:h-6" />
              <span className="font-medium text-center leading-tight">Manual Entry</span>
              <span className="text-xs text-gray-500 text-center leading-tight">Enter details manually</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Input Fields Based on Method */}
      <Card className="mx-4 md:mx-0">
        <CardHeader className="pb-3 md:pb-6">
          <CardTitle className="text-lg md:text-xl">Vehicle Identification</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 md:space-y-4 px-4 md:px-6">
          {identificationMethod === 'reg_number' && (
            <div className="space-y-3 md:space-y-4">
              <div>
                <Label htmlFor="registration_number" className="text-sm md:text-base">Registration Number</Label>
                <Input
                  id="registration_number"
                  value={data.registration_number || ''}
                  onChange={(e) => handleRegistrationNumberChange(e.target.value)}
                  placeholder="e.g., MH12AB1234"
                  className="uppercase text-base md:text-sm h-11 md:h-10"
                />
                <p className="text-xs md:text-sm text-gray-500 mt-1">
                  We'll fetch make/model/variant/year from RTO data if available. You can edit anything.
                </p>
              </div>

              {isLoading && (
                <Alert className="py-3">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <AlertDescription className="text-sm">
                    Fetching vehicle details from RTO...
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}

          {identificationMethod === 'vin' && (
            <div className="space-y-3 md:space-y-4">
              <div>
                <Label htmlFor="vin" className="text-sm md:text-base">Vehicle Identification Number (VIN)</Label>
                <Input
                  id="vin"
                  value={data.vin || ''}
                  onChange={(e) => handleVINChange(e.target.value)}
                  placeholder="17-character VIN"
                  className="uppercase text-base md:text-sm h-11 md:h-10"
                />
                <p className="text-xs md:text-sm text-gray-500 mt-1">
                  We'll decode this from VIN. You can edit any details.
                </p>
              </div>

              {isLoading && (
                <Alert className="py-3">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <AlertDescription className="text-sm">
                    Decoding VIN...
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}

          {error && (
            <Alert variant="destructive" className="py-3">
              <AlertCircle className="w-4 h-4" />
              <AlertDescription className="text-sm">{error}</AlertDescription>
            </Alert>
          )}

          {/* Auto-filled Data Display */}
          {autoFilledData && (
            <div className="p-3 md:p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="font-medium text-blue-800 mb-3 flex items-center gap-2 text-sm md:text-base">
                <CheckCircle className="w-4 h-4 flex-shrink-0" />
                We filled these from your {identificationMethod === 'reg_number' ? 'registration' : 'VIN'}
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                {renderAutoFilledField('make', 'Make', data.make)}
                {renderAutoFilledField('model', 'Model', data.model)}
                {renderAutoFilledField('variant', 'Variant', data.variant)}
                {renderAutoFilledField('year', 'Year', data.year)}
                {renderAutoFilledField('fuel_type', 'Fuel Type', data.fuel_type)}
                {renderAutoFilledField('transmission', 'Transmission', data.transmission)}
                {renderAutoFilledField('body_type', 'Body Type', data.body_type)}
                {renderAutoFilledField('engine_size', 'Engine Size', data.engine_size)}
              </div>
            </div>
          )}

          {/* Manual Entry Fields */}
          {identificationMethod === 'manual' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {renderAutoFilledField('make', 'Make', data.make)}
              {renderAutoFilledField('model', 'Model', data.model)}
              {renderAutoFilledField('variant', 'Variant', data.variant)}
              {renderAutoFilledField('year', 'Year', data.year)}
              {renderAutoFilledField('fuel_type', 'Fuel Type', data.fuel_type)}
              {renderAutoFilledField('transmission', 'Transmission', data.transmission)}
              {renderAutoFilledField('body_type', 'Body Type', data.body_type)}
              {renderAutoFilledField('engine_size', 'Engine Size', data.engine_size)}
            </div>
          )}

          {/* OEM Catalog Search */}
          {identificationMethod === 'oem_catalog' && vehicleType === 'new' && (
            <OEMCatalogSearch
              onVehicleSelect={handleOEMVehicleSelect}
              selectedVehicle={autoFilledData}
              dealer={dealer}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
