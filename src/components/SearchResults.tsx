import React from 'react';
import { motion } from 'motion/react';
import { 
  Search,
  ArrowLeft,
  Loader2,
  Bookmark,
  Sparkles,
  ChevronRight,
  Info,
  Lightbulb,
  BookOpen
} from 'lucide-react';
import { SearchItem, GuidanceResponse } from '../types';

interface SearchResultsProps {
  query: string;
  results: SearchItem[];
  guidance?: GuidanceResponse | null;
  isLoading: boolean;
  onSelectResult: (item: SearchItem) => void;
  onBack: () => void;
  onSearch: (query: string) => void;
  error?: string | null;
}

export const SearchResults: React.FC<SearchResultsProps> = ({
  query,
  results,
  guidance,
  isLoading,
  onSelectResult,
  onBack,
  onSearch,
  error
}) => {
  return (
    <div className="max-w-5xl mx-auto py-12 px-4">
      {/* Search Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-16">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors group self-start"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          <span className="text-xs font-bold uppercase tracking-[0.2em]">Home</span>
        </button>

        <div className="flex-1 max-w-xl">
           <div className="relative group">
              <input 
                type="text"
                defaultValue={query}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') onSearch((e.target as HTMLInputElement).value);
                }}
                className="w-full h-14 pl-12 pr-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl focus:border-islamic-green focus:ring-4 focus:ring-islamic-green/5 shadow-premium text-sm outline-none transition-all"
              />
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
           </div>
        </div>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-32 text-slate-400 gap-6">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          >
            <Loader2 className="w-12 h-12 text-islamic-green/40" />
          </motion.div>
          <div className="text-center space-y-2">
            <p className="font-serif italic text-2xl dark:text-white">Seeking Wisdom...</p>
            <p className="text-xs font-bold uppercase tracking-[0.3em] opacity-60">Consulting the Sacred Logs</p>
          </div>
        </div>
      ) : error ? (
        <div className="bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/20 rounded-[2rem] p-12 text-center space-y-6">
           <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 text-red-500 rounded-full flex items-center justify-center mx-auto">
             <Info className="w-8 h-8" />
           </div>
           <div className="space-y-2">
             <h3 className="text-xl font-bold dark:text-white">Search Interrupted</h3>
             <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto">{error}</p>
           </div>
           <button 
             onClick={() => onSearch(query)}
             className="px-8 py-3 bg-slate-900 dark:bg-white dark:text-slate-900 text-white rounded-xl font-bold text-xs uppercase tracking-widest"
           >
             Try Again
           </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main Results */}
          <div className="lg:col-span-8 space-y-8">
            <h3 className="text-sm font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.3em] pl-2 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-islamic-green" />
              Direct References
            </h3>
            
            {results.length > 0 ? (
              results.map((r, idx) => (
                <motion.div
                  key={r.id || idx}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: idx * 0.1, ease: [0.16, 1, 0.3, 1] }}
                  onClick={() => onSelectResult(r)}
                  className="group bg-white dark:bg-slate-900/50 backdrop-blur-xl border border-slate-100 dark:border-white/5 rounded-[2.5rem] p-8 md:p-12 hover:border-islamic-green/30 transition-all cursor-pointer shadow-premium relative overflow-hidden"
                >
                  <div className="flex flex-col space-y-10 relative z-10">
                    <p className="arabic-text text-right text-2xl md:text-3xl leading-relaxed">
                      {r.arabic.length > 200 ? r.arabic.substring(0, 200) + '...' : r.arabic}
                    </p>
                    
                    <div className="space-y-6">
                      <p className="translation-text text-lg italic border-l-2 border-islamic-green/20 pl-6 dark:text-slate-200">
                        "{r.english.length > 250 ? r.english.substring(0, 250) + '...' : r.english}"
                      </p>
                      <p className="urdu-text text-right opacity-60">
                         {r.urdu.length > 150 ? r.urdu.substring(0, 150) + '...' : r.urdu}
                      </p>
                    </div>

                    <div className="pt-8 border-t border-slate-50 dark:border-white/5 flex items-center justify-between">
                      <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">Source Reference</span>
                        <span className="text-xs font-bold text-slate-900 dark:text-white">
                           {r.type === 'verse' ? `${r.surahName} ${r.surahNumber}:${r.ayahNumber}` : r.reference}
                        </span>
                      </div>

                      <div className="flex items-center gap-3">
                         <div className="flex items-center gap-1.5 px-3 py-1.5 bg-islamic-green/5 dark:bg-emerald-500/10 rounded-full border border-islamic-green/10">
                            <div className="w-1 h-1 rounded-full bg-islamic-gold animate-pulse" />
                            <span className="text-[10px] font-bold text-islamic-green dark:text-emerald-400 capitalize tracking-wider">{r.type}</span>
                         </div>
                         <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-full group-hover:bg-islamic-green group-hover:text-white transition-all">
                            <ChevronRight className="w-5 h-5" />
                         </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Background Accents */}
                   <div className="absolute top-0 right-0 p-8 opacity-0 group-hover:opacity-[0.03] dark:group-hover:opacity-[0.08] transition-opacity pointer-events-none">
                    <Sparkles className="w-32 h-32 rotate-12" />
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="text-center py-32 bg-slate-100/50 dark:bg-white/5 rounded-[3rem] border border-dashed border-slate-200 dark:border-white/10">
                <p className="text-slate-400 font-serif italic text-xl">No celestial echoes found for this query.</p>
              </div>
            )}
          </div>

          {/* Sidebar Guidance */}
          <div className="lg:col-span-4 space-y-8">
            <h3 className="text-sm font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.3em] pl-2 flex items-center gap-2">
              <Lightbulb className="w-4 h-4 text-islamic-gold" />
              Sacred Context
            </h3>

            {guidance ? (
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-islamic-gold/20 rounded-[2.5rem] p-8 shadow-premium space-y-8 sticky top-24"
              >
                <div className="p-4 bg-islamic-gold/5 dark:bg-amber-500/10 rounded-[1.5rem] border border-islamic-gold/10">
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
                    Understanding the Light
                  </h4>
                  <p className="text-sm text-slate-600 dark:text-slate-400 italic font-serif leading-relaxed line-clamp-4">
                    {guidance.aiSummary}
                  </p>
                </div>

                <div className="space-y-4">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] block px-1">Themes Detected</span>
                  <div className="flex flex-wrap gap-2">
                    {guidance.suggestedThemes.map((theme, i) => (
                      <span key={i} className="px-3 py-1.5 bg-slate-50 dark:bg-white/5 rounded-xl text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest border border-slate-100 dark:border-white/5">
                        {theme}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] block px-1">Refining Guidance</span>
                   <div className="space-y-2">
                      {guidance.followUpQuestions.map((q, i) => (
                         <button 
                          key={i}
                          onClick={() => onSearch(q)}
                          className="w-full text-left p-3 text-[11px] font-bold text-slate-600 dark:text-slate-300 hover:text-islamic-green dark:hover:text-emerald-400 hover:bg-slate-50 dark:hover:bg-white/5 rounded-xl transition-all border border-transparent hover:border-slate-100 dark:hover:border-white/10"
                        >
                           {q}
                         </button>
                      ))}
                   </div>
                </div>
              </motion.div>
            ) : (
              <div className="p-8 text-center bg-slate-50 dark:bg-white/5 rounded-[2.5rem] border border-dashed border-slate-200 dark:border-white/10">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest animate-pulse">Waiting for AI Insight...</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
