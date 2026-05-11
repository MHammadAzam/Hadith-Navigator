import { User } from 'firebase/auth';

export interface HadithBook {
  id: string;
  name: string;
  nameUrdu: string;
  nameArabic: string;
  description: string;
  hadithCount: number;
  chapterCount: number;
  author: string;
  color: string;
  icon: string;
}

export interface HadithChapter {
  id: string;
  bookId: string;
  number: number;
  name: string;
  nameArabic: string;
  nameUrdu: string;
  hadithRange: string;
}

export interface Hadith {
  id: string;
  bookId: string;
  chapterId: string;
  hadithNumber: string;
  arabicText: string;
  englishTranslation: string;
  urduTranslation: string;
  reference: string;
  tags: string[];
  authenticity: 'Sahih' | 'Hasan' | 'Da\'if' | 'Maudu';
}

export interface QuranVerse {
  id: string;
  surahNumber: number;
  ayahNumber: number;
  surahName: string;
  surahNameArabic: string;
  arabicText: string;
  englishTranslation: string;
  urduTranslation: string;
  reference: string;
  tags: string[];
}

export interface AIExplanation {
  empathy: string;
  narrative: string;
  reflection: string;
  disclaimer: string;
}

export interface SavedItem {
  id: string;
  type: 'hadith' | 'verse';
  data: Hadith | QuranVerse;
  savedAt: number;
  notes?: string;
  explanation?: AIExplanation;
}

export interface GuidanceResponse {
  reflectionTitle: string;
  aiSummary: string;
  suggestedThemes: string[];
  followUpQuestions: string[];
  quranReference: {
    text: string;
    translation: string;
    reference: string;
  };
  hadithReference: {
    text: string;
    translation: string;
    reference: string;
  };
}

export type AppView = 'home' | 'book' | 'hadithList' | 'hadithDetail' | 'verseDetail' | 'bookmarks' | 'settings' | 'searchResult';

export interface SimilarItem {
  type: 'hadith' | 'verse';
  id: string;
  source: string;
  reference: string;
  summary: string;
  mainPoint: string;
  arabic?: string;
  english?: string;
  urdu?: string;
}

export interface SearchItem {
  type: 'hadith' | 'verse';
  id: string;
  bookId?: string;
  bookName?: string;
  surahName?: string;
  surahNumber?: number;
  ayahNumber?: number;
  chapterName?: string;
  hadithNumber?: string;
  arabic: string;
  english: string;
  urdu: string;
  reference: string;
}

export interface AppState {
  view: AppView;
  selectedBook?: HadithBook;
  selectedChapter?: HadithChapter;
  selectedHadith?: Hadith;
  selectedVerse?: QuranVerse;
  user: User | null;
  theme: 'light' | 'dark';
  language: 'English' | 'Urdu' | 'Arabic';
  fontSize: number;
}
