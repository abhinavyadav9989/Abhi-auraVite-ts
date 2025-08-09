import React, { useState } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

export default function TermsAndVerification({ data, updateData }) {
  const [isSendingEmailOtp, setIsSendingEmailOtp] = useState(false);
  const [isSendingMobileOtp, setIsSendingMobileOtp] = useState(false);

  const handleSendOtp = async (type) => {
    if (type === 'email') {
      setIsSendingEmailOtp(true);
      // Mock OTP sending
      await new Promise(res => setTimeout(res, 1000));
      alert(`OTP sent to ${data.email}`);
      setIsSendingEmailOtp(false);
    } else {
      setIsSendingMobileOtp(true);
      await new Promise(res => setTimeout(res, 1000));
      alert(`OTP sent to ${data.contactNumber}`);
      setIsSendingMobileOtp(false);
    }
  };
  
  const handleVerifyOtp = (type, otp) => {
    // Mock OTP verification
    if (otp === '123456') {
      updateData(type === 'email' ? { emailVerified: true } : { mobileVerified: true });
    } else {
      alert('Invalid OTP');
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-6 space-y-4">
          <h3 className="font-semibold">Email Verification</h3>
          <div className="flex gap-2 items-end">
            <div className="flex-grow">
              <Label htmlFor="email">Email</Label>
              <Input id="email" value={data.email} disabled />
            </div>
            <Button onClick={() => handleSendOtp('email')} disabled={isSendingEmailOtp}>
              {isSendingEmailOtp && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Send OTP
            </Button>
          </div>
          <div className="flex gap-2 items-end">
             <Input placeholder="Enter Email OTP" onChange={e => handleVerifyOtp('email', e.target.value)} disabled={data.emailVerified}/>
          </div>
          {data.emailVerified && <p className="text-sm text-green-600">Email Verified!</p>}
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-6 space-y-4">
          <h3 className="font-semibold">Mobile Verification</h3>
          <div className="flex gap-2 items-end">
            <div className="flex-grow">
              <Label htmlFor="mobile">Mobile Number</Label>
              <Input id="mobile" value={data.contactNumber} disabled />
            </div>
            <Button onClick={() => handleSendOtp('mobile')} disabled={isSendingMobileOtp}>
               {isSendingMobileOtp && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Send OTP
            </Button>
          </div>
          <div className="flex gap-2 items-end">
            <Input placeholder="Enter Mobile OTP" onChange={e => handleVerifyOtp('mobile', e.target.value)} disabled={data.mobileVerified} />
          </div>
          {data.mobileVerified && <p className="text-sm text-green-600">Mobile Verified!</p>}
        </CardContent>
      </Card>

      <div className="p-4 border rounded-lg">
        <h3 className="font-semibold mb-2">Terms & Conditions</h3>
        <div className="h-24 overflow-y-auto border p-2 text-xs bg-slate-50 mb-4">
          <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit...</p>
        </div>
        <div className="flex items-center space-x-2">
          <Checkbox id="terms" checked={data.termsAccepted} onCheckedChange={checked => updateData({ termsAccepted: checked })} />
          <Label htmlFor="terms" className="cursor-pointer">I agree to the terms and conditions</Label>
        </div>
      </div>
    </div>
  );
}