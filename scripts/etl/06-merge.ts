import path from 'node:path';
import { mkdir } from 'node:fs/promises';
import { BOOKS } from '../lib/books';
import { readJsonFile, writeJsonFile } from '../lib/io';
import type { CanonicalVerse } from '../lib/types';

interface ChapterVerse {
  v: number;
  zh: string;
  en: string;
  notes?: string[];
  gr?: string;
  he?: string;
}

interface ChapterDoc {
  book: number;
  chapter: number;
  verses: ChapterVerse[];
}

const ROOT = path.resolve(import.meta.dirname, '../..');

function indexByRef(items: CanonicalVerse[]): Map<string, string> {
  const map = new Map<string, string>();
  items.forEach((item) => map.set(`${item.bookId}:${item.chapter}:${item.verse}`, item.text));
  return map;
}

async function main() {
  const zh = indexByRef(await readJsonFile<CanonicalVerse[]>(path.join(ROOT, 'scripts/parsed/zh.json')));
  const en = indexByRef(await readJsonFile<CanonicalVerse[]>(path.join(ROOT, 'scripts/parsed/en.json')));
  const gr = indexByRef(await readJsonFile<CanonicalVerse[]>(path.join(ROOT, 'scripts/parsed/gr.json')));
  const he = indexByRef(await readJsonFile<CanonicalVerse[]>(path.join(ROOT, 'scripts/parsed/he.json')));

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
          notes: []
        };
        if (isNt) base.gr = gr.get(key) ?? '';
        else base.he = he.get(key) ?? '';
        verses.push(base);
      }

      const doc: ChapterDoc = { book: book.id, chapter, verses };
      await writeJsonFile(path.join(dataRoot, `${book.id}/${chapter}.json`), doc);
    }
  }

  console.log('merge complete');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
