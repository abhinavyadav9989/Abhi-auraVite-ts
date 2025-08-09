import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Calculator, IndianRupee, X } from 'lucide-react';

export default function EMICalculator({ vehiclePrice = 0, onClose }) {
  // Ensure we have a valid price
  const safeVehiclePrice = vehiclePrice || 500000; // Default to 5L if no price provided
  
  const [loanAmount, setLoanAmount] = useState(safeVehiclePrice * 0.8); // 80% of vehicle price
  const [interestRate, setInterestRate] = useState(8.5);
  const [tenure, setTenure] = useState(5);
  const [downPayment, setDownPayment] = useState(safeVehiclePrice * 0.2); // 20% down payment

  // Calculate EMI using standard formula
  const calculateEMI = () => {
    const principal = loanAmount;
    const rate = interestRate / 100 / 12; // Monthly interest rate
    const time = tenure * 12; // Total months

    if (rate === 0) return principal / time;

    const emi = (principal * rate * Math.pow(1 + rate, time)) / (Math.pow(1 + rate, time) - 1);
    return emi;
  };

  const emi = calculateEMI();
  const totalPayment = emi * tenure * 12;
  const totalInterest = totalPayment - loanAmount;

  const handleDownPaymentChange = (value) => {
    const newDownPayment = value;
    const newLoanAmount = Math.max(0, safeVehiclePrice - newDownPayment);
    setDownPayment(newDownPayment);
    setLoanAmount(newLoanAmount);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
            <Calculator className="w-6 h-6 text-blue-600" />
            EMI Calculator
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 p-1">
          {/* Vehicle Price Display */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <Label className="text-sm font-medium text-blue-700">Vehicle Price</Label>
            <div className="text-2xl font-bold text-blue-900 mt-1">
              {formatCurrency(safeVehiclePrice)}
            </div>
          </div>

          {/* Down Payment Slider */}
          <div>
            <Label className="text-sm font-medium mb-3 block">
              Down Payment: {formatCurrency(downPayment)} ({((downPayment/safeVehiclePrice)*100).toFixed(0)}%)
            </Label>
            <Slider
              value={[downPayment]}
              onValueChange={(value) => handleDownPaymentChange(value[0])}
              max={safeVehiclePrice * 0.5} // Max 50% down payment
              min={safeVehiclePrice * 0.1} // Min 10% down payment
              step={10000}
              className="mt-2"
            />
            <div className="flex justify-between text-xs text-slate-500 mt-1">
              <span>Min: {((safeVehiclePrice * 0.1)/100000).toFixed(1)}L</span>
              <span>Max: {((safeVehiclePrice * 0.5)/100000).toFixed(1)}L</span>
            </div>
          </div>

          {/* Loan Amount Input */}
          <div>
            <Label className="text-sm font-medium">Loan Amount</Label>
            <div className="relative mt-1">
              <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                type="number"
                value={Math.round(loanAmount)}
                onChange={(e) => {
                  const value = parseInt(e.target.value) || 0;
                  setLoanAmount(value);
                  setDownPayment(safeVehiclePrice - value);
                }}
                className="pl-10"
                placeholder="Enter loan amount"
              />
            </div>
          </div>

          {/* Interest Rate Slider */}
          <div>
            <Label className="text-sm font-medium mb-3 block">
              Interest Rate: {interestRate}% per annum
            </Label>
            <Slider
              value={[interestRate]}
              onValueChange={(value) => setInterestRate(value[0])}
              max={15}
              min={6.5}
              step={0.1}
              className="mt-2"
            />
            <div className="flex justify-between text-xs text-slate-500 mt-1">
              <span>6.5%</span>
              <span>15%</span>
            </div>
          </div>

          {/* Tenure Slider */}
          <div>
            <Label className="text-sm font-medium mb-3 block">
              Loan Tenure: {tenure} years
            </Label>
            <Slider
              value={[tenure]}
              onValueChange={(value) => setTenure(value[0])}
              max={7}
              min={1}
              step={1}
              className="mt-2"
            />
            <div className="flex justify-between text-xs text-slate-500 mt-1">
              <span>1 year</span>
              <span>7 years</span>
            </div>
          </div>

          {/* Results Section */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-lg space-y-4">
            <h3 className="font-semibold text-lg text-slate-800 mb-4">EMI Calculation Results</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-white rounded-lg shadow-sm">
                <p className="text-sm text-slate-600">Monthly EMI</p>
                <p className="text-2xl font-bold text-blue-600">
                  {formatCurrency(emi)}
                </p>
              </div>
              
              <div className="text-center p-3 bg-white rounded-lg shadow-sm">
                <p className="text-sm text-slate-600">Total Amount</p>
                <p className="text-lg font-semibold text-slate-800">
                  {formatCurrency(totalPayment)}
                </p>
              </div>
            </div>
            
            <div className="text-center p-3 bg-white rounded-lg shadow-sm">
              <p className="text-sm text-slate-600">Total Interest Payable</p>
              <p className="text-lg font-semibold text-orange-600">
                {formatCurrency(totalInterest)}
              </p>
            </div>
          </div>

          {/* Preset Options */}
          <div className="grid grid-cols-2 gap-3">
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => {
                // Conservative preset
                setDownPayment(safeVehiclePrice * 0.25);
                setLoanAmount(safeVehiclePrice * 0.75);
                setInterestRate(9.5);
                setTenure(5);
              }}
            >
              Conservative Plan
              <div className="text-xs text-slate-500 mt-1">25% down, 9.5% rate</div>
            </Button>
            
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => {
                // Aggressive preset
                setDownPayment(safeVehiclePrice * 0.15);
                setLoanAmount(safeVehiclePrice * 0.85);
                setInterestRate(8.0);
                setTenure(7);
              }}
            >
              Aggressive Plan
              <div className="text-xs text-slate-500 mt-1">15% down, 8% rate</div>
            </Button>
          </div>

          {/* Disclaimer */}
          <div className="text-xs text-slate-500 text-center bg-slate-50 p-3 rounded">
            *EMI calculations are indicative. Actual rates may vary based on your credit profile and lender policies.
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
            <Button onClick={() => {
              // Could implement sharing or saving functionality here
              navigator.clipboard?.writeText(`EMI: ${formatCurrency(emi)} for ${formatCurrency(safeVehiclePrice)} vehicle`);
            }}>
              Copy Details
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}