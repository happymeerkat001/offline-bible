// Purpose: parse raw verse data from CUV JSON into canonical verse format for later merging and indexing
import path from 'node:path'; // Run node:path for handling file paths across platforms
import { readJsonFile, writeJsonFile } from '../lib/io'; // Knowledge of utility functions for reading and writing JSON files
import type { CanonicalVerse } from '../lib/types'; // Knowledge of data structure for canonical verse format: { bookId, chapter, verse, text }

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

  await writeJsonFile(outputFile, out); // output parsed CUV verses for later merging and indexing
  console.log(`wrote ${out.length} CUV verses -> ${path.relative(ROOT, outputFile)}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
