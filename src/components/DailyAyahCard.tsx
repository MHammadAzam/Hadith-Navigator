import React, { useRef, useState } from 'react';
import { motion } from 'motion/react';
import { Sparkles, Save, Share2, Info, Book, Quote, Download, ChevronRight } from 'lucide-react';
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
    <div className="relative group max-w-4xl mx-auto">
      <motion.div 
        ref={cardRef}
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="bg-white dark:bg-slate-900/60 backdrop-blur-3xl rounded-[3rem] border border-white/40 dark:border-white/5 p-10 md:p-16 shadow-premium hover:shadow-[0_40px_80px_-20px_rgba(2,44,34,0.12)] transition-all duration-700 relative overflow-hidden"
      >
        {/* Subtle Decorative Arabic Art */}
        <div className="absolute top-0 right-0 p-12 pointer-events-none opacity-[0.02] dark:opacity-[0.05] scale-150">
          <Book className="w-64 h-64 -rotate-12" />
        </div>
        
        {/* Content Header */}
        <div className="flex items-center justify-between mb-12 relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-islamic-green/5 dark:bg-emerald-500/10 flex items-center justify-center border border-islamic-green/10 dark:border-emerald-500/20">
              <Sparkles className="w-6 h-6 text-islamic-gold" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-islamic-green/60 dark:text-emerald-400/60 uppercase tracking-[0.3em] block mb-0.5">Ayah of the Day</span>
              <h3 className="text-base font-serif font-bold text-slate-900 dark:text-white">Daily Inspiration 🌙</h3>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={(e) => { e.stopPropagation(); onToggleBookmark(); }}
              className={`p-3.5 rounded-2xl transition-all duration-300 ${isBookmarked ? 'bg-islamic-green text-white shadow-lg shadow-islamic-green/20' : 'bg-slate-50 dark:bg-slate-800/50 text-slate-400 hover:text-islamic-green'}`}
            >
              <Save className={`w-5 h-5 ${isBookmarked ? 'fill-current' : ''}`} />
            </button>
            <div className="flex bg-slate-50 dark:bg-slate-800/50 p-1 rounded-2xl border border-slate-100 dark:border-slate-800">
               <button 
                onClick={handleShareImage}
                disabled={isSharing}
                className="p-2.5 text-slate-400 hover:text-islamic-green transition-all"
                title="Download as Image"
              >
                {isSharing ? <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }}><Download className="w-5 h-5" /></motion.div> : <Download className="w-5 h-5" />}
              </button>
              <button 
                onClick={handleShareText}
                className="p-2.5 text-slate-400 hover:text-islamic-green transition-all"
                title="Share Text"
              >
                <Share2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* The Ayah */}
        <div className="space-y-12 mb-12 relative z-10">
          <div className="flex justify-end">
            <AudioRecitation surahNumber={verse.surahNumber} ayahNumber={verse.ayahNumber} />
          </div>
          <div className="relative">
             <Quote className="absolute -top-6 -left-8 w-16 h-16 text-islamic-green/5 dark:text-emerald-500/5 pointer-events-none" />
             <p className="arabic-text text-4xl md:text-6xl text-right leading-[1.7] !tracking-normal cursor-pointer hover:opacity-80 transition-opacity" onClick={onViewDetail}>
              {verse.arabicText}
            </p>
          </div>
          
          <div className="space-y-6 max-w-2xl">
            <p className="translation-text text-xl md:text-2xl italic leading-relaxed text-slate-800 dark:text-slate-200">
              "{verse.englishTranslation}"
            </p>
            <p className="urdu-text text-2xl md:text-3xl text-right opacity-80 border-r-2 border-islamic-green/20 pr-6 mr-0 ml-auto">
              {verse.urduTranslation}
            </p>
            <div className="flex items-center gap-4 pt-4">
              <span className="reference-text">
                {verse.surahName} ({verse.surahNumber}:{verse.ayahNumber})
              </span>
              <div className="h-px flex-1 bg-slate-100 dark:bg-slate-800/50" />
            </div>
          </div>
        </div>

        {/* AI Reflection */}
        {reflection && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="pt-10 border-t border-slate-100 dark:border-white/5 relative z-10"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-1.5 h-1.5 rounded-full bg-islamic-gold" />
              <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.3em]">Heartfelt Reflection</span>
            </div>
            <p className="text-xl font-serif text-slate-600 dark:text-slate-300 leading-relaxed italic opacity-90 mb-6">
              {reflection}
            </p>
          </motion.div>
        )}

        {/* Button to View More */}
        <div className="pt-8 flex justify-center">
           <button 
            onClick={onViewDetail}
            className="group/btn px-8 py-4 bg-islamic-green/5 dark:bg-emerald-500/10 hover:bg-islamic-green hover:text-white dark:hover:bg-emerald-600 transition-all duration-300 rounded-2xl text-[11px] font-bold uppercase tracking-[0.2em] flex items-center gap-3 text-islamic-green dark:text-emerald-400 shadow-sm"
           >
             Explore Full Context
             <ChevronRight className="w-4 h-4 transition-transform group-hover/btn:translate-x-1" />
           </button>
        </div>
      </motion.div>
    </div>
  );
};
