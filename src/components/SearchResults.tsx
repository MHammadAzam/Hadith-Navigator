import React from 'react';
import { motion } from 'motion/react';
import { 
  ChevronRight, 
  Search,
  ArrowLeft,
  Loader2,
  Book,
  ScrollText
} from 'lucide-react';
import { SearchItem } from '../types';

interface SearchResultsProps {
  query: string;
  results: SearchItem[];
  isLoading: boolean;
  onSelectResult: (item: SearchItem) => void;
  onBack: () => void;
}

export const SearchResults: React.FC<SearchResultsProps> = ({
  query,
  results,
  isLoading,
  onSelectResult,
  onBack
}) => {
  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
      <button 
        onClick={onBack}
        className="flex items-center gap-2 text-slate-400 hover:text-islamic-green transition-colors mb-10 group"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        <span className="text-sm font-medium">Back to Guidance</span>
      </button>

      <div className="mb-12">
        <h2 className="text-xs font-bold text-slate-400 uppercase tracking-[0.3em] mb-3">Guidance found for</h2>
        <h1 className="font-serif text-4xl md:text-5xl font-bold dark:text-white">"{query}"</h1>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-24 text-slate-400 gap-6">
          <Loader2 className="w-12 h-12 animate-spin text-islamic-green" />
          <p className="font-semibold text-lg animate-pulse">Consulting the Qur'an & Sunnah...</p>
        </div>
      ) : results.length === 0 ? (
        <div className="text-center py-24 bg-white dark:bg-slate-900 rounded-[3rem] border-2 border-dashed border-slate-100 dark:border-slate-800">
           <Search className="w-16 h-16 text-slate-200 dark:text-slate-800 mx-auto mb-6" />
           <p className="text-slate-500 text-lg">No matching guidance found. Try broader terms like "character" or "prayer".</p>
        </div>
      ) : (
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
                    <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest block mb-0.5">
                      {r.type === 'verse' ? 'The Qur\'an' : 'Hadith'}
                    </span>
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
      )}
    </div>
  );
};
