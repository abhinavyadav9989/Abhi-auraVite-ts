import { useState, useEffect } from 'react';
import { supabase } from '@/api/supabaseClient';
import type { User, Session } from '@supabase/supabase-js';
import { NotificationService } from '@/services/notificationService';

interface AuthState {
  user: User | null;
  session: Session | null;
  loading: boolean;
  error: string | null;
  // restored baseline (no team member context)
}

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    session: null,
    loading: true,
    error: null
  });

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) throw error;
        
        setAuthState({
          user: session?.user ?? null,
          session,
          loading: false,
          error: null
        });
      } catch (error) {
        setAuthState(prev => ({
          ...prev,
          loading: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        }));
      }
    };

    getInitialSession();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email);
        
        setAuthState({
          user: session?.user ?? null,
          session,
          loading: false,
          error: null
        });

        // First-login welcome: create once per device or if not present in DB
        try {
          if ((event === 'SIGNED_IN' || event === 'USER_UPDATED') && session?.user?.id) {
            const storageKey = `aura_welcome_shown_${session.user.id}`;
            const hasShown = localStorage.getItem(storageKey) === '1';
            
            console.log(`🔔 Welcome notification check - Event: ${event}, HasShown: ${hasShown}`);
            
            if (!hasShown) {
              // Get dealer ID for the authenticated user
              try {
                const { Dealer } = await import('@/api/entityAdapters');
                const { NotificationService } = await import('@/services/notificationService');
                
                console.log(`🔍 Looking for dealer profile for: ${session.user.email}`);
                const dealerProfiles = await Dealer.filter({ created_by: session.user.email });
                
                console.log(`📊 Dealer profiles found: ${dealerProfiles?.length || 0}`);
                
                if (dealerProfiles && dealerProfiles.length > 0) {
                  const dealerId = dealerProfiles[0].id;
                  const dealerName = dealerProfiles[0].business_name || dealerProfiles[0].name;
                  
                  console.log(`🎉 Creating welcome notification for dealer: ${dealerId} (${dealerName})`);
                  await NotificationService.createWelcomeNotification(dealerId, dealerName);
                  console.log(`✅ Welcome notification created successfully`);
                } else {
                  console.log(`⏳ No dealer profile found yet, will try again later`);
                }
              } catch (notificationError) {
                console.warn('Welcome notification creation failed:', notificationError);
              }
              localStorage.setItem(storageKey, '1');
            }
          }
        } catch (e) {
          console.warn('Welcome notification setup failed:', e);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  // removed team member linking for now (restored baseline)

  // Sign in method
  const signIn = async (email: string, password: string) => {
    setAuthState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) {
        // Handle different types of errors with specific messages
        if (error.message.includes('Email not confirmed')) {
          // Only resend verification if it's specifically an unverified email
          const { error: resendError } = await supabase.auth.resend({
            type: 'signup',
            email: email
          });
          
          if (resendError) {
            throw new Error('Email not verified. Please check your inbox for verification email.');
          }
          
          throw new Error('Email not verified. A new verification email has been sent to your inbox.');
        } else if (error.message.includes('Invalid login credentials')) {
          // Check if email exists in our system to provide better error message
          try {
            const emailExists = await checkDealerEmailExists(email);
            if (emailExists) {
              throw new Error('Incorrect password. Please check your password and try again.');
            } else {
              throw new Error('No account found with this email address. Please check your email or register for a new account.');
            }
          } catch (checkError) {
            // If we can't check email existence, fall back to generic message
            throw new Error('Incorrect email or password. Please check your credentials and try again.');
          }
        } else if (error.message.includes('Too many requests')) {
          throw new Error('Too many login attempts. Please wait a few minutes before trying again.');
        } else {
          throw new Error(error.message || 'Sign in failed. Please try again.');
        }
      }
      
      return data;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Sign in failed';
      setAuthState(prev => ({ ...prev, error: errorMessage }));
      throw error;
    } finally {
      setAuthState(prev => ({ ...prev, loading: false }));
    }
  };

  // Check if email already exists in dealers table
  const checkDealerEmailExists = async (email: string): Promise<boolean> => {
    console.log('🔍 Checking email existence for:', email);
    try {
      // Try the main function first
      let { data, error } = await supabase
        .rpc('check_dealer_email_exists', { email_to_check: email });
      
      console.log('📊 Email check result (main):', { data, error });
      console.log('📊 Data type:', typeof data);
      console.log('📊 Data value:', data);
      
      // If main function fails or returns false, try the simple function
      if (error || data === false) {
        console.log('🔄 Trying simple function...');
        const simpleResult = await supabase
          .rpc('check_email_simple', { email_to_check: email });
        
        console.log('📊 Email check result (simple):', simpleResult);
        data = simpleResult.data;
        error = simpleResult.error;
      }
      
      if (error) {
        console.error('❌ Error checking dealer email existence:', error);
        return false; // Assume user doesn't exist on error
      }
      
      const exists = Boolean(data);
      console.log('✅ Email exists (final):', exists);
      console.log('✅ Data converted to boolean:', Boolean(data));
      return exists;
    } catch (error) {
      console.error('❌ Error checking dealer email existence:', error);
      return false; // Assume user doesn't exist on error
    }
  };

  // Alternative method to check email existence (direct table query)
  const checkDealerEmailExistsDirect = async (email: string): Promise<boolean> => {
    console.log('🔍 Checking email existence directly for:', email);
    try {
      const { data, error } = await supabase
        .from('dealers')
        .select('email')
        .eq('email', email)
        .single();
      
      console.log('📊 Direct email check result:', { data, error });
      
      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        console.error('❌ Error in direct email check:', error);
        return false;
      }
      
      const exists = !!data;
      console.log('✅ Email exists (direct):', exists);
      return exists;
    } catch (error) {
      console.error('❌ Error in direct email check:', error);
      return false;
    }
  };

  // Sign up method with email existence check
  const signUpWithEmailCheck = async (email: string, password: string, fullName?: string) => {
    setAuthState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      // First check if email already exists in dealers table using SQL function
      const emailExists = await checkDealerEmailExists(email);
      
      if (emailExists) {
        const errorMessage = 'An account with this email already exists. Please login instead.';
        setAuthState(prev => ({ ...prev, error: errorMessage, loading: false }));
        throw new Error(errorMessage);
      }
      
      // If email doesn't exist, proceed with sign up
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName || email.split('@')[0],
          }
        }
      });
      
      if (error) throw error;
      
      return data;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Sign up failed';
      setAuthState(prev => ({ ...prev, error: errorMessage }));
      throw error;
    } finally {
      setAuthState(prev => ({ ...prev, loading: false }));
    }
  };

  // Resend verification email
  const resendVerificationEmail = async (email: string) => {
    setAuthState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email
      });
      
      if (error) throw error;
      
      setAuthState(prev => ({ 
        ...prev, 
        loading: false,
        error: null 
      }));
      
      return { success: true, message: 'Verification email sent successfully!' };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to resend verification email';
      setAuthState(prev => ({ ...prev, error: errorMessage }));
      throw error;
    } finally {
      setAuthState(prev => ({ ...prev, loading: false }));
    }
  };

  // Sign out method
  const signOut = async () => {
    setAuthState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Sign out failed';
      setAuthState(prev => ({ ...prev, error: errorMessage }));
      throw error;
    } finally {
      setAuthState(prev => ({ ...prev, loading: false }));
    }
  };

  // Update user data
  const updateUser = async (data: any) => {
    setAuthState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const { data: result, error } = await supabase.auth.updateUser(data);
      if (error) throw error;
      
      // Update the local state with the new user data
      setAuthState(prev => ({ 
        ...prev, 
        user: result.user,
        loading: false 
      }));
      
      return result.user;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Update failed';
      setAuthState(prev => ({ ...prev, error: errorMessage }));
      throw error;
    } finally {
      setAuthState(prev => ({ ...prev, loading: false }));
    }
  };

  // Clear error
  const clearError = () => {
    setAuthState(prev => ({ ...prev, error: null }));
  };

  // Refresh auth state manually
  const refreshAuth = async () => {
    setAuthState(prev => ({ ...prev, loading: true }));
    
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) throw error;
      
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) throw sessionError;
      
      setAuthState(prev => ({
        ...prev,
        user: user,
        session,
        loading: false,
        error: null
      }));
      
      return { user, session };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Refresh failed';
      setAuthState(prev => ({ 
        ...prev, 
        loading: false, 
        error: errorMessage 
      }));
      throw error;
    }
  };

  return {
    user: authState.user,
    session: authState.session,
    loading: authState.loading,
    error: authState.error,
    signIn,
    signUp: signUpWithEmailCheck,
    signUpWithEmailCheck,
    checkDealerEmailExists,
    checkDealerEmailExistsDirect,
    resendVerificationEmail,
    signOut,
    updateUser,
    clearError,
    refreshAuth,
    isAuthenticated: !!authState.user
  };
}
