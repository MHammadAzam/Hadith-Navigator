import React from 'react';
import { motion } from 'motion/react';
import { Search, Sparkles } from 'lucide-react';

interface SearchHeroProps {
  onSearch: (query: string) => void;
}

const POPULAR_TOPICS = [
  { label: 'Patience', query: 'patience' },
  { label: 'الصلاة', query: 'prayer' },
  { label: 'Honesty', query: 'honesty' },
  { label: 'Forgiveness', query: 'forgiveness' },
  { label: 'Parents', query: 'parents' }
];

export const SearchHero: React.FC<SearchHeroProps> = ({ onSearch }) => {
  const [query, setQuery] = React.useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query);
    }
  };

  return (
    <div className="relative pt-20 pb-28 px-4 flex flex-col items-center text-center overflow-hidden">
      {/* Background Decorative Art */}
      <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05] pointer-events-none scale-150">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[url('https://www.transparenttextures.com/patterns/islamic-art.png')] bg-repeat" />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative z-10 w-full max-w-4xl"
      >
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-islamic-green/10 text-islamic-green text-[10px] font-bold uppercase tracking-[0.2em] mb-10 border border-islamic-green/20"
        >
          <Sparkles className="w-3.5 h-3.5" />
          AI-Powered Knowledge Retrieval
        </motion.div>
        
        <h2 className="font-serif text-5xl md:text-7xl font-bold text-slate-900 dark:text-white mb-8 leading-[1.1]">
          Seek Wisdom in <br/> <span className="text-islamic-green italic">Allah's Words.</span>
        </h2>
        
        <p className="text-slate-500 dark:text-slate-400 text-xl mb-12 max-w-2xl mx-auto leading-relaxed">
          Ask questions about life, faith, and practice. We search through the Qur'an and authentic Hadith to give you guidance from the Sunnah.
        </p>

        <form onSubmit={handleSubmit} className="relative group max-w-2xl mx-auto">
          <motion.div
            whileFocus={{ scale: 1.01 }}
            className="relative"
          >
            <div className="absolute inset-0 bg-islamic-green/5 blur-2xl rounded-full opacity-0 group-focus-within:opacity-100 transition-opacity" />
            <div className="relative flex items-center bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-2 shadow-2xl shadow-islamic-green/10 focus-within:border-islamic-green/50 focus-within:ring-4 focus-within:ring-islamic-green/5 transition-all">
              <div className="pl-6 pr-4">
                <Search className="w-6 h-6 text-slate-300 group-focus-within:text-islamic-green transition-colors" />
              </div>
              <input 
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Ask about faith, patience, prayer..."
                className="flex-1 h-14 bg-transparent text-lg dark:text-white outline-none font-medium placeholder:text-slate-300 dark:placeholder:text-slate-600"
              />
              <button 
                type="submit"
                className="px-8 h-14 bg-islamic-green text-white rounded-2xl font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-islamic-green/20 active:scale-95 flex items-center gap-2"
              >
                <span>Search</span>
                <Sparkles className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        </form>

        <div className="mt-12 flex flex-wrap items-center justify-center gap-4">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mr-2">Deep Topics:</span>
          {POPULAR_TOPICS.map((topic, i) => (
            <motion.button
              key={topic.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + (i * 0.1) }}
              onClick={() => onSearch(topic.query)}
              className="px-6 py-3 bg-white dark:bg-slate-900 hover:bg-islamic-green hover:text-white rounded-full text-sm font-semibold text-slate-600 dark:text-slate-300 transition-all border border-slate-100 dark:border-slate-800 hover:border-islamic-green shadow-sm hover:shadow-xl hover:shadow-islamic-green/20"
            >
              {topic.label}
            </motion.button>
          ))}
        </div>
      </motion.div>
    </div>
  );
};
