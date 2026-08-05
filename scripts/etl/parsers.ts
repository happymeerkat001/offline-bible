import { BOOKS } from '../lib/books';
import type { CanonicalVerse, TokenizedVerse, WordToken } from '../lib/types';

export interface CusVerse {
  verse?: number;
  text?: string;
}

export interface CusChapter {
  chapter?: number;
  verses?: CusVerse[];
}

export interface CusBook {
  chapters?: CusChapter[];
}

export interface BibleOrgVerse {
  bookname: string;
  chapter: string;
  verse: string;
  text: string;
}

const BOOK_IDS: Record<string, number> = {
  Genesis: 1,
  Exodus: 2,
  Leviticus: 3,
  Numbers: 4,
  Deuteronomy: 5,
  Joshua: 6,
  Judges: 7,
  Ruth: 8,
  '1 Samuel': 9,
  '2 Samuel': 10,
  '1 Kings': 11,
  '2 Kings': 12,
  '1 Chronicles': 13,
  '2 Chronicles': 14,
  Ezra: 15,
  Nehemiah: 16,
  Esther: 17,
  Job: 18,
  Psalms: 19,
  Proverbs: 20,
  Ecclesiastes: 21,
  'Song of Solomon': 22,
  'Song of Songs': 22,
  Isaiah: 23,
  Jeremiah: 24,
  Lamentations: 25,
  Ezekiel: 26,
  Daniel: 27,
  Hosea: 28,
  Joel: 29,
  Amos: 30,
  Obadiah: 31,
  Jonah: 32,
  Micah: 33,
  Nahum: 34,
  Habakkuk: 35,
  Zephaniah: 36,
  Haggai: 37,
  Zechariah: 38,
  Malachi: 39,
  Matthew: 40,
  Mark: 41,
  Luke: 42,
  John: 43,
  Acts: 44,
  Romans: 45,
  '1 Corinthians': 46,
  '2 Corinthians': 47,
  Galatians: 48,
  Ephesians: 49,
  Philippians: 50,
  Colossians: 51,
  '1 Thessalonians': 52,
  '2 Thessalonians': 53,
  '1 Timothy': 54,
  '2 Timothy': 55,
  Titus: 56,
  Philemon: 57,
  Hebrews: 58,
  James: 59,
  '1 Peter': 60,
  '2 Peter': 61,
  '1 John': 62,
  '2 John': 63,
  '3 John': 64,
  Jude: 65,
  Revelation: 66,
};

export function parseCusBook(
  bookId: number,
  source: CusBook
): CanonicalVerse[] {
  const verses: CanonicalVerse[] = [];

  source.chapters?.forEach((chapterData, chapterIndex) => {
    const chapter = chapterData.chapter ?? chapterIndex + 1;
    chapterData.verses?.forEach((verseData, verseIndex) => {
      verses.push({
        bookId,
        chapter,
        verse: verseData.verse ?? verseIndex + 1,
        text: verseData.text?.trim() ?? '',
      });
    });
  });

  return verses;
}

export async function parseNetVerses(
  source: BibleOrgVerse[],
  readNotes: (
    bookId: number,
    chapter: number
  ) => Promise<Record<string, string>>
): Promise<CanonicalVerse[]> {
  const byChapter = new Map<string, BibleOrgVerse[]>();
  for (const verse of source) {
    const bookId = BOOK_IDS[verse.bookname];
    if (!bookId) continue;
    const key = `${bookId}:${verse.chapter}`;
    const chapterVerses = byChapter.get(key) ?? [];
    chapterVerses.push(verse);
    byChapter.set(key, chapterVerses);
  }

  const output: CanonicalVerse[] = [];
  for (const [chapterKey, verses] of byChapter) {
    const [bookIdRaw, chapterRaw] = chapterKey.split(':');
    const bookId = Number(bookIdRaw);
    const chapter = Number(chapterRaw);
    let notesMap: Record<string, string> = {};
    try {
      notesMap = await readNotes(bookId, chapter);
    } catch {
      // A missing notes file must not prevent verse text generation.
    }

    let chapterNoteIndex = 0;
    for (const verse of verses) {
      const notes: string[] = [];
      const noteRegex = /<n\s+id="(\d+)"\s*\/>/g;
      while (noteRegex.exec(verse.text) !== null) {
        chapterNoteIndex += 1;
        const note = notesMap[String(chapterNoteIndex)];
        if (note) notes.push(note);
      }

      output.push({
        bookId,
        chapter,
        verse: Number(verse.verse),
        text: verse.text
          .replace(/<n\s+id="(\d+)"\s*\/>/g, '[NOTE:$1]')
          .replace(/<[^>]+>/g, '')
          .replace(/\s+/g, ' ')
          .trim(),
        ...(notes.length > 0 ? { notes } : {}),
      });
    }
  }

  return output;
}

