import path from 'node:path';
import { mkdir, writeFile } from 'node:fs/promises';
import { BOOKS } from '../lib/books';

const ROOT = path.resolve(import.meta.dirname, '../..');
const outputRoot = path.join(ROOT, 'scripts/raw/fbc');

type TestamentDir = 'old_testament_studies' | 'new_testament_studies';

interface VolumeRange {
  vol: string;
  startChapter: number;
  endChapter: number;
}

interface BookPageRange {
  startChapter: number;
  endChapter: number;
  url: string;
}

const FBC_VOLUME_MAP: Record<
  number,
  { testament: TestamentDir; ranges: VolumeRange[] }
> = {
  1: {
    testament: 'old_testament_studies',
    ranges: [
      { vol: 'VOL01AOT', startChapter: 1, endChapter: 11 },
      { vol: 'VOL01BOT', startChapter: 12, endChapter: 50 },
    ],
  },
  2: {
    testament: 'old_testament_studies',
    ranges: [{ vol: 'VOL02OT', startChapter: 1, endChapter: 40 }],
  },
  3: {
    testament: 'old_testament_studies',
    ranges: [{ vol: 'VOL02BOT', startChapter: 1, endChapter: 27 }],
  },
  4: {
    testament: 'old_testament_studies',
    ranges: [{ vol: 'VOL02COT', startChapter: 1, endChapter: 36 }],
  },
  5: {
    testament: 'old_testament_studies',
    ranges: [{ vol: 'VOL03OT', startChapter: 1, endChapter: 34 }],
  },
  6: {
    testament: 'old_testament_studies',
    ranges: [{ vol: 'VOL04OT', startChapter: 1, endChapter: 24 }],
  },
  7: {
    testament: 'old_testament_studies',
    ranges: [{ vol: 'VOL04BOT', startChapter: 1, endChapter: 21 }],
  },
  8: {
    testament: 'old_testament_studies',
    ranges: [{ vol: 'VOL04BOT', startChapter: 1, endChapter: 4 }],
  },
  9: {
    testament: 'old_testament_studies',
    ranges: [{ vol: 'VOL05AOT', startChapter: 1, endChapter: 31 }],
  },
  10: {
    testament: 'old_testament_studies',
    ranges: [{ vol: 'VOL05BOT', startChapter: 1, endChapter: 24 }],
  },
  11: {
    testament: 'old_testament_studies',
    ranges: [{ vol: 'VOL06AOT', startChapter: 1, endChapter: 22 }],
  },
  12: {
    testament: 'old_testament_studies',
    ranges: [{ vol: 'VOL06BOT', startChapter: 1, endChapter: 25 }],
  },
  13: {
    testament: 'old_testament_studies',
    ranges: [{ vol: 'VOL07OT', startChapter: 1, endChapter: 29 }],
  },
  14: {
    testament: 'old_testament_studies',
    ranges: [{ vol: 'VOL07BOT', startChapter: 1, endChapter: 36 }],
  },
  15: {
    testament: 'old_testament_studies',
    ranges: [{ vol: 'VOL08OT', startChapter: 1, endChapter: 10 }],
  },
  16: {
    testament: 'old_testament_studies',
    ranges: [{ vol: 'VOL08OT', startChapter: 1, endChapter: 13 }],
  },
  17: {
    testament: 'old_testament_studies',
    ranges: [{ vol: 'VOL08OT', startChapter: 1, endChapter: 10 }],
  },
  18: {
    testament: 'old_testament_studies',
    ranges: [{ vol: 'VOL09AOT', startChapter: 1, endChapter: 42 }],
  },
  19: {
    testament: 'old_testament_studies',
    ranges: [{ vol: 'VOL09BOT', startChapter: 1, endChapter: 150 }],
  },
  20: {
    testament: 'old_testament_studies',
    ranges: [{ vol: 'VOL09COT', startChapter: 1, endChapter: 31 }],
  },
  21: {
    testament: 'old_testament_studies',
    ranges: [{ vol: 'VOL09DOT', startChapter: 1, endChapter: 12 }],
  },
  22: {
    testament: 'old_testament_studies',
    ranges: [{ vol: 'VOL09DOT', startChapter: 1, endChapter: 8 }],
  },
  23: {
    testament: 'old_testament_studies',
    ranges: [
      { vol: 'VOL11AOT', startChapter: 1, endChapter: 39 },
      { vol: 'VOL11BOT', startChapter: 40, endChapter: 66 },
    ],
  },
  24: {
    testament: 'old_testament_studies',
    ranges: [{ vol: 'VOL13AOT', startChapter: 1, endChapter: 52 }],
  },
  25: {
    testament: 'old_testament_studies',
    ranges: [{ vol: 'VOL10BOT', startChapter: 1, endChapter: 5 }],
  },
  26: {
    testament: 'old_testament_studies',
    ranges: [{ vol: 'VOL13BOT', startChapter: 1, endChapter: 48 }],
  },
  27: {
    testament: 'old_testament_studies',
    ranges: [{ vol: 'VOL14OT', startChapter: 1, endChapter: 12 }],
  },
  28: {
    testament: 'old_testament_studies',
    ranges: [{ vol: 'VOL10OT', startChapter: 1, endChapter: 14 }],
  },
  29: {
    testament: 'old_testament_studies',
    ranges: [{ vol: 'VOL12OT', startChapter: 1, endChapter: 3 }],
  },
  30: {
    testament: 'old_testament_studies',
    ranges: [{ vol: 'VOL10OT', startChapter: 1, endChapter: 9 }],
  },
  31: {
    testament: 'old_testament_studies',
    ranges: [{ vol: 'VOL12OT', startChapter: 1, endChapter: 1 }],
  },
  32: {
    testament: 'old_testament_studies',
    ranges: [{ vol: 'VOL10OT', startChapter: 1, endChapter: 4 }],
  },
  33: {
    testament: 'old_testament_studies',
    ranges: [{ vol: 'VOL10OT', startChapter: 1, endChapter: 7 }],
  },
  34: {
    testament: 'old_testament_studies',
    ranges: [{ vol: 'VOL10BOT', startChapter: 1, endChapter: 3 }],
  },
  35: {
    testament: 'old_testament_studies',
    ranges: [{ vol: 'VOL10BOT', startChapter: 1, endChapter: 3 }],
  },
  36: {
    testament: 'old_testament_studies',
    ranges: [{ vol: 'VOL10BOT', startChapter: 1, endChapter: 3 }],
  },
  37: {
    testament: 'old_testament_studies',
    ranges: [{ vol: 'VOL12OT', startChapter: 1, endChapter: 2 }],
  },
  38: {
    testament: 'old_testament_studies',
    ranges: [{ vol: 'VOL14OT', startChapter: 1, endChapter: 14 }],
  },
  39: {
    testament: 'old_testament_studies',
    ranges: [{ vol: 'VOL12OT', startChapter: 1, endChapter: 4 }],
  },
  40: {
    testament: 'new_testament_studies',
    ranges: [{ vol: 'VOL01', startChapter: 1, endChapter: 28 }],
  },
  41: {
    testament: 'new_testament_studies',
    ranges: [{ vol: 'VOL02', startChapter: 1, endChapter: 16 }],
  },
  42: {
    testament: 'new_testament_studies',
    ranges: [{ vol: 'VOL03A', startChapter: 1, endChapter: 24 }],
  },
  43: {
    testament: 'new_testament_studies',
    ranges: [{ vol: 'VOL04', startChapter: 1, endChapter: 21 }],
  },
  44: {
    testament: 'new_testament_studies',
    ranges: [{ vol: 'VOL03B', startChapter: 1, endChapter: 28 }],
  },
  45: {
    testament: 'new_testament_studies',
    ranges: [{ vol: 'VOL05', startChapter: 1, endChapter: 16 }],
  },
  46: {
    testament: 'new_testament_studies',
    ranges: [{ vol: 'VOL06', startChapter: 1, endChapter: 16 }],
  },
  47: {
    testament: 'new_testament_studies',
    ranges: [{ vol: 'VOL06', startChapter: 1, endChapter: 13 }],
  },
  48: {
    testament: 'new_testament_studies',
    ranges: [{ vol: 'VOL07', startChapter: 1, endChapter: 6 }],
  },
  49: {
    testament: 'new_testament_studies',
    ranges: [{ vol: 'VOL08', startChapter: 1, endChapter: 6 }],
  },
  50: {
    testament: 'new_testament_studies',
    ranges: [{ vol: 'VOL08', startChapter: 1, endChapter: 4 }],
  },
  51: {
    testament: 'new_testament_studies',
    ranges: [{ vol: 'VOL08', startChapter: 1, endChapter: 4 }],
  },
  52: {
    testament: 'new_testament_studies',
    ranges: [{ vol: 'VOL07', startChapter: 1, endChapter: 5 }],
  },
  53: {
    testament: 'new_testament_studies',
    ranges: [{ vol: 'VOL07', startChapter: 1, endChapter: 3 }],
  },
  54: {
    testament: 'new_testament_studies',
    ranges: [{ vol: 'VOL09', startChapter: 1, endChapter: 6 }],
  },
  55: {
    testament: 'new_testament_studies',
    ranges: [{ vol: 'VOL09', startChapter: 1, endChapter: 4 }],
  },
  56: {
    testament: 'new_testament_studies',
    ranges: [{ vol: 'VOL09', startChapter: 1, endChapter: 3 }],
  },
  57: {
    testament: 'new_testament_studies',
    ranges: [{ vol: 'VOL08', startChapter: 1, endChapter: 1 }],
  },
  58: {
    testament: 'new_testament_studies',
    ranges: [{ vol: 'VOL10', startChapter: 1, endChapter: 13 }],
  },
  59: {
    testament: 'new_testament_studies',
    ranges: [{ vol: 'VOL11', startChapter: 1, endChapter: 5 }],
  },
  60: {
    testament: 'new_testament_studies',
    ranges: [{ vol: 'VOL02', startChapter: 1, endChapter: 5 }],
  },
  61: {
    testament: 'new_testament_studies',
    ranges: [{ vol: 'VOL02', startChapter: 1, endChapter: 3 }],
  },
  62: {
    testament: 'new_testament_studies',
    ranges: [{ vol: 'VOL04', startChapter: 1, endChapter: 5 }],
  },
  63: {
    testament: 'new_testament_studies',
    ranges: [{ vol: 'VOL04', startChapter: 1, endChapter: 1 }],
  },
  64: {
    testament: 'new_testament_studies',
    ranges: [{ vol: 'VOL04', startChapter: 1, endChapter: 1 }],
  },
  65: {
    testament: 'new_testament_studies',
    ranges: [{ vol: 'VOL11', startChapter: 1, endChapter: 1 }],
  },
  66: {
    testament: 'new_testament_studies',
    ranges: [{ vol: 'VOL12', startChapter: 1, endChapter: 22 }],
  },
};

