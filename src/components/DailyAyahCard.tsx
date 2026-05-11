import React, { useRef, useState } from 'react';
import { motion } from 'motion/react';
import { Sparkles, Save, Share2, Info, Book, Quote, Download, ChevronRight, BookOpen } from 'lucide-react';
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
        backgroundColor: '#fdfbf7', // parchment
        style: {
          padding: '48px',
          borderRadius: '0px' 
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

  const handleShareText = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const text = `Daily Inspiration - Qur'an Ayah:\n\n"${verse.englishTranslation}"\n\nReference: ${verse.reference}\n\nShared via consulting Qur'an & Sunnah App`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Daily Ayah: ${verse.reference}`,
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
    <div className="relative group max-w-4xl mx-auto px-2">
      <motion.div 
        ref={cardRef}
        initial={{ opacity: 0, y: 30, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
        whileHover={{ y: -4 }}
        className="bg-white dark:bg-slate-900/40 rounded-[2rem] border border-slate-100 dark:border-white/5 p-8 md:p-14 shadow-premium hover:shadow-[0_40px_80px_-20px_rgba(2,44,34,0.12)] transition-all duration-700 relative overflow-hidden"
      >
        {/* Subtle Decorative Arabic Art */}
        <div className="absolute -top-12 -right-12 p-12 pointer-events-none opacity-[0.02] dark:opacity-[0.05] scale-[2.5] text-islamic-green">
          <Quote className="w-64 h-64 -rotate-12 fill-current" />
        </div>
        
        <div className="absolute -bottom-12 -left-12 p-12 pointer-events-none opacity-[0.01] dark:opacity-[0.03] scale-[2] text-islamic-gold">
          <Book className="w-64 h-64 rotate-45" />
        </div>
        
        {/* Content Header */}
        <div className="flex items-center justify-between mb-12 relative z-10">
          <div className="flex items-center gap-4">
            <motion.div 
              whileHover={{ rotate: 180 }}
              transition={{ duration: 0.8 }}
              className="w-12 h-12 rounded-2xl bg-islamic-green/5 dark:bg-emerald-500/10 flex items-center justify-center border border-islamic-green/10 dark:border-emerald-500/20 shadow-inner"
            >
              <Sparkles className="w-6 h-6 text-islamic-gold" />
            </motion.div>
            <div>
              <span className="text-[10px] font-bold text-islamic-green/50 dark:text-emerald-400/50 uppercase tracking-[0.4em] block mb-1">Illuminated Guidance</span>
              <h3 className="text-sm font-serif font-bold text-slate-900 dark:text-white uppercase tracking-wider">Ayah of Hope</h3>
            </div>
          </div>
          <div className="flex items-center gap-2">
             <div className="flex bg-slate-50/50 dark:bg-slate-800/30 p-1.5 rounded-2xl border border-slate-100/50 dark:border-slate-800/50 backdrop-blur-sm">
               <motion.button 
                whileTap={{ scale: 0.9 }}
                onClick={(e) => { e.stopPropagation(); onToggleBookmark(); }}
                className={`p-2.5 rounded-xl transition-all ${isBookmarked ? 'bg-islamic-green text-white shadow-lg shadow-islamic-green/20' : 'text-slate-400 hover:text-islamic-green hover:bg-white dark:hover:bg-slate-700'}`}
                title="Bookmark"
              >
                <Save className={`w-4 h-4 ${isBookmarked ? 'fill-current' : ''}`} />
              </motion.button>
               <motion.button 
                whileTap={{ scale: 0.9 }}
                onClick={handleShareImage}
                disabled={isSharing}
                className="p-2.5 text-slate-400 hover:text-islamic-green hover:bg-white dark:hover:bg-slate-700 rounded-xl transition-all"
                title="Download Card"
              >
                <Download className="w-4 h-4" />
              </motion.button>
            </div>
          </div>
        </div>

        {/* The Ayah */}
        <div className="space-y-12 mb-12 relative z-10 text-center">
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="relative inline-block mx-auto"
          >
             <p className="font-arabic text-[26px] md:text-[32px] leading-[1.8] text-slate-900 dark:text-white font-medium cursor-pointer hover:text-islamic-green transition-colors" onClick={onViewDetail}>
               {verse.arabicText}
             </p>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="space-y-10 max-w-3xl mx-auto px-4"
          >
            <div className="relative">
              <Quote className="absolute -top-6 -left-4 w-10 h-10 text-slate-100 dark:text-white/5 pointer-events-none" />
              <p className="font-serif text-[17px] md:text-[20px] leading-[1.7] text-slate-600 dark:text-slate-300 italic font-medium">
                "{verse.englishTranslation}"
              </p>
            </div>
            
            <p className="font-urdu text-[20px] md:text-[24px] leading-[2] text-slate-500 dark:text-slate-400 opacity-90 border-t border-slate-50 dark:border-white/5 pt-10">
              {verse.urduTranslation}
            </p>
            
            <div className="pt-8">
              <div className="inline-flex items-center gap-3 px-4 py-1.5 bg-slate-50 dark:bg-slate-900 rounded-full border border-slate-100 dark:border-white/5">
                <BookOpen className="w-3.5 h-3.5 text-islamic-green" />
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em] mt-0.5">
                  {verse.surahName} • {verse.surahNumber}:{verse.ayahNumber}
                </span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* AI Reflection */}
        {reflection && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="pt-12 mt-12 border-t border-slate-50 dark:border-white/5 relative z-10"
          >
            <div className="bg-islamic-green/[0.03] dark:bg-emerald-500/[0.05] p-6 rounded-[1.5rem] border border-islamic-green/5">
              <p className="text-center text-sm md:text-base font-serif text-slate-500 dark:text-slate-400 italic max-w-2xl mx-auto leading-relaxed">
                "{reflection}"
              </p>
            </div>
          </motion.div>
        )}

        {/* Button to View More */}
        <div className="pt-12 flex justify-center">
           <motion.button 
            whileTap={{ scale: 0.95 }}
            onClick={onViewDetail}
            className="group/btn px-10 py-4 bg-slate-900 dark:bg-white/10 hover:bg-islamic-green text-white transition-all duration-300 rounded-2xl text-[11px] font-bold uppercase tracking-[0.2em] flex items-center gap-3 shadow-xl shadow-slate-900/10 hover:shadow-islamic-green/20"
           >
             Explore Full Context
             <ChevronRight className="w-4 h-4 transition-transform group-hover/btn:translate-x-1" />
           </motion.button>
        </div>
      </motion.div>
    </div>
  );
};
