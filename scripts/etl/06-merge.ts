import path from 'node:path'; // node:path for handling file paths across platforms
import { mkdir, readFile } from 'node:fs/promises'; // node:fs/promises for asynchronous file system operations
import { BOOKS } from '../lib/books'; // knowledge of book IDs and chapter counts
import { readJsonFile, writeJsonFile } from '../lib/io'; // knowledge of utility functions for reading and writing JSON files
import type { CanonicalVerse, TokenizedVerse, WordToken } from '../lib/types'; // Knowledge of data structures for verses and tokens

interface ChapterVerse {
  v: number;
  zh: string;
  en: string;
  notes?: string[];
  gr?: WordToken[];
  he?: WordToken[];
}

interface ChapterDoc {
  book: number;
  chapter: number;
  commentary?: string;
  verses: ChapterVerse[];
}

const ROOT = path.resolve(import.meta.dirname, '../..');

function indexTextByRef(items: CanonicalVerse[]): Map<string, string> {
  const map = new Map<string, string>();
  items.forEach((item) => map.set(`${item.bookId}:${item.chapter}:${item.verse}`, item.text));
  return map;
}

function indexNotesByRef(items: CanonicalVerse[]): Map<string, string[]> {
  const map = new Map<string, string[]>();
  items.forEach((item) => {
    if (item.notes?.length) {
      map.set(`${item.bookId}:${item.chapter}:${item.verse}`, item.notes);
    }
  });
  return map;
}

function indexTokensByRef(items: TokenizedVerse[]): Map<string, WordToken[]> {
  const map = new Map<string, WordToken[]>();
  items.forEach((item) => map.set(`${item.bookId}:${item.chapter}:${item.verse}`, item.tokens));
  return map;
}

async function readOptionalTextFile(filePath: string): Promise<string | undefined> {
  try {
    const raw = await readFile(filePath, 'utf8');
    const text = raw.trim();
    return text.length > 0 ? text : undefined;
  } catch {
    return undefined;
  }
}

async function main() {
  const zh = indexTextByRef(await readJsonFile<CanonicalVerse[]>(path.join(ROOT, 'scripts/parsed/zh.json')));
  const enRaw = await readJsonFile<CanonicalVerse[]>(path.join(ROOT, 'scripts/parsed/en.json'));
  const en = indexTextByRef(enRaw);
  const enNotes = indexNotesByRef(enRaw);
  const gr = indexTokensByRef(await readJsonFile<TokenizedVerse[]>(path.join(ROOT, 'scripts/parsed/gr.json')));
  const he = indexTokensByRef(await readJsonFile<TokenizedVerse[]>(path.join(ROOT, 'scripts/parsed/he.json')));

  const dataRoot = path.join(ROOT, 'public/data');
  await mkdir(dataRoot, { recursive: true });

  for (const book of BOOKS) {
    const isNt = book.testament === 'NT';
    for (let chapter = 1; chapter <= book.chapters; chapter += 1) {
      const maxVerse = Math.max(
        ...[...zh.keys()]
          .filter((key) => key.startsWith(`${book.id}:${chapter}:`))
          .map((key) => Number(key.split(':')[2])),
        0
      );

      const verses: ChapterVerse[] = [];
      for (let verse = 1; verse <= maxVerse; verse += 1) {
        const key = `${book.id}:${chapter}:${verse}`;
        const base: ChapterVerse = {
          v: verse,
          zh: zh.get(key) ?? '',
          en: en.get(key) ?? '',
          notes: enNotes.get(key) ?? []
        };
        if (isNt) base.gr = gr.get(key) ?? [];
        else base.he = he.get(key) ?? [];
        verses.push(base);
      }

      const commentary = await readOptionalTextFile(path.join(ROOT, 'scripts/raw/fbc', `${book.id}/${chapter}.txt`));
      const doc: ChapterDoc = { book: book.id, chapter, verses, ...(commentary ? { commentary } : {}) };
      await writeJsonFile(path.join(dataRoot, `${book.id}/${chapter}.json`), doc);
    }
  }

  console.log('merge complete');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
