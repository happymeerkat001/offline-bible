import type { VerseData } from '../types';

let openPopup: HTMLDivElement | null = null;
let openWord: HTMLSpanElement | null = null;
let outsideListenerBound = false;

function closeMorphPopup(): void {
  openPopup?.remove();
  openPopup = null;
  openWord = null;
}

function bindOutsideClickListener(): void {
  if (outsideListenerBound) return;
  document.addEventListener('click', (event) => {
    const target = event.target as Element | null;
    if (!target) return;
    if (target.closest('.word-token') || target.closest('.morph-popup')) return;
    closeMorphPopup();
  });
  outsideListenerBound = true;
}

function expandGreekMorph(code: string): string {
  const posMap: Record<string, string> = {
    N: 'noun',
    V: 'verb',
    A: 'adjective',
    P: 'pronoun',
    D: 'adverb',
    C: 'conjunction',
    R: 'preposition',
    T: 'article'
  };
  const caseMap: Record<string, string> = { N: 'nominative', G: 'genitive', D: 'dative', A: 'accusative', V: 'vocative' };
  const numberMap: Record<string, string> = { S: 'singular', P: 'plural' };
  const genderMap: Record<string, string> = { M: 'masculine', F: 'feminine', N: 'neuter' };
  const tenseMap: Record<string, string> = { P: 'present', I: 'imperfect', F: 'future', A: 'aorist', R: 'perfect', L: 'pluperfect' };
  const voiceMap: Record<string, string> = { A: 'active', M: 'middle', P: 'passive', E: 'middle/passive' };
  const moodMap: Record<string, string> = { I: 'indicative', S: 'subjunctive', O: 'optative', M: 'imperative', N: 'infinitive', P: 'participle' };

  const parts = code.split('-');
  const out: string[] = [];
  if (parts[0]?.[0] && posMap[parts[0][0]]) out.push(posMap[parts[0][0]]);

  if (parts[0] === 'V' && parts[1]) {
    const tvm = parts[1];
    if (tenseMap[tvm[0]]) out.push(tenseMap[tvm[0]]);
    if (voiceMap[tvm[1]]) out.push(voiceMap[tvm[1]]);
    if (moodMap[tvm[2]]) out.push(moodMap[tvm[2]]);
    if (parts[2]) {
      if (caseMap[parts[2][0]]) out.push(caseMap[parts[2][0]]);
      if (numberMap[parts[2][1]]) out.push(numberMap[parts[2][1]]);
      if (genderMap[parts[2][2]]) out.push(genderMap[parts[2][2]]);
    }
  } else if (parts[1]) {
    if (caseMap[parts[1][0]]) out.push(caseMap[parts[1][0]]);
    if (numberMap[parts[1][1]]) out.push(numberMap[parts[1][1]]);
    if (genderMap[parts[1][2]]) out.push(genderMap[parts[1][2]]);
  }

  return out.length ? out.join(' · ') : code;
}

