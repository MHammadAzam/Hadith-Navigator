import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX, Loader2 } from 'lucide-react';

interface AudioPlayButtonProps {
  text: string;
  lang: 'ar' | 'en' | 'ur';
  className?: string;
}

export const AudioPlayButton: React.FC<AudioPlayButtonProps> = ({ text, lang, className = "" }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isSupported, setIsSupported] = useState(true);

  useEffect(() => {
    if (!('speechSynthesis' in window)) {
      setIsSupported(false);
    }
  }, []);

  const stopAudio = () => {
    window.speechSynthesis.cancel();
    setIsPlaying(false);
  };

  const playAudio = () => {
    if (!isSupported) return;

    // Stop any current speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    
    // Attempt to find a suitable voice
    const voices = window.speechSynthesis.getVoices();
    let voice = null;

    if (lang === 'ar') {
      utterance.lang = 'ar-SA';
      voice = voices.find(v => v.lang.startsWith('ar'));
    } else if (lang === 'en') {
      utterance.lang = 'en-US';
      voice = voices.find(v => v.lang.startsWith('en'));
    } else if (lang === 'ur') {
      utterance.lang = 'ur-PK';
      voice = voices.find(v => v.lang.startsWith('ur'));
    }

    if (voice) {
      utterance.voice = voice;
    }

    utterance.onstart = () => setIsPlaying(true);
    utterance.onend = () => setIsPlaying(false);
    utterance.onerror = () => setIsPlaying(false);

    window.speechSynthesis.speak(utterance);
  };

  if (!isSupported) return null;

  return (
    <button
      onClick={isPlaying ? stopAudio : playAudio}
      className={`p-2 rounded-full transition-all flex items-center justify-center ${
        isPlaying 
          ? 'bg-islamic-green text-white shadow-lg shadow-islamic-green/20' 
          : 'bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-islamic-green hover:bg-islamic-green/10'
      } ${className}`}
      title={isPlaying ? "Stop Audio" : "Play Audio"}
    >
      {isPlaying ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
    </button>
  );
};
