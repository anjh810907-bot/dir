import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  orderBy, 
  deleteDoc, 
  doc, 
  updateDoc, 
  serverTimestamp,
  Timestamp 
} from 'firebase/firestore';

export interface AIResponseData {
  comfortLetter: string;
  tomorrowAction: string;
  comfortQuote: string;
  warmTip: string;
}

export type EmotionType = '기쁨' | '지침' | '설렘' | '불안';

export interface DiaryEntry {
  id: string;
  date: string; // YYYY-MM-DD
  emotion: EmotionType;
  title: string;
  content: string;
  weather?: string;
  aiResponse?: AIResponseData;
  createdAt?: string; // ISO string for local or display
  isFavorite?: boolean;
}

// User-provided Firebase config
export const firebaseConfig = {
  apiKey: "AIzaSyCT5ECt02lbl79ZT49F76MSFb4I7t5riaU",
  authDomain: "visit-f9c27.firebaseapp.com",
  projectId: "visit-f9c27",
  storageBucket: "visit-f9c27.firebasestorage.app",
  messagingSenderId: "426295991307",
  appId: "1:426295991307:web:3617571e73d5fef15afb0e"
};

// Initialize Firebase App
export const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const db = getFirestore(app);

const COLLECTION_NAME = 'warm_diaries';
const LOCAL_STORAGE_KEY = 'warm_diaries_storage';

// Helper: load local cached diaries
export function getLocalDiaries(): DiaryEntry[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (err) {
    console.warn('Failed to parse local diaries:', err);
  }
  return [];
}

// Helper: save local cached diaries
export function saveLocalDiaries(diaries: DiaryEntry[]) {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(diaries));
  } catch (err) {
    console.warn('Failed to save to localStorage:', err);
  }
}

// Save a diary entry to Firestore with local storage backup
export async function saveDiaryToDb(entry: Omit<DiaryEntry, 'id'> & { id?: string }): Promise<DiaryEntry> {
  const localList = getLocalDiaries();
  const tempId = entry.id || `local_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const fullEntry: DiaryEntry = {
    ...entry,
    id: tempId,
    createdAt: entry.createdAt || new Date().toISOString()
  };

  try {
    // Attempt Firestore write
    const docRef = await addDoc(collection(db, COLLECTION_NAME), {
      ...entry,
      createdAtServer: serverTimestamp(),
      createdAtIso: fullEntry.createdAt
    });
    fullEntry.id = docRef.id;
  } catch (err) {
    console.warn('Firestore write failed, falling back to local storage:', err);
  }

  // Always update local cache
  const updatedList = [fullEntry, ...localList.filter(d => d.id !== fullEntry.id)];
  saveLocalDiaries(updatedList);
  return fullEntry;
}

// Fetch all diary entries from Firestore, fallback to local storage
export async function fetchDiariesFromDb(): Promise<DiaryEntry[]> {
  const localList = getLocalDiaries();
  try {
    const q = query(collection(db, COLLECTION_NAME), orderBy('createdAtIso', 'desc'));
    const snapshot = await getDocs(q);
    const firestoreEntries: DiaryEntry[] = [];
    snapshot.forEach(docSnap => {
      const data = docSnap.data();
      firestoreEntries.push({
        id: docSnap.id,
        date: data.date || new Date().toISOString().split('T')[0],
        emotion: data.emotion || '기쁨',
        title: data.title || '',
        content: data.content || '',
        weather: data.weather || '맑음',
        aiResponse: data.aiResponse,
        createdAt: data.createdAtIso || new Date().toISOString(),
        isFavorite: data.isFavorite || false
      });
    });

    if (firestoreEntries.length > 0) {
      // Merge with any unsynced local entries
      const mergedMap = new Map<string, DiaryEntry>();
      firestoreEntries.forEach(item => mergedMap.set(item.id, item));
      localList.forEach(item => {
        if (!mergedMap.has(item.id)) {
          mergedMap.set(item.id, item);
        }
      });
      const merged = Array.from(mergedMap.values()).sort(
        (a, b) => new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime()
      );
      saveLocalDiaries(merged);
      return merged;
    }
  } catch (err) {
    console.warn('Firestore fetch failed, using local cache:', err);
  }

  return localList;
}

// Delete diary entry
export async function deleteDiaryFromDb(id: string): Promise<void> {
  // Remove from local cache
  const localList = getLocalDiaries().filter(d => d.id !== id);
  saveLocalDiaries(localList);

  try {
    if (!id.startsWith('local_')) {
      await deleteDoc(doc(db, COLLECTION_NAME, id));
    }
  } catch (err) {
    console.warn('Firestore delete failed:', err);
  }
}

// Toggle favorite or update
export async function updateDiaryFavorite(id: string, isFavorite: boolean): Promise<void> {
  const localList = getLocalDiaries().map(d => d.id === id ? { ...d, isFavorite } : d);
  saveLocalDiaries(localList);

  try {
    if (!id.startsWith('local_')) {
      await updateDoc(doc(db, COLLECTION_NAME, id), { isFavorite });
    }
  } catch (err) {
    console.warn('Firestore favorite update failed:', err);
  }
}
