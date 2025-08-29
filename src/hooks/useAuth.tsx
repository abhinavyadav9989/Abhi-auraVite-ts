import { useState, useEffect } from 'react';
import { supabase } from '@/api/supabaseClient';
import type { User, Session } from '@supabase/supabase-js';

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
        // Check if it's an unverified email error
        if (error.message.includes('Email not confirmed') || error.message.includes('Invalid login credentials')) {
          // Try to resend verification email
          const { error: resendError } = await supabase.auth.resend({
            type: 'signup',
            email: email
          });
          
          if (resendError) {
            throw new Error('Failed to resend verification email. Please try again.');
          }
          
          throw new Error('Email not verified. A new verification email has been sent to your inbox.');
        }
        
        throw error;
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
