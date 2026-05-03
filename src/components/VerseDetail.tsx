import React from 'react';
import { motion } from 'motion/react';
import { 
  ArrowLeft, 
  Bookmark, 
  Share2, 
  MessageSquare,
  BookOpen,
  Copy,
  Check,
  Sparkles,
  Loader2,
  ChevronRight,
  Book
} from 'lucide-react';
import { QuranVerse, AIExplanation, SimilarItem } from '../types';
import { AudioPlayButton } from './AudioPlayButton';

interface VerseDetailProps {
  verse: QuranVerse;
  isBookmarked: boolean;
  onToggleBookmark: () => void;
  explanation?: AIExplanation;
  isExplaining: boolean;
  onExplain: () => void;
  similarItems: SimilarItem[];
  isLoadingSimilar: boolean;
  onSelectItem: (item: SimilarItem) => void;
  onBack: () => void;
}

export const VerseDetail: React.FC<VerseDetailProps> = ({
  verse,
  isBookmarked,
  onToggleBookmark,
  explanation,
  isExplaining,
  onExplain,
  similarItems,
  isLoadingSimilar,
  onSelectItem,
  onBack
}) => {
  const [copied, setCopied] = React.useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(`${verse.arabicText}\n\n${verse.englishTranslation}\n\nReference: ${verse.reference}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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
            onClick={copyToClipboard}
            className="p-3 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors text-slate-500 relative"
          >
            {copied ? <Check className="w-6 h-6 text-emerald-500" /> : <Copy className="w-6 h-6" />}
          </button>
          <button 
            onClick={onToggleBookmark}
            className={`p-3 rounded-full transition-colors ${isBookmarked ? 'text-islamic-green bg-islamic-green/10' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
          >
            <Bookmark className={`w-6 h-6 ${isBookmarked ? 'fill-islamic-green' : ''}`} />
          </button>
          <button className="p-3 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors text-slate-500">
            <Share2 className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Verse Content */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-slate-900 rounded-[3rem] p-10 md:p-16 border border-slate-100 dark:border-slate-800 shadow-2xl shadow-islamic-green/5 relative overflow-hidden"
      >
         <div className="absolute top-0 right-0 p-12 opacity-[0.03] pointer-events-none">
          <Book className="w-64 h-64" />
        </div>

        <div className="flex flex-col items-center mb-16 relative z-10">
          <div className="w-16 h-16 rounded-3xl bg-amber-100 dark:bg-amber-900/30 text-amber-600 flex items-center justify-center mb-6">
            <BookOpen className="w-8 h-8" />
          </div>
          <span className="text-sm font-bold text-slate-400 uppercase tracking-[0.4em] mb-3">Surah {verse.surahName}</span>
          <h1 className="font-serif text-3xl font-bold dark:text-white">{verse.surahNameArabic}</h1>
          <div className="mt-4 px-4 py-1.5 bg-slate-50 dark:bg-slate-800 rounded-full text-xs font-bold text-slate-400">
            Ayah {verse.ayahNumber}
          </div>
        </div>

        <div className="space-y-16 relative z-10">
          <div className="flex justify-end mb-4">
            <AudioPlayButton text={verse.arabicText} lang="ar" />
          </div>
          <p className="arabic-text mb-12">
            {verse.arabicText}
          </p>

          <div className="grid md:grid-cols-2 gap-12 pt-12 border-t border-slate-50 dark:border-slate-800">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">English Translation</span>
                <AudioPlayButton text={verse.englishTranslation} lang="en" />
              </div>
              <p className="translation-text">
                "{verse.englishTranslation}"
              </p>
            </div>
            <div className="space-y-4 md:border-l md:border-slate-50 md:dark:border-slate-800 md:pl-12">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Urdu Translation</span>
                <AudioPlayButton text={verse.urduTranslation} lang="ur" />
              </div>
              <p className="urdu-text">
                {verse.urduTranslation}
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* AI Section */}
      <div className="mt-12 grid grid-cols-1 gap-8">
        {/* Explanation Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 overflow-hidden shadow-lg"
        >
          <div className="p-8 md:p-12">
            <div className="flex items-center justify-between mb-10">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-islamic-green/10 text-islamic-green rounded-2xl flex items-center justify-center">
                  <Sparkles className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold dark:text-white">AI Scholar Insights</h3>
                  <p className="text-xs text-slate-400 font-medium">Educational context & practical lessons</p>
                </div>
              </div>
              {!explanation && !isExplaining && (
                <button 
                  onClick={onExplain}
                  className="px-6 py-3 bg-islamic-green text-white rounded-2xl font-bold text-sm hover:bg-emerald-700 transition-all shadow-lg shadow-islamic-green/20"
                >
                  Generate Insights
                </button>
              )}
            </div>

            {isExplaining ? (
              <div className="flex flex-col items-center justify-center py-12 gap-4">
                <Loader2 className="w-10 h-10 animate-spin text-islamic-green" />
                <p className="text-slate-400 text-sm font-medium">Synthesizing classical commentaries...</p>
              </div>
            ) : explanation ? (
              <div className="space-y-12">
                <div className="grid md:grid-cols-2 gap-10">
                  <div className="space-y-4">
                    <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-2">
                       General Meaning
                    </h4>
                    <p className="text-slate-600 dark:text-slate-400 leading-relaxed font-serif text-lg">
                      {explanation.generalMeaning}
                    </p>
                  </div>
                  <div className="space-y-4">
                    <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-2">
                       Context
                    </h4>
                    <p className="text-slate-600 dark:text-slate-400 leading-relaxed font-serif text-lg">
                      {explanation.context}
                    </p>
                  </div>
                </div>

                <div className="space-y-6">
                  <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">Key Practical Lessons</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {explanation.lessons.map((lesson, idx) => (
                      <div key={idx} className="flex gap-4 p-5 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                        <span className="flex-shrink-0 w-8 h-8 rounded-full bg-islamic-green text-white text-xs font-bold flex items-center justify-center">
                          {idx + 1}
                        </span>
                        <p className="text-slate-600 dark:text-slate-400 text-sm font-medium leading-relaxed">{lesson}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-8 bg-emerald-50 dark:bg-emerald-950/30 rounded-3xl border border-emerald-100 dark:border-emerald-900/30">
                  <h4 className="text-sm font-bold text-emerald-800 dark:text-emerald-200 uppercase tracking-wider mb-4 flex items-center gap-2">
                    <BookOpen className="w-4 h-4" />
                    Life Application
                  </h4>
                  <p className="text-emerald-700 dark:text-emerald-300 leading-relaxed font-serif text-lg">
                    {explanation.lifeApplication}
                  </p>
                </div>

                <p className="text-[10px] text-slate-400 italic text-center border-t border-slate-50 dark:border-slate-800 pt-6">
                  {explanation.disclaimer}
                </p>
              </div>
            ) : (
              <div className="flex flex-col items-center py-8 text-center">
                <MessageSquare className="w-12 h-12 text-slate-200 mb-4" />
                <p className="text-slate-400 text-sm max-w-sm">Tap the button above to get a simplified explanation of this verse with practical takeaways.</p>
              </div>
            )}
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
            <h3 className="text-lg font-bold dark:text-white">Related Guidance</h3>
            {isLoadingSimilar && <Loader2 className="w-5 h-5 animate-spin text-islamic-green" />}
          </div>

          <div className="space-y-4">
            {similarItems.length > 0 ? (
              similarItems.map((item, idx) => (
                <div 
                  key={idx}
                  onClick={() => onSelectItem(item)}
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
                    <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-islamic-green dark:group-hover:text-emerald-500 transition-colors" />
                  </div>
                </div>
              ))
            ) : !isLoadingSimilar && (
              <p className="text-slate-400 text-center py-8 text-sm italic">Searching for thematically related verses and hadiths...</p>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};
