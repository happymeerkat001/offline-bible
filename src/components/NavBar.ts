import type { BookMeta } from '../types';
import { setRoute } from '../router';

export function mountNavBar(
  node: HTMLElement,
  books: BookMeta[],
  current: { usfm: string; chapter: number }
): void {
  node.innerHTML = '';

  const select = document.createElement('select');
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

  const next = document.createElement('button');
  next.type = 'button';
  next.textContent = 'Next';
  const currentBook = books.find((b) => b.usfm === current.usfm);

  const themeBtn = document.createElement('button');
  themeBtn.type = 'button';
  themeBtn.setAttribute('aria-label', 'Toggle dark mode');
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

  node.append(select, prev, next, themeBtn);
}
