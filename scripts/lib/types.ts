export interface CanonicalVerse {
  bookId: number;
  chapter: number;
  verse: number;
  text: string;
}

export interface WordToken {
  w: string;
  morph?: string;
  gloss?: string;
}

export interface TokenizedVerse {
  bookId: number;
  chapter: number;
  verse: number;
  tokens: WordToken[];
}
