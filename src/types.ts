export type Testament = 'OT' | 'NT';

export interface BookMeta {
  id: number;
  usfm: string;
  name_zh: string;
  name_en: string;
  testament: Testament;
  chapters: number;
}

export interface BookIndex {
  v: string;
  books: BookMeta[];
}

export interface WordToken {
  w: string;
  morph?: string;
  gloss?: string;
}

export interface VerseData {
  v: number;
  zh: string;
  en: string;
  notes?: string[];
  gr?: WordToken[];
  he?: WordToken[];
}

export interface ChapterData {
  book: number;
  chapter: number;
  verses: VerseData[];
}
