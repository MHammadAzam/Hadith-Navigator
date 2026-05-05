import React from 'react';
import { motion } from 'motion/react';
import { 
  Search, 
  Settings, 
  Bookmark, 
  LogIn, 
  LogOut,
  User as UserIcon,
  Moon,
  Sun,
  Zap
} from 'lucide-react';
import { User } from 'firebase/auth';
import { auth, signInWithGoogle } from '../lib/firebase';
import { signOut } from 'firebase/auth';

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
  onSearch,
  onHome,
  streak
}) => {
  const [searchValue, setSearchValue] = React.useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchValue.trim()) {
      onSearch(searchValue);
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
        {/* Logo */}
        <div className="flex items-center gap-2 cursor-pointer" onClick={onHome}>
          <div className="w-10 h-10 bg-islamic-green rounded-xl flex items-center justify-center shadow-lg shadow-islamic-green/20">
            <span className="text-white font-serif text-xl font-bold">S</span>
          </div>
          <h1 className="hidden md:block font-serif text-sm font-bold text-slate-800 dark:text-slate-100 leading-tight">
            Islamic AI <br/> Guidance
          </h1>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSubmit} className="flex-1 max-w-xl relative group">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="w-4 h-4 text-slate-400 group-focus-within:text-islamic-green transition-colors" />
          </div>
          <input 
            type="text"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            placeholder="Search guidance..."
            className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl py-2 pl-10 pr-4 text-sm focus:ring-4 focus:ring-islamic-green/5 focus:border-islamic-green/50 transition-all dark:text-slate-100 outline-none"
          />
        </form>

        {/* Actions */}
        <div className="flex items-center gap-1 md:gap-3">
          {streak > 0 && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/10 text-amber-600 dark:text-amber-500 rounded-full border border-amber-500/20 mr-2">
              <Zap className="w-3.5 h-3.5 fill-current" />
              <span className="text-xs font-bold leading-none">{streak}</span>
            </div>
          )}
          <button 
            onClick={toggleTheme}
            className="p-2 text-slate-500 hover:text-islamic-green hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-all"
          >
            {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
          
          <button 
            onClick={onOpenBookmarks}
            className="p-2 text-slate-500 hover:text-islamic-green hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-all relative"
          >
            <Bookmark className="w-5 h-5" />
          </button>

          <button 
            onClick={onOpenSettings}
            className="p-2 text-slate-500 hover:text-islamic-green hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-all"
          >
            <Settings className="w-5 h-5" />
          </button>

          <div className="h-6 w-px bg-slate-200 dark:bg-slate-800 mx-1 hidden sm:block" />

          {user ? (
            <div className="flex items-center gap-2 pl-2">
              <div className="hidden sm:block text-right">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">User</p>
                <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 max-w-[100px] truncate">{user.displayName || user.email}</p>
              </div>
              <button 
                onClick={() => signOut(auth)}
                className="p-2 text-slate-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-full transition-all"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <button 
              onClick={signInWithGoogle}
              className="flex items-center gap-2 px-4 py-2 bg-islamic-green text-white text-sm font-medium rounded-full hover:bg-islamic-green/90 transition-all shadow-md shadow-islamic-green/20"
            >
              <LogIn className="w-4 h-4" />
              <span className="hidden sm:inline">Sign In</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
