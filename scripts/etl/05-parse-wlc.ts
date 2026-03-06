import path from 'node:path';
import { readFile } from 'node:fs/promises';
import { writeJsonFile } from '../lib/io';
import type { TokenizedVerse, WordToken } from '../lib/types';

const ROOT = path.resolve(import.meta.dirname, '../..');
const inputFile = path.join(ROOT, 'scripts/raw/wlc.xml');
const outputFile = path.join(ROOT, 'scripts/parsed/he.json');

function decodeEntities(text: string): string {
  return text
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

async function main() {
  const xml = await readFile(inputFile, 'utf8');
  const verseRegex = /<verse\s+osisID="([A-Za-z0-9]+)\.(\d+)\.(\d+)"[^>]*>([\s\S]*?)<\/verse>/g;
  const out: TokenizedVerse[] = [];

  const osisToBook = new Map<string, number>([
    ['Gen', 1], ['Exod', 2], ['Lev', 3], ['Num', 4], ['Deut', 5], ['Josh', 6], ['Judg', 7], ['Ruth', 8],
    ['1Sam', 9], ['2Sam', 10], ['1Kgs', 11], ['2Kgs', 12], ['1Chr', 13], ['2Chr', 14], ['Ezra', 15],
    ['Neh', 16], ['Esth', 17], ['Job', 18], ['Ps', 19], ['Prov', 20], ['Eccl', 21], ['Song', 22],
    ['Isa', 23], ['Jer', 24], ['Lam', 25], ['Ezek', 26], ['Dan', 27], ['Hos', 28], ['Joel', 29], ['Amos', 30],
    ['Obad', 31], ['Jonah', 32], ['Mic', 33], ['Nah', 34], ['Hab', 35], ['Zeph', 36], ['Hag', 37],
    ['Zech', 38], ['Mal', 39]
  ]);

  let match: RegExpExecArray | null;
  while ((match = verseRegex.exec(xml)) !== null) {
    const [, osisBook, chapterRaw, verseRaw, body] = match;
    const bookId = osisToBook.get(osisBook);
    if (!bookId) continue;

    const tokens: WordToken[] = [];
    const wordRegex = /<w\b([^>]*)>([\s\S]*?)<\/w>/g;
    let wordMatch: RegExpExecArray | null;

    while ((wordMatch = wordRegex.exec(body)) !== null) {
      const attrs = wordMatch[1] ?? '';
      const rawWord = decodeEntities((wordMatch[2] ?? '').replace(/<[^>]+>/g, '').trim());
      if (!rawWord) continue;

      const morphMatch = attrs.match(/\bmorph="([^"]+)"/);
      const token: WordToken = { w: rawWord.replace(/\//g, '') };
      if (morphMatch?.[1]) token.morph = morphMatch[1];
      tokens.push(token);
    }

    out.push({
      bookId,
      chapter: Number(chapterRaw),
      verse: Number(verseRaw),
      tokens
    });
  }

  await writeJsonFile(outputFile, out);
  console.log(`wrote ${out.length} Hebrew verses -> ${path.relative(ROOT, outputFile)}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
