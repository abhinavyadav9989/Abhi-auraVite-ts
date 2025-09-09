import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Loader2, Mail, Lock, User, CheckCircle, Car } from 'lucide-react';
import { createPageUrl } from '@/utils';
import ThemeToggle from '@/components/ui/ThemeToggle';

export default function Authentication() {
  const navigate = useNavigate();
  const { signIn, signUpWithEmailCheck, loading, error, clearError, isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState('login');
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const [registrationEmail, setRegistrationEmail] = useState('');

  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Registration form state
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [regFullName, setRegFullName] = useState('');

  // Handle login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    try {
      await signIn(loginEmail, loginPassword);
      // On successful login, let AuthGuard handle the routing
      // AuthGuard will check if user needs onboarding or can go to dashboard
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  // Handle registration
  const handleRegistration = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    if (regPassword !== regConfirmPassword) {
      alert('Passwords do not match');
      return;
    }

    try {
      const result = await signUpWithEmailCheck(regEmail, regPassword, regFullName);
      console.log('Registration successful:', result);

      // Show success message
      setRegistrationSuccess(true);
      setRegistrationEmail(regEmail);

      // Clear registration form
      setRegEmail('');
      setRegPassword('');
      setRegConfirmPassword('');
      setRegFullName('');

      // After successful registration, stay on login page and show success message
      // User should login with their new credentials
      setTimeout(() => {
        setActiveTab('login');
        setLoginEmail(regEmail);
      }, 2000);

    } catch (error) {
      console.error('Registration failed:', error);
    }
  };

  // Intro video control
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [showOverlay, setShowOverlay] = useState(false);
  const [skipped, setSkipped] = useState(false);
  const prefersReducedMotion = useMemo(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }, []);

  useEffect(() => {
    if (prefersReducedMotion) {
      setShowOverlay(true);
      return;
    }
    const vid = videoRef.current;
    if (!vid) return;

    let timer: number | undefined;
    const scheduleReveal = () => {
      if (!vid.duration || Number.isNaN(vid.duration)) return;
      const remainMs = Math.max(0, (vid.duration - 1) * 1000);
      window.clearTimeout(timer);
      timer = window.setTimeout(() => setShowOverlay(true), remainMs);
    };

    const handleLoaded = () => scheduleReveal();
    const handleEnded = () => setShowOverlay(true);

    vid.addEventListener('loadedmetadata', handleLoaded, { once: true });
    vid.addEventListener('ended', handleEnded);
    // Fallback: if metadata never fires, reveal after 6s
    timer = window.setTimeout(() => setShowOverlay(true), 6000);

    return () => {
      window.clearTimeout(timer);
      vid.removeEventListener('ended', handleEnded);
    };
  }, [prefersReducedMotion]);

  // If user is already authenticated, check if they need onboarding or can go to dashboard
  if (isAuthenticated) {
    // Let AuthGuard handle the routing logic
    return null;
  }

  return (
    <div className="min-h-screen relative">
      {/* Background video layer */}
      {!prefersReducedMotion && (
        <video
          ref={videoRef}
          className="absolute inset-0 h-full w-full object-contain md:object-cover pointer-events-none"
          autoPlay
          muted
          playsInline
          preload="metadata"
          poster="/poster.jpg"
          onError={() => setShowOverlay(true)}
        >
          <source src="/aura_login_page.mp4" type="video/mp4" />
        </video>
      )}

      {/* Dark overlay to ensure readability when form appears */}
      <div className="absolute inset-0 bg-black/60 md:bg-black/50" />

      {/* Top-right controls */}
      <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
        <ThemeToggle />
        {!showOverlay && (
          <Button variant="secondary" onClick={() => { setSkipped(true); setShowOverlay(true); }}>
            {skipped ? 'Loading…' : 'Skip'}
          </Button>
        )}
      </div>

      {/* Content layer */}
      <div className={`relative z-20 mx-auto px-4 py-8 min-h-screen transition-opacity duration-500 will-change-opacity ${showOverlay ? 'opacity-100' : 'opacity-0'} flex items-center justify-center`}>
        {/* Brand pinned top-left on md+ */}
        <div className="hidden md:flex absolute top-16 left-12 items-start">
          <div className="text-left">
            <div className="flex items-center mb-4">
              <Car className="w-12 h-12 text-blue-500" />
            </div>
            <h1 className="text-4xl font-bold text-white mb-2 drop-shadow">Welcome to Aura</h1>
            <p className="text-slate-200/90">Your vehicle marketplace platform</p>
          </div>
        </div>

        {/* Auth column centered */}
        <div className="w-full max-w-md md:max-w-lg mx-auto">
          {/* Registration Success Message */}
          {registrationSuccess && (
            <Card className="mb-6 border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                  <div>
                    <h4 className="font-medium text-green-900 dark:text-green-100">Registration Successful!</h4>
                    <p className="text-sm text-green-700 dark:text-green-300">
                      Account created for {registrationEmail}. Please check your email for verification.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Authentication Card */}
          <Card className="shadow-xl">
            <CardHeader className="pb-4">
              <CardTitle className="text-center text-xl">Sign in to your account</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-6">
                  <TabsTrigger value="login">Login</TabsTrigger>
                  <TabsTrigger value="register">Register</TabsTrigger>
                </TabsList>

                {/* Login Tab */}
                <TabsContent value="login" className="space-y-4">
                  {error && (
                    <Alert variant="destructive">
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}

                  <form onSubmit={handleLogin} className="space-y-4">
                    <div className="space-y-2">
                      <label htmlFor="login-email" className="text-sm font-medium">
                        Email
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          id="login-email"
                          type="email"
                          placeholder="Enter your email"
                          value={loginEmail}
                          onChange={(e) => setLoginEmail(e.target.value)}
                          className="pl-10"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="login-password" className="text-sm font-medium">
                        Password
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          id="login-password"
                          type="password"
                          placeholder="Enter your password"
                          value={loginPassword}
                          onChange={(e) => setLoginPassword(e.target.value)}
                          className="pl-10"
                          required
                        />
                      </div>
                    </div>

                    <Button
                      type="submit"
                      className="w-full"
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Signing in...
                        </>
                      ) : (
                        'Sign In'
                      )}
                    </Button>
                  </form>
                </TabsContent>

                {/* Register Tab */}
                <TabsContent value="register" className="space-y-4">
                  {error && (
                    <Alert variant="destructive">
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}

                  <form onSubmit={handleRegistration} className="space-y-4">
                    <div className="space-y-2">
                      <label htmlFor="reg-fullname" className="text-sm font-medium">
                        Full Name
                      </label>
                      <div className="relative">
                        <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          id="reg-fullname"
                          type="text"
                          placeholder="Enter your full name"
                          value={regFullName}
                          onChange={(e) => setRegFullName(e.target.value)}
                          className="pl-10"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="reg-email" className="text-sm font-medium">
                        Email
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          id="reg-email"
                          type="email"
                          placeholder="Enter your email"
                          value={regEmail}
                          onChange={(e) => setRegEmail(e.target.value)}
                          className="pl-10"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="reg-password" className="text-sm font-medium">
                        Password
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          id="reg-password"
                          type="password"
                          placeholder="Create a password"
                          value={regPassword}
                          onChange={(e) => setRegPassword(e.target.value)}
                          className="pl-10"
                          required
                          minLength={6}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="reg-confirm-password" className="text-sm font-medium">
                        Confirm Password
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          id="reg-confirm-password"
                          type="password"
                          placeholder="Confirm your password"
                          value={regConfirmPassword}
                          onChange={(e) => setRegConfirmPassword(e.target.value)}
                          className="pl-10"
                          required
                          minLength={6}
                        />
                      </div>
                    </div>

                    <Button
                      type="submit"
                      className="w-full"
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Creating account...
                        </>
                      ) : (
                        'Create Account'
                      )}
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* Footer */}
          <div className="text-center mt-6 text-sm text-slate-200/80">
            <p>By continuing, you agree to our Terms of Service and Privacy Policy</p>
          </div>
        </div>
      </div>
    </div>
  );
}
