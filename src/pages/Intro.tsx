import React, { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';

interface IntroProps {
  onComplete?: () => void;
}

export default function Intro({ onComplete }: IntroProps) {
  const prefersReducedMotion = useMemo(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }, []);

  const [skipped, setSkipped] = useState(false);

  useEffect(() => {
    if (prefersReducedMotion) {
      localStorage.setItem('introSeen', 'true');
      onComplete?.();
    }
  }, [prefersReducedMotion, onComplete]);

  if (prefersReducedMotion) {
    return null;
  }

  const handleFinish = () => {
    localStorage.setItem('introSeen', 'true');
    onComplete?.();
  };

  const handleSkip = () => {
    setSkipped(true);
    handleFinish();
  };

  return (
    <div className="relative h-screen w-screen bg-black">
      <video
        className="h-full w-full object-cover"
        autoPlay
        muted
        playsInline
        onEnded={handleFinish}
        onError={handleFinish}
        poster="/poster.jpg"
      >
        <source src="/aura_login_page.mp4" type="video/mp4" />
      </video>

      <div className="absolute inset-0 flex items-start justify-end p-4">
        <Button variant="secondary" onClick={handleSkip}>
          {skipped ? 'Loading…' : 'Skip'}
        </Button>
      </div>
    </div>
  );
}


