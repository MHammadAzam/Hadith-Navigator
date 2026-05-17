import React from 'react';
import { motion } from 'motion/react';

export const SearchSkeleton: React.FC = () => {
  return (
    <div className="max-w-5xl mx-auto py-12 px-4 space-y-12">
      {/* Subtle Caption */}
      <div className="flex justify-center">
        <p className="text-[13px] font-medium text-slate-400 dark:text-slate-500 animate-pulse">
          Searching the Qur'an and authentic Hadith...
        </p>
      </div>

      {/* AI Guidance Placeholder */}
      <div className="bg-slate-100/50 dark:bg-slate-900/50 border border-slate-200/50 dark:border-white/5 rounded-[3rem] p-16 space-y-12 h-[400px] animate-pulse">
        <div className="flex flex-col items-center gap-6">
          <div className="w-16 h-16 bg-slate-200 dark:bg-slate-800 rounded-3xl" />
          <div className="w-48 h-8 bg-slate-200 dark:bg-slate-800 rounded-full" />
        </div>
        <div className="max-w-2xl mx-auto space-y-4">
          <div className="w-full h-6 bg-slate-200 dark:bg-slate-800 rounded-full" />
          <div className="w-3/4 h-6 bg-slate-200 dark:bg-slate-800 rounded-full mx-auto" />
        </div>
      </div>

      {/* Grid Placeholder */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {[1, 2, 3, 4].map((i) => (
          <div 
            key={i}
            className="bg-slate-100/30 dark:bg-slate-900/30 border border-slate-200/50 dark:border-white/5 rounded-[2rem] p-10 h-[350px] animate-pulse overflow-hidden relative"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent skew-x-12 translate-x-[-100%] animate-[shimmer_2s_infinite]" />
            <div className="space-y-8">
              <div className="flex justify-between">
                <div className="w-16 h-6 bg-slate-200 dark:bg-slate-800 rounded-lg" />
                <div className="w-8 h-8 bg-slate-200 dark:bg-slate-800 rounded-lg" />
              </div>
              <div className="space-y-4">
                <div className="w-full h-8 bg-slate-200 dark:bg-slate-800 rounded-lg" />
                <div className="w-5/6 h-8 bg-slate-200 dark:bg-slate-800 rounded-lg ml-auto" />
              </div>
              <div className="space-y-3 pt-4">
                <div className="w-full h-4 bg-slate-200 dark:bg-slate-800 rounded-full" />
                <div className="w-full h-4 bg-slate-200 dark:bg-slate-800 rounded-full" />
                <div className="w-2/3 h-4 bg-slate-200 dark:bg-slate-800 rounded-full" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
