/** Ghép class có điều kiện, không cần thư viện ngoài. */
export function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(' ');
}
