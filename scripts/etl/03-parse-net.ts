
import path from 'node:path'; //import run node:path for handling file paths across platforms
import { readJsonFile, writeJsonFile } from '../lib/io'; // import run utility functions for reading and writing JSON files
import type { CanonicalVerse } from '../lib/types'; // import knowledge of data structure for canonical verse format: { bookId, chapter, verse, text }

// Bible.org API flat format: [{bookname, chapter, verse, text}, ...]
interface BibleOrgVerse {
  bookname: string;
  chapter: string;
  verse: string;
  text: string;
}

const BOOK_IDS: Record<string, number> = {
  'Genesis': 1, 'Exodus': 2, 'Leviticus': 3, 'Numbers': 4, 'Deuteronomy': 5,
  'Joshua': 6, 'Judges': 7, 'Ruth': 8, '1 Samuel': 9, '2 Samuel': 10,
  '1 Kings': 11, '2 Kings': 12, '1 Chronicles': 13, '2 Chronicles': 14, 'Ezra': 15,
  'Nehemiah': 16, 'Esther': 17, 'Job': 18, 'Psalms': 19, 'Proverbs': 20,
  'Ecclesiastes': 21, 'Song of Solomon': 22, 'Song of Songs': 22, 'Isaiah': 23, 'Jeremiah': 24, 'Lamentations': 25,
  'Ezekiel': 26, 'Daniel': 27, 'Hosea': 28, 'Joel': 29, 'Amos': 30,
  'Obadiah': 31, 'Jonah': 32, 'Micah': 33, 'Nahum': 34, 'Habakkuk': 35,
  'Zephaniah': 36, 'Haggai': 37, 'Zechariah': 38, 'Malachi': 39,
  'Matthew': 40, 'Mark': 41, 'Luke': 42, 'John': 43, 'Acts': 44,
  'Romans': 45, '1 Corinthians': 46, '2 Corinthians': 47, 'Galatians': 48, 'Ephesians': 49,
  'Philippians': 50, 'Colossians': 51, '1 Thessalonians': 52, '2 Thessalonians': 53,
  '1 Timothy': 54, '2 Timothy': 55, 'Titus': 56, 'Philemon': 57, 'Hebrews': 58,
  'James': 59, '1 Peter': 60, '2 Peter': 61, '1 John': 62, '2 John': 63,
  '3 John': 64, 'Jude': 65, 'Revelation': 66
};

const ROOT = path.resolve(import.meta.dirname, '../..');
const inputFile = path.join(ROOT, 'scripts/raw/en_net.json');
const outputFile = path.join(ROOT, 'scripts/parsed/en.json');

async function main() {
  const source = await readJsonFile<BibleOrgVerse[]>(inputFile);
  const out: CanonicalVerse[] = [];
  const notesRoot = path.join(ROOT, 'scripts/raw/net_notes');

  const byChapter = new Map<string, BibleOrgVerse[]>();
  for (const v of source) {
    const bookId = BOOK_IDS[v.bookname];
    if (!bookId) continue;
    const key = `${bookId}:${v.chapter}`;
    if (!byChapter.has(key)) byChapter.set(key, []);
    byChapter.get(key)!.push(v);
  }

  for (const [chapterKey, verses] of byChapter) {
    const [bookIdStr, chapterStr] = chapterKey.split(':');
    let notesMap: Record<string, string> = {};
    try {
      notesMap = await readJsonFile<Record<string, string>>(path.join(notesRoot, bookIdStr, `${chapterStr}.json`));
    } catch {
      // no notes file for this chapter
    }

    for (const v of verses) {
      const noteRegex = /<n\s+id="(\d+)"\s*\/>/g;
      const notes: string[] = [];
      let m: RegExpExecArray | null;
      while ((m = noteRegex.exec(v.text)) !== null) {
        const text = notesMap[m[1]];
        if (text) notes.push(text);
      }

      const cleanText = v.text
        .replace(/<[^>]+>/g, '')
        .replace(/\s+/g, ' ')
        .trim();

      out.push({
        bookId: Number(bookIdStr),
        chapter: Number(v.chapter),
        verse: Number(v.verse),
        text: cleanText,
        ...(notes.length > 0 ? { notes } : {})
      });
    }
  }

  await writeJsonFile(outputFile, out);
  console.log(`wrote ${out.length} NET verses`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
