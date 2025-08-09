import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Shield, Clock } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

export default function OTPModal({ phoneNumber, onClose, onVerified }) {
  const [otp, setOtp] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [countdown, setCountdown] = useState(30);
  const [canResend, setCanResend] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Countdown for resend OTP
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [countdown]);

  const handleVerifyOTP = async () => {
    if (otp.length !== 6) {
      toast({
        title: "Invalid OTP",
        description: "Please enter a 6-digit OTP.",
        variant: "destructive"
      });
      return;
    }

    setIsVerifying(true);
    
    // Mock OTP verification - in real app would call SMS gateway
    setTimeout(() => {
      if (otp === '123456' || otp.length === 6) { // Accept any 6-digit for demo
        toast({
          title: "Phone Verified!",
          description: "Your phone number has been verified successfully.",
        });
        onVerified();
      } else {
        toast({
          title: "Invalid OTP",
          description: "Please check the OTP and try again.",
          variant: "destructive"
        });
      }
      setIsVerifying(false);
    }, 1500);
  };

  const handleResendOTP = () => {
    setCountdown(30);
    setCanResend(false);
    setOtp('');
    toast({
      title: "OTP Sent",
      description: `A new OTP has been sent to ${phoneNumber}`,
    });
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-blue-600" />
            Verify Phone Number
          </DialogTitle>
          <DialogDescription>
            We&apos;ve sent a 6-digit OTP to {phoneNumber}. Please enter it below to verify your number.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="text-center">
            <Input
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="Enter 6-digit OTP"
              className="text-center text-lg tracking-wider"
              maxLength={6}
              autoFocus
            />
            <p className="text-xs text-slate-500 mt-2">
              Demo: Use any 6-digit code (e.g., 123456)
            </p>
          </div>

          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={onClose}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleVerifyOTP}
              disabled={otp.length !== 6 || isVerifying}
              className="flex-1"
            >
              {isVerifying ? 'Verifying...' : 'Verify OTP'}
            </Button>
          </div>

          <div className="text-center">
            {canResend ? (
              <Button variant="link" onClick={handleResendOTP} className="text-sm">
                Resend OTP
              </Button>
            ) : (
              <div className="flex items-center justify-center gap-1 text-sm text-slate-500">
                <Clock className="w-4 h-4" />
                Resend in {countdown}s
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}