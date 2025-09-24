import React, { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Globe2, Check } from 'lucide-react';

type LangOption = {
  code: string;
  label: string; // English name
  native: string; // Native script name
  isDefault?: boolean;
};

const LANGUAGE_OPTIONS: LangOption[] = [
  { code: 'en', label: 'English', native: 'English', isDefault: true },
  { code: 'hi', label: 'Hindi', native: 'हिंदी' },
  { code: 'te', label: 'Telugu', native: 'తెలుగు' },
  { code: 'ta', label: 'Tamil', native: 'தமிழ்' },
  { code: 'ml', label: 'Malayalam', native: 'മലയാളം' },
  { code: 'kn', label: 'Kannada', native: 'ಕನ್ನಡ' },
  { code: 'mr', label: 'Marathi', native: 'मराठी' },
  { code: 'pa', label: 'Punjabi', native: 'ਪੰਜਾਬੀ' },
  { code: 'ur', label: 'Urdu', native: 'اردو' },
  { code: 'bn', label: 'Bengali', native: 'বাংলা' },
  { code: 'ne', label: 'Nepali', native: 'नेपाली' },
  { code: 'doi', label: 'Dogri', native: 'डोगरी' },
  { code: 'as', label: 'Assamese', native: 'অসমীয়া' }
];

declare global {
  interface Window {
    google?: any;
    googleTranslateElementInit?: () => void;
    __gt_ready?: boolean;
  }
}

