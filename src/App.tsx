import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  onAuthStateChanged, 
  User 
} from 'firebase/auth';
import { 
  collection, 
  onSnapshot,
  setDoc,
  deleteDoc,
  doc,
  query,
  where,
  orderBy
} from 'firebase/firestore';
import { GoogleGenAI, Type } from "@google/genai";
import { auth, db } from './lib/firebase';
import { 
  AppView, 
  AppState, 
  HadithBook, 
  HadithChapter, 
  Hadith, 
  QuranVerse,
  AIExplanation, 
  SavedItem,
  SimilarItem,
  SearchItem 
} from './types';
import { SIHAH_E_SITTA, MOCK_HADITHS, MOCK_CHAPTERS, MOCK_VERSES } from './constants';
import { Scroll, Sparkles, Book, ScrollText } from 'lucide-react';

// Components
import { Header } from './components/Header';
import { SearchHero } from './components/SearchHero';
import { SearchResults } from './components/SearchResults';
import { BookGrid } from './components/BookGrid';
import { ChapterList } from './components/ChapterList';
import { HadithList } from './components/HadithList';
import { HadithDetail } from './components/HadithDetail';
import { VerseDetail } from './components/VerseDetail';
import { BookmarkList } from './components/BookmarkList';
import { SettingsOverlay } from './components/SettingsOverlay';
import { MoodSelector } from './components/MoodSelector';

// Constants
import { DAILY_VERSES } from './data/dailyVerses';
import { DailyAyahCard } from './components/DailyAyahCard';

const THEME_STORAGE_KEY = 'hadith_app_theme';
const SETTINGS_STORAGE_KEY = 'hadith_app_settings';
const DAILY_REFLECTION_STORAGE_PREFIX = 'daily_reflection_';
const STREAK_STORAGE_KEY = 'hadith_app_streak';
const LAST_ACTIVE_DATE_KEY = 'hadith_app_last_active';

