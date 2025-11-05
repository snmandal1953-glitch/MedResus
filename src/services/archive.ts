import AsyncStorage from "@react-native-async-storage/async-storage";
import { ArchivedCase, CaseState } from "../data/types";

const ARCHIVE_KEY = "MED_RESUS_ARCHIVE";

export async function archiveCase(state: CaseState) {
  const raw = await AsyncStorage.getItem(ARCHIVE_KEY);
  const list: ArchivedCase[] = raw ? JSON.parse(raw) : [];
  const item: ArchivedCase = { id: `${Date.now()}`, startedAt: state.startedAt || Date.now(), log: state.log };
  list.push(item);
  await AsyncStorage.setItem(ARCHIVE_KEY, JSON.stringify(list));
  return item.id;
}

export async function listArchived() {
  const raw = await AsyncStorage.getItem(ARCHIVE_KEY);
  const list: ArchivedCase[] = raw ? JSON.parse(raw) : [];
  return list.sort((a,b)=>a.startedAt-b.startedAt);
}

export function groupByMonth(list: ArchivedCase[]) {
  const groups: Record<string, ArchivedCase[]> = {};
  for (const it of list) {
    const d = new Date(it.startedAt);
    const key = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`; // YYYY-MM
    (groups[key] ||= []).push(it);
  }
  return groups;
}
// import { CaseState } from "../data/types"; // Removed duplicate import

const KEY = "MED_RESUS_CASE";

export async function saveCase(state: CaseState) {
  await AsyncStorage.setItem(KEY, JSON.stringify(state));
}

export async function loadCase(): Promise<CaseState | null> {
  const s = await AsyncStorage.getItem(KEY);
  return s ? JSON.parse(s) : null;
}

export async function clearCase() { await AsyncStorage.removeItem(KEY); }