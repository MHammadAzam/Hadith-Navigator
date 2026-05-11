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
  orderBy
} from 'firebase/firestore';
import { GoogleGenAI, Type } from "@google/genai";
import { auth, db } from './lib/firebase';
import { 
  AppView, 
  AppState, 
  Hadith, 
  QuranVerse,
  AIExplanation, 
  SavedItem,
  SimilarItem,
  SearchItem
} from './types';
import { MOCK_HADITHS, MOCK_VERSES } from './constants';
import { Search, Clock, Trash2, Sparkles, BookOpen } from 'lucide-react';

// Components
import { Header } from './components/Header';
import { SearchResults } from './components/SearchResults';
import { HadithDetail } from './components/HadithDetail';
import { VerseDetail } from './components/VerseDetail';
import { BookmarkList } from './components/BookmarkList';
import { SettingsOverlay } from './components/SettingsOverlay';
import { DailyAyahCard } from './components/DailyAyahCard';

// Constants
import { MOCK_HADITHS, MOCK_VERSES } from './constants';
import { DAILY_VERSES } from './data/dailyVerses';
import { getGuidance } from './services/hadithService';
import { GuidanceResponse } from './types';

const THEME_STORAGE_KEY = 'hadith_app_theme';
const STREAK_STORAGE_KEY = 'hadith_app_streak';
const LAST_ACTIVE_DATE_KEY = 'hadith_app_last_active';
const DAILY_REFLECTION_STORAGE_PREFIX = 'daily_reflection_';
const SEARCH_HISTORY_KEY = 'hadith_app_search_history';

