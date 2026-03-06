import path from 'node:path';
import { readFile } from 'node:fs/promises';
import { writeJsonFile } from '../lib/io';
import type { CanonicalVerse } from '../lib/types';

const ROOT = path.resolve(import.meta.dirname, '../..');
const inputFile = path.join(ROOT, 'scripts/raw/opengnt.tsv');
const outputFile = path.join(ROOT, 'scripts/parsed/gr.json');

// Macula Greek TSV format (Nestle1904):
// col[0] = xml:id like "n40001001001" (n + BB + CCC + VVV + WWW)
// col[8] = text (Greek word with diacritics)
// col[9] = after (punctuation/space following the word)

async function main() {
  const raw = await readFile(inputFile, 'utf8');
  const lines = raw.split(/\r?\n/).filter(Boolean);

  // Map from "BB:CCC:VVV" key -> accumulated verse text
  const verseWords = new Map<string, { bookId: number; chapter: number; verse: number; parts: string[] }>();
  const verseOrder: string[] = [];

  for (const line of lines) {
    const cols = line.split('\t');
    if (cols.length < 10) continue;

    const id = cols[0]?.trim();
    // id format: "n" + BBCCCVVVWWW (11 digits after 'n')
    const match = id?.match(/^n(\d{2})(\d{3})(\d{3})\d{3}$/);
    if (!match) continue;

    const bookId = Number(match[1]);
    const chapter = Number(match[2]);
    const verse = Number(match[3]);

    if (bookId < 40 || bookId > 66) continue;

    const wordText = cols[8]?.trim() ?? '';
    const after = cols[9]?.trim() ?? '';
    if (!wordText) continue;

    const key = `${bookId}:${chapter}:${verse}`;
    if (!verseWords.has(key)) {
      verseWords.set(key, { bookId, chapter, verse, parts: [] });
      verseOrder.push(key);
    }
    verseWords.get(key)!.parts.push(wordText + after);
  }

  const out: CanonicalVerse[] = verseOrder.map((key) => {
    const v = verseWords.get(key)!;
    return { bookId: v.bookId, chapter: v.chapter, verse: v.verse, text: v.parts.join('').trim() };
  });

  await writeJsonFile(outputFile, out);
  console.log(`wrote ${out.length} Greek verses -> ${path.relative(ROOT, outputFile)}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
