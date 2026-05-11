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
      <div className="max-w-7xl mx-auto flex items-center justify-between pointer-events-auto">
        {/* Logo */}
        <motion.div 
          onClick={onHome}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="w-10 h-10 bg-islamic-green dark:bg-emerald-600 rounded-xl flex items-center justify-center shadow-lg transition-all relative overflow-hidden border border-white/10">
            <span className="text-white font-serif text-xl font-bold italic">IG</span>
          </div>
          <div className="hidden md:block">
            <h1 className="font-serif text-sm font-bold text-slate-900 dark:text-white leading-tight">Islamic Guidance</h1>
            <p className="text-[8px] font-bold text-islamic-green dark:text-emerald-400 uppercase tracking-[0.2em] opacity-80">Sacred Wisdom Companion</p>
          </div>
        </motion.div>

        {/* Dynamic Navigation Bar (Minimal) */}
        <div className="flex items-center gap-1 p-1.5 glass-effect rounded-2xl shadow-premium border border-white/50 dark:border-white/5 backdrop-blur-md">
          {streak > 0 && (
            <motion.div 
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="px-3 py-1.5 bg-islamic-gold/10 rounded-xl flex items-center gap-2 mr-1 border border-islamic-gold/20"
            >
              <Zap className="w-3.5 h-3.5 text-islamic-gold fill-current animate-pulse" />
              <span className="text-[10px] font-bold text-islamic-gold">{streak}</span>
            </motion.div>
          )}

          <motion.button 
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.9 }}
            onClick={onOpenBookmarks}
            className="p-2.5 text-slate-500 hover:text-islamic-green dark:text-slate-400 dark:hover:text-emerald-400 rounded-xl hover:bg-white dark:hover:bg-slate-800 transition-all shadow-sm flex items-center justify-center"
            title="Bookmarks"
          >
            <Bookmark className="w-4 h-4" />
          </motion.button>

          <motion.button 
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.9 }}
            onClick={toggleTheme}
            className="p-2.5 text-slate-500 hover:text-islamic-green dark:text-slate-400 dark:hover:text-emerald-400 rounded-xl hover:bg-white dark:hover:bg-slate-800 transition-all shadow-sm flex items-center justify-center"
            title="Toggle Theme"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </motion.button>

          <motion.button 
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.9 }}
            onClick={onOpenSettings}
            className="p-2.5 text-slate-500 hover:text-islamic-green dark:text-slate-400 dark:hover:text-emerald-400 rounded-xl hover:bg-white dark:hover:bg-slate-800 transition-all shadow-sm flex items-center justify-center"
            title="Settings"
          >
            <Settings className="w-4 h-4" />
          </motion.button>

          {user ? (
            <div className="flex items-center gap-1 ml-1 pl-2 border-l border-slate-200 dark:border-slate-800">
               <motion.button 
                whileTap={{ scale: 0.9 }}
                onClick={() => signOut(auth)}
                className="p-2.5 text-slate-400 hover:text-red-500 transition-colors rounded-xl flex items-center justify-center"
                title="Logout"
              >
                <LogOut className="w-3.5 h-3.5" />
              </motion.button>
            </div>
          ) : (
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={signInWithGoogle}
              className="px-5 py-2 bg-islamic-green text-white text-[9px] font-bold uppercase tracking-[0.2em] rounded-xl hover:bg-emerald-700 transition-all ml-1 shadow-lg shadow-islamic-green/20"
            >
              Sign In
            </motion.button>
          )}
        </div>
      </div>
    </header>
  );
};
