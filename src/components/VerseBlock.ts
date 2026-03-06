import type { VerseData } from '../types';

export function renderVerseBlock(verse: VerseData): HTMLElement {
  const article = document.createElement('article');
  article.className = 'verse';

  const label = document.createElement('h3');
  label.className = 'verse-num';
  label.textContent = String(verse.v);
  article.append(label);

  const zh = document.createElement('p');
  zh.className = 'verse-zh';
  zh.lang = 'zh-Hans';
  zh.textContent = verse.zh;
  article.append(zh);

  const en = document.createElement('p');
  en.className = 'verse-en';
  en.lang = 'en';
  en.textContent = verse.en;

  if (verse.notes && verse.notes.length > 0) {
    const dialog = document.createElement('dialog');
    const noteText = document.createElement('p');
    const close = document.createElement('button');
    close.type = 'button';
    close.textContent = 'Close';
    close.addEventListener('click', () => dialog.close());
    dialog.append(noteText, close);

    verse.notes.forEach((note, idx) => {
      const sup = document.createElement('sup');
      const trigger = document.createElement('button');
      trigger.type = 'button';
      trigger.textContent = String(idx + 1);
      trigger.setAttribute('aria-label', `Open note ${idx + 1}`);
      trigger.addEventListener('click', () => {
        noteText.textContent = note;
        dialog.showModal();
      });
      sup.append(trigger);
      en.append(document.createTextNode(' '), sup);
    });

    article.append(dialog);
  }

  article.append(en);

  if (verse.he) {
    const he = document.createElement('p');
    he.className = 'verse-he';
    he.lang = 'he';
    he.dir = 'rtl';
    he.textContent = verse.he;
    article.append(he);
  }

  if (verse.gr) {
    const gr = document.createElement('p');
    gr.className = 'verse-gr';
    gr.lang = 'grc';
    gr.textContent = verse.gr;
    article.append(gr);
  }

  return article;
}
