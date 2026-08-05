import path from 'node:path';
import { mkdir, writeFile } from 'node:fs/promises';
import { BOOKS } from '../lib/books';

const ROOT = path.resolve(import.meta.dirname, '../..');
const notesRoot = path.join(ROOT, 'scripts/raw/net_notes');

function parseNotesHtml(html: string): Record<string, string> {
  const result: Record<string, string> = {};
  const parts = html.split('<div class="note">').slice(1);

  for (const part of parts) {
    const idMatch = /id="note_(\d+)"/.exec(part);
    if (!idMatch) continue;

    const bodyMatch = /class="notetype">[^<]+<\/span>([\s\S]*?)<\/div>/.exec(
      part
    );
    if (!bodyMatch) continue;

    const text = bodyMatch[1]
      .replace(/<[^>]+>/g, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    if (text) {
      result[idMatch[1]] = text;
    }
  }

  return result;
}

const tasks: Array<{ bookId: number; bookName: string; chapter: number }> = [];
for (const book of BOOKS) {
  for (let ch = 1; ch <= book.chapters; ch += 1) {
    tasks.push({ bookId: book.id, bookName: book.name_en, chapter: ch });
  }
}

const BATCH_SIZE = 8;
for (let i = 0; i < tasks.length; i += BATCH_SIZE) {
  const batch = tasks.slice(i, i + BATCH_SIZE);
  await Promise.all(
    batch.map(async ({ bookId, bookName, chapter }) => {
      const passage = encodeURIComponent(`${bookName} ${chapter}`);
      const url = `https://netbible.org/resource/netNotes/${passage}?bible1Translation=net_strongs2`;
      const res = await fetch(url);
      if (!res.ok)
        throw new Error(`HTTP ${res.status} for ${bookName} ${chapter}`);

      const html = await res.text();
      const notes = parseNotesHtml(html);
      const dir = path.join(notesRoot, String(bookId));
      await mkdir(dir, { recursive: true });
      await writeFile(path.join(dir, `${chapter}.json`), JSON.stringify(notes));
    })
  );

  process.stdout.write(
    `\r  ${Math.min(i + BATCH_SIZE, tasks.length)}/${tasks.length} chapters`
  );
}

process.stdout.write('\n');
console.log('net notes fetched');
