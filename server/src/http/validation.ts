import { z } from 'zod';
import { badRequest } from './errors';

/** Kiểm tra dữ liệu đầu vào theo schema zod; ném ApiError 400 với thông báo tiếng Việt. */
export function parseBody<T>(schema: z.ZodType<T>, data: unknown): T {
  const parsed = schema.safeParse(data);
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    throw badRequest(issue ? issue.message : 'Dữ liệu không hợp lệ.');
  }
  return parsed.data;
}
