// Purpose: output raw verse data from JSON response of labs.bible.org API for later merging and indexing, fetches all 1,189 chapters in batches of 8 to avoid overwhelming the API, skips download if output file already exists

import path from 'node:path'; // run node:path for handling file paths across platforms
import { writeFile, access } from 'node:fs/promises'; // run node:fs/promises for asynchronous file system operations
import { BOOKS } from '../lib/books'; // knowledge of book IDs and chapter counts

const ROOT = path.resolve(import.meta.dirname, '../..'); // memory: resolve root directory of project for consistent file paths
const outputFile = path.join(ROOT, 'scripts/raw/en_net.json'); // memory: define output file path for raw verse data from NET Bible API

// Skip if already downloaded
try {
  await access(outputFile);
  console.log(`skip: ${path.relative(ROOT, outputFile)}`);
  process.exit(0);
} catch {
  // file doesn't exist, proceed
}

interface BibleOrgVerse {
  // knowledge of structure of verse data returned by labs.bible.org API
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

console.log(
  `fetch: NET Bible (labs.bible.org API, ${tasks.length} chapters) -> ${path.relative(ROOT, outputFile)}`
);

const BATCH_SIZE = 8;
const allVerses: BibleOrgVerse[] = [];

for (let i = 0; i < tasks.length; i += BATCH_SIZE) {
  const batch = tasks.slice(i, i + BATCH_SIZE);
  const results = await Promise.all(
    batch.map(async ({ bookName, chapter }) => {
      const passage = encodeURIComponent(`${bookName} ${chapter}`);
      const url = `https://labs.bible.org/api/?passage=${passage}&type=json&formatting=full`;
      const res = await fetch(url);
      if (!res.ok)
        throw new Error(`HTTP ${res.status} for "${bookName} ${chapter}"`);
      return res.json() as Promise<BibleOrgVerse[]>;
    })
  );
  for (const verses of results) {
    allVerses.push(...verses);
  }
  const done = Math.min(i + BATCH_SIZE, tasks.length);
  process.stdout.write(`\r  ${done}/${tasks.length} chapters fetched`);
}

process.stdout.write('\n'); // write newline after progress output
await writeFile(outputFile, JSON.stringify(allVerses)); // output raw verse data from JSON response for later merging and indexing
console.log(
  `wrote ${allVerses.length} verses -> ${path.relative(ROOT, outputFile)}`
);