function findColumnIndex(headers: string[], candidates: string[]): number {
  for (const name of candidates) {
    const index = headers.indexOf(name);
    if (index !== -1) return index;
  }
  return -1;
}

export function parseOpenGnt(raw: string): TokenizedVerse[] {
  const lines = raw.split(/\r?\n/).filter(Boolean);
  if (lines.length < 2) throw new Error('OpenGNT TSV is empty.');

  const headers = lines[0].split('\t').map((header) => header.trim());
  const refIndex = findColumnIndex(headers, ['ref']);
  const textIndex = findColumnIndex(headers, ['text', 'w']);
  const morphIndex = findColumnIndex(headers, ['morph']);
  const glossIndex = findColumnIndex(headers, ['gloss']);
  if (refIndex === -1 || textIndex === -1)
    throw new Error('Required TSV columns are missing: ref/text');

  const usfmToBookId = new Map(BOOKS.map((book) => [book.usfm, book.id]));
  const verses = new Map<string, TokenizedVerse>();
  const order: string[] = [];

  for (const line of lines.slice(1)) {
    const columns = line.split('\t');
    const reference = columns[refIndex]?.trim();
    const match = reference?.match(/^([1-3]?[A-Z]{2,3})\s+(\d+):(\d+)!\d+$/);
    if (!match) continue;

    const bookId = usfmToBookId.get(match[1]);
    if (!bookId || bookId < 40 || bookId > 66) continue;

    const word = (columns[textIndex] ?? '').trim();
    if (!word) continue;

    const token: WordToken = { w: word };
    const morph = morphIndex >= 0 ? (columns[morphIndex] ?? '').trim() : '';
    const gloss = glossIndex >= 0 ? (columns[glossIndex] ?? '').trim() : '';
    if (morph) token.morph = morph;
    if (gloss) token.gloss = gloss;

    const chapter = Number(match[2]);
    const verse = Number(match[3]);
    const key = `${bookId}:${chapter}:${verse}`;
    if (!verses.has(key)) {
      verses.set(key, { bookId, chapter, verse, tokens: [] });
      order.push(key);
    }
    verses.get(key)!.tokens.push(token);
  }

  return order.map((key) => verses.get(key)!);
}

function decodeEntities(text: string): string {
  return text
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

const OSIS_BOOK_IDS = new Map<string, number>([
  ['Gen', 1],
  ['Exod', 2],
  ['Lev', 3],
  ['Num', 4],
  ['Deut', 5],
  ['Josh', 6],
  ['Judg', 7],
  ['Ruth', 8],
  ['1Sam', 9],
  ['2Sam', 10],
  ['1Kgs', 11],
  ['2Kgs', 12],
  ['1Chr', 13],
  ['2Chr', 14],
  ['Ezra', 15],
  ['Neh', 16],
  ['Esth', 17],
  ['Job', 18],
  ['Ps', 19],
  ['Prov', 20],
  ['Eccl', 21],
  ['Song', 22],
  ['Isa', 23],
  ['Jer', 24],
  ['Lam', 25],
  ['Ezek', 26],
  ['Dan', 27],
  ['Hos', 28],
  ['Joel', 29],
  ['Amos', 30],
  ['Obad', 31],
  ['Jonah', 32],
  ['Mic', 33],
  ['Nah', 34],
  ['Hab', 35],
  ['Zeph', 36],
  ['Hag', 37],
  ['Zech', 38],
  ['Mal', 39],
]);

export function parseWlc(xml: string): TokenizedVerse[] {
  const verseRegex =
    /<verse\s+osisID="([A-Za-z0-9]+)\.(\d+)\.(\d+)"[^>]*>([\s\S]*?)<\/verse>/g;
  const output: TokenizedVerse[] = [];
  let verseMatch: RegExpExecArray | null;

  while ((verseMatch = verseRegex.exec(xml)) !== null) {
    const [, osisBook, chapterRaw, verseRaw, body] = verseMatch;
    const bookId = OSIS_BOOK_IDS.get(osisBook);
    if (!bookId) continue;

    const tokens: WordToken[] = [];
    const wordRegex = /<w\b([^>]*)>([\s\S]*?)<\/w>/g;
    let wordMatch: RegExpExecArray | null;
    while ((wordMatch = wordRegex.exec(body)) !== null) {
      const rawWord = decodeEntities(
        (wordMatch[2] ?? '').replace(/<[^>]+>/g, '').trim()
      );
      if (!rawWord) continue;

      const token: WordToken = { w: rawWord.replace(/\//g, '') };
      const morph = (wordMatch[1] ?? '').match(/\bmorph="([^"]+)"/)?.[1];
      if (morph) token.morph = morph;
      tokens.push(token);
    }

    output.push({
      bookId,
      chapter: Number(chapterRaw),
      verse: Number(verseRaw),
      tokens,
    });
  }

  return output;
}
