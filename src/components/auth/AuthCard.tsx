import type { HTMLAttributes, ReactNode } from 'react';
import { cn } from '@/utils/cn';

/**
 * Card trắng bo tròn 28px, viền xanh lá mảnh và bóng xanh nhẹ — khung chứa form
 * xác thực. Dùng chung cho trang Đăng nhập và Đăng ký.
 */
export function AuthCard({
  children,
  className,
  ...rest
}: HTMLAttributes<HTMLDivElement> & { children: ReactNode }) {
  return (
    <div
      className={cn(
        'relative w-full rounded-[28px] border border-cute-inputBorder bg-white p-6',
        'shadow-[0_28px_60px_-30px_rgba(33,140,43,0.45),0_10px_24px_-18px_rgba(33,140,43,0.3)]',
        'sm:p-8',
        className,
      )}
      {...rest}
    >
      {children}
    </div>
  );
}
