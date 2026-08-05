import path from 'node:path';
import { readJsonFile, writeJsonFile } from '../lib/io';
import { parseNetVerses, type BibleOrgVerse } from './parsers';

const ROOT = path.resolve(import.meta.dirname, '../..');
const inputFile = path.join(ROOT, 'scripts/raw/en_net.json');
const outputFile = path.join(ROOT, 'scripts/parsed/en.json');
const notesRoot = path.join(ROOT, 'scripts/raw/net_notes');

async function main() {
  const source = await readJsonFile<BibleOrgVerse[]>(inputFile);
  const output = await parseNetVerses(source, (bookId, chapter) =>
    readJsonFile<Record<string, string>>(
      path.join(notesRoot, String(bookId), `${chapter}.json`)
    )
  );

  await writeJsonFile(outputFile, output);
  console.log(`wrote ${output.length} NET verses`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
