import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Bookmark, 
  BookmarkCheck, 
  Share2, 
  Play, 
  Sparkles, 
  ArrowLeft,
  Loader2,
  Info,
  Copy,
  CheckCircle2,
  BookOpen,
  Volume2,
  Quote
} from 'lucide-react';
import { Hadith, AIExplanation, SimilarItem } from '../types';
import { AudioPlayButton } from './AudioPlayButton';

interface HadithDetailProps {
  hadith: Hadith;
  isBookmarked: boolean;
  onToggleBookmark: () => void;
  onBack: () => void;
  onExplain: () => void;
  explanation?: AIExplanation;
  isExplaining: boolean;
  similarHadiths?: SimilarItem[];
  isLoadingSimilar: boolean;
  onSelectSimilar: (item: SimilarItem) => void;
}

export const HadithDetail: React.FC<HadithDetailProps> = ({
  hadith,
  isBookmarked,
  onToggleBookmark,
  onBack,
  onExplain,
  explanation,
  isExplaining,
  similarHadiths,
  isLoadingSimilar,
  onSelectSimilar
}) => {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = () => {
    const text = `${hadith.arabicText}\n\n${hadith.englishTranslation}\n\nReference: ${hadith.reference}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
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
      handleCopy();
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-12">
        <button 
          onClick={onBack}
          className="p-3 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors text-slate-500"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <div className="flex items-center gap-2">
          <button 
            onClick={handleCopy}
            className="p-3 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors text-slate-500 relative"
          >
            {copied ? <CheckCircle2 className="w-6 h-6 text-emerald-500" /> : <Copy className="w-6 h-6" />}
          </button>
          <button 
            onClick={onToggleBookmark}
            className={`p-3 rounded-full transition-colors ${isBookmarked ? 'text-islamic-green bg-islamic-green/10' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
          >
            <Bookmark className={`w-6 h-6 ${isBookmarked ? 'fill-islamic-green' : ''}`} />
          </button>
          <button 
            onClick={handleShare}
            className="p-3 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors text-slate-500"
          >
            <Share2 className="w-6 h-6" />
          </button>
        </div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="bg-white/70 dark:bg-slate-900/60 backdrop-blur-3xl rounded-[3rem] p-10 md:p-20 border border-white/40 dark:border-white/5 shadow-premium relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 p-12 opacity-[0.02] dark:opacity-[0.05] pointer-events-none">
          <BookOpen className="w-80 h-80 -rotate-12" />
        </div>

        <div className="flex flex-col items-center mb-16 relative z-10">
          <div className="w-16 h-16 rounded-3xl bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 flex items-center justify-center mb-6">
            <Quote className="w-8 h-8" />
          </div>
           <span className="text-sm font-bold text-slate-400 uppercase tracking-[0.4em] mb-2">Prophetic Guidance</span>
           <h1 className="text-lg font-bold text-slate-900 dark:text-white">{hadith.reference}</h1>
        </div>

        <div className="space-y-16 relative z-10">
          <div className="flex justify-end mb-4">
             <AudioPlayButton text={hadith.arabicText} lang="ar" />
          </div>
          <p className="arabic-text mb-12">
            {hadith.arabicText}
          </p>

          <div className="grid md:grid-cols-2 gap-12 pt-12 border-t border-slate-50 dark:border-slate-800">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">English Translation</span>
                <AudioPlayButton text={hadith.englishTranslation} lang="en" />
              </div>
              <p className="translation-text">
                "{hadith.englishTranslation}"
              </p>
            </div>
            <div className="space-y-4 md:border-l md:border-slate-50 md:dark:border-slate-800 md:pl-12">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Urdu Translation</span>
                <AudioPlayButton text={hadith.urduTranslation} lang="ur" />
              </div>
              <p className="urdu-text">
                {hadith.urduTranslation}
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* AI Section */}
      <div className="mt-16 grid grid-cols-1 gap-12">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-white/40 dark:bg-black/20 backdrop-blur-3xl rounded-[3rem] border border-white/50 dark:border-white/5 shadow-premium overflow-hidden"
        >
          <div className="p-10 md:p-16">
            {!explanation && !isExplaining ? (
               <div className="flex flex-col items-center text-center space-y-8">
                  <div className="w-20 h-20 bg-islamic-green/5 dark:bg-emerald-500/10 rounded-3xl flex items-center justify-center text-islamic-gold">
                    <Sparkles className="w-10 h-10" />
                  </div>
                  <div className="space-y-3">
                    <h3 className="text-2xl font-serif font-bold text-slate-900 dark:text-white">Seek Wisdom</h3>
                    <p className="text-slate-500 dark:text-slate-400 font-serif italic text-lg max-w-sm">Reveal a heart-to-heart AI reflection on this prophetic guidance.</p>
                  </div>
                  <button 
                    onClick={onExplain}
                    className="px-10 py-4 bg-islamic-green text-white rounded-2xl font-bold text-xs uppercase tracking-[0.2em] hover:scale-105 active:scale-95 transition-all shadow-lg shadow-islamic-green/20"
                  >
                    Deep Insight
                  </button>
               </div>
            ) : isExplaining ? (
              <div className="flex flex-col items-center justify-center py-20 gap-6">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                >
                  <Loader2 className="w-12 h-12 text-islamic-green opacity-40" />
                </motion.div>
                <p className="text-slate-400 font-serif italic text-xl animate-pulse">Filtering through the tradition...</p>
              </div>
            ) : explanation ? (
              <div className="space-y-12">
                <div className="flex items-center gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-islamic-gold" />
                  <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.3em]">Spiritual Echo</span>
                </div>

                <div className="relative">
                  <Quote className="absolute -top-10 -left-10 w-20 h-20 text-islamic-green/[0.03] dark:text-emerald-500/[0.05] pointer-events-none" />
                  <p className="text-2xl md:text-3xl font-serif text-slate-800 dark:text-white italic leading-relaxed text-center">
                    {explanation.empathy}
                  </p>
                </div>

                <div className="space-y-8 max-w-2xl mx-auto text-center">
                  <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-islamic-green/5 dark:bg-emerald-500/10 rounded-full text-[10px] font-bold text-islamic-green dark:text-emerald-400 uppercase tracking-widest border border-islamic-green/10">
                     The Path Forward
                  </div>
                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed font-serif text-xl border-b border-slate-100 dark:border-white/5 pb-12">
                    {explanation.narrative}
                  </p>
                  <p className="text-2xl md:text-3xl font-serif text-slate-800 dark:text-slate-100 italic pt-6">
                    {explanation.reflection}
                  </p>
                </div>

                <div className="flex items-center gap-2 pt-10 border-t border-slate-100 dark:border-white/5 text-[10px] text-slate-400 dark:text-slate-500 italic justify-center">
                   <span className="flex items-center gap-1.5">
                     <Info className="w-3 h-3" />
                     {explanation.disclaimer}
                   </span>
                </div>
              </div>
            ) : null}
          </div>
        </motion.div>

        {/* Similar Guidance */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-10 border border-slate-100 dark:border-slate-800"
        >
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-lg font-bold dark:text-white">Related Sunnah</h3>
            {isLoadingSimilar && <Loader2 className="w-5 h-5 animate-spin text-islamic-green" />}
          </div>

          <div className="space-y-4">
            {similarHadiths && similarHadiths.length > 0 ? (
              similarHadiths.map((item, idx) => (
                <div 
                  key={idx}
                  onClick={() => onSelectSimilar(item)}
                  className="group flex flex-col p-6 bg-slate-50 dark:bg-slate-800/50 rounded-3xl hover:bg-islamic-green/5 transition-all cursor-pointer border border-transparent hover:border-islamic-green/20"
                >
                  <div className="flex items-center justify-between mb-4">
                    <span className="px-3 py-1 bg-white dark:bg-slate-900 rounded-lg text-[10px] font-bold text-islamic-green dark:text-emerald-500 uppercase tracking-wider">
                      {item.source}
                    </span>
                    <span className="reference-text">
                      {item.reference}
                    </span>
                  </div>
                  <p className="text-slate-800 dark:text-slate-200 font-bold mb-2 group-hover:text-islamic-green dark:group-hover:text-emerald-500 transition-colors">
                    {item.summary}
                  </p>
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-slate-500 dark:text-slate-400 italic">
                      {item.mainPoint}
                    </p>
                    <BookOpen className="w-4 h-4 text-slate-300 group-hover:text-islamic-green dark:group-hover:text-emerald-500 transition-colors" />
                  </div>
                </div>
              ))
            ) : !isLoadingSimilar && (
              <p className="text-slate-400 text-center py-8 text-sm italic">Searching for thematically related traditional references...</p>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};
