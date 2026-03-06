import path from 'node:path';
import { writeFile, access } from 'node:fs/promises';
import { BOOKS } from '../lib/books';

const ROOT = path.resolve(import.meta.dirname, '../..');
const outputFile = path.join(ROOT, 'scripts/raw/en_net.json');

// Skip if already downloaded
try {
  await access(outputFile);
  console.log(`skip: ${path.relative(ROOT, outputFile)}`);
  process.exit(0);
} catch {
  // file doesn't exist, proceed
}

interface BibleOrgVerse {
  bookname: string;
  chapter: string;
  verse: string;
  text: string;
}

// Build flat list of all 1,189 chapters to fetch
const tasks: Array<{ bookName: string; chapter: number }> = [];
for (const book of BOOKS) {
  for (let ch = 1; ch <= book.chapters; ch++) {
    tasks.push({ bookName: book.name_en, chapter: ch });
  }
}

console.log(`fetch: NET Bible (labs.bible.org API, ${tasks.length} chapters) -> ${path.relative(ROOT, outputFile)}`);

const BATCH_SIZE = 8;
const allVerses: BibleOrgVerse[] = [];

for (let i = 0; i < tasks.length; i += BATCH_SIZE) {
  const batch = tasks.slice(i, i + BATCH_SIZE);
  const results = await Promise.all(
    batch.map(async ({ bookName, chapter }) => {
      const passage = encodeURIComponent(`${bookName} ${chapter}`);
      const url = `https://labs.bible.org/api/?passage=${passage}&type=json&formatting=plain`;
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status} for "${bookName} ${chapter}"`);
      return res.json() as Promise<BibleOrgVerse[]>;
    })
  );
  for (const verses of results) {
    allVerses.push(...verses);
  }
  const done = Math.min(i + BATCH_SIZE, tasks.length);
  process.stdout.write(`\r  ${done}/${tasks.length} chapters fetched`);
}

process.stdout.write('\n');
await writeFile(outputFile, JSON.stringify(allVerses));
console.log(`wrote ${allVerses.length} verses -> ${path.relative(ROOT, outputFile)}`);
