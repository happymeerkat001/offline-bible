export interface RouteRef {
  usfm: string;
  chapter: number;
}

export type RouteHandler = (route: RouteRef) => void;

const HASH_PATTERN = /^#\/(\w{3,4})\/(\d+)$/;

function parseHash(hash: string): RouteRef | null {
  const match = hash.match(HASH_PATTERN);
  if (!match) return null;
  return { usfm: match[1].toUpperCase(), chapter: Number(match[2]) };
}

export function startRouter(onRoute: RouteHandler, fallback: RouteRef): void {
  const emit = () => {
    const parsed = parseHash(window.location.hash);
    onRoute(parsed ?? fallback);
  };
  window.addEventListener('hashchange', emit);
  emit();
}

export function setRoute(usfm: string, chapter: number): void {
  window.location.hash = `/${usfm}/${chapter}`;
}
