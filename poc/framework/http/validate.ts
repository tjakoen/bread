// /framework/http/validate.ts — tiny input guard
export class HttpError extends Error {
  status: number;
  constructor(status: number, message: string) { super(message); this.status = status; }
}
export function requireString(v: unknown, field: string): string {
  if (typeof v !== "string" || v.trim() === "") throw new HttpError(400, `Missing field: ${field}`);
  return v;
}
