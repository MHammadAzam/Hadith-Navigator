import React, { useState } from 'react';
import { Search, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';

interface SearchHeroProps {
  onSearch: (query: string) => void;
}

export const SearchHero: React.FC<SearchHeroProps> = ({ onSearch }) => {
  const [query, setQuery] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query);
    }
  };

  return (
    <div className="relative pt-32 pb-48 px-6 overflow-hidden">
      {/* Spiritual Light Effects */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-islamic-green/[0.03] dark:bg-emerald-500/[0.03] rounded-full blur-[120px] -z-10" />
      <div className="absolute top-20 right-0 w-[400px] h-[400px] bg-islamic-gold/[0.03] rounded-full blur-[100px] -z-10" />

      <div className="max-w-4xl mx-auto text-center space-y-12 relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="space-y-6"
        >
          <div className="inline-flex items-center gap-3 px-4 py-2 bg-white/50 dark:bg-slate-900/40 backdrop-blur-md rounded-full border border-white dark:border-white/5 shadow-sm mb-4">
             <Sparkles className="w-4 h-4 text-islamic-gold animate-pulse" />
             <span className="text-[10px] font-bold text-islamic-green dark:text-emerald-400 uppercase tracking-[0.3em]">The Divine Light AI</span>
          </div>
          <h1 className="text-5xl md:text-8xl font-serif font-bold text-slate-900 dark:text-white tracking-tight leading-[1.1]">
            Sacred <span className="text-islamic-green italic">Guidance</span>
          </h1>
          <p className="text-lg md:text-2xl text-slate-500 dark:text-slate-400 font-serif italic max-w-2xl mx-auto leading-relaxed">
            "Ask your heart's questions, find peace in the Qur'an and authentic Sunnah."
          </p>
        </motion.div>

        <motion.form 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.8 }}
          onSubmit={handleSubmit}
          className="relative max-w-2xl mx-auto group"
        >
          <div className="relative">
            <div className="absolute inset-0 bg-islamic-green/10 blur-2xl rounded-[2.5rem] opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
            <input 
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="What is on your heart today?"
              className="w-full h-20 pl-16 pr-8 bg-white dark:bg-slate-900/60 backdrop-blur-3xl rounded-[2.5rem] border border-white dark:border-white/5 shadow-premium focus:ring-4 focus:ring-islamic-green/5 focus:border-islamic-green transition-all text-lg font-serif outline-none placeholder:text-slate-400"
            />
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-slate-400 group-hover:text-islamic-green transition-colors" />
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 mt-8">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mr-2">Try seeking:</span>
            {['Patience', 'Finding Peace', 'Meaning of Love', 'Strength in Trials'].map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => onSearch(tag)}
                className="px-4 py-1.5 rounded-full bg-white/40 dark:bg-white/5 border border-white dark:border-white/5 text-[11px] font-medium text-slate-600 dark:text-slate-400 hover:bg-islamic-green hover:text-white transition-all shadow-sm"
              >
                {tag}
              </button>
            ))}
          </div>
        </motion.form>
      </div>
    </div>
  );
};
