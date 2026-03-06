import path from 'node:path';
import { readJsonFile, writeJsonFile } from '../lib/io';
import type { CanonicalVerse } from '../lib/types';

// Actual format: [{abbrev, chapters: [["verse1","verse2",...], ...]}, ...]
interface CuvSource {
  chapters?: string[][];
}

const ROOT = path.resolve(import.meta.dirname, '../..');
const inputFile = path.join(ROOT, 'scripts/raw/zh_cuv.json');
const outputFile = path.join(ROOT, 'scripts/parsed/zh.json');

async function main() {
  const source = await readJsonFile<CuvSource[]>(inputFile);
  const out: CanonicalVerse[] = [];

  source.forEach((book, bookIndex) => {
    book.chapters?.forEach((chapter, chapterIndex) => {
      chapter?.forEach((text, verseIndex) => {
        out.push({
          bookId: bookIndex + 1,
          chapter: chapterIndex + 1,
          verse: verseIndex + 1,
          text: text.trim()
        });
      });
    });
  });

  await writeJsonFile(outputFile, out);
  console.log(`wrote ${out.length} CUV verses -> ${path.relative(ROOT, outputFile)}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
