import { Hadith, HadithBook, HadithChapter, QuranVerse } from './types';

export const SIHAH_E_SITTA: HadithBook[] = [
  {
    id: 'bukhari',
    name: 'Sahih al-Bukhari',
    nameUrdu: 'صحیح البخاری',
    nameArabic: 'صحيح البخاري',
    description: 'The most authentic collection of Hadith.',
    hadithCount: 7563,
    chapterCount: 97,
    author: 'Imam al-Bukhari',
    color: '#059669', // Emerald
    icon: 'Scroll'
  },
  {
    id: 'muslim',
    name: 'Sahih Muslim',
    nameUrdu: 'صحیح مسلم',
    nameArabic: 'صحيح مسلم',
    description: 'One of the Sahihayn, highly authentic.',
    hadithCount: 7500,
    chapterCount: 57,
    author: 'Imam Muslim',
    color: '#0d9488', // Teal
    icon: 'BookOpen'
  },
  {
    id: 'abu-dawood',
    name: 'Sunan Abi Dawood',
    nameUrdu: 'سنن أبي داود',
    nameArabic: 'سنن أبي داود',
    description: 'Focuses primarily on legal rulings.',
    hadithCount: 5274,
    chapterCount: 43,
    author: 'Imam Abu Dawood',
    color: '#b45309', // Amber
    icon: 'Compass'
  },
  {
    id: 'tirmidhi',
    name: 'Jami` at-Tirmidhi',
    nameUrdu: 'جامع الترمذی',
    nameArabic: 'جامع الترمذي',
    description: 'Noted for its classification of hadiths.',
    hadithCount: 3956,
    chapterCount: 49,
    author: 'Imam at-Tirmidhi',
    color: '#be123c', // Rose
    icon: 'Heart'
  },
  {
    id: 'nasai',
    name: 'Sunan an-Nasa\'i',
    nameUrdu: 'سنن النسائی',
    nameArabic: 'سنن النسائي',
    description: 'Renowned for its rigorous legal analysis.',
    hadithCount: 5758,
    chapterCount: 52,
    author: 'Imam an-Nasa\'i',
    color: '#4338ca', // Indigo
    icon: 'Sparkles'
  },
  {
    id: 'ibn-majah',
    name: 'Sunan Ibn Majah',
    nameUrdu: 'سنن ابن ماجه',
    nameArabic: 'سنن ابن ماجه',
    description: 'The sixth book of the Sihah al-Sittah.',
    hadithCount: 4341,
    chapterCount: 37,
    author: 'Imam Ibn Majah',
    color: '#7e22ce', // Purple
    icon: 'Layers'
  }
];

export const RECOMMENDED_QUERIES = [
  "how to be a better Muslim",
  "feeling unmotivated",
  "dealing with loss",
  "finding inner peace",
  "patience during trials"
];

export const MOCK_VERSES: QuranVerse[] = [
  {
    id: 'verse-2-153',
    surahNumber: 2,
    ayahNumber: 153,
    surahName: 'Al-Baqarah',
    surahNameArabic: 'البقرة',
    arabicText: 'يَا أَيُّهَا الَّذِينَ آمَنُوا اسْتَعِينُوا بِالصَّبْرِ وَالصَّلاةِ إِنَّ اللَّهَ مَعَ الصَّابِرِينَ',
    englishTranslation: 'O you who have believed, seek help through patience and prayer. Indeed, Allah is with the patient.',
    urduTranslation: 'اے ایمان والو! صبر اور نماز کے ذریعے مدد چاہو، بے شک اللہ صبر کرنے والوں کے ساتھ ہے۔',
    reference: 'Quran 2:153',
    tags: ['patience', 'prayer', 'help']
  },
  {
    id: 'verse-3-134',
    surahNumber: 3,
    ayahNumber: 134,
    surahName: 'Aali-Imran',
    surahNameArabic: 'آل عمران',
    arabicText: 'الَّذِينَ يُنفِقُونَ فِي السَّرَّاء وَالضَّرَّاء وَالْكَاظِمِينَ الْغَيْظَ وَالْعَافِينَ عَنِ النَّاسِ وَاللَّهُ يُحِبُّ الْمُحْسِنِينَ',
    englishTranslation: 'Who spend [in the cause of Allah] during ease and hardship and who restrain anger and who pardon the people - and Allah loves the doers of good.',
    urduTranslation: 'جو لوگ خوش حالی اور تنگ دستی میں (اللہ کی راہ میں) خرچ کرتے ہیں اور غصہ پینے والے اور لوگوں سے درگزر کرنے والے ہیں، اور اللہ نیکی کرنے والوں سے محبت کرتا ہے۔',
    reference: 'Quran 3:134',
    tags: ['charity', 'patience', 'forgiveness', 'anger']
  }
];

