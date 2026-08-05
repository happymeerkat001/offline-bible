import path from 'node:path';
import { readFile } from 'node:fs/promises';
import { writeJsonFile } from '../lib/io';
import { parseWlc } from './parsers';

const ROOT = path.resolve(import.meta.dirname, '../..');
const inputFile = path.join(ROOT, 'scripts/raw/wlc.xml');
const outputFile = path.join(ROOT, 'scripts/parsed/he.json');

async function main() {
  const output = parseWlc(await readFile(inputFile, 'utf8'));
  await writeJsonFile(outputFile, output);
  console.log(
    `wrote ${output.length} Hebrew verses -> ${path.relative(ROOT, outputFile)}`
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
