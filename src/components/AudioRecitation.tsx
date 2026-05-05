import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Loader2, Volume2, VolumeX } from 'lucide-react';

interface AudioRecitationProps {
  surahNumber: number;
  ayahNumber: number;
  className?: string;
}

export const AudioRecitation: React.FC<AudioRecitationProps> = ({ surahNumber, ayahNumber, className = "" }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Reset state when verse changes
    setIsPlaying(false);
    setAudioUrl(null);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
  }, [surahNumber, ayahNumber]);

  const fetchAudio = async () => {
    setIsLoading(true);
    try {
      // Using Al Quran API (Mishary Rashid Alafasy recitation)
      const res = await fetch(`https://api.alquran.cloud/v1/ayah/${surahNumber}:${ayahNumber}/ar.alafasy`);
      const data = await res.json();
      if (data.code === 200) {
        setAudioUrl(data.data.audio);
        return data.data.audio;
      }
    } catch (error) {
      console.error("Failed to fetch recitation:", error);
    } finally {
      setIsLoading(false);
    }
    return null;
  };

  const handlePlay = async () => {
    if (isPlaying) {
      audioRef.current?.pause();
      setIsPlaying(false);
      return;
    }

    let url = audioUrl;
    if (!url) {
      url = await fetchAudio();
    }

    if (url) {
      if (!audioRef.current) {
        audioRef.current = new Audio(url);
        audioRef.current.onended = () => setIsPlaying(false);
      }
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  return (
    <button
      onClick={handlePlay}
      disabled={isLoading}
      className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${
        isPlaying 
          ? 'bg-islamic-green text-white shadow-lg shadow-islamic-green/20' 
          : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-100 dark:border-slate-800 hover:border-islamic-green'
      } ${className}`}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : isPlaying ? (
        <Pause className="w-4 h-4 fill-current" />
      ) : (
        <Play className="w-4 h-4 fill-current" />
      )}
      <span className="text-xs font-bold uppercase tracking-widest">{isPlaying ? 'Playing' : 'Listen'}</span>
    </button>
  );
};
