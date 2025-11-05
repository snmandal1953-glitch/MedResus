import AsyncStorage from '@react-native-async-storage/async-storage';

const CASES_KEY = 'cases';

// Existing storage helper (keep yours as-is if already present)
export const storage = {
  async set(key: string, value: any) {
    try {
      const v = typeof value === 'string' ? value : JSON.stringify(value);
      await AsyncStorage.setItem(key, v);
    } catch (e) {
      console.warn('Storage set error:', e);
    }
  },
  async get<T = any>(key: string): Promise<T | null> {
    try {
      const v = await AsyncStorage.getItem(key);
      if (v == null) return null;
      try { return JSON.parse(v) as T; } catch { return v as unknown as T; }
    } catch (e) {
      console.warn('Storage get error:', e);
      return null;
    }
  },
  async remove(key: string) {
    try { await AsyncStorage.removeItem(key); } catch (e) { console.warn(e); }
  },
  async clearAll() {
    try { await AsyncStorage.clear(); } catch (e) { console.warn(e); }
  },
};

/** -------- Case-specific helpers -------- **/

// Save/append a case snapshot
export async function saveCase(caseObj: any) {
  try {
    const raw = await AsyncStorage.getItem(CASES_KEY);
    const arr = raw ? JSON.parse(raw) : [];
    arr.push({ ...caseObj, _savedAt: Date.now() });
    await AsyncStorage.setItem(CASES_KEY, JSON.stringify(arr));
  } catch (e) {
    console.warn('saveCase error:', e);
  }
}

// Read all saved cases
export async function loadCases(): Promise<any[]> {
  try {
    const raw = await AsyncStorage.getItem(CASES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.warn('loadCases error:', e);
    return [];
  }
}

// Wipe cases (optional utility)
export async function clearCases() {
  try { await AsyncStorage.removeItem(CASES_KEY); } catch (e) { console.warn('clearCases error:', e); }
}
