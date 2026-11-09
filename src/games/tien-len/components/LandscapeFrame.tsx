import type { ReactNode } from 'react';
import { useViewportSize } from '@/hooks/useViewport';

/**
 * Bọc bàn chơi để hiển thị ở chế độ ngang trên điện thoại đang cầm dọc.
 * Kỹ thuật: xoay 90° một khung có kích thước hoán đổi (rộng = chiều cao màn hình).
 * Sự kiện chạm/vuốt vẫn hoạt động đúng nhờ CSS transform.
 */
export function LandscapeFrame({ enabled, children }: { enabled: boolean; children: ReactNode }) {
  const { width, height } = useViewportSize();

  if (!enabled || width === 0 || height === 0) return <>{children}</>;

  return (
    <div className="fixed inset-0 z-40 overflow-hidden bg-base-950">
      <div
        style={{
          width: height,
          height: width,
          transform: `translateX(${width}px) rotate(90deg)`,
          transformOrigin: 'top left',
        }}
      >
        {children}
      </div>
    </div>
  );
}
