import React from 'react';
import { motion } from 'motion/react';
import { 
  ChevronRight, 
  Search,
  ArrowLeft,
  Loader2,
  Book,
  ScrollText,
  Sparkles
} from 'lucide-react';
import { SearchItem } from '../types';

interface SearchResultsProps {
  query: string;
  results: SearchItem[];
  isLoading: boolean;
  onSelectResult: (item: SearchItem) => void;
  onBack: () => void;
  onSearch: (query: string) => void;
  error?: string | null;
}

export const SearchResults: React.FC<SearchResultsProps> = ({
  query,
  results,
  isLoading,
  onSelectResult,
  onBack,
  onSearch,
  error
}) => {
  const hasRelatedResults = results.some(r => (r as any).isRelated);

  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
      <div className="flex items-center justify-between mb-10">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-slate-400 hover:text-islamic-green transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span className="text-sm font-medium">Back to Guidance</span>
        </button>
        {results.length > 0 && (
          <div className="text-[10px] font-bold text-slate-400 dark:text-slate-600 uppercase tracking-widest bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 px-3 py-1 rounded-full">
            {results.length} results found
          </div>
        )}
      </div>

      <div className="mb-12">
        <h2 className="text-xs font-bold text-slate-400 uppercase tracking-[0.3em] mb-3">Guidance found for</h2>
        <h1 className="font-serif text-4xl md:text-5xl font-bold dark:text-white">"{query}"</h1>
      </div>

      {error && !isLoading && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mb-8 p-8 bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/20 rounded-[2.5rem] text-center"
        >
          <div className="w-16 h-16 bg-red-100 dark:bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4 text-red-600 dark:text-red-400">
            <Search className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold text-red-800 dark:text-red-300 mb-2">Something went wrong</h3>
          <p className="text-red-600 dark:text-red-400/70 text-sm mb-6 max-w-sm mx-auto">{error}</p>
          <button 
            onClick={() => onSearch(query)}
            className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-full text-sm font-bold transition-all"
          >
            Try Again
          </button>
        </motion.div>
      )}

      {hasRelatedResults && !isLoading && results.length > 0 && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 p-6 bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/20 rounded-[2rem] flex items-center gap-4 text-amber-700 dark:text-amber-400 shadow-sm"
        >
          <div className="w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-500/20 flex items-center justify-center shrink-0">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <p className="text-base font-bold">Showing related guidance based on your search</p>
            <p className="text-xs opacity-70">We've found verses and hadiths that match the spirit of your query.</p>
          </div>
        </motion.div>
      )}

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-24 text-slate-400 gap-6">
          <Loader2 className="w-12 h-12 animate-spin text-islamic-green" />
          <p className="font-semibold text-lg animate-pulse tracking-wide">Consulting the Qur'an & Sunnah...</p>
        </div>
      ) : (
        <div className="space-y-8">
          <div className="space-y-6">
            {results.map((r, idx) => (
              <motion.div
                key={r.id || idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                onClick={() => onSelectResult(r)}
                className="group bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 border border-slate-100 dark:border-slate-800 hover:border-islamic-green transition-all cursor-pointer shadow-sm hover:shadow-2xl hover:shadow-islamic-green/5 relative overflow-hidden"
              >
                {/* Type Indicator */}
                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                  {r.type === 'verse' ? <Book className="w-20 h-20" /> : <ScrollText className="w-20 h-20" />}
                </div>

                <div className="flex items-center justify-between mb-6 relative z-10">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${r.type === 'verse' ? 'bg-amber-100 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400' : 'bg-islamic-green/10 text-islamic-green dark:bg-emerald-500/10 dark:text-emerald-400'}`}>
                      {r.type === 'verse' ? <Book className="w-5 h-5" /> : <ScrollText className="w-5 h-5" />}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                          {r.type === 'verse' ? 'The Qur\'an' : 'Hadith'}
                        </span>
                        {(r as any).isRelated && (
                          <span className="px-1.5 py-0.5 bg-amber-500/10 text-amber-600 text-[8px] font-bold uppercase tracking-tighter rounded-sm">Related</span>
                        )}
                      </div>
                      <span className="text-sm font-bold text-slate-900 dark:text-slate-50">
                        {r.type === 'verse' ? `${r.surahName} (${r.surahNumber}:${r.ayahNumber})` : r.bookName}
                      </span>
                    </div>
                  </div>
                  {r.type === 'hadith' && (
                    <span className="px-3 py-1 bg-slate-50 dark:bg-slate-800 text-[10px] font-bold text-slate-400 rounded-lg">
                      #{r.hadithNumber}
                    </span>
                  )}
                </div>

                <p className="arabic-text mb-6">
                  {r.arabic}
                </p>
                
                <div className="space-y-4 relative z-10">
                  <p className="translation-text border-l-2 border-slate-100 dark:border-slate-800 pl-6">
                    "{r.english}"
                  </p>
                </div>

                <div className="mt-8 pt-6 border-t border-slate-50 dark:border-slate-800 flex items-center justify-between">
                  <span className="reference-text">
                    {r.reference}
                  </span>
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-500 dark:text-slate-400 group-hover:text-islamic-green transition-colors">
                    View full context
                    <div className="w-8 h-8 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center group-hover:bg-islamic-green dark:group-hover:bg-emerald-500 group-hover:text-white transition-all">
                      <ChevronRight className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {!isLoading && (
            <div className="pt-20 pb-12 border-t border-slate-100 dark:border-slate-800">
              <h3 className="text-center text-xs font-bold text-slate-400 uppercase tracking-[0.2em] mb-8">Continue your journey with suggested topics</h3>
              <div className="flex flex-wrap justify-center gap-4">
                {['Patience', 'Prayer', 'Forgiveness', 'Trust in Allah', 'Hardship', 'Gratitude'].map(topic => (
                  <button
                    key={topic}
                    onClick={() => onSearch(topic)}
                    className="px-8 py-3 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 hover:border-islamic-green text-slate-600 dark:text-slate-300 rounded-2xl text-sm font-bold shadow-sm transition-all hover:shadow-lg hover:shadow-islamic-green/5"
                  >
                    {topic}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
