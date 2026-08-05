import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import {
  parseCusBook,
  parseNetVerses,
  parseOpenGnt,
  parseWlc,
  type BibleOrgVerse,
  type CusBook,
} from '../scripts/etl/parsers';

function fixturePath(filename: string): string {
  return fileURLToPath(new URL(`./fixtures/etl/${filename}`, import.meta.url));
}

async function readJsonFixture<T>(filename: string): Promise<T> {
  return JSON.parse(await readFile(fixturePath(filename), 'utf8')) as T;
}

describe('ETL parsers', () => {
  it('matches the CUS golden output', async () => {
    expect(
      parseCusBook(1, await readJsonFixture<CusBook>('cuv.input.json'))
    ).toEqual(await readJsonFixture('cuv.expected.json'));
  });

  it('matches the NET golden output and loads chapter-local notes', async () => {
    const verses = await parseNetVerses(
      await readJsonFixture<BibleOrgVerse[]>('net.input.json'),
      async (bookId, chapter) => {
        expect([bookId, chapter]).toEqual([43, 1]);
        return { '1': 'A NET note.' };
      }
    );

    expect(verses).toEqual(await readJsonFixture('net.expected.json'));
  });

  it('matches the OpenGNT golden output', async () => {
    expect(
      parseOpenGnt(await readFile(fixturePath('opengnt.input.tsv'), 'utf8'))
    ).toEqual(await readJsonFixture('opengnt.expected.json'));
  });

  it('matches the WLC golden output', async () => {
    expect(
      parseWlc(await readFile(fixturePath('wlc.input.xml'), 'utf8'))
    ).toEqual(await readJsonFixture('wlc.expected.json'));
  });
});