export default function LanguageTranslator() {
  const [currentLang, setCurrentLang] = useState<string>(() => {
    try { return localStorage.getItem('aura.ui.lang') || 'en'; } catch { return 'en'; }
  });
  const initializedRef = useRef<boolean>(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // Lazy load Google Translate script only once
    if (initializedRef.current) return;
    initializedRef.current = true;

    const initTranslate = () => {
      try {
        if (!window.google?.translate) return;
        // @ts-ignore - types not available
        new window.google.translate.TranslateElement({
          pageLanguage: 'en',
          autoDisplay: false,
          includedLanguages: LANGUAGE_OPTIONS.map(l => l.code).join(','),
          layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE
        }, 'google_translate_element');
        injectCosmeticStyles();
        startBannerObserver();
        // Apply previously chosen language after widget mounts
        ensureWidgetReady().then(() => {
          if (currentLang && currentLang !== 'en') {
            applyLanguage(currentLang);
          }
        });
      } catch {}
    };

    if (!window.googleTranslateElementInit) {
      window.googleTranslateElementInit = initTranslate;
    }

    // If script in index.html marked ready, initialize; otherwise wait until ready
    let attempts = 0;
    const waitUntilReady = () => {
      attempts += 1;
      if (window.__gt_ready && window.google) { initTranslate(); return; }
      if (attempts > 150) { // ~15s
        console.warn('Google Translate script not ready after waiting.');
        return;
      }
      setTimeout(waitUntilReady, 100);
    };
    waitUntilReady();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const injectCosmeticStyles = () => {
    if (document.getElementById('gt-cosmetic-style')) return;
    const style = document.createElement('style');
    style.id = 'gt-cosmetic-style';
    style.innerHTML = `
      .goog-logo-link, .goog-te-gadget { display: none !important; }
      .goog-te-banner-frame.skiptranslate, .goog-te-gadget-icon { display: none !important; }
      .goog-te-banner-frame { display: none !important; visibility: hidden !important; height: 0 !important; }
      .goog-te-balloon-frame { display: none !important; }
      #goog-gt-tt { display: none !important; visibility: hidden !important; }
      body { top: 0 !important; }
    `;
    document.head.appendChild(style);
  };

  let bannerObserver: MutationObserver | null = null;
  const startBannerObserver = () => {
    try {
      if (bannerObserver) return;
      const hideBanner = () => suppressGoogleBannerTemporarily();
      bannerObserver = new MutationObserver(() => hideBanner());
      bannerObserver.observe(document.documentElement, { childList: true, subtree: true, attributes: true, attributeFilter: ['style', 'class'] });
      hideBanner();
    } catch {}
  };

  const ensureWidgetReady = async (): Promise<HTMLSelectElement | null> => {
    const maxWaitMs = 10000;
    const start = Date.now();
    return new Promise((resolve) => {
      const tick = () => {
        const combo: HTMLSelectElement | null = document.querySelector('.goog-te-combo');
        if (combo) return resolve(combo);
        if (Date.now() - start > maxWaitMs) return resolve(null);
        requestAnimationFrame(tick);
      };
      tick();
    });
  };

  const applyLanguage = (langCode: string) => {
    const combo: HTMLSelectElement | null = document.querySelector('.goog-te-combo');
    if (combo) {
      combo.value = langCode;
      const event = document.createEvent('HTMLEvents');
      event.initEvent('change', true, true);
      combo.dispatchEvent(event);
      // Trigger twice as some browsers ignore the first change for hidden elements
      setTimeout(() => combo.dispatchEvent(event), 50);
      // Hide any banner that might appear for a short time
      suppressGoogleBannerTemporarily();
    } else {
      // Retry by re-initializing the widget if combo is missing
      try {
        // @ts-ignore
        if (window.google?.translate) {
          new window.google.translate.TranslateElement({ pageLanguage: 'en', autoDisplay: false }, 'google_translate_element');
        }
      } catch {}
    }
  };

  const suppressGoogleBannerTemporarily = (aggressive: boolean = false) => {
    const hide = () => {
      try {
        const bannerFrame: HTMLIFrameElement | null = document.querySelector('iframe.goog-te-banner-frame');
        if (bannerFrame && bannerFrame.style) {
          bannerFrame.style.display = 'none';
          bannerFrame.style.visibility = 'hidden';
          bannerFrame.style.height = '0px';
        }
        if (aggressive) {
          document.querySelectorAll('iframe.goog-te-banner-frame').forEach((el) => {
            try { el.parentNode && el.parentNode.removeChild(el); } catch {}
          });
        }
        const tt = document.getElementById('goog-gt-tt');
        if (tt) tt.style.display = 'none';
        document.body.style.top = '0px';
      } catch {}
    };
    hide();
    const interval = setInterval(hide, 100);
    setTimeout(() => clearInterval(interval), 5000);
  };

  const changeLanguage = (langCode: string) => {
    console.log('[Translator] changeLanguage clicked:', langCode);
    // Proactively hide banner the moment user selects a language
    suppressGoogleBannerTemporarily(true);
    setCurrentLang(langCode);
    try { localStorage.setItem('aura.ui.lang', langCode); } catch {}
    ensureWidgetReady().then((combo) => {
      if (combo) {
        console.log('[Translator] widget ready, applying via select/change');
        applyLanguage(langCode);
      } else {
        console.warn('[Translator] widget not ready, using cookie fallback');
        setGoogleTranslateCookie(langCode);
        // Reload to let Google script read cookie and translate
        setTimeout(() => window.location.reload(), 150);
      }
    });
  };

  const setGoogleTranslateCookie = (langCode: string) => {
    const path = '/en/' + langCode;
    try {
      document.cookie = `googtrans=${path};expires=Tue, 31 Dec 2030 23:59:59 GMT;path=/`;
      document.cookie = `googtrans=${path};expires=Tue, 31 Dec 2030 23:59:59 GMT;path=/;domain=${window.location.hostname}`;
    } catch (e) {
      console.warn('[Translator] failed to set cookie fallback', e);
    }
  };

  return (
    <div className="relative">
      {/* Off-screen container required by Google Translate (cannot be display:none) */}
      <div ref={containerRef} id="google_translate_element" className="absolute -z-50 opacity-0 pointer-events-none" />

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="relative" aria-label="Translate">
            <Globe2 className="w-5 h-5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-72 p-0 overflow-hidden z-[60]">
          <div className="px-4 pt-3 pb-2">
            <div className="flex items-center gap-2 text-slate-200">
              <Globe2 className="w-4 h-4" />
              <DropdownMenuLabel className="p-0">Select Language</DropdownMenuLabel>
            </div>
            <p className="text-xs text-slate-400 mt-1">Choose your preferred language</p>
          </div>
          <DropdownMenuSeparator />
          <div className="max-h-80 overflow-y-auto py-1">
            {LANGUAGE_OPTIONS.map((opt) => (
              <DropdownMenuItem key={opt.code} className="py-2 px-3" onClick={() => changeLanguage(opt.code)}>
                <div className="flex items-center w-full">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className={currentLang === opt.code ? 'font-semibold' : ''}>{opt.label}</span>
                      {opt.isDefault && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-700 text-slate-200">Default</span>
                      )}
                    </div>
                    <div className="text-xs text-slate-400 leading-tight">{opt.native}</div>
                  </div>
                  {currentLang === opt.code && <Check className="w-4 h-4 text-blue-500 ml-2" />}
                </div>
              </DropdownMenuItem>
            ))}
          </div>
          <DropdownMenuSeparator />
          <div className="px-4 py-2 text-[11px] text-slate-400">Language changes will be applied across the entire application</div>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}


