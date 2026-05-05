import React from 'react';
import { motion } from 'motion/react';
import { Frown, Meh, Smile, Activity, Sparkles, HeartPulse, CloudRain, Sun } from 'lucide-react';

interface MoodSelectorProps {
  onMoodSelect: (mood: string) => void;
}

const MOODS = [
  { id: 'sad', label: 'Sad', icon: Frown, color: 'text-blue-500', bg: 'bg-blue-500/10', query: 'mercy and comfort during sadness' },
  { id: 'stressed', label: 'Stressed', icon: Activity, color: 'text-orange-500', bg: 'bg-orange-500/10', query: 'patience and ease in stress' },
  { id: 'anxious', label: 'Anxious', icon: CloudRain, color: 'text-slate-500', bg: 'bg-slate-500/10', query: 'tranquility (sakina) for the heart' },
  { id: 'happy', label: 'Happy', icon: Sun, color: 'text-amber-500', bg: 'bg-amber-500/10', query: 'gratitude and shukr' },
  { id: 'weak', label: 'Weak', icon: HeartPulse, color: 'text-red-500', bg: 'bg-red-500/10', query: 'strength and persistence' }
];

export const MoodSelector: React.FC<MoodSelectorProps> = ({ onMoodSelect }) => {
  return (
    <div className="w-full max-w-4xl mx-auto px-4 mb-16">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-islamic-gold" />
          <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">How is your heart today?</h3>
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {MOODS.map((mood, idx) => (
          <motion.button
            key={mood.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            onClick={() => onMoodSelect(mood.query)}
            className={`flex flex-col items-center gap-4 p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 hover:border-islamic-green transition-all group shadow-sm hover:shadow-xl hover:-translate-y-1`}
          >
            <div className={`w-14 h-14 rounded-2xl ${mood.bg} ${mood.color} flex items-center justify-center group-hover:scale-110 transition-transform`}>
              <mood.icon className="w-8 h-8" />
            </div>
            <span className="font-bold text-slate-700 dark:text-slate-300 text-sm">{mood.label}</span>
          </motion.button>
        ))}
      </div>
    </div>
  );
};
