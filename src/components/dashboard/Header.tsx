import React, { useEffect } from 'react';
import { Globe, Wifi, WifiOff, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DashboardMode } from '../AgriTechDashboard';

// TypeScript declarations for Google Translate
declare global {
  interface Window {
    google: {
      translate: {
        TranslateElement: any;
      };
    };
  }
}

interface HeaderProps {
  mode: DashboardMode;
  onModeChange: (mode: DashboardMode) => void;
  onRefreshData: () => void;
}

// Hide the Google Translate banner and style the widget
const injectTranslateStyles = () => {
  const style = document.createElement('style');
  style.textContent = `
    .goog-te-banner-frame.skiptranslate { display: none !important; }
    body { top: 0px !important; }
    .goog-te-gadget { font-family: inherit !important; }
    .goog-te-gadget-simple { 
      background: linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(34, 197, 94, 0.2)) !important;
      border: 1px solid rgba(16, 185, 129, 0.3) !important;
      border-radius: 0.75rem !important;
      color: white !important;
      font-size: 12px !important;
      padding: 8px 12px !important;
      min-width: 100px !important;
      max-width: 150px !important;
      white-space: nowrap !important;
      overflow: hidden !important;
      transition: all 0.3s ease !important;
      backdrop-filter: blur(10px) !important;
      display: block !important;
      visibility: visible !important;
    }
    .goog-te-gadget-simple:hover {
      background: linear-gradient(135deg, rgba(16, 185, 129, 0.3), rgba(34, 197, 94, 0.3)) !important;
      border-color: rgba(16, 185, 129, 0.5) !important;
      transform: translateY(-1px) !important;
    }
    @media (max-width: 639px) {
      .goog-te-gadget-simple { 
        font-size: 14px !important;
        padding: 10px 16px !important;
        min-width: 120px !important;
        max-width: 200px !important;
        width: 100% !important;
        text-align: center !important;
      }
    }
    @media (min-width: 640px) {
      .goog-te-gadget-simple { 
        font-size: 13px !important;
        padding: 10px 14px !important;
        min-width: 110px !important;
        max-width: 140px !important;
      }
    }
    @media (min-width: 1024px) {
      .goog-te-gadget-simple { 
        font-size: 14px !important;
        padding: 12px 16px !important;
        max-width: none !important;
      }
    }
    .goog-te-gadget-simple .goog-te-menu-value {
      color: white !important;
      font-weight: 500 !important;
    }
    .goog-te-gadget-simple .goog-te-menu-value:before {
      content: "🌐 ";
      margin-right: 4px !important;
    }
    .goog-te-menu-frame { 
      z-index: 9999 !important; 
      border-radius: 8px !important;
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3) !important;
    }
    #google_translate_element {
      display: block !important;
      visibility: visible !important;
    }
  `;
  document.head.appendChild(style);
};

export const Header: React.FC<HeaderProps> = ({ mode, onModeChange, onRefreshData }) => {
  useEffect(() => {
    // Inject custom styles for Google Translate widget
    injectTranslateStyles();
    
    // Add a delay to ensure the Google Translate widget is loaded
    const timer = setTimeout(() => {
      const translateElement = document.getElementById('google_translate_element');
      if (translateElement && !translateElement.hasChildNodes()) {
        // Reinitialize if not loaded
        if (window.google && window.google.translate) {
          new window.google.translate.TranslateElement({
            pageLanguage: 'en',
            includedLanguages: 'en,hi,bn,te,mr,ta,ur,gu,kn,or,ml,pa,as,mai,sat,ks,sa,kok,doi,mni,bo,ne',
            layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE,
            autoDisplay: false
          }, 'google_translate_element');
        }
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <header className="glass-header sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          {/* Logo and Title */}
          <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
            <img 
              src="https://github.com/debarghya17/UI-Elements/blob/main/agriastrax%20logo.png?raw=true"
              alt="AgriAstrax Logo"
              className="h-10 w-10 sm:h-12 sm:w-12 rounded-lg mx-auto sm:mx-0"
              onError={(e) => {
                e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDgiIGhlaWdodD0iNDgiIHZpZXdCb3g9IjAgMCA0OCA0OCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQ4IiBoZWlnaHQ9IjQ4IiByeD0iOCIgZmlsbD0iIzEwYjk4MSIvPgo8cGF0aCBkPSJNMjQgMTJMMzIgMjBMMjQgMjhMMTYgMjBMMjQgMTJaIiBmaWxsPSJ3aGl0ZSIvPgo8L3N2Zz4K';
              }}
            />
            <div className="text-center sm:text-left">
              <h1 className="text-lg sm:text-xl font-bold text-white">SMART AGRITECH DASHBOARD</h1>
              <p className="text-xs sm:text-sm text-gray-300">Advanced AI & Sensor Technology for Modern Agriculture</p>
            </div>
          </div>

          {/* Controls - Always below on mobile, inline on large screens */}
          <div className="flex flex-col sm:flex-row items-center gap-3 lg:gap-4">
            {/* Mode Toggle Switch */}
            <div className="flex items-center space-x-2 bg-black/20 rounded-lg p-2">
              <span className="text-xs text-white">
                {mode === 'realtime' ? 'Real' : 'Sim'}
              </span>
              <button
                onClick={() => onModeChange(mode === 'realtime' ? 'simulated' : 'realtime')}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  mode === 'realtime' ? 'bg-green-600' : 'bg-gray-600'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    mode === 'realtime' ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
              {mode === 'realtime' ? (
                <Wifi className="w-4 h-4 text-green-400" />
              ) : (
                <WifiOff className="w-4 h-4 text-gray-400" />
              )}
            </div>

            {/* Refresh Data Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={onRefreshData}
              className="text-white border-white/20 hover:bg-white/10 px-3 py-2 w-full sm:w-auto"
              title="Refresh Data"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              <span className="text-sm">Refresh</span>
            </Button>

            {/* Google Translate Widget */}
            <div id="google_translate_element" className="translate-widget w-full sm:w-auto min-h-[40px] flex items-center justify-center"></div>
          </div>
        </div>
      </div>
    </header>
  );
};