import React from 'react';
import { motion } from 'motion/react';
import { HadithBook } from '../types';
import { SIHAH_E_SITTA } from '../constants';
import { Book as BookIcon, ChevronRight, ScrollText } from 'lucide-react';

interface BookGridProps {
  onSelectBook: (book: HadithBook) => void;
}

export const BookGrid: React.FC<BookGridProps> = ({ onSelectBook }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {SIHAH_E_SITTA.map((book, idx) => (
        <motion.div
          key={book.id}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: idx * 0.1 }}
          onClick={() => onSelectBook(book)}
          className="group relative bg-white/60 dark:bg-slate-900/40 backdrop-blur-xl rounded-[2.5rem] p-10 border border-white dark:border-white/5 hover:border-islamic-green/30 transition-all duration-700 cursor-pointer shadow-premium hover:shadow-[0_48px_96px_-24px_rgba(2,44,34,0.12)] overflow-hidden"
        >
          {/* Decorative Pattern Background */}
          <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity pointer-events-none">
            <ScrollText className="w-32 h-32 -rotate-12" />
          </div>

          <div className="relative z-10 flex flex-col h-full">
            <div className="flex items-center justify-between mb-8">
              <div className="w-16 h-16 rounded-2xl bg-islamic-green/5 dark:bg-emerald-500/10 flex items-center justify-center border border-islamic-green/10 group-hover:bg-islamic-green group-hover:text-white transition-all duration-500 shadow-sm">
                <BookIcon className="w-7 h-7" />
              </div>
              <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-islamic-green group-hover:translate-x-1 transition-all" />
            </div>

            <div className="space-y-4">
              <h3 className="text-2xl font-serif font-bold text-slate-900 dark:text-white leading-tight group-hover:text-islamic-green transition-colors">
                {book.name}
              </h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed font-serif italic line-clamp-2">
                {book.description}
              </p>
            </div>

            <div className="mt-8 pt-8 border-t border-slate-100 dark:border-white/5 flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Compiler</span>
                <span className="text-xs font-bold text-islamic-gold">{book.author}</span>
              </div>
              <div className="flex flex-col items-end">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Hadiths</span>
                <span className="text-xs font-bold text-slate-900 dark:text-slate-100">{book.hadithCount}</span>
              </div>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
};
