import { registerSW } from 'virtual:pwa-register'; // run virtual module to register the service worker for PWA functionality, enabling offline support and caching of assets and API responses
import { fetchChapter, fetchIndex, FetchError } from './api/bible'; // knowledge of API module for fetching Bible data
import { renderChapter, renderError, renderLoading } from './components/ChapterView'; //knowledge of ChapterView component for rendering chapter content and handling loading/error states
import { mountNavBar } from './components/NavBar'; //knowledge of NavBar component for rendering the navigation bar with book and chapter links
import { startRouter, type RouteRef } from './router'; //knowledge of router module for handling client-side routing based on URL changes
import { loadLastRead, saveLastRead } from './state'; // knowledge of state module for persisting and retrieving the last read book and chapter from local storage or similar persistence mechanism
import type { BookMeta } from './types'; // knowledge of types module for defining the structure of book metadata used throughout the app
import './styles/base.css'; // knowledge of base CSS for global styles and resets
import './styles/verse.css'; // knowledge of verse CSS for styling individual verses in the chapter view
import './styles/rtl.css'; // knowledge of RTL CSS for handling right-to-left text direction for languages that require it
import './styles/dark.css'; // knowledge of dark CSS for providing a dark theme option for the app

const main = document.querySelector<HTMLElement>('#main');
const nav = document.querySelector<HTMLElement>('#app-nav');

if (!main || !nav) {
  throw new Error('App shell is missing required mount points.');
}

(async () => {
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
})();

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
