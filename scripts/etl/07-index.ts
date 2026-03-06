import path from 'node:path';
import { BOOKS } from '../lib/books';
import { writeJsonFile } from '../lib/io';

const ROOT = path.resolve(import.meta.dirname, '../..');

async function main() {
  await writeJsonFile(path.join(ROOT, 'public/data/index.json'), {
    v: '1.0.0',
    books: BOOKS
  });
  console.log('index generated');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