function expandHebrewMorph(code: string): string {
  const stemMap: Record<string, string> = {
    q: 'qal',
    N: 'niphal',
    p: 'piel',
    P: 'pual',
    h: 'hiphil',
    H: 'hophal',
    t: 'hithpael'
  };
  const aspectMap: Record<string, string> = {
    p: 'perfect',
    q: 'sequential perfect',
    i: 'imperfect',
    w: 'sequential imperfect',
    r: 'active participle',
    s: 'participle passive',
    a: 'infinitive absolute',
    c: 'infinitive construct'
  };
  const personMap: Record<string, string> = { '1': '1st', '2': '2nd', '3': '3rd' };
  const genderMap: Record<string, string> = { m: 'masculine', f: 'feminine', c: 'common' };
  const numberMap: Record<string, string> = { s: 'singular', p: 'plural', d: 'dual' };
  const stateMap: Record<string, string> = { a: 'absolute', c: 'construct', d: 'determined' };

  function expandSegment(seg: string): string {
    const labels: string[] = [];
    const type = seg[0];

    if (type === 'V') {
      labels.push('verb');
      if (stemMap[seg[1]]) labels.push(stemMap[seg[1]]);
      if (aspectMap[seg[2]]) labels.push(aspectMap[seg[2]]);
      if (personMap[seg[3]]) labels.push(personMap[seg[3]]);
      if (genderMap[seg[4]]) labels.push(genderMap[seg[4]]);
      if (numberMap[seg[5]]) labels.push(numberMap[seg[5]]);
    } else if (type === 'N') {
      labels.push('noun');
      if (seg[1] === 'c') labels.push('common');
      else if (seg[1] === 'p') labels.push('proper');
      if (genderMap[seg[2]]) labels.push(genderMap[seg[2]]);
      if (numberMap[seg[3]]) labels.push(numberMap[seg[3]]);
      if (stateMap[seg[4]]) labels.push(stateMap[seg[4]]);
    } else if (type === 'T') {
      labels.push('particle');
      if (seg[1] === 'd') labels.push('definite article');
    } else if (type === 'R') {
      labels.push('preposition');
    } else if (type === 'C') {
      labels.push('conjunction');
    } else if (type === 'D') {
      labels.push('adverb');
    } else if (type === 'A') {
      labels.push('adjective');
    } else if (type === 'P') {
      labels.push('pronoun');
    } else {
      return seg;
    }

    return labels.join(' · ');
  }

  const clean = code.startsWith('H') ? code.slice(1) : code;
  const expanded = clean.split('/').map(expandSegment).filter(Boolean);
  return expanded.length ? expanded.join(' + ') : code;
}

function renderTokenLine(tokens: Array<{ w: string; morph?: string; gloss?: string }>, lang: 'gr' | 'he'): HTMLParagraphElement {
  const p = document.createElement('p');
  p.className = lang === 'gr' ? 'verse-gr' : 'verse-he';
  p.lang = lang === 'gr' ? 'grc' : 'he';
  if (lang === 'he') p.dir = 'rtl';

  tokens.forEach((token) => {
    const span = document.createElement('span');
    span.className = 'word-token';
    span.textContent = token.w;
    span.style.cursor = 'pointer';
    span.style.position = 'relative';
    span.style.padding = '0 0.12em';

    span.addEventListener('click', (event) => {
      event.stopPropagation();

      if (openWord === span) {
        closeMorphPopup();
        return;
      }

      closeMorphPopup();

      const popup = document.createElement('div');
      popup.className = 'morph-popup';
      popup.style.position = 'absolute';
      popup.style.left = '0';
      popup.style.top = '100%';
      popup.style.zIndex = '20';
      popup.style.minWidth = '14rem';
      popup.style.background = 'var(--surface)';
      popup.style.border = '1px solid #999';
      popup.style.padding = '0.35rem 0.5rem';
      popup.style.borderRadius = '6px';
      popup.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';

      const morphLabel = document.createElement('div');
      const expanded = token.morph
        ? lang === 'gr'
          ? expandGreekMorph(token.morph)
          : expandHebrewMorph(token.morph)
        : 'morph unavailable';
      morphLabel.textContent = expanded;
      popup.append(morphLabel);

      if (token.gloss) {
        const glossLabel = document.createElement('div');
        glossLabel.textContent = `gloss: ${token.gloss}`;
        glossLabel.style.marginTop = '0.25rem';
        popup.append(glossLabel);
      }

      span.append(popup);
      openPopup = popup;
      openWord = span;
    });

    p.append(span, document.createTextNode(' '));
  });

  return p;
}

export function renderVerseBlock(verse: VerseData): HTMLElement {
  bindOutsideClickListener();

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

  if (verse.he && verse.he.length > 0) {
    article.append(renderTokenLine(verse.he, 'he'));
  }

  if (verse.gr && verse.gr.length > 0) {
    article.append(renderTokenLine(verse.gr, 'gr'));
  }

  return article;
}
