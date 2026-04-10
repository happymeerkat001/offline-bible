import path from 'node:path';
import { readJsonFile, writeJsonFile } from '../lib/io';
import type { CanonicalVerse } from '../lib/types';

interface CusVerse {
  verse?: number;
  text?: string;
}

interface CusChapter {
  chapter?: number;
  verses?: CusVerse[];
}

interface CusBook {
  chapters?: CusChapter[];
}

const ROOT = path.resolve(import.meta.dirname, '../..');
const inputDir = path.join(ROOT, 'scripts/raw/zh_cus');
const outputFile = path.join(ROOT, 'scripts/parsed/zh.json');

async function main() {
  const out: CanonicalVerse[] = [];

  for (let bookId = 1; bookId <= 66; bookId += 1) {
    const inputFile = path.join(inputDir, `${bookId}.json`);
    const source = await readJsonFile<CusBook>(inputFile);
    source.chapters?.forEach((chapterData, chapterIndex) => {
      const chapter = chapterData.chapter ?? chapterIndex + 1;
      chapterData.verses?.forEach((verseData, verseIndex) => {
        const verse = verseData.verse ?? verseIndex + 1;
        const text = verseData.text?.trim() ?? '';
        out.push({ bookId, chapter, verse, text });
      });
    });
  }

  await writeJsonFile(outputFile, out);
  console.log(`wrote ${out.length} CUS verses -> ${path.relative(ROOT, outputFile)}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
