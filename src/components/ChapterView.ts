import type { ChapterData } from '../types';
import { renderVerseBlock } from './VerseBlock';

export function renderChapter(container: HTMLElement, data: ChapterData): void {
  container.innerHTML = '';
  const section = document.createElement('section');
  section.className = 'chapter';

  const header = document.createElement('h2');
  header.textContent = `Chapter ${data.chapter}`;
  section.append(header);

  data.verses.forEach((verse) => {
    section.append(renderVerseBlock(verse));
  });

  container.append(section);
  window.scrollTo({ top: 0, behavior: 'auto' });
}

export function renderLoading(container: HTMLElement, label: string): void {
  container.innerHTML = `<p class="loading">Loading ${label}...</p>`;
}

export function renderError(container: HTMLElement, message: string): void {
  container.innerHTML = `<p class="error">${message}</p>`;
}
