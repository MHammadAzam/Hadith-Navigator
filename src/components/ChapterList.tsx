import React from 'react';
import { motion } from 'motion/react';
import { 
  ArrowLeft, 
  ChevronRight, 
  BookOpen,
  Hash
} from 'lucide-react';
import { HadithBook, HadithChapter } from '../types';

interface ChapterListProps {
  book: HadithBook;
  chapters: HadithChapter[];
  onSelectChapter: (chapter: HadithChapter) => void;
  onBack: () => void;
}

export const ChapterList: React.FC<ChapterListProps> = ({
  book,
  chapters,
  onSelectChapter,
  onBack
}) => {
  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      {/* Book Hero */}
      <div className="relative rounded-[2.5rem] p-10 md:p-16 mb-12 text-white overflow-hidden shadow-2xl" style={{ backgroundColor: book.color }}>
        {/* Pattern overlay */}
        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/islamic-art.png')]" />
        
        <div className="relative z-10 flex flex-col md:flex-row items-center gap-8 justify-between">
          <div className="space-y-4 text-center md:text-left">
            <button 
              onClick={onBack}
              className="inline-flex items-center gap-2 text-white/70 hover:text-white transition-colors mb-4 group"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              <span className="text-xs font-bold uppercase tracking-widest">Back to Library</span>
            </button>
            <h2 className="font-serif text-4xl md:text-5xl font-bold">
              {book.name}
            </h2>
            <p className="arabic-text text-3xl opacity-80">
              {book.nameArabic}
            </p>
          </div>
          
          <div className="flex gap-6">
            <div className="text-center bg-white/10 backdrop-blur-md px-6 py-4 rounded-3xl border border-white/20">
              <p className="text-[10px] font-bold text-white/60 uppercase tracking-widest mb-1">Hadiths</p>
              <p className="text-xl font-bold">{book.hadithCount.toLocaleString()}</p>
            </div>
            <div className="text-center bg-white/10 backdrop-blur-md px-6 py-4 rounded-3xl border border-white/20">
              <p className="text-[10px] font-bold text-white/60 uppercase tracking-widest mb-1">Chapters</p>
              <p className="text-xl font-bold">{book.chapterCount}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mb-6 flex items-center justify-between px-2">
        <h3 className="text-sm font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Select a Chapter (Kitab)</h3>
        <p className="text-xs text-slate-400">{chapters.length} Chapters</p>
      </div>

      {/* Chapters Grid/List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {chapters.map((chapter, idx) => (
          <motion.div
            key={chapter.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.02 }}
            onClick={() => onSelectChapter(chapter)}
            className="group bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-100 dark:border-slate-800 hover:shadow-lg hover:border-islamic-green/30 transition-all cursor-pointer flex items-center justify-between"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400 group-hover:bg-islamic-green/10 group-hover:text-islamic-green transition-all">
                <Hash className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-0.5">Chapter {chapter.number}</p>
                <h4 className="font-medium text-slate-800 dark:text-slate-100 group-hover:text-islamic-green transition-colors">{chapter.name}</h4>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="arabic-text text-lg text-slate-300 dark:text-slate-700 group-hover:text-islamic-green/40 transition-colors hidden sm:block">
                {chapter.nameArabic}
              </span>
              <div className="w-8 h-8 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center group-hover:bg-islamic-green group-hover:text-white transition-all">
                <ChevronRight className="w-4 h-4" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
