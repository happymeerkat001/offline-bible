import path from 'node:path';
import { readFile } from 'node:fs/promises';
import { writeJsonFile } from '../lib/io';
import { parseOpenGnt } from './parsers';

const ROOT = path.resolve(import.meta.dirname, '../..');
const inputFile = path.join(ROOT, 'scripts/raw/opengnt.tsv');
const outputFile = path.join(ROOT, 'scripts/parsed/gr.json');

async function main() {
  const output = parseOpenGnt(await readFile(inputFile, 'utf8'));
  await writeJsonFile(outputFile, output);
  console.log(
    `wrote ${output.length} Greek verses -> ${path.relative(ROOT, outputFile)}`
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
