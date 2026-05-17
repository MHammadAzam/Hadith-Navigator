import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search,
  ArrowLeft,
  Loader2,
  Bookmark,
  Sparkles,
  ChevronRight,
  Info,
  Lightbulb,
  BookOpen,
  Book,
  Filter
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
  searchHistory: string[];
}

type FilterType = 'all' | 'verse' | 'hadith';

export const SearchResults: React.FC<SearchResultsProps> = React.memo(({
  query,
  results,
  guidance,
  isLoading,
  onSelectResult,
  onBack,
  onSearch,
  error,
  searchHistory
}) => {
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [filterCollection, setFilterCollection] = useState<string>('all');

  // Extract unique collections from results
  const collections = useMemo(() => {
    const set = new Set<string>();
    results.forEach(r => {
      if (r.type === 'hadith' && r.bookName) {
        set.add(r.bookName);
      } else if (r.type === 'verse' && r.surahName) {
        set.add('Qur\'an');
      }
    });
    return Array.from(set).sort();
  }, [results]);

  const filteredResults = useMemo(() => {
    return results.filter(r => {
      const matchesType = filterType === 'all' || r.type === filterType;
      const matchesCollection = filterCollection === 'all' || 
        (r.type === 'hadith' && r.bookName === filterCollection) ||
        (r.type === 'verse' && filterCollection === 'Qur\'an');
      return matchesType && matchesCollection;
    });
  }, [results, filterType, filterCollection]);

  return (
    <div className="max-w-5xl mx-auto py-12 px-4">
      {error ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-white/5 rounded-[3rem] p-16 text-center space-y-8 shadow-premium">
           <div className="w-20 h-20 bg-red-50 dark:bg-red-900/10 text-red-500 rounded-3xl flex items-center justify-center mx-auto">
             <Info className="w-10 h-10" />
           </div>
           <div className="space-y-3">
             <h3 className="text-2xl font-serif font-bold dark:text-white">A Moment's Delay</h3>
             <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto leading-relaxed">"{error}"</p>
           </div>
           <button 
             onClick={() => onSearch(query)}
             className="px-10 py-4 bg-islamic-green text-white rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-lg shadow-islamic-green/20"
           >
             Try Again
           </button>
        </div>
      ) : (
        <div className="space-y-20">
          {/* Supportive AI Guidance */}
          {guidance ? (
            <motion.div 
              initial={{ opacity: 0, y: 30, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
              className="bg-islamic-green/[0.02] dark:bg-emerald-500/[0.02] border border-islamic-green/5 dark:border-emerald-500/10 rounded-[3rem] p-8 md:p-16 text-center space-y-12 relative overflow-hidden shadow-inner"
            >
              <div className="flex flex-col items-center gap-6 relative z-10">
                <motion.div 
                  initial={{ rotate: -15 }}
                  animate={{ rotate: 0 }}
                  transition={{ type: "spring", stiffness: 100 }}
                  className="w-16 h-16 bg-white dark:bg-slate-800 rounded-3xl shadow-premium flex items-center justify-center text-islamic-gold border border-slate-100 dark:border-white/5"
                >
                  <Sparkles className="w-8 h-8" />
                </motion.div>
                <div className="space-y-3">
                  <span className="text-[10px] font-bold text-islamic-green dark:text-emerald-400 uppercase tracking-[0.5em] opacity-60">Heavenly Insight</span>
                  <h2 className="text-3xl md:text-5xl font-serif font-bold text-slate-900 dark:text-white leading-tight">
                    {guidance.reflectionTitle || "For your seeker's heart..."}
                  </h2>
                </div>
              </div>

              {guidance.empathyStatement && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="max-w-2xl mx-auto relative z-10"
                >
                  <p className="text-sm md:text-base font-bold text-islamic-green uppercase tracking-widest opacity-80 mb-4">
                    A Note of Empathy
                  </p>
                  <p className="text-lg md:text-xl font-medium text-slate-800 dark:text-slate-200 leading-relaxed">
                    {guidance.empathyStatement}
                  </p>
                </motion.div>
              )}

              <div className="max-w-3xl mx-auto py-4 relative z-10">
                <p className="text-xl md:text-3xl font-serif text-slate-700 dark:text-slate-200 leading-[1.6] italic">
                  "{guidance.aiSummary}"
                </p>
              </div>

              {/* Specific Guidance References */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-4xl mx-auto relative z-10">
                {/* Quran Guidance Card */}
                <motion.div 
                  whileHover={{ y: -6 }}
                  className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl p-8 rounded-[2rem] border border-islamic-green/10 text-left space-y-6 shadow-premium group"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-islamic-green animate-pulse" />
                    <span className="text-[10px] font-bold text-islamic-green uppercase tracking-widest">In the Qur'an</span>
                  </div>
                  <p className="font-arabic text-right text-2xl leading-relaxed text-slate-900 dark:text-white">{guidance.quranReference.text}</p>
                  <p className="text-[15px] italic text-slate-600 dark:text-slate-400 font-serif leading-relaxed">"{guidance.quranReference.translation}"</p>
                  <div className="pt-4 border-t border-slate-50 dark:border-white/5">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                       <BookOpen className="w-3 h-3" />
                       {guidance.quranReference.reference}
                    </p>
                  </div>
                </motion.div>

                {/* Hadith Guidance Card */}
                <motion.div 
                  whileHover={{ y: -6 }}
                  className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl p-8 rounded-[2rem] border border-islamic-gold/10 text-left space-y-6 shadow-premium group"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-islamic-gold animate-pulse" />
                    <span className="text-[10px] font-bold text-islamic-gold uppercase tracking-widest">Prophetic Wisdom</span>
                  </div>
                  <p className="font-arabic text-right text-2xl leading-relaxed text-slate-900 dark:text-white">{guidance.hadithReference.text}</p>
                  <p className="text-[15px] italic text-slate-600 dark:text-slate-400 font-serif leading-relaxed">"{guidance.hadithReference.translation}"</p>
                  <div className="pt-4 border-t border-slate-50 dark:border-white/5">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                       <Lightbulb className="w-3 h-3" />
                       {guidance.hadithReference.reference}
                    </p>
                  </div>
                </motion.div>
              </div>

              <div className="flex flex-wrap justify-center gap-3 relative z-10 pt-4">
                {guidance.suggestedThemes?.map((theme, i) => (
                  <motion.span 
                    key={i} 
                    whileHover={{ scale: 1.05 }}
                    className="px-5 py-2.5 bg-white dark:bg-white/5 rounded-2xl text-[11px] font-bold text-islamic-green dark:text-emerald-400 uppercase tracking-widest shadow-sm border border-slate-100 dark:border-white/5"
                  >
                    {theme}
                  </motion.span>
                ))}
              </div>
              
              <div className="pt-8 relative z-10">
                <div className="h-px w-24 bg-slate-200 dark:bg-white/10 mx-auto mb-8" />
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em] mb-6">Continue your journey:</p>
                <div className="flex flex-wrap justify-center gap-3">
                  {guidance.followUpQuestions?.slice(0, 3).map((q, i) => (
                    <motion.button 
                      key={i}
                      whileHover={{ y: -2, backgroundColor: 'rgba(16, 185, 129, 0.1)' }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => onSearch(q)}
                      className="px-8 py-3.5 bg-white dark:bg-slate-800 hover:text-islamic-green transition-all rounded-2xl text-[12px] font-bold text-slate-600 dark:text-slate-300 border border-slate-100 dark:border-slate-800 shadow-sm"
                    >
                      {q}
                    </motion.button>
                  ))}
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               className="bg-islamic-green/[0.01] dark:bg-emerald-500/[0.01] border border-dashed border-islamic-green/10 dark:border-emerald-500/10 rounded-[3rem] p-12 text-center"
            >
               <div className="flex flex-col items-center gap-4">
                 <div className="relative">
                   <div className="absolute inset-0 bg-islamic-gold/20 blur-xl rounded-full scale-110 animate-pulse" />
                   <Sparkles className="w-8 h-8 text-islamic-gold relative animate-[spin_4s_linear_infinite]" />
                 </div>
                 <div className="space-y-1">
                   <span className="text-[10px] font-bold text-islamic-green uppercase tracking-[0.5em] animate-pulse">Heavenly Insight</span>
                   <p className="text-xs text-slate-400 font-medium">Seeking a spiritual reflection for your heart...</p>
                 </div>
               </div>
            </motion.div>
          )}

          {/* Direct References Section */}
          <div className="space-y-12">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-4">
              <div className="flex items-center gap-4 flex-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.5em]">Direct References</span>
                <div className="h-px flex-1 bg-slate-200 dark:bg-white/5" />
              </div>

              {/* Filters UI */}
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-xl overflow-hidden shadow-inner">
                  {(['all', 'verse', 'hadith'] as const).map((t) => (
                    <button
                      key={t}
                      onClick={() => {
                        setFilterType(t);
                        setFilterCollection('all');
                      }}
                      className={`px-4 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all ${
                        filterType === t 
                          ? 'bg-white dark:bg-slate-700 text-islamic-green shadow-sm' 
                          : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
                      }`}
                    >
                      {t === 'all' ? 'All' : t === 'verse' ? 'Verses' : 'Hadiths'}
                    </button>
                  ))}
                </div>

                {collections.length > 0 && (
                  <div className="relative group">
                    <select
                      value={filterCollection}
                      onChange={(e) => setFilterCollection(e.target.value)}
                      className="appearance-none bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 px-4 py-2 pr-10 rounded-xl text-[10px] font-bold uppercase tracking-widest text-slate-500 outline-none focus:ring-2 focus:ring-islamic-green/20 transition-all cursor-pointer shadow-premium"
                    >
                      <option value="all">All Sources</option>
                      {collections.map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                    <Filter className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                  </div>
                )}
              </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {filteredResults.length > 0 ? (
                filteredResults.map((r, idx) => (
                  <motion.div
                    key={r.id || idx}
                    initial={{ opacity: 0, y: 30, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 1, delay: idx * 0.1, ease: [0.16, 1, 0.3, 1] }}
                    whileHover={{ y: -6 }}
                    onClick={() => onSelectResult(r)}
                    className="group bg-white dark:bg-slate-900/40 rounded-[2rem] p-8 md:p-10 hover:border-islamic-green/30 transition-all cursor-pointer shadow-premium border border-slate-100 dark:border-white/5 flex flex-col justify-between"
                  >
                    <div className="space-y-8 h-full">
                       <div className="flex justify-between items-start">
                          <div className={`px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-widest shadow-sm ${r.type === 'verse' ? 'bg-islamic-green/5 text-islamic-green' : 'bg-islamic-gold/10 text-islamic-gold'}`}>
                            {r.type}
                          </div>
                          <motion.div 
                            whileHover={{ rotate: 90 }}
                            className="bg-slate-50 dark:bg-slate-800 p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Sparkles className="w-4 h-4 text-islamic-gold" />
                          </motion.div>
                       </div>

                      <p className="font-arabic text-right text-2xl md:text-3xl leading-relaxed line-clamp-3 text-slate-900 dark:text-white">
                        {r.arabic}
                      </p>
                      
                      <div className="space-y-4">
                        <p className="font-serif text-[16px] leading-relaxed dark:text-slate-300 line-clamp-4 italic text-slate-600 font-medium">
                          "{r.english}"
                        </p>
                      </div>
                    </div>

                    <div className="pt-6">
                      <p className="font-urdu text-right text-[19px] md:text-[22px] leading-relaxed opacity-70 line-clamp-2 text-slate-500 dark:text-slate-400">
                         {r.urdu}
                      </p>
                    </div>

                    <div className="pt-8 mt-8 border-t border-slate-50 dark:border-white/5 flex items-center justify-between">
                      <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-islamic-green uppercase tracking-[0.2em] mb-1 group-hover:animate-pulse">Tap for full authentic text</span>
                        <span className="text-[11px] font-bold text-slate-900 dark:text-white flex items-center gap-2">
                           <Book className="w-3.5 h-3.5 text-islamic-green/40" />
                           {r.type === 'verse' ? `${r.surahName} ${r.surahNumber}:${r.ayahNumber}` : r.reference}
                        </span>
                      </div>
                      <motion.div 
                        whileHover={{ scale: 1.1 }}
                        className="p-3 bg-slate-50 dark:bg-slate-800 rounded-2xl group-hover:bg-islamic-green group-hover:text-white transition-all shadow-sm"
                      >
                        <ChevronRight className="w-5 h-5" />
                      </motion.div>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="col-span-full text-center py-20 bg-slate-50 dark:bg-slate-900/40 rounded-[3rem] border border-dashed border-slate-200 dark:border-white/10">
                  <div className="mb-6">
                    <Info className="w-10 h-10 text-islamic-gold/40 mx-auto" />
                  </div>
                  <h3 className="text-xl font-serif dark:text-white mb-2">No exact match found</h3>
                  <p className="text-slate-500 dark:text-slate-400 text-sm max-w-md mx-auto">
                    Showing related guidance based on your search. Try adjusting your filters or query.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
});
