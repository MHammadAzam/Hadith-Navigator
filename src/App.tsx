import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, 
  BookOpen, 
  Heart, 
  Compass, 
  Loader2, 
  Sparkles, 
  Scroll, 
  AlertCircle, 
  Bookmark, 
  BookmarkCheck, 
  Trash2, 
  X,
  Layers,
  Sun,
  Moon,
  ExternalLink,
  LogIn,
  LogOut,
  User as UserIcon
} from 'lucide-react';
import { getGuidance, type GuidanceResponse, type SearchFilters } from './services/hadithService';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { auth, db, signInWithGoogle } from './lib/firebase';
import { 
  onAuthStateChanged, 
  signOut, 
  User 
} from 'firebase/auth';
import { 
  collection, 
  query as firestoreQuery, 
  where, 
  onSnapshot,
  setDoc,
  deleteDoc,
  doc,
  updateDoc,
  serverTimestamp
} from 'firebase/firestore';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
    },
    operationType,
    path
  }
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  // We won't throw here to avoid crashing the whole logic, but we log it correctly.
  return errInfo;
}

interface SavedGuidance {
  id: string;
  arabic: string;
  english: string;
  urdu: string;
  source: string;
  type: 'Quran' | 'Hadith';
  timestamp: number;
  notes?: string;
  // Metadata for "opening" the bookmark
  explanation: GuidanceResponse['explanation'];
  lifeApplication: GuidanceResponse['lifeApplication'];
  reflection: GuidanceResponse['reflection'];
  actionSteps: string[];
}

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [query, setQuery] = useState('');
  const [language, setLanguage] = useState<'English' | 'Urdu'>('English');
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('theme');
      if (saved === 'dark' || saved === 'light') return saved;
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return 'light';
  });
  const [filters, setFilters] = useState<SearchFilters>({ authenticity: 'All' });
  const [showFilters, setShowFilters] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<GuidanceResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [bookmarks, setBookmarks] = useState<SavedGuidance[]>([]);
  const [showBookmarks, setShowBookmarks] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auth Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  // Load bookmarks on mount (Step 1: localStorage)
  useEffect(() => {
    const saved = localStorage.getItem('guidance_bookmarks_cache');
    if (saved) {
      try {
        setBookmarks(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse local bookmarks cache", e);
      }
    }
  }, []);

  // Load bookmarks from Firestore (Step 2: Backend Sync)
  useEffect(() => {
    if (!user) {
      // If logged out, maybe clear bookmarks if we only want authenticated ones?
      // Or keep local ones. Let's keep local ones as fallback.
      return;
    }

    const q = firestoreQuery(collection(db, 'bookmarks'), where('userId', '==', user.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          ...data,
          timestamp: typeof data.timestamp?.toMillis === 'function' ? data.timestamp.toMillis() : data.timestamp
        } as SavedGuidance;
      });
      // Sort by timestamp desc
      const sorted = docs.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
      setBookmarks(sorted);
      localStorage.setItem('guidance_bookmarks_cache', JSON.stringify(sorted));
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'bookmarks');
    });

    return () => unsubscribe();
  }, [user]);

  // Sync LOCAL bookmarks to cache (only if not logged in, to keep offline access)
  useEffect(() => {
    if (!user) {
      localStorage.setItem('guidance_bookmarks_cache', JSON.stringify(bookmarks));
    }
  }, [bookmarks, user]);

  // Handle Theme
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const generateId = (text: string) => {
    try {
      // Use hex representation to avoid btoa/non-latin1 issues
      let hash = 0;
      for (let i = 0; i < text.length; i++) {
        const char = text.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32bit integer
      }
      return Math.abs(hash).toString(16);
    } catch (e) {
      return Math.random().toString(36).slice(2);
    }
  };

  const toggleBookmark = async (
    source: { arabic: string; english: string; urdu: string; source: string; type: 'Quran' | 'Hadith' },
    context?: GuidanceResponse // Pass full context when saving
  ) => {
    const id = generateId(source.arabic + source.source);
    const exists = bookmarks.find(b => b.id === id);

    if (exists) {
      if (user) {
        try {
          await deleteDoc(doc(db, 'bookmarks', id));
        } catch (error) {
          handleFirestoreError(error, OperationType.DELETE, `bookmarks/${id}`);
        }
      } else {
        setBookmarks(bookmarks.filter(b => b.id !== id));
      }
    } else if (context) {
      const newBookmark: SavedGuidance = { 
        ...source, 
        id, 
        timestamp: Date.now(),
        explanation: context.explanation,
        lifeApplication: context.lifeApplication,
        reflection: context.reflection,
        actionSteps: context.actionSteps
      };

      if (user) {
        try {
          await setDoc(doc(db, 'bookmarks', id), {
            ...newBookmark,
            userId: user.uid,
            timestamp: serverTimestamp() // Use server timestamp for creation
          });
        } catch (error) {
          handleFirestoreError(error, OperationType.WRITE, `bookmarks/${id}`);
        }
      } else {
        setBookmarks([newBookmark, ...bookmarks]);
      }
    }
  };

  const openBookmark = (b: SavedGuidance) => {
    setResult({
      intent: 'Knowledge',
      relevantSources: [{
        type: b.type,
        arabic: b.arabic,
        english: b.english,
        urdu: b.urdu,
        source: b.source
      }],
      explanation: b.explanation,
      lifeApplication: b.lifeApplication,
      reflection: b.reflection,
      actionSteps: b.actionSteps
    });
    setShowBookmarks(false);
    setQuery(b.english.slice(0, 30) + "...");
    setTimeout(() => {
      scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const updateBookmarkNotes = async (id: string, notes: string) => {
    if (user) {
      try {
        await updateDoc(doc(db, 'bookmarks', id), { notes });
      } catch (error) {
        handleFirestoreError(error, OperationType.UPDATE, `bookmarks/${id}`);
      }
    } else {
      setBookmarks(bookmarks.map(b => b.id === id ? { ...b, notes } : b));
    }
  };

  const [authError, setAuthError] = useState<string | null>(null);

  const handleSignIn = async () => {
    try {
      setAuthError(null);
      await signInWithGoogle();
    } catch (error: any) {
      console.error("Sign in failed:", error);
      if (error.code === 'auth/popup-blocked') {
        setAuthError("Popup blocked. Please allow popups or try opening the app in a new tab.");
      } else if (error.code === 'auth/unauthorized-domain') {
        setAuthError("This domain is not authorized in Firebase Console. Please add your .run.app domain to 'Authorized Domains'.");
      } else {
        setAuthError("Sign-in failed. Ensure your domain is listed in Firebase Console > Authentication > Settings.");
      }
    }
  };

  const isBookmarked = (arabic: string, source: string) => {
    const id = generateId(arabic + source);
    return bookmarks.some(b => b.id === id);
  };

  const handleSearch = async (e?: React.FormEvent, customQuery?: string) => {
    if (e) e.preventDefault();
    const activeQuery = customQuery || query;
    // Removed strict trim empty check to allow "Daily Mode" (empty input)
    
    setLoading(true);
    setError(null);
    try {
      const data = await getGuidance(activeQuery, language, filters);
      if (data) {
        setResult(data);
        setTimeout(() => {
          scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      } else {
        setError("No relevant Guidance found for this query.");
      }
    } catch (err) {
      setError("An error occurred while seeking guidance. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pb-20 selection:bg-islamic-gold/30">
      {/* Decorative Border */}
      <div className="h-2 bg-gradient-to-r from-islamic-green via-islamic-gold to-islamic-green w-full" />

      {/* Hero Section */}
      <header className="max-w-4xl mx-auto px-6 pt-16 pb-12 text-center relative">
        <div className="absolute right-6 top-6 flex gap-3">
          {/* User Auth Info */}
          <div className="flex flex-col items-end gap-2">
            <div className="flex items-center gap-2">
              {user ? (
                <div className="flex items-center gap-3">
                  <div className="text-right hidden sm:block">
                    <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest leading-tight">Signed in as</p>
                    <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">{user.displayName || user.email}</p>
                  </div>
                  <button
                    onClick={() => signOut(auth)}
                    className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-full shadow-sm hover:shadow-md hover:border-red-500 text-slate-500 dark:text-slate-400 hover:text-red-500 transition-all relative group"
                  >
                    <LogOut className="w-6 h-6" />
                    <span className="absolute right-full mr-3 top-1/2 -translate-y-1/2 px-2 py-1 bg-slate-800 text-white text-[10px] rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                      Sign Out
                    </span>
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleSignIn}
                  className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-full shadow-sm hover:shadow-md hover:border-islamic-green text-slate-500 dark:text-slate-400 hover:text-islamic-green transition-all relative group"
                >
                  <LogIn className="w-6 h-6" />
                  <span className="absolute right-full mr-3 top-1/2 -translate-y-1/2 px-2 py-1 bg-slate-800 text-white text-[10px] rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                    Sign In with Google
                  </span>
                </button>
              )}
            </div>
            {authError && (
              <motion.p 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-[10px] text-red-500 font-medium bg-red-50 dark:bg-red-500/10 px-3 py-1 rounded-full border border-red-100 dark:border-red-500/20 max-w-[200px] text-right"
              >
                {authError}
              </motion.p>
            )}
          </div>

          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-full shadow-sm hover:shadow-md hover:border-islamic-gold text-slate-500 dark:text-slate-400 hover:text-islamic-gold transition-all relative group"
          >
            {theme === 'dark' ? <Sun className="w-6 h-6" /> : <Moon className="w-6 h-6" />}
            <span className="absolute top-full mt-3 left-1/2 -translate-x-1/2 px-2 py-1 bg-slate-800 text-white text-[10px] rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">
              {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
            </span>
          </button>

          <button
            onClick={() => setShowBookmarks(true)}
            className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-full shadow-sm hover:shadow-md hover:border-islamic-gold text-slate-500 dark:text-slate-400 hover:text-islamic-gold transition-all relative group"
          >
            <Layers className="w-6 h-6" />
            {bookmarks.length > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-islamic-gold text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white">
                {bookmarks.length}
              </span>
            )}
            <span className="absolute top-full mt-3 left-1/2 -translate-x-1/2 px-2 py-1 bg-slate-800 text-white text-[10px] rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">
              Saved Bookmarks
            </span>
          </button>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 mb-6 text-islamic-green font-medium tracking-widest uppercase text-xs"
        >
          <Sparkles className="w-4 h-4" />
          Guided by Authentic Knowledge
        </motion.div>
        
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="font-serif text-5xl md:text-6xl text-slate-900 dark:text-slate-100 mb-6"
        >
          Guidance <span className="text-islamic-green italic dark:text-islamic-gold">AI</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto mb-12 text-lg leading-relaxed"
        >
          Seeking wisdom from the Qur’an and authentic Hadith. Understanding life through spiritual guidance, reflection, and practical action.
        </motion.p>

        {/* Search Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="flex justify-center gap-4 mb-4"
        >
          {['English', 'Urdu'].map((lang) => (
            <button
              key={lang}
              onClick={() => setLanguage(lang as 'English' | 'Urdu')}
              className={cn(
                "px-4 py-1.5 rounded-full text-xs font-semibold tracking-wider uppercase transition-all border",
                language === lang 
                  ? "bg-islamic-green text-white border-islamic-green shadow-md shadow-islamic-green/20" 
                  : "bg-white dark:bg-slate-900 text-slate-400 dark:text-slate-500 border-slate-200 dark:border-slate-800 hover:border-islamic-gold hover:text-islamic-gold"
              )}
            >
              {lang}
            </button>
          ))}
        </motion.div>

        <motion.form
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          onSubmit={handleSearch}
          className="relative max-w-xl mx-auto space-y-4"
        >
          <div className="relative group">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="e.g., Hadith about smiling, kindness to parents..."
              className="w-full pl-14 pr-44 py-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl shadow-slate-200/50 dark:shadow-none focus:outline-none focus:ring-2 focus:ring-islamic-gold/30 focus:border-islamic-gold transition-all text-lg placeholder:text-slate-400 dark:text-slate-100"
            />
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-6 h-6 text-slate-400 group-focus-within:text-islamic-gold transition-colors" />
            
            <div className="absolute right-3 top-2 bottom-2 flex gap-2">
              <button
                type="button"
                onClick={() => setShowFilters(!showFilters)}
                className={cn(
                  "px-3 rounded-xl border transition-all flex items-center justify-center",
                  showFilters || Object.values(filters).filter(v => v && v !== 'All').length > 0
                    ? "bg-islamic-gold/10 border-islamic-gold text-islamic-gold"
                    : "bg-parchment dark:bg-slate-800 border-slate-100 dark:border-slate-700 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                )}
              >
                <Compass className="w-5 h-5" />
              </button>
              <button
                disabled={loading || !query.trim()}
                type="submit"
                className="px-6 bg-islamic-green text-white rounded-xl font-medium hover:bg-islamic-green/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Search"}
              </button>
            </div>
          </div>

          {/* Filters Panel */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-6 shadow-lg shadow-slate-200/20 dark:shadow-none grid grid-cols-3 gap-4 overflow-hidden"
              >
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block px-1">Narrator</label>
                  <input
                    type="text"
                    value={filters.narrator || ''}
                    onChange={(e) => setFilters(prev => ({ ...prev, narrator: e.target.value }))}
                    placeholder="e.g. Abu Hurairah"
                    className="w-full p-2.5 bg-parchment dark:bg-slate-800 rounded-xl text-sm border-none focus:ring-1 focus:ring-islamic-gold/30 placeholder:text-slate-300 dark:text-slate-100"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block px-1">Topic</label>
                  <input
                    type="text"
                    value={filters.topic || ''}
                    onChange={(e) => setFilters(prev => ({ ...prev, topic: e.target.value }))}
                    placeholder="e.g. Character"
                    className="w-full p-2.5 bg-parchment dark:bg-slate-800 rounded-xl text-sm border-none focus:ring-1 focus:ring-islamic-gold/30 placeholder:text-slate-300 dark:text-slate-100"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block px-1">Min Grade</label>
                  <select
                    value={filters.authenticity || 'All'}
                    onChange={(e) => setFilters(prev => ({ ...prev, authenticity: e.target.value as any }))}
                    className="w-full p-2.5 bg-parchment dark:bg-slate-800 rounded-xl text-sm border-none focus:ring-1 focus:ring-islamic-gold/30 text-slate-600 dark:text-slate-300 appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%23cbd5e1%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C/polyline%3E%3C/svg%3E')] dark:bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%2364748b%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C/polyline%3E%3C/svg%3E')] bg-[length:1.25rem] bg-no-repeat bg-[right_0.75rem_center]"
                  >
                    <option value="All">All Grades</option>
                    <option value="Sahih">Sahih (Authentic)</option>
                    <option value="Hasan">Hasan (Good)</option>
                  </select>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.form>
      </header>

      <main className="max-w-4xl mx-auto px-6">
        <AnimatePresence mode="wait">
          {error && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="p-4 bg-red-50 border border-red-100 rounded-xl flex items-center gap-3 text-red-600 mb-8"
            >
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <p>{error}</p>
            </motion.div>
          )}

          {result && (
            <motion.div
              key="result"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              ref={scrollRef}
              className="space-y-10"
            >
              {/* Relevant Quran / Hadith */}
              <div className="space-y-8">
                {result.relevantSources.map((source, idx) => {
                  const bookmarked = isBookmarked(source.arabic, source.source);
                  return (
                    <div key={idx} className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden group/card relative">
                      <button
                        onClick={() => toggleBookmark(source, result)}
                        className={cn(
                          "absolute right-6 top-6 p-3 rounded-full transition-all z-10",
                          bookmarked
                            ? "bg-islamic-gold text-white shadow-lg shadow-islamic-gold/20"
                            : "bg-parchment dark:bg-slate-800 text-slate-400 dark:text-slate-500 hover:text-islamic-gold opacity-0 group-hover/card:opacity-100"
                        )}
                      >
                        {bookmarked ? <BookmarkCheck className="w-5 h-5" /> : <Bookmark className="w-5 h-5" />}
                      </button>

                    <div className="p-8 md:p-12 space-y-8">
                      <div className="flex justify-center items-center gap-4">
                        <div className="h-px bg-islamic-gold/20 flex-1" />
                        <span className="text-[10px] font-bold text-islamic-gold uppercase tracking-[0.3em]">
                          {source.type}
                        </span>
                        <div className="h-px bg-islamic-gold/20 flex-1" />
                      </div>
                      
                      <div className="arabic-text text-3xl md:text-4xl text-center leading-relaxed text-slate-800 dark:text-slate-200 tracking-wide">
                        {source.arabic}
                      </div>

                      <div className="space-y-6">
                        <div className="space-y-4">
                          <p className="text-xl text-slate-700 dark:text-slate-300 leading-relaxed italic text-center font-serif px-4">
                            "{source.english}"
                          </p>
                          <p className="arabic-text text-xl text-slate-600 dark:text-slate-400 leading-[1.8] text-center px-4">
                            "{source.urdu}"
                          </p>
                        </div>
                        <div className="flex items-center justify-center gap-2 text-islamic-green font-medium text-sm">
                          <BookOpen className="w-4 h-4" />
                          <span>{source.source}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
              </div>

              {/* Explanation & Guidance */}
              <div className="grid md:grid-cols-2 gap-8">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                  className="bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 space-y-6"
                >
                  <div className="inline-flex items-center gap-2 text-islamic-green dark:text-islamic-gold font-semibold uppercase text-xs tracking-wider">
                    <Compass className="w-4 h-4" />
                    Simple Explanation
                  </div>
                  <div className="space-y-6">
                    <div>
                      <h4 className="text-slate-400 dark:text-slate-500 text-[10px] font-bold uppercase tracking-widest mb-2">Basic Meaning</h4>
                      <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                        {result.explanation.simple}
                      </p>
                    </div>
                    
                    <div>
                      <h4 className="text-slate-400 dark:text-slate-500 text-[10px] font-bold uppercase tracking-widest mb-2">Modern Understanding</h4>
                      <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                        {result.explanation.modern}
                      </p>
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                  className="bg-islamic-green p-8 rounded-3xl shadow-lg shadow-islamic-green/10 text-white space-y-6"
                >
                  <div className="inline-flex items-center gap-2 text-islamic-gold font-semibold uppercase text-xs tracking-wider">
                    <Heart className="w-4 h-4" />
                    Life Application
                  </div>
                  <div className="space-y-6">
                    <div>
                      <h4 className="text-islamic-gold text-[10px] font-bold uppercase tracking-widest mb-2">Actionable Teaching</h4>
                      <p className="text-white/90 text-sm leading-relaxed">{result.lifeApplication.actions}</p>
                    </div>
                    <div>
                      <h4 className="text-islamic-gold text-[10px] font-bold uppercase tracking-widest mb-2">Habits to Build</h4>
                      <p className="text-white/90 text-sm leading-relaxed">{result.lifeApplication.habits}</p>
                    </div>
                    <div>
                      <h4 className="text-islamic-gold text-[10px] font-bold uppercase tracking-widest mb-2">Guidance</h4>
                      <p className="text-white/90 text-sm leading-relaxed">{result.lifeApplication.guidance}</p>
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* Reflection & Action Steps */}
              <div className="grid md:grid-cols-3 gap-8">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="md:col-span-2 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm border border-islamic-gold/20 p-8 rounded-3xl space-y-6"
                >
                  <div className="inline-flex items-center gap-2 text-islamic-gold font-semibold uppercase text-[10px] tracking-widest">
                    <Sparkles className="w-4 h-4" />
                    Reflection Section
                  </div>
                  <div className="space-y-4">
                    <p className="text-xl font-serif text-slate-800 dark:text-slate-200 leading-relaxed italic">
                      "{result.reflection.thought}"
                    </p>
                    <div className="h-px w-12 bg-islamic-gold/30" />
                    <p className="text-lg text-islamic-green dark:text-islamic-gold font-medium">
                      {result.reflection.question}
                    </p>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-8 rounded-3xl space-y-6"
                >
                  <div className="inline-flex items-center gap-2 text-islamic-green uppercase text-[10px] font-bold tracking-widest">
                    <BookmarkCheck className="w-4 h-4" />
                    Action Steps
                  </div>
                  <ul className="space-y-4">
                    {result.actionSteps.map((step, i) => (
                      <li key={i} className="flex gap-3 text-sm text-slate-600 dark:text-slate-400">
                        <span className="w-6 h-6 rounded-full bg-islamic-gold/10 text-islamic-gold flex items-center justify-center text-[10px] font-bold shrink-0">
                          {i + 1}
                        </span>
                        {step}
                      </li>
                    ))}
                  </ul>
                </motion.div>
              </div>

              {/* Related References removed as it's now covered by multiple relevantSources */}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Empty State / Suggestions */}
        {!result && !loading && !error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-12 text-center"
          >
            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-6">Quick Suggestions</p>
            <div className="flex flex-wrap justify-center gap-3">
              {["Patience & Prayer", "Honesty in Business", "Rights of Neighbors", "Mercy to All", "Small Good Deeds"].map((s) => (
                <button
                  key={s}
                  onClick={() => { setQuery(s); handleSearch(undefined, s); }}
                  className="px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 rounded-lg text-sm hover:border-islamic-gold hover:text-islamic-green transition-all"
                >
                  {s}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </main>

      {/* Bookmarks Overlay */}
      <AnimatePresence>
        {showBookmarks && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowBookmarks(false)}
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100]"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 bottom-0 w-full max-w-lg bg-parchment dark:bg-slate-950 z-[101] shadow-2xl flex flex-col"
            >
              <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-white dark:bg-slate-900">
                <div className="flex items-center gap-3 text-islamic-green dark:text-islamic-gold">
                  <Layers className="w-6 h-6" />
                  <h2 className="font-serif text-2xl">Saved Bookmarks</h2>
                </div>
                <button
                  onClick={() => setShowBookmarks(false)}
                  className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
                >
                  <X className="w-6 h-6 text-slate-400" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {bookmarks.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-64 text-slate-400 dark:text-slate-600 space-y-4">
                    <Bookmark className="w-12 h-12 opacity-20" />
                    <p className="font-medium text-sm">No saved guidance bookmarks yet</p>
                  </div>
                ) : (
                  bookmarks.map((b, idx) => (
                    <motion.div
                      layout
                      key={b.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-islamic-gold/20 transition-all duration-300 relative group overflow-hidden mb-4"
                    >
                      <div className={cn(
                        "absolute top-0 left-0 right-0 h-1",
                        b.type === 'Quran' ? "bg-islamic-green" : "bg-islamic-gold"
                      )} />
                      <button
                        onClick={() => toggleBookmark(b)}
                        className="absolute right-4 top-4 p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-all opacity-0 group-hover:opacity-100 z-10"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      
                      <div className="p-6 space-y-4">
                        <button
                          onClick={() => openBookmark(b)}
                          className="w-full text-left space-y-4 group/text"
                        >
                          <div className="flex items-center justify-between">
                            <span className={cn(
                              "text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-widest",
                              b.type === 'Quran' ? "bg-islamic-green/10 text-islamic-green" : "bg-islamic-gold/10 text-islamic-gold"
                            )}>
                              {b.type}
                            </span>
                            <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover/text:text-islamic-green transition-colors" />
                          </div>

                          <div className="arabic-text text-2xl text-right text-slate-800 dark:text-slate-200 leading-relaxed line-clamp-3 group-hover/text:text-islamic-gold transition-colors duration-300">
                            {b.arabic}
                          </div>
                          <div className="text-slate-600 dark:text-slate-400 text-sm italic font-serif leading-relaxed line-clamp-2 pl-3 border-l-2 border-slate-100 dark:border-slate-800">
                            "{b.english}"
                          </div>
                        </button>
                        
                        <div className="flex items-center justify-between pt-2">
                          <div className="flex items-center gap-2 text-islamic-green dark:text-islamic-gold text-[10px] font-bold uppercase tracking-wider bg-slate-50 dark:bg-slate-800/50 px-3 py-1 rounded-full">
                            <BookOpen className="w-3 h-3" />
                            {b.source}
                          </div>
                        </div>

                        <div className="pt-4 border-t border-slate-50 dark:border-slate-800 space-y-2">
                          <div className="flex items-center gap-2 text-slate-400 dark:text-slate-500 text-[10px] uppercase font-bold tracking-widest px-1">
                            <Sparkles className="w-3 h-3 text-islamic-gold" />
                            Reflection
                          </div>
                          <textarea
                            value={b.notes || ''}
                            onChange={(e) => updateBookmarkNotes(b.id, e.target.value)}
                            placeholder="Add your thoughts..."
                            className="w-full min-h-[80px] p-4 rounded-xl bg-slate-50/50 dark:bg-slate-100/30 text-slate-600 dark:text-slate-800 text-sm border-none focus:ring-1 focus:ring-islamic-gold/20 resize-none font-sans leading-relaxed"
                          />
                        </div>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
              
              <div className="p-6 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-center">
                <p className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                  {user ? "Synced with your account" : "Saved locally on your device"}
                </p>
                {!user && (
                    <button 
                      onClick={() => signInWithGoogle()}
                      className="mt-2 text-[10px] text-islamic-green font-bold uppercase tracking-widest hover:underline"
                    >
                      Sign in to sync across devices
                    </button>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Background Decor */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden opacity-30">
        <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] bg-islamic-gold/10 rounded-full blur-[120px]" />
        <div className="absolute -bottom-[20%] -right-[10%] w-[50%] h-[50%] bg-islamic-green/10 rounded-full blur-[120px]" />
      </div>
    </div>
  );
}
