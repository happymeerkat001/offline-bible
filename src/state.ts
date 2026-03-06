const LAST_READ_KEY = 'offline-bible:last-read';

export interface LastReadState {
  usfm: string;
  chapter: number;
}

export function saveLastRead(state: LastReadState): void {
  localStorage.setItem(LAST_READ_KEY, JSON.stringify(state));
}

export function loadLastRead(): LastReadState | null {
  const raw = localStorage.getItem(LAST_READ_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as LastReadState;
    if (!parsed.usfm || !parsed.chapter) return null;
    return parsed;
  } catch {
    return null;
  }
}
