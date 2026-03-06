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

export interface VerseData {
  v: number;
  zh: string;
  en: string;
  notes?: string[];
  gr?: string;
  he?: string;
}

export interface ChapterData {
  book: number;
  chapter: number;
  verses: VerseData[];
}
