import type { BookMeta } from '../types';
import { setRoute } from '../router';

export function mountNavBar(
  node: HTMLElement,
  books: BookMeta[],
  current: { usfm: string; chapter: number }
): void {
  node.innerHTML = '';
  node.className = 'app-nav';

  const select = document.createElement('select');
  select.className = 'nav-select';
  books.forEach((book) => {
    const option = document.createElement('option');
    option.value = book.usfm;
    option.textContent = `${book.name_zh} ${book.name_en}`;
    option.selected = book.usfm === current.usfm;
    select.append(option);
  });

  const prev = document.createElement('button');
  prev.type = 'button';
  prev.textContent = 'Prev';
  prev.className = 'nav-button';

  const next = document.createElement('button');
  next.type = 'button';
  next.textContent = 'Next';
  next.className = 'nav-button';
  const currentBook = books.find((b) => b.usfm === current.usfm);

  const themeBtn = document.createElement('button');
  themeBtn.type = 'button';
  themeBtn.setAttribute('aria-label', 'Toggle dark mode');
  themeBtn.className = 'nav-button theme-toggle';
  const isDark = () => document.documentElement.getAttribute('data-theme') === 'dark';
  themeBtn.textContent = isDark() ? '☀️' : '🌙';

  themeBtn.addEventListener('click', () => {
    const next_theme = isDark() ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next_theme);
    localStorage.setItem('theme', next_theme);
    themeBtn.textContent = next_theme === 'dark' ? '☀️' : '🌙';
  });

  select.addEventListener('change', () => setRoute(select.value, 1));
  prev.addEventListener('click', () => setRoute(current.usfm, Math.max(1, current.chapter - 1)));
  next.addEventListener('click', () =>
    setRoute(current.usfm, Math.min(currentBook?.chapters ?? 1, current.chapter + 1))
  );

  const controls = document.createElement('div');
  controls.className = 'nav-controls';
  controls.append(select, prev, next, themeBtn);

  const chapterStrip = document.createElement('div');
  chapterStrip.className = 'chapter-strip';
  chapterStrip.setAttribute('role', 'group');
  chapterStrip.setAttribute('aria-label', `${currentBook?.name_en ?? current.usfm} chapters`);

  const totalChapters = currentBook?.chapters ?? 1;
  for (let chapterNumber = 1; chapterNumber <= totalChapters; chapterNumber += 1) {
    const chapterBtn = document.createElement('button');
    chapterBtn.type = 'button';
    chapterBtn.className = 'chapter-button';
    chapterBtn.textContent = String(chapterNumber);
    chapterBtn.setAttribute('aria-label', `Go to chapter ${chapterNumber}`);
    if (chapterNumber === current.chapter) {
      chapterBtn.classList.add('is-active');
      chapterBtn.setAttribute('aria-current', 'page');
    }
    chapterBtn.addEventListener('click', () => setRoute(current.usfm, chapterNumber));
    chapterStrip.append(chapterBtn);
  }

  node.append(controls, chapterStrip);

  const activeChapter = chapterStrip.querySelector<HTMLElement>('.chapter-button.is-active');
  activeChapter?.scrollIntoView({ inline: 'center', block: 'nearest' });
}
