import { useEffect, useState } from 'react';

/** Theo dõi một media query (kích thước màn hình, hướng thiết bị...). */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return false;
    return window.matchMedia(query).matches;
  });

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mql = window.matchMedia(query);
    const handler = (event: MediaQueryListEvent) => setMatches(event.matches);
    setMatches(mql.matches);
    mql.addEventListener('change', handler);
    return () => mql.removeEventListener('change', handler);
  }, [query]);

  return matches;
}

export function useIsPortrait(): boolean {
  return useMediaQuery('(orientation: portrait)');
}

export function useIsMobile(): boolean {
  return useMediaQuery('(max-width: 767px)');
}