const BOOK_ALIASES: Record<number, string[]> = {
  19: ['Psalms', 'Psalm'],
  22: ['Song of Songs', 'Song of Solomon'],
  57: ['Philemon', 'Phm'],
  63: ['2 John', 'II John'],
  64: ['3 John', 'III John'],
};

const tocCache = new Map<string, Promise<string>>();

function decodeHtmlEntities(input: string): string {
  return input
    .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)))
    .replace(/&#x([0-9a-f]+);/gi, (_, code) =>
      String.fromCodePoint(Number.parseInt(code, 16))
    )
    .replace(/&nbsp;/gi, ' ')
    .replace(/&ensp;/gi, ' ')
    .replace(/&emsp;/gi, ' ')
    .replace(/&thinsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&mdash;/gi, '-')
    .replace(/&ndash;/gi, '-')
    .replace(/&quot;/gi, '"')
    .replace(/&apos;/gi, "'")
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>');
}

function stripTags(input: string): string {
  return decodeHtmlEntities(input.replace(/<[^>]+>/g, ''))
    .replace(/\s+/g, ' ')
    .trim();
}

function escapeRegex(input: string): string {
  return input.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function extractCommentaryText(html: string): string {
  const body = /<body[^>]*>([\s\S]*?)<\/body>/i.exec(html)?.[1] ?? html;
  const withBreaks = body
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(
      /<\/(p|div|h1|h2|h3|h4|h5|h6|table|tr|section|article|blockquote|pre)>/gi,
      '\n'
    )
    .replace(/<li\b[^>]*>/gi, '\n- ')
    .replace(/<\/(ul|ol|li)>/gi, '\n')
    .replace(/<[^>]+>/g, '');

  const lines = decodeHtmlEntities(withBreaks)
    .replace(/\r/g, '')
    .split('\n')
    .map((line) => line.replace(/[ \t]+/g, ' ').trim())
    .filter(
      (line, index, all) =>
        line.length > 0 || (index > 0 && all[index - 1].length > 0)
    );

  const start = lines.findIndex((line) =>
    /PARAGRAPH DIVISIONS OF MODERN TRANSLATION/i.test(line)
  );
  const titleIndex = lines.findIndex(
    (line) => /^[A-Z0-9 ,.'":;()/-]+$/.test(line) && /\d/.test(line)
  );
  const startIndex =
    start >= 0
      ? start
      : titleIndex >= 0
        ? Math.min(titleIndex + 1, lines.length)
        : 0;
  const trailingLines = lines.slice(startIndex);
  const endOffset = trailingLines.findIndex(
    (line) =>
      line.startsWith('|') ||
      line.startsWith('Copyright ') ||
      line === 'Bible Lessons International'
  );
  const endIndex = endOffset >= 0 ? startIndex + endOffset : lines.length;

  const relevant = lines.slice(startIndex, endIndex);
  return relevant.join('\n').trim();
}

function resolveVolume(
  bookId: number,
  chapter: number
): { testament: TestamentDir; vol: string } {
  const mapping = FBC_VOLUME_MAP[bookId];
  if (!mapping) {
    throw new Error(`Missing FBC volume mapping for book ${bookId}`);
  }

  const range = mapping.ranges.find(
    ({ startChapter, endChapter }) =>
      chapter >= startChapter && chapter <= endChapter
  );
  if (!range) {
    throw new Error(
      `No FBC volume range for book ${bookId} chapter ${chapter}`
    );
  }

  return { testament: mapping.testament, vol: range.vol };
}

async function fetchToc(testament: TestamentDir, vol: string): Promise<string> {
  const key = `${testament}:${vol}`;
  if (!tocCache.has(key)) {
    tocCache.set(
      key,
      (async () => {
        const url = `https://www.freebiblecommentary.org/${testament}/${vol}/${vol}.html`;
        const res = await fetch(url);
        if (!res.ok) {
          throw new Error(`HTTP ${res.status} for TOC ${url}`);
        }
        return res.text();
      })()
    );
  }

  return tocCache.get(key)!;
}

function parseBookPageRanges(
  tocHtml: string,
  bookId: number,
  maxChapter: number
): Array<{ startChapter: number; endChapter: number; href: string }> {
  const aliases = BOOK_ALIASES[bookId] ?? [
    BOOKS.find((book) => book.id === bookId)!.name_en,
  ];
  const anchorRegex = /<a\b[^>]*href\s*=\s*"([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi;
  const ranges: Array<{
    startChapter: number;
    endChapter: number;
    href: string;
  }> = [];

  let match: RegExpExecArray | null;
  while ((match = anchorRegex.exec(tocHtml)) !== null) {
    const href = match[1];
    const label = stripTags(match[2]);
    if (!href || !label || /^Introduction\b/i.test(label)) continue;

    for (const alias of aliases) {
      if (maxChapter === 1) {
        const containsAlias = new RegExp(
          `\\b${escapeRegex(alias)}\\b`,
          'i'
        ).test(label);
        if (containsAlias) {
          ranges.push({ startChapter: 1, endChapter: 1, href });
          break;
        }
      }

      const aliasRegex = new RegExp(`^${escapeRegex(alias)}(?:\\s+|$)`, 'i');
      if (!aliasRegex.test(label)) continue;

      const remainder = label.replace(aliasRegex, '').trim();
      if (maxChapter === 1 && remainder.length === 0) {
        ranges.push({ startChapter: 1, endChapter: 1, href });
        break;
      }

      const chapterMatch =
        /^(\d+)(?::[\d:-]+)?(?:\s*-\s*(\d+)(?::[\d:-]+)?)?$/.exec(remainder);
      if (chapterMatch) {
        const startChapter = Number(chapterMatch[1]);
        const endChapter = Number(chapterMatch[2] ?? chapterMatch[1]);
        ranges.push({ startChapter, endChapter, href });
      }
      break;
    }
  }

  return ranges;
}

async function resolveBookPages(
  bookId: number,
  maxChapter: number
): Promise<BookPageRange[]> {
  const mapping = FBC_VOLUME_MAP[bookId];
  if (!mapping) {
    throw new Error(`Missing FBC volume mapping for book ${bookId}`);
  }

  const pages: BookPageRange[] = [];
  for (const range of mapping.ranges) {
    const tocHtml = await fetchToc(mapping.testament, range.vol);
    const tocRanges = parseBookPageRanges(tocHtml, bookId, maxChapter);
    const relevantRanges = tocRanges.filter(
      (entry) =>
        entry.endChapter >= range.startChapter &&
        entry.startChapter <= range.endChapter
    );

    if (relevantRanges.length === 0) continue;

    for (const entry of relevantRanges) {
      pages.push({
        startChapter: Math.max(entry.startChapter, range.startChapter),
        endChapter: Math.min(entry.endChapter, range.endChapter),
        url: new URL(
          entry.href,
          `https://www.freebiblecommentary.org/${mapping.testament}/${range.vol}/${range.vol}.html`
        ).toString(),
      });
    }
  }

  return pages;
}

const tasks: Array<{ bookId: number; chapter: number; url: string }> = [];
for (const book of BOOKS) {
  const pages = await resolveBookPages(book.id, book.chapters);
  for (let chapter = 1; chapter <= book.chapters; chapter += 1) {
    const page = pages.find(
      ({ startChapter, endChapter }) =>
        chapter >= startChapter && chapter <= endChapter
    );
    if (!page) {
      const { testament, vol } = resolveVolume(book.id, chapter);
      const chapterPadded = String(chapter).padStart(2, '0');
      tasks.push({
        bookId: book.id,
        chapter,
        url: `https://www.freebiblecommentary.org/${testament}/${vol}/${vol}_${chapterPadded}.html`,
      });
      continue;
    }

    tasks.push({ bookId: book.id, chapter, url: page.url });
  }
}

const BATCH_SIZE = 4;
for (let i = 0; i < tasks.length; i += BATCH_SIZE) {
  const batch = tasks.slice(i, i + BATCH_SIZE);
  await Promise.all(
    batch.map(async ({ bookId, chapter, url }) => {
      const res = await fetch(url);
      if (!res.ok) {
        if (res.status === 404) {
          console.warn(
            `missing FBC page for book ${bookId} chapter ${chapter}: ${url}`
          );
          return;
        }
        throw new Error(`HTTP ${res.status} for ${url}`);
      }

      const html = await res.text();
      const commentary = extractCommentaryText(html);
      if (!commentary) {
        console.warn(
          `empty FBC commentary for book ${bookId} chapter ${chapter}: ${url}`
        );
        return;
      }

      const dir = path.join(outputRoot, String(bookId));
      await mkdir(dir, { recursive: true });
      await writeFile(
        path.join(dir, `${chapter}.txt`),
        commentary + '\n',
        'utf8'
      );
    })
  );

  process.stdout.write(
    `\r  ${Math.min(i + BATCH_SIZE, tasks.length)}/${tasks.length} chapters`
  );
}

process.stdout.write('\n');
console.log('freebiblecommentary fetched');