export const MOCK_CHAPTERS: HadithChapter[] = [
  // Bukhari
  { id: 'b-1', bookId: 'bukhari', number: 1, name: 'The Book of Revelation', nameArabic: 'كتاب بدء الوحي', nameUrdu: 'وحی کا بیان', hadithRange: '1-7' },
  { id: 'b-2', bookId: 'bukhari', number: 2, name: 'The Book of Belief', nameArabic: 'كتاب الإيمان', nameUrdu: 'ایمان کا بیان', hadithRange: '8-58' },
  // Muslim
  { id: 'm-1', bookId: 'muslim', number: 1, name: 'The Book of Faith', nameArabic: 'كتاب الإيمان', nameUrdu: 'ایمان کا بیان', hadithRange: '1-300' },
  // Abu Dawood
  { id: 'ad-1', bookId: 'abu-dawood', number: 1, name: 'The Book of Purification', nameArabic: 'كتاب الطهارة', nameUrdu: 'طہارت کا بیان', hadithRange: '1-390' },
  // Tirmidhi
  { id: 't-1', bookId: 'tirmidhi', number: 1, name: 'The Book of Purification', nameArabic: 'كتاب الطهارة', nameUrdu: 'طہارت کا بیان', hadithRange: '1-148' },
  // Nasai
  { id: 'n-1', bookId: 'nasai', number: 1, name: 'The Book of Purification', nameArabic: 'كتاب الطهارة', nameUrdu: 'طہارت کا بیان', hadithRange: '1-324' },
  // Ibn Majah
  { id: 'im-1', bookId: 'ibn-majah', number: 1, name: 'The Book of Purification', nameArabic: 'كتاب الطهارة', nameUrdu: 'طہارت کا بیان', hadithRange: '1-420' },
];

export const MOCK_HADITHS: Hadith[] = [
  {
    id: 'bukhari-1',
    bookId: 'bukhari',
    chapterId: 'b-1',
    hadithNumber: '1',
    arabicText: 'إِنَّمَا الأَعْمَالُ بِالنِّيَّاتِ، وَإِنَّمَا لِكُلِّ امْرِئٍ مَا نَوَى',
    englishTranslation: 'The reward of deeds depends upon the intentions and every person will get the reward according to what he has intended.',
    urduTranslation: 'اعمال کا دارومدار نیتوں پر ہے اور ہر شخص کو وہی ملے گا جس کی اس نے نیت کی۔',
    reference: 'Sahih al-Bukhari 1',
    tags: ['intention', 'sincerity', 'deeds'],
    authenticity: 'Sahih'
  },
  {
    id: 'bukhari-13',
    bookId: 'bukhari',
    chapterId: 'b-2',
    hadithNumber: '13',
    arabicText: 'لاَ يُؤْمِنُ أَحَدُكُمْ حَتَّى يُحِبَّ لأَخِيهِ مَا يُحِبُّ لِنَفْسِهِ',
    englishTranslation: 'None of you will have faith till he wishes for his (Muslim) brother what he likes for himself.',
    urduTranslation: 'تم میں سے کوئی شخص اس وقت تک مومن نہیں ہو سکتا جب تک وہ اپنے بھائی کے لیے وہی پسند نہ کرے جو اپنے لیے پسند کرتا ہے۔',
    reference: 'Sahih al-Bukhari 13',
    tags: ['faith', 'brotherhood', 'love'],
    authenticity: 'Sahih'
  },
  {
    id: 'muslim-1',
    bookId: 'muslim',
    chapterId: 'm-1',
    hadithNumber: '1',
    arabicText: 'الإِيمَانُ أَنْ تُؤْمِنَ بِاللَّهِ وَمَلاَئِكَتِهِ وَكُتُبِهِ وَرُسُلِهِ وَالْيَوْمِ الآخِرِ وَتُؤْمِنَ بِالْقَدَرِ خَيْرِهِ وَشَرِّهِ',
    englishTranslation: 'Faith is that you believe in Allah, His angels, His books, His messengers, and in the Last Day, and you believe in the decree, its good and its evil.',
    urduTranslation: 'ایمان یہ ہے کہ تم اللہ، اس کے فرشتوں، اس کی کتابوں، اس کے رسولوں اور قیامت کے دن پر ایمان لاؤ اور تقدیر اس کی خیر اور شر پر ایمان لاؤ۔',
    reference: 'Sahih Muslim 1',
    tags: ['faith', 'pillar', 'belief'],
    authenticity: 'Sahih'
  },
  {
    id: 'abu-dawood-1',
    bookId: 'abu-dawood',
    chapterId: 'ad-1',
    hadithNumber: '1',
    arabicText: 'إِذَا دَخَلَ أَحَدُكُمُ الْخَلاَءَ فَلْيَقُلِ اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ الْخُبُثِ وَالْخَبَائِثِ',
    englishTranslation: 'When one of you enters the privy, he should say: O Allah, I seek refuge in Thee from the male and female devils.',
    urduTranslation: 'جب تم میں سے کوئی بیت الخلا جائے تو اسے چاہیے کہ کہے: اے اللہ! میں تیری پناہ مانگتا ہوں خبیثوں اور خبیثنیوں سے۔',
    reference: 'Sunan Abi Dawood 1',
    tags: ['purification', 'dua', 'toilet'],
    authenticity: 'Sahih'
  }
];
