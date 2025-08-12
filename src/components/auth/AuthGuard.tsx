import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { User } from '@/api/entities';
import { Dealer } from '@/api/entities';
import { createPageUrl } from '@/utils';
import { Loader2 } from 'lucide-react';

interface AuthGuardProps {
  children: React.ReactNode;
}

export default function AuthGuard({ children }: AuthGuardProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, loading, isAuthenticated } = useAuth();
  const [isCheckingOnboarding, setIsCheckingOnboarding] = useState(false);
  const [onboardingStatus, setOnboardingStatus] = useState<'unknown' | 'completed' | 'incomplete'>('unknown');

  // List of public routes that don't require authentication
  const publicRoutes = [
    '/Authentication',
    '/EmailVerification',
    '/OnboardingPath',
    '/OnboardingWizard'
  ];

  // Check if current route is public
  const isPublicRoute = publicRoutes.some(route => 
    location.pathname === route || location.pathname.includes(route.replace('/', ''))
  );

  useEffect(() => {
    const checkAuthAndOnboarding = async () => {
      // If it's a public route, don't redirect
      if (isPublicRoute) {
        return;
      }

      // If still loading auth state, wait
      if (loading) {
        return;
      }

      // If not authenticated, redirect to authentication
      if (!isAuthenticated || !user) {
        setTimeout(() => {
          navigate(createPageUrl('Authentication'), { replace: true });
        }, 100);
        return;
      }

      // If authenticated, check onboarding and dealer profile status
      setIsCheckingOnboarding(true);
      try {
        // First, check user metadata from auth state (faster and more reliable)
        const userMetadata = user.user_metadata || {};
        const hasOnboardingCompleted = userMetadata.onboarding_completed === true;
        const hasDealerProfileCreated = userMetadata.dealer_profile_created === true;
        
        console.log('AuthGuard - User metadata check:', {
          email: user.email,
          hasOnboardingCompleted,
          hasDealerProfileCreated,
          userMetadata
        });
        
        // If user metadata shows onboarding is complete, verify by checking dealer profile
        if (hasOnboardingCompleted && hasDealerProfileCreated) {
          // Double-check by verifying dealer profile exists
          const dealerProfiles = await Dealer.filter({ created_by: user.email });
          const hasDealerProfile = dealerProfiles.length > 0;
          
          console.log('AuthGuard - Dealer profile check:', {
            dealerProfilesCount: dealerProfiles.length,
            hasDealerProfile
          });
          
          if (hasDealerProfile) {
            console.log('AuthGuard - Onboarding completed, allowing access to dashboard');
            setOnboardingStatus('completed');
            return;
          }
        }
        
        // If metadata shows incomplete or dealer profile doesn't exist, check more thoroughly
        console.log('AuthGuard - Checking more thoroughly...');
        const currentUser = await User.me();
        
        // Check if user has a dealer profile
        const dealerProfiles = await Dealer.filter({ created_by: currentUser.email });
        const hasDealerProfile = dealerProfiles.length > 0;
        
        // Check if dealer profile has completed onboarding
        let hasCompletedOnboarding = false;
        if (hasDealerProfile && dealerProfiles.length > 0) {
          const dealerProfile = dealerProfiles[0];
          hasCompletedOnboarding = dealerProfile.onboarding_completed === true;
          console.log('AuthGuard - Dealer profile onboarding status:', {
            onboarding_completed: dealerProfile.onboarding_completed,
            dealerProfile
          });
        }
        
        console.log('AuthGuard - Thorough check results:', {
          emailVerified: (currentUser as any).email_verified,
          hasDealerProfile,
          hasCompletedOnboarding
        });
        
        if (hasCompletedOnboarding) {
          console.log('AuthGuard - Onboarding completed, allowing access');
          setOnboardingStatus('completed');
        } else {
          console.log('AuthGuard - Onboarding incomplete, redirecting to onboarding');
          setOnboardingStatus('incomplete');
          // Redirect to onboarding if not completed
          setTimeout(() => {
            navigate(createPageUrl('OnboardingPath'), { replace: true });
          }, 100);
        }
      } catch (error) {
        console.error('Error checking onboarding status:', error);
        // If there's an error, assume onboarding is incomplete
        setOnboardingStatus('incomplete');
        setTimeout(() => {
          navigate(createPageUrl('OnboardingPath'), { replace: true });
        }, 100);
      } finally {
        setIsCheckingOnboarding(false);
      }
    };

    checkAuthAndOnboarding();
  }, [isAuthenticated, user?.email, loading, isPublicRoute]); // Removed navigate and location.pathname to prevent loops

  // Show loading while checking authentication or onboarding
  if (loading || isCheckingOnboarding) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-slate-600">
            {loading ? 'Checking authentication...' : 'Checking onboarding status...'}
          </p>
        </div>
      </div>
    );
  }

  // If it's a public route, render children directly
  if (isPublicRoute) {
    return <>{children}</>;
  }

  // If not authenticated, show loading (navigation will happen in useEffect)
  if (!isAuthenticated || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-slate-600">Redirecting to authentication...</p>
        </div>
      </div>
    );
  }

  // If onboarding is incomplete, show loading (navigation will happen in useEffect)
  if (onboardingStatus === 'incomplete') {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-slate-600">Redirecting to onboarding...</p>
        </div>
      </div>
    );
  }

  // If everything is good, render the protected content
  return <>{children}</>;
}
