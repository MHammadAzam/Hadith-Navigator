import React from 'react';
import { motion } from 'motion/react';
import { 
  Scroll, 
  BookOpen, 
  Compass, 
  Heart, 
  Sparkles, 
  Layers,
  ChevronRight
} from 'lucide-react';
import { HadithBook } from '../types';
import { SIHAH_E_SITTA } from '../constants';

const IconMap: Record<string, any> = {
  Scroll,
  BookOpen,
  Compass,
  Heart,
  Sparkles,
  Layers
};

interface BookGridProps {
  onSelectBook: (book: HadithBook) => void;
}

export const BookGrid: React.FC<BookGridProps> = ({ onSelectBook }) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 py-8">
      {SIHAH_E_SITTA.map((book, idx) => {
        const IconComponent = IconMap[book.icon] || BookOpen;
        return (
          <motion.div
            key={book.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.05 }}
            onClick={() => onSelectBook(book)}
            className="group relative bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all cursor-pointer overflow-hidden text-center"
          >
            <div 
              className="w-10 h-10 rounded-xl flex items-center justify-center mb-3 shadow-inner mx-auto"
              style={{ backgroundColor: `${book.color}15`, color: book.color }}
            >
              <IconComponent className="w-5 h-5" />
            </div>

            <h3 className="font-serif text-sm font-bold text-slate-800 dark:text-slate-100 group-hover:text-islamic-green transition-colors line-clamp-1">
              {book.name.split(' ').pop()}
            </h3>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">
              {book.hadithCount.toLocaleString()} H
            </p>
            
            <div 
              className="absolute bottom-0 left-0 right-0 h-1 transition-all duration-300 transform scale-x-0 group-hover:scale-x-100"
              style={{ backgroundColor: book.color }}
            />
          </motion.div>
        );
      })}
    </div>
  );
};
