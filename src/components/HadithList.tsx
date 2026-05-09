import React from 'react';
import { motion } from 'motion/react';
import { 
  BookOpen, 
  ChevronRight, 
  Bookmark, 
  BookmarkCheck,
  Search,
  Share2
} from 'lucide-react';
import { Hadith, HadithBook, HadithChapter } from '../types';

interface HadithListProps {
  book: HadithBook;
  chapter: HadithChapter;
  hadiths: Hadith[];
  onSelectHadith: (hadith: Hadith) => void;
  isBookmarked: (id: string) => boolean;
  onToggleBookmark: (hadith: Hadith) => void;
  onBack: () => void;
}

export const HadithList: React.FC<HadithListProps> = ({
  book,
  chapter,
  hadiths,
  onSelectHadith,
  isBookmarked,
  onToggleBookmark,
  onBack
}) => {
  const handleShare = async (e: React.MouseEvent, hadith: Hadith) => {
    e.stopPropagation();
    const text = `Prophetic Guidance:\n\n"${hadith.englishTranslation}"\n\nReference: ${hadith.reference}\n\nShared via consulting Qur'an & Sunnah App`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Hadith: ${hadith.reference}`,
          text: text,
          url: window.location.href,
        });
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          console.error('Error sharing:', err);
        }
      }
    } else {
      navigator.clipboard.writeText(text);
      alert('Quote copied to clipboard!');
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      {/* Header */}
      <div className="mb-10 text-center space-y-4">
        <div 
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest border"
          style={{ borderColor: `${book.color}40`, backgroundColor: `${book.color}10`, color: book.color }}
        >
          <BookOpen className="w-3 h-3" />
          {book.name}
        </div>
        <h2 className="font-serif text-3xl md:text-4xl text-slate-900 dark:text-slate-100">
          {chapter.name}
        </h2>
        <p className="arabic-text text-2xl text-slate-500 dark:text-slate-400">
          {chapter.nameArabic}
        </p>
      </div>

      {/* List */}
      <div className="space-y-4">
        {hadiths.map((hadith, idx) => {
          const bookmarked = isBookmarked(hadith.id);
          return (
            <motion.div
              key={hadith.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.05 }}
              onClick={() => onSelectHadith(hadith)}
              className="group bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-6 flex flex-col md:flex-row items-center gap-6 hover:shadow-xl hover:shadow-islamic-green/5 hover:border-islamic-green/30 transition-all cursor-pointer relative"
            >
              <div className="flex-1 space-y-4 w-full">
                <div className="flex items-center justify-between">
                  <span className="reference-text">
                    Reference: {hadith.hadithNumber}
                  </span>
                </div>
                
                <p className="arabic-text line-clamp-1 mb-2">
                  {hadith.arabicText}
                </p>
                
                <p className="translation-text line-clamp-1">
                  "{hadith.englishTranslation}"
                </p>
              </div>

              <div className="flex flex-row md:flex-col items-center gap-2">
                <button 
                  onClick={(e) => handleShare(e, hadith)}
                  className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-islamic-green transition-all"
                >
                  <Share2 className="w-4 h-4" />
                </button>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleBookmark(hadith);
                  }}
                  className={`p-2 rounded-xl transition-all ${
                    bookmarked 
                      ? 'bg-islamic-gold text-white' 
                      : 'bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-islamic-gold'
                  }`}
                >
                  {bookmarked ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
                </button>
                <div className="w-8 h-8 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center group-hover:bg-islamic-green group-hover:text-white transition-all">
                  <ChevronRight className="w-4 h-4" />
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
