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
  Volume2
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

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <button 
        onClick={onBack}
        className="flex items-center gap-2 text-slate-400 hover:text-islamic-green transition-colors mb-8 group"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        <span className="text-sm font-medium">Back to list</span>
      </button>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 md:p-12 shadow-sm border border-slate-100 dark:border-slate-800 space-y-10 relative overflow-hidden"
      >
        {/* Background Graphic */}
        <div className="absolute top-0 right-0 p-12 opacity-[0.02] dark:opacity-[0.04]">
          <Sparkles className="w-64 h-64 rotate-12" />
        </div>

        {/* Toolbar */}
        <div className="flex items-center justify-between relative z-10">
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 bg-islamic-green/10 text-islamic-green text-[10px] font-bold rounded-full uppercase tracking-widest border border-islamic-green/20">
              {hadith.authenticity}
            </span>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              Hadith {hadith.hadithNumber}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button 
              onClick={handleCopy}
              className="p-3 bg-slate-50 dark:bg-slate-800 text-slate-500 hover:text-islamic-green rounded-2xl transition-all"
            >
              {copied ? <CheckCircle2 className="w-5 h-5 text-green-500" /> : <Copy className="w-5 h-5" />}
            </button>
            <button className="p-3 bg-slate-50 dark:bg-slate-800 text-slate-500 hover:text-islamic-green rounded-2xl transition-all">
              <Share2 className="w-5 h-5" />
            </button>
            <button 
              onClick={onToggleBookmark}
              className={`p-3 rounded-2xl transition-all ${
                isBookmarked 
                  ? 'bg-islamic-gold text-white shadow-lg shadow-islamic-gold/20' 
                  : 'bg-slate-50 dark:bg-slate-800 text-slate-500 hover:text-islamic-gold'
              }`}
            >
              {isBookmarked ? <BookmarkCheck className="w-5 h-5" /> : <Bookmark className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Text Content */}
        <div className="space-y-12 relative z-10">
          <div className="space-y-6">
            <div className="flex items-center justify-between mb-8 group">
              <div className="flex items-center gap-2">
                <AudioPlayButton text={hadith.arabicText} lang="ar" />
                <span className="px-4 arabic-text text-islamic-gold text-sm">متن الحديث</span>
              </div>
              <div className="h-px bg-slate-100 dark:bg-slate-800 flex-1 mt-4" />
            </div>
            <p className="arabic-text mb-10">
              {hadith.arabicText}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="space-y-4">
              <div className="flex items-center justify-between text-slate-400 dark:text-slate-500 font-bold text-[10px] uppercase tracking-[0.2em]">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-[1px] bg-slate-200 dark:bg-slate-800" />
                  English Translation
                </div>
                <AudioPlayButton text={hadith.englishTranslation} lang="en" />
              </div>
              <p className="translation-text mb-8">
                "{hadith.englishTranslation}"
              </p>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 font-bold text-[10px] uppercase tracking-[0.2em]">
                <AudioPlayButton text={hadith.urduTranslation} lang="ur" />
                <div className="flex items-center gap-2">
                  اردو ترجمہ
                  <div className="w-6 h-[1px] bg-slate-200 dark:bg-slate-800" />
                </div>
              </div>
              <p className="urdu-text text-right">
                {hadith.urduTranslation}
              </p>
            </div>
          </div>
        </div>

        {/* Reference & Tags */}
        <div className="pt-8 border-t border-slate-50 dark:border-slate-800 flex flex-wrap items-center justify-between gap-4 relative z-10">
          <div className="flex items-center gap-2">
            <Info className="w-3.5 h-3.5 text-islamic-green" />
            <span className="reference-text">{hadith.reference}</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {hadith.tags.map(tag => (
              <span key={tag} className="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-[10px] font-bold rounded-full uppercase tracking-widest">
                #{tag}
              </span>
            ))}
          </div>
        </div>

        {/* AI Action */}
        <div className="pt-4 relative z-10 space-y-6">
          {!explanation ? (
            <button 
              onClick={onExplain}
              disabled={isExplaining}
              className="w-full h-16 bg-gradient-to-r from-islamic-green to-teal-600 text-white rounded-2xl font-bold flex items-center justify-center gap-3 hover:shadow-xl hover:shadow-islamic-green/20 transition-all disabled:opacity-50"
            >
              {isExplaining ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Sparkles className="w-5 h-5 text-islamic-gold" />
              )}
              {isExplaining ? 'Generating Explanation...' : 'Explain with AI Knowledge'}
            </button>
          ) : (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-8 bg-slate-50 dark:bg-slate-800/50 p-8 rounded-[2rem] border border-slate-100 dark:border-slate-800"
            >
              <div className="flex items-center gap-2 text-islamic-gold font-bold text-xs uppercase tracking-widest">
                <Sparkles className="w-4 h-4" />
                AI Context & Explanation
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div>
                    <h4 className="text-slate-500 dark:text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-2">Meaning</h4>
                    <p className="text-sm text-slate-700 dark:text-slate-200 leading-relaxed font-serif">{explanation.generalMeaning}</p>
                  </div>
                  <div>
                    <h4 className="text-slate-500 dark:text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-2">Context</h4>
                    <p className="text-sm text-slate-700 dark:text-slate-200 leading-relaxed font-serif">{explanation.context}</p>
                  </div>
                </div>
                <div className="space-y-6">
                  <div>
                    <h4 className="text-slate-500 dark:text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-2">Lessons</h4>
                    <ul className="space-y-2">
                      {explanation.lessons.map((lesson, i) => (
                        <li key={i} className="flex gap-3 text-sm text-slate-700 dark:text-slate-200 font-serif">
                          <span className="w-5 h-5 rounded-full bg-islamic-gold/10 text-islamic-gold flex items-center justify-center text-[10px] font-bold shrink-0">{i+1}</span>
                          {lesson}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="text-slate-500 dark:text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-2">Application</h4>
                    <p className="text-sm text-slate-700 dark:text-slate-200 leading-relaxed font-serif">{explanation.lifeApplication}</p>
                  </div>
                </div>
              </div>

              <p className="text-[10px] text-slate-400 dark:text-slate-500 italic pt-4 border-t border-slate-200 dark:border-slate-700">
                {explanation.disclaimer}
              </p>
            </motion.div>
          )}

          {/* Cross-Book Comparison */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-islamic-green font-bold text-xs uppercase tracking-widest">
              <BookOpen className="w-4 h-4" />
              Cross-Book Comparison
            </div>
            
            {isLoadingSimilar ? (
              <div className="flex items-center gap-3 p-6 bg-slate-50 dark:bg-slate-800/30 rounded-2xl animate-pulse">
                <Loader2 className="w-4 h-4 animate-spin text-slate-400" />
                <span className="text-xs text-slate-400">Finding related narrations in other books...</span>
              </div>
            ) : similarHadiths && similarHadiths.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {similarHadiths.map((rh, idx) => (
                  <motion.div 
                    key={idx}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    onClick={() => onSelectSimilar(rh)}
                    className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm cursor-pointer hover:shadow-xl hover:shadow-islamic-green/5 hover:border-islamic-green/20 transition-all"
                  >
                    <div className="flex items-center justify-between mb-2">
                       <span className={`text-[10px] font-bold uppercase tracking-widest ${rh.type === 'hadith' ? 'text-islamic-green dark:text-emerald-500' : 'text-amber-500'}`}>
                        {rh.source}
                      </span>
                      <span className="reference-text !normal-case !tracking-normal !font-serif !font-normal">
                        {rh.reference}
                      </span>
                    </div>
                    <p className="translation-text line-clamp-2 mb-2 italic">"{rh.summary}"</p>
                    <div className="pt-2 border-t border-slate-50 dark:border-slate-800">
                      <p className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase mb-1">Key Insight</p>
                      <p className="text-[11px] text-islamic-green dark:text-emerald-500 font-bold leading-tight">{rh.mainPoint}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : null}
          </div>
        </div>
      </motion.div>
    </div>
  );
};
