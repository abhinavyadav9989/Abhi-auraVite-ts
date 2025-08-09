import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Eye, EyeOff, Mail, Lock, User, Chrome, AlertTriangle, CheckCircle, Info } from 'lucide-react';

const PASSWORD_REQUIREMENTS = [
  { regex: /.{8,}/, text: 'At least 8 characters' },
  { regex: /[A-Z]/, text: 'One uppercase letter' },
  { regex: /[a-z]/, text: 'One lowercase letter' },
  { regex: /\d/, text: 'One number' },
  { regex: /[!@#$%^&*(),.?":{}|<>]/, text: 'One special character' }
];

export default function AccountCreation({ data, updateData, errors, isReturningUser, inviteToken }) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);

  // ONB-01: Skip if user already logged in
  if (isReturningUser) {
    return (
      <div className="text-center py-8">
         <CheckCircle className="w-16 h-16 mx-auto mb-4 text-green-500" />
         <h3 className="text-xl font-semibold mb-2">Welcome back!</h3>
         <p className="text-slate-600">You&apos;re already logged in. Let&apos;s continue with your business setup.</p>
        <div className="mt-4 p-4 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>Logged in as:</strong> {data.email || 'Current User'}
          </p>
        </div>
      </div>
    );
  }

  const handlePasswordChange = (password) => {
    updateData({ password });
    
    // Calculate password strength
    const strength = PASSWORD_REQUIREMENTS.reduce((score, req) => {
      return score + (req.regex.test(password) ? 1 : 0);
    }, 0);
    setPasswordStrength(strength);
  };

  // ONB-03: Google SSO
  const handleGoogleSSO = async () => {
    try {
      // In real implementation, this would trigger OAuth
      updateData({ 
        googleSSO: true,
        emailVerified: true,
        fullName: 'Google User',
        email: 'user@gmail.com'
      });
    } catch (error) {
      console.error('SSO failed:', error);
    }
  };

  const getPasswordStrengthColor = () => {
    if (passwordStrength <= 2) return 'bg-red-500';
    if (passwordStrength <= 3) return 'bg-yellow-500';
    if (passwordStrength <= 4) return 'bg-blue-500';
    return 'bg-green-500';
  };

  const getPasswordStrengthText = () => {
    if (passwordStrength <= 2) return 'Weak';
    if (passwordStrength <= 3) return 'Fair';
    if (passwordStrength <= 4) return 'Good';
    return 'Strong';
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Create Your Account</h2>
        <p className="text-slate-600">
          Join thousands of dealers already trading on Aura&apos;s marketplace
        </p>
        {inviteToken && (
          <Alert className="mt-4 border-blue-200 bg-blue-50">
              <Info className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-800">
              You&apos;ve been invited to join an organization. Complete signup to access your team.
            </AlertDescription>
          </Alert>
        )}
      </div>

      {/* ONB-03: Google SSO Option */}
      <Card className="border-2 border-dashed border-blue-200">
        <CardContent className="p-6 text-center">
          <h3 className="font-semibold mb-3">Quick Setup with Google</h3>
          <p className="text-sm text-slate-600 mb-4">
            Sign up instantly using your Google account
          </p>
          <Button 
            variant="outline" 
            onClick={handleGoogleSSO}
            className="w-full max-w-sm"
          >
            <Chrome className="w-4 h-4 mr-2" />
            Continue with Google
          </Button>
        </CardContent>
      </Card>

      <div className="flex items-center gap-4">
        <Separator className="flex-1" />
        <span className="text-sm text-slate-500">or create manually</span>
        <Separator className="flex-1" />
      </div>

      {/* Manual Account Creation */}
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="fullName">Full Name *</Label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              id="fullName"
              value={data.fullName || ''}
              onChange={(e) => updateData({ fullName: e.target.value })}
              placeholder="Enter your full name"
              className={`pl-10 ${errors.fullName ? 'border-red-300' : ''}`}
            />
          </div>
          {errors.fullName && (
            <p className="text-sm text-red-600">{errors.fullName}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email Address *</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              id="email"
              type="email"
              value={data.email || ''}
              onChange={(e) => updateData({ email: e.target.value })}
              placeholder="your@email.com"
              className={`pl-10 ${errors.email ? 'border-red-300' : ''}`}
            />
          </div>
          {errors.email && (
            <p className="text-sm text-red-600">{errors.email}</p>
          )}
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="password">Password *</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={data.password || ''}
                onChange={(e) => handlePasswordChange(e.target.value)}
                placeholder="Create a strong password"
                className={`pl-10 pr-10 ${errors.password ? 'border-red-300' : ''}`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2"
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4 text-slate-400" />
                ) : (
                  <Eye className="w-4 h-4 text-slate-400" />
                )}
              </button>
            </div>
            {data.password && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Password strength:</span>
                  <span className={`font-medium ${passwordStrength <= 2 ? 'text-red-600' : passwordStrength <= 4 ? 'text-yellow-600' : 'text-green-600'}`}>
                    {getPasswordStrengthText()}
                  </span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all ${getPasswordStrengthColor()}`}
                    style={{ width: `${(passwordStrength / 5) * 100}%` }}
                  />
                </div>
              </div>
            )}
            {errors.password && (
              <p className="text-sm text-red-600">{errors.password}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm Password *</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                value={data.confirmPassword || ''}
                onChange={(e) => updateData({ confirmPassword: e.target.value })}
                placeholder="Confirm your password"
                className={`pl-10 pr-10 ${errors.confirmPassword ? 'border-red-300' : ''}`}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2"
              >
                {showConfirmPassword ? (
                  <EyeOff className="w-4 h-4 text-slate-400" />
                ) : (
                  <Eye className="w-4 h-4 text-slate-400" />
                )}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="text-sm text-red-600">{errors.confirmPassword}</p>
            )}
          </div>
        </div>

        {/* Password Requirements */}
        {data.password && (
          <div className="bg-slate-50 rounded-lg p-4">
            <h4 className="font-medium text-sm mb-3">Password Requirements:</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {PASSWORD_REQUIREMENTS.map((req, index) => (
                <div key={index} className="flex items-center gap-2 text-sm">
                  {req.regex.test(data.password || '') ? (
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  ) : (
                    <div className="w-4 h-4 rounded-full border-2 border-slate-300" />
                  )}
                  <span className={req.regex.test(data.password || '') ? 'text-green-700' : 'text-slate-600'}>
                    {req.text}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          <strong>Security Note:</strong> Your account will be protected with industry-standard encryption. 
          We recommend enabling two-factor authentication after completing setup.
        </AlertDescription>
      </Alert>
    </div>
  );
}