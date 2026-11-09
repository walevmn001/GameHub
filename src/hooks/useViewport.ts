import { useEffect, useState } from 'react';

export interface ViewportSize {
  width: number;
  height: number;
}

/** Kích thước khung nhìn hiện tại, cập nhật khi xoay thiết bị hoặc đổi kích thước. */
export function useViewportSize(): ViewportSize {
  const [size, setSize] = useState<ViewportSize>(() => ({
    width: typeof window === 'undefined' ? 0 : window.innerWidth,
    height: typeof window === 'undefined' ? 0 : window.innerHeight,
  }));

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const handler = () => setSize({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener('resize', handler);
    window.addEventListener('orientationchange', handler);
    handler();
    return () => {
      window.removeEventListener('resize', handler);
      window.removeEventListener('orientationchange', handler);
    };
  }, []);

  return size;
}
