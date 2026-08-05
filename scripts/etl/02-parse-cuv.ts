import path from 'node:path';
import { readJsonFile, writeJsonFile } from '../lib/io';
import type { CanonicalVerse } from '../lib/types';
import { parseCusBook, type CusBook } from './parsers';

const ROOT = path.resolve(import.meta.dirname, '../..');
const inputDir = path.join(ROOT, 'scripts/raw/zh_cus');
const outputFile = path.join(ROOT, 'scripts/parsed/zh.json');

async function main() {
  const output: CanonicalVerse[] = [];

  for (let bookId = 1; bookId <= 66; bookId += 1) {
    const source = await readJsonFile<CusBook>(
      path.join(inputDir, `${bookId}.json`)
    );
    output.push(...parseCusBook(bookId, source));
  }

  await writeJsonFile(outputFile, output);
  console.log(
    `wrote ${output.length} CUS verses -> ${path.relative(ROOT, outputFile)}`
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