const RECOMMENDED_QUERIES = [
  "How to be a better Muslim?",
  "Feeling unmotivated",
  "Dealing with loss",
  "Finding inner peace",
  "Patience during trials"
];

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
  const [isLoadingSearch, setIsLoadingSearch] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchItem[]>([]);
  const [searchGuidance, setSearchGuidance] = useState<GuidanceResponse | null>(null);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [isLoadingSimilar, setIsLoadingSimilar] = useState(false);
  const [similarItems, setSimilarItems] = useState<SimilarItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchHistory, setSearchHistory] = useState<string[]>(() => {
    return JSON.parse(localStorage.getItem(SEARCH_HISTORY_KEY) || '[]');
  });
  const [dailyReflection, setDailyReflection] = useState<string | undefined>();
  const explanationCache = useRef<Record<string, AIExplanation>>({});
  const similarItemsCache = useRef<Record<string, SimilarItem[]>>({});

  // Search History Logic
  const addToHistory = (query: string) => {
    if (!query.trim()) return;
    setSearchHistory(prev => {
      const filtered = prev.filter(q => q !== query);
      const updated = [query, ...filtered].slice(0, 10);
      localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(updated));
      return updated;
    });
  };

  const clearHistory = () => {
    setSearchHistory([]);
    localStorage.removeItem(SEARCH_HISTORY_KEY);
  };

  // Item of the Day - Stable based on date string
  const ayahOfTheDay = useMemo(() => {
    const today = new Date();
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
        `;

        const response = await ai.models.generateContent({
          model: "gemini-3-flash-preview",
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
    const cacheKey = item.id;
    if (explanationCache.current[cacheKey]) {
      setCurrentExplanation(explanationCache.current[cacheKey]);
      return;
    }

    setIsExplaining(true);
    try {
      const prompt = `Explain heart-to-heart: "${item.englishTranslation}" (Ref: ${item.reference}). 
      Follow the persona: empathetic, simple, and supportive.
      Structure:
      - Empathy: 1-2 lines acknowledging the spirit of the message.
      - Narrative: A smooth explanation combining context, meaning, and life lessons.
      - Reflection: A soft ending message.`;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: { 
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              empathy: { type: Type.STRING },
              narrative: { type: Type.STRING },
              reflection: { type: Type.STRING },
              disclaimer: { type: Type.STRING }
            },
            required: ["empathy", "narrative", "reflection", "disclaimer"]
          }
        }
      });
      
      const explanation = JSON.parse(response.text);
      setCurrentExplanation(explanation);
      explanationCache.current[cacheKey] = explanation;
    } catch (error) {
      console.error("AI Explanation failed:", error);
    } finally {
      setIsExplaining(false);
    }
  };

  const handleSearch = async (queryStr: string) => {
    if (!queryStr.trim()) return;
    setSearchQuery(queryStr);
    addToHistory(queryStr);
    setSearchGuidance(null);
    navigateTo('searchResult');
    
    setIsLoadingSearch(true);
    setSearchError(null);
    try {
      if (!process.env.GEMINI_API_KEY) {
        throw new Error("Gemini API key is missing.");
      }

      // Get AI guidance
      const guidance = await getGuidance(queryStr, state.language);
      setSearchGuidance(guidance);

      const prompt = `Search the Qur'an and Sahih Hadith collections for: "${queryStr}". 
      Return exactly 5 relevant entries as a JSON array. 
      IMPORTANT: Try to include BOTH Qur'an verses and authentic Hadiths if relevant to the topic.
      For each entry:
      - type: must be either 'verse' or 'hadith' (lowercase)
      - id: a unique string ID
      - reference: full source reference (e.g., "Surah Al-Baqarah 2:153" or "Sahih Bukhari 123")
      - arabic: the original Arabic text
      - english: English translation
      - urdu: Urdu translation
      - bookName/bookId: for hadiths (e.g. "Sahih Bukhari", "bukhari")
      - surahName/surahNumber/ayahNumber: for verses
      - hadithNumber: for hadiths`;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
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
                relevanceScore: { type: Type.NUMBER }
              },
              required: ["type", "id", "reference", "arabic", "english", "urdu"]
            }
          }
        }
      });
      
      const results: SearchItem[] = JSON.parse(response.text).map((item: any) => ({
        ...item,
        type: item.type?.toLowerCase() === 'verse' ? 'verse' : 'hadith'
      }));
      setSearchResults(results || []);
    } catch (error) {
      setSearchError(error instanceof Error ? error.message : "Search failed.");
    } finally {
      setIsLoadingSearch(false);
    }
  };

  const fetchSimilarItems = async (item: Hadith | QuranVerse) => {
    const cacheKey = item.id;
    if (similarItemsCache.current[cacheKey]) {
      setSimilarItems(similarItemsCache.current[cacheKey]);
      return;
    }

    setIsLoadingSimilar(true);
    setSimilarItems([]);
    try {
      const prompt = `Find 1-2 similar Qur'an Verses or Hadiths for: "${item.englishTranslation}". Focus on the core theme.`;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
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
      similarItemsCache.current[cacheKey] = data;
    } catch (error) {
      console.error("Similar items fetch failed:", error);
    } finally {
      setIsLoadingSimilar(false);
    }
  };

  const navigateTo = (view: AppView, payload?: any) => {
    setState(prev => ({
      ...prev,
      view,
      ...payload
    }));
    if (view === 'hadithDetail' || view === 'verseDetail') {
      setCurrentExplanation(undefined);
      if (payload?.selectedHadith) fetchSimilarItems(payload.selectedHadith);
      if (payload?.selectedVerse) fetchSimilarItems(payload.selectedVerse);
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

      <main className="pb-20" style={{ '--content-font-size': `${state.fontSize}px` } as React.CSSProperties}>
        <AnimatePresence mode="wait">
          {state.view === 'home' && (
            <motion.section 
              key="home"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="max-w-7xl mx-auto px-4"
            >
              <div className="pt-32 pb-4 flex flex-col items-center justify-center text-center px-4">
                <motion.div 
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                  className="space-y-[8px] mb-[16px]"
                >
                  <h2 className="text-[32px] md:text-[40px] font-bold text-slate-900 dark:text-white tracking-tight font-serif italic">
                    Islamic <span className="text-islamic-green not-italic">Guidance</span>
                  </h2>
                  <p className="text-slate-500 dark:text-slate-400 max-w-[80%] mx-auto text-sm md:text-base font-medium leading-relaxed opacity-70">
                    Find answers from the Qur'an and authentic Hadith
                  </p>
                </motion.div>
                
                <motion.div 
                  initial={{ opacity: 0, y: 20, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ delay: 0.2, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                  className="w-full max-w-2xl space-y-6"
                >
                  <div className="relative group mx-auto w-[92%] md:w-full">
                    <div className="absolute -inset-1 bg-gradient-to-r from-islamic-green/10 via-islamic-gold/5 to-islamic-green/10 rounded-2xl blur-md opacity-0 group-focus-within:opacity-100 transition duration-700"></div>
                    <input 
                      type="text"
                      placeholder="Ask for guidance... e.g. feeling unmotivated, finding peace"
                      className="relative w-full h-14 pl-14 pr-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 transition-all text-[16px] shadow-premium outline-none text-slate-800 dark:text-white focus:ring-[8px] focus:ring-islamic-green/5 focus:border-islamic-green/30 placeholder:text-slate-300"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleSearch((e.target as HTMLInputElement).value);
                        }
                      }}
                    />
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-islamic-green transition-colors" />
                    <div className="absolute right-5 top-1/2 -translate-y-1/2 flex items-center gap-2">
                       <Sparkles className="w-4 h-4 text-islamic-gold opacity-30 pointer-events-none animate-pulse" />
                    </div>
                  </div>

                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 }}
                    className="flex flex-col items-center gap-4"
                  >
                    <div className="flex flex-wrap items-center justify-center gap-2">
                       {(searchHistory.length > 0 ? searchHistory.slice(0, 3) : RECOMMENDED_QUERIES.slice(0, 3)).map((h, i) => (
                         <motion.button 
                          key={i}
                          whileHover={{ y: -2, backgroundColor: 'rgba(16, 185, 129, 0.05)' }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleSearch(h)}
                          className="px-5 py-2 bg-white dark:bg-slate-900 text-slate-400 rounded-full text-[11px] font-bold uppercase tracking-wider transition-all border border-slate-100 dark:border-white/5 shadow-sm"
                         >
                           {h}
                         </motion.button>
                       ))}
                    </div>
                    {searchHistory.length === 0 && (
                      <div className="flex flex-wrap items-center justify-center gap-2 opacity-60">
                         {RECOMMENDED_QUERIES.slice(3, 5).map((h, i) => (
                           <motion.button 
                            key={i}
                            whileHover={{ y: -2, backgroundColor: 'rgba(16, 185, 129, 0.05)' }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleSearch(h)}
                            className="px-5 py-2 bg-white/50 dark:bg-slate-900/50 text-slate-400 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all border border-slate-100 dark:border-white/5 shadow-sm"
                           >
                             {h}
                           </motion.button>
                         ))}
                      </div>
                    )}
                  </motion.div>
                </motion.div>
              </div>

              <div className="max-w-5xl mx-auto pb-40">
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="flex items-center gap-6 mb-12 px-6"
                >
                  <div className="h-px flex-1 bg-gradient-to-r from-transparent via-slate-200 dark:via-white/10 to-transparent" />
                  <div className="flex flex-col items-center">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.8em]">Heavenly Insight</span>
                    <Sparkles className="w-3 h-3 text-islamic-gold mt-2 opacity-30" />
                  </div>
                  <div className="h-px flex-1 bg-gradient-to-r from-transparent via-slate-200 dark:via-white/10 to-transparent" />
                </motion.div>
                <div className="px-4">
                  <DailyAyahCard 
                    verse={ayahOfTheDay}
                    reflection={dailyReflection}
                    isBookmarked={bookmarks.some(b => b.id === ayahOfTheDay.id)}
                    onToggleBookmark={() => toggleBookmark(ayahOfTheDay, 'verse')}
                    onViewDetail={() => navigateTo('verseDetail', { selectedVerse: ayahOfTheDay })}
                  />
                </div>
              </div>
            </motion.section>
          )}

          {state.view === 'searchResult' && (
            <motion.section
              key="searchResult"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="w-full pt-24"
            >
              <SearchResults 
                query={searchQuery}
                results={searchResults}
                guidance={searchGuidance}
                isLoading={isLoadingSearch}
                onSelectResult={handleSelectSearchResult}
                onBack={() => navigateTo('home')}
                onSearch={handleSearch}
                error={searchError}
              />
            </motion.section>
          )}

          {state.view === 'hadithDetail' && state.selectedHadith && (
            <motion.section
              key="hadithDetail"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full pt-24"
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
              className="w-full pt-24"
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
              className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-[60]" 
            />
            <motion.aside 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              className="fixed right-0 top-0 bottom-0 w-full max-w-md z-[70] bg-white dark:bg-slate-900 shadow-2xl"
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
              className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-[60]" 
            />
            <motion.aside 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              className="fixed right-0 top-0 bottom-0 w-full max-w-md z-[70] bg-white dark:bg-slate-900 shadow-2xl"
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
      <div className="fixed bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-slate-500/5 to-transparent pointer-events-none -z-10" />
    </div>
  );
}
