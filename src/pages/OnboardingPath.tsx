import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Loader2 } from 'lucide-react';

export default function OnboardingPath() {
  const navigate = useNavigate();

  useEffect(() => {
    // Immediately redirect to the new comprehensive wizard
    navigate(createPageUrl('OnboardingWizard'), { replace: true });
  }, [navigate]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-100">
      <Loader2 className="w-8 h-8 animate-spin text-blue-600 mb-4" />
      <p className="text-slate-600">Redirecting to the onboarding process...</p>
    </div>
  );
}