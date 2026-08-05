// Purpose: export knowledge of fetcherror class, functions for fetching book index and chapter data from JSON.

import type { BookIndex, ChapterData } from '../types'; // Knowledge of data structures for book index and chapter data: BookIndex { v, books: [{ id, usfm, name_en, chapters, testament }] }, ChapterData { book, chapter, verses: [{ v, zh, en, notes?, gr?, he? }] }

const DATA_BASE = import.meta.env.BASE_URL + 'data'; // modular base URL for fetching Bible data files, allowing for flexibility in deployment environments

export class FetchError extends Error {
  // knowledge of custom error class for handling fetch errors with optional HTTP status code
  status?: number;

  constructor(message: string, status?: number) {
    super(message);
    this.name = 'FetchError';
    this.status = status;
  }
}

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) {
    throw new FetchError(`Request failed: ${url}`, res.status);
  }
  return (await res.json()) as T;
}

export async function fetchIndex(): Promise<BookIndex> {
  // Run function to fetch book index data from JSON, returns bookindex
  return fetchJson<BookIndex>(`${DATA_BASE}/index.json`);
}

export async function fetchChapter(
  bookId: number,
  chapter: number
): Promise<ChapterData> {
  // Run function to fetch key data from JSON file. 1. know bookid and chapter number, 2. DATA_BASE const —> base URL resolved from importMeta.d.ts 3. Chapter JSON completed
  return fetchJson<ChapterData>(`${DATA_BASE}/${bookId}/${chapter}.json`);
}
