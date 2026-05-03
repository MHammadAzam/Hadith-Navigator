import React from 'react';
import { motion } from 'motion/react';
import { 
  X, 
  Settings, 
  Languages, 
  Type, 
  Palette,
  Monitor,
  Info
} from 'lucide-react';

interface SettingsOverlayProps {
  onClose: () => void;
  language: 'English' | 'Urdu' | 'Arabic';
  setLanguage: (lang: 'English' | 'Urdu' | 'Arabic') => void;
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
  fontSize: number;
  setFontSize: (size: number) => void;
}

export const SettingsOverlay: React.FC<SettingsOverlayProps> = ({
  onClose,
  language,
  setLanguage,
  theme,
  setTheme,
  fontSize,
  setFontSize
}) => {
  return (
    <div className="flex flex-col h-full bg-white dark:bg-slate-900">
      <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Settings className="w-6 h-6 text-slate-500" />
          <h2 className="font-serif text-2xl font-bold text-slate-800 dark:text-slate-100">Settings</h2>
        </div>
        <button 
          onClick={onClose}
          className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
        >
          <X className="w-6 h-6 text-slate-400" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-10">
        {/* Language */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest">
            <Languages className="w-3.5 h-3.5" />
            Display Language
          </div>
          <div className="grid grid-cols-3 gap-3">
            {['English', 'Urdu', 'Arabic'].map((lang) => (
              <button
                key={lang}
                onClick={() => setLanguage(lang as any)}
                className={`py-3 rounded-2xl border text-sm font-medium transition-all ${
                  language === lang 
                    ? 'bg-islamic-green border-islamic-green text-white shadow-lg shadow-islamic-green/20' 
                    : 'border-slate-100 dark:border-slate-800 text-slate-500 hover:border-islamic-green'
                }`}
              >
                {lang}
              </button>
            ))}
          </div>
        </section>

        {/* Theme */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest">
            <Palette className="w-3.5 h-3.5" />
            Appearance
          </div>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setTheme('light')}
              className={`flex items-center justify-center gap-2 py-3 rounded-2xl border text-sm font-medium transition-all ${
                theme === 'light' 
                  ? 'bg-islamic-green border-islamic-green text-white shadow-lg shadow-islamic-green/20' 
                  : 'border-slate-100 dark:border-slate-800 text-slate-500 hover:border-islamic-green'
              }`}
            >
              <Monitor className="w-4 h-4" /> Light
            </button>
            <button
              onClick={() => setTheme('dark')}
              className={`flex items-center justify-center gap-2 py-3 rounded-2xl border text-sm font-medium transition-all ${
                theme === 'dark' 
                  ? 'bg-islamic-green border-islamic-green text-white shadow-lg shadow-islamic-green/20' 
                  : 'border-slate-100 dark:border-slate-800 text-slate-500 hover:border-islamic-green'
              }`}
            >
              <Monitor className="w-4 h-4" /> Dark
            </button>
          </div>
        </section>

        {/* Font Size */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest">
            <Type className="w-3.5 h-3.5" />
            Font Size (Content)
          </div>
          <div className="space-y-6 px-2">
            <input 
              type="range" 
              min="14" 
              max="24" 
              value={fontSize}
              onChange={(e) => setFontSize(parseInt(e.target.value))}
              className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-islamic-green"
            />
            <div className="flex justify-between text-[10px] font-bold text-slate-400">
              <span>SMALL</span>
              <span className="text-islamic-green">{fontSize}px</span>
              <span>LARGE</span>
            </div>
          </div>
        </section>

        {/* About */}
        <section className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-3xl space-y-4 border border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            <Info className="w-3.5 h-3.5" />
            About Sihah-e-Sitta App
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            This application provides access to the six authentic Hadith collections (Kutub al-Sittah). The AI explanation feature uses advanced models for educational context but should be verified with established scholars.
          </p>
        </section>
      </div>
    </div>
  );
};
