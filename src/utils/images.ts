/**
 * Trình tạo ảnh minh hoạ cho trang web.
 * Dùng dịch vụ text-to-image của nền tảng, kết quả là URL có thể đặt trực tiếp vào <img>.
 * Luôn kèm nền gradient dự phòng trong CSS để giao diện vẫn đẹp khi ảnh chưa tải.
 */

export type ImageSize =
  | 'square_hd'
  | 'square'
  | 'portrait_4_3'
  | 'portrait_16_9'
  | 'landscape_4_3'
  | 'landscape_16_9';

const ENDPOINT = 'https://coresg-normal.trae.ai/api/ide/v1/tool_text_to_image';

export function buildImageUrl(prompt: string, size: ImageSize = 'landscape_4_3'): string {
  return `${ENDPOINT}?prompt=${encodeURIComponent(prompt)}&image_size=${size}`;
}
