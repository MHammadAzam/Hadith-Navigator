import React, { useRef, useState } from 'react';
import { motion } from 'motion/react';
import { Sparkles, Save, Share2, Info, Book, Quote, Download } from 'lucide-react';
import { QuranVerse } from '../types';
import { toPng } from 'html-to-image';
import { AudioRecitation } from './AudioRecitation';

interface DailyAyahCardProps {
  verse: QuranVerse;
  reflection?: string;
  isBookmarked: boolean;
  onToggleBookmark: () => void;
  onViewDetail: () => void;
}

export const DailyAyahCard: React.FC<DailyAyahCardProps> = ({
  verse,
  reflection,
  isBookmarked,
  onToggleBookmark,
  onViewDetail
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isSharing, setIsSharing] = useState(false);

  const handleShareImage = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!cardRef.current) return;
    
    setIsSharing(true);
    try {
      const dataUrl = await toPng(cardRef.current, { 
        cacheBust: true,
        backgroundColor: '#f8fafc', // slate-50
        style: {
          padding: '40px',
          borderRadius: '0px' // Reset for capture
        }
      });
      const link = document.createElement('a');
      link.download = `Ayah-of-the-day-${verse.reference}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('oops, something went wrong!', err);
    } finally {
      setIsSharing(false);
    }
  };

  return (
    <div className="relative group">
      <motion.div 
        ref={cardRef}
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 p-8 md:p-12 shadow-sm hover:shadow-2xl transition-all overflow-hidden relative"
      >
        {/* Background Patterns */}
        <div className="absolute top-0 right-0 p-8 pointer-events-none opacity-[0.03] dark:opacity-[0.07]">
          <Book className="w-48 h-48 rotate-12" />
        </div>
        
        {/* Content Header */}
        <div className="flex items-center justify-between mb-10 relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-amber-500" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block mb-0.5">Daily Inspiration</span>
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">Qur’an Ayah for You 🌙</h3>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={(e) => { e.stopPropagation(); onToggleBookmark(); }}
              className={`p-3 rounded-2xl transition-all ${isBookmarked ? 'bg-islamic-green text-white' : 'bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-islamic-green'}`}
            >
              <Save className={`w-5 h-5 ${isBookmarked ? 'fill-current' : ''}`} />
            </button>
            <button 
              onClick={handleShareImage}
              disabled={isSharing}
              className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-islamic-green transition-all"
            >
              {isSharing ? <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }}><Download className="w-5 h-5" /></motion.div> : <Share2 className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* The Ayah */}
        <div className="space-y-8 mb-10 relative z-10">
          <div className="flex justify-end">
            <AudioRecitation surahNumber={verse.surahNumber} ayahNumber={verse.ayahNumber} />
          </div>
          <p className="arabic-text text-3xl md:text-5xl leading-[1.8] text-right cursor-pointer" onClick={onViewDetail}>
            {verse.arabicText}
          </p>
          
          <div className="space-y-4 max-w-2xl">
            <p className="translation-text text-lg italic opacity-90">
              "{verse.englishTranslation}"
            </p>
            <p className="urdu-text text-xl opacity-80 text-right">
              {verse.urduTranslation}
            </p>
            <div className="flex items-center gap-2 pt-2">
              <div className="w-8 h-px bg-slate-100 dark:bg-slate-800" />
              <span className="reference-text !normal-case tracking-normal italic font-serif">
                {verse.surahName} ({verse.surahNumber}:{verse.ayahNumber})
              </span>
            </div>
          </div>
        </div>

        {/* AI Reflection */}
        {reflection && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="pt-8 border-t border-slate-50 dark:border-slate-800 relative z-10"
          >
            <div className="flex items-center gap-2 mb-4">
              <Quote className="w-4 h-4 text-islamic-gold opacity-50" />
              <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">Daily Reflection</span>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed italic font-serif mb-4">
              {reflection}
            </p>
            <div className="flex items-center gap-1.5 text-[9px] text-slate-400 dark:text-slate-500">
              <Info className="w-3 h-3" />
              <span>AI-generated reflection for learning</span>
            </div>
          </motion.div>
        )}

        {/* Button to View More */}
        <div className="mt-8 pt-6 border-t border-slate-50 dark:border-slate-800 flex justify-center">
           <button 
            onClick={onViewDetail}
            className="text-xs font-bold text-islamic-green dark:text-emerald-500 uppercase tracking-widest hover:gap-3 transition-all flex items-center gap-2"
           >
             Explore Full Context
             <Sparkles className="w-3 h-3" />
           </button>
        </div>
      </motion.div>
      
      {/* Visual Accents */}
      <div className="absolute -inset-1.5 bg-gradient-to-br from-islamic-green/20 via-islamic-gold/10 to-amber-500/20 rounded-[2.7rem] blur-2xl opacity-20 -z-10 group-hover:opacity-40 transition-opacity" />
    </div>
  );
};