export default function App() {
  const ai = useMemo(() => new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY }), []);
  
  const [state, setState] = useState<AppState>({
    view: 'home',
    user: null,
    theme: (localStorage.getItem(THEME_STORAGE_KEY) as 'light' | 'dark') || 'light',
    language: 'English',
    fontSize: 16
  });

  const [bookmarks, setBookmarks] = useState<SavedItem[]>([]);
  const [streak, setStreak] = useState<number>(() => {
    return parseInt(localStorage.getItem(STREAK_STORAGE_KEY) || '0', 10);
  });
  const [showBookmarks, setShowBookmarks] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [isExplaining, setIsExplaining] = useState(false);
  const [currentExplanation, setCurrentExplanation] = useState<AIExplanation | undefined>();
  const [isLoadingSimilar, setIsLoadingSimilar] = useState(false);
  const [similarItems, setSimilarItems] = useState<SimilarItem[]>([]);
  const [isLoadingSearch, setIsLoadingSearch] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchItem[]>([]);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [dailyReflection, setDailyReflection] = useState<string | undefined>();

  // Item of the Day - Stable based on date string
  const ayahOfTheDay = useMemo(() => {
    const today = new Date();
    // Use year-month-day as a seed to ensure same verse all day
    const dateString = `${today.getFullYear()}-${today.getMonth()}-${today.getDate()}`;
    let hash = 0;
    for (let i = 0; i < dateString.length; i++) {
        hash = (hash << 5) - hash + dateString.charCodeAt(i);
        hash |= 0;
    }
    const index = Math.abs(hash) % DAILY_VERSES.length;
    return DAILY_VERSES[index];
  }, []);

  // Streak Logic
  useEffect(() => {
    const today = new Date();
    const todayDateStr = `${today.getFullYear()}-${today.getMonth()}-${today.getDate()}`;
    const lastActiveDate = localStorage.getItem(LAST_ACTIVE_DATE_KEY);

    if (lastActiveDate === todayDateStr) return;

    if (lastActiveDate) {
      const lastDate = new Date(lastActiveDate);
      const diffTime = Math.abs(today.getTime() - lastDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        setStreak(prev => {
          const newStreak = prev + 1;
          localStorage.setItem(STREAK_STORAGE_KEY, newStreak.toString());
          return newStreak;
        });
      } else if (diffDays > 1) {
        setStreak(1);
        localStorage.setItem(STREAK_STORAGE_KEY, '1');
      }
    } else {
      setStreak(1);
      localStorage.setItem(STREAK_STORAGE_KEY, '1');
    }

    localStorage.setItem(LAST_ACTIVE_DATE_KEY, todayDateStr);
  }, []);

  // AI Reflection for Daily Ayah
  useEffect(() => {
    const fetchDailyReflection = async () => {
      const today = new Date();
      const dateKey = `${today.getFullYear()}-${today.getMonth()}-${today.getDate()}`;
      const savedReflection = localStorage.getItem(`${DAILY_REFLECTION_STORAGE_PREFIX}${dateKey}`);
      
      if (savedReflection) {
        setDailyReflection(savedReflection);
        return;
      }

      try {
        const prompt = `
          Provide a brief, beautiful, and inspiring 2-sentence reflection on this Qur'an verse. 
          Focus on hope, strength, and practical spiritual motivation:
          "${ayahOfTheDay.englishTranslation}"
          Reference: ${ayahOfTheDay.reference}
          
          Do not use complex terminology. Just the reflection.
        `;

        const response = await ai.models.generateContent({
          model: "gemini-1.5-flash",
          contents: prompt
        });
        
        const reflection = response.text.trim();
        setDailyReflection(reflection);
        localStorage.setItem(`${DAILY_REFLECTION_STORAGE_PREFIX}${dateKey}`, reflection);
      } catch (err) {
        console.error("Failed to fetch daily reflection:", err);
      }
    };

    fetchDailyReflection();
  }, [ayahOfTheDay, ai]);

  // Guidance of the Day (Original)
  const itemOfTheDay = useMemo(() => {
    const combined = [...MOCK_HADITHS, ...MOCK_VERSES];
    const day = new Date().getDate();
    return combined[day % combined.length];
  }, []);

  // Auth Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setState(prev => ({ ...prev, user }));
    });
    return () => unsubscribe();
  }, []);

  // Theme Sync
  useEffect(() => {
    if (state.theme === 'dark') {
      document.documentElement.classList.add('dark');
      document.documentElement.style.colorScheme = 'dark';
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.style.colorScheme = 'light';
    }
    localStorage.setItem(THEME_STORAGE_KEY, state.theme);
  }, [state.theme]);

  // Bookmarks Logic
  useEffect(() => {
    if (!state.user) {
      setBookmarks([]);
      return;
    }

    const q = query(
      collection(db, 'users', state.user.uid, 'bookmarks'),
      orderBy('savedAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => doc.data() as SavedItem);
      setBookmarks(docs);
    });

    return () => unsubscribe();
  }, [state.user]);

  const toggleBookmark = async (item: Hadith | QuranVerse, type: 'hadith' | 'verse') => {
    if (!state.user) {
      alert("Please sign in to save bookmarks.");
      return;
    }

    const bookmarkId = item.id;
    const isBookmarked = bookmarks.some(b => b.id === bookmarkId);

    try {
      const bookmarkRef = doc(db, 'users', state.user.uid, 'bookmarks', bookmarkId);
      if (isBookmarked) {
        await deleteDoc(bookmarkRef);
      } else {
        const newBookmark: SavedItem = {
          id: item.id,
          type,
          data: item,
          savedAt: Date.now(),
        };
        await setDoc(bookmarkRef, newBookmark);
      }
    } catch (error) {
      console.error("Bookmark sync error:", error);
    }
  };

  const handleExplain = async (item: Hadith | QuranVerse) => {
    setIsExplaining(true);
    const isHadith = 'hadithNumber' in item;
    try {
      const prompt = `Explain simply and inspiringly: "${item.englishTranslation}" (Ref: ${item.reference}). Provide context, lessons, and life application.`;

      const response = await ai.models.generateContent({
        model: "gemini-1.5-flash",
        contents: prompt,
        config: { 
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              generalMeaning: { type: Type.STRING },
              context: { type: Type.STRING },
              lessons: { type: Type.ARRAY, items: { type: Type.STRING } },
              lifeApplication: { type: Type.STRING },
              disclaimer: { type: Type.STRING }
            },
            required: ["generalMeaning", "context", "lessons", "lifeApplication", "disclaimer"]
          }
        }
      });
      
      const explanation = JSON.parse(response.text);
      setCurrentExplanation(explanation);
    } catch (error) {
      console.error("AI Explanation failed:", error);
    } finally {
      setIsExplaining(false);
    }
  };

  const fetchSimilarItems = async (item: Hadith | QuranVerse) => {
    setIsLoadingSimilar(true);
    setSimilarItems([]);
    try {
      const prompt = `Find 1-2 similar Qur'an Verses or Hadiths for: "${item.englishTranslation}". Focus on the core theme.`;

      const response = await ai.models.generateContent({
        model: "gemini-1.5-flash",
        contents: prompt,
        config: { 
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                type: { type: Type.STRING },
                source: { type: Type.STRING },
                reference: { type: Type.STRING },
                summary: { type: Type.STRING },
                mainPoint: { type: Type.STRING },
                arabic: { type: Type.STRING },
                english: { type: Type.STRING },
                urdu: { type: Type.STRING },
                id: { type: Type.STRING }
              },
              required: ["type", "source", "reference", "arabic", "english", "urdu", "id"]
            }
          }
        }
      });
      
      const data = JSON.parse(response.text);
      setSimilarItems(data);
    } catch (error) {
      console.error("Similar items fetch failed:", error);
    } finally {
      setIsLoadingSimilar(false);
    }
  };

  const handleSearch = async (queryStr: string) => {
    setSearchQuery(queryStr);
    navigateTo('searchResult');
    setIsLoadingSearch(true);
    setSearchError(null);
    try {
      if (!process.env.GEMINI_API_KEY) {
        throw new Error("Gemini API key is missing. Please check your environment variables.");
      }
      const prompt = `Search Qur'an & Sahih Hadiths for: "${queryStr}". Provide 3-5 relevant results (never empty). If the query is an emotion, map it to a positive Islamic concept (e.g., sad -> hope).`;

      const response = await ai.models.generateContent({
        model: "gemini-1.5-flash",
        contents: prompt,
        config: { 
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                type: { type: Type.STRING },
                id: { type: Type.STRING },
                reference: { type: Type.STRING },
                arabic: { type: Type.STRING },
                english: { type: Type.STRING },
                urdu: { type: Type.STRING },
                bookName: { type: Type.STRING },
                bookId: { type: Type.STRING },
                surahName: { type: Type.STRING },
                surahNumber: { type: Type.NUMBER },
                ayahNumber: { type: Type.NUMBER },
                hadithNumber: { type: Type.STRING },
                relevanceScore: { type: Type.NUMBER },
                isRelated: { type: Type.BOOLEAN }
              },
              required: ["type", "id", "reference", "arabic", "english", "urdu"]
            }
          }
        }
      });
      
      const results = JSON.parse(response.text);
      setSearchResults(results || []);
    } catch (error) {
      console.error("Search failed:", error);
      setSearchError(error instanceof Error ? error.message : "Search failed. Please try again later.");
    } finally {
      setIsLoadingSearch(false);
    }
  };

  const handleSelectSimilarItem = (item: SimilarItem) => {
    if (item.type === 'verse') {
      navigateTo('verseDetail', {
        selectedVerse: {
          id: item.id || `sim-v-${Date.now()}`,
          surahNumber: 0,
          ayahNumber: 0,
          surahName: item.source.replace('Surah ', ''),
          surahNameArabic: '',
          arabicText: item.arabic || '',
          englishTranslation: item.english || '',
          urduTranslation: item.urdu || '',
          reference: item.reference,
          tags: []
        }
      });
    } else {
      navigateTo('hadithDetail', {
        selectedHadith: {
          id: item.id || `sim-h-${Date.now()}`,
          bookId: item.source.toLowerCase().includes('bukhari') ? 'bukhari' : 'muslim',
          chapterId: 'similar',
          hadithNumber: item.reference.split(' ').pop() || '1',
          arabicText: item.arabic || '',
          englishTranslation: item.english || '',
          urduTranslation: item.urdu || '',
          reference: item.reference,
          tags: [],
          authenticity: 'Sahih'
        }
      });
    }
  };

  const navigateTo = (view: AppView, payload?: any) => {
    setState(prev => ({
      ...prev,
      view,
      ...payload
    }));
    // Reset view specific state
    if (view === 'hadithDetail') {
      setCurrentExplanation(undefined);
      if (payload?.selectedHadith) {
        fetchSimilarItems(payload.selectedHadith);
      }
    }
    if (view === 'verseDetail') {
      setCurrentExplanation(undefined);
      if (payload?.selectedVerse) {
        fetchSimilarItems(payload.selectedVerse);
      }
    }
  };

  const handleSelectSearchResult = (item: SearchItem) => {
    if (item.type === 'verse') {
      navigateTo('verseDetail', {
        selectedVerse: {
          id: item.id,
          surahNumber: item.surahNumber || 1,
          ayahNumber: item.ayahNumber || 1,
          surahName: item.surahName || '',
          surahNameArabic: '',
          arabicText: item.arabic,
          englishTranslation: item.english,
          urduTranslation: item.urdu,
          reference: item.reference,
          tags: []
        }
      });
    } else {
      navigateTo('hadithDetail', {
        selectedHadith: {
          id: item.id,
          bookId: item.bookId || 'bukhari',
          chapterId: 'search',
          hadithNumber: item.hadithNumber || '1',
          arabicText: item.arabic,
          englishTranslation: item.english,
          urduTranslation: item.urdu,
          reference: item.reference,
          tags: [],
          authenticity: 'Sahih'
        }
      });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans transition-colors duration-300">
      <Header 
        user={state.user}
        theme={state.theme}
        toggleTheme={() => setState(prev => ({ ...prev, theme: prev.theme === 'light' ? 'dark' : 'light' }))}
        onOpenSettings={() => setShowSettings(true)}
        onOpenBookmarks={() => setShowBookmarks(true)}
        onSearch={handleSearch}
        onHome={() => navigateTo('home')}
        streak={streak}
      />

      <main className="pb-20">
        <AnimatePresence mode="wait">
          {state.view === 'home' && (
            <motion.section 
              key="home"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="max-w-7xl mx-auto"
            >
              <SearchHero onSearch={handleSearch} />

              <div className="px-4 -mt-10 mb-20 space-y-24">
                <div className="px-0">
                  <DailyAyahCard 
                    verse={ayahOfTheDay}
                    reflection={dailyReflection}
                    isBookmarked={bookmarks.some(b => b.id === ayahOfTheDay.id)}
                    onToggleBookmark={() => toggleBookmark(ayahOfTheDay, 'verse')}
                    onViewDetail={() => navigateTo('verseDetail', { selectedVerse: ayahOfTheDay })}
                  />
                </div>

                <MoodSelector onMoodSelect={handleSearch} />
              </div>
            </motion.section>
          )}

          {state.view === 'searchResult' && (
            <motion.section
              key="searchResult"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <SearchResults 
                query={searchQuery}
                results={searchResults}
                isLoading={isLoadingSearch}
                onSelectResult={handleSelectSearchResult}
                onBack={() => navigateTo('home')}
                onSearch={handleSearch}
                error={searchError}
              />
            </motion.section>
          )}

          {state.view === 'book' && state.selectedBook && (
            <motion.section
              key="book"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <ChapterList 
                book={state.selectedBook}
                chapters={MOCK_CHAPTERS.filter(c => c.bookId === state.selectedBook?.id)}
                onSelectChapter={(chapter) => navigateTo('hadithList', { selectedChapter: chapter })}
                onBack={() => navigateTo('home')}
              />
            </motion.section>
          )}

          {state.view === 'hadithList' && state.selectedBook && state.selectedChapter && (
             <motion.section
              key="hadithList"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <HadithList 
                book={state.selectedBook}
                chapter={state.selectedChapter}
                hadiths={MOCK_HADITHS.filter(h => h.bookId === state.selectedBook?.id && h.chapterId === state.selectedChapter?.id)}
                isBookmarked={(id) => bookmarks.some(b => b.id === id)}
                onToggleBookmark={(h) => toggleBookmark(h, 'hadith')}
                onSelectHadith={(hadith) => navigateTo('hadithDetail', { selectedHadith: hadith })}
                onBack={() => navigateTo('book')}
              />
            </motion.section>
          )}

          {state.view === 'hadithDetail' && state.selectedHadith && (
            <motion.section
              key="hadithDetail"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              <HadithDetail 
                hadith={state.selectedHadith}
                isBookmarked={bookmarks.some(b => b.id === state.selectedHadith?.id)}
                onToggleBookmark={() => toggleBookmark(state.selectedHadith!, 'hadith')}
                explanation={currentExplanation}
                isExplaining={isExplaining}
                onExplain={() => handleExplain(state.selectedHadith!)}
                similarHadiths={similarItems}
                isLoadingSimilar={isLoadingSimilar}
                onSelectSimilar={handleSelectSimilarItem}
                onBack={() => navigateTo('home')}
              />
            </motion.section>
          )}

          {state.view === 'verseDetail' && state.selectedVerse && (
            <motion.section
              key="verseDetail"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              <VerseDetail 
                verse={state.selectedVerse}
                isBookmarked={bookmarks.some(b => b.id === state.selectedVerse?.id)}
                onToggleBookmark={() => toggleBookmark(state.selectedVerse!, 'verse')}
                explanation={currentExplanation}
                isExplaining={isExplaining}
                onExplain={() => handleExplain(state.selectedVerse!)}
                similarItems={similarItems}
                isLoadingSimilar={isLoadingSimilar}
                onSelectItem={handleSelectSimilarItem}
                onBack={() => navigateTo('home')}
              />
            </motion.section>
          )}
        </AnimatePresence>
      </main>

      {/* Overlays */}
      <AnimatePresence>
        {showBookmarks && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowBookmarks(false)}
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[60]" 
            />
            <motion.aside 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 bottom-0 w-full max-w-lg z-[70] shadow-2xl"
            >
              <BookmarkList 
                bookmarks={bookmarks as any}
                onSelectBookmark={(b: any) => { 
                  if (b.type === 'verse') navigateTo('verseDetail', { selectedVerse: b.data });
                  else navigateTo('hadithDetail', { selectedHadith: b.data }); 
                  setShowBookmarks(false); 
                }}
                onRemoveBookmark={(id) => {
                  const b = bookmarks.find(b => b.id === id);
                  if (b) toggleBookmark(b.data, b.type);
                }}
                onClose={() => setShowBookmarks(false)}
              />
            </motion.aside>
          </>
        )}

        {showSettings && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowSettings(false)}
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[60]" 
            />
            <motion.aside 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 bottom-0 w-full max-w-lg z-[70] shadow-2xl"
            >
              <SettingsOverlay 
                onClose={() => setShowSettings(false)}
                language={state.language}
                setLanguage={(lang) => setState(prev => ({ ...prev, language: lang }))}
                theme={state.theme}
                setTheme={(theme) => setState(prev => ({ ...prev, theme }))}
                fontSize={state.fontSize}
                setFontSize={(fontSize) => setState(prev => ({ ...prev, fontSize }))}
              />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Background Decorative Element */}
      <div className="fixed bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-islamic-green/5 to-transparent pointer-events-none -z-10" />
    </div>
  );
}
