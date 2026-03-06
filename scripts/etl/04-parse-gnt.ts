import path from 'node:path';
import { readFile } from 'node:fs/promises';
import { BOOKS } from '../lib/books';
import { writeJsonFile } from '../lib/io';
import type { TokenizedVerse, WordToken } from '../lib/types';

const ROOT = path.resolve(import.meta.dirname, '../..');
const inputFile = path.join(ROOT, 'scripts/raw/opengnt.tsv');
const outputFile = path.join(ROOT, 'scripts/parsed/gr.json');

function findColumnIndex(headers: string[], candidates: string[]): number {
  for (const name of candidates) {
    const idx = headers.indexOf(name);
    if (idx !== -1) return idx;
  }
  return -1;
}

async function main() {
  const raw = await readFile(inputFile, 'utf8');
  const lines = raw.split(/\r?\n/).filter(Boolean);
  if (lines.length < 2) throw new Error('OpenGNT TSV is empty.');

  const headers = lines[0].split('\t').map((h) => h.trim());
  const refIdx = findColumnIndex(headers, ['ref']);
  const textIdx = findColumnIndex(headers, ['text', 'w']);
  const morphIdx = findColumnIndex(headers, ['morph']);
  const glossIdx = findColumnIndex(headers, ['gloss']);

  if (refIdx === -1 || textIdx === -1) {
    throw new Error('Required TSV columns are missing: ref/text');
  }

  const usfmToBookId = new Map(BOOKS.map((b) => [b.usfm, b.id]));
  const verses = new Map<string, TokenizedVerse>();
  const order: string[] = [];

  for (let i = 1; i < lines.length; i += 1) {
    const cols = lines[i].split('\t');
    const ref = cols[refIdx]?.trim();
    if (!ref) continue;

    const refMatch = ref.match(/^([1-3]?[A-Z]{2,3})\s+(\d+):(\d+)!\d+$/);
    if (!refMatch) continue;

    const usfm = refMatch[1];
    const chapter = Number(refMatch[2]);
    const verse = Number(refMatch[3]);
    const bookId = usfmToBookId.get(usfm);
    if (!bookId || bookId < 40 || bookId > 66) continue;

    const w = (cols[textIdx] ?? '').trim();
    if (!w) continue;

    const morph = morphIdx >= 0 ? (cols[morphIdx] ?? '').trim() : '';
    const gloss = glossIdx >= 0 ? (cols[glossIdx] ?? '').trim() : '';

    const token: WordToken = { w };
    if (morph) token.morph = morph;
    if (gloss) token.gloss = gloss;

    const key = `${bookId}:${chapter}:${verse}`;
    if (!verses.has(key)) {
      verses.set(key, { bookId, chapter, verse, tokens: [] });
      order.push(key);
    }
    verses.get(key)!.tokens.push(token);
  }

  const out = order.map((k) => verses.get(k)!);
  await writeJsonFile(outputFile, out);
  console.log(`wrote ${out.length} Greek verses -> ${path.relative(ROOT, outputFile)}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
