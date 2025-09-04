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
      background-color: rgba(0, 0, 0, 0.2) !important;
      border: 1px solid rgba(255, 255, 255, 0.1) !important;
      border-radius: 0.5rem !important;
      color: white !important;
      font-size: 10px !important;
      padding: 4px 6px !important;
      min-width: 0 !important;
      max-width: 80px !important;
      white-space: nowrap !important;
      overflow: hidden !important;
    }
    @media (min-width: 480px) {
      .goog-te-gadget-simple { 
        font-size: 11px !important;
        padding: 6px 8px !important;
        max-width: 100px !important;
      }
    }
    @media (min-width: 640px) {
      .goog-te-gadget-simple { 
        font-size: 13px !important;
        padding: 8px 12px !important;
        max-width: none !important;
      }
    }
    .goog-te-gadget-simple .goog-te-menu-value {
      color: white !important;
    }
    .goog-te-gadget-simple .goog-te-menu-value:before {
      content: "🌐 ";
    }
    .goog-te-menu-frame { z-index: 9999 !important; }
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
        <div className="flex items-center justify-between">
          {/* Logo and Title */}
          <div className="flex items-center space-x-4">
            <img 
              src="https://github.com/debarghya17/UI-Elements/blob/main/agriastrax%20logo.png?raw=true"
              alt="AgriAstrax Logo"
              className="h-12 w-12 rounded-lg"
              onError={(e) => {
                e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDgiIGhlaWdodD0iNDgiIHZpZXdCb3g9IjAgMCA0OCA0OCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQ4IiBoZWlnaHQ9IjQ4IiByeD0iOCIgZmlsbD0iIzEwYjk4MSIvPgo8cGF0aCBkPSJNMjQgMTJMMzIgMjBMMjQgMjhMMTYgMjBMMjQgMTJaIiBmaWxsPSJ3aGl0ZSIvPgo8L3N2Zz4K';
              }}
            />
            <div>
              <h1 className="text-xl font-bold text-white">SMART AGRITECH DASHBOARD</h1>
              <p className="text-sm text-gray-300">Advanced AI & Sensor Technology for Modern Agriculture</p>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-1 sm:gap-2 lg:gap-4">
            {/* Mode Toggle */}
            <div className="flex items-center space-x-1 bg-black/20 rounded-lg p-1">
              <Button
                variant={mode === 'realtime' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => onModeChange('realtime')}
                className="text-white text-xs px-1.5 sm:px-2 py-1 h-auto min-w-0"
              >
                <Wifi className="w-3 h-3 mr-1" />
                <span className="hidden sm:inline">Real</span>
                <span className="sm:hidden">R</span>
              </Button>
              <Button
                variant={mode === 'simulated' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => onModeChange('simulated')}
                className="text-white text-xs px-1.5 sm:px-2 py-1 h-auto min-w-0"
              >
                <WifiOff className="w-3 h-3 mr-1" />
                <span className="hidden sm:inline">Sim</span>
                <span className="sm:hidden">S</span>
              </Button>
            </div>

            {/* Refresh Data Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={onRefreshData}
              className="text-white border-white/20 hover:bg-white/10 px-1.5 sm:px-2 py-1 h-auto"
              title="Refresh Data"
            >
              <RefreshCw className="w-3 h-3 mr-0 sm:mr-1" />
              <span className="hidden md:inline">Refresh</span>
            </Button>

            {/* Google Translate Widget */}
            <div id="google_translate_element" className="translate-widget flex-shrink-0"></div>
          </div>
        </div>
      </div>
    </header>
  );
};