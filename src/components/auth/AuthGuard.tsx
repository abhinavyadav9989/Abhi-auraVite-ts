import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { User } from '@/api/entities';
import { Dealer } from '@/api/entities';
import { createPageUrl } from '@/utils';
import { Loader2 } from 'lucide-react';
import { supabase } from '@/api/supabaseClient';

interface AuthGuardProps {
  children: React.ReactNode;
}

export default function AuthGuard({ children }: AuthGuardProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, loading, isAuthenticated } = useAuth();
  const [isCheckingOnboarding, setIsCheckingOnboarding] = useState(false);
  const [onboardingStatus, setOnboardingStatus] = useState<'unknown' | 'completed' | 'incomplete'>('unknown');
  const [hasNavigated, setHasNavigated] = useState(false);

  // List of public routes that don't require authentication
  const publicRoutes = [
    '/',
    '/Authentication',
    '/EmailVerification',
    '/OnboardingPath',
    '/OnboardingWizard'
  ];

  // Check if current route is public
  const isPublicRoute = publicRoutes.some(route => 
    location.pathname === route || location.pathname.includes(route.replace('/', ''))
  );

  // Reset navigation flag when location changes
  useEffect(() => {
    setHasNavigated(false);
  }, [location.pathname]);

  useEffect(() => {
    const checkAuthAndOnboarding = async () => {
      // If still loading auth state, wait
      if (loading) {
        return;
      }

      // If not authenticated, redirect to authentication
      if (!isAuthenticated || !user) {
        // Only redirect to authentication if not already on a public route
        if (!isPublicRoute && !hasNavigated && location.pathname !== createPageUrl('Authentication')) {
          setHasNavigated(true);
          setTimeout(() => {
            navigate(createPageUrl('Authentication'), { replace: true });
          }, 100);
        }
        return;
      }

      // If authenticated and on a public route, redirect to dashboard
      if (isAuthenticated && user && isPublicRoute) {
        console.log('AuthGuard - User authenticated on public route, checking onboarding status...');
        
        // Check onboarding status before redirecting
        setIsCheckingOnboarding(true);
        try {
          // Check user metadata first
          const userMetadata = user.user_metadata || {};
          const hasOnboardingCompleted = userMetadata.onboarding_completed === true;
          const hasDealerProfileCreated = userMetadata.dealer_profile_created === true;
          
          console.log('AuthGuard - Authenticated user on public route, metadata check:', {
            hasOnboardingCompleted,
            hasDealerProfileCreated,
            userMetadata
          });
          
          // For OnboardingWizard route, don't redirect away unless onboarding is truly completed
          if (location.pathname === '/OnboardingWizard') {
            console.log('AuthGuard - User on OnboardingWizard, checking if they should stay here...');
            
            // If user metadata shows completed but they're on OnboardingWizard, clear the metadata
            if (hasOnboardingCompleted || hasDealerProfileCreated) {
              console.log('AuthGuard - User metadata shows completed but on OnboardingWizard, clearing metadata...');
              try {
                await supabase.auth.updateUser({
                  data: {
                    onboarding_completed: false,
                    dealer_profile_created: false,
                    dealer_id: null
                  }
                });
                console.log('AuthGuard - User metadata cleared successfully');
                // Let them stay on OnboardingWizard
                setOnboardingStatus('incomplete');
                return;
              } catch (clearError) {
                console.error('AuthGuard - Error clearing user metadata:', clearError);
              }
            }
            
            // If onboarding is not completed, let them stay on OnboardingWizard
            console.log('AuthGuard - Onboarding not completed, allowing user to stay on OnboardingWizard');
            setOnboardingStatus('incomplete');
            return;
          }
          
          // For other public routes (like /Authentication), redirect based on onboarding status
          if (hasOnboardingCompleted && hasDealerProfileCreated) {
            // User has completed onboarding, redirect to dashboard
            console.log('AuthGuard - Onboarding completed, redirecting to dashboard');
            setTimeout(() => {
              navigate(createPageUrl('Dashboard'), { replace: true });
            }, 100);
            return;
          } else {
            // User needs to complete onboarding
            console.log('AuthGuard - Onboarding incomplete, redirecting to onboarding');
            setTimeout(() => {
              navigate(createPageUrl('OnboardingWizard'), { replace: true });
            }, 100);
            return;
          }
        } catch (error) {
          console.error('AuthGuard - Error checking onboarding status:', error);
          // Default to onboarding if there's an error
          setTimeout(() => {
            navigate(createPageUrl('OnboardingWizard'), { replace: true });
          }, 100);
          return;
        } finally {
          setIsCheckingOnboarding(false);
        }
      }

      // If authenticated and not on public route, check onboarding and dealer profile status
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
        
        // Progressive Disclosure: Check for minimal profile completion
        let hasMinimalProfile = false;
        if (hasDealerProfile && dealerProfiles.length > 0) {
          const dealerProfile = dealerProfiles[0];
          
          // Check if dealer has minimal required information
          hasMinimalProfile = !!(
            dealerProfile.business_name && 
            dealerProfile.business_type && 
            dealerProfile.email && 
            dealerProfile.onboarding_completed === true
          );
          
          console.log('AuthGuard - Progressive onboarding check:', {
            business_name: dealerProfile.business_name,
            business_type: dealerProfile.business_type,
            email: dealerProfile.email,
            onboarding_completed: dealerProfile.onboarding_completed,
            hasMinimalProfile
          });
          
          // If dealer profile has minimal info but user metadata doesn't reflect it,
          // update the user metadata
          if (hasMinimalProfile && !hasOnboardingCompleted) {
            console.log('AuthGuard - Updating user metadata for progressive onboarding');
            try {
              await supabase.auth.updateUser({
                data: {
                  onboarding_completed: true,
                  dealer_profile_created: true,
                  dealer_id: dealerProfile.id
                }
              });
              console.log('AuthGuard - User metadata updated successfully');
            } catch (updateError) {
              console.error('AuthGuard - Error updating user metadata:', updateError);
              // Continue anyway - the dealer profile is the source of truth
            }
          }
        }
        
        console.log('AuthGuard - Progressive disclosure check results:', {
          emailVerified: (currentUser as any).email_verified,
          hasDealerProfile,
          hasMinimalProfile
        });
        
        if (hasMinimalProfile) {
          console.log('AuthGuard - Minimal profile completed, allowing dashboard access');
          setOnboardingStatus('completed');
        } else {
          console.log('AuthGuard - Minimal profile incomplete, redirecting to simplified onboarding');
          setOnboardingStatus('incomplete');
          // Redirect to simplified onboarding (with protection against loops)
          if (!hasNavigated && location.pathname !== createPageUrl('OnboardingWizard')) {
            setHasNavigated(true);
            setTimeout(() => {
              navigate(createPageUrl('OnboardingWizard'), { replace: true });
            }, 100);
          }
        }
      } catch (error) {
        console.error('Error checking onboarding status:', error);
        // If there's an error, assume onboarding is incomplete
        setOnboardingStatus('incomplete');
        setTimeout(() => {
          navigate(createPageUrl('OnboardingWizard'), { replace: true });
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

  // If it's a public route, render children directly (but only if not authenticated)
  if (isPublicRoute && (!isAuthenticated || !user)) {
    return <>{children}</>;
  }

  // If authenticated user is on a public route, show loading (navigation will happen in useEffect)
  if (isAuthenticated && user && isPublicRoute) {
    // Special case: if user is on OnboardingWizard and onboarding is not completed, let them stay
    if (location.pathname === '/OnboardingWizard') {
      return <>{children}</>;
    }
    
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-slate-600">Redirecting...</p>
        </div>
      </div>
    );
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
