import { registerSW } from 'virtual:pwa-register';
import { fetchChapter, fetchIndex, FetchError } from './api/bible';
import { renderChapter, renderError, renderLoading } from './components/ChapterView';
import { mountNavBar } from './components/NavBar';
import { startRouter, type RouteRef } from './router';
import { loadLastRead, saveLastRead } from './state';
import type { BookMeta } from './types';
import './styles/base.css';
import './styles/verse.css';
import './styles/rtl.css';
import './styles/dark.css';

const main = document.querySelector<HTMLElement>('#main');
const nav = document.querySelector<HTMLElement>('#app-nav');

if (!main || !nav) {
  throw new Error('App shell is missing required mount points.');
}

registerSW({
  onNeedRefresh() {
    const banner = document.createElement('button');
    banner.type = 'button';
    banner.textContent = 'Update available - Reload';
    banner.className = 'update-toast';
    banner.addEventListener('click', () => window.location.reload());
    document.body.append(banner);
  }
});

const index = await fetchIndex();
const booksByUsfm = new Map(index.books.map((book) => [book.usfm, book]));
const fallback = loadLastRead() ?? { usfm: 'GEN', chapter: 1 };

startRouter(async (route) => {
  await onRoute(route, index.books, booksByUsfm, main, nav);
}, fallback);

async function onRoute(
  route: RouteRef,
  books: BookMeta[],
  booksByUsfm: Map<string, BookMeta>,
  container: HTMLElement,
  navNode: HTMLElement
): Promise<void> {
  const currentBook = booksByUsfm.get(route.usfm) ?? books[0];
  const chapter = Math.min(Math.max(route.chapter, 1), currentBook.chapters);

  mountNavBar(navNode, books, { usfm: currentBook.usfm, chapter });
  renderLoading(container, `${currentBook.name_en} ${chapter}`);

  try {
    const data = await fetchChapter(currentBook.id, chapter);
    renderChapter(container, data);
    saveLastRead({ usfm: currentBook.usfm, chapter });
  } catch (error) {
    const msg =
      error instanceof FetchError
        ? `Unable to load chapter (status ${error.status ?? 'unknown'}).`
        : 'Unable to load chapter.';
    renderError(container, msg);
  }
}
