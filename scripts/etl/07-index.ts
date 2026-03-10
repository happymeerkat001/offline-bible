// Purpose: output index file for later use by client, containing book IDs and chapter counts for all 66 books, knowledge of book IDs and chapter counts, knowledge of utility functions for reading and writing JSON files

import path from 'node:path'; // node:path for handling file paths across platforms
import { BOOKS } from '../lib/books'; // knowledge of book IDs and chapter counts
import { writeJsonFile } from '../lib/io'; // knowledge of utility functions for reading and writing JSON files

const ROOT = path.resolve(import.meta.dirname, '../..');

async function main() {
  await writeJsonFile(path.join(ROOT, 'public/data/index.json'), { //output index file for later use by client, containing book IDs and chapter counts for all 66 books
    v: '1.0.0',
    books: BOOKS
  });
  console.log('index generated');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
