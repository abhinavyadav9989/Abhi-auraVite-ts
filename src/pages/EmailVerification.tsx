import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { User } from '@/api/entities';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/components/ui/use-toast';
import { 
  Mail, 
  ArrowRight, 
  Car,
  CheckCircle,
  AlertTriangle,
  RotateCcw
} from 'lucide-react';
import { createPageUrl } from '@/utils';

export default function EmailVerification() {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [canResend, setCanResend] = useState(false);
  const [resendTimer, setResendTimer] = useState(30);
  const [user, setUser] = useState(null);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const currentUser = await User.me();
      setUser(currentUser);
      
      // If user is already verified, redirect to onboarding
      if ((currentUser as any).email_verified) {
        navigate(createPageUrl('OnboardingPath'));
        return;
      }
      
      // Start resend timer
      startResendTimer();
    } catch (error) {
      console.error('Error loading user:', error);
      // User not authenticated, redirect to authentication
      navigate(createPageUrl('Authentication'));
    }
  };

  const startResendTimer = () => {
    const timer = setInterval(() => {
      setResendTimer(prev => {
        if (prev <= 1) {
          setCanResend(true);
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) return; // Only allow digits
    
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setError('');

    // Auto-advance to next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      if (nextInput) nextInput.focus();
    }

    // Auto-submit when all fields are filled
    if (newOtp.every(digit => digit !== '') && !isLoading) {
      handleSubmit(newOtp.join(''));
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      if (prevInput) prevInput.focus();
    }
  };

  const handleSubmit = async (otpValue = null) => {
    const otpCode = otpValue || otp.join('');
    
    if (otpCode.length !== 6) {
      setError('Please enter the complete 6-digit code');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // Mock email verification - in real app would call API
      // For now, just update user data to mark as verified
      await User.updateMyUserData({ 
        data: {
          email_verified: true,
          email_verification_token: null
        }
      });
      
      toast({
        title: "Email Verified!",
        description: "Your email has been successfully verified.",
      });

      // Navigate to onboarding path selection
      navigate(createPageUrl('OnboardingPath'));

    } catch (error) {
      console.error('Email verification error:', error);
      
      if (error.message.includes('Invalid code')) {
        setError('Invalid verification code. Please try again.');
        setOtp(['', '', '', '', '', '']);
        document.getElementById('otp-0')?.focus();
      } else if (error.message.includes('Expired')) {
        setError('Verification code has expired. Please request a new one.');
        setCanResend(true);
        setResendTimer(0);
      } else {
        setError('Verification failed. Please try again.');
      }
    }

    setIsLoading(false);
  };

  const handleResend = async () => {
    setIsLoading(true);
    setError('');

    try {
      // Mock resend - in real app would call API to send new OTP
      toast({
        title: "Code Resent",
        description: "A new verification code has been sent to your email.",
      });

      setCanResend(false);
      setResendTimer(30);
      setOtp(['', '', '', '', '', '']);
      startResendTimer();

    } catch (error) {
      console.error('Resend error:', error);
      setError('Failed to resend code. Please try again.');
    }

    setIsLoading(false);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-6">
        {/* Header */}
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl flex items-center justify-center shadow-lg">
              <Mail className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-slate-900">Verify Your Email</h1>
          <p className="text-slate-600 mt-2">
            We&apos;ve sent a 6-digit code to
          </p>
          <p className="text-slate-900 font-medium">{user.email}</p>
        </div>

        {/* Verification Form */}
        <Card className="border-0 shadow-xl">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center">Enter Verification Code</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {error && (
              <Alert className="border-red-200 bg-red-50">
                <AlertTriangle className="w-4 h-4 text-red-600" />
                <AlertDescription className="text-red-700">{error}</AlertDescription>
              </Alert>
            )}

            {/* OTP Input */}
            <div className="flex justify-center gap-3">
              {otp.map((digit, index) => (
                <Input
                  key={index}
                  id={`otp-${index}`}
                  type="text"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  className="w-12 h-12 text-center text-xl font-bold border-2 focus:border-blue-500"
                  disabled={isLoading}
                />
              ))}
            </div>

            {/* Submit Button */}
            <Button
              onClick={() => handleSubmit()}
              className="w-full bg-blue-600 hover:bg-blue-700"
              disabled={isLoading || otp.some(digit => digit === '')}
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Verifying...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  Verify Email
                  <ArrowRight className="w-4 h-4" />
                </div>
              )}
            </Button>

            {/* Resend */}
            <div className="text-center">
              <p className="text-sm text-slate-600 mb-2">
                Didn&apos;t receive the code?
              </p>
              <Button
                variant="ghost"
                onClick={handleResend}
                disabled={!canResend || isLoading}
                className="text-blue-600 hover:text-blue-700"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                {canResend ? 'Resend Code' : `Resend in ${resendTimer}s`}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
          <div className="text-center text-xs text-slate-500">
            Check your spam folder if you don&apos;t see the email
          </div>
      </div>
    </div>
  );
}