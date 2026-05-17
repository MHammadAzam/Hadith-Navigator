import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Bookmark, 
  Trash2, 
  ChevronRight, 
  X,
  Scroll,
  BookOpen,
  Share2
} from 'lucide-react';
import { SavedItem } from '../types';

interface BookmarkListProps {
  bookmarks: SavedItem[];
  onSelectBookmark: (item: SavedItem) => void;
  onRemoveBookmark: (id: string) => void;
  onClose: () => void;
}

export const BookmarkList: React.FC<BookmarkListProps> = ({
  bookmarks,
  onSelectBookmark,
  onRemoveBookmark,
  onClose
}) => {
  const handleShare = async (e: React.MouseEvent, item: SavedItem) => {
    e.stopPropagation();
    const text = `${item.type === 'verse' ? "Divine Guidance from the Qur'an" : "Prophetic Guidance"}:\n\n"${item.data.englishTranslation}"\n\nReference: ${item.data.reference}\n\nShared via consulting Qur'an & Sunnah App`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${item.type === 'hadith' ? 'Hadith' : 'Qur\'an'}: ${item.data.reference}`,
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
    <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-950">
      <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-white dark:bg-slate-900">
        <div className="flex items-center gap-3">
          <Bookmark className="w-6 h-6 text-islamic-green" />
          <h2 className="font-serif text-2xl font-bold text-slate-800 dark:text-slate-100">Saved Guidance</h2>
        </div>
        <button 
          onClick={onClose}
          className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
        >
          <X className="w-6 h-6 text-slate-400" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {bookmarks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center space-y-6 opacity-30">
            <Bookmark className="w-20 h-20" />
            <p className="font-bold text-lg">Your spiritual library is empty</p>
            <p className="text-sm max-w-xs mx-auto -mt-4">Search and save verses or hadiths to build your personal knowledge collection.</p>
          </div>
        ) : (
          <AnimatePresence>
            {bookmarks.map((b, idx) => (
              <motion.div
                key={b.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ delay: idx * 0.05 }}
                className="group relative bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-xl transition-all cursor-pointer"
                onClick={() => onSelectBookmark(b)}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    {b.type === 'hadith' ? (
                      <Scroll className="w-3.5 h-3.5 text-islamic-green" />
                    ) : (
                      <BookOpen className="w-3.5 h-3.5 text-amber-500" />
                    )}
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      {b.type === 'hadith' ? (b.data as any).bookId?.toUpperCase() : 'The Qur\'an'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={(e) => handleShare(e, b)}
                      className="p-2 text-slate-300 hover:text-islamic-green hover:bg-islamic-green/5 rounded-lg transition-all"
                    >
                      <Share2 className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        onRemoveBookmark(b.id);
                      }}
                      className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <p className="arabic-text line-clamp-1 mb-2">
                  {b.data?.arabicText || 'Text unavailable'}
                </p>

                <p className="translation-text line-clamp-2 mb-4">
                  "{b.data?.englishTranslation || 'Translation unavailable'}"
                </p>

                <div className="flex items-center justify-between pt-4 border-t border-slate-50 dark:border-slate-800">
                  <span className="reference-text">
                    {b.data.reference}
                  </span>
                  <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-islamic-green transition-colors" />
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
};
