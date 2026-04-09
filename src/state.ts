// purpose: exports functions for saving and loading last read state to localStorage, defines data structure for last read state. 

export interface LastReadState { // knowledge of data structure for last read state, constains USFM and Chapter. 
  usfm: string;
  chapter: number; 
}

const LAST_READ_KEY = 'lastRead';

export function saveLastRead(state: LastReadState): void { // run. depend on: 1. LastReadState
  localStorage.setItem(LAST_READ_KEY, JSON.stringify(state));
}

export function loadLastRead(): LastReadState | null { // run function to load last read state from localStorage, reutrns null
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
