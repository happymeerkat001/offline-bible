import type { BookIndex, ChapterData } from '../types';

const DATA_BASE = import.meta.env.BASE_URL + 'data';

export class FetchError extends Error {
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
  return fetchJson<BookIndex>(`${DATA_BASE}/index.json`);
}

export async function fetchChapter(bookId: number, chapter: number): Promise<ChapterData> {
  return fetchJson<ChapterData>(`${DATA_BASE}/${bookId}/${chapter}.json`);
}
