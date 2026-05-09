import React from 'react';
import { 
  Settings, 
  Bookmark, 
  LogOut,
  Moon,
  Sun,
  Zap,
  Sparkles
} from 'lucide-react';
import { User, signOut } from 'firebase/auth';
import { auth, signInWithGoogle } from '../lib/firebase';
import { motion } from 'motion/react';

interface HeaderProps {
  user: User | null;
  onOpenSettings: () => void;
  onOpenBookmarks: () => void;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  onSearch: (query: string) => void;
  onHome: () => void;
  streak: number;
}

export const Header: React.FC<HeaderProps> = ({ 
  user, 
  onOpenSettings, 
  onOpenBookmarks, 
  theme, 
  toggleTheme,
  onHome,
  streak
}) => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 px-4 pt-6 pointer-events-none">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 pointer-events-auto">
        {/* Logo */}
        <motion.div 
          onClick={onHome}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="w-12 h-12 bg-islamic-green dark:bg-emerald-600 rounded-2xl flex items-center justify-center shadow-[0_12px_24px_-8px_rgba(2,44,34,0.4)] group-hover:shadow-[0_16px_32px_-8px_rgba(2,44,34,0.5)] transition-all overflow-hidden relative border border-white/10">
            <span className="text-white font-serif text-2xl font-bold relative z-10 italic">G</span>
            <div className="absolute inset-0 bg-gradient-to-tr from-black/20 to-transparent pointer-events-none" />
          </div>
          <div className="hidden md:block">
            <h1 className="font-serif text-sm font-bold text-slate-900 dark:text-white leading-tight">Sacred</h1>
            <p className="text-[9px] font-bold text-islamic-green dark:text-emerald-400 uppercase tracking-[0.2em] opacity-80">Guidance AI</p>
          </div>
        </motion.div>

        {/* Dynamic Navigation Bar (Apple Style) */}
        <div className="flex items-center gap-1 p-1.5 glass-effect rounded-[2rem] shadow-premium">
          <div className="flex items-center gap-1 px-1">
             <button 
              onClick={onOpenBookmarks}
              className="p-3 text-slate-500 hover:text-islamic-green dark:text-slate-400 dark:hover:text-emerald-400 rounded-full hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all relative group"
            >
              <Bookmark className="w-4 h-4" />
              <div className="absolute -top-1 -right-1 w-1.5 h-1.5 bg-islamic-gold rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>

            <button 
              onClick={onOpenSettings}
              className="p-3 text-slate-500 hover:text-islamic-green dark:text-slate-400 dark:hover:text-emerald-400 rounded-full hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all"
            >
              <Settings className="w-4 h-4" />
            </button>

            <div className="w-px h-4 bg-slate-100 dark:bg-slate-800/50 mx-2" />

            <button 
              onClick={toggleTheme}
              className="p-3 text-slate-500 hover:text-islamic-green dark:text-slate-400 dark:hover:text-emerald-400 rounded-full hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>

          {streak > 0 && (
            <div className="flex items-center gap-1.5 px-3 py-2 bg-islamic-gold/10 text-islamic-gold rounded-full transition-all">
              <Zap className="w-3.5 h-3.5 fill-current" />
              <span className="text-[10px] font-bold tracking-tighter">{streak}</span>
            </div>
          )}

          {user ? (
            <div className="flex items-center gap-1 pl-2">
              <div className="w-8 h-8 rounded-full overflow-hidden border border-islamic-green/10">
                 {user.photoURL ? (
                    <img src={user.photoURL} alt="User" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                 ) : (
                    <div className="w-full h-full bg-islamic-green/5 flex items-center justify-center text-[10px] font-bold text-islamic-green">
                      {user.displayName?.[0] || user.email?.[0]}
                    </div>
                 )}
              </div>
              <button 
                onClick={() => signOut(auth)}
                className="p-2.5 text-slate-400 hover:text-red-500 transition-colors"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={signInWithGoogle}
              className="px-5 py-2.5 bg-islamic-green text-white text-[10px] font-bold uppercase tracking-[0.2em] rounded-full hover:bg-emerald-700 transition-all shadow-lg shadow-islamic-green/20 ml-2"
            >
              Sign In
            </motion.button>
          )}
        </div>
      </div>
    </header>
  );
};
