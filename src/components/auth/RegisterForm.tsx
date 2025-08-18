import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Mail, Lock, User, LogIn, CheckCircle, XCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

export function RegisterForm() {
  const { signUpWithEmailCheck, checkDealerEmailExists, checkDealerEmailExistsDirect, loading, error, clearError } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [emailStatus, setEmailStatus] = useState<'idle' | 'checking' | 'exists' | 'available'>('idle');
  const [emailValidationTimeout, setEmailValidationTimeout] = useState<NodeJS.Timeout | null>(null);

  // Debounced email validation
  const validateEmail = useCallback(async (email: string) => {
    console.log('🔄 Starting email validation for:', email);
    if (!email || email.length < 3) {
      console.log('⏭️ Skipping validation - email too short');
      setEmailStatus('idle');
      return;
    }

    console.log('⏳ Setting status to checking...');
    setEmailStatus('checking');
    
    try {
      console.log('📞 Calling checkDealerEmailExists...');
      const exists = await checkDealerEmailExists(email);
      console.log('📋 Email validation result:', exists);
      setEmailStatus(exists ? 'exists' : 'available');
    } catch (error) {
      console.error('❌ Email validation error:', error);
      setEmailStatus('idle');
    }
  }, [checkDealerEmailExists]);

  // Handle email input change with debouncing
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newEmail = e.target.value;
    setEmail(newEmail);
    clearError();
    
    // Clear existing timeout
    if (emailValidationTimeout) {
      clearTimeout(emailValidationTimeout);
    }
    
    // Set new timeout for debounced validation
    const timeout = setTimeout(() => {
      validateEmail(newEmail);
    }, 500); // 500ms delay
    
    setEmailValidationTimeout(timeout);
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (emailValidationTimeout) {
        clearTimeout(emailValidationTimeout);
      }
    };
  }, [emailValidationTimeout]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    
    if (password !== confirmPassword) {
      alert('Passwords do not match');
      return;
    }
    
    try {
      const result = await signUpWithEmailCheck(email, password, fullName);
      console.log('Registration successful:', result);
      // You might want to redirect to email verification or onboarding
    } catch (error) {
      console.error('Registration failed:', error);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-center">Create Your Account</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          <div className="space-y-2">
            <label htmlFor="fullName" className="text-sm font-medium">
              Full Name
            </label>
            <div className="relative">
              <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="fullName"
                type="text"
                placeholder="Enter your full name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="pl-10"
                required
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={handleEmailChange}
                className={`pl-10 pr-10 ${
                  emailStatus === 'exists' ? 'border-red-500 focus:border-red-500' :
                  emailStatus === 'available' ? 'border-green-500 focus:border-green-500' : ''
                }`}
                required
              />
              {emailStatus === 'checking' && (
                <Loader2 className="absolute right-3 top-3 h-4 w-4 text-gray-400 animate-spin" />
              )}
              {emailStatus === 'exists' && (
                <XCircle className="absolute right-3 top-3 h-4 w-4 text-red-500" />
              )}
              {emailStatus === 'available' && (
                <CheckCircle className="absolute right-3 top-3 h-4 w-4 text-green-500" />
              )}
            </div>
            {emailStatus === 'exists' && (
              <div className="space-y-2">
                <p className="text-sm text-red-600 flex items-center">
                  <XCircle className="mr-1 h-3 w-3" />
                  This email is already registered as a dealer.
                </p>
                <div className="flex gap-2 text-sm">
                  <Link 
                    to="/auth" 
                    className="text-blue-600 hover:text-blue-500 flex items-center"
                  >
                    <LogIn className="mr-1 h-3 w-3" />
                    Login instead
                  </Link>
                  <span className="text-gray-400">•</span>
                  <Link 
                    to="/auth?mode=reset" 
                    className="text-blue-600 hover:text-blue-500"
                  >
                    Forgot password?
                  </Link>
                </div>
              </div>
            )}
            {emailStatus === 'available' && (
              <p className="text-sm text-green-600 flex items-center">
                <CheckCircle className="mr-1 h-3 w-3" />
                This email is available for registration.
              </p>
            )}
          </div>
          
          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="password"
                type="password"
                placeholder="Create a password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10"
                required
                minLength={6}
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <label htmlFor="confirmPassword" className="text-sm font-medium">
              Confirm Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Confirm your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="pl-10"
                required
                minLength={6}
              />
            </div>
          </div>
          
          <Button 
            type="submit" 
            className="w-full" 
            disabled={loading || emailStatus === 'exists'}
            variant={emailStatus === 'exists' ? 'outline' : 'default'}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating account...
              </>
            ) : emailStatus === 'exists' ? (
              'Email Already Registered'
            ) : (
              'Create Account'
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
